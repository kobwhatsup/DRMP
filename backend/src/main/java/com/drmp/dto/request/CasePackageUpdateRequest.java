package com.drmp.dto.request;

import lombok.Data;

import javax.validation.constraints.*;
import java.math.BigDecimal;

/**
 * Case Package Update Request DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
public class CasePackageUpdateRequest {

    @Size(max = 200, message = "案件包名称长度不能超过200")
    private String packageName;

    @DecimalMin(value = "0.00", message = "预期回收率不能为负")
    @DecimalMax(value = "1.00", message = "预期回收率不能超过100%")
    private BigDecimal expectedRecoveryRate;

    @Min(value = 1, message = "预期处置天数不能少于1天")
    private Integer expectedDisposalDays;

    @Size(max = 500, message = "偏好处置方式长度不能超过500")
    private String preferredDisposalMethods;

    @Size(max = 50, message = "分案策略长度不能超过50")
    private String assignmentStrategy;

    private String assignmentRules;

    private String description;
}