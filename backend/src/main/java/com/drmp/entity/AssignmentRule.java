package com.drmp.entity;

import lombok.*;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * Assignment Rule Entity
 * 分案规则实体
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Entity
@Table(name = "assignment_rules", indexes = {
    @Index(name = "idx_rule_type", columnList = "rule_type"),
    @Index(name = "idx_enabled", columnList = "enabled"),
    @Index(name = "idx_priority", columnList = "priority")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentRule extends BaseEntity {

    @Column(name = "rule_name", nullable = false, length = 100)
    private String ruleName;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "rule_type", nullable = false, length = 20)
    private String ruleType; // AUTO, SEMI_AUTO, MANUAL

    @Column(name = "priority", nullable = false)
    private Integer priority;

    @Builder.Default
    @Column(name = "enabled", nullable = false)
    private Boolean enabled = true;

    @Column(name = "conditions", columnDefinition = "JSON")
    private String conditions;

    @Column(name = "actions", columnDefinition = "JSON")
    private String actions;

    @Column(name = "weights", columnDefinition = "JSON")
    private String weights;

    @Column(name = "min_matching_score", precision = 5, scale = 2)
    private Double minMatchingScore;

    @Column(name = "target_regions", length = 500)
    private String targetRegions;

    @Column(name = "target_amount_range", length = 100)
    private String targetAmountRange;

    @Column(name = "target_case_types", length = 500)
    private String targetCaseTypes;

    @Column(name = "exclude_organizations", columnDefinition = "TEXT")
    private String excludeOrganizations;

    @Column(name = "include_organizations", columnDefinition = "TEXT")
    private String includeOrganizations;

    @Column(name = "max_assignments")
    private Integer maxAssignments;

    @Column(name = "schedule_rule", length = 200)
    private String scheduleRule;

    @Builder.Default
    @Column(name = "notify_on_match")
    private Boolean notifyOnMatch = false;

    @Column(name = "notification_template", columnDefinition = "TEXT")
    private String notificationTemplate;

    @Column(name = "created_by")
    private Long createdBy;

    @Builder.Default
    @Column(name = "usage_count")
    private Integer usageCount = 0;

    @Builder.Default
    @Column(name = "success_count")
    private Integer successCount = 0;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    /**
     * 计算成功率
     */
    public Double getSuccessRate() {
        if (usageCount == null || usageCount == 0) {
            return 0.0;
        }
        return (double) (successCount != null ? successCount : 0) / usageCount * 100;
    }

    /**
     * 增加使用次数
     */
    public void incrementUsage() {
        this.usageCount = (this.usageCount != null ? this.usageCount : 0) + 1;
        this.lastUsedAt = LocalDateTime.now();
    }

    /**
     * 增加成功次数
     */
    public void incrementSuccess() {
        this.successCount = (this.successCount != null ? this.successCount : 0) + 1;
    }
}