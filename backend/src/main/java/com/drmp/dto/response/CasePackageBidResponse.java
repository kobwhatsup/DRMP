package com.drmp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 案件包竞标响应DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CasePackageBidResponse {
    
    private Long id;
    
    private Long casePackageId;
    
    private String casePackageName;
    
    private Long disposalOrgId;
    
    private String disposalOrgName;
    
    private BigDecimal bidAmount;
    
    private BigDecimal proposedRecoveryRate;
    
    private Integer proposedDisposalDays;
    
    private String proposal;
    
    private BigDecimal technicalScore;
    
    private BigDecimal priceScore;
    
    private BigDecimal comprehensiveScore;
    
    private Integer ranking;
    
    private String status;
    
    private Boolean isWinner;
    
    private LocalDateTime submittedAt;
    
    private LocalDateTime reviewedAt;
    
    private String reviewComments;
    
    private List<AttachmentInfo> attachments;
    
    /**
     * 处置策略
     */
    private String disposalStrategy;
    
    /**
     * 团队介绍
     */
    private String teamIntroduction;
    
    /**
     * 过往业绩
     */
    private String pastPerformance;
    
    /**
     * 承诺事项
     */
    private String commitments;
    
    /**
     * 机构资质信息
     */
    private OrganizationInfo organizationInfo;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttachmentInfo {
        private String fileName;
        private String fileUrl;
        private Long fileSize;
        private String fileType;
        private LocalDateTime uploadedAt;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrganizationInfo {
        private String orgCode;
        private String contactPerson;
        private String contactPhone;
        private String businessLicense;
        private Integer totalCasesHandled;
        private BigDecimal avgRecoveryRate;
        private BigDecimal rating;
    }
}