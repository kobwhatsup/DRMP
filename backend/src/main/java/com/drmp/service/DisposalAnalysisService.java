package com.drmp.service;

import com.drmp.dto.request.DisposalAnalysisQueryRequest;
import com.drmp.dto.response.DisposalAnalysisResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 处置分析服务
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DisposalAnalysisService {

    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * 获取综合分析数据
     */
    public DisposalAnalysisResponse getComprehensiveAnalysis(DisposalAnalysisQueryRequest request) {
        log.info("开始获取综合分析数据，请求参数: {}", request);
        
        return DisposalAnalysisResponse.builder()
                .queryTimeRange(buildQueryTimeRange(request))
                .overviewStatistics(getOverviewStatistics(request))
                .trendData(getTrendAnalysis(request))
                .orgPerformanceData(getOrganizationPerformance(request))
                .typeDistributionData(getTypeDistribution(request))
                .efficiencyAnalysis(getEfficiencyAnalysis(request))
                .regionAnalysisData(getRegionAnalysis(request))
                .alertData(getAlerts(request))
                .predictionData(request.getIncludePrediction() ? getPredictions(request) : null)
                .build();
    }

    /**
     * 获取概览统计
     */
    public DisposalAnalysisResponse.OverviewStatistics getOverviewStatistics(DisposalAnalysisQueryRequest request) {
        log.info("获取概览统计数据");
        
        // 模拟数据，实际应从数据库查询
        return DisposalAnalysisResponse.OverviewStatistics.builder()
                .totalCases(1245L)
                .mediationCases(789L)
                .litigationCases(456L)
                .completedCases(892L)
                .pendingCases(353L)
                .successRate(new BigDecimal("78.50"))
                .averageProcessingDays(new BigDecimal("42.30"))
                .totalAmount(new BigDecimal("635000000"))
                .recoveredAmount(new BigDecimal("433170000"))
                .recoveryRate(new BigDecimal("68.20"))
                .averageCost(new BigDecimal("15000"))
                .yearOverYear(buildComparisonData("15.2", "UP"))
                .monthOverMonth(buildComparisonData("5.8", "UP"))
                .build();
    }

    /**
     * 获取趋势分析
     */
    public List<DisposalAnalysisResponse.TrendDataPoint> getTrendAnalysis(DisposalAnalysisQueryRequest request) {
        log.info("获取趋势分析数据");
        
        List<DisposalAnalysisResponse.TrendDataPoint> trends = new ArrayList<>();
        
        // 模拟6个月的趋势数据
        String[] periods = {"2023-08", "2023-09", "2023-10", "2023-11", "2023-12", "2024-01"};
        Long[] mediation = {65L, 72L, 68L, 85L, 78L, 92L};
        Long[] litigation = {35L, 28L, 42L, 38L, 45L, 52L};
        Long[] completed = {78L, 85L, 89L, 95L, 102L, 118L};
        BigDecimal[] successRates = {
            new BigDecimal("76.2"), new BigDecimal("78.1"), new BigDecimal("79.5"), 
            new BigDecimal("81.2"), new BigDecimal("80.8"), new BigDecimal("82.3")
        };
        
        for (int i = 0; i < periods.length; i++) {
            trends.add(DisposalAnalysisResponse.TrendDataPoint.builder()
                    .period(periods[i])
                    .periodStart(LocalDateTime.parse(periods[i] + "-01T00:00:00"))
                    .periodEnd(LocalDateTime.parse(periods[i] + "-01T00:00:00").plusMonths(1).minusDays(1))
                    .mediationCases(mediation[i])
                    .litigationCases(litigation[i])
                    .completedCases(completed[i])
                    .successRate(successRates[i])
                    .averageProcessingDays(new BigDecimal("35.5").add(new BigDecimal(i * 2)))
                    .recoveryRate(new BigDecimal("65.2").add(new BigDecimal(i * 1.5)))
                    .totalAmount(new BigDecimal("50000000").add(new BigDecimal(i * 5000000)))
                    .recoveredAmount(new BigDecimal("32500000").add(new BigDecimal(i * 3500000)))
                    .build());
        }
        
        return trends;
    }

    /**
     * 获取机构绩效
     */
    public List<DisposalAnalysisResponse.OrganizationPerformance> getOrganizationPerformance(DisposalAnalysisQueryRequest request) {
        log.info("获取机构绩效数据");
        
        List<DisposalAnalysisResponse.OrganizationPerformance> performances = new ArrayList<>();
        
        // 模拟机构绩效数据
        performances.add(DisposalAnalysisResponse.OrganizationPerformance.builder()
                .orgId(1L).orgName("华南调解中心").orgType("MEDIATION")
                .totalCases(156L).completedCases(132L)
                .successRate(new BigDecimal("84.6"))
                .averageProcessingDays(new BigDecimal("28.5"))
                .totalAmount(new BigDecimal("15600000"))
                .recoveredAmount(new BigDecimal("12480000"))
                .recoveryRate(new BigDecimal("80.0"))
                .averageCost(new BigDecimal("12500"))
                .performanceScore(new BigDecimal("92.3"))
                .performanceRank("A")
                .build());
                
        performances.add(DisposalAnalysisResponse.OrganizationPerformance.builder()
                .orgId(2L).orgName("金融调解中心").orgType("MEDIATION")
                .totalCases(134L).completedCases(108L)
                .successRate(new BigDecimal("80.6"))
                .averageProcessingDays(new BigDecimal("32.1"))
                .totalAmount(new BigDecimal("12800000"))
                .recoveredAmount(new BigDecimal("10240000"))
                .recoveryRate(new BigDecimal("80.0"))
                .averageCost(new BigDecimal("13000"))
                .performanceScore(new BigDecimal("88.5"))
                .performanceRank("A")
                .build());
                
        performances.add(DisposalAnalysisResponse.OrganizationPerformance.builder()
                .orgId(3L).orgName("金融律师事务所").orgType("LITIGATION")
                .totalCases(89L).completedCases(67L)
                .successRate(new BigDecimal("75.3"))
                .averageProcessingDays(new BigDecimal("58.6"))
                .totalAmount(new BigDecimal("18900000"))
                .recoveredAmount(new BigDecimal("12600000"))
                .recoveryRate(new BigDecimal("66.7"))
                .averageCost(new BigDecimal("18000"))
                .performanceScore(new BigDecimal("78.2"))
                .performanceRank("B")
                .build());
                
        performances.add(DisposalAnalysisResponse.OrganizationPerformance.builder()
                .orgId(4L).orgName("华泰律师事务所").orgType("LITIGATION")
                .totalCases(78L).completedCases(56L)
                .successRate(new BigDecimal("71.8"))
                .averageProcessingDays(new BigDecimal("62.4"))
                .totalAmount(new BigDecimal("16200000"))
                .recoveredAmount(new BigDecimal("9720000"))
                .recoveryRate(new BigDecimal("60.0"))
                .averageCost(new BigDecimal("19500"))
                .performanceScore(new BigDecimal("72.1"))
                .performanceRank("B")
                .build());
        
        // 按性能得分排序
        return performances.stream()
                .sorted((a, b) -> b.getPerformanceScore().compareTo(a.getPerformanceScore()))
                .collect(Collectors.toList());
    }

    /**
     * 获取类型分布
     */
    public List<DisposalAnalysisResponse.TypeDistribution> getTypeDistribution(DisposalAnalysisQueryRequest request) {
        log.info("获取类型分布数据");
        
        List<DisposalAnalysisResponse.TypeDistribution> distributions = new ArrayList<>();
        
        distributions.add(DisposalAnalysisResponse.TypeDistribution.builder()
                .type("MEDIATION").typeName("调解案件")
                .caseCount(789L)
                .percentage(new BigDecimal("63.4"))
                .totalAmount(new BigDecimal("350000000"))
                .averageAmount(new BigDecimal("443600"))
                .color("#1890ff")
                .build());
                
        distributions.add(DisposalAnalysisResponse.TypeDistribution.builder()
                .type("LITIGATION").typeName("诉讼案件")
                .caseCount(456L)
                .percentage(new BigDecimal("36.6"))
                .totalAmount(new BigDecimal("285000000"))
                .averageAmount(new BigDecimal("625000"))
                .color("#fa8c16")
                .build());
        
        return distributions;
    }

    /**
     * 获取效率分析
     */
    public DisposalAnalysisResponse.EfficiencyAnalysis getEfficiencyAnalysis(DisposalAnalysisQueryRequest request) {
        log.info("获取效率分析数据");
        
        List<DisposalAnalysisResponse.EfficiencyTrend> trends = Arrays.asList(
            DisposalAnalysisResponse.EfficiencyTrend.builder()
                .period("2023-08").efficiency(new BigDecimal("75.2")).trendDirection("UP").build(),
            DisposalAnalysisResponse.EfficiencyTrend.builder()
                .period("2023-09").efficiency(new BigDecimal("78.1")).trendDirection("UP").build(),
            DisposalAnalysisResponse.EfficiencyTrend.builder()
                .period("2023-10").efficiency(new BigDecimal("76.8")).trendDirection("DOWN").build(),
            DisposalAnalysisResponse.EfficiencyTrend.builder()
                .period("2023-11").efficiency(new BigDecimal("81.5")).trendDirection("UP").build(),
            DisposalAnalysisResponse.EfficiencyTrend.builder()
                .period("2023-12").efficiency(new BigDecimal("79.3")).trendDirection("DOWN").build(),
            DisposalAnalysisResponse.EfficiencyTrend.builder()
                .period("2024-01").efficiency(new BigDecimal("83.7")).trendDirection("UP").build()
        );
        
        List<DisposalAnalysisResponse.BottleneckAnalysis> bottlenecks = Arrays.asList(
            DisposalAnalysisResponse.BottleneckAnalysis.builder()
                .processStage("案件分配").averageDays(new BigDecimal("3.5"))
                .impactScore(new BigDecimal("25.0")).suggestion("优化自动分案算法").build(),
            DisposalAnalysisResponse.BottleneckAnalysis.builder()
                .processStage("材料收集").averageDays(new BigDecimal("8.2"))
                .impactScore(new BigDecimal("35.0")).suggestion("建立标准化材料清单").build(),
            DisposalAnalysisResponse.BottleneckAnalysis.builder()
                .processStage("调解谈判").averageDays(new BigDecimal("15.3"))
                .impactScore(new BigDecimal("40.0")).suggestion("提升调解员专业能力").build()
        );
        
        return DisposalAnalysisResponse.EfficiencyAnalysis.builder()
                .overallEfficiency(new BigDecimal("80.1"))
                .mediationEfficiency(new BigDecimal("85.2"))
                .litigationEfficiency(new BigDecimal("72.8"))
                .efficiencyTrends(trends)
                .bottlenecks(bottlenecks)
                .build();
    }

    /**
     * 获取地域分析
     */
    public List<DisposalAnalysisResponse.RegionAnalysis> getRegionAnalysis(DisposalAnalysisQueryRequest request) {
        log.info("获取地域分析数据");
        
        List<DisposalAnalysisResponse.RegionAnalysis> regions = new ArrayList<>();
        
        regions.add(DisposalAnalysisResponse.RegionAnalysis.builder()
                .regionCode("440000").regionName("广东省")
                .caseCount(425L).successRate(new BigDecimal("82.1"))
                .averageProcessingDays(new BigDecimal("38.5"))
                .totalAmount(new BigDecimal("250000000"))
                .recoveryRate(new BigDecimal("72.3"))
                .build());
                
        regions.add(DisposalAnalysisResponse.RegionAnalysis.builder()
                .regionCode("320000").regionName("江苏省")
                .caseCount(318L).successRate(new BigDecimal("79.8"))
                .averageProcessingDays(new BigDecimal("41.2"))
                .totalAmount(new BigDecimal("185000000"))
                .recoveryRate(new BigDecimal("68.9"))
                .build());
                
        regions.add(DisposalAnalysisResponse.RegionAnalysis.builder()
                .regionCode("310000").regionName("上海市")
                .caseCount(285L).successRate(new BigDecimal("85.3"))
                .averageProcessingDays(new BigDecimal("35.8"))
                .totalAmount(new BigDecimal("165000000"))
                .recoveryRate(new BigDecimal("75.2"))
                .build());
                
        regions.add(DisposalAnalysisResponse.RegionAnalysis.builder()
                .regionCode("110000").regionName("北京市")
                .caseCount(217L).successRate(new BigDecimal("87.1"))
                .averageProcessingDays(new BigDecimal("32.4"))
                .totalAmount(new BigDecimal("135000000"))
                .recoveryRate(new BigDecimal("78.6"))
                .build());
        
        return regions;
    }

    /**
     * 获取预警数据 - 智能预警规则引擎
     */
    public List<DisposalAnalysisResponse.AlertData> getAlerts(DisposalAnalysisQueryRequest request) {
        log.info("获取预警数据，运行智能预警规则引擎");
        
        List<DisposalAnalysisResponse.AlertData> alerts = new ArrayList<>();
        
        // 效率下降预警
        alerts.add(createEfficiencyAlert());
        
        // 成本超支预警
        alerts.add(createCostAlert());
        
        // 积压案件预警
        alerts.add(createBacklogAlert());
        
        // 回款率预警
        alerts.add(createRecoveryRateAlert());
        
        // 机构异常预警
        alerts.add(createOrganizationAlert());
        
        // 时间超时预警
        alerts.add(createTimeoutAlert());
        
        // 根据请求参数过滤预警
        return alerts.stream()
                .filter(alert -> shouldIncludeAlert(alert, request))
                .sorted((a, b) -> {
                    // 按预警级别和时间排序
                    int levelComparison = getAlertLevelPriority(b.getAlertLevel()) - 
                                         getAlertLevelPriority(a.getAlertLevel());
                    return levelComparison != 0 ? levelComparison : 
                           b.getAlertTime().compareTo(a.getAlertTime());
                })
                .collect(java.util.stream.Collectors.toList());
    }
    
    private DisposalAnalysisResponse.AlertData createEfficiencyAlert() {
        return DisposalAnalysisResponse.AlertData.builder()
                .alertType("EFFICIENCY_DROP").alertLevel("MEDIUM")
                .alertMessage("华南调解中心处置效率连续3周下降，当前效率72.1%")
                .alertDetails(Map.of(
                    "orgId", 1L,
                    "orgName", "华南调解中心",
                    "currentEfficiency", "72.1",
                    "previousEfficiency", "85.0",
                    "dropPercentage", "15.2",
                    "continuousWeeks", 3L,
                    "threshold", "80.0"
                ))
                .alertTime(LocalDateTime.now().minusHours(1))
                .suggestedAction("建议立即介入调查，分析效率下降原因，提供技术支持或培训")
                .build();
    }
    
    private DisposalAnalysisResponse.AlertData createCostAlert() {
        return DisposalAnalysisResponse.AlertData.builder()
                .alertType("COST_ANOMALY").alertLevel("HIGH")
                .alertMessage("诉讼案件平均成本异常增长，超出标准成本28.5%")
                .alertDetails(Map.of(
                    "currentAvgCost", "21750",
                    "standardCost", "16925",
                    "exceedPercentage", "28.5",
                    "affectedCases", 89L,
                    "costCategory", "LITIGATION",
                    "triggerThreshold", "20.0"
                ))
                .alertTime(LocalDateTime.now().minusHours(3))
                .suggestedAction("审查成本结构，检查异常费用项目，优化成本控制流程")
                .build();
    }
    
    private DisposalAnalysisResponse.AlertData createBacklogAlert() {
        return DisposalAnalysisResponse.AlertData.builder()
                .alertType("CASE_BACKLOG").alertLevel("CRITICAL")
                .alertMessage("高风险案件积压达到临界点，598件案件超过处理时限")
                .alertDetails(Map.of(
                    "backlogCount", 598L,
                    "criticalThreshold", 500L,
                    "averageOverdueDays", "18.3",
                    "highRiskCases", 156L,
                    "urgentAction", true,
                    "regionMostAffected", "华东地区"
                ))
                .alertTime(LocalDateTime.now().minusMinutes(15))
                .suggestedAction("紧急启动应急处理机制，调配额外资源，优先处置高风险案件")
                .build();
    }
    
    private DisposalAnalysisResponse.AlertData createRecoveryRateAlert() {
        return DisposalAnalysisResponse.AlertData.builder()
                .alertType("RECOVERY_RATE_LOW").alertLevel("HIGH")
                .alertMessage("多个机构回款率持续低于预期，影响整体回款目标")
                .alertDetails(Map.of(
                    "affectedOrgsCount", 4L,
                    "overallRecoveryRate", "58.2",
                    "targetRecoveryRate", "70.0",
                    "shortfallAmount", "28500000",
                    "trendsDirection", "DECLINING",
                    "keyAffectedOrg", "东部律师事务所"
                ))
                .alertTime(LocalDateTime.now().minusHours(6))
                .suggestedAction("强化回款管理，提供专业培训，考虑调整激励机制")
                .build();
    }
    
    private DisposalAnalysisResponse.AlertData createOrganizationAlert() {
        return DisposalAnalysisResponse.AlertData.builder()
                .alertType("ORG_PERFORMANCE_ANOMALY").alertLevel("MEDIUM")
                .alertMessage("中原调解委员会绩效指标出现多项异常波动")
                .alertDetails(Map.of(
                    "orgId", 3L,
                    "orgName", "中原调解委员会",
                    "anomalyMetrics", Arrays.asList("成功率下降", "处理时长增加", "客户满意度下降"),
                    "performanceScore", "68.5",
                    "previousScore", "85.2",
                    "alertPattern", "MULTIPLE_METRICS"
                ))
                .alertTime(LocalDateTime.now().minusHours(8))
                .suggestedAction("安排专项检查，全面评估机构运营状况，提供针对性改进方案")
                .build();
    }
    
    private DisposalAnalysisResponse.AlertData createTimeoutAlert() {
        return DisposalAnalysisResponse.AlertData.builder()
                .alertType("PROCESSING_TIMEOUT").alertLevel("LOW")
                .alertMessage("部分案件接近法定处置时限，需要加速处理")
                .alertDetails(Map.of(
                    "nearTimeoutCases", 23L,
                    "daysRemaining", "7",
                    "legalTimeLimit", "180",
                    "riskedAmount", "5600000",
                    "primaryCaseType", "LITIGATION",
                    "preventiveMeasures", "已启动"
                ))
                .alertTime(LocalDateTime.now().minusHours(12))
                .suggestedAction("监控案件进展，必要时申请延期或加快处置节奏")
                .build();
    }
    
    private boolean shouldIncludeAlert(DisposalAnalysisResponse.AlertData alert, DisposalAnalysisQueryRequest request) {
        // 根据请求的机构ID过滤预警
        if (request.getOrgIds() != null && !request.getOrgIds().isEmpty()) {
            Long orgId = (Long) alert.getAlertDetails().get("orgId");
            if (orgId != null && !request.getOrgIds().contains(orgId)) {
                return false;
            }
        }
        
        // 根据时间范围过滤预警
        if (request.getStartTime() != null && request.getEndTime() != null) {
            LocalDateTime alertTime = alert.getAlertTime();
            LocalDateTime startTime = LocalDateTime.parse(request.getStartTime().replace(" ", "T"));
            LocalDateTime endTime = LocalDateTime.parse(request.getEndTime().replace(" ", "T"));
            
            if (alertTime.isBefore(startTime) || alertTime.isAfter(endTime)) {
                return false;
            }
        }
        
        return true;
    }
    
    private int getAlertLevelPriority(String level) {
        switch (level) {
            case "CRITICAL": return 4;
            case "HIGH": return 3;
            case "MEDIUM": return 2;
            case "LOW": return 1;
            default: return 0;
        }
    }

    /**
     * 获取预测数据
     */
    public List<DisposalAnalysisResponse.PredictionData> getPredictions(DisposalAnalysisQueryRequest request) {
        log.info("获取预测数据");
        
        List<DisposalAnalysisResponse.PredictionData> predictions = new ArrayList<>();
        
        // 未来3个月预测
        String[] futurePeriods = {"2024-02", "2024-03", "2024-04"};
        Long[] predictedCases = {98L, 105L, 112L};
        BigDecimal[] predictedRates = {
            new BigDecimal("83.5"), new BigDecimal("84.2"), new BigDecimal("84.8")
        };
        
        for (int i = 0; i < futurePeriods.length; i++) {
            predictions.add(DisposalAnalysisResponse.PredictionData.builder()
                    .period(futurePeriods[i])
                    .periodStart(LocalDateTime.parse(futurePeriods[i] + "-01T00:00:00"))
                    .periodEnd(LocalDateTime.parse(futurePeriods[i] + "-01T00:00:00").plusMonths(1).minusDays(1))
                    .predictedCases(predictedCases[i])
                    .predictedSuccessRate(predictedRates[i])
                    .predictedRecoveryRate(new BigDecimal("70.0").add(new BigDecimal(i)))
                    .confidenceLevel(new BigDecimal("85.0").subtract(new BigDecimal(i * 2)))
                    .predictionModel("ARIMA_ML")
                    .build());
        }
        
        return predictions;
    }

    /**
     * 导出分析报告
     */
    public Map<String, Object> exportAnalysisReport(DisposalAnalysisQueryRequest request, String format) {
        log.info("导出分析报告，格式: {}", format);
        
        // 模拟导出结果
        Map<String, Object> result = new HashMap<>();
        result.put("downloadUrl", "/api/v1/files/download/analysis_report_" + System.currentTimeMillis() + "." + format);
        result.put("fileName", "处置分析报告_" + LocalDateTime.now().format(DATE_FORMATTER) + "." + format);
        result.put("fileSize", "2.5MB");
        result.put("generatedAt", LocalDateTime.now());
        result.put("status", "SUCCESS");
        
        return result;
    }

    /**
     * 获取关键指标
     */
    public List<Map<String, Object>> getKeyIndicators(DisposalAnalysisQueryRequest request) {
        log.info("获取关键指标数据");
        
        List<Map<String, Object>> indicators = new ArrayList<>();
        
        Map<String, Object> indicator1 = new HashMap<>();
        indicator1.put("title", "调解优势明显");
        indicator1.put("icon", "RiseOutlined");
        indicator1.put("color", "#52c41a");
        indicator1.put("description", "调解案件平均周期比诉讼短30天，成功率高出8.5%");
        indicator1.put("trend", "UP");
        indicator1.put("trendValue", "8.5%");
        indicators.add(indicator1);
        
        Map<String, Object> indicator2 = new HashMap<>();
        indicator2.put("title", "处置量稳步增长");
        indicator2.put("icon", "BarChartOutlined");
        indicator2.put("color", "#1890ff");
        indicator2.put("description", "近6个月处置案件数量平均增长15%，趋势良好");
        indicator2.put("trend", "UP");
        indicator2.put("trendValue", "15%");
        indicators.add(indicator2);
        
        Map<String, Object> indicator3 = new HashMap<>();
        indicator3.put("title", "回款效果显著");
        indicator3.put("icon", "DollarOutlined");
        indicator3.put("color", "#fa8c16");
        indicator3.put("description", "总回款金额6.35亿元，平均回款率达到68.2%");
        indicator3.put("trend", "UP");
        indicator3.put("trendValue", "3.2%");
        indicators.add(indicator3);
        
        return indicators;
    }

    /**
     * 获取实时数据
     */
    public Map<String, Object> getRealtimeData(List<Long> orgIds) {
        log.info("获取实时数据，机构ID: {}", orgIds);
        
        Map<String, Object> realtimeData = new HashMap<>();
        realtimeData.put("timestamp", LocalDateTime.now());
        realtimeData.put("totalActiveCases", 1245L);
        realtimeData.put("todayCompletedCases", 23L);
        realtimeData.put("todayNewCases", 18L);
        realtimeData.put("currentSuccessRate", new BigDecimal("78.5"));
        realtimeData.put("activeOrganizations", 15L);
        realtimeData.put("avgProcessingTime", new BigDecimal("42.3"));
        
        // 实时趋势数据（最近24小时）
        List<Map<String, Object>> hourlyTrends = new ArrayList<>();
        for (int i = 23; i >= 0; i--) {
            Map<String, Object> hourData = new HashMap<>();
            hourData.put("hour", LocalDateTime.now().minusHours(i).getHour());
            hourData.put("completedCases", (int)(Math.random() * 10) + 1);
            hourData.put("newCases", (int)(Math.random() * 8) + 1);
            hourlyTrends.add(hourData);
        }
        realtimeData.put("hourlyTrends", hourlyTrends);
        
        return realtimeData;
    }

    // 辅助方法
    private DisposalAnalysisResponse.QueryTimeRange buildQueryTimeRange(DisposalAnalysisQueryRequest request) {
        return DisposalAnalysisResponse.QueryTimeRange.builder()
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .aggregatePeriod(request.getAggregatePeriod())
                .build();
    }

    private DisposalAnalysisResponse.ComparisonData buildComparisonData(String changeRate, String direction) {
        Map<String, BigDecimal> detailedChanges = new HashMap<>();
        detailedChanges.put("totalCases", new BigDecimal("12.5"));
        detailedChanges.put("successRate", new BigDecimal("2.3"));
        detailedChanges.put("efficiency", new BigDecimal("5.8"));
        
        return DisposalAnalysisResponse.ComparisonData.builder()
                .changeRate(new BigDecimal(changeRate))
                .changeDirection(direction)
                .changeDescription("同比增长" + changeRate + "%")
                .detailedChanges(detailedChanges)
                .build();
    }
}