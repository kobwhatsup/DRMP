package com.drmp.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;

/**
 * 密钥使用日志实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "key_usage_logs")
public class KeyUsageLog extends BaseEntity {

    @Column(name = "key_id", nullable = false, length = 64)
    private String keyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "key_id", referencedColumnName = "key_id", insertable = false, updatable = false)
    private AccessKey accessKey;

    @Column(name = "request_id", length = 64)
    private String requestId;

    @Column(name = "endpoint", nullable = false)
    private String endpoint;

    @Column(name = "method", nullable = false, length = 10)
    private String method;

    @Column(name = "ip_address", nullable = false, length = 45)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "response_status")
    private Integer responseStatus;

    @Column(name = "response_time_ms")
    private Integer responseTimeMs;

    @Column(name = "request_size")
    private Long requestSize;

    @Column(name = "response_size")
    private Long responseSize;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
}