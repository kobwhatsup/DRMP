package com.drmp.service.system.impl;

import com.drmp.dto.request.system.UserCreateRequest;
import com.drmp.dto.request.system.UserQueryRequest;
import com.drmp.dto.request.system.UserUpdateRequest;
import com.drmp.dto.response.system.UserResponse;
import com.drmp.entity.system.SysRole;
import com.drmp.entity.system.SysUser;
import com.drmp.repository.system.SysRoleRepository;
import com.drmp.repository.system.SysUserRepository;
import com.drmp.service.system.SysUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * SysUserServiceImpl 测试
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("SysUserServiceImpl 测试")
class SysUserServiceImplTest {

    @Mock
    private SysUserRepository userRepository;

    @Mock
    private SysRoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EntityManager entityManager;

    @Mock
    private Query query;

    @InjectMocks
    private SysUserServiceImpl userService;

    private SysUser testUser;
    private SysRole testRole;
    private UserCreateRequest createRequest;
    private UserUpdateRequest updateRequest;
    private UserQueryRequest queryRequest;

    @BeforeEach
    void setUp() {
        // 初始化测试用户
        testUser = new SysUser();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setPassword("encoded_password");
        testUser.setEmail("test@example.com");
        testUser.setPhone("13800138000");
        testUser.setRealName("测试用户");
        testUser.setOrganizationId(100L);
        testUser.setUserType(SysUser.UserType.ADMIN);
        testUser.setStatus(SysUser.Status.ACTIVE);
        testUser.setLoginFailureCount(0);
        testUser.setEmailVerified(true);
        testUser.setPhoneVerified(false);
        testUser.setTwoFactorEnabled(false);
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setUpdatedAt(LocalDateTime.now());

        // 初始化测试角色
        testRole = new SysRole();
        testRole.setId(1L);
        testRole.setRoleCode("ADMIN");
        testRole.setRoleName("管理员");
        testRole.setRoleType(SysRole.RoleType.SYSTEM);
        testRole.setStatus(SysRole.Status.ACTIVE);

        // 初始化创建请求
        createRequest = new UserCreateRequest();
        createRequest.setUsername("newuser");
        createRequest.setPassword("Password123!");
        createRequest.setEmail("new@example.com");
        createRequest.setPhone("13900139000");
        createRequest.setRealName("新用户");
        createRequest.setOrganizationId(100L);
        createRequest.setUserType("ADMIN");
        createRequest.setRoleIds(new Long[]{1L});

        // 初始化更新请求
        updateRequest = new UserUpdateRequest();
        updateRequest.setEmail("updated@example.com");
        updateRequest.setPhone("13900139001");
        updateRequest.setRealName("更新用户");

        // 初始化查询请求
        queryRequest = new UserQueryRequest();
        queryRequest.setPage(1);
        queryRequest.setSize(10);
    }

    @Test
    @DisplayName("getUsers - 应返回用户分页列表")
    void getUsers_ShouldReturnPagedUsers() {
        // Arrange
        Page<SysUser> userPage = new PageImpl<>(Arrays.asList(testUser));
        when(userRepository.findAll(any(Specification.class), any(Pageable.class)))
            .thenReturn(userPage);
        when(roleRepository.findRolesByUserId(testUser.getId()))
            .thenReturn(Collections.emptyList());

        // Act
        Page<UserResponse> result = userService.getUsers(queryRequest);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getUsername()).isEqualTo("testuser");
        verify(userRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    @DisplayName("getUserById - 应返回用户详情")
    void getUserById_ShouldReturnUserDetails() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(roleRepository.findRolesByUserId(1L)).thenReturn(Arrays.asList(testRole));

        // Act
        UserResponse result = userService.getUserById(1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getUsername()).isEqualTo("testuser");
        assertThat(result.getEmail()).isEqualTo("test@example.com");
        assertThat(result.getRoles()).hasSize(1);
        assertThat(result.getRoles().get(0).getRoleCode()).isEqualTo("ADMIN");
    }

    @Test
    @DisplayName("getUserById - 用户不存在应抛出异常")
    void getUserById_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> userService.getUserById(999L))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("用户不存在");
    }

    @Test
    @DisplayName("createUser - 应成功创建用户")
    void createUser_ShouldCreateUserSuccessfully() {
        // Arrange
        when(userRepository.findByUsername(createRequest.getUsername())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(createRequest.getEmail())).thenReturn(Optional.empty());
        when(userRepository.findByPhone(createRequest.getPhone())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(createRequest.getPassword())).thenReturn("encoded_password");
        when(userRepository.save(any(SysUser.class))).thenReturn(testUser);
        when(roleRepository.existsById(1L)).thenReturn(true);
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(roleRepository.findRolesByUserId(anyLong())).thenReturn(Arrays.asList(testRole));

        // Act
        UserResponse result = userService.createUser(createRequest, 1L);

        // Assert
        assertThat(result).isNotNull();
        verify(userRepository).save(any(SysUser.class));
        verify(passwordEncoder).encode(createRequest.getPassword());
        verify(entityManager).createNativeQuery(anyString());
    }

    @Test
    @DisplayName("createUser - 用户名已存在应抛出异常")
    void createUser_ShouldThrowException_WhenUsernameExists() {
        // Arrange
        when(userRepository.findByUsername(createRequest.getUsername()))
            .thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThatThrownBy(() -> userService.createUser(createRequest, 1L))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("用户名已存在");

        verify(userRepository, never()).save(any(SysUser.class));
    }

    @Test
    @DisplayName("createUser - 邮箱已存在应抛出异常")
    void createUser_ShouldThrowException_WhenEmailExists() {
        // Arrange
        when(userRepository.findByUsername(createRequest.getUsername())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(createRequest.getEmail())).thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThatThrownBy(() -> userService.createUser(createRequest, 1L))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("邮箱已存在");
    }

    @Test
    @DisplayName("createUser - 手机号已存在应抛出异常")
    void createUser_ShouldThrowException_WhenPhoneExists() {
        // Arrange
        when(userRepository.findByUsername(createRequest.getUsername())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(createRequest.getEmail())).thenReturn(Optional.empty());
        when(userRepository.findByPhone(createRequest.getPhone())).thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThatThrownBy(() -> userService.createUser(createRequest, 1L))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("手机号已存在");
    }

    @Test
    @DisplayName("updateUser - 应成功更新用户")
    void updateUser_ShouldUpdateUserSuccessfully() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.existsByEmailAndIdNot(updateRequest.getEmail(), 1L)).thenReturn(false);
        when(userRepository.existsByPhoneAndIdNot(updateRequest.getPhone(), 1L)).thenReturn(false);
        when(userRepository.save(any(SysUser.class))).thenReturn(testUser);
        when(roleRepository.findRolesByUserId(anyLong())).thenReturn(Collections.emptyList());

        // Act
        UserResponse result = userService.updateUser(1L, updateRequest, 1L);

        // Assert
        assertThat(result).isNotNull();
        verify(userRepository).save(any(SysUser.class));
    }

    @Test
    @DisplayName("updateUser - 用户不存在应抛出异常")
    void updateUser_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> userService.updateUser(999L, updateRequest, 1L))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("用户不存在");
    }

    @Test
    @DisplayName("deleteUser - 应成功删除用户")
    void deleteUser_ShouldDeleteUserSuccessfully() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);

        // Act
        userService.deleteUser(1L, 1L);

        // Assert
        verify(userRepository).delete(testUser);
        verify(entityManager).createNativeQuery(anyString());
    }

    @Test
    @DisplayName("deleteUsers - 应批量删除用户")
    void deleteUsers_ShouldDeleteMultipleUsers() {
        // Arrange
        Long[] ids = {1L, 2L};
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);

        // Act
        userService.deleteUsers(ids, 1L);

        // Assert
        verify(userRepository, times(2)).delete(any(SysUser.class));
    }

    @Test
    @DisplayName("enableUser - 应启用用户")
    void enableUser_ShouldEnableUser() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(SysUser.class))).thenReturn(testUser);

        // Act
        userService.enableUser(1L, 1L);

        // Assert
        verify(userRepository).save(argThat(user ->
            user.getStatus() == SysUser.Status.ACTIVE
        ));
    }

    @Test
    @DisplayName("disableUser - 应禁用用户")
    void disableUser_ShouldDisableUser() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(SysUser.class))).thenReturn(testUser);

        // Act
        userService.disableUser(1L, 1L);

        // Assert
        verify(userRepository).save(argThat(user ->
            user.getStatus() == SysUser.Status.DISABLED
        ));
    }

    @Test
    @DisplayName("lockUser - 应锁定用户")
    void lockUser_ShouldLockUser() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(SysUser.class))).thenReturn(testUser);

        // Act
        userService.lockUser(1L, 1L);

        // Assert
        verify(userRepository).save(argThat(user ->
            user.getStatus() == SysUser.Status.LOCKED
        ));
    }

    @Test
    @DisplayName("unlockUser - 应解锁用户并重置失败次数")
    void unlockUser_ShouldUnlockUserAndResetFailureCount() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(SysUser.class))).thenReturn(testUser);

        // Act
        userService.unlockUser(1L, 1L);

        // Assert
        verify(userRepository).save(argThat(user ->
            user.getStatus() == SysUser.Status.ACTIVE
        ));
        verify(userRepository).resetLoginFailureCount(1L);
    }

    @Test
    @DisplayName("resetPassword - 应重置用户密码并返回新密码")
    void resetPassword_ShouldResetPasswordAndReturnNewPassword() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode(anyString())).thenReturn("new_encoded_password");
        when(userRepository.save(any(SysUser.class))).thenReturn(testUser);

        // Act
        String newPassword = userService.resetPassword(1L, 1L);

        // Assert
        assertThat(newPassword).isNotNull();
        assertThat(newPassword.length()).isEqualTo(12);
        verify(passwordEncoder).encode(anyString());
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("assignRoles - 应成功分配角色")
    void assignRoles_ShouldAssignRolesSuccessfully() {
        // Arrange
        Long[] roleIds = {1L, 2L};
        when(roleRepository.existsById(anyLong())).thenReturn(true);
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.setParameter(anyInt(), any())).thenReturn(query);
        when(query.executeUpdate()).thenReturn(1);

        // Act
        userService.assignRoles(1L, roleIds, 1L);

        // Assert
        verify(roleRepository, times(2)).existsById(anyLong());
        verify(entityManager, times(2)).createNativeQuery(anyString());
    }

    @Test
    @DisplayName("assignRoles - 角色不存在应抛出异常")
    void assignRoles_ShouldThrowException_WhenRoleNotExists() {
        // Arrange
        Long[] roleIds = {999L};
        when(roleRepository.existsById(999L)).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> userService.assignRoles(1L, roleIds, 1L))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("角色不存在");
    }

    @Test
    @DisplayName("removeRoles - 应成功移除角色")
    void removeRoles_ShouldRemoveRolesSuccessfully() {
        // Arrange
        Long[] roleIds = {1L, 2L};
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.setParameter(anyInt(), any())).thenReturn(query);
        when(query.executeUpdate()).thenReturn(1);

        // Act
        userService.removeRoles(1L, roleIds, 1L);

        // Assert
        verify(entityManager, times(2)).createNativeQuery(anyString());
    }

    @Test
    @DisplayName("existsByUsername - 用户名存在应返回true")
    void existsByUsername_ShouldReturnTrue_WhenUsernameExists() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act
        boolean result = userService.existsByUsername("testuser");

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("existsByUsername - 用户名不存在应返回false")
    void existsByUsername_ShouldReturnFalse_WhenUsernameNotExists() {
        // Arrange
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // Act
        boolean result = userService.existsByUsername("nonexistent");

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("existsByEmail - 邮箱存在应返回true")
    void existsByEmail_ShouldReturnTrue_WhenEmailExists() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        // Act
        boolean result = userService.existsByEmail("test@example.com");

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("existsByPhone - 手机号存在应返回true")
    void existsByPhone_ShouldReturnTrue_WhenPhoneExists() {
        // Arrange
        when(userRepository.findByPhone("13800138000")).thenReturn(Optional.of(testUser));

        // Act
        boolean result = userService.existsByPhone("13800138000");

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("getUserByUsername - 应返回用户详情")
    void getUserByUsername_ShouldReturnUserDetails() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(roleRepository.findRolesByUserId(1L)).thenReturn(Collections.emptyList());

        // Act
        UserResponse result = userService.getUserByUsername("testuser");

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getUsername()).isEqualTo("testuser");
    }

    @Test
    @DisplayName("updateLastLoginInfo - 应更新最后登录信息")
    void updateLastLoginInfo_ShouldUpdateLastLoginInfo() {
        // Act
        userService.updateLastLoginInfo(1L, "192.168.1.1");

        // Assert
        verify(userRepository).updateLastLoginInfo(eq(1L), any(LocalDateTime.class), eq("192.168.1.1"));
    }

    @Test
    @DisplayName("incrementLoginFailureCount - 应增加登录失败次数")
    void incrementLoginFailureCount_ShouldIncrementCount() {
        // Arrange
        testUser.setLoginFailureCount(2);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(SysUser.class))).thenReturn(testUser);

        // Act
        userService.incrementLoginFailureCount(1L);

        // Assert
        verify(userRepository).save(argThat(user ->
            user.getLoginFailureCount() == 3
        ));
    }

    @Test
    @DisplayName("incrementLoginFailureCount - 用户不存在不应抛出异常")
    void incrementLoginFailureCount_ShouldNotThrowException_WhenUserNotFound() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatCode(() -> userService.incrementLoginFailureCount(999L))
            .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("resetLoginFailureCount - 应重置登录失败次数")
    void resetLoginFailureCount_ShouldResetCount() {
        // Act
        userService.resetLoginFailureCount(1L);

        // Assert
        verify(userRepository).resetLoginFailureCount(1L);
    }

    @Test
    @DisplayName("getUserStatistics - 应返回用户统计信息")
    void getUserStatistics_ShouldReturnStatistics() {
        // Arrange
        when(userRepository.count()).thenReturn(100L);
        when(userRepository.countByStatus(SysUser.Status.ACTIVE)).thenReturn(80L);
        when(userRepository.countByStatus(SysUser.Status.DISABLED)).thenReturn(10L);
        when(userRepository.countByStatus(SysUser.Status.LOCKED)).thenReturn(5L);
        when(userRepository.countByStatus(SysUser.Status.PENDING)).thenReturn(5L);
        when(userRepository.findUsersCreatedBetween(any(), any(), any()))
            .thenReturn(new PageImpl<>(Arrays.asList(testUser, testUser)));

        // Act
        SysUserService.UserStatistics stats = userService.getUserStatistics();

        // Assert
        assertThat(stats.getTotalUsers()).isEqualTo(100L);
        assertThat(stats.getActiveUsers()).isEqualTo(80L);
        assertThat(stats.getDisabledUsers()).isEqualTo(10L);
        assertThat(stats.getLockedUsers()).isEqualTo(5L);
        assertThat(stats.getPendingUsers()).isEqualTo(5L);
        assertThat(stats.getTodayNewUsers()).isEqualTo(2L);
    }
}
