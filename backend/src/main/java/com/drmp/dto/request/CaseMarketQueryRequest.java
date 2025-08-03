package com.drmp.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * 案件市场查询请求DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaseMarketQueryRequest extends BasePageRequest {

    private String keyword;

    private BigDecimal minAmount;

    private BigDecimal maxAmount;

    private Integer minCaseCount;

    private Integer maxCaseCount;

    private Integer minOverdueDays;

    private Integer maxOverdueDays;

    private List<Long> sourceOrgIds;

    private String province;

    private String city;

    private String district;

    private List<String> regions;

    private String businessType;

    private List<String> businessTypes;

    private String caseType;

    private List<String> caseTypes;

    private String priority;

    private List<String> priorities;

    private LocalDate publishStartDate;

    private LocalDate publishEndDate;

    private LocalDate deadlineStartDate;

    private LocalDate deadlineEndDate;

    private Boolean hasCompetition;

    private Integer maxBidders;

    private Boolean excludeApplied;

    private Boolean excludeMyOrg;

    private Long currentOrgId;

    private String sortBy = "publishedAt";

    private String sortDirection = "DESC";

    private String status;

    private List<String> statuses;
}