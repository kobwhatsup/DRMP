package com.drmp.controller.system;

import com.drmp.auth.UnifiedAuthenticationManager;
import com.drmp.auth.UserSession;
import com.drmp.dto.response.ApiResponse;
import com.drmp.gateway.ApiGatewayMetrics;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 网关管理控制器
 * 提供API网关状态监控、会话管理等功能
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Tag(name = "网关管理", description = "API网关状态监控和管理")
@RestController
@RequestMapping("/v1/system/gateway")
@RequiredArgsConstructor
@Slf4j
public class GatewayManagementController {

    private final ApiGatewayMetrics gatewayMetrics;
    private final UnifiedAuthenticationManager authManager;

    @Operation(summary = "获取网关状态", description = "获取API网关的运行状态和统计信息")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/status")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getGatewayStatus() {
        try {
            Map<String, Object> status = new HashMap<>();
            
            // 网关指标
            ApiGatewayMetrics.GatewayStats gatewayStats = gatewayMetrics.getStats();
            status.put("requests", Map.of(
                "total", gatewayStats.totalRequests,
                "successful", gatewayStats.successfulRequests,
                "failed", gatewayStats.failedRequests,
                "unauthorized", gatewayStats.unauthorizedRequests,
                "rateLimited", gatewayStats.rateLimitedRequests,
                "successRate", gatewayStats.successRate
            ));
            
            status.put("performance", Map.of(
                "averageResponseTime", gatewayStats.averageResponseTime,
                "maxResponseTime", gatewayStats.maxResponseTime,
                "minResponseTime", gatewayStats.minResponseTime
            ));
            
            // 认证统计
            UnifiedAuthenticationManager.AuthenticationStats authStats = authManager.getStats();
            status.put("authentication", Map.of(
                "activeSessions", authStats.activeSessionCount,
                "blacklistedTokens", authStats.blacklistedTokenCount,
                "sessionsByBrowser", authStats.sessionsByUserAgent
            ));
            
            // 系统信息
            Runtime runtime = Runtime.getRuntime();
            status.put("system", Map.of(
                "timestamp", System.currentTimeMillis(),
                "uptime", getSystemUptime(),
                "memory", Map.of(
                    "total", runtime.totalMemory(),
                    "free", runtime.freeMemory(),
                    "used", runtime.totalMemory() - runtime.freeMemory(),
                    "max", runtime.maxMemory()
                )
            ));
            
            return ResponseEntity.ok(ApiResponse.success(status));
            
        } catch (Exception e) {
            log.error("Failed to get gateway status", e);
            return ResponseEntity.ok(ApiResponse.error("获取网关状态失败: " + e.getMessage()));
        }
    }

    @Operation(summary = "获取路径统计", description = "获取各API路径的详细统计信息")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/paths/stats")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, ApiGatewayMetrics.PathMetrics>>> getPathStats() {
        try {
            Map<String, ApiGatewayMetrics.PathMetrics> pathStats = gatewayMetrics.getPathMetrics();
            return ResponseEntity.ok(ApiResponse.success(pathStats));
        } catch (Exception e) {
            log.error("Failed to get path statistics", e);
            return ResponseEntity.ok(ApiResponse.error("获取路径统计失败: " + e.getMessage()));
        }
    }

    @Operation(summary = "获取活跃会话", description = "获取指定用户的活跃会话列表")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/sessions/{userId}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<ApiResponse<List<UserSession>>> getUserSessions(@PathVariable Long userId) {
        try {
            List<UserSession> sessions = authManager.getActiveSessions(userId);
            return ResponseEntity.ok(ApiResponse.success(sessions));
        } catch (Exception e) {
            log.error("Failed to get user sessions for user: {}", userId, e);
            return ResponseEntity.ok(ApiResponse.error("获取用户会话失败: " + e.getMessage()));
        }
    }

    @Operation(summary = "终止用户会话", description = "终止指定用户的所有会话")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/sessions/{userId}/terminate")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> terminateUserSessions(@PathVariable Long userId) {
        try {
            authManager.logoutAllSessions(userId);
            log.info("All sessions terminated for user: {} by admin", userId);
            return ResponseEntity.ok(ApiResponse.success(null, "用户会话已全部终止"));
        } catch (Exception e) {
            log.error("Failed to terminate sessions for user: {}", userId, e);
            return ResponseEntity.ok(ApiResponse.error("终止用户会话失败: " + e.getMessage()));
        }
    }

    @Operation(summary = "清理过期数据", description = "手动触发网关过期数据清理")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/cleanup")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> cleanupExpiredData() {
        try {
            long startTime = System.currentTimeMillis();
            
            // 清理过期会话
            authManager.cleanupExpiredSessions();
            
            // 清理网关指标
            gatewayMetrics.cleanupExpiredData();
            
            long duration = System.currentTimeMillis() - startTime;
            
            Map<String, Object> result = Map.of(
                "success", true,
                "duration", duration + "ms",
                "timestamp", System.currentTimeMillis()
            );
            
            return ResponseEntity.ok(ApiResponse.success(result, "过期数据清理完成"));
            
        } catch (Exception e) {
            log.error("Failed to cleanup expired data", e);
            return ResponseEntity.ok(ApiResponse.error("清理过期数据失败: " + e.getMessage()));
        }
    }

    @Operation(summary = "网关健康检查", description = "检查网关各组件的健康状态")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/health")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        try {
            Map<String, Object> health = new HashMap<>();
            
            // 检查网关指标收集器
            try {
                gatewayMetrics.getStats();
                health.put("metrics", "UP");
            } catch (Exception e) {
                health.put("metrics", "DOWN");
                health.put("metricsError", e.getMessage());
            }
            
            // 检查认证管理器
            try {
                authManager.getStats();
                health.put("authentication", "UP");
            } catch (Exception e) {
                health.put("authentication", "DOWN");
                health.put("authError", e.getMessage());
            }
            
            // 检查内存使用情况
            Runtime runtime = Runtime.getRuntime();
            double memoryUsage = (double)(runtime.totalMemory() - runtime.freeMemory()) / runtime.maxMemory() * 100;
            health.put("memoryUsage", memoryUsage);
            health.put("memoryStatus", memoryUsage > 90 ? "WARNING" : "OK");
            
            // 整体状态
            boolean isHealthy = "UP".equals(health.get("metrics")) && 
                               "UP".equals(health.get("authentication")) &&
                               memoryUsage < 95;
            
            health.put("overall", isHealthy ? "UP" : "DOWN");
            health.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(ApiResponse.success(health));
            
        } catch (Exception e) {
            log.error("Health check failed", e);
            return ResponseEntity.ok(ApiResponse.error("健康检查失败: " + e.getMessage()));
        }
    }

    /**
     * 获取系统运行时间
     */
    private long getSystemUptime() {
        return System.currentTimeMillis() - getStartTime();
    }

    /**
     * 获取系统启动时间（简化实现）
     */
    private long getStartTime() {
        // 在实际应用中，应该在应用启动时记录启动时间
        return System.currentTimeMillis() - Runtime.getRuntime().totalMemory() / 1024 / 1024;
    }
}