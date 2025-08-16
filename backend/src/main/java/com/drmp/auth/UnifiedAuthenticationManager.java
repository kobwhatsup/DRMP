package com.drmp.auth;

import com.drmp.entity.User;
import com.drmp.repository.UserRepository;
import com.drmp.security.JwtTokenProvider;
import com.drmp.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * 统一认证管理器
 * 提供多种认证方式的统一管理，包括JWT、会话、API Key等
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UnifiedAuthenticationManager {

    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Value("${auth.session.timeout:1800}") // 30分钟
    private long sessionTimeout;

    @Value("${auth.max-concurrent-sessions:3}")
    private int maxConcurrentSessions;

    @Value("${auth.enable-refresh-token:true}")
    private boolean enableRefreshToken;

    // 活跃会话管理
    private final Map<String, UserSession> activeSessions = new ConcurrentHashMap<>();
    
    // Token黑名单
    private final Set<String> tokenBlacklist = ConcurrentHashMap.newKeySet();

    /**
     * 用户名密码认证
     */
    public AuthenticationResult authenticate(String username, String password, String clientIp, String userAgent) {
        log.info("Attempting authentication for user: {} from IP: {}", username, clientIp);
        
        try {
            // 1. 查找用户
            User user = userRepository.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new BadCredentialsException("用户名或密码错误"));

            // 2. 验证密码
            if (!passwordEncoder.matches(password, user.getPassword())) {
                log.warn("Failed login attempt for user: {} from IP: {}", username, clientIp);
                recordFailedLogin(user.getId(), clientIp, "密码错误");
                throw new BadCredentialsException("用户名或密码错误");
            }

            // 3. 检查用户状态
            validateUserStatus(user);

            // 4. 检查并发会话限制
            enforceSessionLimit(user.getId());

            // 5. 生成认证令牌
            String accessToken = tokenProvider.generateToken(user.getId(), user.getUsername(), false);
            String refreshToken = enableRefreshToken ? tokenProvider.generateRefreshToken(user.getId(), user.getUsername()) : null;

            // 6. 创建用户会话
            UserSession session = createUserSession(user, accessToken, refreshToken, clientIp, userAgent);
            activeSessions.put(session.getSessionId(), session);

            // 7. 更新用户最后登录信息
            updateLastLogin(user, clientIp);

            log.info("User {} authenticated successfully from IP: {}", username, clientIp);
            
            return AuthenticationResult.success(accessToken, refreshToken, session.getSessionId(), user);

        } catch (Exception e) {
            log.error("Authentication failed for user: {} from IP: {}", username, clientIp, e);
            return AuthenticationResult.failure(e.getMessage());
        }
    }

    /**
     * Token认证
     */
    public AuthenticationResult authenticateByToken(String token) {
        if (!StringUtils.hasText(token)) {
            return AuthenticationResult.failure("Token不能为空");
        }

        try {
            // 1. 检查Token黑名单
            if (tokenBlacklist.contains(token)) {
                return AuthenticationResult.failure("Token已失效");
            }

            // 2. 验证Token
            if (!tokenProvider.validateToken(token)) {
                return AuthenticationResult.failure("Token无效或已过期");
            }

            // 3. 获取用户信息
            Long userId = tokenProvider.getUserIdFromToken(token);
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("用户不存在"));

            // 4. 检查用户状态
            validateUserStatus(user);

            // 5. 查找对应的会话
            UserSession session = findSessionByToken(token);
            if (session != null) {
                session.updateLastActivity();
            }

            return AuthenticationResult.success(token, null, session != null ? session.getSessionId() : null, user);

        } catch (Exception e) {
            log.debug("Token authentication failed: {}", e.getMessage());
            return AuthenticationResult.failure(e.getMessage());
        }
    }

    /**
     * 刷新Token
     */
    public AuthenticationResult refreshToken(String refreshToken) {
        if (!enableRefreshToken || !StringUtils.hasText(refreshToken)) {
            return AuthenticationResult.failure("刷新Token功能未启用或Token为空");
        }

        try {
            // 1. 验证刷新Token
            if (!tokenProvider.validateRefreshToken(refreshToken)) {
                return AuthenticationResult.failure("刷新Token无效或已过期");
            }

            // 2. 获取用户信息
            Long userId = tokenProvider.getUserIdFromRefreshToken(refreshToken);
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("用户不存在"));

            // 3. 检查用户状态
            validateUserStatus(user);

            // 4. 生成新的访问令牌
            String newAccessToken = tokenProvider.generateToken(userId, user.getUsername(), false);
            String newRefreshToken = tokenProvider.generateRefreshToken(userId, user.getUsername());

            // 5. 更新会话信息
            UserSession session = findSessionByRefreshToken(refreshToken);
            if (session != null) {
                session.setAccessToken(newAccessToken);
                session.setRefreshToken(newRefreshToken);
                session.updateLastActivity();
            }

            return AuthenticationResult.success(newAccessToken, newRefreshToken, 
                session != null ? session.getSessionId() : null, user);

        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            return AuthenticationResult.failure(e.getMessage());
        }
    }

    /**
     * 登出
     */
    public void logout(String token, String sessionId) {
        try {
            // 1. 将Token加入黑名单
            if (StringUtils.hasText(token)) {
                tokenBlacklist.add(token);
            }

            // 2. 移除会话
            if (StringUtils.hasText(sessionId)) {
                UserSession session = activeSessions.remove(sessionId);
                if (session != null) {
                    log.info("User {} logged out, session terminated", session.getUserId());
                }
            }

        } catch (Exception e) {
            log.error("Logout failed: {}", e.getMessage());
        }
    }

    /**
     * 登出所有会话
     */
    public void logoutAllSessions(Long userId) {
        try {
            // 1. 找到用户的所有会话
            List<UserSession> userSessions = activeSessions.values().stream()
                .filter(session -> userId.equals(session.getUserId()))
                .toList();

            // 2. 将所有Token加入黑名单
            for (UserSession session : userSessions) {
                tokenBlacklist.add(session.getAccessToken());
                if (session.getRefreshToken() != null) {
                    tokenBlacklist.add(session.getRefreshToken());
                }
                activeSessions.remove(session.getSessionId());
            }

            log.info("All sessions terminated for user: {}, count: {}", userId, userSessions.size());

        } catch (Exception e) {
            log.error("Logout all sessions failed for user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * 获取当前认证用户
     */
    public UserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            return (UserPrincipal) authentication.getPrincipal();
        }
        return null;
    }

    /**
     * 获取活跃会话列表
     */
    public List<UserSession> getActiveSessions(Long userId) {
        return activeSessions.values().stream()
            .filter(session -> userId.equals(session.getUserId()))
            .sorted((s1, s2) -> s2.getLastActivity().compareTo(s1.getLastActivity()))
            .toList();
    }

    /**
     * 获取认证统计信息
     */
    public AuthenticationStats getStats() {
        long activeSessionCount = activeSessions.size();
        long blacklistedTokenCount = tokenBlacklist.size();
        
        Map<String, Long> sessionsByUserAgent = activeSessions.values().stream()
            .collect(Collectors.groupingBy(
                session -> extractBrowser(session.getUserAgent()),
                Collectors.counting()
            ));

        return new AuthenticationStats(
            activeSessionCount,
            blacklistedTokenCount,
            sessionsByUserAgent
        );
    }

    /**
     * 清理过期会话和Token
     */
    public void cleanupExpiredSessions() {
        LocalDateTime cutoff = LocalDateTime.now().minusSeconds(sessionTimeout);
        
        boolean hasExpiredSessions = activeSessions.entrySet().removeIf(entry -> 
            entry.getValue().getLastActivity().isBefore(cutoff)
        );

        // 限制黑名单大小，移除过期的Token
        if (tokenBlacklist.size() > 10000) {
            tokenBlacklist.clear(); // 简单的清理策略，实际应用中可以更精细
        }

        if (hasExpiredSessions) {
            log.info("Cleaned up expired sessions");
        }
    }

    private void validateUserStatus(User user) {
        if (user.getStatus() == null || !user.getStatus().isActive()) {
            throw new BadCredentialsException("账户已被禁用");
        }
    }

    private void enforceSessionLimit(Long userId) {
        long currentSessions = activeSessions.values().stream()
            .filter(session -> userId.equals(session.getUserId()))
            .count();

        if (currentSessions >= maxConcurrentSessions) {
            // 移除最老的会话
            Optional<UserSession> oldestSession = activeSessions.values().stream()
                .filter(session -> userId.equals(session.getUserId()))
                .min(Comparator.comparing(UserSession::getLastActivity));
            
            if (oldestSession.isPresent()) {
                activeSessions.remove(oldestSession.get().getSessionId());
                tokenBlacklist.add(oldestSession.get().getAccessToken());
                log.info("Removed oldest session for user {} due to session limit", userId);
            }
        }
    }

    private UserSession createUserSession(User user, String accessToken, String refreshToken, 
                                        String clientIp, String userAgent) {
        return UserSession.builder()
            .sessionId(UUID.randomUUID().toString())
            .userId(user.getId())
            .username(user.getUsername())
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .clientIp(clientIp)
            .userAgent(userAgent)
            .createdAt(LocalDateTime.now())
            .lastActivity(LocalDateTime.now())
            .build();
    }

    private void updateLastLogin(User user, String clientIp) {
        try {
            user.setLastLoginAt(LocalDateTime.now());
            user.setLastLoginIp(clientIp);
            userRepository.save(user);
        } catch (Exception e) {
            log.warn("Failed to update last login info for user {}: {}", user.getId(), e.getMessage());
        }
    }

    private void recordFailedLogin(Long userId, String clientIp, String reason) {
        log.warn("Failed login - User: {}, IP: {}, Reason: {}", userId, clientIp, reason);
        // TODO: 实现失败登录记录存储和分析
    }

    private UserSession findSessionByToken(String token) {
        return activeSessions.values().stream()
            .filter(session -> token.equals(session.getAccessToken()))
            .findFirst()
            .orElse(null);
    }

    private UserSession findSessionByRefreshToken(String refreshToken) {
        return activeSessions.values().stream()
            .filter(session -> refreshToken.equals(session.getRefreshToken()))
            .findFirst()
            .orElse(null);
    }

    private String extractBrowser(String userAgent) {
        if (userAgent == null) return "Unknown";
        
        if (userAgent.contains("Chrome")) return "Chrome";
        if (userAgent.contains("Firefox")) return "Firefox";
        if (userAgent.contains("Safari")) return "Safari";
        if (userAgent.contains("Edge")) return "Edge";
        if (userAgent.contains("Opera")) return "Opera";
        
        return "Other";
    }

    /**
     * 认证结果
     */
    public static class AuthenticationResult {
        private final boolean success;
        private final String accessToken;
        private final String refreshToken;
        private final String sessionId;
        private final User user;
        private final String errorMessage;

        private AuthenticationResult(boolean success, String accessToken, String refreshToken, 
                                   String sessionId, User user, String errorMessage) {
            this.success = success;
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.sessionId = sessionId;
            this.user = user;
            this.errorMessage = errorMessage;
        }

        public static AuthenticationResult success(String accessToken, String refreshToken, 
                                                 String sessionId, User user) {
            return new AuthenticationResult(true, accessToken, refreshToken, sessionId, user, null);
        }

        public static AuthenticationResult failure(String errorMessage) {
            return new AuthenticationResult(false, null, null, null, null, errorMessage);
        }

        // Getters
        public boolean isSuccess() { return success; }
        public String getAccessToken() { return accessToken; }
        public String getRefreshToken() { return refreshToken; }
        public String getSessionId() { return sessionId; }
        public User getUser() { return user; }
        public String getErrorMessage() { return errorMessage; }
    }

    /**
     * 认证统计信息
     */
    public static class AuthenticationStats {
        public final long activeSessionCount;
        public final long blacklistedTokenCount;
        public final Map<String, Long> sessionsByUserAgent;

        public AuthenticationStats(long activeSessionCount, long blacklistedTokenCount, 
                                 Map<String, Long> sessionsByUserAgent) {
            this.activeSessionCount = activeSessionCount;
            this.blacklistedTokenCount = blacklistedTokenCount;
            this.sessionsByUserAgent = sessionsByUserAgent;
        }
    }
}