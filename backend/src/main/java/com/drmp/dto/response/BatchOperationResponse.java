package com.drmp.dto.response;

import com.drmp.entity.BatchOperation;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 批量操作响应DTO
 */
@Data
public class BatchOperationResponse {

    private Long id;
    private BatchOperation.OperationType operationType;
    private String operationTypeDesc;
    private String operationName;
    private String targetType;
    private Integer targetCount;
    private Integer successCount;
    private Integer failedCount;
    private BatchOperation.BatchStatus status;
    private String statusDesc;
    private String parameters;
    private String resultData;
    private String errorMessage;
    private Integer executionTime;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Integer progressPercentage;
    private String currentStep;
    private Long createdBy;
    private Long organizationId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Double successRate;
    private Boolean isCompleted;

    public void setOperationType(BatchOperation.OperationType operationType) {
        this.operationType = operationType;
        this.operationTypeDesc = operationType != null ? operationType.getDescription() : null;
    }

    public void setStatus(BatchOperation.BatchStatus status) {
        this.status = status;
        this.statusDesc = status != null ? status.getDescription() : null;
    }
}