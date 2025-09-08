package com.drmp.service.system.impl;

import com.drmp.dto.request.system.PermissionCreateRequest;
import com.drmp.dto.request.system.PermissionUpdateRequest;
import com.drmp.dto.response.system.PermissionResponse;
import com.drmp.entity.system.SysPermission;
import com.drmp.entity.system.SysRolePermission;
import com.drmp.repository.system.SysPermissionRepository;
import com.drmp.repository.system.SysRolePermissionRepository;
import com.drmp.service.system.SysPermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SysPermissionServiceImpl implements SysPermissionService {
    
    private final SysPermissionRepository permissionRepository;
    private final SysRolePermissionRepository rolePermissionRepository;
    
    @Override
    @Transactional
    public PermissionResponse createPermission(PermissionCreateRequest request) {
        log.info("创建权限: {}", request.getPermissionName());
        
        if (permissionRepository.findByPermissionCode(request.getPermissionCode()).isPresent()) {
            throw new RuntimeException("权限编码已存在: " + request.getPermissionCode());
        }
        
        SysPermission permission = new SysPermission();
        BeanUtils.copyProperties(request, permission);
        permission.setResourceType(SysPermission.ResourceType.valueOf(request.getResourceType()));
        permission.setStatus(SysPermission.Status.ACTIVE);
        
        permission = permissionRepository.save(permission);
        return convertToResponse(permission);
    }
    
    @Override
    @Transactional
    public PermissionResponse updatePermission(PermissionUpdateRequest request) {
        log.info("更新权限: {}", request.getId());
        
        SysPermission permission = permissionRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("权限不存在"));
        
        BeanUtils.copyProperties(request, permission, "id", "permissionCode", "createdAt", "createdBy");
        
        if (request.getResourceType() != null) {
            permission.setResourceType(SysPermission.ResourceType.valueOf(request.getResourceType()));
        }
        if (request.getStatus() != null) {
            permission.setStatus(SysPermission.Status.valueOf(request.getStatus()));
        }
        
        permission = permissionRepository.save(permission);
        return convertToResponse(permission);
    }
    
    @Override
    @Transactional
    @CacheEvict(value = "permissionCache", allEntries = true)
    public void deletePermission(Long permissionId) {
        log.info("删除权限: {}", permissionId);
        
        if (permissionRepository.hasChildren(permissionId)) {
            throw new RuntimeException("该权限存在子权限，无法删除");
        }
        
        if (rolePermissionRepository.isPermissionInUse(permissionId)) {
            throw new RuntimeException("该权限已被角色使用，无法删除");
        }
        
        permissionRepository.deleteById(permissionId);
    }
    
    @Override
    public PermissionResponse getPermission(Long permissionId) {
        SysPermission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new RuntimeException("权限不存在"));
        return convertToResponse(permission);
    }
    
    @Override
    @Cacheable(value = "permissionCache", key = "'allPermissionTree'")
    public List<PermissionResponse> getPermissionTree() {
        List<SysPermission> allPermissions = permissionRepository.findAll();
        return buildPermissionTree(allPermissions, 0L);
    }
    
    @Override
    public List<PermissionResponse> getPermissionsByResourceType(String resourceType) {
        SysPermission.ResourceType type = SysPermission.ResourceType.valueOf(resourceType);
        List<SysPermission> permissions = permissionRepository.findByResourceTypeAndStatus(type, SysPermission.Status.ACTIVE);
        return permissions.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    @Override
    public Page<PermissionResponse> searchPermissions(String keyword, Pageable pageable) {
        Page<SysPermission> permissionPage = permissionRepository.searchPermissions(keyword, pageable);
        return permissionPage.map(this::convertToResponse);
    }
    
    @Override
    @Transactional
    @CacheEvict(value = "permissionCache", allEntries = true)
    public void assignRolePermissions(Long roleId, List<Long> permissionIds) {
        log.info("分配角色权限 - 角色ID: {}, 权限数量: {}", roleId, permissionIds.size());
        
        rolePermissionRepository.deleteByRoleId(roleId);
        
        List<SysRolePermission> rolePermissions = permissionIds.stream()
                .map(permissionId -> {
                    SysRolePermission rolePermission = new SysRolePermission();
                    rolePermission.setRoleId(roleId);
                    rolePermission.setPermissionId(permissionId);
                    return rolePermission;
                })
                .collect(Collectors.toList());
        
        rolePermissionRepository.saveAll(rolePermissions);
    }
    
    @Override
    public List<Long> getRolePermissionIds(Long roleId) {
        return rolePermissionRepository.findPermissionIdsByRoleId(roleId);
    }
    
    @Override
    @Cacheable(value = "permissionCache", key = "'userPermissions:' + #userId")
    public List<PermissionResponse> getUserPermissions(Long userId) {
        List<SysPermission> permissions = permissionRepository.findUserPermissions(userId);
        return permissions.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    @Override
    @Cacheable(value = "permissionCache", key = "'userPermissionCodes:' + #userId")
    public List<String> getUserPermissionCodes(Long userId) {
        return permissionRepository.findUserPermissionCodes(userId);
    }
    
    @Override
    public boolean checkUserPermission(Long userId, String permissionCode) {
        List<String> userPermissionCodes = getUserPermissionCodes(userId);
        return userPermissionCodes.contains(permissionCode);
    }
    
    private List<PermissionResponse> buildPermissionTree(List<SysPermission> permissions, Long parentId) {
        Map<Long, List<SysPermission>> permissionMap = permissions.stream()
                .collect(Collectors.groupingBy(SysPermission::getParentId));
        
        return buildTree(permissionMap, parentId);
    }
    
    private List<PermissionResponse> buildTree(Map<Long, List<SysPermission>> permissionMap, Long parentId) {
        List<PermissionResponse> tree = new ArrayList<>();
        List<SysPermission> children = permissionMap.get(parentId);
        
        if (children != null) {
            for (SysPermission permission : children) {
                PermissionResponse response = convertToResponse(permission);
                response.setChildren(buildTree(permissionMap, permission.getId()));
                tree.add(response);
            }
        }
        
        return tree;
    }
    
    private PermissionResponse convertToResponse(SysPermission permission) {
        PermissionResponse response = new PermissionResponse();
        BeanUtils.copyProperties(permission, response);
        response.setResourceType(permission.getResourceType().name());
        response.setStatus(permission.getStatus().name());
        return response;
    }
}