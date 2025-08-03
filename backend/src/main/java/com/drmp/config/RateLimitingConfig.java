package com.drmp.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisTemplate;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Rate Limiting Configuration
 * API接口限流配置
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Configuration
public class RateLimitingConfig {

    @Value("${app.rate-limit.requests-per-minute:100}")
    private int requestsPerMinute;

    @Value("${app.rate-limit.requests-per-hour:1000}")
    private int requestsPerHour;

    @Value("${app.rate-limit.burst-capacity:20}")
    private int burstCapacity;

    @Bean
    public RateLimitService rateLimitService(RedisTemplate<String, Object> redisTemplate) {
        return new RateLimitService(redisTemplate, requestsPerMinute, requestsPerHour, burstCapacity);
    }

    /**
     * Rate Limiting Service
     */
    public static class RateLimitService {

        private final RedisTemplate<String, Object> redisTemplate;
        private final int requestsPerMinute;
        private final int requestsPerHour;
        private final int burstCapacity;
        
        // Fallback cache when Redis is unavailable
        private final ConcurrentHashMap<String, TokenBucket> localCache = new ConcurrentHashMap<>();

        public RateLimitService(RedisTemplate<String, Object> redisTemplate, 
                              int requestsPerMinute, int requestsPerHour, int burstCapacity) {
            this.redisTemplate = redisTemplate;
            this.requestsPerMinute = requestsPerMinute;
            this.requestsPerHour = requestsPerHour;
            this.burstCapacity = burstCapacity;
        }

        /**
         * Check if request is allowed under rate limit
         * 
         * @param key Rate limit key (usually user ID or IP)
         * @param endpoint API endpoint
         * @return true if request is allowed, false if rate limited
         */
        public boolean isAllowed(String key, String endpoint) {
            try {
                return isAllowedRedis(key, endpoint);
            } catch (Exception e) {
                log.warn("Redis rate limiting failed, falling back to local cache: {}", e.getMessage());
                return isAllowedLocal(key, endpoint);
            }
        }

        private boolean isAllowedRedis(String key, String endpoint) {
            String minuteKey = String.format("rate_limit:minute:%s:%s", key, endpoint);
            String hourKey = String.format("rate_limit:hour:%s:%s", key, endpoint);

            Long minuteCount = redisTemplate.opsForValue().increment(minuteKey);
            if (minuteCount == 1) {
                redisTemplate.expire(minuteKey, 1, TimeUnit.MINUTES);
            }

            Long hourCount = redisTemplate.opsForValue().increment(hourKey);
            if (hourCount == 1) {
                redisTemplate.expire(hourKey, 1, TimeUnit.HOURS);
            }

            // Check burst capacity (more restrictive for immediate requests)
            if (minuteCount > burstCapacity) {
                log.warn("Burst capacity exceeded for key: {}, endpoint: {}, count: {}", 
                    key, endpoint, minuteCount);
                return false;
            }

            // Check minute limit
            if (minuteCount > requestsPerMinute) {
                log.warn("Minute rate limit exceeded for key: {}, endpoint: {}, count: {}", 
                    key, endpoint, minuteCount);
                return false;
            }

            // Check hour limit
            if (hourCount > requestsPerHour) {
                log.warn("Hour rate limit exceeded for key: {}, endpoint: {}, count: {}", 
                    key, endpoint, hourCount);
                return false;
            }

            return true;
        }

        private boolean isAllowedLocal(String key, String endpoint) {
            String bucketKey = key + ":" + endpoint;
            TokenBucket bucket = localCache.computeIfAbsent(bucketKey, 
                k -> new TokenBucket(requestsPerMinute, TimeUnit.MINUTES.toMillis(1)));
            
            return bucket.tryConsume();
        }

        /**
         * Get remaining requests for a key
         */
        public RateLimitInfo getRateLimitInfo(String key, String endpoint) {
            try {
                String minuteKey = String.format("rate_limit:minute:%s:%s", key, endpoint);
                String hourKey = String.format("rate_limit:hour:%s:%s", key, endpoint);

                Long minuteCount = (Long) redisTemplate.opsForValue().get(minuteKey);
                Long hourCount = (Long) redisTemplate.opsForValue().get(hourKey);

                int remainingMinute = Math.max(0, requestsPerMinute - (minuteCount != null ? minuteCount.intValue() : 0));
                int remainingHour = Math.max(0, requestsPerHour - (hourCount != null ? hourCount.intValue() : 0));

                Long ttlMinute = redisTemplate.getExpire(minuteKey, TimeUnit.SECONDS);
                Long ttlHour = redisTemplate.getExpire(hourKey, TimeUnit.SECONDS);

                return new RateLimitInfo(remainingMinute, remainingHour, 
                    ttlMinute != null ? ttlMinute : 60L, 
                    ttlHour != null ? ttlHour : 3600L);

            } catch (Exception e) {
                log.warn("Failed to get rate limit info: {}", e.getMessage());
                return new RateLimitInfo(requestsPerMinute, requestsPerHour, 60L, 3600L);
            }
        }
    }

    /**
     * Simple Token Bucket implementation for local fallback
     */
    private static class TokenBucket {
        private final int capacity;
        private final long refillIntervalMs;
        private volatile int tokens;
        private volatile long lastRefillTime;

        public TokenBucket(int capacity, long refillIntervalMs) {
            this.capacity = capacity;
            this.refillIntervalMs = refillIntervalMs;
            this.tokens = capacity;
            this.lastRefillTime = System.currentTimeMillis();
        }

        public synchronized boolean tryConsume() {
            refill();
            if (tokens > 0) {
                tokens--;
                return true;
            }
            return false;
        }

        private void refill() {
            long now = System.currentTimeMillis();
            if (now - lastRefillTime >= refillIntervalMs) {
                tokens = capacity;
                lastRefillTime = now;
            }
        }
    }

    /**
     * Rate limit information
     */
    public static class RateLimitInfo {
        private final int remainingMinute;
        private final int remainingHour;
        private final long resetTimeMinute;
        private final long resetTimeHour;

        public RateLimitInfo(int remainingMinute, int remainingHour, long resetTimeMinute, long resetTimeHour) {
            this.remainingMinute = remainingMinute;
            this.remainingHour = remainingHour;
            this.resetTimeMinute = resetTimeMinute;
            this.resetTimeHour = resetTimeHour;
        }

        public int getRemainingMinute() { return remainingMinute; }
        public int getRemainingHour() { return remainingHour; }
        public long getResetTimeMinute() { return resetTimeMinute; }
        public long getResetTimeHour() { return resetTimeHour; }
    }
}