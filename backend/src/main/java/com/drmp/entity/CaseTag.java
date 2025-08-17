package com.drmp.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * 案件标签实体
 * 支持多维度的案件标注和分类
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "case_tags", indexes = {
    @Index(name = "idx_case_id", columnList = "case_id"),
    @Index(name = "idx_tag_name", columnList = "tag_name"),
    @Index(name = "idx_tag_category", columnList = "tag_category"),
    @Index(name = "idx_created_by", columnList = "created_by")
})
public class CaseTag extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private CaseDetail caseDetail;

    @Column(name = "tag_name", nullable = false, length = 50)
    private String tagName;

    @Enumerated(EnumType.STRING)
    @Column(name = "tag_category", nullable = false, length = 30)
    private TagCategory tagCategory;

    @Column(name = "tag_color", length = 7)
    private String tagColor;

    @Column(name = "tag_description", length = 200)
    private String tagDescription;

    @Column(name = "is_system_tag", nullable = false)
    private Boolean isSystemTag = false;

    @Column(name = "usage_count", columnDefinition = "INT DEFAULT 0")
    private Integer usageCount = 0;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "organization_id")
    private Long organizationId;

    /**
     * 标签分类枚举
     */
    public enum TagCategory {
        CONTACT_STATUS("联系状态"),
        DEBTOR_ATTITUDE("债务人态度"),
        PAYMENT_CAPABILITY("还款能力"),
        CASE_TYPE("案件类型"),
        PRIORITY("优先级"),
        RISK_LEVEL("风险等级"),
        GEOGRAPHIC("地理位置"),
        INDUSTRY("行业"),
        CUSTOM("自定义");

        private final String description;

        TagCategory(String description) {
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
     * 获取标签显示名称（带分类）
     */
    public String getDisplayName() {
        return tagCategory.getDescription() + ":" + tagName;
    }
}