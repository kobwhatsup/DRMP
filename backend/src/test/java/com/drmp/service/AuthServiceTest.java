package com.drmp.service;

import com.drmp.config.BaseServiceTest;
import com.drmp.dto.LoginRequest;
import com.drmp.dto.LoginResponse;
import com.drmp.entity.Organization;
import com.drmp.entity.Role;
import com.drmp.entity.User;
import com.drmp.entity.enums.OrganizationType;
import com.drmp.entity.enums.UserStatus;
import com.drmp.exception.BusinessException;
import com.drmp.factory.TestDataFactory;
import com.drmp.repository.UserRepository;
import com.drmp.security.JwtTokenProvider;
import com.drmp.security.UserPrincipal;
import com.drmp.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * AuthService Unit Tests
 * 认证服务单元测试
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@DisplayName("AuthService 单元测试")
class AuthServiceTest extends BaseServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private AuthServiceImpl authService;

    private User testUser;
    private Organization testOrganization;
    private LoginRequest loginRequest;
    private UserPrincipal userPrincipal;

    @BeforeEach
    void setUp() {
        // 设置配置值
        ReflectionTestUtils.setField(authService, "maxLoginAttempts", 5);
        ReflectionTestUtils.setField(authService, "lockTimeMinutes", 30);
        ReflectionTestUtils.setField(authService, "jwtExpiration", 7200000L); // 2 hours

        // 创建测试数据
        testOrganization = TestDataFactory.createSourceOrganization();
        testOrganization.setId(1L);

        testUser = TestDataFactory.createUser(testOrganization);
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setPassword("$2a$10$encodedPassword");
        testUser.setEmail("test@example.com");
        testUser.setRealName("测试用户");
        testUser.setPhone("13800138000");
        testUser.setStatus(UserStatus.ACTIVE);
        testUser.setLoginAttempts(0);

        // 添加角色和权限
        Role role = new Role();
        role.setCode("CASE_MANAGER");
        role.setName("案件管理员");
        role.setPermissions(new HashSet<>()); // 空权限集合
        Set<Role> roles = new HashSet<>();
        roles.add(role);
        testUser.setRoles(roles);

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password123");

        // 使用UserPrincipal的静态工厂方法创建
        userPrincipal = UserPrincipal.create(testUser);

        // Mock Redis operations (lenient 避免不必要的stubbing警告)
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    @DisplayName("登录成功 - 正确的用户名和密码")
    void login_ShouldReturnLoginResponse_WhenCredentialsAreValid() {
        // Arrange
        String clientIp = "192.168.1.1";
        String accessToken = "access_token_xxx";
        String refreshToken = "refresh_token_xxx";

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userPrincipal, null, userPrincipal.getAuthorities());

        when(userRepository.findByUsernameWithRolesAndPermissions("testuser"))
                .thenReturn(Optional.of(testUser));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(tokenProvider.generateToken(any(Authentication.class)))
                .thenReturn(accessToken);
        when(tokenProvider.generateRefreshToken(anyLong(), anyString()))
                .thenReturn(refreshToken);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        LoginResponse response = authService.login(loginRequest, clientIp);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo(accessToken);
        assertThat(response.getRefreshToken()).isEqualTo(refreshToken);
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getExpiresIn()).isEqualTo(7200L); // 2 hours in seconds

        assertThat(response.getUserInfo()).isNotNull();
        assertThat(response.getUserInfo().getId()).isEqualTo(1L);
        assertThat(response.getUserInfo().getUsername()).isEqualTo("testuser");
        assertThat(response.getUserInfo().getEmail()).isEqualTo("test@example.com");
        assertThat(response.getUserInfo().getRealName()).isEqualTo("测试用户");
        assertThat(response.getUserInfo().getRoles()).contains("CASE_MANAGER");

        // Verify
        verify(userRepository).findByUsernameWithRolesAndPermissions("testuser");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).save(argThat(user ->
            user.getLoginAttempts() == 0 &&
            user.getLastLoginIp().equals(clientIp) &&
            user.getLastLoginAt() != null
        ));
        verify(valueOperations).set(eq("refresh_token:1"), eq(refreshToken), eq(7L), eq(TimeUnit.DAYS));
    }

    @Test
    @DisplayName("登录失败 - 用户不存在")
    void login_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        when(userRepository.findByUsernameWithRolesAndPermissions("nonexistent"))
                .thenReturn(Optional.empty());
        loginRequest.setUsername("nonexistent");

        // Act & Assert
        assertThatThrownBy(() -> authService.login(loginRequest, "192.168.1.1"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("用户名或密码错误");

        verify(userRepository).findByUsernameWithRolesAndPermissions("nonexistent");
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    @DisplayName("登录失败 - 账户已锁定")
    void login_ShouldThrowException_WhenAccountIsLocked() {
        // Arrange
        testUser.setLockedUntil(LocalDateTime.now().plusMinutes(30));
        when(userRepository.findByUsernameWithRolesAndPermissions("testuser"))
                .thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThatThrownBy(() -> authService.login(loginRequest, "192.168.1.1"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("账户已被锁定");

        verify(userRepository).findByUsernameWithRolesAndPermissions("testuser");
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    @DisplayName("登录失败 - 密码错误，增加登录尝试次数")
    void login_ShouldIncrementLoginAttempts_WhenPasswordIsWrong() {
        // Arrange
        when(userRepository.findByUsernameWithRolesAndPermissions("testuser"))
                .thenReturn(Optional.of(testUser));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act & Assert
        assertThatThrownBy(() -> authService.login(loginRequest, "192.168.1.1"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("用户名或密码错误");

        // Verify login attempts incremented
        verify(userRepository).save(argThat(user -> user.getLoginAttempts() == 1));
    }

    @Test
    @DisplayName("登录失败 - 多次密码错误后锁定账户")
    void login_ShouldLockAccount_WhenMaxLoginAttemptsExceeded() {
        // Arrange
        testUser.setLoginAttempts(4); // 已经尝试4次，这次是第5次
        when(userRepository.findByUsernameWithRolesAndPermissions("testuser"))
                .thenReturn(Optional.of(testUser));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act & Assert
        assertThatThrownBy(() -> authService.login(loginRequest, "192.168.1.1"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("用户名或密码错误");

        // Verify account locked
        verify(userRepository).save(argThat(user ->
            user.getLoginAttempts() == 5 &&
            user.getLockedUntil() != null
        ));
    }

    @Test
    @DisplayName("刷新令牌成功 - 有效的刷新令牌")
    void refreshToken_ShouldReturnNewTokens_WhenRefreshTokenIsValid() {
        // Arrange
        String oldRefreshToken = "old_refresh_token";
        String newAccessToken = "new_access_token";
        String newRefreshToken = "new_refresh_token";

        when(tokenProvider.validateToken(oldRefreshToken)).thenReturn(true);
        when(tokenProvider.getTokenType(oldRefreshToken)).thenReturn("refresh");
        when(tokenProvider.getUserIdFromToken(oldRefreshToken)).thenReturn(1L);
        when(tokenProvider.getUsernameFromToken(oldRefreshToken)).thenReturn("testuser");
        when(valueOperations.get("refresh_token:1")).thenReturn(oldRefreshToken);
        when(tokenProvider.generateToken(eq(1L), eq("testuser"), eq(false)))
                .thenReturn(newAccessToken);
        when(tokenProvider.generateRefreshToken(eq(1L), eq("testuser")))
                .thenReturn(newRefreshToken);

        // Act
        LoginResponse response = authService.refreshToken(oldRefreshToken);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo(newAccessToken);
        assertThat(response.getRefreshToken()).isEqualTo(newRefreshToken);
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getExpiresIn()).isEqualTo(7200L);

        // Verify new refresh token stored in Redis
        verify(valueOperations).set(eq("refresh_token:1"), eq(newRefreshToken), eq(7L), eq(TimeUnit.DAYS));
    }

    @Test
    @DisplayName("刷新令牌失败 - 令牌无效")
    void refreshToken_ShouldThrowException_WhenTokenIsInvalid() {
        // Arrange
        String invalidToken = "invalid_token";
        when(tokenProvider.validateToken(invalidToken)).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> authService.refreshToken(invalidToken))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("刷新令牌无效");

        verify(tokenProvider).validateToken(invalidToken);
        verify(tokenProvider, never()).getTokenType(anyString());
    }

    @Test
    @DisplayName("刷新令牌失败 - 令牌类型错误")
    void refreshToken_ShouldThrowException_WhenTokenTypeIsWrong() {
        // Arrange
        String accessToken = "access_token_used_as_refresh";
        when(tokenProvider.validateToken(accessToken)).thenReturn(true);
        when(tokenProvider.getTokenType(accessToken)).thenReturn("access");

        // Act & Assert
        assertThatThrownBy(() -> authService.refreshToken(accessToken))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("令牌类型错误");

        verify(tokenProvider).validateToken(accessToken);
        verify(tokenProvider).getTokenType(accessToken);
    }

    @Test
    @DisplayName("刷新令牌失败 - Redis中令牌不匹配")
    void refreshToken_ShouldThrowException_WhenTokenNotInRedis() {
        // Arrange
        String refreshToken = "refresh_token";
        String storedToken = "different_token";

        when(tokenProvider.validateToken(refreshToken)).thenReturn(true);
        when(tokenProvider.getTokenType(refreshToken)).thenReturn("refresh");
        when(tokenProvider.getUserIdFromToken(refreshToken)).thenReturn(1L);
        when(tokenProvider.getUsernameFromToken(refreshToken)).thenReturn("testuser");
        when(valueOperations.get("refresh_token:1")).thenReturn(storedToken);

        // Act & Assert
        assertThatThrownBy(() -> authService.refreshToken(refreshToken))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("刷新令牌已失效");

        verify(valueOperations).get("refresh_token:1");
    }

    @Test
    @DisplayName("登出成功 - 删除刷新令牌并加入黑名单")
    void logout_ShouldRemoveRefreshTokenAndBlacklistAccessToken() {
        // Arrange
        String accessToken = "access_token";
        when(tokenProvider.validateToken(accessToken)).thenReturn(true);
        when(tokenProvider.getUserIdFromToken(accessToken)).thenReturn(1L);

        // Act
        authService.logout(accessToken);

        // Assert
        verify(tokenProvider).validateToken(accessToken);
        verify(tokenProvider).getUserIdFromToken(accessToken);
        verify(redisTemplate).delete("refresh_token:1");
        verify(valueOperations).set(eq("blacklist_token:" + accessToken), eq("1"), eq(7200L), eq(TimeUnit.SECONDS));
    }

    @Test
    @DisplayName("登出 - 令牌无效时不执行任何操作")
    void logout_ShouldDoNothing_WhenTokenIsInvalid() {
        // Arrange
        String invalidToken = "invalid_token";
        when(tokenProvider.validateToken(invalidToken)).thenReturn(false);

        // Act
        authService.logout(invalidToken);

        // Assert
        verify(tokenProvider).validateToken(invalidToken);
        verify(tokenProvider, never()).getUserIdFromToken(anyString());
        verify(redisTemplate, never()).delete(anyString());
    }

    @Test
    @DisplayName("登录成功后重置登录尝试次数")
    void login_ShouldResetLoginAttempts_OnSuccessfulLogin() {
        // Arrange
        String clientIp = "192.168.1.1";
        testUser.setLoginAttempts(3); // 之前有失败的登录尝试

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userPrincipal, null, userPrincipal.getAuthorities());

        when(userRepository.findByUsernameWithRolesAndPermissions("testuser"))
                .thenReturn(Optional.of(testUser));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(tokenProvider.generateToken(any(Authentication.class)))
                .thenReturn("access_token");
        when(tokenProvider.generateRefreshToken(anyLong(), anyString()))
                .thenReturn("refresh_token");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        authService.login(loginRequest, clientIp);

        // Assert
        verify(userRepository).save(argThat(user -> user.getLoginAttempts() == 0));
    }

    @Test
    @DisplayName("登录成功后更新最后登录时间和IP")
    void login_ShouldUpdateLastLoginInfo_OnSuccessfulLogin() {
        // Arrange
        String clientIp = "192.168.1.100";
        LocalDateTime beforeLogin = LocalDateTime.now();

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userPrincipal, null, userPrincipal.getAuthorities());

        when(userRepository.findByUsernameWithRolesAndPermissions("testuser"))
                .thenReturn(Optional.of(testUser));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(tokenProvider.generateToken(any(Authentication.class)))
                .thenReturn("access_token");
        when(tokenProvider.generateRefreshToken(anyLong(), anyString()))
                .thenReturn("refresh_token");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        authService.login(loginRequest, clientIp);

        // Assert
        verify(userRepository).save(argThat(user ->
            user.getLastLoginIp().equals(clientIp) &&
            user.getLastLoginAt() != null &&
            !user.getLastLoginAt().isBefore(beforeLogin)
        ));
    }
}
