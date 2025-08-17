package com.drmp.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * 文档生成记录实体
 * 记录文档生成的历史和状态
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "document_generations", indexes = {
    @Index(name = "idx_case_id", columnList = "case_id"),
    @Index(name = "idx_template_id", columnList = "template_id"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_generated_by", columnList = "generated_by"),
    @Index(name = "idx_generated_at", columnList = "generated_at"),
    @Index(name = "idx_batch_operation_id", columnList = "batch_operation_id")
})
public class DocumentGeneration extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private CaseDetail caseDetail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private DocumentTemplate documentTemplate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_operation_id")
    private BatchOperation batchOperation;

    @Column(name = "document_name", nullable = false, length = 200)
    private String documentName;

    @Column(name = "file_path", length = 500)
    private String filePath;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "file_md5", length = 32)
    private String fileMd5;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private GenerationStatus status = GenerationStatus.PENDING;

    @Column(name = "generation_data", columnDefinition = "JSON")
    private String generationData;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "generation_time")
    private Integer generationTime;

    @Column(name = "generated_by", nullable = false)
    private Long generatedBy;

    @Column(name = "generated_by_name", length = 100)
    private String generatedByName;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;

    @Column(name = "downloaded_count", columnDefinition = "INT DEFAULT 0")
    private Integer downloadedCount = 0;

    @Column(name = "last_downloaded_at")
    private LocalDateTime lastDownloadedAt;

    @Column(name = "is_signed")
    private Boolean isSigned = false;

    @Column(name = "signed_by")
    private Long signedBy;

    @Column(name = "signed_at")
    private LocalDateTime signedAt;

    @Column(name = "signature_info", columnDefinition = "JSON")
    private String signatureInfo;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "is_archived")
    private Boolean isArchived = false;

    @Column(name = "archive_path", length = 500)
    private String archivePath;

    @Column(name = "remarks", length = 1000)
    private String remarks;

    /**
     * 文档生成状态枚举
     */
    public enum GenerationStatus {
        PENDING("待生成"),
        GENERATING("生成中"),
        COMPLETED("已完成"),
        FAILED("生成失败"),
        EXPIRED("已过期"),
        ARCHIVED("已归档");

        private final String description;

        GenerationStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 标记为开始生成
     */
    public void markAsGenerating() {
        this.status = GenerationStatus.GENERATING;
        this.generatedAt = LocalDateTime.now();
    }

    /**
     * 标记为生成完成
     */
    public void markAsCompleted(String filePath, String fileUrl, Long fileSize, String fileMd5) {
        this.status = GenerationStatus.COMPLETED;
        this.filePath = filePath;
        this.fileUrl = fileUrl;
        this.fileSize = fileSize;
        this.fileMd5 = fileMd5;
        
        if (this.generatedAt != null) {
            this.generationTime = (int) java.time.Duration.between(generatedAt, LocalDateTime.now()).toSeconds();
        }
    }

    /**
     * 标记为生成失败
     */
    public void markAsFailed(String errorMessage) {
        this.status = GenerationStatus.FAILED;
        this.errorMessage = errorMessage;
        
        if (this.generatedAt != null) {
            this.generationTime = (int) java.time.Duration.between(generatedAt, LocalDateTime.now()).toSeconds();
        }
    }

    /**
     * 增加下载次数
     */
    public void incrementDownloadCount() {
        this.downloadedCount = (this.downloadedCount == null ? 0 : this.downloadedCount) + 1;
        this.lastDownloadedAt = LocalDateTime.now();
    }

    /**
     * 获取格式化的文件大小
     */
    public String getFormattedFileSize() {
        if (fileSize == null || fileSize == 0) {
            return "0 B";
        }
        
        String[] units = {"B", "KB", "MB", "GB"};
        double size = fileSize.doubleValue();
        int unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return String.format("%.1f %s", size, units[unitIndex]);
    }

    /**
     * 检查文档是否可下载
     */
    public boolean isDownloadable() {
        return status == GenerationStatus.COMPLETED && 
               filePath != null && 
               !Boolean.TRUE.equals(isArchived) &&
               (expiresAt == null || LocalDateTime.now().isBefore(expiresAt));
    }

    /**
     * 检查文档是否已过期
     */
    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }
}