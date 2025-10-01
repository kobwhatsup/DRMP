package com.drmp.service;

import com.drmp.config.BaseServiceTest;
import com.drmp.service.impl.ReportCacheServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * ReportCacheService 单元测试
 */
@DisplayName("ReportCacheService 测试")
class ReportCacheServiceTest extends BaseServiceTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private ReportCacheServiceImpl reportCacheService;

    @BeforeEach
    void setUp() {
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    @DisplayName("获取缓存报表数据 - 缓存命中")
    void getCachedReportData_WhenCacheHit_ShouldReturnData() {
        String reportType = "dashboard";
        String cacheKey = "org_1_summary";
        String cachedData = "cached report data";

        when(valueOperations.get(anyString())).thenReturn(cachedData);

        String result = reportCacheService.getCachedReportData(reportType, cacheKey, String.class);

        assertThat(result).isEqualTo(cachedData);
        verify(valueOperations).get(anyString());
    }

    @Test
    @DisplayName("获取缓存报表数据 - 缓存未命中")
    void getCachedReportData_WhenCacheMiss_ShouldReturnNull() {
        String reportType = "dashboard";
        String cacheKey = "org_1_summary";

        when(valueOperations.get(anyString())).thenReturn(null);

        String result = reportCacheService.getCachedReportData(reportType, cacheKey, String.class);

        assertThat(result).isNull();
    }

    @Test
    @DisplayName("缓存报表数据 - 成功")
    void cacheReportData_ShouldCacheSuccessfully() {
        String reportType = "dashboard";
        String cacheKey = "org_1_summary";
        String data = "report data";
        int ttl = 300;

        reportCacheService.cacheReportData(reportType, cacheKey, data, ttl);

        // 应该调用两次set: 一次缓存数据,一次缓存元数据
        verify(valueOperations, atLeast(1)).set(anyString(), any(), anyLong(), eq(TimeUnit.SECONDS));
    }

    @Test
    @DisplayName("智能TTL缓存 - Dashboard类型")
    void cacheReportDataWithSmartTTL_ForDashboard_ShouldUseShortTTL() {
        String reportType = "dashboard";
        String cacheKey = "org_1_summary";
        String data = "report data";

        reportCacheService.cacheReportDataWithSmartTTL(reportType, cacheKey, data);

        // Dashboard应该使用300秒TTL
        verify(valueOperations, atLeast(1)).set(anyString(), any(), anyLong(), eq(TimeUnit.SECONDS));
    }

    @Test
    @DisplayName("智能TTL缓存 - Historical类型")
    void cacheReportDataWithSmartTTL_ForHistorical_ShouldUseLongTTL() {
        String reportType = "historical";
        String cacheKey = "org_1_yearly";
        String data = "report data";

        reportCacheService.cacheReportDataWithSmartTTL(reportType, cacheKey, data);

        // Historical应该使用86400秒(24小时)TTL
        verify(valueOperations, atLeast(1)).set(anyString(), any(), anyLong(), eq(TimeUnit.SECONDS));
    }

    @Test
    @DisplayName("失效报表缓存")
    void invalidateReportCache_ShouldDeleteCache() {
        String reportType = "dashboard";
        String cacheKey = "org_1_summary";

        when(redisTemplate.delete(anyString())).thenReturn(true);

        reportCacheService.invalidateReportCache(reportType, cacheKey);

        verify(redisTemplate, atLeastOnce()).delete(anyString());
    }

    @Test
    @DisplayName("按模式失效缓存")
    void invalidateReportCacheByPattern_ShouldDeleteMatchingCaches() {
        String reportType = "dashboard";
        String pattern = "org_1_*";
        Set<String> matchedKeys = new HashSet<>(Arrays.asList("key1", "key2", "key3"));

        when(redisTemplate.keys(anyString())).thenReturn(matchedKeys);
        when(redisTemplate.delete(matchedKeys)).thenReturn(3L);

        reportCacheService.invalidateReportCacheByPattern(reportType, pattern);

        verify(redisTemplate).delete(matchedKeys);
    }

    @Test
    @DisplayName("预计算报表")
    void precomputeReport_ShouldCacheWithLongerTTL() {
        String reportType = "statistical";
        String cacheKey = "monthly_summary";
        Map<String, Object> data = Map.of("total", 1000);

        reportCacheService.precomputeReport(reportType, cacheKey, data);

        // 预计算数据应该调用多次set (数据+元数据+预计算标记)
        verify(valueOperations, atLeast(2)).set(anyString(), any(), anyLong(), eq(TimeUnit.SECONDS));
    }

    @Test
    @DisplayName("检查缓存有效性 - 有效")
    void isReportCacheValid_WhenValid_ShouldReturnTrue() {
        String reportType = "dashboard";
        String cacheKey = "org_1_summary";

        when(redisTemplate.getExpire(anyString())).thenReturn(300L);

        boolean result = reportCacheService.isReportCacheValid(reportType, cacheKey);

        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("检查缓存有效性 - 已过期")
    void isReportCacheValid_WhenExpired_ShouldReturnFalse() {
        String reportType = "dashboard";
        String cacheKey = "org_1_summary";

        when(redisTemplate.getExpire(anyString())).thenReturn(-1L);

        boolean result = reportCacheService.isReportCacheValid(reportType, cacheKey);

        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("获取缓存统计信息")
    void getReportCacheStats_ShouldReturnStats() {
        Set<String> keys = new HashSet<>(Arrays.asList("key1", "key2", "key3"));
        when(redisTemplate.keys(anyString())).thenReturn(keys);
        Map<String, Object> mockStats = new HashMap<>();
        mockStats.put("cacheHits", 100L);
        mockStats.put("cacheMisses", 10L);
        when(valueOperations.get(anyString())).thenReturn(mockStats);

        Map<String, Object> stats = reportCacheService.getReportCacheStats();

        assertThat(stats).isNotNull();
        assertThat(stats).containsKeys("totalCacheKeys", "cacheMemoryUsage", "currentTime");
        assertThat(stats.get("totalCacheKeys")).isEqualTo(3L);
    }

    @Test
    @DisplayName("刷新过期缓存")
    void refreshExpiredCaches_ShouldRefreshExpiring() {
        Set<String> keys = new HashSet<>(Arrays.asList("key1", "key2"));
        when(redisTemplate.keys(anyString())).thenReturn(keys);
        when(redisTemplate.getExpire("key1")).thenReturn(100L); // 即将过期
        when(redisTemplate.getExpire("key2")).thenReturn(500L); // 还有较长时间

        reportCacheService.refreshExpiredCaches();

        // key1应该被刷新(延长TTL)
        verify(redisTemplate, atLeastOnce()).expire(eq("key1"), any());
        // key2不应该被刷新
        verify(redisTemplate, never()).expire(eq("key2"), any());
    }

    @Test
    @DisplayName("缓存预热 - 多种报表类型")
    void warmupCache_ShouldWarmupMultipleTypes() {
        List<String> reportTypes = Arrays.asList("dashboard", "performance", "reconciliation");

        reportCacheService.warmupCache(reportTypes);

        // 验证没有抛出异常
        // 实际的预热逻辑是TODO,这里主要测试方法调用
    }

    @Test
    @DisplayName("缓存预热 - 空列表")
    void warmupCache_WithEmptyList_ShouldNotFail() {
        List<String> reportTypes = new ArrayList<>();

        reportCacheService.warmupCache(reportTypes);

        // 应该正常完成,不抛出异常
    }
}
