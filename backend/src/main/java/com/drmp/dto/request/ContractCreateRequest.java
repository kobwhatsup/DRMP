package com.drmp.dto.request;

import com.drmp.entity.enums.ContractType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 合同创建请求DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Schema(description = "合同创建请求")
public class ContractCreateRequest {
    
    @Schema(description = "合同编号（可选，系统会自动生成）")
    @Size(max = 100, message = "合同编号长度不能超过100字符")
    private String contractNumber;
    
    @Schema(description = "合同标题", required = true)
    @NotBlank(message = "合同标题不能为空")
    @Size(max = 500, message = "合同标题长度不能超过500字符")
    private String title;
    
    @Schema(description = "合同类型", required = true)
    @NotNull(message = "合同类型不能为空")
    private ContractType contractType;
    
    @Schema(description = "关联的案件包ID")
    private Long casePackageId;
    
    @Schema(description = "关联的个案ID")
    private Long caseId;
    
    @Schema(description = "甲方ID（案源机构）", required = true)
    @NotNull(message = "甲方ID不能为空")
    private Long partyAId;
    
    @Schema(description = "甲方名称", required = true)
    @NotBlank(message = "甲方名称不能为空")
    @Size(max = 200, message = "甲方名称长度不能超过200字符")
    private String partyAName;
    
    @Schema(description = "乙方ID")
    private Long partyBId;
    
    @Schema(description = "乙方名称")
    @Size(max = 200, message = "乙方名称长度不能超过200字符")
    private String partyBName;
    
    @Schema(description = "第三方ID")
    private Long partyCId;
    
    @Schema(description = "第三方名称")
    @Size(max = 200, message = "第三方名称长度不能超过200字符")
    private String partyCName;
    
    @Schema(description = "合同金额")
    private BigDecimal contractAmount;
    
    @Schema(description = "币种", example = "CNY")
    private String currency = "CNY";
    
    @Schema(description = "生效日期")
    private LocalDate effectiveDate;
    
    @Schema(description = "到期日期")
    private LocalDate expiryDate;
    
    @Schema(description = "合同内容摘要")
    @Size(max = 2000, message = "合同内容摘要长度不能超过2000字符")
    private String contentSummary;
    
    @Schema(description = "主要条款")
    private String keyTerms;
    
    @Schema(description = "付款条款")
    @Size(max = 1000, message = "付款条款长度不能超过1000字符")
    private String paymentTerms;
    
    @Schema(description = "履行期限")
    @Size(max = 500, message = "履行期限长度不能超过500字符")
    private String performancePeriod;
    
    @Schema(description = "违约责任")
    @Size(max = 1000, message = "违约责任长度不能超过1000字符")
    private String breachLiability;
    
    @Schema(description = "争议解决方式")
    @Size(max = 500, message = "争议解决方式长度不能超过500字符")
    private String disputeResolution;
    
    @Schema(description = "合同文件路径")
    @Size(max = 500, message = "合同文件路径长度不能超过500字符")
    private String filePath;
    
    @Schema(description = "是否自动续约", example = "false")
    private Boolean autoRenewal = false;
    
    @Schema(description = "续约期限（月）")
    private Integer renewalPeriodMonths;
    
    @Schema(description = "提前通知天数")
    private Integer noticeDays;
    
    @Schema(description = "模板ID")
    private Long templateId;
    
    @Schema(description = "模板名称")
    @Size(max = 200, message = "模板名称长度不能超过200字符")
    private String templateName;
    
    @Schema(description = "父合同ID（用于补充协议等）")
    private Long parentContractId;
    
    @Schema(description = "是否需要法务审核", example = "false")
    private Boolean requiresLegalReview = false;
    
    @Schema(description = "风险等级", example = "LOW")
    private String riskLevel = "LOW";
    
    @Schema(description = "标签（用于分类）")
    @Size(max = 500, message = "标签长度不能超过500字符")
    private String tags;
    
    @Schema(description = "备注")
    @Size(max = 1000, message = "备注长度不能超过1000字符")
    private String remarks;
    
    @Schema(description = "扩展属性（JSON格式）")
    private String extendedProperties;
}