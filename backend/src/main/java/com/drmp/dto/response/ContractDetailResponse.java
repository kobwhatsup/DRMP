package com.drmp.dto.response;

import com.drmp.entity.enums.ContractStatus;
import com.drmp.entity.enums.ContractType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 合同详情响应DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Schema(description = "合同详情响应")
public class ContractDetailResponse {
    
    @Schema(description = "合同ID")
    private Long id;
    
    @Schema(description = "合同编号")
    private String contractNumber;
    
    @Schema(description = "合同标题")
    private String title;
    
    @Schema(description = "合同类型")
    private ContractType contractType;
    
    @Schema(description = "关联的案件包ID")
    private Long casePackageId;
    
    @Schema(description = "关联的个案ID")
    private Long caseId;
    
    @Schema(description = "甲方ID")
    private Long partyAId;
    
    @Schema(description = "甲方名称")
    private String partyAName;
    
    @Schema(description = "乙方ID")
    private Long partyBId;
    
    @Schema(description = "乙方名称")
    private String partyBName;
    
    @Schema(description = "第三方ID")
    private Long partyCId;
    
    @Schema(description = "第三方名称")
    private String partyCName;
    
    @Schema(description = "合同状态")
    private ContractStatus status;
    
    @Schema(description = "合同金额")
    private BigDecimal contractAmount;
    
    @Schema(description = "币种")
    private String currency;
    
    @Schema(description = "签署日期")
    private LocalDate signatureDate;
    
    @Schema(description = "生效日期")
    private LocalDate effectiveDate;
    
    @Schema(description = "到期日期")
    private LocalDate expiryDate;
    
    @Schema(description = "甲方签署时间")
    private LocalDateTime partyASignedAt;
    
    @Schema(description = "甲方签署人")
    private String partyASigner;
    
    @Schema(description = "乙方签署时间")
    private LocalDateTime partyBSignedAt;
    
    @Schema(description = "乙方签署人")
    private String partyBSigner;
    
    @Schema(description = "第三方签署时间")
    private LocalDateTime partyCSignedAt;
    
    @Schema(description = "第三方签署人")
    private String partyCSigner;
    
    @Schema(description = "合同内容摘要")
    private String contentSummary;
    
    @Schema(description = "主要条款")
    private String keyTerms;
    
    @Schema(description = "付款条款")
    private String paymentTerms;
    
    @Schema(description = "履行期限")
    private String performancePeriod;
    
    @Schema(description = "违约责任")
    private String breachLiability;
    
    @Schema(description = "争议解决方式")
    private String disputeResolution;
    
    @Schema(description = "合同文件路径")
    private String filePath;
    
    @Schema(description = "电子签名信息")
    private String electronicSignature;
    
    @Schema(description = "审核人ID")
    private Long reviewerId;
    
    @Schema(description = "审核人姓名")
    private String reviewerName;
    
    @Schema(description = "审核时间")
    private LocalDateTime reviewedAt;
    
    @Schema(description = "审核意见")
    private String reviewComments;
    
    @Schema(description = "是否自动续约")
    private Boolean autoRenewal;
    
    @Schema(description = "续约期限（月）")
    private Integer renewalPeriodMonths;
    
    @Schema(description = "提前通知天数")
    private Integer noticeDays;
    
    @Schema(description = "模板ID")
    private Long templateId;
    
    @Schema(description = "模板名称")
    private String templateName;
    
    @Schema(description = "父合同ID")
    private Long parentContractId;
    
    @Schema(description = "合同版本号")
    private Integer version;
    
    @Schema(description = "是否需要法务审核")
    private Boolean requiresLegalReview;
    
    @Schema(description = "风险等级")
    private String riskLevel;
    
    @Schema(description = "标签")
    private String tags;
    
    @Schema(description = "备注")
    private String remarks;
    
    @Schema(description = "扩展属性")
    private String extendedProperties;
    
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
    
    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;
    
    @Schema(description = "创建人ID")
    private Long createdBy;
    
    @Schema(description = "更新人ID")
    private Long updatedBy;
    
    // 计算字段
    @Schema(description = "是否已完全签署")
    private Boolean isFullySigned;
    
    @Schema(description = "签署进度百分比")
    private Integer signatureProgress;
    
    @Schema(description = "是否已过期")
    private Boolean isExpired;
    
    @Schema(description = "是否有效")
    private Boolean isEffective;
    
    @Schema(description = "是否即将到期（30天内）")
    private Boolean isExpiringSoon;
}