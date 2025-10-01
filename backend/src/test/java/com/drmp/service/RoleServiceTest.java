package com.drmp.service;

import com.drmp.config.BaseServiceTest;
import com.drmp.dto.request.RoleCreateRequest;
import com.drmp.dto.request.RoleUpdateRequest;
import com.drmp.dto.response.PageResponse;
import com.drmp.dto.response.RoleDetailResponse;
import com.drmp.dto.response.RoleListResponse;
import com.drmp.entity.Role;
import com.drmp.exception.BusinessException;
import com.drmp.repository.PermissionRepository;
import com.drmp.repository.RoleRepository;
import com.drmp.repository.UserRepository;
import com.drmp.service.impl.RoleServiceImpl;
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
 * RoleService 单元测试 - 简化版
 */
@DisplayName("RoleService 测试")
class RoleServiceTest extends BaseServiceTest {

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PermissionRepository permissionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RoleServiceImpl roleService;

    private Role testRole;

    @BeforeEach
    void setUp() {
        testRole = new Role();
        testRole.setId(1L);
        testRole.setCode("ADMIN");
        testRole.setName("管理员");
        testRole.setEnabled(true);
        testRole.setIsSystem(false);
        testRole.setUsers(new HashSet<>());
        testRole.setPermissions(new HashSet<>());
    }

    @Test
    @DisplayName("分页查询角色")
    void getRoles_ShouldReturnPagedRoles() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Role> rolePage = new PageImpl<>(Arrays.asList(testRole), pageable, 1);

        when(roleRepository.findAll(any(Specification.class), eq(pageable)))
            .thenReturn(rolePage);

        PageResponse<RoleListResponse> result = roleService.getRoles(
            pageable, null, null, null, null);

        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(1);
    }

    @Test
    @DisplayName("获取所有角色")
    void getAllRoles_ShouldReturnAllRoles() {
        when(roleRepository.findAll()).thenReturn(Arrays.asList(testRole));

        List<RoleListResponse> result = roleService.getAllRoles();

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("获取启用的角色")
    void getEnabledRoles_ShouldReturnEnabledRoles() {
        when(roleRepository.findByEnabledTrueOrderByCreatedAtDesc())
            .thenReturn(Arrays.asList(testRole));

        List<RoleListResponse> result = roleService.getEnabledRoles();

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("获取角色详情")
    void getRoleDetail_ShouldReturnRoleDetail() {
        when(roleRepository.findByIdWithPermissionsAndUsers(1L))
            .thenReturn(Optional.of(testRole));

        RoleDetailResponse result = roleService.getRoleDetail(1L);

        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("获取角色详情 - 角色不存在")
    void getRoleDetail_WhenNotFound_ShouldThrowException() {
        when(roleRepository.findByIdWithPermissionsAndUsers(999L))
            .thenReturn(Optional.empty());

        assertThatThrownBy(() -> roleService.getRoleDetail(999L))
            .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("创建角色 - 代码已存在")
    void createRole_WhenCodeExists_ShouldThrowException() {
        RoleCreateRequest request = new RoleCreateRequest();
        request.setCode("ADMIN");
        request.setName("管理员");

        when(roleRepository.existsByCode("ADMIN")).thenReturn(true);

        assertThatThrownBy(() -> roleService.createRole(request))
            .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("删除角色 - 系统角色不允许删除")
    void deleteRole_WhenSystemRole_ShouldThrowException() {
        testRole.setIsSystem(true);
        when(roleRepository.findById(1L)).thenReturn(Optional.of(testRole));

        assertThatThrownBy(() -> roleService.deleteRole(1L))
            .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("删除角色 - 已分配用户不能删除")
    void deleteRole_WhenHasUsers_ShouldThrowException() {
        testRole.getUsers().add(new com.drmp.entity.User());
        when(roleRepository.findById(1L)).thenReturn(Optional.of(testRole));

        assertThatThrownBy(() -> roleService.deleteRole(1L))
            .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("更新角色 - 系统角色不允许修改")
    void updateRole_WhenSystemRole_ShouldThrowException() {
        testRole.setIsSystem(true);
        RoleUpdateRequest request = new RoleUpdateRequest();

        when(roleRepository.findById(1L)).thenReturn(Optional.of(testRole));

        assertThatThrownBy(() -> roleService.updateRole(1L, request))
            .isInstanceOf(BusinessException.class);
    }
}
