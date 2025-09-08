package com.drmp.controller.system;

import com.drmp.dto.request.system.PermissionCreateRequest;
import com.drmp.dto.request.system.PermissionUpdateRequest;
import com.drmp.dto.response.ApiResponse;
import com.drmp.dto.response.system.PermissionResponse;
import com.drmp.service.system.SysPermissionService;
// import io.swagger.annotations.Api;
// import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

// @Api(tags = "系统管理 - 权限管理")
@RestController
@RequestMapping("/v1/system/permissions")
@RequiredArgsConstructor
public class SysPermissionController {
    
    private final SysPermissionService permissionService;
    
    // @ApiOperation("创建权限")
    @PostMapping
    @PreAuthorize("hasAuthority('system:permission:create')")
    public ApiResponse<PermissionResponse> createPermission(@Valid @RequestBody PermissionCreateRequest request) {
        PermissionResponse response = permissionService.createPermission(request);
        return ApiResponse.success(response);
    }
    
    // @ApiOperation("更新权限")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('system:permission:update')")
    public ApiResponse<PermissionResponse> updatePermission(@PathVariable Long id, 
                                                           @Valid @RequestBody PermissionUpdateRequest request) {
        request.setId(id);
        PermissionResponse response = permissionService.updatePermission(request);
        return ApiResponse.success(response);
    }
    
    // @ApiOperation("删除权限")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('system:permission:delete')")
    public ApiResponse<Void> deletePermission(@PathVariable Long id) {
        permissionService.deletePermission(id);
        return ApiResponse.success();
    }
    
    // @ApiOperation("获取权限详情")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('system:permission:view')")
    public ApiResponse<PermissionResponse> getPermission(@PathVariable Long id) {
        PermissionResponse response = permissionService.getPermission(id);
        return ApiResponse.success(response);
    }
    
    // @ApiOperation("获取权限树")
    @GetMapping("/tree")
    @PreAuthorize("hasAuthority('system:permission:list')")
    public ApiResponse<List<PermissionResponse>> getPermissionTree() {
        List<PermissionResponse> tree = permissionService.getPermissionTree();
        return ApiResponse.success(tree);
    }
    
    // @ApiOperation("按资源类型获取权限")
    @GetMapping("/by-type/{resourceType}")
    @PreAuthorize("hasAuthority('system:permission:list')")
    public ApiResponse<List<PermissionResponse>> getPermissionsByType(@PathVariable String resourceType) {
        List<PermissionResponse> permissions = permissionService.getPermissionsByResourceType(resourceType);
        return ApiResponse.success(permissions);
    }
    
    // @ApiOperation("搜索权限")
    @GetMapping("/search")
    @PreAuthorize("hasAuthority('system:permission:list')")
    public ApiResponse<Page<PermissionResponse>> searchPermissions(@RequestParam String keyword, Pageable pageable) {
        Page<PermissionResponse> page = permissionService.searchPermissions(keyword, pageable);
        return ApiResponse.success(page);
    }
    
    // @ApiOperation("分配角色权限")
    @PostMapping("/role/{roleId}/assign")
    @PreAuthorize("hasAuthority('system:role:assign-permission')")
    public ApiResponse<Void> assignRolePermissions(@PathVariable Long roleId, 
                                                  @RequestBody List<Long> permissionIds) {
        permissionService.assignRolePermissions(roleId, permissionIds);
        return ApiResponse.success();
    }
    
    // @ApiOperation("获取角色权限ID列表")
    @GetMapping("/role/{roleId}/permission-ids")
    @PreAuthorize("hasAuthority('system:role:view')")
    public ApiResponse<List<Long>> getRolePermissionIds(@PathVariable Long roleId) {
        List<Long> permissionIds = permissionService.getRolePermissionIds(roleId);
        return ApiResponse.success(permissionIds);
    }
    
    // @ApiOperation("获取当前用户权限列表")
    @GetMapping("/my-permissions")
    public ApiResponse<List<PermissionResponse>> getMyPermissions() {
        // TODO: 从Security Context获取当前用户ID
        Long userId = 1L;
        List<PermissionResponse> permissions = permissionService.getUserPermissions(userId);
        return ApiResponse.success(permissions);
    }
    
    // @ApiOperation("获取当前用户权限编码列表")
    @GetMapping("/my-permission-codes")
    public ApiResponse<List<String>> getMyPermissionCodes() {
        // TODO: 从Security Context获取当前用户ID
        Long userId = 1L;
        List<String> permissionCodes = permissionService.getUserPermissionCodes(userId);
        return ApiResponse.success(permissionCodes);
    }
}