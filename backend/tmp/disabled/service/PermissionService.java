package com.drmp.service;

import com.drmp.dto.request.PermissionCreateRequest;
import com.drmp.dto.request.PermissionUpdateRequest;
import com.drmp.dto.response.PageResponse;
import com.drmp.dto.response.PermissionDetailResponse;
import com.drmp.dto.response.PermissionListResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

/**
 * Permission Service Interface
 * 权限管理服务接口
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public interface PermissionService {

    /**
     * 获取权限列表（分页）
     */
    PageResponse<PermissionListResponse> getPermissions(
            Pageable pageable,
            String keyword,
            String resource
    );

    /**
     * 获取所有权限列表（不分页）
     */
    List<PermissionListResponse> getAllPermissions();

    /**
     * 根据资源获取权限列表
     */
    List<PermissionListResponse> getPermissionsByResource(String resource);

    /**
     * 获取权限详情
     */
    PermissionDetailResponse getPermissionDetail(Long id);

    /**
     * 创建权限
     */
    PermissionDetailResponse createPermission(PermissionCreateRequest request);

    /**
     * 更新权限
     */
    PermissionDetailResponse updatePermission(Long id, PermissionUpdateRequest request);

    /**
     * 删除权限
     */
    void deletePermission(Long id);

    /**
     * 批量删除权限
     */
    void batchDeletePermissions(List<Long> permissionIds);

    /**
     * 获取权限树结构（按资源分组）
     */
    List<Map<String, Object>> getPermissionTree();

    /**
     * 获取所有资源类型
     */
    List<String> getAllResources();

    /**
     * 获取所有操作类型
     */
    List<String> getAllActions();

    /**
     * 根据角色ID获取权限
     */
    List<PermissionListResponse> getPermissionsByRoleId(Long roleId);

    /**
     * 根据用户ID获取权限
     */
    List<PermissionListResponse> getPermissionsByUserId(Long userId);

    /**
     * 获取角色没有的权限
     */
    List<PermissionListResponse> getPermissionsNotInRole(Long roleId);

    /**
     * 检查权限代码是否可用
     */
    boolean isPermissionCodeAvailable(String code, Long excludeId);

    /**
     * 检查权限名称是否可用
     */
    boolean isPermissionNameAvailable(String name, Long excludeId);

    /**
     * 验证权限是否可以删除
     */
    boolean canDeletePermission(Long permissionId);

    /**
     * 获取权限统计信息
     */
    Map<String, Object> getPermissionStatistics();

    /**
     * 获取未使用的权限
     */
    List<PermissionListResponse> getUnusedPermissions();

    /**
     * 根据权限代码批量获取权限
     */
    List<PermissionListResponse> getPermissionsByCodes(List<String> codes);

    /**
     * 初始化系统权限
     */
    void initializeSystemPermissions();

    /**
     * 同步权限数据
     */
    void syncPermissions();

    /**
     * 导出权限数据
     */
    byte[] exportPermissions(String resource);

    /**
     * 验证权限格式
     */
    boolean validatePermissionCode(String code);

    /**
     * 生成权限代码
     */
    String generatePermissionCode(String resource, String action);

    /**
     * 权限代码解析
     */
    Map<String, String> parsePermissionCode(String code);
}