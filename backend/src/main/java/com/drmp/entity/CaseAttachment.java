package com.drmp.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * 案件附件实体
 * 支持安全文件存储和管理
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "case_attachments", indexes = {
    @Index(name = "idx_business_type_id", columnList = "businessType,businessId"),
    @Index(name = "idx_uploaded_by", columnList = "uploadedBy"),
    @Index(name = "idx_file_md5", columnList = "fileMd5")
})
public class CaseAttachment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id")
    private CaseDetail caseDetail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_package_id")
    private CasePackage casePackage;

    @Column(name = "original_file_name", nullable = false)
    private String originalFileName;

    @Column(name = "stored_file_name", nullable = false)
    private String storedFileName;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "business_type", nullable = false, length = 50)
    private String businessType;

    @Column(name = "business_id", nullable = false)
    private Long businessId;

    @Column(name = "category", length = 100)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(name = "attachment_type")
    private AttachmentType attachmentType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "upload_status")
    private UploadStatus uploadStatus = UploadStatus.SUCCESS;

    @Column(name = "uploaded_by", nullable = false)
    private Long uploadedBy;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    @Column(name = "file_md5", length = 32)
    private String fileMd5;

    @Column(name = "is_encrypted")
    private Boolean isEncrypted = false;

    @Column(name = "virus_scan_status")
    @Enumerated(EnumType.STRING)
    private VirusScanStatus virusScanStatus = VirusScanStatus.CLEAN;

    @Column(name = "download_count")
    private Integer downloadCount = 0;

    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;

    /**
     * 附件类型
     */
    public enum AttachmentType {
        CONTRACT("借款合同"),
        ID_CARD("身份证扫描件"),
        LOAN_VOUCHER("借据扫描件"),
        PAYMENT_PROOF("还款凭证"),
        LEGAL_DOCUMENT("法律文书"),
        EVIDENCE("证据材料"),
        CORRESPONDENCE("通信记录"),
        OTHER("其他");

        private final String description;

        AttachmentType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 上传状态
     */
    public enum UploadStatus {
        UPLOADING("上传中"),
        SUCCESS("上传成功"),
        FAILED("上传失败"),
        PROCESSING("处理中"),
        QUARANTINED("已隔离");

        private final String description;

        UploadStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 病毒扫描状态
     */
    public enum VirusScanStatus {
        PENDING("待扫描"),
        SCANNING("扫描中"),
        CLEAN("安全"),
        INFECTED("发现病毒"),
        ERROR("扫描失败");

        private final String description;

        VirusScanStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 获取文件大小（MB）
     */
    public Double getFileSizeInMB() {
        if (fileSize != null) {
            return fileSize / (1024.0 * 1024.0);
        }
        return 0.0;
    }

    /**
     * 检查是否为图片文件
     */
    public boolean isImage() {
        if (fileType != null) {
            return fileType.toLowerCase().startsWith("image/");
        }
        return false;
    }

    /**
     * 检查是否为PDF文件
     */
    public boolean isPdf() {
        if (fileType != null) {
            return "application/pdf".equals(fileType.toLowerCase());
        }
        return false;
    }
}