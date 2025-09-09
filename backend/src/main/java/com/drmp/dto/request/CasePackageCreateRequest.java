package com.drmp.dto.request;

import com.drmp.entity.enums.AssignmentType;
import lombok.Data;

import javax.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Case Package Create Request DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
public class CasePackageCreateRequest {

    @NotBlank(message = "案件包编号不能为空")
    @Size(max = 50, message = "案件包编号长度不能超过50")
    private String packageCode;

    @NotBlank(message = "案件包名称不能为空")
    @Size(max = 200, message = "案件包名称长度不能超过200")
    private String packageName;

    @NotNull(message = "案件数量不能为空")
    @Min(value = 1, message = "案件数量不能少于1")
    private Integer caseCount;

    @NotNull(message = "总金额不能为空")
    @DecimalMin(value = "0.01", message = "总金额必须大于0")
    private BigDecimal totalAmount;

    @DecimalMin(value = "0.00", message = "预期回收率不能为负")
    @DecimalMax(value = "1.00", message = "预期回收率不能超过100%")
    private BigDecimal expectedRecoveryRate;

    @Min(value = 1, message = "预期处置天数不能少于1天")
    private Integer expectedDisposalDays;

    @Size(max = 500, message = "偏好处置方式长度不能超过500")
    private String preferredDisposalMethods;

    @DecimalMin(value = "0.00", message = "最低预期回收率不能为负")
    @DecimalMax(value = "1.00", message = "最低预期回收率不能超过100%")
    private BigDecimal expectedRecoveryRateMin;

    @Min(value = 1, message = "处置周期不能少于1天")
    private Integer disposalPeriodDays;

    @Size(max = 50, message = "分案策略长度不能超过50")
    private String assignmentStrategy;

    private String assignmentRules;

    @NotNull(message = "委托开始日期不能为空")
    private LocalDate entrustStartDate;

    @NotNull(message = "委托结束日期不能为空")
    private LocalDate entrustEndDate;

    private String description;
    
    // 新增字段
    @NotNull(message = "分案类型不能为空")
    private AssignmentType assignmentType;
    
    @NotNull(message = "源机构ID不能为空")
    private Long sourceOrgId;
    
    // 竞标相关字段
    private LocalDateTime biddingStartTime;
    
    private LocalDateTime biddingEndTime;
    
    @DecimalMin(value = "0.00", message = "最低竞标金额不能为负")
    private BigDecimal minBidAmount;
    
    @DecimalMin(value = "0.00", message = "竞标保证金不能为负")
    private BigDecimal bidBondAmount;
    
    @Size(max = 1000, message = "竞标要求长度不能超过1000")
    private String biddingRequirements;
    
    // 智能分案配置
    @Size(max = 2000, message = "智能分案配置长度不能超过2000")
    private String smartAssignConfig;
    
    // 案件ID列表
    private List<Long> caseIds;
}