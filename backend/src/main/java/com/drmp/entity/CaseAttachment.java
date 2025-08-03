package com.drmp.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;

/**
 * 案件附件实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "case_attachments")
public class CaseAttachment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private CaseDetail caseDetail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_package_id", nullable = false)
    private CasePackage casePackage;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "file_type", length = 100)
    private String fileType;

    @Enumerated(EnumType.STRING)
    @Column(name = "attachment_type")
    private AttachmentType attachmentType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "upload_status")
    private UploadStatus uploadStatus = UploadStatus.UPLOADING;

    @Column(name = "uploaded_by", nullable = false)
    private Long uploadedBy;

    /**
     * 附件类型
     */
    public enum AttachmentType {
        CONTRACT("借款合同"),
        ID_CARD("身份证扫描件"),
        LOAN_VOUCHER("借据扫描件"),
        PAYMENT_PROOF("还款凭证"),
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
        FAILED("上传失败");

        private final String description;

        UploadStatus(String description) {
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