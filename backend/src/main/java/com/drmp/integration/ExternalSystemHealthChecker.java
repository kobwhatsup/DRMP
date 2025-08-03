package com.drmp.integration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CompletableFuture;

/**
 * 外部系统健康检查器
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ExternalSystemHealthChecker {

    private final RestTemplate restTemplate;
    private final Map<String, SystemHealthStatus> healthStatusMap = new ConcurrentHashMap<>();

    public enum HealthStatus {
        HEALTHY,
        UNHEALTHY,
        WARNING,
        UNKNOWN
    }

    public static class SystemHealthStatus {
        private String systemName;
        private HealthStatus status;
        private String message;
        private LocalDateTime lastCheckTime;
        private long responseTime;
        private int consecutiveFailures;

        public SystemHealthStatus(String systemName) {
            this.systemName = systemName;
            this.status = HealthStatus.UNKNOWN;
            this.consecutiveFailures = 0;
        }

        // Getters and setters
        public String getSystemName() { return systemName; }
        public void setSystemName(String systemName) { this.systemName = systemName; }
        public HealthStatus getStatus() { return status; }
        public void setStatus(HealthStatus status) { this.status = status; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public LocalDateTime getLastCheckTime() { return lastCheckTime; }
        public void setLastCheckTime(LocalDateTime lastCheckTime) { this.lastCheckTime = lastCheckTime; }
        public long getResponseTime() { return responseTime; }
        public void setResponseTime(long responseTime) { this.responseTime = responseTime; }
        public int getConsecutiveFailures() { return consecutiveFailures; }
        public void setConsecutiveFailures(int consecutiveFailures) { this.consecutiveFailures = consecutiveFailures; }
    }

    /**
     * 检查外部系统健康状态
     */
    public SystemHealthStatus checkSystemHealth(String systemName, String healthCheckUrl) {
        SystemHealthStatus status = healthStatusMap.computeIfAbsent(systemName, SystemHealthStatus::new);
        
        long startTime = System.currentTimeMillis();
        try {
            // 发送健康检查请求
            Map<String, Object> response = restTemplate.getForObject(healthCheckUrl, Map.class);
            long responseTime = System.currentTimeMillis() - startTime;
            
            status.setResponseTime(responseTime);
            status.setLastCheckTime(LocalDateTime.now());
            
            if (response != null && "UP".equals(response.get("status"))) {
                status.setStatus(HealthStatus.HEALTHY);
                status.setMessage("System is healthy");
                status.setConsecutiveFailures(0);
                log.debug("Health check passed for {}: {}ms", systemName, responseTime);
            } else {
                status.setStatus(HealthStatus.WARNING);
                status.setMessage("System responded but status is not UP");
                status.setConsecutiveFailures(status.getConsecutiveFailures() + 1);
                log.warn("Health check warning for {}: status={}", systemName, response != null ? response.get("status") : "null");
            }
            
        } catch (Exception e) {
            long responseTime = System.currentTimeMillis() - startTime;
            status.setResponseTime(responseTime);
            status.setLastCheckTime(LocalDateTime.now());
            status.setStatus(HealthStatus.UNHEALTHY);
            status.setMessage("Health check failed: " + e.getMessage());
            status.setConsecutiveFailures(status.getConsecutiveFailures() + 1);
            log.error("Health check failed for {}: {}", systemName, e.getMessage());
        }
        
        return status;
    }

    /**
     * 异步检查系统健康状态
     */
    public CompletableFuture<SystemHealthStatus> checkSystemHealthAsync(String systemName, String healthCheckUrl) {
        return CompletableFuture.supplyAsync(() -> checkSystemHealth(systemName, healthCheckUrl));
    }

    /**
     * 批量检查多个系统健康状态
     */
    public Map<String, SystemHealthStatus> checkMultipleSystemsHealth(Map<String, String> systemUrls) {
        List<CompletableFuture<Void>> futures = new ArrayList<>();
        
        systemUrls.forEach((systemName, url) -> {
            CompletableFuture<Void> future = CompletableFuture.runAsync(() -> 
                checkSystemHealth(systemName, url));
            futures.add(future);
        });
        
        // 等待所有检查完成
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        
        return new ConcurrentHashMap<>(healthStatusMap);
    }

    /**
     * 获取系统健康状态
     */
    public SystemHealthStatus getSystemHealthStatus(String systemName) {
        return healthStatusMap.get(systemName);
    }

    /**
     * 获取所有系统健康状态
     */
    public Map<String, SystemHealthStatus> getAllSystemHealthStatus() {
        return new ConcurrentHashMap<>(healthStatusMap);
    }

    /**
     * 检查系统是否健康
     */
    public boolean isSystemHealthy(String systemName) {
        SystemHealthStatus status = healthStatusMap.get(systemName);
        return status != null && status.getStatus() == HealthStatus.HEALTHY;
    }

    /**
     * 获取不健康的系统列表
     */
    public List<String> getUnhealthySystems() {
        List<String> unhealthySystems = new ArrayList<>();
        healthStatusMap.forEach((systemName, status) -> {
            if (status.getStatus() == HealthStatus.UNHEALTHY) {
                unhealthySystems.add(systemName);
            }
        });
        return unhealthySystems;
    }

    /**
     * 重置系统健康状态
     */
    public void resetSystemHealthStatus(String systemName) {
        SystemHealthStatus status = healthStatusMap.get(systemName);
        if (status != null) {
            status.setStatus(HealthStatus.UNKNOWN);
            status.setConsecutiveFailures(0);
            status.setMessage("Status reset");
            log.info("Health status reset for system: {}", systemName);
        }
    }

    /**
     * 清除所有健康状态
     */
    public void clearAllHealthStatus() {
        healthStatusMap.clear();
        log.info("All health status cleared");
    }

    /**
     * 获取健康检查摘要
     */
    public Map<String, Object> getHealthSummary() {
        long totalSystems = healthStatusMap.size();
        long healthySystems = healthStatusMap.values().stream()
            .mapToLong(status -> status.getStatus() == HealthStatus.HEALTHY ? 1 : 0)
            .sum();
        long unhealthySystems = healthStatusMap.values().stream()
            .mapToLong(status -> status.getStatus() == HealthStatus.UNHEALTHY ? 1 : 0)
            .sum();
        long warningSystems = healthStatusMap.values().stream()
            .mapToLong(status -> status.getStatus() == HealthStatus.WARNING ? 1 : 0)
            .sum();
        
        return Map.of(
            "totalSystems", totalSystems,
            "healthySystems", healthySystems,
            "unhealthySystems", unhealthySystems,
            "warningSystems", warningSystems,
            "healthyPercentage", totalSystems > 0 ? (double) healthySystems / totalSystems * 100 : 0,
            "lastCheckTime", LocalDateTime.now()
        );
    }
}