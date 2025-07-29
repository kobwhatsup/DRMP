package com.drmp.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Assignment Application Response DTO
 * 案件包申请响应
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
public class AssignmentApplicationResponse {

    private Long id;
    
    private Long casePackageId;
    
    private String casePackageName;
    
    private String casePackageCode;
    
    private Long applicantOrganizationId;
    
    private String applicantOrganizationName;
    
    private String proposal;
    
    private BigDecimal proposedFeeRate;
    
    private Integer proposedProcessingDays;
    
    private String proposedStrategy;
    
    private String teamComposition;
    
    private String contactPerson;
    
    private String contactPhone;
    
    private String contactEmail;
    
    private String additionalInfo;
    
    private String status; // PENDING, APPROVED, REJECTED
    
    private String reviewResult;
    
    private String reviewReason;
    
    private Long reviewedBy;
    
    private String reviewedByName;
    
    private LocalDateTime reviewedAt;
    
    private LocalDateTime appliedAt;
    
    private Double matchScore;
    
    private String recommendation;
}