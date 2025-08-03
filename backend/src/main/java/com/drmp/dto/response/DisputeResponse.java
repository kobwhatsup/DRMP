package com.drmp.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 异议响应DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisputeResponse {

    private Long id;
    
    private Long reconciliationId;
    
    private String reconciliationNo;
    
    private Long caseId;
    
    private String caseNo;
    
    private String debtorName;
    
    private String disputeNo;
    
    private String disputeType;
    
    private String disputeTypeName;
    
    private String disputeReason;
    
    private String disputeDescription;
    
    private BigDecimal disputedAmount;
    
    private BigDecimal expectedAmount;
    
    private BigDecimal actualAmount;
    
    private BigDecimal differenceAmount;
    
    private String evidenceDescription;
    
    private List<String> evidenceFileUrls;
    
    private String priority;
    
    private String priorityName;
    
    private String status;
    
    private String statusName;
    
    // 处理信息
    private Boolean resolved;
    
    private LocalDateTime resolvedAt;
    
    private Long resolvedBy;
    
    private String resolvedByName;
    
    private String resolution;
    
    private String resolutionNote;
    
    private String resolutionResult;
    
    // 创建信息
    private Long createdBy;
    
    private String createdByName;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    // 相关机构信息
    private Long sourceOrgId;
    
    private String sourceOrgName;
    
    private Long disposalOrgId;
    
    private String disposalOrgName;
    
    // 处理历史
    private List<DisputeHistoryResponse> history;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DisputeHistoryResponse {
        private Long id;
        private String action;
        private String actionName;
        private String content;
        private String operatorName;
        private LocalDateTime operatedAt;
        private String remark;
    }
}