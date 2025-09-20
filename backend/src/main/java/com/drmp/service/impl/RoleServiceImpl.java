package com.drmp.service.impl;

import com.drmp.dto.request.RoleCreateRequest;
import com.drmp.dto.request.RoleUpdateRequest;
import com.drmp.dto.response.PageResponse;
import com.drmp.dto.response.PermissionListResponse;
import com.drmp.dto.response.RoleDetailResponse;
import com.drmp.dto.response.RoleListResponse;
import com.drmp.dto.response.UserSimpleResponse;
import com.drmp.entity.Permission;
import com.drmp.entity.Role;
import com.drmp.entity.User;
import com.drmp.exception.BusinessException;
import com.drmp.repository.PermissionRepository;
import com.drmp.repository.RoleRepository;
import com.drmp.repository.UserRepository;
import com.drmp.service.RoleService;
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
 * Role Service Implementation
 * 角色管理服务实现
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RoleListResponse> getRoles(
            Pageable pageable, 
            String keyword, 
            String organizationType, 
            Boolean enabled, 
            Boolean isSystem) {
        
        Specification<Role> spec = buildSpecification(keyword, organizationType, enabled, isSystem);
        Page<Role> rolePage = roleRepository.findAll(spec, pageable);
        
        List<RoleListResponse> content = rolePage.getContent().stream()
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
        
        return PageResponse.<RoleListResponse>builder()
                .content(content)
                .page(rolePage.getNumber())
                .size(rolePage.getSize())
                .totalElements(rolePage.getTotalElements())
                .totalPages(rolePage.getTotalPages())
                .first(rolePage.isFirst())
                .last(rolePage.isLast())
                .hasNext(rolePage.hasNext())
                .hasPrevious(rolePage.hasPrevious())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleListResponse> getAllRoles() {
        List<Role> roles = roleRepository.findAll();
        return roles.stream()
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleListResponse> getRolesByOrganizationType(String organizationType) {
        List<Role> roles = roleRepository.findByOrganizationTypeOrderByCreatedAtDesc(organizationType);
        return roles.stream()
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleListResponse> getEnabledRoles() {
        List<Role> roles = roleRepository.findByEnabledTrueOrderByCreatedAtDesc();
        return roles.stream()
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoleDetailResponse getRoleDetail(Long id) {
        Role role = roleRepository.findByIdWithPermissionsAndUsers(id)
                .orElseThrow(() -> new BusinessException("角色不存在"));
        return convertToDetailResponse(role);
    }

    @Override
    public RoleDetailResponse createRole(RoleCreateRequest request) {
        // 验证角色代码和名称唯一性
        if (roleRepository.existsByCode(request.getCode())) {
            throw new BusinessException("角色代码已存在");
        }
        if (roleRepository.existsByName(request.getName())) {
            throw new BusinessException("角色名称已存在");
        }

        Role role = new Role();
        BeanUtils.copyProperties(request, role);
        role.setIsSystem(false); // 通过API创建的角色都是非系统角色
        role.setCreatedBy(getCurrentUserId());
        role.setCreatedAt(LocalDateTime.now());

        // 分配权限
        if (request.getPermissionIds() != null && !request.getPermissionIds().isEmpty()) {
            Set<Permission> permissions = new HashSet<>(
                    permissionRepository.findAllById(request.getPermissionIds())
            );
            role.setPermissions(permissions);
        }

        role = roleRepository.save(role);
        log.info("Created role: {}", role.getCode());
        
        return convertToDetailResponse(role);
    }

    @Override
    public RoleDetailResponse updateRole(Long id, RoleUpdateRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new BusinessException("角色不存在"));

        // 系统角色不允许修改
        if (Boolean.TRUE.equals(role.getIsSystem())) {
            throw new BusinessException("系统角色不允许修改");
        }

        // 验证名称唯一性
        if (StringUtils.hasText(request.getName()) && 
            roleRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new BusinessException("角色名称已存在");
        }

        // 更新基本信息
        if (StringUtils.hasText(request.getName())) {
            role.setName(request.getName());
        }
        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }
        if (request.getOrganizationType() != null) {
            role.setOrganizationType(request.getOrganizationType());
        }
        if (request.getEnabled() != null) {
            role.setEnabled(request.getEnabled());
        }
        if (request.getSortOrder() != null) {
            role.setSortOrder(request.getSortOrder());
        }

        role.setUpdatedBy(getCurrentUserId());
        role.setUpdatedAt(LocalDateTime.now());

        // 更新权限
        if (request.getPermissionIds() != null) {
            Set<Permission> permissions = new HashSet<>(
                    permissionRepository.findAllById(request.getPermissionIds())
            );
            role.setPermissions(permissions);
        }

        role = roleRepository.save(role);
        log.info("Updated role: {}", role.getCode());
        
        return convertToDetailResponse(role);
    }

    @Override
    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new BusinessException("角色不存在"));

        // 系统角色不允许删除
        if (Boolean.TRUE.equals(role.getIsSystem())) {
            throw new BusinessException("系统角色不允许删除");
        }

        // 检查是否有用户关联
        if (!role.getUsers().isEmpty()) {
            throw new BusinessException("该角色已分配给用户，无法删除");
        }

        roleRepository.delete(role);
        log.info("Deleted role: {}", role.getCode());
    }

    @Override
    public RoleDetailResponse toggleRoleStatus(Long id, Boolean enabled) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new BusinessException("角色不存在"));

        // 系统角色不允许禁用
        if (Boolean.TRUE.equals(role.getIsSystem()) && Boolean.FALSE.equals(enabled)) {
            throw new BusinessException("系统角色不允许禁用");
        }

        role.setEnabled(enabled);
        role.setUpdatedBy(getCurrentUserId());
        role.setUpdatedAt(LocalDateTime.now());

        role = roleRepository.save(role);
        log.info("Toggled role status: {} -> {}", role.getCode(), enabled);
        
        return convertToDetailResponse(role);
    }

    @Override
    public RoleDetailResponse assignPermissions(Long roleId, List<Long> permissionIds) {
        Role role = roleRepository.findByIdWithPermissions(roleId)
                .orElseThrow(() -> new BusinessException("角色不存在"));

        Set<Permission> permissions = new HashSet<>(
                permissionRepository.findAllById(permissionIds)
        );
        role.setPermissions(permissions);
        role.setUpdatedBy(getCurrentUserId());
        role.setUpdatedAt(LocalDateTime.now());

        role = roleRepository.save(role);
        log.info("Assigned {} permissions to role: {}", permissionIds.size(), role.getCode());
        
        return convertToDetailResponse(role);
    }

    @Override
    public RoleDetailResponse removePermissions(Long roleId, List<Long> permissionIds) {
        Role role = roleRepository.findByIdWithPermissions(roleId)
                .orElseThrow(() -> new BusinessException("角色不存在"));

        role.getPermissions().removeIf(permission -> permissionIds.contains(permission.getId()));
        role.setUpdatedBy(getCurrentUserId());
        role.setUpdatedAt(LocalDateTime.now());

        role = roleRepository.save(role);
        log.info("Removed {} permissions from role: {}", permissionIds.size(), role.getCode());
        
        return convertToDetailResponse(role);
    }

    @Override
    public void assignUsersToRole(Long roleId, List<Long> userIds) {
        Role role = roleRepository.findByIdWithUsers(roleId)
                .orElseThrow(() -> new BusinessException("角色不存在"));

        List<User> users = userRepository.findAllById(userIds);
        role.getUsers().addAll(users);

        roleRepository.save(role);
        log.info("Assigned {} users to role: {}", userIds.size(), role.getCode());
    }

    @Override
    public void removeUsersFromRole(Long roleId, List<Long> userIds) {
        Role role = roleRepository.findByIdWithUsers(roleId)
                .orElseThrow(() -> new BusinessException("角色不存在"));

        role.getUsers().removeIf(user -> userIds.contains(user.getId()));

        roleRepository.save(role);
        log.info("Removed {} users from role: {}", userIds.size(), role.getCode());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getRolePermissions(Long roleId) {
        Role role = roleRepository.findByIdWithPermissions(roleId)
                .orElseThrow(() -> new BusinessException("角色不存在"));
        
        return role.getPermissions().stream()
                .map(Permission::getId)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getRoleUsers(Long roleId) {
        Role role = roleRepository.findByIdWithUsers(roleId)
                .orElseThrow(() -> new BusinessException("角色不存在"));
        
        return role.getUsers().stream()
                .map(User::getId)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isRoleCodeAvailable(String code, Long excludeId) {
        if (excludeId != null) {
            return !roleRepository.existsByCodeAndIdNot(code, excludeId);
        }
        return !roleRepository.existsByCode(code);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isRoleNameAvailable(String name, Long excludeId) {
        if (excludeId != null) {
            return !roleRepository.existsByNameAndIdNot(name, excludeId);
        }
        return !roleRepository.existsByName(name);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canDeleteRole(Long roleId) {
        Role role = roleRepository.findByIdWithUsers(roleId)
                .orElseThrow(() -> new BusinessException("角色不存在"));
        
        return !Boolean.TRUE.equals(role.getIsSystem()) && role.getUsers().isEmpty();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getRoleStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalRoles = roleRepository.count();
        long systemRoles = roleRepository.countByIsSystem(true);
        long customRoles = roleRepository.countByIsSystem(false);
        long enabledRoles = roleRepository.countByEnabled(true);
        long disabledRoles = roleRepository.countByEnabled(false);
        
        stats.put("total", totalRoles);
        stats.put("system", systemRoles);
        stats.put("custom", customRoles);
        stats.put("enabled", enabledRoles);
        stats.put("disabled", disabledRoles);
        
        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleListResponse> getUserRoles(Long userId) {
        List<Role> roles = roleRepository.findByUserId(userId);
        return roles.stream()
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RoleDetailResponse copyRole(Long roleId, String newCode, String newName) {
        Role originalRole = roleRepository.findByIdWithPermissions(roleId)
                .orElseThrow(() -> new BusinessException("原角色不存在"));

        // 验证新代码和名称唯一性
        if (roleRepository.existsByCode(newCode)) {
            throw new BusinessException("角色代码已存在");
        }
        if (roleRepository.existsByName(newName)) {
            throw new BusinessException("角色名称已存在");
        }

        Role newRole = new Role();
        BeanUtils.copyProperties(originalRole, newRole, "id", "code", "name", "users", "createdAt", "updatedAt", "createdBy", "updatedBy");
        newRole.setCode(newCode);
        newRole.setName(newName);
        newRole.setIsSystem(false);
        newRole.setCreatedBy(getCurrentUserId());
        newRole.setCreatedAt(LocalDateTime.now());

        // 复制权限
        newRole.setPermissions(new HashSet<>(originalRole.getPermissions()));

        newRole = roleRepository.save(newRole);
        log.info("Copied role from {} to {}", originalRole.getCode(), newRole.getCode());
        
        return convertToDetailResponse(newRole);
    }

    @Override
    public void batchDeleteRoles(List<Long> roleIds) {
        List<Role> roles = roleRepository.findAllById(roleIds);
        
        for (Role role : roles) {
            if (Boolean.TRUE.equals(role.getIsSystem())) {
                throw new BusinessException("系统角色不允许删除: " + role.getName());
            }
            if (!role.getUsers().isEmpty()) {
                throw new BusinessException("角色已分配给用户，无法删除: " + role.getName());
            }
        }

        roleRepository.deleteAll(roles);
        log.info("Batch deleted {} roles", roleIds.size());
    }

    @Override
    public void batchToggleRoleStatus(List<Long> roleIds, Boolean enabled) {
        List<Role> roles = roleRepository.findAllById(roleIds);
        
        for (Role role : roles) {
            if (Boolean.TRUE.equals(role.getIsSystem()) && Boolean.FALSE.equals(enabled)) {
                throw new BusinessException("系统角色不允许禁用: " + role.getName());
            }
            role.setEnabled(enabled);
            role.setUpdatedBy(getCurrentUserId());
            role.setUpdatedAt(LocalDateTime.now());
        }

        roleRepository.saveAll(roles);
        log.info("Batch toggled status for {} roles to {}", roleIds.size(), enabled);
    }

    @Override
    public byte[] exportRoles(String organizationType, Boolean enabled) {
        // TODO: 实现角色数据导出功能
        throw new BusinessException("导出功能暂未实现");
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleListResponse> getSystemRoles() {
        List<Role> roles = roleRepository.findByIsSystemTrueOrderByCreatedAtDesc();
        return roles.stream()
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleListResponse> getCustomRoles() {
        List<Role> roles = roleRepository.findByIsSystemFalseOrderByCreatedAtDesc();
        return roles.stream()
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
    }

    // 私有方法

    private Specification<Role> buildSpecification(String keyword, String organizationType, Boolean enabled, Boolean isSystem) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(keyword)) {
                String pattern = "%" + keyword + "%";
                Predicate namePredicate = criteriaBuilder.like(root.get("name"), pattern);
                Predicate codePredicate = criteriaBuilder.like(root.get("code"), pattern);
                Predicate descriptionPredicate = criteriaBuilder.like(root.get("description"), pattern);
                predicates.add(criteriaBuilder.or(namePredicate, codePredicate, descriptionPredicate));
            }

            if (StringUtils.hasText(organizationType)) {
                predicates.add(criteriaBuilder.equal(root.get("organizationType"), organizationType));
            }

            if (enabled != null) {
                predicates.add(criteriaBuilder.equal(root.get("enabled"), enabled));
            }

            if (isSystem != null) {
                predicates.add(criteriaBuilder.equal(root.get("isSystem"), isSystem));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private RoleListResponse convertToListResponse(Role role) {
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

    private RoleDetailResponse convertToDetailResponse(Role role) {
        List<PermissionListResponse> permissions = role.getPermissions() != null 
                ? role.getPermissions().stream()
                    .map(this::convertPermissionToListResponse)
                    .collect(Collectors.toList())
                : new ArrayList<>();

        List<UserSimpleResponse> users = role.getUsers() != null
                ? role.getUsers().stream()
                    .map(this::convertUserToSimpleResponse)
                    .collect(Collectors.toList())
                : new ArrayList<>();

        return RoleDetailResponse.builder()
                .id(role.getId())
                .code(role.getCode())
                .name(role.getName())
                .description(role.getDescription())
                .organizationType(role.getOrganizationType())
                .organizationTypeName(getOrganizationTypeName(role.getOrganizationType()))
                .isSystem(role.getIsSystem())
                .enabled(role.getEnabled())
                .sortOrder(role.getSortOrder())
                .permissions(permissions)
                .users(users)
                .createdBy(role.getCreatedBy())
                .createdByName(getUserName(role.getCreatedBy()))
                .updatedBy(role.getUpdatedBy())
                .updatedByName(getUserName(role.getUpdatedBy()))
                .createdAt(role.getCreatedAt())
                .updatedAt(role.getUpdatedAt())
                .build();
    }

    private PermissionListResponse convertPermissionToListResponse(Permission permission) {
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

    private UserSimpleResponse convertUserToSimpleResponse(User user) {
        return UserSimpleResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .realName(user.getRealName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .organizationId(user.getOrganization() != null ? user.getOrganization().getId() : null)
                .organizationName(user.getOrganization() != null ? user.getOrganization().getName() : null)
                .enabled(user.getEnabled())
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
}