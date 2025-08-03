package com.drmp.dto.request;

import lombok.Data;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * 对账单创建请求DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
public class ReconciliationCreateRequest {

    @NotNull(message = "案件包ID不能为空")
    private Long casePackageId;

    @NotBlank(message = "对账周期不能为空")
    @Size(max = 20, message = "对账周期长度不能超过20字符")
    private String reconciliationPeriod;

    @NotNull(message = "对账开始日期不能为空")
    private LocalDate startDate;

    @NotNull(message = "对账结束日期不能为空")
    private LocalDate endDate;

    @NotNull(message = "案件总数不能为空")
    private Integer totalCases;

    @NotNull(message = "处理案件数不能为空")
    private Integer processedCases;

    @NotNull(message = "完成案件数不能为空")
    private Integer completedCases;

    @NotNull(message = "回款总额不能为空")
    @DecimalMin(value = "0.00", message = "回款总额不能为负数")
    private BigDecimal totalRecoveredAmount;

    @NotNull(message = "平台服务费不能为空")
    @DecimalMin(value = "0.00", message = "平台服务费不能为负数")
    private BigDecimal platformServiceFee;

    @NotNull(message = "处置服务费不能为空")
    @DecimalMin(value = "0.00", message = "处置服务费不能为负数")
    private BigDecimal disposalServiceFee;

    @DecimalMin(value = "0.00", message = "奖励金额不能为负数")
    private BigDecimal bonusAmount;

    @DecimalMin(value = "0.00", message = "罚款金额不能为负数")
    private BigDecimal penaltyAmount;

    @NotNull(message = "应付金额不能为空")
    @DecimalMin(value = "0.00", message = "应付金额不能为负数")
    private BigDecimal payableAmount;

    @Size(max = 1000, message = "备注长度不能超过1000字符")
    private String remark;

    private List<ReconciliationItemRequest> items;

    private Long createdBy;

    @Data
    public static class ReconciliationItemRequest {
        @NotNull(message = "案件ID不能为空")
        private Long caseId;

        @NotBlank(message = "案件编号不能为空")
        private String caseNo;

        @NotNull(message = "原始金额不能为空")
        @DecimalMin(value = "0.00", message = "原始金额不能为负数")
        private BigDecimal originalAmount;

        @NotNull(message = "回款金额不能为空")
        @DecimalMin(value = "0.00", message = "回款金额不能为负数")
        private BigDecimal recoveredAmount;

        @NotNull(message = "回款次数不能为空")
        private Integer paymentCount;

        @NotBlank(message = "案件状态不能为空")
        private String caseStatus;

        @Size(max = 500, message = "备注长度不能超过500字符")
        private String itemRemark;
    }
}