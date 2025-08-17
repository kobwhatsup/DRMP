package com.drmp.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Security Utilities
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public class SecurityUtils {

    private SecurityUtils() {
        // Utility class
    }

    /**
     * 获取当前用户ID
     * 
     * @return 用户ID
     */
    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        // TODO: 根据实际的用户认证机制返回用户ID
        // 这里假设authentication.getName()返回用户ID
        try {
            return Long.valueOf(authentication.getName());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * 获取当前用户名
     * 
     * @return 用户名
     */
    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        return authentication.getName();
    }

    /**
     * 获取当前用户姓名（别名方法）
     * 
     * @return 用户姓名
     */
    public static String getCurrentUserName() {
        return getCurrentUsername();
    }

    /**
     * 获取当前用户所属机构ID
     * 
     * @return 机构ID
     */
    public static Long getCurrentUserOrganizationId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        // TODO: 从用户信息中获取机构ID
        // 这里暂时返回模拟值，实际实现需要根据认证机制获取
        return 1L; // 临时返回机构ID 1
    }
    
    /**
     * 获取当前用户所属机构ID（别名方法）
     * 
     * @return 机构ID
     */
    public static Long getCurrentOrgId() {
        return getCurrentUserOrganizationId();
    }

    /**
     * 检查当前用户是否有指定角色
     * 
     * @param role 角色名
     * @return 是否有该角色
     */
    public static boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        return authentication.getAuthorities().stream()
            .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role));
    }

    /**
     * 检查当前用户是否有指定权限
     * 
     * @param permission 权限名
     * @return 是否有该权限
     */
    public static boolean hasPermission(String permission) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        return authentication.getAuthorities().stream()
            .anyMatch(authority -> authority.getAuthority().equals(permission));
    }
}