package com.drmp.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

/**
 * 仪表盘查询请求DTO
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardQueryRequest {

    /**
     * 开始日期
     */
    @NotNull(message = "开始日期不能为空")
    private LocalDate startDate;

    /**
     * 结束日期
     */
    @NotNull(message = "结束日期不能为空")
    private LocalDate endDate;

    /**
     * 机构ID（可选，用于机构级别的数据筛选）
     */
    private Long organizationId;

    /**
     * 机构类型（可选）
     */
    private String organizationType;

    /**
     * 地区编码列表（可选）
     */
    private List<String> regionCodes;

    /**
     * 案件类型列表（可选）
     */
    private List<String> caseTypes;

    /**
     * 数据维度
     */
    private String dimension; // DAILY, WEEKLY, MONTHLY

    /**
     * 指标类型列表
     */
    private List<String> metrics;

    /**
     * 排序字段
     */
    private String sortBy;

    /**
     * 排序方向
     */
    private String sortDirection; // ASC, DESC

    /**
     * 限制结果数量（用于排行榜等）
     */
    private Integer limit;

    /**
     * 是否包含对比数据
     */
    private Boolean includeComparison;

    /**
     * 对比周期类型
     */
    private String comparisonPeriod; // PREVIOUS_PERIOD, SAME_PERIOD_LAST_YEAR

    /**
     * 获取时间范围的天数
     */
    public long getDaysBetween() {
        if (startDate != null && endDate != null) {
            return java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
        }
        return 0;
    }

    /**
     * 验证日期范围
     */
    public boolean isValidDateRange() {
        return startDate != null && endDate != null && !startDate.isAfter(endDate);
    }

    /**
     * 获取对比期间的开始日期
     */
    public LocalDate getComparisonStartDate() {
        if (startDate == null || comparisonPeriod == null) {
            return null;
        }
        
        long days = getDaysBetween();
        switch (comparisonPeriod) {
            case "PREVIOUS_PERIOD":
                return startDate.minusDays(days);
            case "SAME_PERIOD_LAST_YEAR":
                return startDate.minusYears(1);
            default:
                return null;
        }
    }

    /**
     * 获取对比期间的结束日期
     */
    public LocalDate getComparisonEndDate() {
        if (endDate == null || comparisonPeriod == null) {
            return null;
        }
        
        switch (comparisonPeriod) {
            case "PREVIOUS_PERIOD":
                return startDate.minusDays(1);
            case "SAME_PERIOD_LAST_YEAR":
                return endDate.minusYears(1);
            default:
                return null;
        }
    }
}