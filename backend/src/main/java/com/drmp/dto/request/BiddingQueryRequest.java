package com.drmp.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 竞标查询请求DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BiddingQueryRequest extends BasePageRequest {

    private Long casePackageId;

    private Long disposalOrgId;

    private String status;

    private List<String> statuses;

    private String priority;

    private List<String> priorities;

    private BigDecimal minBidAmount;

    private BigDecimal maxBidAmount;

    private BigDecimal minRecoveryRate;

    private BigDecimal maxRecoveryRate;

    private Integer minProcessingDays;

    private Integer maxProcessingDays;

    private LocalDateTime submitStartDate;

    private LocalDateTime submitEndDate;

    private LocalDateTime validStartDate;

    private LocalDateTime validEndDate;

    private String keyword;

    private String contactPerson;

    private Boolean hasExperience;

    private Boolean hasCertification;

    private String region;

    private List<String> regions;

    private String businessType;

    private List<String> businessTypes;

    private Long createdBy;

    private String sortBy = "createdAt";

    private String sortDirection = "DESC";

    private Boolean excludeExpired;

    private Boolean onlyWinning;

    private Boolean onlyActive;
}