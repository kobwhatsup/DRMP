package com.drmp.dto.response;

import com.drmp.entity.enums.ContractStatus;
import com.drmp.entity.enums.ContractType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 合同列表响应DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Schema(description = "合同列表响应")
public class ContractListResponse {
    
    @Schema(description = "合同ID")
    private Long id;
    
    @Schema(description = "合同编号")
    private String contractNumber;
    
    @Schema(description = "合同标题")
    private String title;
    
    @Schema(description = "合同类型")
    private ContractType contractType;
    
    @Schema(description = "合同状态")
    private ContractStatus status;
    
    @Schema(description = "甲方名称")
    private String partyAName;
    
    @Schema(description = "乙方名称")
    private String partyBName;
    
    @Schema(description = "第三方名称")
    private String partyCName;
    
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
    
    @Schema(description = "合同版本号")
    private Integer version;
    
    @Schema(description = "风险等级")
    private String riskLevel;
    
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
    
    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;
    
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