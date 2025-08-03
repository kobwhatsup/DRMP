package com.drmp.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 仪表盘响应DTO
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardResponse {

    /**
     * 概览数据
     */
    private OverviewData overview;

    /**
     * 趋势数据
     */
    private List<TrendData> trends;

    /**
     * 图表数据
     */
    private Map<String, Object> charts;

    /**
     * 排行榜数据
     */
    private List<RankingData> rankings;

    /**
     * 概览数据
     */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OverviewData {
        private Integer totalCases;
        private Integer completedCases;
        private BigDecimal totalAmount;
        private BigDecimal recoveredAmount;
        private BigDecimal recoveryRate;
        private BigDecimal avgProcessingDays;
        
        // 案源方特有
        private Integer activePackages;
        private Integer partneredOrgs;
        
        // 处置方特有
        private Integer staffCount;
        private BigDecimal casesPerStaff;
        private BigDecimal successRate;
        
        // 平台方特有
        private Integer totalOrgs;
        private Integer activeOrgs;
        private Long totalCasesLong;
        private BigDecimal totalRevenue;
    }

    /**
     * 趋势数据
     */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TrendData {
        private LocalDate date;
        private String label;
        private BigDecimal value;
        private Integer count;
        private String category;
    }

    /**
     * 排行榜数据
     */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RankingData {
        private Long id;
        private String name;
        private BigDecimal value;
        private Integer rank;
        private String category;
        private Map<String, Object> details;
    }

    /**
     * 分布数据
     */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DistributionData {
        private String name;
        private BigDecimal value;
        private Integer count;
        private BigDecimal percentage;
    }

    /**
     * 对比数据
     */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ComparisonData {
        private String name;
        private BigDecimal currentValue;
        private BigDecimal previousValue;
        private BigDecimal changeRate;
        private String changeDirection; // UP, DOWN, STABLE
    }
}