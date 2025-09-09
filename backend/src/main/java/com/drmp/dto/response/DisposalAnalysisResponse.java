package com.drmp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 处置分析响应DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisposalAnalysisResponse {

    /**
     * 查询时间范围
     */
    private QueryTimeRange queryTimeRange;

    /**
     * 总体统计数据
     */
    private OverviewStatistics overviewStatistics;

    /**
     * 趋势分析数据
     */
    private List<TrendDataPoint> trendData;

    /**
     * 机构绩效数据
     */
    private List<OrganizationPerformance> orgPerformanceData;

    /**
     * 类型分布数据
     */
    private List<TypeDistribution> typeDistributionData;

    /**
     * 效率分析数据
     */
    private EfficiencyAnalysis efficiencyAnalysis;

    /**
     * 地域分析数据
     */
    private List<RegionAnalysis> regionAnalysisData;

    /**
     * 预警数据
     */
    private List<AlertData> alertData;

    /**
     * 预测数据（可选）
     */
    private List<PredictionData> predictionData;

    /**
     * 查询时间范围信息
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QueryTimeRange {
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String aggregatePeriod;
    }

    /**
     * 总体统计数据
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverviewStatistics {
        private Long totalCases;
        private Long mediationCases;
        private Long litigationCases;
        private Long completedCases;
        private Long pendingCases;
        private BigDecimal successRate;
        private BigDecimal averageProcessingDays;
        private BigDecimal totalAmount;
        private BigDecimal recoveredAmount;
        private BigDecimal recoveryRate;
        private BigDecimal averageCost;

        // 同比数据
        private ComparisonData yearOverYear;
        // 环比数据
        private ComparisonData monthOverMonth;
    }

    /**
     * 趋势数据点
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendDataPoint {
        private String period;
        private LocalDateTime periodStart;
        private LocalDateTime periodEnd;
        private Long mediationCases;
        private Long litigationCases;
        private Long completedCases;
        private BigDecimal successRate;
        private BigDecimal averageProcessingDays;
        private BigDecimal recoveryRate;
        private BigDecimal totalAmount;
        private BigDecimal recoveredAmount;
    }

    /**
     * 机构绩效数据
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrganizationPerformance {
        private Long orgId;
        private String orgName;
        private String orgType;
        private Long totalCases;
        private Long completedCases;
        private BigDecimal successRate;
        private BigDecimal averageProcessingDays;
        private BigDecimal totalAmount;
        private BigDecimal recoveredAmount;
        private BigDecimal recoveryRate;
        private BigDecimal averageCost;
        private BigDecimal performanceScore;
        private String performanceRank;
    }

    /**
     * 类型分布数据
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TypeDistribution {
        private String type;
        private String typeName;
        private Long caseCount;
        private BigDecimal percentage;
        private BigDecimal totalAmount;
        private BigDecimal averageAmount;
        private String color;
    }

    /**
     * 效率分析数据
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EfficiencyAnalysis {
        private BigDecimal overallEfficiency;
        private BigDecimal mediationEfficiency;
        private BigDecimal litigationEfficiency;
        private List<EfficiencyTrend> efficiencyTrends;
        private List<BottleneckAnalysis> bottlenecks;
    }

    /**
     * 效率趋势
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EfficiencyTrend {
        private String period;
        private BigDecimal efficiency;
        private String trendDirection; // UP, DOWN, STABLE
    }

    /**
     * 瓶颈分析
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BottleneckAnalysis {
        private String processStage;
        private BigDecimal averageDays;
        private BigDecimal impactScore;
        private String suggestion;
    }

    /**
     * 地域分析数据
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegionAnalysis {
        private String regionCode;
        private String regionName;
        private Long caseCount;
        private BigDecimal successRate;
        private BigDecimal averageProcessingDays;
        private BigDecimal totalAmount;
        private BigDecimal recoveryRate;
    }

    /**
     * 预警数据
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlertData {
        private String alertType;
        private String alertLevel; // LOW, MEDIUM, HIGH, CRITICAL
        private String alertMessage;
        private Map<String, Object> alertDetails;
        private LocalDateTime alertTime;
        private String suggestedAction;
    }

    /**
     * 预测数据
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PredictionData {
        private String period;
        private LocalDateTime periodStart;
        private LocalDateTime periodEnd;
        private Long predictedCases;
        private BigDecimal predictedSuccessRate;
        private BigDecimal predictedRecoveryRate;
        private BigDecimal confidenceLevel;
        private String predictionModel;
    }

    /**
     * 对比数据
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComparisonData {
        private BigDecimal changeRate;
        private String changeDirection; // UP, DOWN, STABLE
        private String changeDescription;
        private Map<String, BigDecimal> detailedChanges;
    }
}