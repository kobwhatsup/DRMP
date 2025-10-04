package com.drmp.service.impl;

import com.drmp.service.ReportCacheService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * 报表缓存服务实现
 * 提供报表数据缓存、预计算、智能刷新等功能
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnBean(RedisTemplate.class)
public class ReportCacheServiceImpl implements ReportCacheService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    // 缓存键前缀
    private static final String REPORT_CACHE_PREFIX = "report_cache:";
    private static final String REPORT_METADATA_PREFIX = "report_meta:";
    private static final String REPORT_STATS_PREFIX = "report_stats:";
    
    // 缓存时间配置（秒）
    private static final int DASHBOARD_CACHE_TTL = 300; // 5分钟
    private static final int DETAILED_REPORT_CACHE_TTL = 1800; // 30分钟
    private static final int STATISTICAL_REPORT_CACHE_TTL = 3600; // 1小时
    private static final int HISTORICAL_REPORT_CACHE_TTL = 86400; // 24小时

    @Override
    public <T> T getCachedReportData(String reportType, String cacheKey, Class<T> clazz) {
        try {
            String fullKey = buildCacheKey(reportType, cacheKey);
            Object cached = redisTemplate.opsForValue().get(fullKey);
            
            if (cached != null) {
                updateCacheAccessStats(fullKey);
                log.debug("Cache hit for report: {}", fullKey);
                
                if (clazz.equals(String.class)) {
                    return (T) cached;
                } else {
                    return objectMapper.convertValue(cached, clazz);
                }
            }
            
            log.debug("Cache miss for report: {}", fullKey);
            return null;
        } catch (Exception e) {
            log.error("Error getting cached report data: " + cacheKey, e);
            return null;
        }
    }

    @Override
    public void cacheReportData(String reportType, String cacheKey, Object data, int ttlSeconds) {
        try {
            String fullKey = buildCacheKey(reportType, cacheKey);
            redisTemplate.opsForValue().set(fullKey, data, ttlSeconds, TimeUnit.SECONDS);
            
            // 保存缓存元数据
            saveReportMetadata(fullKey, reportType, ttlSeconds);
            
            log.debug("Cached report data: {}, TTL: {}s", fullKey, ttlSeconds);
        } catch (Exception e) {
            log.error("Error caching report data: " + cacheKey, e);
        }
    }

    @Override
    public void cacheReportDataWithSmartTTL(String reportType, String cacheKey, Object data) {
        int ttl = calculateSmartTTL(reportType, cacheKey);
        cacheReportData(reportType, cacheKey, data, ttl);
    }

    @Override
    public void invalidateReportCache(String reportType, String cacheKey) {
        try {
            String fullKey = buildCacheKey(reportType, cacheKey);
            redisTemplate.delete(fullKey);
            
            // 删除元数据
            String metaKey = REPORT_METADATA_PREFIX + fullKey;
            redisTemplate.delete(metaKey);
            
            log.info("Invalidated report cache: {}", fullKey);
        } catch (Exception e) {
            log.error("Error invalidating report cache: " + cacheKey, e);
        }
    }

    @Override
    public void invalidateReportCacheByPattern(String reportType, String pattern) {
        try {
            String searchPattern = buildCacheKey(reportType, pattern);
            Set<String> keys = redisTemplate.keys(searchPattern);
            
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.info("Invalidated {} report cache entries by pattern: {}", keys.size(), searchPattern);
            }
        } catch (Exception e) {
            log.error("Error invalidating report cache by pattern: " + pattern, e);
        }
    }

    @Override
    public void precomputeReport(String reportType, String cacheKey, Object data) {
        try {
            // 预计算数据通常缓存时间更长
            int ttl = calculatePrecomputeTTL(reportType);
            cacheReportData(reportType, cacheKey, data, ttl);
            
            // 标记为预计算数据
            String precomputeKey = "precompute:" + buildCacheKey(reportType, cacheKey);
            redisTemplate.opsForValue().set(precomputeKey, true, ttl, TimeUnit.SECONDS);
            
            log.info("Precomputed report data: {}", cacheKey);
        } catch (Exception e) {
            log.error("Error precomputing report: " + cacheKey, e);
        }
    }

    @Override
    public boolean isReportCacheValid(String reportType, String cacheKey) {
        try {
            String fullKey = buildCacheKey(reportType, cacheKey);
            Long ttl = redisTemplate.getExpire(fullKey);
            return ttl != null && ttl > 0;
        } catch (Exception e) {
            log.error("Error checking report cache validity: " + cacheKey, e);
            return false;
        }
    }

    @Override
    public Map<String, Object> getReportCacheStats() {
        try {
            // 获取缓存统计信息
            String statsKey = REPORT_STATS_PREFIX + "global";
            Map<String, Object> stats = (Map<String, Object>) redisTemplate.opsForValue().get(statsKey);
            
            if (stats == null) {
                stats = initializeCacheStats();
            }
            
            // 添加实时统计
            stats.put("totalCacheKeys", getCacheKeyCount());
            stats.put("cacheMemoryUsage", getCacheMemoryUsage());
            stats.put("currentTime", LocalDateTime.now());
            
            return stats;
        } catch (Exception e) {
            log.error("Error getting report cache stats", e);
            return Map.of("error", "Failed to get cache stats");
        }
    }

    @Override
    public void refreshExpiredCaches() {
        try {
            log.info("Starting expired cache refresh process");
            
            // 获取即将过期的缓存（TTL < 300秒）
            Set<String> allKeys = redisTemplate.keys(REPORT_CACHE_PREFIX + "*");
            
            if (allKeys != null) {
                int refreshedCount = 0;
                for (String key : allKeys) {
                    Long ttl = redisTemplate.getExpire(key);
                    if (ttl != null && ttl > 0 && ttl < 300) {
                        // 触发缓存刷新逻辑
                        triggerCacheRefresh(key);
                        refreshedCount++;
                    }
                }
                log.info("Refreshed {} expired/expiring caches", refreshedCount);
            }
        } catch (Exception e) {
            log.error("Error refreshing expired caches", e);
        }
    }

    @Override
    public void warmupCache(List<String> reportTypes) {
        try {
            log.info("Starting cache warmup for report types: {}", reportTypes);
            
            for (String reportType : reportTypes) {
                warmupReportType(reportType);
            }
            
            log.info("Cache warmup completed");
        } catch (Exception e) {
            log.error("Error during cache warmup", e);
        }
    }

    // 私有方法

    private String buildCacheKey(String reportType, String cacheKey) {
        return REPORT_CACHE_PREFIX + reportType + ":" + cacheKey;
    }

    private int calculateSmartTTL(String reportType, String cacheKey) {
        // 根据报表类型和数据特性计算TTL
        switch (reportType.toLowerCase()) {
            case "dashboard":
            case "realtime":
                return DASHBOARD_CACHE_TTL;
            case "detailed":
            case "transaction":
                return DETAILED_REPORT_CACHE_TTL;
            case "statistical":
            case "summary":
                return STATISTICAL_REPORT_CACHE_TTL;
            case "historical":
            case "monthly":
            case "yearly":
                return HISTORICAL_REPORT_CACHE_TTL;
            default:
                return DETAILED_REPORT_CACHE_TTL;
        }
    }

    private int calculatePrecomputeTTL(String reportType) {
        // 预计算数据通常缓存时间是普通缓存的2-3倍
        int baseTTL = calculateSmartTTL(reportType, "");
        return Math.min(baseTTL * 3, 86400); // 最长24小时
    }

    private void saveReportMetadata(String fullKey, String reportType, int ttl) {
        try {
            Map<String, Object> metadata = Map.of(
                "reportType", reportType,
                "ttl", ttl,
                "createdAt", LocalDateTime.now(),
                "accessCount", 0L
            );
            
            String metaKey = REPORT_METADATA_PREFIX + fullKey;
            redisTemplate.opsForValue().set(metaKey, metadata, ttl, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.warn("Failed to save report metadata for: " + fullKey, e);
        }
    }

    private void updateCacheAccessStats(String fullKey) {
        try {
            String metaKey = REPORT_METADATA_PREFIX + fullKey;
            redisTemplate.opsForHash().increment(metaKey, "accessCount", 1);
            redisTemplate.opsForHash().put(metaKey, "lastAccessAt", LocalDateTime.now());
        } catch (Exception e) {
            log.warn("Failed to update cache access stats for: " + fullKey, e);
        }
    }

    private Long getCacheKeyCount() {
        try {
            Set<String> keys = redisTemplate.keys(REPORT_CACHE_PREFIX + "*");
            return keys != null ? (long) keys.size() : 0L;
        } catch (Exception e) {
            log.warn("Failed to get cache key count", e);
            return 0L;
        }
    }

    private String getCacheMemoryUsage() {
        try {
            // 这里可以实现内存使用量计算逻辑
            // 由于Redis没有直接的API，这里返回估算值
            Long keyCount = getCacheKeyCount();
            return keyCount * 1024 + " bytes (estimated)"; // 粗略估算
        } catch (Exception e) {
            log.warn("Failed to get cache memory usage", e);
            return "Unknown";
        }
    }

    private Map<String, Object> initializeCacheStats() {
        Map<String, Object> stats = Map.of(
            "cacheHits", 0L,
            "cacheMisses", 0L,
            "cacheRefreshes", 0L,
            "lastResetAt", LocalDateTime.now()
        );
        
        String statsKey = REPORT_STATS_PREFIX + "global";
        redisTemplate.opsForValue().set(statsKey, stats, 86400, TimeUnit.SECONDS);
        
        return stats;
    }

    private void triggerCacheRefresh(String key) {
        // 这里可以实现缓存刷新逻辑
        // 例如：异步调用相应的报表生成方法
        log.debug("Triggering cache refresh for key: {}", key);
        
        // 延长TTL以防止缓存立即过期
        redisTemplate.expire(key, Duration.ofMinutes(10));
        
        // TODO: 实现具体的缓存刷新逻辑
        // 可以通过事件发布或消息队列来触发报表重新生成
    }

    private void warmupReportType(String reportType) {
        log.debug("Warming up cache for report type: {}", reportType);
        
        // 根据报表类型预加载常用的报表数据
        switch (reportType.toLowerCase()) {
            case "dashboard":
                warmupDashboardReports();
                break;
            case "performance":
                warmupPerformanceReports();
                break;
            case "reconciliation":
                warmupReconciliationReports();
                break;
            default:
                log.debug("No specific warmup strategy for report type: {}", reportType);
        }
    }

    private void warmupDashboardReports() {
        // TODO: 实现仪表板报表预热逻辑
        log.debug("Warming up dashboard reports");
    }

    private void warmupPerformanceReports() {
        // TODO: 实现业绩报表预热逻辑
        log.debug("Warming up performance reports");
    }

    private void warmupReconciliationReports() {
        // TODO: 实现对账报表预热逻辑
        log.debug("Warming up reconciliation reports");
    }
}