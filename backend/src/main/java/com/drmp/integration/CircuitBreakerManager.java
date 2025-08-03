package com.drmp.integration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 熔断器管理器
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Component
public class CircuitBreakerManager {

    private final Map<String, CircuitBreakerState> circuitBreakers = new ConcurrentHashMap<>();
    
    private static final int DEFAULT_FAILURE_THRESHOLD = 5;
    private static final long DEFAULT_TIMEOUT_DURATION = 60000; // 60秒
    private static final int DEFAULT_RETRY_ATTEMPTS = 3;

    public enum CircuitState {
        CLOSED,    // 正常状态
        OPEN,      // 熔断状态
        HALF_OPEN  // 半开状态
    }

    public static class CircuitBreakerState {
        private CircuitState state = CircuitState.CLOSED;
        private AtomicInteger failureCount = new AtomicInteger(0);
        private AtomicInteger successCount = new AtomicInteger(0);
        private LocalDateTime lastFailureTime;
        private LocalDateTime lastSuccessTime;
        private final int failureThreshold;
        private final long timeoutDuration;

        public CircuitBreakerState(int failureThreshold, long timeoutDuration) {
            this.failureThreshold = failureThreshold;
            this.timeoutDuration = timeoutDuration;
        }

        // Getters and setters
        public CircuitState getState() { return state; }
        public void setState(CircuitState state) { this.state = state; }
        public AtomicInteger getFailureCount() { return failureCount; }
        public AtomicInteger getSuccessCount() { return successCount; }
        public LocalDateTime getLastFailureTime() { return lastFailureTime; }
        public void setLastFailureTime(LocalDateTime lastFailureTime) { this.lastFailureTime = lastFailureTime; }
        public LocalDateTime getLastSuccessTime() { return lastSuccessTime; }
        public void setLastSuccessTime(LocalDateTime lastSuccessTime) { this.lastSuccessTime = lastSuccessTime; }
        public int getFailureThreshold() { return failureThreshold; }
        public long getTimeoutDuration() { return timeoutDuration; }
    }

    /**
     * 获取或创建熔断器
     */
    public CircuitBreakerState getCircuitBreaker(String serviceName) {
        return circuitBreakers.computeIfAbsent(serviceName, 
            k -> new CircuitBreakerState(DEFAULT_FAILURE_THRESHOLD, DEFAULT_TIMEOUT_DURATION));
    }

    /**
     * 检查是否允许请求
     */
    public boolean isRequestAllowed(String serviceName) {
        CircuitBreakerState breaker = getCircuitBreaker(serviceName);
        
        switch (breaker.getState()) {
            case CLOSED:
                return true;
            case OPEN:
                // 检查是否超过超时时间，如果是则转为半开状态
                if (isTimeoutExpired(breaker)) {
                    breaker.setState(CircuitState.HALF_OPEN);
                    log.info("Circuit breaker for {} changed to HALF_OPEN", serviceName);
                    return true;
                }
                return false;
            case HALF_OPEN:
                return true;
            default:
                return true;
        }
    }

    /**
     * 记录成功调用
     */
    public void recordSuccess(String serviceName) {
        CircuitBreakerState breaker = getCircuitBreaker(serviceName);
        breaker.getSuccessCount().incrementAndGet();
        breaker.setLastSuccessTime(LocalDateTime.now());
        
        if (breaker.getState() == CircuitState.HALF_OPEN) {
            // 半开状态下成功，重置为关闭状态
            breaker.setState(CircuitState.CLOSED);
            breaker.getFailureCount().set(0);
            log.info("Circuit breaker for {} reset to CLOSED", serviceName);
        }
    }

    /**
     * 记录失败调用
     */
    public void recordFailure(String serviceName) {
        CircuitBreakerState breaker = getCircuitBreaker(serviceName);
        int failureCount = breaker.getFailureCount().incrementAndGet();
        breaker.setLastFailureTime(LocalDateTime.now());
        
        if (failureCount >= breaker.getFailureThreshold()) {
            breaker.setState(CircuitState.OPEN);
            log.warn("Circuit breaker for {} opened due to {} failures", serviceName, failureCount);
        }
    }

    /**
     * 获取熔断器状态
     */
    public Map<String, Object> getCircuitBreakerStatus(String serviceName) {
        CircuitBreakerState breaker = getCircuitBreaker(serviceName);
        return Map.of(
            "serviceName", serviceName,
            "state", breaker.getState(),
            "failureCount", breaker.getFailureCount().get(),
            "successCount", breaker.getSuccessCount().get(),
            "lastFailureTime", breaker.getLastFailureTime(),
            "lastSuccessTime", breaker.getLastSuccessTime(),
            "failureThreshold", breaker.getFailureThreshold(),
            "timeoutDuration", breaker.getTimeoutDuration()
        );
    }

    /**
     * 重置熔断器
     */
    public void resetCircuitBreaker(String serviceName) {
        CircuitBreakerState breaker = getCircuitBreaker(serviceName);
        breaker.setState(CircuitState.CLOSED);
        breaker.getFailureCount().set(0);
        breaker.getSuccessCount().set(0);
        breaker.setLastFailureTime(null);
        breaker.setLastSuccessTime(null);
        log.info("Circuit breaker for {} has been reset", serviceName);
    }

    /**
     * 获取所有熔断器状态
     */
    public Map<String, Map<String, Object>> getAllCircuitBreakersStatus() {
        Map<String, Map<String, Object>> status = new ConcurrentHashMap<>();
        circuitBreakers.forEach((serviceName, breaker) -> 
            status.put(serviceName, getCircuitBreakerStatus(serviceName)));
        return status;
    }

    /**
     * 检查超时是否过期
     */
    private boolean isTimeoutExpired(CircuitBreakerState breaker) {
        if (breaker.getLastFailureTime() == null) {
            return true;
        }
        
        long timeSinceLastFailure = java.time.Duration.between(
            breaker.getLastFailureTime(), LocalDateTime.now()).toMillis();
        return timeSinceLastFailure >= breaker.getTimeoutDuration();
    }
}