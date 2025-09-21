package com.drmp.gateway;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.LongAdder;

/**
 * API网关指标收集器
 * 统计请求量、成功率、响应时间、限流等指标
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Component
public class ApiGatewayMetrics {

    @Value("${api.gateway.rate-limit.requests-per-minute:100}")
    private int requestsPerMinute;
    
    @Value("${api.gateway.rate-limit.requests-per-hour:1000}")
    private int requestsPerHour;

    // 请求统计
    private final LongAdder totalRequests = new LongAdder();
    private final LongAdder successfulRequests = new LongAdder();
    private final LongAdder failedRequests = new LongAdder();
    private final LongAdder unauthorizedRequests = new LongAdder();
    private final LongAdder rateLimitedRequests = new LongAdder();

    // 响应时间统计
    private final LongAdder totalResponseTime = new LongAdder();
    private final AtomicLong maxResponseTime = new AtomicLong(0);
    private final AtomicLong minResponseTime = new AtomicLong(Long.MAX_VALUE);

    // 按路径统计
    private final Map<String, PathMetrics> pathMetrics = new ConcurrentHashMap<>();
    
    // 限流记录 - 使用滑动窗口
    private final Map<String, RateLimitWindow> rateLimitWindows = new ConcurrentHashMap<>();

    /**
     * 记录成功请求
     */
    public void recordSuccessfulRequest(String path, String method, long duration, int statusCode) {
        totalRequests.increment();
        successfulRequests.increment();
        
        recordResponseTime(duration);
        recordPathMetric(path, method, duration, true, statusCode);
        
        log.debug("Successful request: {} {} - {}ms ({})", method, path, duration, statusCode);
    }

    /**
     * 记录失败请求
     */
    public void recordFailedRequest(String path, String method, long duration, String error) {
        totalRequests.increment();
        failedRequests.increment();
        
        recordResponseTime(duration);
        recordPathMetric(path, method, duration, false, 500);
        
        log.warn("Failed request: {} {} - {}ms, error: {}", method, path, duration, error);
    }

    /**
     * 记录未授权访问
     */
    public void recordUnauthorizedAccess(String path, String clientIp) {
        totalRequests.increment();
        unauthorizedRequests.increment();
        
        log.warn("Unauthorized access attempt: {} from IP: {}", path, clientIp);
    }

    /**
     * 记录限流事件
     */
    public void recordRateLimitExceeded(String path, String clientIp) {
        totalRequests.increment();
        rateLimitedRequests.increment();
        
        log.warn("Rate limit exceeded: {} from IP: {}", path, clientIp);
    }

    /**
     * 检查请求限流
     */
    public boolean checkRateLimit(String clientIp, String userId) {
        String key = userId != null ? "user:" + userId : "ip:" + clientIp;
        
        RateLimitWindow window = rateLimitWindows.computeIfAbsent(key, k -> new RateLimitWindow());
        
        LocalDateTime now = LocalDateTime.now();
        
        // 清理过期记录
        window.cleanup(now);
        
        // 检查分钟级限流
        if (window.getRequestsInLastMinute(now) >= requestsPerMinute) {
            return false;
        }
        
        // 检查小时级限流
        if (window.getRequestsInLastHour(now) >= requestsPerHour) {
            return false;
        }
        
        // 记录当前请求
        window.addRequest(now);
        
        return true;
    }

    /**
     * 获取网关统计信息
     */
    public GatewayStats getStats() {
        long total = totalRequests.sum();
        long successful = successfulRequests.sum();
        long failed = failedRequests.sum();
        long unauthorized = unauthorizedRequests.sum();
        long rateLimited = rateLimitedRequests.sum();
        
        double successRate = total > 0 ? (double) successful / total * 100 : 0;
        double avgResponseTime = successful > 0 ? (double) totalResponseTime.sum() / successful : 0;
        
        return GatewayStats.builder()
            .totalRequests(total)
            .successfulRequests(successful)
            .failedRequests(failed)
            .unauthorizedRequests(unauthorized)
            .rateLimitedRequests(rateLimited)
            .successRate(successRate)
            .averageResponseTime(avgResponseTime)
            .maxResponseTime(maxResponseTime.get())
            .minResponseTime(minResponseTime.get() == Long.MAX_VALUE ? 0 : minResponseTime.get())
            .activeConnections(rateLimitWindows.size())
            .build();
    }

    /**
     * 获取路径级别的统计信息
     */
    public Map<String, PathMetrics> getPathMetrics() {
        return new ConcurrentHashMap<>(pathMetrics);
    }

    /**
     * 清理过期数据
     */
    public void cleanupExpiredData() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(2);
        
        rateLimitWindows.entrySet().removeIf(entry -> {
            entry.getValue().cleanup(cutoff);
            return entry.getValue().isEmpty();
        });
        
        log.debug("Cleaned up expired rate limit windows. Active windows: {}", rateLimitWindows.size());
    }

    private void recordResponseTime(long duration) {
        totalResponseTime.add(duration);
        
        // 更新最大响应时间
        maxResponseTime.updateAndGet(current -> Math.max(current, duration));
        
        // 更新最小响应时间
        minResponseTime.updateAndGet(current -> Math.min(current, duration));
    }

    private void recordPathMetric(String path, String method, long duration, boolean success, int statusCode) {
        String key = method + " " + path;
        PathMetrics metrics = pathMetrics.computeIfAbsent(key, k -> new PathMetrics());
        
        metrics.addRequest(duration, success, statusCode);
    }

    /**
     * 网关统计数据
     */
    public static class GatewayStats {
        public final long totalRequests;
        public final long successfulRequests;
        public final long failedRequests;
        public final long unauthorizedRequests;
        public final long rateLimitedRequests;
        public final double successRate;
        public final double averageResponseTime;
        public final long maxResponseTime;
        public final long minResponseTime;
        public final int activeConnections;

        private GatewayStats(Builder builder) {
            this.totalRequests = builder.totalRequests;
            this.successfulRequests = builder.successfulRequests;
            this.failedRequests = builder.failedRequests;
            this.unauthorizedRequests = builder.unauthorizedRequests;
            this.rateLimitedRequests = builder.rateLimitedRequests;
            this.successRate = builder.successRate;
            this.averageResponseTime = builder.averageResponseTime;
            this.maxResponseTime = builder.maxResponseTime;
            this.minResponseTime = builder.minResponseTime;
            this.activeConnections = builder.activeConnections;
        }

        public static Builder builder() {
            return new Builder();
        }

        public static class Builder {
            private long totalRequests;
            private long successfulRequests;
            private long failedRequests;
            private long unauthorizedRequests;
            private long rateLimitedRequests;
            private double successRate;
            private double averageResponseTime;
            private long maxResponseTime;
            private long minResponseTime;
            private int activeConnections;

            public Builder totalRequests(long totalRequests) {
                this.totalRequests = totalRequests;
                return this;
            }

            public Builder successfulRequests(long successfulRequests) {
                this.successfulRequests = successfulRequests;
                return this;
            }

            public Builder failedRequests(long failedRequests) {
                this.failedRequests = failedRequests;
                return this;
            }

            public Builder unauthorizedRequests(long unauthorizedRequests) {
                this.unauthorizedRequests = unauthorizedRequests;
                return this;
            }

            public Builder rateLimitedRequests(long rateLimitedRequests) {
                this.rateLimitedRequests = rateLimitedRequests;
                return this;
            }

            public Builder successRate(double successRate) {
                this.successRate = successRate;
                return this;
            }

            public Builder averageResponseTime(double averageResponseTime) {
                this.averageResponseTime = averageResponseTime;
                return this;
            }

            public Builder maxResponseTime(long maxResponseTime) {
                this.maxResponseTime = maxResponseTime;
                return this;
            }

            public Builder minResponseTime(long minResponseTime) {
                this.minResponseTime = minResponseTime;
                return this;
            }

            public Builder activeConnections(int activeConnections) {
                this.activeConnections = activeConnections;
                return this;
            }

            public GatewayStats build() {
                return new GatewayStats(this);
            }
        }
    }

    /**
     * 路径统计指标
     */
    public static class PathMetrics {
        private final LongAdder requests = new LongAdder();
        private final LongAdder successfulRequests = new LongAdder();
        private final LongAdder totalResponseTime = new LongAdder();
        private final Map<Integer, LongAdder> statusCodes = new ConcurrentHashMap<>();

        public void addRequest(long duration, boolean success, int statusCode) {
            requests.increment();
            if (success) {
                successfulRequests.increment();
            }
            totalResponseTime.add(duration);
            statusCodes.computeIfAbsent(statusCode, k -> new LongAdder()).increment();
        }

        public long getRequestCount() {
            return requests.sum();
        }

        public double getSuccessRate() {
            long total = requests.sum();
            return total > 0 ? (double) successfulRequests.sum() / total * 100 : 0;
        }

        public double getAverageResponseTime() {
            long total = requests.sum();
            return total > 0 ? (double) totalResponseTime.sum() / total : 0;
        }

        public Map<Integer, Long> getStatusCodeDistribution() {
            Map<Integer, Long> result = new ConcurrentHashMap<>();
            statusCodes.forEach((code, count) -> result.put(code, count.sum()));
            return result;
        }
    }

    /**
     * 限流时间窗口
     */
    private static class RateLimitWindow {
        private final Map<LocalDateTime, LongAdder> requests = new ConcurrentHashMap<>();

        public void addRequest(LocalDateTime time) {
            LocalDateTime minute = time.truncatedTo(ChronoUnit.MINUTES);
            requests.computeIfAbsent(minute, k -> new LongAdder()).increment();
        }

        public long getRequestsInLastMinute(LocalDateTime now) {
            LocalDateTime oneMinuteAgo = now.minusMinutes(1).truncatedTo(ChronoUnit.MINUTES);
            return requests.entrySet().stream()
                .filter(entry -> entry.getKey().isAfter(oneMinuteAgo))
                .mapToLong(entry -> entry.getValue().sum())
                .sum();
        }

        public long getRequestsInLastHour(LocalDateTime now) {
            LocalDateTime oneHourAgo = now.minusHours(1).truncatedTo(ChronoUnit.MINUTES);
            return requests.entrySet().stream()
                .filter(entry -> entry.getKey().isAfter(oneHourAgo))
                .mapToLong(entry -> entry.getValue().sum())
                .sum();
        }

        public void cleanup(LocalDateTime cutoff) {
            requests.entrySet().removeIf(entry -> entry.getKey().isBefore(cutoff));
        }

        public boolean isEmpty() {
            return requests.isEmpty();
        }
    }
}