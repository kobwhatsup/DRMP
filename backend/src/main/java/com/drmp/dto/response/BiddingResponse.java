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
 * 竞标响应DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BiddingResponse {

    private Long id;

    private String biddingNo;

    // 案件包信息
    private Long casePackageId;

    private String casePackageNo;

    private String casePackageName;

    private BigDecimal casePackageTotalAmount;

    private Integer casePackageTotalCases;

    // 案源机构信息
    private Long sourceOrgId;

    private String sourceOrgName;

    // 处置机构信息
    private Long disposalOrgId;

    private String disposalOrgName;

    private String disposalOrgType;

    // 竞标信息
    private String proposal;

    private BigDecimal bidAmount;

    private BigDecimal promisedRecoveryRate;

    private Integer promisedProcessingDays;

    private String promiseConditions;

    // 状态信息
    private String status;

    private String statusName;

    private String priority;

    private String priorityName;

    // 时间信息
    private LocalDateTime submittedAt;

    private LocalDateTime validUntil;

    private LocalDateTime evaluatedAt;

    private LocalDateTime selectedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // 团队信息
    private String teamIntroduction;

    private String experienceDescription;

    private Integer teamSize;

    private String equipmentDescription;

    // 联系信息
    private String contactPerson;

    private String contactPhone;

    private String contactEmail;

    // 资质信息
    private List<String> certificationUrls;

    private List<String> caseStudyUrls;

    private List<String> referenceUrls;

    // 服务条款
    private BigDecimal serviceFeeRate;

    private BigDecimal depositAmount;

    private String paymentTerms;

    private String riskGuarantee;

    private String performanceBond;

    // 技术方案
    private String technicalSolution;

    private String qualityControlPlan;

    private String riskControlMeasures;

    private String emergencyPlan;

    private String systemIntegration;

    private Boolean has24HourService;

    // 评估信息
    private Integer evaluationScore;

    private String evaluationComment;

    private List<EvaluationCriteria> evaluationCriteria;

    private Integer ranking;

    private Boolean isWinning;

    private String winningReason;

    private String rejectionReason;

    // 创建信息
    private Long createdBy;

    private String createdByName;

    private Map<String, Object> extraData;

    private List<String> tags;

    private String remark;

    // 竞争信息
    private Integer totalCompetitors;

    private BigDecimal averageCompetitorBid;

    private Integer averageCompetitorRecoveryRate;

    private Boolean isBestBid;

    private Boolean isBestRecoveryRate;

    private Boolean isFastestProcessing;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EvaluationCriteria {
        private String criteriaName;
        private String criteriaType;
        private Integer weight;
        private Integer score;
        private String comment;
        private BigDecimal value;
        private String unit;
    }
}