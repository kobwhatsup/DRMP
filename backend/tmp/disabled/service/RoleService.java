package com.drmp.service;

import com.drmp.dto.request.RoleCreateRequest;
import com.drmp.dto.request.RoleUpdateRequest;
import com.drmp.dto.response.PageResponse;
import com.drmp.dto.response.RoleDetailResponse;
import com.drmp.dto.response.RoleListResponse;
import com.drmp.entity.Role;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

/**
 * Role Service Interface
 * 角色管理服务接口
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public interface RoleService {

    /**
     * 获取角色列表（分页）
     */
    PageResponse<RoleListResponse> getRoles(
            Pageable pageable,
            String keyword,
            String organizationType,
            Boolean enabled,
            Boolean isSystem
    );

    /**
     * 获取所有角色列表（不分页）
     */
    List<RoleListResponse> getAllRoles();

    /**
     * 根据机构类型获取角色列表
     */
    List<RoleListResponse> getRolesByOrganizationType(String organizationType);

    /**
     * 获取启用的角色列表
     */
    List<RoleListResponse> getEnabledRoles();

    /**
     * 获取角色详情
     */
    RoleDetailResponse getRoleDetail(Long id);

    /**
     * 创建角色
     */
    RoleDetailResponse createRole(RoleCreateRequest request);

    /**
     * 更新角色
     */
    RoleDetailResponse updateRole(Long id, RoleUpdateRequest request);

    /**
     * 删除角色
     */
    void deleteRole(Long id);

    /**
     * 启用/禁用角色
     */
    RoleDetailResponse toggleRoleStatus(Long id, Boolean enabled);

    /**
     * 分配权限给角色
     */
    RoleDetailResponse assignPermissions(Long roleId, List<Long> permissionIds);

    /**
     * 移除角色的权限
     */
    RoleDetailResponse removePermissions(Long roleId, List<Long> permissionIds);

    /**
     * 为角色分配用户
     */
    void assignUsersToRole(Long roleId, List<Long> userIds);

    /**
     * 从角色移除用户
     */
    void removeUsersFromRole(Long roleId, List<Long> userIds);

    /**
     * 获取角色的权限列表
     */
    List<Long> getRolePermissions(Long roleId);

    /**
     * 获取角色的用户列表
     */
    List<Long> getRoleUsers(Long roleId);

    /**
     * 检查角色代码是否可用
     */
    boolean isRoleCodeAvailable(String code, Long excludeId);

    /**
     * 检查角色名称是否可用
     */
    boolean isRoleNameAvailable(String name, Long excludeId);

    /**
     * 验证角色是否可以删除
     */
    boolean canDeleteRole(Long roleId);

    /**
     * 获取角色统计信息
     */
    Map<String, Object> getRoleStatistics();

    /**
     * 根据用户ID获取用户角色
     */
    List<RoleListResponse> getUserRoles(Long userId);

    /**
     * 复制角色
     */
    RoleDetailResponse copyRole(Long roleId, String newCode, String newName);

    /**
     * 批量删除角色
     */
    void batchDeleteRoles(List<Long> roleIds);

    /**
     * 批量启用/禁用角色
     */
    void batchToggleRoleStatus(List<Long> roleIds, Boolean enabled);

    /**
     * 导出角色数据
     */
    byte[] exportRoles(String organizationType, Boolean enabled);

    /**
     * 获取系统预定义角色
     */
    List<RoleListResponse> getSystemRoles();

    /**
     * 获取自定义角色
     */
    List<RoleListResponse> getCustomRoles();
}