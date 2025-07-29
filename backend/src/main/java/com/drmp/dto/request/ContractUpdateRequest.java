package com.drmp.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import javax.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 合同更新请求DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Schema(description = "合同更新请求")
public class ContractUpdateRequest {
    
    @Schema(description = "合同标题")
    @Size(max = 500, message = "合同标题长度不能超过500字符")
    private String title;
    
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
    
    @Schema(description = "币种")
    private String currency;
    
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
    
    @Schema(description = "是否自动续约")
    private Boolean autoRenewal;
    
    @Schema(description = "续约期限（月）")
    private Integer renewalPeriodMonths;
    
    @Schema(description = "提前通知天数")
    private Integer noticeDays;
    
    @Schema(description = "是否需要法务审核")
    private Boolean requiresLegalReview;
    
    @Schema(description = "风险等级")
    private String riskLevel;
    
    @Schema(description = "标签（用于分类）")
    @Size(max = 500, message = "标签长度不能超过500字符")
    private String tags;
    
    @Schema(description = "备注")
    @Size(max = 1000, message = "备注长度不能超过1000字符")
    private String remarks;
    
    @Schema(description = "扩展属性（JSON格式）")
    private String extendedProperties;
}