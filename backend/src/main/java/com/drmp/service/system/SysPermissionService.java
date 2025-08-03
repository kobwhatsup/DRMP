package com.drmp.service.system;

import com.drmp.dto.request.system.PermissionCreateRequest;
import com.drmp.dto.request.system.PermissionUpdateRequest;
import com.drmp.dto.response.system.PermissionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SysPermissionService {
    
    PermissionResponse createPermission(PermissionCreateRequest request);
    
    PermissionResponse updatePermission(PermissionUpdateRequest request);
    
    void deletePermission(Long permissionId);
    
    PermissionResponse getPermission(Long permissionId);
    
    List<PermissionResponse> getPermissionTree();
    
    List<PermissionResponse> getPermissionsByResourceType(String resourceType);
    
    Page<PermissionResponse> searchPermissions(String keyword, Pageable pageable);
    
    void assignRolePermissions(Long roleId, List<Long> permissionIds);
    
    List<Long> getRolePermissionIds(Long roleId);
    
    List<PermissionResponse> getUserPermissions(Long userId);
    
    List<String> getUserPermissionCodes(Long userId);
    
    boolean checkUserPermission(Long userId, String permissionCode);
}