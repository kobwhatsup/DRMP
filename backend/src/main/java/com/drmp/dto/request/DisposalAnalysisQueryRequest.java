package com.drmp.dto.request;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 处置分析查询请求DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class DisposalAnalysisQueryRequest extends BasePageRequest {

    /**
     * 开始时间
     */
    @NotNull(message = "开始时间不能为空")
    private LocalDateTime startTime;

    /**
     * 结束时间
     */
    @NotNull(message = "结束时间不能为空")
    private LocalDateTime endTime;

    /**
     * 处置机构ID列表（可选，为空表示查询所有）
     */
    private List<Long> orgIds;

    /**
     * 处置方式列表（可选，为空表示查询所有）
     * MEDIATION - 调解, LITIGATION - 诉讼
     */
    private List<String> disposalTypes;

    /**
     * 案件状态列表（可选，为空表示查询所有）
     */
    private List<String> caseStatuses;

    /**
     * 地域代码列表（可选，为空表示查询所有）
     */
    private List<String> regionCodes;

    /**
     * 金额范围 - 最小值
     */
    private Long minAmount;

    /**
     * 金额范围 - 最大值
     */
    private Long maxAmount;

    /**
     * 分析维度
     * OVERVIEW - 概览, TREND - 趋势, PERFORMANCE - 绩效, DISTRIBUTION - 分布, EFFICIENCY - 效率
     */
    private String analysisDimension;

    /**
     * 聚合周期
     * DAY - 日, WEEK - 周, MONTH - 月, QUARTER - 季度, YEAR - 年
     */
    private String aggregatePeriod;

    /**
     * 是否包含预测数据
     */
    private Boolean includePrediction = false;

    /**
     * 对比分析类型
     * NONE - 无对比, YEAR_OVER_YEAR - 同比, MONTH_OVER_MONTH - 环比
     */
    private String comparisonType = "NONE";
}