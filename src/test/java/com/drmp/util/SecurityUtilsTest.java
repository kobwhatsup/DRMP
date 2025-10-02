package com.drmp.util;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("SecurityUtils 测试")
class SecurityUtilsTest {

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("getCurrentUserId - 应从认证信息获取用户ID")
    void getCurrentUserId_ShouldReturnUserIdFromAuthentication() {
        Authentication auth = new UsernamePasswordAuthenticationToken("12345", "password");
        SecurityContextHolder.getContext().setAuthentication(auth);
        
        Long userId = SecurityUtils.getCurrentUserId();
        assertEquals(12345L, userId);
    }

    @Test
    @DisplayName("getCurrentUserId - 无认证应返回null")
    void getCurrentUserId_ShouldReturnNullWhenNoAuthentication() {
        SecurityContextHolder.clearContext();
        assertNull(SecurityUtils.getCurrentUserId());
    }

    @Test
    @DisplayName("getCurrentUserId - 非数字用户名应返回null")
    void getCurrentUserId_ShouldReturnNullForNonNumericUsername() {
        Authentication auth = new UsernamePasswordAuthenticationToken("username", "password");
        SecurityContextHolder.getContext().setAuthentication(auth);
        
        assertNull(SecurityUtils.getCurrentUserId());
    }

    @Test
    @DisplayName("getCurrentUsername - 应返回当前用户名")
    void getCurrentUsername_ShouldReturnUsername() {
        Authentication auth = new UsernamePasswordAuthenticationToken("testuser", "password");
        SecurityContextHolder.getContext().setAuthentication(auth);
        
        assertEquals("testuser", SecurityUtils.getCurrentUsername());
    }

    @Test
    @DisplayName("hasRole - 应正确检查角色")
    void hasRole_ShouldCheckRoleCorrectly() {
        Authentication auth = new UsernamePasswordAuthenticationToken(
            "testuser", 
            "password",
            Arrays.asList(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
        
        assertTrue(SecurityUtils.hasRole("ADMIN"));
        assertFalse(SecurityUtils.hasRole("USER"));
    }

    @Test
    @DisplayName("hasPermission - 应正确检查权限")
    void hasPermission_ShouldCheckPermissionCorrectly() {
        Authentication auth = new UsernamePasswordAuthenticationToken(
            "testuser", 
            "password",
            Arrays.asList(new SimpleGrantedAuthority("system:user:read"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
        
        assertTrue(SecurityUtils.hasPermission("system:user:read"));
        assertFalse(SecurityUtils.hasPermission("system:user:delete"));
    }
}
