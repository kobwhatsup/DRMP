package com.drmp.service;

import com.drmp.config.BaseServiceTest;
import com.drmp.dto.request.PermissionCreateRequest;
import com.drmp.dto.request.PermissionUpdateRequest;
import com.drmp.dto.response.PageResponse;
import com.drmp.dto.response.PermissionDetailResponse;
import com.drmp.dto.response.PermissionListResponse;
import com.drmp.entity.Permission;
import com.drmp.entity.Role;
import com.drmp.entity.User;
import com.drmp.exception.BusinessException;
import com.drmp.repository.PermissionRepository;
import com.drmp.repository.RoleRepository;
import com.drmp.repository.UserRepository;
import com.drmp.service.impl.PermissionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * PermissionService 单元测试
 */
@DisplayName("PermissionService 测试")
class PermissionServiceTest extends BaseServiceTest {

    @Mock
    private PermissionRepository permissionRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PermissionServiceImpl permissionService;

    private Permission testPermission;
    private Role testRole;
    private User testUser;

    @BeforeEach
    void setUp() {
        testPermission = new Permission();
        testPermission.setId(1L);
        testPermission.setCode("user:view");
        testPermission.setName("查看用户");
        testPermission.setDescription("查看用户权限");
        testPermission.setResource("user");
        testPermission.setAction("view");
        testPermission.setGroupName("用户管理");
        testPermission.setSortOrder(1);
        testPermission.setRoles(new HashSet<>());

        testRole = new Role();
        testRole.setId(1L);
        testRole.setCode("ADMIN");
        testRole.setName("管理员");
        testRole.setPermissions(new HashSet<>());

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setRoles(new HashSet<>());
    }

    @Test
    @DisplayName("分页查询权限")
    void getPermissions_ShouldReturnPagedPermissions() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Permission> permissionPage = new PageImpl<>(Arrays.asList(testPermission), pageable, 1);

        when(permissionRepository.findAll(any(Specification.class), eq(pageable)))
            .thenReturn(permissionPage);

        PageResponse<PermissionListResponse> result = permissionService.getPermissions(
            pageable, null, null);

        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("获取所有权限")
    void getAllPermissions_ShouldReturnAllPermissions() {
        when(permissionRepository.findAllByOrderByCreatedAtDesc())
            .thenReturn(Arrays.asList(testPermission));

        List<PermissionListResponse> result = permissionService.getAllPermissions();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCode()).isEqualTo("user:view");
    }

    @Test
    @DisplayName("根据资源获取权限")
    void getPermissionsByResource_ShouldReturnPermissions() {
        when(permissionRepository.findByResourceOrderBySortOrderAscCreatedAtDesc("user"))
            .thenReturn(Arrays.asList(testPermission));

        List<PermissionListResponse> result = permissionService.getPermissionsByResource("user");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getResource()).isEqualTo("user");
    }

    @Test
    @DisplayName("获取权限详情")
    void getPermissionDetail_ShouldReturnPermissionDetail() {
        when(permissionRepository.findByIdWithRoles(1L))
            .thenReturn(Optional.of(testPermission));

        PermissionDetailResponse result = permissionService.getPermissionDetail(1L);

        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo("user:view");
    }

    @Test
    @DisplayName("获取权限详情 - 权限不存在")
    void getPermissionDetail_WhenNotFound_ShouldThrowException() {
        when(permissionRepository.findByIdWithRoles(999L))
            .thenReturn(Optional.empty());

        assertThatThrownBy(() -> permissionService.getPermissionDetail(999L))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("权限不存在");
    }

    @Test
    @DisplayName("创建权限 - 代码已存在")
    void createPermission_WhenCodeExists_ShouldThrowException() {
        PermissionCreateRequest request = new PermissionCreateRequest();
        request.setCode("user:view");
        request.setName("查看用户");
        request.setResource("user");
        request.setAction("view");

        when(permissionRepository.existsByCode("user:view")).thenReturn(true);

        assertThatThrownBy(() -> permissionService.createPermission(request))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("权限代码已存在");
    }

    @Test
    @DisplayName("创建权限 - 资源和操作组合已存在")
    void createPermission_WhenResourceActionExists_ShouldThrowException() {
        PermissionCreateRequest request = new PermissionCreateRequest();
        request.setCode("user:view");
        request.setName("查看用户");
        request.setResource("user");
        request.setAction("view");

        when(permissionRepository.existsByCode("user:view")).thenReturn(false);
        when(permissionRepository.existsByResourceAndAction("user", "view")).thenReturn(true);

        assertThatThrownBy(() -> permissionService.createPermission(request))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("资源和操作组合已存在");
    }

    @Test
    @DisplayName("更新权限 - 名称已存在")
    void updatePermission_WhenNameExists_ShouldThrowException() {
        PermissionUpdateRequest request = new PermissionUpdateRequest();
        request.setName("查看用户");

        when(permissionRepository.findById(1L)).thenReturn(Optional.of(testPermission));
        when(permissionRepository.existsByNameAndIdNot("查看用户", 1L)).thenReturn(true);

        assertThatThrownBy(() -> permissionService.updatePermission(1L, request))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("权限名称已存在");
    }

    @Test
    @DisplayName("删除权限 - 权限已分配给角色")
    void deletePermission_WhenHasRoles_ShouldThrowException() {
        testPermission.getRoles().add(testRole);
        when(permissionRepository.findByIdWithRoles(1L))
            .thenReturn(Optional.of(testPermission));

        assertThatThrownBy(() -> permissionService.deletePermission(1L))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("该权限已分配给角色，无法删除");
    }

    @Test
    @DisplayName("根据角色ID获取权限")
    void getPermissionsByRoleId_ShouldReturnPermissions() {
        testRole.getPermissions().add(testPermission);
        when(roleRepository.findById(1L)).thenReturn(Optional.of(testRole));

        List<PermissionListResponse> result = permissionService.getPermissionsByRoleId(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCode()).isEqualTo("user:view");
    }

    @Test
    @DisplayName("根据用户ID获取权限")
    void getPermissionsByUserId_ShouldReturnPermissions() {
        testRole.getPermissions().add(testPermission);
        testUser.getRoles().add(testRole);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        List<PermissionListResponse> result = permissionService.getPermissionsByUserId(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCode()).isEqualTo("user:view");
    }

    @Test
    @DisplayName("获取角色没有的权限")
    void getPermissionsNotInRole_ShouldReturnPermissions() {
        Permission otherPermission = new Permission();
        otherPermission.setId(2L);
        otherPermission.setCode("user:create");
        otherPermission.setName("创建用户");
        otherPermission.setRoles(new HashSet<>());

        testRole.getPermissions().add(testPermission);
        when(roleRepository.findById(1L)).thenReturn(Optional.of(testRole));
        when(permissionRepository.findAll()).thenReturn(Arrays.asList(testPermission, otherPermission));

        List<PermissionListResponse> result = permissionService.getPermissionsNotInRole(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCode()).isEqualTo("user:create");
    }

    @Test
    @DisplayName("检查权限代码是否可用 - 不排除")
    void isPermissionCodeAvailable_WithoutExclude_ShouldReturnTrue() {
        when(permissionRepository.existsByCode("new:code")).thenReturn(false);

        boolean result = permissionService.isPermissionCodeAvailable("new:code", null);

        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("检查权限代码是否可用 - 排除自身")
    void isPermissionCodeAvailable_WithExclude_ShouldReturnTrue() {
        when(permissionRepository.existsByCodeAndIdNot("user:view", 1L)).thenReturn(false);

        boolean result = permissionService.isPermissionCodeAvailable("user:view", 1L);

        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("检查权限是否可以删除 - 可以删除")
    void canDeletePermission_WhenNoRoles_ShouldReturnTrue() {
        when(permissionRepository.findByIdWithRoles(1L))
            .thenReturn(Optional.of(testPermission));

        boolean result = permissionService.canDeletePermission(1L);

        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("检查权限是否可以删除 - 不可删除")
    void canDeletePermission_WhenHasRoles_ShouldReturnFalse() {
        testPermission.getRoles().add(testRole);
        when(permissionRepository.findByIdWithRoles(1L))
            .thenReturn(Optional.of(testPermission));

        boolean result = permissionService.canDeletePermission(1L);

        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("获取未使用的权限")
    void getUnusedPermissions_ShouldReturnPermissions() {
        when(permissionRepository.findUnusedPermissions())
            .thenReturn(Arrays.asList(testPermission));

        List<PermissionListResponse> result = permissionService.getUnusedPermissions();

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("批量删除权限 - 成功删除")
    void batchDeletePermissions_ShouldDeleteSuccessfully() {
        List<Long> ids = Arrays.asList(1L, 2L);
        List<Permission> permissions = Arrays.asList(testPermission, new Permission());

        when(permissionRepository.findAllByIdWithRoles(ids))
            .thenReturn(permissions);

        permissionService.batchDeletePermissions(ids);

        verify(permissionRepository).deleteAll(permissions);
    }

    @Test
    @DisplayName("批量删除权限 - 有权限已分配")
    void batchDeletePermissions_WhenHasRoles_ShouldThrowException() {
        testPermission.getRoles().add(testRole);
        List<Long> ids = Arrays.asList(1L);

        when(permissionRepository.findAllByIdWithRoles(ids))
            .thenReturn(Arrays.asList(testPermission));

        assertThatThrownBy(() -> permissionService.batchDeletePermissions(ids))
            .isInstanceOf(BusinessException.class)
            .hasMessageContaining("权限已分配给角色，无法删除");
    }

    @Test
    @DisplayName("根据代码批量获取权限")
    void getPermissionsByCodes_ShouldReturnPermissions() {
        List<String> codes = Arrays.asList("user:view", "user:create");
        when(permissionRepository.findByCodes(codes))
            .thenReturn(Arrays.asList(testPermission));

        List<PermissionListResponse> result = permissionService.getPermissionsByCodes(codes);

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("生成权限代码")
    void generatePermissionCode_ShouldReturnCode() {
        String result = permissionService.generatePermissionCode("user", "view");

        assertThat(result).isEqualTo("USER:VIEW");
    }

    @Test
    @DisplayName("解析权限代码")
    void parsePermissionCode_ShouldReturnParsedMap() {
        Map<String, String> result = permissionService.parsePermissionCode("USER:VIEW");

        assertThat(result).containsEntry("resource", "user");
        assertThat(result).containsEntry("action", "view");
    }

    @Test
    @DisplayName("验证权限代码格式 - 有效")
    void validatePermissionCode_WhenValid_ShouldReturnTrue() {
        boolean result = permissionService.validatePermissionCode("USER:VIEW");

        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("验证权限代码格式 - 无效")
    void validatePermissionCode_WhenInvalid_ShouldReturnFalse() {
        boolean result = permissionService.validatePermissionCode("invalid-code");

        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("获取权限统计信息")
    void getPermissionStatistics_ShouldReturnStatistics() {
        when(permissionRepository.count()).thenReturn(10L);

        Map<String, Object> result = permissionService.getPermissionStatistics();

        assertThat(result).containsKey("total");
        assertThat(result.get("total")).isEqualTo(10L);
    }
}
