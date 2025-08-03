package com.drmp.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import javax.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 竞标创建请求DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BiddingCreateRequest {

    @NotNull(message = "案件包ID不能为空")
    private Long casePackageId;

    private Long disposalOrgId;

    @NotBlank(message = "竞标方案不能为空")
    @Size(max = 2000, message = "竞标方案长度不能超过2000字符")
    private String proposal;

    @NotNull(message = "报价不能为空")
    @DecimalMin(value = "0", message = "报价不能小于0")
    private BigDecimal bidAmount;

    @NotNull(message = "承诺回收率不能为空")
    @DecimalMin(value = "0", message = "承诺回收率不能小于0")
    private BigDecimal promisedRecoveryRate;

    @NotNull(message = "承诺处置周期不能为空")
    private Integer promisedProcessingDays;

    @Size(max = 1000, message = "承诺条件长度不能超过1000字符")
    private String promiseConditions;

    @Size(max = 500, message = "团队介绍长度不能超过500字符")
    private String teamIntroduction;

    @Size(max = 500, message = "经验说明长度不能超过500字符")
    private String experienceDescription;

    private List<String> certificationUrls;

    private List<String> caseStudyUrls;

    private List<String> referenceUrls;

    @Builder.Default
    private String priority = "NORMAL";

    private String contactPerson;

    private String contactPhone;

    private String contactEmail;

    private LocalDateTime validUntil;

    private Map<String, Object> extraData;

    private List<String> tags;

    private String remark;

    private Long createdBy;

    private String createdByName;

    // 服务条款
    private BigDecimal serviceFeeRate;

    private BigDecimal depositAmount;

    private String paymentTerms;

    private String riskGuarantee;

    private String performanceBond;

    // 技术方案
    private String technicalSolution;

    private String qualityControlPlan;

    private String riskControlMeasures;

    private String emergencyPlan;

    // 资源配置
    private Integer teamSize;

    private String equipmentDescription;

    private String systemIntegration;

    private Boolean has24HourService;
}