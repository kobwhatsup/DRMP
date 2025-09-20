package com.drmp.service.system.impl;

import com.drmp.dto.request.system.UserCreateRequest;
import com.drmp.dto.request.system.UserQueryRequest;
import com.drmp.dto.request.system.UserUpdateRequest;
import com.drmp.dto.response.system.UserResponse;
import com.drmp.entity.system.SysUser;
import com.drmp.entity.system.SysRole;
import com.drmp.entity.system.SysUserRole;
import com.drmp.repository.system.SysUserRepository;
import com.drmp.repository.system.SysRoleRepository;
import com.drmp.service.system.SysUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.persistence.criteria.Predicate;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 系统用户服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SysUserServiceImpl implements SysUserService {

    private final SysUserRepository userRepository;
    private final SysRoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;

    @Override
    public Page<UserResponse> getUsers(UserQueryRequest request) {
        Specification<SysUser> spec = buildUserSpecification(request);
        
        Pageable pageable = PageRequest.of(
            request.getPage() - 1,
            request.getSize(),
            Sort.by(
                "ASC".equalsIgnoreCase(request.getSortDirection()) ? Sort.Direction.ASC : Sort.Direction.DESC,
                StringUtils.hasText(request.getSortBy()) ? request.getSortBy() : "createdAt"
            )
        );
        
        Page<SysUser> userPage = userRepository.findAll(spec, pageable);
        
        return userPage.map(this::convertToUserResponse);
    }

    @Override
    public UserResponse getUserById(Long id) {
        SysUser user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        return convertToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse createUser(UserCreateRequest request, Long operatorId) {
        // 检查用户名是否已存在
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("用户名已存在");
        }
        
        // 检查邮箱是否已存在
        if (StringUtils.hasText(request.getEmail()) && 
            userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("邮箱已存在");
        }
        
        // 检查手机号是否已存在
        if (StringUtils.hasText(request.getPhone()) && 
            userRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new RuntimeException("手机号已存在");
        }

        SysUser user = new SysUser();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRealName(request.getRealName());
        user.setAvatarUrl(request.getAvatarUrl());
        user.setOrganizationId(request.getOrganizationId());
        user.setUserType(SysUser.UserType.valueOf(request.getUserType()));
        user.setStatus(StringUtils.hasText(request.getStatus()) ? 
            SysUser.Status.valueOf(request.getStatus()) : SysUser.Status.PENDING);
        user.setCreatedBy(operatorId);
        user.setUpdatedBy(operatorId);
        
        user = userRepository.save(user);
        
        // 分配角色
        if (request.getRoleIds() != null && request.getRoleIds().length > 0) {
            assignRoles(user.getId(), request.getRoleIds(), operatorId);
        }
        
        log.info("创建用户成功: username={}, operatorId={}", request.getUsername(), operatorId);
        
        return convertToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request, Long operatorId) {
        SysUser user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        // 检查邮箱是否已存在
        if (StringUtils.hasText(request.getEmail()) && 
            userRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
            throw new RuntimeException("邮箱已存在");
        }
        
        // 检查手机号是否已存在
        if (StringUtils.hasText(request.getPhone()) && 
            userRepository.existsByPhoneAndIdNot(request.getPhone(), id)) {
            throw new RuntimeException("手机号已存在");
        }

        // 更新用户信息
        if (StringUtils.hasText(request.getEmail())) {
            user.setEmail(request.getEmail());
        }
        if (StringUtils.hasText(request.getPhone())) {
            user.setPhone(request.getPhone());
        }
        if (StringUtils.hasText(request.getRealName())) {
            user.setRealName(request.getRealName());
        }
        if (StringUtils.hasText(request.getAvatarUrl())) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getOrganizationId() != null) {
            user.setOrganizationId(request.getOrganizationId());
        }
        if (StringUtils.hasText(request.getUserType())) {
            user.setUserType(SysUser.UserType.valueOf(request.getUserType()));
        }
        if (StringUtils.hasText(request.getStatus())) {
            user.setStatus(SysUser.Status.valueOf(request.getStatus()));
        }
        if (request.getEmailVerified() != null) {
            user.setEmailVerified(request.getEmailVerified());
        }
        if (request.getPhoneVerified() != null) {
            user.setPhoneVerified(request.getPhoneVerified());
        }
        if (request.getTwoFactorEnabled() != null) {
            user.setTwoFactorEnabled(request.getTwoFactorEnabled());
        }
        
        user.setUpdatedBy(operatorId);
        user = userRepository.save(user);
        
        // 更新角色
        if (request.getRoleIds() != null) {
            // 先删除所有角色关联
            removeAllRoles(user.getId());
            // 重新分配角色
            if (request.getRoleIds().length > 0) {
                assignRoles(user.getId(), request.getRoleIds(), operatorId);
            }
        }
        
        log.info("更新用户成功: userId={}, operatorId={}", id, operatorId);
        
        return convertToUserResponse(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long id, Long operatorId) {
        SysUser user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        // 删除用户角色关联
        removeAllRoles(id);
        
        // 删除用户
        userRepository.delete(user);
        
        log.info("删除用户成功: userId={}, operatorId={}", id, operatorId);
    }

    @Override
    @Transactional
    public void deleteUsers(Long[] ids, Long operatorId) {
        for (Long id : ids) {
            deleteUser(id, operatorId);
        }
    }

    @Override
    @Transactional
    public void enableUser(Long id, Long operatorId) {
        updateUserStatus(id, SysUser.Status.ACTIVE, operatorId);
    }

    @Override
    @Transactional
    public void disableUser(Long id, Long operatorId) {
        updateUserStatus(id, SysUser.Status.DISABLED, operatorId);
    }

    @Override
    @Transactional
    public void lockUser(Long id, Long operatorId) {
        updateUserStatus(id, SysUser.Status.LOCKED, operatorId);
    }

    @Override
    @Transactional
    public void unlockUser(Long id, Long operatorId) {
        updateUserStatus(id, SysUser.Status.ACTIVE, operatorId);
        resetLoginFailureCount(id);
    }

    @Override
    @Transactional
    public String resetPassword(Long id, Long operatorId) {
        SysUser user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        // 生成随机密码
        String newPassword = generateRandomPassword();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordChangedAt(LocalDateTime.now());
        user.setUpdatedBy(operatorId);
        userRepository.save(user);
        
        log.info("重置用户密码成功: userId={}, operatorId={}", id, operatorId);
        
        return newPassword;
    }

    @Override
    @Transactional
    public void assignRoles(Long userId, Long[] roleIds, Long operatorId) {
        for (Long roleId : roleIds) {
            // 检查角色是否存在
            if (!roleRepository.existsById(roleId)) {
                throw new RuntimeException("角色不存在: " + roleId);
            }
            
            // 创建用户角色关联
            String sql = "INSERT INTO sys_user_roles (user_id, role_id, created_by) VALUES (?, ?, ?)";
            Query query = entityManager.createNativeQuery(sql);
            query.setParameter(1, userId);
            query.setParameter(2, roleId);
            query.setParameter(3, operatorId);
            query.executeUpdate();
        }
        
        log.info("分配角色成功: userId={}, roleIds={}, operatorId={}", userId, roleIds, operatorId);
    }

    @Override
    @Transactional
    public void removeRoles(Long userId, Long[] roleIds, Long operatorId) {
        for (Long roleId : roleIds) {
            String sql = "DELETE FROM sys_user_roles WHERE user_id = ? AND role_id = ?";
            Query query = entityManager.createNativeQuery(sql);
            query.setParameter(1, userId);
            query.setParameter(2, roleId);
            query.executeUpdate();
        }
        
        log.info("移除角色成功: userId={}, roleIds={}, operatorId={}", userId, roleIds, operatorId);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    @Override
    public boolean existsByPhone(String phone) {
        return userRepository.findByPhone(phone).isPresent();
    }

    @Override
    public UserResponse getUserByUsername(String username) {
        SysUser user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        return convertToUserResponse(user);
    }

    @Override
    @Transactional
    public void updateLastLoginInfo(Long userId, String loginIp) {
        userRepository.updateLastLoginInfo(userId, LocalDateTime.now(), loginIp);
    }

    @Override
    @Transactional
    public void incrementLoginFailureCount(Long userId) {
        SysUser user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            user.setLoginFailureCount(user.getLoginFailureCount() + 1);
            userRepository.save(user);
        }
    }

    @Override
    @Transactional
    public void resetLoginFailureCount(Long userId) {
        userRepository.resetLoginFailureCount(userId);
    }

    @Override
    public UserStatistics getUserStatistics() {
        return new UserStatistics() {
            @Override
            public long getTotalUsers() {
                return userRepository.count();
            }

            @Override
            public long getActiveUsers() {
                return userRepository.countByStatus(SysUser.Status.ACTIVE);
            }

            @Override
            public long getDisabledUsers() {
                return userRepository.countByStatus(SysUser.Status.DISABLED);
            }

            @Override
            public long getLockedUsers() {
                return userRepository.countByStatus(SysUser.Status.LOCKED);
            }

            @Override
            public long getPendingUsers() {
                return userRepository.countByStatus(SysUser.Status.PENDING);
            }

            @Override
            public long getTodayNewUsers() {
                LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
                LocalDateTime endOfDay = startOfDay.plusDays(1);
                return userRepository.findUsersCreatedBetween(startOfDay, endOfDay, Pageable.unpaged()).getTotalElements();
            }

            @Override
            public long getOnlineUsers() {
                // 这里需要根据实际的在线用户统计逻辑实现
                // 可以通过Redis会话或其他方式统计
                return 0;
            }
        };
    }

    // ========== 私有方法 ==========

    private Specification<SysUser> buildUserSpecification(UserQueryRequest request) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(request.getUsername())) {
                predicates.add(criteriaBuilder.like(root.get("username"), "%" + request.getUsername() + "%"));
            }
            if (StringUtils.hasText(request.getEmail())) {
                predicates.add(criteriaBuilder.like(root.get("email"), "%" + request.getEmail() + "%"));
            }
            if (StringUtils.hasText(request.getPhone())) {
                predicates.add(criteriaBuilder.like(root.get("phone"), "%" + request.getPhone() + "%"));
            }
            if (StringUtils.hasText(request.getRealName())) {
                predicates.add(criteriaBuilder.like(root.get("realName"), "%" + request.getRealName() + "%"));
            }
            if (request.getOrganizationId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("organizationId"), request.getOrganizationId()));
            }
            if (StringUtils.hasText(request.getUserType())) {
                predicates.add(criteriaBuilder.equal(root.get("userType"), SysUser.UserType.valueOf(request.getUserType())));
            }
            if (StringUtils.hasText(request.getStatus())) {
                predicates.add(criteriaBuilder.equal(root.get("status"), SysUser.Status.valueOf(request.getStatus())));
            }
            if (StringUtils.hasText(request.getStartDate()) && StringUtils.hasText(request.getEndDate())) {
                predicates.add(criteriaBuilder.between(root.get("createdAt"), 
                    LocalDate.parse(request.getStartDate()).atStartOfDay(),
                    LocalDate.parse(request.getEndDate()).atTime(23, 59, 59)));
            }
            if (StringUtils.hasText(request.getKeyword())) {
                String keyword = "%" + request.getKeyword() + "%";
                Predicate usernamePredicate = criteriaBuilder.like(root.get("username"), keyword);
                Predicate realNamePredicate = criteriaBuilder.like(root.get("realName"), keyword);
                Predicate emailPredicate = criteriaBuilder.like(root.get("email"), keyword);
                predicates.add(criteriaBuilder.or(usernamePredicate, realNamePredicate, emailPredicate));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private UserResponse convertToUserResponse(SysUser user) {
        List<UserResponse.RoleResponse> roles = getUserRoles(user.getId());
        
        return UserResponse.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .phone(user.getPhone())
            .realName(user.getRealName())
            .avatarUrl(user.getAvatarUrl())
            .organizationId(user.getOrganizationId())
            .userType(user.getUserType().name())
            .userTypeDesc(user.getUserType().getDescription())
            .status(user.getStatus().name())
            .statusDesc(user.getStatus().getDescription())
            .lastLoginTime(user.getLastLoginTime())
            .lastLoginIp(user.getLastLoginIp())
            .loginFailureCount(user.getLoginFailureCount())
            .emailVerified(user.getEmailVerified())
            .phoneVerified(user.getPhoneVerified())
            .twoFactorEnabled(user.getTwoFactorEnabled())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .roles(roles)
            .build();
    }

    private List<UserResponse.RoleResponse> getUserRoles(Long userId) {
        List<SysRole> roles = roleRepository.findRolesByUserId(userId);
        return roles.stream()
            .map(role -> UserResponse.RoleResponse.builder()
                .id(role.getId())
                .roleCode(role.getRoleCode())
                .roleName(role.getRoleName())
                .description(role.getDescription())
                .roleType(role.getRoleType().name())
                .status(role.getStatus().name())
                .build())
            .collect(Collectors.toList());
    }

    private void updateUserStatus(Long id, SysUser.Status status, Long operatorId) {
        SysUser user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        user.setStatus(status);
        user.setUpdatedBy(operatorId);
        userRepository.save(user);
        
        log.info("更新用户状态成功: userId={}, status={}, operatorId={}", id, status, operatorId);
    }

    private void removeAllRoles(Long userId) {
        String sql = "DELETE FROM sys_user_roles WHERE user_id = ?";
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter(1, userId);
        query.executeUpdate();
    }

    private String generateRandomPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%";
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();
        
        for (int i = 0; i < 12; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        
        return password.toString();
    }
}