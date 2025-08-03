package com.drmp.dto.request;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 对账单查询请求DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ReconciliationQueryRequest extends BasePageRequest {

    private Long reconciliationId;
    
    private Long casePackageId;
    
    private Long sourceOrgId;
    
    private Long disposalOrgId;
    
    private String reconciliationPeriod;
    
    private String status;
    
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    private String keyword;
    
    private Boolean hasDisputes;
    
    private Boolean confirmed;
    
    private String createdBy;
    
    private LocalDate createdAtStart;
    
    private LocalDate createdAtEnd;
}