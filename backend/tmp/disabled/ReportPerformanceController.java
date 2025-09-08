package com.drmp.controller;

import com.drmp.dto.response.ApiResponse;
import com.drmp.service.ReportCacheService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 报表性能优化控制器
 * 提供缓存管理、性能监控等功能
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/v1/reports/performance")
@RequiredArgsConstructor
@Tag(name = "报表性能优化", description = "报表缓存管理和性能监控功能")
public class ReportPerformanceController {

    private final ReportCacheService reportCacheService;

    @Operation(summary = "获取缓存统计", description = "获取报表缓存的统计信息")
    @GetMapping("/cache/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLATFORM_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCacheStatistics() {
        
        log.info("Getting report cache statistics");
        Map<String, Object> stats = reportCacheService.getReportCacheStats();
        
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @Operation(summary = "清理缓存", description = "清理指定类型的报表缓存")
    @PostMapping("/cache/clear")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLATFORM_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> clearCache(
            @Parameter(description = "报表类型") @RequestParam String reportType,
            @Parameter(description = "缓存键模式") @RequestParam(required = false) String pattern) {
        
        log.info("Clearing report cache - reportType: {}, pattern: {}", reportType, pattern);
        
        if (pattern != null && !pattern.trim().isEmpty()) {
            reportCacheService.invalidateReportCacheByPattern(reportType, pattern);
        } else {
            reportCacheService.invalidateReportCacheByPattern(reportType, "*");
        }
        
        return ResponseEntity.ok(ApiResponse.successWithMessage("缓存清理成功"));
    }

    @Operation(summary = "刷新过期缓存", description = "主动刷新即将过期的缓存")
    @PostMapping("/cache/refresh")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLATFORM_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> refreshExpiredCaches() {
        
        log.info("Refreshing expired report caches");
        reportCacheService.refreshExpiredCaches();
        
        return ResponseEntity.ok(ApiResponse.successWithMessage("过期缓存刷新完成"));
    }

    @Operation(summary = "预热缓存", description = "预热指定类型的报表缓存")
    @PostMapping("/cache/warmup")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLATFORM_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> warmupCache(
            @Parameter(description = "报表类型列表") @RequestBody List<String> reportTypes) {
        
        log.info("Warming up report cache for types: {}", reportTypes);
        reportCacheService.warmupCache(reportTypes);
        
        return ResponseEntity.ok(ApiResponse.successWithMessage("缓存预热完成"));
    }

    @Operation(summary = "检查缓存状态", description = "检查指定报表的缓存状态")
    @GetMapping("/cache/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLATFORM_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkCacheStatus(
            @Parameter(description = "报表类型") @RequestParam String reportType,
            @Parameter(description = "缓存键") @RequestParam String cacheKey) {
        
        log.info("Checking cache status - reportType: {}, cacheKey: {}", reportType, cacheKey);
        
        boolean isValid = reportCacheService.isReportCacheValid(reportType, cacheKey);
        
        Map<String, Object> status = Map.of(
            "reportType", reportType,
            "cacheKey", cacheKey,
            "isValid", isValid,
            "timestamp", System.currentTimeMillis()
        );
        
        return ResponseEntity.ok(ApiResponse.success(status));
    }

    @Operation(summary = "执行性能测试", description = "执行报表性能测试")
    @PostMapping("/test/performance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> performanceTest(
            @Parameter(description = "测试类型") @RequestParam String testType,
            @Parameter(description = "测试参数") @RequestBody Map<String, Object> testParams) {
        
        log.info("Executing performance test - type: {}, params: {}", testType, testParams);
        
        long startTime = System.currentTimeMillis();
        
        // 执行性能测试逻辑
        Map<String, Object> testResult = executePerformanceTest(testType, testParams);
        
        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;
        
        testResult.put("testDuration", duration);
        testResult.put("testType", testType);
        testResult.put("timestamp", startTime);
        
        return ResponseEntity.ok(ApiResponse.success(testResult));
    }

    @Operation(summary = "获取性能监控数据", description = "获取报表系统的性能监控数据")
    @GetMapping("/monitoring")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLATFORM_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPerformanceMonitoring(
            @Parameter(description = "监控时间范围(分钟)") @RequestParam(defaultValue = "60") Integer minutes) {
        
        log.info("Getting performance monitoring data for {} minutes", minutes);
        
        Map<String, Object> monitoring = Map.of(
            "timeRange", minutes + " minutes",
            "cacheHitRate", calculateCacheHitRate(),
            "averageResponseTime", calculateAverageResponseTime(),
            "peakMemoryUsage", getPeakMemoryUsage(),
            "activeConnections", getActiveConnections(),
            "errorRate", calculateErrorRate(),
            "throughput", calculateThroughput(),
            "timestamp", System.currentTimeMillis()
        );
        
        return ResponseEntity.ok(ApiResponse.success(monitoring));
    }

    @Operation(summary = "优化建议", description = "获取报表性能优化建议")
    @GetMapping("/recommendations")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLATFORM_MANAGER')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getOptimizationRecommendations() {
        
        log.info("Getting optimization recommendations");
        
        List<Map<String, Object>> recommendations = List.of(
            Map.of(
                "type", "CACHE_OPTIMIZATION",
                "title", "缓存命中率优化",
                "description", "当前缓存命中率偏低，建议增加缓存时间或预热策略",
                "priority", "HIGH",
                "impact", "减少数据库查询，提升响应速度",
                "action", "调整缓存TTL配置或增加预热任务"
            ),
            Map.of(
                "type", "QUERY_OPTIMIZATION",
                "title", "查询性能优化",
                "description", "检测到慢查询，建议优化SQL或添加索引",
                "priority", "MEDIUM",
                "impact", "减少查询时间，提升用户体验",
                "action", "分析慢查询日志，优化数据库索引"
            ),
            Map.of(
                "type", "MEMORY_OPTIMIZATION",
                "title", "内存使用优化",
                "description", "内存使用率较高，建议清理无用缓存或增加内存",
                "priority", "LOW",
                "impact", "防止内存溢出，保持系统稳定",
                "action", "定期清理过期缓存，监控内存使用"
            )
        );
        
        return ResponseEntity.ok(ApiResponse.success(recommendations));
    }

    // 私有方法

    private Map<String, Object> executePerformanceTest(String testType, Map<String, Object> testParams) {
        // 模拟性能测试
        switch (testType.toLowerCase()) {
            case "cache_performance":
                return testCachePerformance(testParams);
            case "query_performance":
                return testQueryPerformance(testParams);
            case "memory_usage":
                return testMemoryUsage(testParams);
            default:
                return Map.of("error", "Unknown test type: " + testType);
        }
    }

    private Map<String, Object> testCachePerformance(Map<String, Object> params) {
        return Map.of(
            "cacheHits", 950,
            "cacheMisses", 50,
            "hitRate", 95.0,
            "averageLatency", 1.2,
            "status", "GOOD"
        );
    }

    private Map<String, Object> testQueryPerformance(Map<String, Object> params) {
        return Map.of(
            "totalQueries", 1000,
            "slowQueries", 15,
            "averageQueryTime", 45.6,
            "maxQueryTime", 2300.0,
            "status", "ACCEPTABLE"
        );
    }

    private Map<String, Object> testMemoryUsage(Map<String, Object> params) {
        return Map.of(
            "usedMemory", "512MB",
            "maxMemory", "1GB",
            "usagePercentage", 51.2,
            "gcCount", 23,
            "status", "NORMAL"
        );
    }

    private double calculateCacheHitRate() {
        // 模拟缓存命中率计算
        return 88.5;
    }

    private double calculateAverageResponseTime() {
        // 模拟平均响应时间计算
        return 125.3;
    }

    private String getPeakMemoryUsage() {
        // 模拟峰值内存使用
        return "768MB";
    }

    private int getActiveConnections() {
        // 模拟活跃连接数
        return 45;
    }

    private double calculateErrorRate() {
        // 模拟错误率计算
        return 0.02;
    }

    private double calculateThroughput() {
        // 模拟吞吐量计算（请求/秒）
        return 156.7;
    }
}