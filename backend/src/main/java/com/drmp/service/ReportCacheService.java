package com.drmp.service;

import java.util.List;
import java.util.Map;

/**
 * 报表缓存服务接口
 * 提供报表数据缓存、预计算、智能刷新等功能
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public interface ReportCacheService {

    /**
     * 获取缓存的报表数据
     * 
     * @param reportType 报表类型
     * @param cacheKey 缓存键
     * @param clazz 返回数据类型
     * @param <T> 泛型类型
     * @return 缓存数据，不存在时返回null
     */
    <T> T getCachedReportData(String reportType, String cacheKey, Class<T> clazz);

    /**
     * 缓存报表数据
     * 
     * @param reportType 报表类型
     * @param cacheKey 缓存键
     * @param data 数据
     * @param ttlSeconds 过期时间（秒）
     */
    void cacheReportData(String reportType, String cacheKey, Object data, int ttlSeconds);

    /**
     * 使用智能TTL缓存报表数据
     * 
     * @param reportType 报表类型
     * @param cacheKey 缓存键
     * @param data 数据
     */
    void cacheReportDataWithSmartTTL(String reportType, String cacheKey, Object data);

    /**
     * 失效报表缓存
     * 
     * @param reportType 报表类型
     * @param cacheKey 缓存键
     */
    void invalidateReportCache(String reportType, String cacheKey);

    /**
     * 按模式失效报表缓存
     * 
     * @param reportType 报表类型
     * @param pattern 缓存键模式
     */
    void invalidateReportCacheByPattern(String reportType, String pattern);

    /**
     * 预计算报表数据
     * 
     * @param reportType 报表类型
     * @param cacheKey 缓存键
     * @param data 数据
     */
    void precomputeReport(String reportType, String cacheKey, Object data);

    /**
     * 检查报表缓存是否有效
     * 
     * @param reportType 报表类型
     * @param cacheKey 缓存键
     * @return 是否有效
     */
    boolean isReportCacheValid(String reportType, String cacheKey);

    /**
     * 获取报表缓存统计信息
     * 
     * @return 统计信息
     */
    Map<String, Object> getReportCacheStats();

    /**
     * 刷新过期的缓存
     */
    void refreshExpiredCaches();

    /**
     * 预热缓存
     * 
     * @param reportTypes 需要预热的报表类型列表
     */
    void warmupCache(List<String> reportTypes);
}