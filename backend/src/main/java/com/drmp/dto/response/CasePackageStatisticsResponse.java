package com.drmp.dto.response;

import lombok.Data;

import java.math.BigDecimal;

/**
 * Case Package Statistics Response DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
public class CasePackageStatisticsResponse {

    private Long totalPackages;
    
    private Long draftPackages;
    
    private Long publishedPackages;
    
    private Long assignedPackages;
    
    private Long inProgressPackages;
    
    private Long completedPackages;
    
    private BigDecimal totalAmount;
    
    private BigDecimal assignedAmount;
    
    private BigDecimal completedAmount;
    
    private BigDecimal recoveryAmount;
    
    private BigDecimal avgRecoveryRate;
    
    private Integer avgDisposalDays;
}