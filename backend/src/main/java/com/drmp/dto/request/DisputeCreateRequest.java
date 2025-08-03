package com.drmp.dto.request;

import lombok.Data;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * 异议创建请求DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
public class DisputeCreateRequest {

    private Long reconciliationId;

    @NotNull(message = "案件ID不能为空")
    private Long caseId;

    @NotBlank(message = "异议类型不能为空")
    @Size(max = 50, message = "异议类型长度不能超过50字符")
    private String disputeType;

    @NotBlank(message = "异议原因不能为空")
    @Size(max = 2000, message = "异议原因长度不能超过2000字符")
    private String disputeReason;

    @Size(max = 1000, message = "异议描述长度不能超过1000字符")
    private String disputeDescription;

    private BigDecimal disputedAmount;

    private BigDecimal expectedAmount;

    @Size(max = 500, message = "支持证据描述长度不能超过500字符")
    private String evidenceDescription;

    private String evidenceFileUrls;

    @NotBlank(message = "优先级不能为空")
    private String priority;

    private Long createdBy;
}