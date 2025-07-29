package com.drmp.dto.response;

import com.drmp.entity.enums.CasePackageStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Case Package Detail Response DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
public class CasePackageDetailResponse {

    private Long id;
    
    private String packageCode;
    
    private String packageName;
    
    private CasePackageStatus status;
    
    private Integer caseCount;
    
    private BigDecimal totalAmount;
    
    private BigDecimal remainingAmount;
    
    private BigDecimal expectedRecoveryRate;
    
    private Integer expectedDisposalDays;
    
    private String preferredDisposalMethods;
    
    private String assignmentStrategy;
    
    private String assignmentRules;
    
    private LocalDateTime publishedAt;
    
    private LocalDateTime assignedAt;
    
    private LocalDateTime acceptedAt;
    
    private LocalDateTime closedAt;
    
    private LocalDate entrustStartDate;
    
    private LocalDate entrustEndDate;
    
    private String description;
    
    private Long sourceOrgId;
    
    private String sourceOrgName;
    
    private Long disposalOrgId;
    
    private String disposalOrgName;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}