package com.drmp.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * 批量操作记录实体
 * 记录批量操作的执行情况和结果
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "batch_operations", indexes = {
    @Index(name = "idx_operation_type", columnList = "operation_type"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_created_by", columnList = "created_by"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
public class BatchOperation extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "operation_type", nullable = false, length = 30)
    private OperationType operationType;

    @Column(name = "operation_name", nullable = false, length = 100)
    private String operationName;

    @Column(name = "target_type", nullable = false, length = 30)
    private String targetType;

    @Column(name = "target_count", nullable = false)
    private Integer targetCount;

    @Column(name = "success_count", columnDefinition = "INT DEFAULT 0")
    private Integer successCount = 0;

    @Column(name = "failed_count", columnDefinition = "INT DEFAULT 0")
    private Integer failedCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private BatchStatus status = BatchStatus.PENDING;

    @Column(name = "parameters", columnDefinition = "JSON")
    private String parameters;

    @Column(name = "result_data", columnDefinition = "JSON")
    private String resultData;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "execution_time")
    private Integer executionTime;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "progress_percentage", columnDefinition = "INT DEFAULT 0")
    private Integer progressPercentage = 0;

    @Column(name = "current_step", length = 200)
    private String currentStep;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "organization_id")
    private Long organizationId;

    /**
     * 批量操作类型枚举
     */
    public enum OperationType {
        CASE_STATUS_UPDATE("案件状态更新"),
        CASE_ASSIGNMENT("案件分配"),
        CASE_RETURN("案件退回"),
        CASE_RETAIN("案件留案"),
        CASE_CLOSE("案件结案"),
        TAG_ADD("批量添加标签"),
        TAG_REMOVE("批量移除标签"),
        WORK_RECORD_CREATE("批量创建作业记录"),
        DOCUMENT_GENERATE("批量生成文书"),
        REMINDER_SET("批量设置提醒"),
        EXPORT_DATA("数据导出");

        private final String description;

        OperationType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 批量操作状态枚举
     */
    public enum BatchStatus {
        PENDING("待执行"),
        RUNNING("执行中"),
        COMPLETED("已完成"),
        FAILED("执行失败"),
        CANCELLED("已取消"),
        PARTIAL_SUCCESS("部分成功");

        private final String description;

        BatchStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 计算成功率
     */
    public double getSuccessRate() {
        if (targetCount == null || targetCount == 0) {
            return 0.0;
        }
        return (double) (successCount != null ? successCount : 0) / targetCount * 100;
    }

    /**
     * 检查是否已完成
     */
    public boolean isCompleted() {
        return status == BatchStatus.COMPLETED || 
               status == BatchStatus.FAILED || 
               status == BatchStatus.CANCELLED ||
               status == BatchStatus.PARTIAL_SUCCESS;
    }

    /**
     * 更新进度
     */
    public void updateProgress(int current, int total, String step) {
        this.progressPercentage = total > 0 ? (current * 100 / total) : 0;
        this.currentStep = step;
    }

    /**
     * 标记为开始执行
     */
    public void markAsStarted() {
        this.status = BatchStatus.RUNNING;
        this.startedAt = LocalDateTime.now();
        this.progressPercentage = 0;
    }

    /**
     * 标记为完成
     */
    public void markAsCompleted() {
        this.status = BatchStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
        this.progressPercentage = 100;
        if (this.startedAt != null) {
            this.executionTime = (int) java.time.Duration.between(startedAt, completedAt).toSeconds();
        }
    }

    /**
     * 标记为失败
     */
    public void markAsFailed(String errorMessage) {
        this.status = BatchStatus.FAILED;
        this.completedAt = LocalDateTime.now();
        this.errorMessage = errorMessage;
        if (this.startedAt != null) {
            this.executionTime = (int) java.time.Duration.between(startedAt, completedAt).toSeconds();
        }
    }
}