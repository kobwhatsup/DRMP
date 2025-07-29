package com.drmp.dto.request;

import com.drmp.entity.enums.CasePackageStatus;
import lombok.Data;

/**
 * Case Package Query Request DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
public class CasePackageQueryRequest {

    private String keyword;
    
    private CasePackageStatus status;
    
    private Long sourceOrgId;
    
    private Long disposalOrgId;
    
    private Double minAmount;
    
    private Double maxAmount;
    
    private Integer minOverdueDays;
    
    private Integer maxOverdueDays;
}