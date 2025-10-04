package com.drmp.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * 文书模板实体
 * 管理各种法律文书和通知模板
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "document_templates", indexes = {
    @Index(name = "idx_template_type", columnList = "template_type"),
    @Index(name = "idx_category", columnList = "category"),
    @Index(name = "idx_organization_id", columnList = "organization_id"),
    @Index(name = "idx_is_active", columnList = "is_active"),
    @Index(name = "idx_usage_count", columnList = "usage_count")
})
public class DocumentTemplate extends BaseEntity {

    @Column(name = "template_name", nullable = false, length = 200)
    private String templateName;

    @Enumerated(EnumType.STRING)
    @Column(name = "template_type", nullable = false, length = 30)
    private TemplateType templateType;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 30)
    private DocumentCategory category;

    @Column(name = "template_content", columnDefinition = "TEXT", nullable = false)
    private String templateContent;

    @Column(name = "template_variables", columnDefinition = "TEXT")
    private String templateVariables;

    @Column(name = "output_format", nullable = false, length = 20)
    private String outputFormat = "PDF";

    @Column(name = "page_size", length = 20)
    private String pageSize = "A4";

    @Column(name = "page_orientation", length = 20)
    private String pageOrientation = "PORTRAIT";

    @Column(name = "font_family", length = 50)
    private String fontFamily = "SimSun";

    @Column(name = "font_size")
    private Integer fontSize = 12;

    @Column(name = "is_system_template")
    private Boolean isSystemTemplate = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "usage_count")
    private Integer usageCount = 0;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @Column(name = "organization_id")
    private Long organizationId;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    @Column(name = "version")
    private Integer version = 1;

    @Column(name = "approval_status", length = 20)
    private String approvalStatus = "DRAFT";

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "tags", length = 200)
    private String tags;

    /**
     * 模板类型枚举
     */
    public enum TemplateType {
        LEGAL_NOTICE("法律通知书"),
        PAYMENT_NOTICE("催款通知书"),
        SETTLEMENT_AGREEMENT("和解协议"),
        MEDIATION_AGREEMENT("调解协议"),
        COURT_FILING("起诉状"),
        EVIDENCE_LIST("证据清单"),
        PROPERTY_INQUIRY("财产查询申请"),
        ENFORCEMENT_APPLICATION("强制执行申请"),
        RECEIPT("收据"),
        COMMITMENT_LETTER("承诺书"),
        AUTHORIZATION_LETTER("授权委托书"),
        REPORT("报告"),
        NOTIFICATION("通知"),
        CONTRACT("合同"),
        OTHER("其他");

        private final String description;

        TemplateType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 文档分类枚举
     */
    public enum DocumentCategory {
        PRE_LITIGATION("诉前"),
        LITIGATION("诉讼"),
        ENFORCEMENT("执行"),
        MEDIATION("调解"),
        SETTLEMENT("和解"),
        INTERNAL("内部"),
        EXTERNAL("对外"),
        REPORT("报告");

        private final String description;

        DocumentCategory(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 增加使用次数
     */
    public void incrementUsageCount() {
        this.usageCount = (this.usageCount == null ? 0 : this.usageCount) + 1;
        this.lastUsedAt = LocalDateTime.now();
    }

    /**
     * 检查模板是否可用
     */
    public boolean isAvailable() {
        return Boolean.TRUE.equals(isActive) && 
               "APPROVED".equals(approvalStatus);
    }

    /**
     * 获取模板显示名称
     */
    public String getDisplayName() {
        return templateType.getDescription() + " - " + templateName;
    }

    /**
     * 获取标签列表
     */
    public String[] getTagList() {
        if (tags == null || tags.trim().isEmpty()) {
            return new String[0];
        }
        return tags.split(",");
    }

    /**
     * 设置标签列表
     */
    public void setTagList(String[] tagList) {
        if (tagList == null || tagList.length == 0) {
            this.tags = null;
        } else {
            this.tags = String.join(",", tagList);
        }
    }
}