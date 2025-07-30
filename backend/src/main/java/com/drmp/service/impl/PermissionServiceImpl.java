package com.drmp.service.impl;

import com.drmp.dto.request.PermissionCreateRequest;
import com.drmp.dto.request.PermissionUpdateRequest;
import com.drmp.dto.response.PageResponse;
import com.drmp.dto.response.PermissionDetailResponse;
import com.drmp.dto.response.PermissionListResponse;
import com.drmp.dto.response.RoleListResponse;
import com.drmp.entity.Permission;
import com.drmp.entity.Role;
import com.drmp.entity.User;
import com.drmp.exception.BusinessException;
import com.drmp.repository.PermissionRepository;
import com.drmp.repository.RoleRepository;
import com.drmp.repository.UserRepository;
import com.drmp.service.PermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Permission Service Implementation
 * 权限管理服务实现
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PermissionListResponse> getPermissionsByCodes(List<String> codes) {
        List<Permission> permissions = permissionRepository.findByCodes(codes);
        return permissions.stream()
            .map(this::convertToListResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PermissionListResponse> getPermissions(
            Pageable pageable, 
            String keyword, 
            String resource) {
        
        Specification<Permission> spec = buildSpecification(keyword, resource);
        Page<Permission> permissionPage = permissionRepository.findAll(spec, pageable);
        
        List<PermissionListResponse> content = permissionPage.getContent().stream()
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
        
        return PageResponse.<PermissionListResponse>builder()
                .content(content)
                .page(permissionPage.getNumber())
                .size(permissionPage.getSize())
                .totalElements(permissionPage.getTotalElements())
                .totalPages(permissionPage.getTotalPages())
                .first(permissionPage.isFirst())
                .last(permissionPage.isLast())
                .hasNext(permissionPage.hasNext())
                .hasPrevious(permissionPage.hasPrevious())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermissionListResponse> getAllPermissions() {
        List<Permission> permissions = permissionRepository.findAllByOrderByCreatedAtDesc();
        return permissions.stream()
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPermissionTree() {
        List<Map<String, Object>> tree = new ArrayList<>();
        // TODO: Implement permission tree logic
        return tree;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermissionListResponse> getPermissionsByRoleId(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new BusinessException("角色不存在"));
        return role.getPermissions().stream()
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermissionListResponse> getPermissionsByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        Set<Permission> permissions = new HashSet<>();
        user.getRoles().forEach(role -> permissions.addAll(role.getPermissions()));
        return permissions.stream()
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermissionListResponse> getPermissionsNotInRole(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new BusinessException("角色不存在"));
        Set<Long> rolePermissionIds = role.getPermissions().stream()
                .map(Permission::getId)
                .collect(Collectors.toSet());
        
        List<Permission> allPermissions = permissionRepository.findAll();
        return allPermissions.stream()
                .filter(permission -> !rolePermissionIds.contains(permission.getId()))
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermissionListResponse> getPermissionsByResource(String resource) {
        List<Permission> permissions = permissionRepository.findByResourceOrderBySortOrderAscCreatedAtDesc(resource);
        return permissions.stream()
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PermissionDetailResponse getPermissionDetail(Long id) {
        Permission permission = permissionRepository.findByIdWithRoles(id)
                .orElseThrow(() -> new BusinessException("权限不存在"));
        return convertToDetailResponse(permission);
    }

    @Override
    public PermissionDetailResponse createPermission(PermissionCreateRequest request) {
        // 验证权限代码和资源+操作组合唯一性
        if (permissionRepository.existsByCode(request.getCode())) {
            throw new BusinessException("权限代码已存在");
        }
        if (permissionRepository.existsByResourceAndAction(request.getResource(), request.getAction())) {
            throw new BusinessException("资源和操作组合已存在");
        }

        Permission permission = new Permission();
        BeanUtils.copyProperties(request, permission);
        permission.setCreatedBy(getCurrentUserId());
        permission.setCreatedAt(LocalDateTime.now());

        permission = permissionRepository.save(permission);
        log.info("Created permission: {}", permission.getCode());
        
        return convertToDetailResponse(permission);
    }

    @Override
    public PermissionDetailResponse updatePermission(Long id, PermissionUpdateRequest request) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new BusinessException("权限不存在"));

        // 验证名称唯一性
        if (StringUtils.hasText(request.getName()) && 
            permissionRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new BusinessException("权限名称已存在");
        }

        // 更新基本信息
        if (StringUtils.hasText(request.getName())) {
            permission.setName(request.getName());
        }
        if (request.getDescription() != null) {
            permission.setDescription(request.getDescription());
        }
        if (request.getGroupName() != null) {
            permission.setGroupName(request.getGroupName());
        }
        if (request.getSortOrder() != null) {
            permission.setSortOrder(request.getSortOrder());
        }

        permission.setUpdatedBy(getCurrentUserId());
        permission.setUpdatedAt(LocalDateTime.now());

        permission = permissionRepository.save(permission);
        log.info("Updated permission: {}", permission.getCode());
        
        return convertToDetailResponse(permission);
    }

    @Override
    public void deletePermission(Long id) {
        Permission permission = permissionRepository.findByIdWithRoles(id)
                .orElseThrow(() -> new BusinessException("权限不存在"));

        // 检查是否有角色关联
        if (!permission.getRoles().isEmpty()) {
            throw new BusinessException("该权限已分配给角色，无法删除");
        }

        permissionRepository.delete(permission);
        log.info("Deleted permission: {}", permission.getCode());
    }


    @Override
    @Transactional(readOnly = true)
    public boolean isPermissionCodeAvailable(String code, Long excludeId) {
        if (excludeId != null) {
            return !permissionRepository.existsByCodeAndIdNot(code, excludeId);
        }
        return !permissionRepository.existsByCode(code);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isPermissionNameAvailable(String name, Long excludeId) {
        if (excludeId != null) {
            return !permissionRepository.existsByNameAndIdNot(name, excludeId);
        }
        return !permissionRepository.existsByName(name);
    }


    @Override
    @Transactional(readOnly = true)
    public boolean canDeletePermission(Long permissionId) {
        Permission permission = permissionRepository.findByIdWithRoles(permissionId)
                .orElseThrow(() -> new BusinessException("权限不存在"));
        
        return permission.getRoles().isEmpty();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getPermissionStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalPermissions = permissionRepository.count();
        // TODO: Implement group and resource statistics
        List<Map<String, Object>> groupStats = new ArrayList<>();
        List<Map<String, Object>> resourceStats = new ArrayList<>();
        
        stats.put("total", totalPermissions);
        stats.put("groupStats", groupStats);
        stats.put("resourceStats", resourceStats);
        
        return stats;
    }

    public List<String> getAllGroups() {
        // TODO: Implement distinct group names query
        return new ArrayList<>();
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllResources() {
        // TODO: Implement distinct resources query
        return new ArrayList<>();
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllActions() {
        // TODO: Implement distinct actions query
        return new ArrayList<>();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermissionListResponse> getUnusedPermissions() {
        List<Permission> permissions = permissionRepository.findUnusedPermissions();
        return permissions.stream()
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
    }







    @Override
    public void batchDeletePermissions(List<Long> permissionIds) {
        List<Permission> permissions = permissionRepository.findAllByIdWithRoles(permissionIds);
        
        for (Permission permission : permissions) {
            if (!permission.getRoles().isEmpty()) {
                throw new BusinessException("权限已分配给角色，无法删除: " + permission.getName());
            }
        }

        permissionRepository.deleteAll(permissions);
        log.info("Batch deleted {} permissions", permissionIds.size());
    }

    public byte[] exportPermissions(String groupName, String resource) {
        // TODO: 实现权限数据导出功能
        throw new BusinessException("导出功能暂未实现");
    }

    public void initSystemPermissions() {
        log.info("Initializing system permissions...");
        
        List<Permission> systemPermissions = createSystemPermissions();
        
        for (Permission permission : systemPermissions) {
            if (!permissionRepository.existsByCode(permission.getCode())) {
                permission.setCreatedBy(1L); // 系统用户
                permission.setCreatedAt(LocalDateTime.now());
                permissionRepository.save(permission);
                log.info("Created system permission: {}", permission.getCode());
            }
        }
        
        log.info("System permissions initialization completed");
    }

    @Override
    public String generatePermissionCode(String resource, String action) {
        return resource.toUpperCase() + ":" + action.toUpperCase();
    }

    @Override
    public Map<String, String> parsePermissionCode(String code) {
        Map<String, String> result = new HashMap<>();
        if (StringUtils.hasText(code) && code.contains(":")) {
            String[] parts = code.split(":");
            if (parts.length == 2) {
                result.put("resource", parts[0].toLowerCase());
                result.put("action", parts[1].toLowerCase());
            }
        }
        return result;
    }

    @Override
    public boolean validatePermissionCode(String code) {
        return StringUtils.hasText(code) && 
               code.matches("^[A-Z_]+:[A-Z_]+$") && 
               code.length() <= 100;
    }

    @Override
    public void initializeSystemPermissions() {
        log.info("Initializing system permissions...");
        // TODO: 实现系统权限初始化逻辑
    }

    @Override
    public void syncPermissions() {
        log.info("Syncing permissions...");
        // TODO: 实现权限同步逻辑
    }

    @Override
    public byte[] exportPermissions(String resource) {
        // TODO: 实现权限导出功能
        return new byte[0];
    }

    // 私有方法

    private Specification<Permission> buildSpecification(String keyword, String resource) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(keyword)) {
                String pattern = "%" + keyword + "%";
                Predicate namePredicate = criteriaBuilder.like(root.get("name"), pattern);
                Predicate codePredicate = criteriaBuilder.like(root.get("code"), pattern);
                Predicate descriptionPredicate = criteriaBuilder.like(root.get("description"), pattern);
                Predicate resourcePredicate = criteriaBuilder.like(root.get("resource"), pattern);
                Predicate actionPredicate = criteriaBuilder.like(root.get("action"), pattern);
                predicates.add(criteriaBuilder.or(namePredicate, codePredicate, descriptionPredicate, resourcePredicate, actionPredicate));
            }

            if (StringUtils.hasText(resource)) {
                predicates.add(criteriaBuilder.equal(root.get("resource"), resource));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private PermissionListResponse convertToListResponse(Permission permission) {
        return PermissionListResponse.builder()
                .id(permission.getId())
                .code(permission.getCode())
                .name(permission.getName())
                .description(permission.getDescription())
                .resource(permission.getResource())
                .action(permission.getAction())
                .groupName(permission.getGroupName())
                .roleCount(permission.getRoles() != null ? permission.getRoles().size() : 0)
                .sortOrder(permission.getSortOrder())
                .createdAt(permission.getCreatedAt())
                .updatedAt(permission.getUpdatedAt())
                .build();
    }

    private PermissionDetailResponse convertToDetailResponse(Permission permission) {
        List<RoleListResponse> roles = permission.getRoles() != null 
                ? permission.getRoles().stream()
                    .map(this::convertRoleToListResponse)
                    .collect(Collectors.toList())
                : new ArrayList<>();

        return PermissionDetailResponse.builder()
                .id(permission.getId())
                .code(permission.getCode())
                .name(permission.getName())
                .description(permission.getDescription())
                .resource(permission.getResource())
                .action(permission.getAction())
                .groupName(permission.getGroupName())
                .sortOrder(permission.getSortOrder())
                .roles(roles)
                .createdBy(permission.getCreatedBy())
                .createdByName(getUserName(permission.getCreatedBy()))
                .updatedBy(permission.getUpdatedBy())
                .updatedByName(getUserName(permission.getUpdatedBy()))
                .createdAt(permission.getCreatedAt())
                .updatedAt(permission.getUpdatedAt())
                .build();
    }

    private RoleListResponse convertRoleToListResponse(Role role) {
        return RoleListResponse.builder()
                .id(role.getId())
                .code(role.getCode())
                .name(role.getName())
                .description(role.getDescription())
                .organizationType(role.getOrganizationType())
                .organizationTypeName(getOrganizationTypeName(role.getOrganizationType()))
                .isSystem(role.getIsSystem())
                .enabled(role.getEnabled())
                .permissionCount(role.getPermissions() != null ? role.getPermissions().size() : 0)
                .userCount(role.getUsers() != null ? role.getUsers().size() : 0)
                .sortOrder(role.getSortOrder())
                .createdAt(role.getCreatedAt())
                .updatedAt(role.getUpdatedAt())
                .build();
    }

    private String getOrganizationTypeName(String organizationType) {
        if (organizationType == null) return null;
        switch (organizationType) {
            case "SOURCE": return "案源机构";
            case "DISPOSAL": return "处置机构";
            case "SYSTEM": return "系统";
            default: return organizationType;
        }
    }

    private String getUserName(Long userId) {
        if (userId == null) return null;
        return userRepository.findById(userId)
                .map(User::getRealName)
                .orElse(null);
    }

    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .map(User::getId)
                .orElse(null);
    }

    private List<Permission> createSystemPermissions() {
        List<Permission> permissions = new ArrayList<>();
        
        // 机构管理权限
        permissions.add(createPermission("org:view", "查看机构", "organization", "view", "机构管理", 1));
        permissions.add(createPermission("org:create", "创建机构", "organization", "create", "机构管理", 2));
        permissions.add(createPermission("org:update", "修改机构", "organization", "update", "机构管理", 3));
        permissions.add(createPermission("org:delete", "删除机构", "organization", "delete", "机构管理", 4));
        permissions.add(createPermission("org:approve", "审核机构", "organization", "approve", "机构管理", 5));
        permissions.add(createPermission("org:suspend", "暂停机构", "organization", "suspend", "机构管理", 6));
        
        // 用户管理权限
        permissions.add(createPermission("user:view", "查看用户", "user", "view", "用户管理", 10));
        permissions.add(createPermission("user:create", "创建用户", "user", "create", "用户管理", 11));
        permissions.add(createPermission("user:update", "修改用户", "user", "update", "用户管理", 12));
        permissions.add(createPermission("user:delete", "删除用户", "user", "delete", "用户管理", 13));
        permissions.add(createPermission("user:reset_password", "重置密码", "user", "reset_password", "用户管理", 14));
        permissions.add(createPermission("user:assign_role", "分配角色", "user", "assign_role", "用户管理", 15));
        
        // 角色管理权限
        permissions.add(createPermission("role:view", "查看角色", "role", "view", "角色管理", 20));
        permissions.add(createPermission("role:create", "创建角色", "role", "create", "角色管理", 21));
        permissions.add(createPermission("role:update", "修改角色", "role", "update", "角色管理", 22));
        permissions.add(createPermission("role:delete", "删除角色", "role", "delete", "角色管理", 23));
        permissions.add(createPermission("role:assign_permission", "分配权限", "role", "assign_permission", "角色管理", 24));
        
        // 权限管理权限
        permissions.add(createPermission("permission:view", "查看权限", "permission", "view", "权限管理", 30));
        permissions.add(createPermission("permission:create", "创建权限", "permission", "create", "权限管理", 31));
        permissions.add(createPermission("permission:update", "修改权限", "permission", "update", "权限管理", 32));
        permissions.add(createPermission("permission:delete", "删除权限", "permission", "delete", "权限管理", 33));
        
        // 案件管理权限
        permissions.add(createPermission("case:view", "查看案件", "case", "view", "案件管理", 40));
        permissions.add(createPermission("case:create", "创建案件", "case", "create", "案件管理", 41));
        permissions.add(createPermission("case:update", "修改案件", "case", "update", "案件管理", 42));
        permissions.add(createPermission("case:delete", "删除案件", "case", "delete", "案件管理", 43));
        permissions.add(createPermission("case:assign", "分配案件", "case", "assign", "案件管理", 44));
        permissions.add(createPermission("case:import", "导入案件", "case", "import", "案件管理", 45));
        permissions.add(createPermission("case:export", "导出案件", "case", "export", "案件管理", 46));
        
        // 案件包管理权限
        permissions.add(createPermission("case_package:view", "查看案件包", "case_package", "view", "案件包管理", 50));
        permissions.add(createPermission("case_package:create", "创建案件包", "case_package", "create", "案件包管理", 51));
        permissions.add(createPermission("case_package:update", "修改案件包", "case_package", "update", "案件包管理", 52));
        permissions.add(createPermission("case_package:delete", "删除案件包", "case_package", "delete", "案件包管理", 53));
        permissions.add(createPermission("case_package:publish", "发布案件包", "case_package", "publish", "案件包管理", 54));
        permissions.add(createPermission("case_package:bid", "竞标案件包", "case_package", "bid", "案件包管理", 55));
        
        // 回款管理权限
        permissions.add(createPermission("settlement:view", "查看回款", "settlement", "view", "回款管理", 60));
        permissions.add(createPermission("settlement:create", "录入回款", "settlement", "create", "回款管理", 61));
        permissions.add(createPermission("settlement:update", "修改回款", "settlement", "update", "回款管理", 62));
        permissions.add(createPermission("settlement:delete", "删除回款", "settlement", "delete", "回款管理", 63));
        permissions.add(createPermission("settlement:audit", "审核回款", "settlement", "audit", "回款管理", 64));
        permissions.add(createPermission("settlement:export", "导出回款", "settlement", "export", "回款管理", 65));
        
        // 报表管理权限
        permissions.add(createPermission("report:view", "查看报表", "report", "view", "报表管理", 70));
        permissions.add(createPermission("report:export", "导出报表", "report", "export", "报表管理", 71));
        permissions.add(createPermission("report:dashboard", "查看看板", "report", "dashboard", "报表管理", 72));
        
        // 系统管理权限
        permissions.add(createPermission("system:config", "系统配置", "system", "config", "系统管理", 80));
        permissions.add(createPermission("system:log", "查看日志", "system", "log", "系统管理", 81));
        permissions.add(createPermission("system:backup", "系统备份", "system", "backup", "系统管理", 82));
        permissions.add(createPermission("system:monitor", "系统监控", "system", "monitor", "系统管理", 83));
        
        return permissions;
    }

    private Permission createPermission(String code, String name, String resource, String action, String groupName, Integer sortOrder) {
        Permission permission = new Permission();
        permission.setCode(code);
        permission.setName(name);
        permission.setDescription(name);
        permission.setResource(resource);
        permission.setAction(action);
        permission.setGroupName(groupName);
        permission.setSortOrder(sortOrder);
        return permission;
    }
}