package com.drmp.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * 密钥安全事件实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "key_security_events")
public class KeySecurityEvent extends BaseEntity {

    @Column(name = "key_id", nullable = false, length = 64)
    private String keyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "key_id", referencedColumnName = "key_id", insertable = false, updatable = false)
    private AccessKey accessKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private EventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private Severity severity;

    @Column(name = "source_ip", length = 45)
    private String sourceIp;

    @Column(name = "details", columnDefinition = "JSON")
    private String details;

    @Column(name = "is_resolved")
    private Boolean isResolved = false;

    @Column(name = "resolved_by")
    private Long resolvedBy;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    /**
     * 安全事件类型
     */
    public enum EventType {
        UNAUTHORIZED_ACCESS("未授权访问"),
        RATE_LIMIT_EXCEEDED("超过访问频率限制"),
        IP_BLOCKED("IP被阻止"),
        SUSPICIOUS_ACTIVITY("可疑活动"),
        KEY_COMPROMISED("密钥泄露");

        private final String description;

        EventType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 严重程度
     */
    public enum Severity {
        LOW("低"),
        MEDIUM("中"),
        HIGH("高"),
        CRITICAL("紧急");

        private final String description;

        Severity(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}