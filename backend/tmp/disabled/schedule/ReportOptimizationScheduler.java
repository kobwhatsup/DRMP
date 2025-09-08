package com.drmp.schedule;

import com.drmp.service.ReportCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 报表优化定时任务
 * 定期执行缓存清理、预热、性能监控等任务
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "drmp.scheduler.report-optimization.enabled", havingValue = "true", matchIfMissing = true)
public class ReportOptimizationScheduler {

    private final ReportCacheService reportCacheService;

    /**
     * 每5分钟刷新即将过期的缓存
     */
    @Scheduled(fixedRate = 300000) // 5分钟
    public void refreshExpiredCaches() {
        try {
            log.debug("Starting scheduled cache refresh task");
            reportCacheService.refreshExpiredCaches();
            log.debug("Completed scheduled cache refresh task");
        } catch (Exception e) {
            log.error("Error in scheduled cache refresh task", e);
        }
    }

    /**
     * 每小时预热核心报表缓存
     */
    @Scheduled(fixedRate = 3600000) // 1小时
    public void warmupCoreReports() {
        try {
            log.info("Starting scheduled cache warmup task");
            
            List<String> coreReportTypes = List.of(
                "dashboard",
                "performance", 
                "reconciliation",
                "statistical"
            );
            
            reportCacheService.warmupCache(coreReportTypes);
            log.info("Completed scheduled cache warmup task");
        } catch (Exception e) {
            log.error("Error in scheduled cache warmup task", e);
        }
    }

    /**
     * 每天凌晨2点清理过期的导出文件缓存
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupExpiredExports() {
        try {
            log.info("Starting scheduled export cleanup task");
            
            // 清理过期的导出文件
            reportCacheService.invalidateReportCacheByPattern("export", "*");
            
            log.info("Completed scheduled export cleanup task");
        } catch (Exception e) {
            log.error("Error in scheduled export cleanup task", e);
        }
    }

    /**
     * 每天凌晨3点执行性能统计和优化
     */
    @Scheduled(cron = "0 0 3 * * ?")
    public void performanceOptimization() {
        try {
            log.info("Starting scheduled performance optimization task");
            
            // 获取缓存统计
            var cacheStats = reportCacheService.getReportCacheStats();
            log.info("Cache statistics: {}", cacheStats);
            
            // 根据统计数据进行优化建议
            analyzeAndOptimize(cacheStats);
            
            log.info("Completed scheduled performance optimization task");
        } catch (Exception e) {
            log.error("Error in scheduled performance optimization task", e);
        }
    }

    /**
     * 每周日凌晨1点执行深度缓存清理
     */
    @Scheduled(cron = "0 0 1 * * SUN")
    public void deepCacheCleanup() {
        try {
            log.info("Starting scheduled deep cache cleanup task");
            
            // 清理所有报表类型的过期缓存
            List<String> reportTypes = List.of(
                "dashboard", "performance", "reconciliation", 
                "statistical", "detailed", "historical"
            );
            
            for (String reportType : reportTypes) {
                reportCacheService.invalidateReportCacheByPattern(reportType, "*:old:*");
                reportCacheService.invalidateReportCacheByPattern(reportType, "*:temp:*");
            }
            
            log.info("Completed scheduled deep cache cleanup task");
        } catch (Exception e) {
            log.error("Error in scheduled deep cache cleanup task", e);
        }
    }

    /**
     * 每30分钟监控缓存健康状态
     */
    @Scheduled(fixedRate = 1800000) // 30分钟
    public void monitorCacheHealth() {
        try {
            log.debug("Starting cache health monitoring");
            
            var stats = reportCacheService.getReportCacheStats();
            
            // 检查缓存命中率
            Object cacheHits = stats.get("cacheHits");
            Object cacheMisses = stats.get("cacheMisses");
            
            if (cacheHits instanceof Number && cacheMisses instanceof Number) {
                long hits = ((Number) cacheHits).longValue();
                long misses = ((Number) cacheMisses).longValue();
                long total = hits + misses;
                
                if (total > 0) {
                    double hitRate = (double) hits / total * 100;
                    
                    if (hitRate < 70) {
                        log.warn("Low cache hit rate detected: {}%. Consider optimizing cache strategy.", hitRate);
                    } else if (hitRate > 95) {
                        log.info("Excellent cache hit rate: {}%", hitRate);
                    }
                }
            }
            
            // 检查缓存键数量
            Object totalKeys = stats.get("totalCacheKeys");
            if (totalKeys instanceof Number) {
                long keyCount = ((Number) totalKeys).longValue();
                
                if (keyCount > 10000) {
                    log.warn("High number of cache keys detected: {}. Consider cleanup.", keyCount);
                }
            }
            
            log.debug("Completed cache health monitoring");
        } catch (Exception e) {
            log.warn("Error in cache health monitoring", e);
        }
    }

    /**
     * 工作日早上8点预热当日常用报表
     */
    @Scheduled(cron = "0 0 8 * * MON-FRI")
    public void warmupDailyReports() {
        try {
            log.info("Starting daily report warmup for business hours");
            
            // 预热当日可能用到的报表
            List<String> dailyReportTypes = List.of(
                "dashboard",
                "realtime",
                "summary"
            );
            
            reportCacheService.warmupCache(dailyReportTypes);
            
            log.info("Completed daily report warmup");
        } catch (Exception e) {
            log.error("Error in daily report warmup", e);
        }
    }

    /**
     * 分析缓存统计数据并执行优化
     */
    private void analyzeAndOptimize(Object cacheStats) {
        log.debug("Analyzing cache statistics for optimization opportunities");
        
        // TODO: 实现具体的优化逻辑
        // 1. 分析缓存命中率
        // 2. 识别热点数据
        // 3. 调整缓存策略
        // 4. 优化缓存TTL
        
        log.debug("Cache analysis and optimization completed");
    }
}