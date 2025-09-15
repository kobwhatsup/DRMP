package com.drmp.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

/**
 * 案件包竞标请求DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CasePackageBidRequest {
    
    @NotNull(message = "案件包ID不能为空")
    private Long casePackageId;

    /**
     * 处置机构ID
     */
    @NotNull(message = "处置机构ID不能为空")
    private Long disposalOrgId;

    @DecimalMin(value = "0", message = "竞标金额不能为负")
    private BigDecimal bidAmount;
    
    @NotNull(message = "预期回收率不能为空")
    @DecimalMin(value = "0", message = "预期回收率不能为负")
    @DecimalMax(value = "100", message = "预期回收率不能超过100")
    private BigDecimal proposedRecoveryRate;
    
    @NotNull(message = "预期处置天数不能为空")
    @Min(value = 1, message = "预期处置天数至少为1天")
    @Max(value = 1095, message = "预期处置天数不能超过3年")
    private Integer proposedDisposalDays;
    
    @NotBlank(message = "竞标方案不能为空")
    @Size(max = 10000, message = "竞标方案内容不能超过10000字")
    private String proposal;
    
    /**
     * 附件列表
     */
    private List<AttachmentInfo> attachments;
    
    /**
     * 处置策略
     */
    private String disposalStrategy;
    
    /**
     * 团队介绍
     */
    @Size(max = 2000, message = "团队介绍不能超过2000字")
    private String teamIntroduction;
    
    /**
     * 过往业绩
     */
    @Size(max = 2000, message = "过往业绩不能超过2000字")
    private String pastPerformance;
    
    /**
     * 承诺事项
     */
    @Size(max = 2000, message = "承诺事项不能超过2000字")
    private String commitments;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttachmentInfo {
        private String fileName;
        private String fileUrl;
        private Long fileSize;
        private String fileType;
    }
}