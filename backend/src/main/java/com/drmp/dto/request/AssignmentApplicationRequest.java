package com.drmp.dto.request;

import lombok.Data;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * Assignment Application Request DTO
 * 案件包申请请求
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
public class AssignmentApplicationRequest {

    @NotNull(message = "案件包ID不能为空")
    private Long casePackageId;

    @NotNull(message = "申请机构ID不能为空")
    private Long applicantOrganizationId;

    @Size(max = 2000, message = "申请提案不能超过2000字符")
    private String proposal;

    private BigDecimal proposedFeeRate;

    private Integer proposedProcessingDays;

    private String proposedStrategy;

    private String teamComposition;

    private String contactPerson;

    private String contactPhone;

    private String contactEmail;

    private String additionalInfo;
}