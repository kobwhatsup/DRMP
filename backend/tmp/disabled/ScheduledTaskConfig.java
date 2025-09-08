package com.drmp.config;

import com.drmp.auth.UnifiedAuthenticationManager;
import com.drmp.gateway.ApiGatewayMetrics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

/**
 * 定时任务配置
 * 用于清理过期数据和维护系统状态
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Configuration
@EnableScheduling
@RequiredArgsConstructor
public class ScheduledTaskConfig {

    private final UnifiedAuthenticationManager authManager;
    private final ApiGatewayMetrics gatewayMetrics;

    /**
     * 每5分钟清理一次过期会话
     */
    @Scheduled(fixedRate = 300000) // 5分钟
    public void cleanupExpiredSessions() {
        try {
            log.debug("Starting scheduled cleanup of expired sessions");
            authManager.cleanupExpiredSessions();
            log.debug("Completed scheduled cleanup of expired sessions");
        } catch (Exception e) {
            log.error("Failed to cleanup expired sessions", e);
        }
    }

    /**
     * 每10分钟清理一次网关过期数据
     */
    @Scheduled(fixedRate = 600000) // 10分钟
    public void cleanupGatewayMetrics() {
        try {
            log.debug("Starting scheduled cleanup of gateway metrics");
            gatewayMetrics.cleanupExpiredData();
            log.debug("Completed scheduled cleanup of gateway metrics");
        } catch (Exception e) {
            log.error("Failed to cleanup gateway metrics", e);
        }
    }

    /**
     * 每小时记录一次系统状态
     */
    @Scheduled(fixedRate = 3600000) // 1小时
    public void logSystemStatus() {
        try {
            // 记录网关状态
            ApiGatewayMetrics.GatewayStats gatewayStats = gatewayMetrics.getStats();
            log.info("Gateway Status - Total Requests: {}, Success Rate: {:.2f}%, Active Connections: {}", 
                gatewayStats.totalRequests, gatewayStats.successRate, gatewayStats.activeConnections);

            // 记录认证状态
            UnifiedAuthenticationManager.AuthenticationStats authStats = authManager.getStats();
            log.info("Auth Status - Active Sessions: {}, Blacklisted Tokens: {}", 
                authStats.activeSessionCount, authStats.blacklistedTokenCount);

            // 记录内存使用情况
            Runtime runtime = Runtime.getRuntime();
            long totalMemory = runtime.totalMemory();
            long freeMemory = runtime.freeMemory();
            long usedMemory = totalMemory - freeMemory;
            double memoryUsage = (double) usedMemory / runtime.maxMemory() * 100;
            
            log.info("System Memory - Used: {} MB ({:.2f}%), Total: {} MB, Max: {} MB",
                usedMemory / 1024 / 1024, memoryUsage, totalMemory / 1024 / 1024, runtime.maxMemory() / 1024 / 1024);

        } catch (Exception e) {
            log.error("Failed to log system status", e);
        }
    }

    /**
     * 每天凌晨2点进行系统维护（深度清理）
     */
    @Scheduled(cron = "0 0 2 * * ?") // 每天凌晨2点
    public void dailyMaintenance() {
        try {
            log.info("Starting daily system maintenance");

            // 强制垃圾回收
            System.gc();
            Thread.sleep(1000);

            // 深度清理
            authManager.cleanupExpiredSessions();
            gatewayMetrics.cleanupExpiredData();

            log.info("Daily system maintenance completed");

        } catch (Exception e) {
            log.error("Daily maintenance failed", e);
        }
    }
}