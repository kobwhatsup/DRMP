package com.drmp.dto.response;

import com.drmp.entity.enums.CasePackageStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Case Package List Response DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
public class CasePackageListResponse {

    private Long id;
    
    private String packageCode;
    
    private String packageName;
    
    private CasePackageStatus status;
    
    private Integer caseCount;
    
    private BigDecimal totalAmount;
    
    private BigDecimal remainingAmount;
    
    private BigDecimal expectedRecoveryRate;
    
    private String sourceOrgName;
    
    private String disposalOrgName;
    
    private LocalDateTime publishedAt;
    
    private LocalDateTime createdAt;
}