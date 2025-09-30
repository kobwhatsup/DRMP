package com.drmp.service.impl;

import com.drmp.dto.LoginRequest;
import com.drmp.dto.LoginResponse;
import com.drmp.entity.User;
import com.drmp.exception.BusinessException;
import com.drmp.repository.UserRepository;
import com.drmp.security.JwtTokenProvider;
import com.drmp.security.UserPrincipal;
import com.drmp.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Authentication Service Implementation
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${app.security.max-login-attempts}")
    private int maxLoginAttempts;

    @Value("${app.security.lock-time-minutes}")
    private int lockTimeMinutes;

    @Value("${jwt.expiration}")
    private Long jwtExpiration;

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request, String clientIp) {
        User user = userRepository.findByUsernameWithRolesAndPermissions(request.getUsername())
                .orElseThrow(() -> new BusinessException("用户名或密码错误"));

        // Check if account is locked
        if (user.isAccountLocked()) {
            throw new BusinessException("账户已被锁定，请稍后再试");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            // Reset login attempts on successful login
            user.resetLoginAttempts();
            user.setLastLoginAt(LocalDateTime.now());
            user.setLastLoginIp(clientIp);
            userRepository.save(user);

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            // Generate tokens
            String accessToken = tokenProvider.generateToken(authentication);
            String refreshToken = tokenProvider.generateRefreshToken(userPrincipal.getId(), userPrincipal.getUsername());

            // Store refresh token in Redis
            String refreshKey = "refresh_token:" + userPrincipal.getId();
            redisTemplate.opsForValue().set(refreshKey, refreshToken, 7, TimeUnit.DAYS);

            // Build user info
            LoginResponse.UserInfo userInfo = LoginResponse.UserInfo.builder()
                    .id(userPrincipal.getId())
                    .username(userPrincipal.getUsername())
                    .email(userPrincipal.getEmail())
                    .realName(user.getRealName())
                    .phone(user.getPhone())
                    .avatar(user.getAvatar())
                    .organizationId(userPrincipal.getOrganizationId())
                    .organizationName(user.getOrganization() != null ? user.getOrganization().getName() : null)
                    .organizationType(userPrincipal.getOrganizationType())
                    .roles(user.getRoles().stream().map(role -> role.getCode()).collect(Collectors.toSet()))
                    .permissions(userPrincipal.getAuthorities().stream()
                            .map(authority -> authority.getAuthority())
                            .filter(auth -> !auth.startsWith("ROLE_"))
                            .collect(Collectors.toSet()))
                    .build();

            return LoginResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(jwtExpiration / 1000)
                    .userInfo(userInfo)
                    .build();

        } catch (AuthenticationException e) {
            // Increment login attempts
            user.incrementLoginAttempts();
            
            if (user.getLoginAttempts() >= maxLoginAttempts) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(lockTimeMinutes));
                log.warn("Account locked due to too many login attempts: {}", user.getUsername());
            }
            
            userRepository.save(user);
            throw new BusinessException("用户名或密码错误");
        }
    }

    @Override
    public LoginResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new BusinessException("刷新令牌无效");
        }

        if (!"refresh".equals(tokenProvider.getTokenType(refreshToken))) {
            throw new BusinessException("令牌类型错误");
        }

        Long userId = tokenProvider.getUserIdFromToken(refreshToken);
        String username = tokenProvider.getUsernameFromToken(refreshToken);

        // Check if refresh token exists in Redis
        String refreshKey = "refresh_token:" + userId;
        String storedToken = (String) redisTemplate.opsForValue().get(refreshKey);
        if (!refreshToken.equals(storedToken)) {
            throw new BusinessException("刷新令牌已失效");
        }

        // Generate new tokens
        String newAccessToken = tokenProvider.generateToken(userId, username, false);
        String newRefreshToken = tokenProvider.generateRefreshToken(userId, username);

        // Update refresh token in Redis
        redisTemplate.opsForValue().set(refreshKey, newRefreshToken, 7, TimeUnit.DAYS);

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtExpiration / 1000)
                .build();
    }

    @Override
    public void logout(String accessToken) {
        if (tokenProvider.validateToken(accessToken)) {
            Long userId = tokenProvider.getUserIdFromToken(accessToken);
            
            // Remove refresh token from Redis
            String refreshKey = "refresh_token:" + userId;
            redisTemplate.delete(refreshKey);

            // Add access token to blacklist (optional, for additional security)
            String blacklistKey = "blacklist_token:" + accessToken;
            long expireTime = jwtExpiration / 1000;
            redisTemplate.opsForValue().set(blacklistKey, "1", expireTime, TimeUnit.SECONDS);
        }
    }
}