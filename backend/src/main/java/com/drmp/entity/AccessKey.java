package com.drmp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 访问密钥实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "access_keys")
public class AccessKey extends BaseEntity {

    @Column(name = "key_id", unique = true, nullable = false, length = 64)
    private String keyId;

    @JsonIgnore
    @Column(name = "key_secret", nullable = false, length = 128)
    private String keySecret;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "key_type_id", nullable = false)
    private KeyType keyType;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "owner_type", nullable = false)
    private OwnerType ownerType;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private KeyStatus status = KeyStatus.ACTIVE;

    @Column(name = "permissions", columnDefinition = "JSON")
    private String permissions;

    @Column(name = "ip_whitelist", columnDefinition = "JSON")
    private String ipWhitelist;

    @Column(name = "rate_limit_per_minute")
    private Integer rateLimitPerMinute = 1000;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @OneToMany(mappedBy = "accessKey", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<KeyUsageLog> usageLogs;

    @OneToMany(mappedBy = "accessKey", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<KeySecurityEvent> securityEvents;

    /**
     * 密钥所有者类型
     */
    public enum OwnerType {
        PLATFORM("平台"),
        ORGANIZATION("机构"),
        USER("用户");

        private final String description;

        OwnerType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 密钥状态
     */
    public enum KeyStatus {
        ACTIVE("激活"),
        EXPIRED("过期"),
        REVOKED("吊销"),
        SUSPENDED("暂停");

        private final String description;

        KeyStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 检查密钥是否有效
     */
    public boolean isValid() {
        if (status != KeyStatus.ACTIVE) {
            return false;
        }
        
        if (expiresAt != null && expiresAt.isBefore(LocalDateTime.now())) {
            return false;
        }
        
        return true;
    }

    /**
     * 检查是否超过访问频率限制
     */
    public boolean isRateLimitExceeded(int currentMinuteRequests) {
        return currentMinuteRequests >= rateLimitPerMinute;
    }

    /**
     * 检查IP是否在白名单中
     */
    public boolean isIpAllowed(String clientIp) {
        if (ipWhitelist == null || ipWhitelist.trim().isEmpty()) {
            return true; // 没有设置白名单，允许所有IP
        }
        
        // TODO: 实现IP白名单检查逻辑
        return true;
    }
}