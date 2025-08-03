package com.drmp.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 案件市场响应DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaseMarketResponse {

    private Long id;

    private String packageNo;

    private String packageName;

    private String description;

    // 案源机构信息
    private Long sourceOrgId;

    private String sourceOrgName;

    private String sourceOrgType;

    // 案件统计
    private Integer totalCases;

    private BigDecimal totalAmount;

    private BigDecimal averageAmount;

    private BigDecimal minAmount;

    private BigDecimal maxAmount;

    // 逾期信息
    private Integer averageOverdueDays;

    private Integer minOverdueDays;

    private Integer maxOverdueDays;

    // 地域分布
    private String primaryRegion;

    private List<RegionDistribution> regionDistribution;

    // 业务类型
    private String businessType;

    private String businessTypeName;

    private List<String> caseTypes;

    // 发布信息
    private String status;

    private String statusName;

    private String priority;

    private String priorityName;

    private LocalDateTime publishedAt;

    private LocalDateTime deadline;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // 竞标信息
    private Boolean allowBidding;

    private Integer maxBidders;

    private Integer currentBidders;

    private Boolean hasApplied;

    private Boolean isFavorite;

    private BigDecimal suggestedBidAmount;

    private BigDecimal averageBidAmount;

    private BigDecimal lowestBidAmount;

    private BigDecimal highestBidAmount;

    // 匹配信息
    private Integer matchScore;

    private String matchReason;

    private List<String> matchFactors;

    // 要求条件
    private String requirements;

    private String qualificationRequirements;

    private String experienceRequirements;

    private String regionRequirements;

    private BigDecimal minRecoveryRate;

    private Integer maxProcessingDays;

    private String serviceRequirements;

    // 附加信息
    private List<String> attachmentUrls;

    private Map<String, Object> extraData;

    private List<String> tags;

    // 历史信息
    private BigDecimal historicalRecoveryRate;

    private Integer historicalAverageProcessingDays;

    private String remark;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegionDistribution {
        private String province;
        private String city;
        private String district;
        private Integer caseCount;
        private BigDecimal amount;
        private Double percentage;
    }
}