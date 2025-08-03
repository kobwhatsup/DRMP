package com.drmp.integration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

/**
 * 外部系统指标收集器
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Component
public class ExternalSystemMetrics {

    // 系统调用统计
    private final Map<String, SystemMetrics> systemMetricsMap = new ConcurrentHashMap<>();

    /**
     * 系统指标数据
     */
    public static class SystemMetrics {
        private String systemName;
        private AtomicLong totalRequests = new AtomicLong(0);
        private AtomicLong successfulRequests = new AtomicLong(0);
        private AtomicLong failedRequests = new AtomicLong(0);
        private AtomicLong totalResponseTime = new AtomicLong(0);
        private AtomicLong minResponseTime = new AtomicLong(Long.MAX_VALUE);
        private AtomicLong maxResponseTime = new AtomicLong(0);
        private AtomicReference<LocalDateTime> lastRequestTime = new AtomicReference<>();
        private AtomicReference<LocalDateTime> lastSuccessTime = new AtomicReference<>();
        private AtomicReference<LocalDateTime> lastFailureTime = new AtomicReference<>();

        public SystemMetrics(String systemName) {
            this.systemName = systemName;
        }

        // Getters
        public String getSystemName() { return systemName; }
        public AtomicLong getTotalRequests() { return totalRequests; }
        public AtomicLong getSuccessfulRequests() { return successfulRequests; }
        public AtomicLong getFailedRequests() { return failedRequests; }
        public AtomicLong getTotalResponseTime() { return totalResponseTime; }
        public AtomicLong getMinResponseTime() { return minResponseTime; }
        public AtomicLong getMaxResponseTime() { return maxResponseTime; }
        public AtomicReference<LocalDateTime> getLastRequestTime() { return lastRequestTime; }
        public AtomicReference<LocalDateTime> getLastSuccessTime() { return lastSuccessTime; }
        public AtomicReference<LocalDateTime> getLastFailureTime() { return lastFailureTime; }

        /**
         * 计算平均响应时间
         */
        public double getAverageResponseTime() {
            long total = totalRequests.get();
            return total > 0 ? (double) totalResponseTime.get() / total : 0.0;
        }

        /**
         * 计算成功率
         */
        public double getSuccessRate() {
            long total = totalRequests.get();
            return total > 0 ? (double) successfulRequests.get() / total * 100 : 0.0;
        }

        /**
         * 计算失败率
         */
        public double getFailureRate() {
            long total = totalRequests.get();
            return total > 0 ? (double) failedRequests.get() / total * 100 : 0.0;
        }
    }

    /**
     * 记录请求开始
     */
    public RequestContext startRequest(String systemName) {
        SystemMetrics metrics = getOrCreateMetrics(systemName);
        metrics.getTotalRequests().incrementAndGet();
        metrics.getLastRequestTime().set(LocalDateTime.now());
        
        return new RequestContext(systemName, System.currentTimeMillis());
    }

    /**
     * 记录成功请求
     */
    public void recordSuccess(RequestContext context) {
        if (context == null) return;
        
        long responseTime = System.currentTimeMillis() - context.getStartTime();
        SystemMetrics metrics = getOrCreateMetrics(context.getSystemName());
        
        metrics.getSuccessfulRequests().incrementAndGet();
        metrics.getTotalResponseTime().addAndGet(responseTime);
        metrics.getLastSuccessTime().set(LocalDateTime.now());
        
        // 更新最小和最大响应时间
        updateMinResponseTime(metrics, responseTime);
        updateMaxResponseTime(metrics, responseTime);
        
        log.debug("Recorded success for {}: {}ms", context.getSystemName(), responseTime);
    }

    /**
     * 记录失败请求
     */
    public void recordFailure(RequestContext context, String errorMessage) {
        if (context == null) return;
        
        long responseTime = System.currentTimeMillis() - context.getStartTime();
        SystemMetrics metrics = getOrCreateMetrics(context.getSystemName());
        
        metrics.getFailedRequests().incrementAndGet();
        metrics.getTotalResponseTime().addAndGet(responseTime);
        metrics.getLastFailureTime().set(LocalDateTime.now());
        
        // 更新最小和最大响应时间
        updateMinResponseTime(metrics, responseTime);
        updateMaxResponseTime(metrics, responseTime);
        
        log.warn("Recorded failure for {}: {}ms, error: {}", 
                context.getSystemName(), responseTime, errorMessage);
    }

    /**
     * 获取系统指标
     */
    public Map<String, Object> getSystemMetrics(String systemName) {
        SystemMetrics metrics = systemMetricsMap.get(systemName);
        if (metrics == null) {
            return Map.of("error", "No metrics found for system: " + systemName);
        }
        
        Map<String, Object> result = new ConcurrentHashMap<>();
        result.put("systemName", metrics.getSystemName());
        result.put("totalRequests", metrics.getTotalRequests().get());
        result.put("successfulRequests", metrics.getSuccessfulRequests().get());
        result.put("failedRequests", metrics.getFailedRequests().get());
        result.put("successRate", metrics.getSuccessRate());
        result.put("failureRate", metrics.getFailureRate());
        result.put("averageResponseTime", metrics.getAverageResponseTime());
        result.put("minResponseTime", metrics.getMinResponseTime().get() == Long.MAX_VALUE ? 0 : metrics.getMinResponseTime().get());
        result.put("maxResponseTime", metrics.getMaxResponseTime().get());
        result.put("lastRequestTime", metrics.getLastRequestTime().get());
        result.put("lastSuccessTime", metrics.getLastSuccessTime().get());
        result.put("lastFailureTime", metrics.getLastFailureTime().get());
        
        return result;
    }

    /**
     * 获取所有系统指标
     */
    public Map<String, Map<String, Object>> getAllSystemMetrics() {
        Map<String, Map<String, Object>> allMetrics = new ConcurrentHashMap<>();
        systemMetricsMap.forEach((systemName, metrics) -> 
            allMetrics.put(systemName, getSystemMetrics(systemName)));
        return allMetrics;
    }

    /**
     * 重置系统指标
     */
    public void resetSystemMetrics(String systemName) {
        SystemMetrics metrics = systemMetricsMap.get(systemName);
        if (metrics != null) {
            metrics.getTotalRequests().set(0);
            metrics.getSuccessfulRequests().set(0);
            metrics.getFailedRequests().set(0);
            metrics.getTotalResponseTime().set(0);
            metrics.getMinResponseTime().set(Long.MAX_VALUE);
            metrics.getMaxResponseTime().set(0);
            metrics.getLastRequestTime().set(null);
            metrics.getLastSuccessTime().set(null);
            metrics.getLastFailureTime().set(null);
            
            log.info("Reset metrics for system: {}", systemName);
        }
    }

    /**
     * 重置所有系统指标
     */
    public void resetAllMetrics() {
        systemMetricsMap.forEach((systemName, metrics) -> resetSystemMetrics(systemName));
        log.info("Reset all system metrics");
    }

    /**
     * 获取指标摘要
     */
    public Map<String, Object> getMetricsSummary() {
        long totalSystems = systemMetricsMap.size();
        long totalRequests = systemMetricsMap.values().stream()
            .mapToLong(metrics -> metrics.getTotalRequests().get())
            .sum();
        long totalSuccessful = systemMetricsMap.values().stream()
            .mapToLong(metrics -> metrics.getSuccessfulRequests().get())
            .sum();
        long totalFailed = systemMetricsMap.values().stream()
            .mapToLong(metrics -> metrics.getFailedRequests().get())
            .sum();
        
        double overallSuccessRate = totalRequests > 0 ? (double) totalSuccessful / totalRequests * 100 : 0.0;
        double overallFailureRate = totalRequests > 0 ? (double) totalFailed / totalRequests * 100 : 0.0;
        
        return Map.of(
            "totalSystems", totalSystems,
            "totalRequests", totalRequests,
            "totalSuccessful", totalSuccessful,
            "totalFailed", totalFailed,
            "overallSuccessRate", overallSuccessRate,
            "overallFailureRate", overallFailureRate,
            "timestamp", LocalDateTime.now()
        );
    }

    /**
     * 获取或创建系统指标
     */
    private SystemMetrics getOrCreateMetrics(String systemName) {
        return systemMetricsMap.computeIfAbsent(systemName, SystemMetrics::new);
    }

    /**
     * 更新最小响应时间
     */
    private void updateMinResponseTime(SystemMetrics metrics, long responseTime) {
        metrics.getMinResponseTime().updateAndGet(current -> 
            current == Long.MAX_VALUE ? responseTime : Math.min(current, responseTime));
    }

    /**
     * 更新最大响应时间
     */
    private void updateMaxResponseTime(SystemMetrics metrics, long responseTime) {
        metrics.getMaxResponseTime().updateAndGet(current -> Math.max(current, responseTime));
    }

    /**
     * 请求上下文
     */
    public static class RequestContext {
        private final String systemName;
        private final long startTime;

        public RequestContext(String systemName, long startTime) {
            this.systemName = systemName;
            this.startTime = startTime;
        }

        public String getSystemName() { return systemName; }
        public long getStartTime() { return startTime; }
    }
}