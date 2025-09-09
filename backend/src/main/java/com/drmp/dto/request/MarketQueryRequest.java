package com.drmp.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * 案件市场查询请求DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketQueryRequest {
    
    /**
     * 关键词搜索（案件包名称、编号、描述）
     */
    private String keyword;
    
    /**
     * 案源机构ID列表
     */
    private List<Long> sourceOrgIds;
    
    /**
     * 最小金额
     */
    private BigDecimal minAmount;
    
    /**
     * 最大金额
     */
    private BigDecimal maxAmount;
    
    /**
     * 最小案件数量
     */
    private Integer minCaseCount;
    
    /**
     * 最大案件数量
     */
    private Integer maxCaseCount;
    
    /**
     * 地域列表
     */
    private List<String> regions;
    
    /**
     * 债务类型列表
     */
    private List<String> debtTypes;
    
    /**
     * 处置方式偏好（调解/诉讼）
     */
    private String disposalPreference;
    
    /**
     * 最小期望回收率
     */
    private BigDecimal minExpectedRecoveryRate;
    
    /**
     * 最大期望回收率
     */
    private BigDecimal maxExpectedRecoveryRate;
    
    /**
     * 竞标截止日期起始
     */
    private LocalDate biddingEndDateFrom;
    
    /**
     * 竞标截止日期结束
     */
    private LocalDate biddingEndDateTo;
    
    /**
     * 是否仅显示可竞标的
     */
    private Boolean onlyBiddable;
    
    /**
     * 是否仅显示收藏的
     */
    private Boolean onlyFavorites;
    
    /**
     * 排序字段
     */
    private String sortBy;
    
    /**
     * 排序方向
     */
    private String sortDirection;
}