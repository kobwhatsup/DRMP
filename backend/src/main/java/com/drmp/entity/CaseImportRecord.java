package com.drmp.entity;

import com.drmp.entity.enums.ImportStatus;
import lombok.*;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * 案件导入记录实体
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Entity
@Table(name = "case_import_records", indexes = {
    @Index(name = "idx_import_batch_id", columnList = "import_batch_id"),
    @Index(name = "idx_case_package_id", columnList = "case_package_id"),
    @Index(name = "idx_import_status", columnList = "import_status"),
    @Index(name = "idx_imported_by", columnList = "imported_by"),
    @Index(name = "idx_started_at", columnList = "started_at")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseImportRecord extends BaseEntity {

    /**
     * 导入批次ID
     */
    @Column(name = "import_batch_id", nullable = false, length = 100)
    private String importBatchId;

    /**
     * 关联的案件包ID
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_package_id")
    private CasePackage casePackage;

    /**
     * 导入文件名
     */
    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    /**
     * 文件路径
     */
    @Column(name = "file_path", length = 500)
    private String filePath;

    /**
     * 文件大小（字节）
     */
    @Column(name = "file_size")
    private Long fileSize;

    /**
     * 总行数
     */
    @Column(name = "total_rows")
    @Builder.Default
    private Integer totalRows = 0;

    /**
     * 成功行数
     */
    @Column(name = "success_rows")
    @Builder.Default
    private Integer successRows = 0;

    /**
     * 失败行数
     */
    @Column(name = "failed_rows")
    @Builder.Default
    private Integer failedRows = 0;

    /**
     * 重复行数
     */
    @Column(name = "duplicate_rows")
    @Builder.Default
    private Integer duplicateRows = 0;

    /**
     * 导入状态
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "import_status", length = 20)
    @Builder.Default
    private ImportStatus importStatus = ImportStatus.UPLOADING;

    /**
     * 导入进度百分比
     */
    @Column(name = "progress_percentage")
    @Builder.Default
    private Integer progressPercentage = 0;

    /**
     * 错误汇总
     */
    @Column(name = "error_summary", columnDefinition = "TEXT")
    private String errorSummary;

    /**
     * 详细错误报告文件路径
     */
    @Column(name = "error_detail_file", length = 500)
    private String errorDetailFile;

    /**
     * 开始时间
     */
    @Column(name = "started_at")
    @Builder.Default
    private LocalDateTime startedAt = LocalDateTime.now();

    /**
     * 完成时间
     */
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    /**
     * 导入人ID
     */
    @Column(name = "imported_by", nullable = false)
    private Long importedBy;

    /**
     * 计算成功率
     */
    public Double getSuccessRate() {
        if (totalRows == null || totalRows == 0) {
            return 0.0;
        }
        return (double) (successRows != null ? successRows : 0) / totalRows * 100;
    }

    /**
     * 计算耗时（秒）
     */
    public Long getDurationSeconds() {
        if (startedAt == null) {
            return 0L;
        }
        LocalDateTime endTime = completedAt != null ? completedAt : LocalDateTime.now();
        return java.time.Duration.between(startedAt, endTime).getSeconds();
    }

    /**
     * 检查是否完成
     */
    public boolean isCompleted() {
        return importStatus == ImportStatus.SUCCESS || 
               importStatus == ImportStatus.FAILED || 
               importStatus == ImportStatus.PARTIAL_SUCCESS;
    }
}