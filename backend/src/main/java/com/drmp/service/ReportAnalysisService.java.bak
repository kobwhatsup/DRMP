package com.drmp.service;

import com.drmp.dto.request.DashboardQueryRequest;
import com.drmp.dto.response.DashboardResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 报表分析服务接口
 */
public interface ReportAnalysisService {

    /**
     * 获取案源方业绩看板
     * 
     * @param organizationId 机构ID
     * @param request 查询请求
     * @return 仪表盘数据
     */
    DashboardResponse getSourceOrgDashboard(Long organizationId, DashboardQueryRequest request);

    /**
     * 获取处置方效能看板
     * 
     * @param organizationId 机构ID
     * @param request 查询请求
     * @return 仪表盘数据
     */
    DashboardResponse getDisposalOrgDashboard(Long organizationId, DashboardQueryRequest request);

    /**
     * 获取平台运营看板
     * 
     * @param request 查询请求
     * @return 仪表盘数据
     */
    DashboardResponse getPlatformOperationDashboard(DashboardQueryRequest request);

    /**
     * 获取案源方业绩对比（多个处置机构对比）
     * 
     * @param sourceOrgId 案源机构ID
     * @param request 查询请求
     * @return 处置机构业绩对比数据
     */
    List<DashboardResponse.RankingData> getDisposalOrgPerformanceComparison(Long sourceOrgId, DashboardQueryRequest request);

    /**
     * 获取处置方内部人员业绩排行
     * 
     * @param disposalOrgId 处置机构ID
     * @param request 查询请求
     * @return 人员业绩排行数据
     */
    List<DashboardResponse.RankingData> getStaffPerformanceRanking(Long disposalOrgId, DashboardQueryRequest request);

    /**
     * 获取案件类型分析
     * 
     * @param organizationId 机构ID（可选）
     * @param request 查询请求
     * @return 案件类型分析数据
     */
    List<DashboardResponse.DistributionData> getCaseTypeAnalysis(Long organizationId, DashboardQueryRequest request);

    /**
     * 获取地域分析
     * 
     * @param organizationId 机构ID（可选）
     * @param request 查询请求
     * @return 地域分析数据
     */
    List<DashboardResponse.DistributionData> getRegionalAnalysis(Long organizationId, DashboardQueryRequest request);

    /**
     * 获取回款趋势分析
     * 
     * @param organizationId 机构ID（可选）
     * @param request 查询请求
     * @return 回款趋势数据
     */
    List<DashboardResponse.TrendData> getRecoveryTrendAnalysis(Long organizationId, DashboardQueryRequest request);

    /**
     * 获取案件状态分布
     * 
     * @param organizationId 机构ID（可选）
     * @param request 查询请求
     * @return 案件状态分布数据
     */
    List<DashboardResponse.DistributionData> getCaseStatusDistribution(Long organizationId, DashboardQueryRequest request);

    /**
     * 获取实时统计数据
     * 
     * @param organizationId 机构ID（可选）
     * @return 实时统计数据
     */
    Map<String, Object> getRealTimeStatistics(Long organizationId);

    /**
     * 生成统计报表
     * 
     * @param organizationId 机构ID
     * @param reportType 报表类型
     * @param request 查询请求
     * @return 报表文件路径
     */
    String generateStatisticsReport(Long organizationId, String reportType, DashboardQueryRequest request);

    /**
     * 聚合每日统计数据（定时任务调用）
     * 
     * @param date 统计日期
     */
    void aggregateDailyStatistics(LocalDate date);

    /**
     * 获取机构活跃度趋势
     * 
     * @param request 查询请求
     * @return 机构活跃度趋势数据
     */
    List<DashboardResponse.TrendData> getOrganizationActivityTrend(DashboardQueryRequest request);

    /**
     * 获取平台收入分析
     * 
     * @param request 查询请求
     * @return 收入分析数据
     */
    Map<String, Object> getPlatformRevenueAnalysis(DashboardQueryRequest request);

    /**
     * 获取处置方式效果对比
     * 
     * @param organizationId 机构ID（可选）
     * @param request 查询请求
     * @return 处置方式效果对比数据
     */
    List<DashboardResponse.ComparisonData> getDisposalMethodEffectiveness(Long organizationId, DashboardQueryRequest request);
}