package com.drmp.controller;

import com.drmp.entity.User;
import com.drmp.entity.enums.UserStatus;
import com.drmp.security.JwtTokenProvider;
import com.drmp.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Development Controller - Only available in local profile
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/v1/dev")
@RequiredArgsConstructor
@Profile("local")
public class DevController {

    private final JwtTokenProvider tokenProvider;

    /**
     * Generate development JWT token
     */
    @PostMapping("/auth/token")
    public ResponseEntity<?> generateDevToken() {
        try {
            // Create a mock admin user
            User mockUser = new User();
            mockUser.setId(1L);
            mockUser.setUsername("admin");
            mockUser.setEmail("admin@drmp.com");
            mockUser.setRealName("系统管理员");
            mockUser.setPhone("13800000000");
            mockUser.setStatus(UserStatus.ACTIVE);
            mockUser.setCreatedAt(LocalDateTime.now());
            mockUser.setUpdatedAt(LocalDateTime.now());

            // Create UserPrincipal with admin permissions
            Set<String> permissions = Set.of(
                "user:read", "user:create", "user:update", "user:delete",
                "organization:read", "organization:create", "organization:update", "organization:delete", "organization:approve",
                "case_package:read", "case_package:create", "case_package:update", "case_package:delete", "case_package:assign",
                "case:read", "case:update",
                "report:read", "report:export",
                "system:config", "system:log"
            );
            
            UserPrincipal userPrincipal = UserPrincipal.builder()
                .id(mockUser.getId())
                .username(mockUser.getUsername())
                .email(mockUser.getEmail())
                .password("dev-password")
                .organizationId(1L)
                .organizationType("SYSTEM")
                .authorities(permissions.stream()
                    .map(org.springframework.security.core.authority.SimpleGrantedAuthority::new)
                    .collect(java.util.stream.Collectors.toList()))
                .build();

            // Create authentication
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                userPrincipal, null, userPrincipal.getAuthorities()
            );

            // Generate tokens
            String accessToken = tokenProvider.generateToken(authentication);
            String refreshToken = tokenProvider.generateRefreshToken(mockUser.getId(), mockUser.getUsername());

            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", mockUser.getId());
            userInfo.put("username", mockUser.getUsername());
            userInfo.put("email", mockUser.getEmail());
            userInfo.put("realName", mockUser.getRealName());
            userInfo.put("phone", mockUser.getPhone());
            userInfo.put("avatar", "");
            userInfo.put("organizationId", 1);
            userInfo.put("organizationName", "DRMP系统管理");
            userInfo.put("organizationType", "SYSTEM");
            userInfo.put("roles", Set.of("ADMIN"));
            userInfo.put("permissions", permissions);

            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            response.put("tokenType", "Bearer");
            response.put("expiresIn", 7200); // 2 hours
            response.put("userInfo", userInfo);

            log.info("Generated development JWT token for admin user");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to generate development token", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to generate development token"));
        }
    }
}