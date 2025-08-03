package com.drmp.controller;

import com.drmp.dto.response.ApiResponse;
import com.drmp.dto.LoginRequest;
import com.drmp.dto.LoginResponse;
import com.drmp.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import lombok.Data;

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
        if (token != null) {
            authService.logout(token);
        }
        
        return ResponseEntity.ok(ApiResponse.successWithMessage("登出成功"));
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
}