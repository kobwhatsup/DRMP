package com.drmp.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 对账单响应DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReconciliationResponse {

    private Long id;
    
    private Long casePackageId;
    
    private String casePackageName;
    
    private Long sourceOrgId;
    
    private String sourceOrgName;
    
    private Long disposalOrgId;
    
    private String disposalOrgName;
    
    private String reconciliationNo;
    
    private String reconciliationPeriod;
    
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    private String status;
    
    private String statusName;
    
    // 案件统计
    private Integer totalCases;
    
    private Integer processedCases;
    
    private Integer completedCases;
    
    private Integer disputedCases;
    
    // 金额统计
    private BigDecimal totalRecoveredAmount;
    
    private BigDecimal platformServiceFee;
    
    private BigDecimal disposalServiceFee;
    
    private BigDecimal bonusAmount;
    
    private BigDecimal penaltyAmount;
    
    private BigDecimal payableAmount;
    
    private BigDecimal actualPaidAmount;
    
    private BigDecimal remainingAmount;
    
    // 确认信息
    private Boolean confirmed;
    
    private LocalDateTime confirmedAt;
    
    private Long confirmedBy;
    
    private String confirmedByName;
    
    private String confirmNote;
    
    // 拒绝信息
    private Boolean rejected;
    
    private LocalDateTime rejectedAt;
    
    private Long rejectedBy;
    
    private String rejectedByName;
    
    private String rejectReason;
    
    // 异议信息
    private Boolean hasDisputes;
    
    private Integer disputeCount;
    
    private Integer resolvedDisputeCount;
    
    private Integer pendingDisputeCount;
    
    // 创建信息
    private Long createdBy;
    
    private String createdByName;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    private String remark;
    
    // 对账明细
    private List<ReconciliationItemResponse> items;
    
    // 异议列表
    private List<DisputeResponse> disputes;
    
    // 附件列表
    private List<String> attachmentUrls;
    
    // 审计信息
    private List<ReconciliationAuditResponse> auditLogs;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReconciliationItemResponse {
        private Long id;
        private Long caseId;
        private String caseNo;
        private String debtorName;
        private BigDecimal originalAmount;
        private BigDecimal recoveredAmount;
        private BigDecimal recoveryRate;
        private Integer paymentCount;
        private String caseStatus;
        private String caseStatusName;
        private Boolean disputed;
        private String itemRemark;
        private LocalDateTime lastPaymentAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReconciliationAuditResponse {
        private Long id;
        private String action;
        private String actionName;
        private String oldValue;
        private String newValue;
        private String operatorName;
        private LocalDateTime operatedAt;
        private String remark;
    }
}