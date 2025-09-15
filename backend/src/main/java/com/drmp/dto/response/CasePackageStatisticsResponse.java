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

    // Package counts
    private Long total;
    private Long draft;
    private Long published;
    private Long bidding;
    private Long assigned;
    private Long inProgress;
    private Long completed;

    // Legacy names (kept for backward compatibility)
    private Long totalPackages;
    private Long draftPackages;
    private Long publishedPackages;
    private Long assignedPackages;
    private Long inProgressPackages;
    private Long completedPackages;

    // Financial metrics
    private BigDecimal totalAmount;
    private BigDecimal assignedAmount;
    private BigDecimal completedAmount;
    private BigDecimal recoveryAmount;
    private BigDecimal avgRecoveryRate;

    // Other metrics
    private Integer avgDisposalDays;
    private Long totalCases;
}