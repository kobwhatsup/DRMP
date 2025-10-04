package com.drmp.controller;

import com.drmp.auth.UnifiedAuthenticationManager;
import com.drmp.auth.UserSession;
import com.drmp.dto.response.ApiResponse;
import com.drmp.dto.LoginRequest;
import com.drmp.dto.LoginResponse;
import com.drmp.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import lombok.Data;
import java.util.List;
import java.util.Map;

/**
 * Authentication Controller
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "认证相关接口")
public class AuthController {

    private final AuthService authService;
    private final UnifiedAuthenticationManager authManager;

    @PostMapping("/login")
    @Operation(summary = "用户登录", description = "用户登录获取访问令牌")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request,
                                                          HttpServletRequest httpRequest) {
        log.info("User login attempt: {}", request.getUsername());
        
        String clientIp = getClientIpAddress(httpRequest);
        LoginResponse response = authService.login(request, clientIp);
        
        log.info("User login successful: {}", request.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "登录成功"));
    }

    @PostMapping("/refresh")
    @Operation(summary = "刷新令牌", description = "使用刷新令牌获取新的访问令牌")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(@RequestBody RefreshTokenRequest request) {
        log.info("Refresh token request");
        
        LoginResponse response = authService.refreshToken(request.getRefreshToken());
        
        return ResponseEntity.ok(ApiResponse.success(response, "令牌刷新成功"));
    }

    @PostMapping("/logout")
    @Operation(summary = "用户登出", description = "用户登出，使令牌失效")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        log.info("User logout request");
        
        String token = extractTokenFromRequest(request);
        String sessionId = request.getHeader("X-Session-ID");
        
        if (token != null) {
            authService.logout(token);
            // 同时使用统一认证管理器登出
            authManager.logout(token, sessionId);
        }
        
        return ResponseEntity.ok(ApiResponse.successWithMessage("登出成功"));
    }

    @PostMapping("/logout-all")
    @Operation(summary = "登出所有会话", description = "终止用户的所有活跃会话")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> logoutAllSessions() {
        try {
            Long userId = authManager.getCurrentUser().getId();
            authManager.logoutAllSessions(userId);
            
            log.info("All sessions terminated for user: {}", userId);
            return ResponseEntity.ok(ApiResponse.successWithMessage("所有会话已终止"));
            
        } catch (Exception e) {
            log.error("Failed to logout all sessions", e);
            return ResponseEntity.ok(ApiResponse.error("终止所有会话失败"));
        }
    }

    @PostMapping("/logout-session/{sessionId}")
    @Operation(summary = "登出指定会话", description = "终止指定的会话")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> logoutSession(@PathVariable String sessionId) {
        try {
            Long userId = authManager.getCurrentUser().getId();
            authManager.logoutSession(sessionId, userId);

            log.info("Session {} terminated for user: {}", sessionId, userId);
            return ResponseEntity.ok(ApiResponse.successWithMessage("会话已终止"));

        } catch (Exception e) {
            log.error("Failed to logout session: {}", sessionId, e);
            return ResponseEntity.ok(ApiResponse.error("终止会话失败"));
        }
    }

    @GetMapping("/sessions")
    @Operation(summary = "获取用户会话", description = "获取当前用户的所有活跃会话")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<UserSession>>> getUserSessions() {
        try {
            Long userId = authManager.getCurrentUser().getId();
            List<UserSession> sessions = authManager.getActiveSessions(userId);
            return ResponseEntity.ok(ApiResponse.success(sessions));

        } catch (Exception e) {
            log.error("Failed to get user sessions", e);
            return ResponseEntity.ok(ApiResponse.error("获取会话信息失败"));
        }
    }

    @GetMapping("/current-user")
    @Operation(summary = "获取当前用户", description = "获取当前认证用户的基本信息")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser() {
        try {
            var currentUser = authManager.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.ok(ApiResponse.error("未找到当前用户信息"));
            }

            Map<String, Object> userInfo = Map.of(
                "id", currentUser.getId(),
                "username", currentUser.getUsername(),
                "realName", currentUser.getRealName(),
                "email", currentUser.getEmail(),
                "organizationId", currentUser.getOrganizationId(),
                "roles", currentUser.getAuthorities().stream()
                    .map(auth -> auth.getAuthority())
                    .toList()
            );

            return ResponseEntity.ok(ApiResponse.success(userInfo));

        } catch (Exception e) {
            log.error("Failed to get current user", e);
            return ResponseEntity.ok(ApiResponse.error("获取用户信息失败"));
        }
    }

    @PostMapping("/validate-token")
    @Operation(summary = "验证Token", description = "验证访问令牌的有效性")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateToken(@RequestBody TokenValidationRequest request) {
        try {
            UnifiedAuthenticationManager.AuthenticationResult result = 
                authManager.authenticateByToken(request.getToken());

            Map<String, Object> validation = Map.of(
                "valid", result.isSuccess(),
                "message", result.isSuccess() ? "Token有效" : result.getErrorMessage(),
                "timestamp", System.currentTimeMillis()
            );

            if (result.isSuccess() && result.getUser() != null) {
                validation = Map.of(
                    "valid", true,
                    "message", "Token有效",
                    "userId", result.getUser().getId(),
                    "username", result.getUser().getUsername(),
                    "timestamp", System.currentTimeMillis()
                );
            }

            return ResponseEntity.ok(ApiResponse.success(validation));

        } catch (Exception e) {
            log.error("Token validation failed", e);
            return ResponseEntity.ok(ApiResponse.error("Token验证失败"));
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0];
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    @Data
    public static class RefreshTokenRequest {
        private String refreshToken;
    }

    @Data
    public static class TokenValidationRequest {
        private String token;
    }
}