package com.drmp.service.system.impl;

import com.drmp.dto.request.system.PermissionCreateRequest;
import com.drmp.dto.request.system.PermissionUpdateRequest;
import com.drmp.dto.response.system.PermissionResponse;
import com.drmp.entity.system.SysPermission;
import com.drmp.repository.system.SysPermissionRepository;
import com.drmp.repository.system.SysRolePermissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * SysPermissionServiceImpl 测试
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("SysPermissionServiceImpl 测试")
class SysPermissionServiceImplTest {

    @Mock
    private SysPermissionRepository permissionRepository;

    @Mock
    private SysRolePermissionRepository rolePermissionRepository;

    @InjectMocks
    private SysPermissionServiceImpl permissionService;

    private SysPermission testPermission;
    private PermissionCreateRequest createRequest;
    private PermissionUpdateRequest updateRequest;

    @BeforeEach
    void setUp() {
        testPermission = new SysPermission()
            .setId(1L)
            .setPermissionCode("user:create")
            .setPermissionName("创建用户")
            .setResourceType(SysPermission.ResourceType.BUTTON)
            .setResourcePath("/api/users")
            .setParentId(0L)
            .setStatus(SysPermission.Status.ACTIVE)
            .setSortOrder(1);

        createRequest = new PermissionCreateRequest();
        createRequest.setPermissionCode("user:create");
        createRequest.setPermissionName("创建用户");
        createRequest.setResourceType("BUTTON");
        createRequest.setResourcePath("/api/users");

        updateRequest = new PermissionUpdateRequest();
        updateRequest.setId(1L);
        updateRequest.setPermissionName("更新用户");
    }

    @Test
    @DisplayName("createPermission - 应成功创建权限")
    void createPermission_ShouldCreateSuccessfully() {
        // Arrange
        when(permissionRepository.findByPermissionCode("user:create")).thenReturn(Optional.empty());
        when(permissionRepository.save(any(SysPermission.class))).thenReturn(testPermission);

        // Act
        PermissionResponse result = permissionService.createPermission(createRequest);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getPermissionCode()).isEqualTo("user:create");
        verify(permissionRepository).save(any(SysPermission.class));
    }

    @Test
    @DisplayName("createPermission - 权限编码已存在应抛出异常")
    void createPermission_ShouldThrowException_WhenCodeExists() {
        // Arrange
        when(permissionRepository.findByPermissionCode("user:create")).thenReturn(Optional.of(testPermission));

        // Act & Assert
        assertThatThrownBy(() -> permissionService.createPermission(createRequest))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("权限编码已存在");
    }

    @Test
    @DisplayName("updatePermission - 应成功更新权限")
    void updatePermission_ShouldUpdateSuccessfully() {
        // Arrange
        when(permissionRepository.findById(1L)).thenReturn(Optional.of(testPermission));
        when(permissionRepository.save(any(SysPermission.class))).thenReturn(testPermission);

        // Act
        PermissionResponse result = permissionService.updatePermission(updateRequest);

        // Assert
        assertThat(result).isNotNull();
        verify(permissionRepository).save(any(SysPermission.class));
    }

    @Test
    @DisplayName("updatePermission - 权限不存在应抛出异常")
    void updatePermission_ShouldThrowException_WhenNotFound() {
        // Arrange
        when(permissionRepository.findById(999L)).thenReturn(Optional.empty());
        updateRequest.setId(999L);

        // Act & Assert
        assertThatThrownBy(() -> permissionService.updatePermission(updateRequest))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("权限不存在");
    }

    @Test
    @DisplayName("deletePermission - 应成功删除权限")
    void deletePermission_ShouldDeleteSuccessfully() {
        // Arrange
        when(permissionRepository.hasChildren(1L)).thenReturn(false);
        when(rolePermissionRepository.isPermissionInUse(1L)).thenReturn(false);

        // Act
        permissionService.deletePermission(1L);

        // Assert
        verify(permissionRepository).deleteById(1L);
    }

    @Test
    @DisplayName("deletePermission - 存在子权限应抛出异常")
    void deletePermission_ShouldThrowException_WhenHasChildren() {
        // Arrange
        when(permissionRepository.hasChildren(1L)).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> permissionService.deletePermission(1L))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("存在子权限");
    }

    @Test
    @DisplayName("deletePermission - 权限被使用应抛出异常")
    void deletePermission_ShouldThrowException_WhenInUse() {
        // Arrange
        when(permissionRepository.hasChildren(1L)).thenReturn(false);
        when(rolePermissionRepository.isPermissionInUse(1L)).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> permissionService.deletePermission(1L))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("已被角色使用");
    }

    @Test
    @DisplayName("getPermission - 应返回权限详情")
    void getPermission_ShouldReturnPermissionDetails() {
        // Arrange
        when(permissionRepository.findById(1L)).thenReturn(Optional.of(testPermission));

        // Act
        PermissionResponse result = permissionService.getPermission(1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getPermissionCode()).isEqualTo("user:create");
    }

    @Test
    @DisplayName("getPermissionTree - 应返回权限树")
    void getPermissionTree_ShouldReturnTree() {
        // Arrange
        SysPermission parent = new SysPermission()
            .setId(1L)
            .setPermissionCode("user")
            .setPermissionName("用户管理")
            .setParentId(0L)
            .setResourceType(SysPermission.ResourceType.MENU)
            .setStatus(SysPermission.Status.ACTIVE);

        SysPermission child = new SysPermission()
            .setId(2L)
            .setPermissionCode("user:create")
            .setPermissionName("创建用户")
            .setParentId(1L)
            .setResourceType(SysPermission.ResourceType.BUTTON)
            .setStatus(SysPermission.Status.ACTIVE);

        when(permissionRepository.findAll()).thenReturn(Arrays.asList(parent, child));

        // Act
        List<PermissionResponse> result = permissionService.getPermissionTree();

        // Assert
        assertThat(result).isNotEmpty();
        assertThat(result.get(0).getChildren()).isNotEmpty();
    }

    @Test
    @DisplayName("getPermissionsByResourceType - 应返回指定类型权限")
    void getPermissionsByResourceType_ShouldReturnPermissionsByType() {
        // Arrange
        when(permissionRepository.findByResourceTypeAndStatus(
            SysPermission.ResourceType.BUTTON,
            SysPermission.Status.ACTIVE))
            .thenReturn(Arrays.asList(testPermission));

        // Act
        List<PermissionResponse> result = permissionService.getPermissionsByResourceType("BUTTON");

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getResourceType()).isEqualTo("BUTTON");
    }

    @Test
    @DisplayName("searchPermissions - 应返回搜索结果")
    void searchPermissions_ShouldReturnSearchResults() {
        // Arrange
        Page<SysPermission> permissionPage = new PageImpl<>(Arrays.asList(testPermission));
        when(permissionRepository.searchPermissions(eq("用户"), any(PageRequest.class)))
            .thenReturn(permissionPage);

        // Act
        Page<PermissionResponse> result = permissionService.searchPermissions("用户", PageRequest.of(0, 10));

        // Assert
        assertThat(result).isNotEmpty();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("assignRolePermissions - 应成功分配角色权限")
    void assignRolePermissions_ShouldAssignSuccessfully() {
        // Arrange
        List<Long> permissionIds = Arrays.asList(1L, 2L, 3L);

        // Act
        permissionService.assignRolePermissions(1L, permissionIds);

        // Assert
        verify(rolePermissionRepository).deleteByRoleId(1L);
        verify(rolePermissionRepository).saveAll(anyList());
    }

    @Test
    @DisplayName("getRolePermissionIds - 应返回角色权限ID列表")
    void getRolePermissionIds_ShouldReturnPermissionIds() {
        // Arrange
        List<Long> permissionIds = Arrays.asList(1L, 2L, 3L);
        when(rolePermissionRepository.findPermissionIdsByRoleId(1L)).thenReturn(permissionIds);

        // Act
        List<Long> result = permissionService.getRolePermissionIds(1L);

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(1L, 2L, 3L);
    }

    @Test
    @DisplayName("getUserPermissions - 应返回用户权限列表")
    void getUserPermissions_ShouldReturnUserPermissions() {
        // Arrange
        when(permissionRepository.findUserPermissions(1L)).thenReturn(Arrays.asList(testPermission));

        // Act
        List<PermissionResponse> result = permissionService.getUserPermissions(1L);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPermissionCode()).isEqualTo("user:create");
    }

    @Test
    @DisplayName("getUserPermissionCodes - 应返回用户权限编码列表")
    void getUserPermissionCodes_ShouldReturnPermissionCodes() {
        // Arrange
        List<String> codes = Arrays.asList("user:create", "user:update", "user:delete");
        when(permissionRepository.findUserPermissionCodes(1L)).thenReturn(codes);

        // Act
        List<String> result = permissionService.getUserPermissionCodes(1L);

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result).contains("user:create", "user:update", "user:delete");
    }

    @Test
    @DisplayName("checkUserPermission - 用户有权限应返回true")
    void checkUserPermission_ShouldReturnTrue_WhenUserHasPermission() {
        // Arrange
        List<String> codes = Arrays.asList("user:create", "user:update");
        when(permissionRepository.findUserPermissionCodes(1L)).thenReturn(codes);

        // Act
        boolean result = permissionService.checkUserPermission(1L, "user:create");

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("checkUserPermission - 用户无权限应返回false")
    void checkUserPermission_ShouldReturnFalse_WhenUserHasNoPermission() {
        // Arrange
        List<String> codes = Arrays.asList("user:create", "user:update");
        when(permissionRepository.findUserPermissionCodes(1L)).thenReturn(codes);

        // Act
        boolean result = permissionService.checkUserPermission(1L, "user:delete");

        // Assert
        assertThat(result).isFalse();
    }
}
