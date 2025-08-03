package com.drmp.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 访问密钥响应DTO
 */
@Data
public class AccessKeyResponseDTO {

    private Long id;

    private String keyId;

    private String keySecret; // 仅在创建时返回，其他时候为null

    private String name;

    private String description;

    private String keyTypeCode;

    private String keyTypeName;

    private String ownerType;

    private Long ownerId;

    private String status;

    private String permissions;

    private String ipWhitelist;

    private Integer rateLimitPerMinute;

    private LocalDateTime expiresAt;

    private LocalDateTime lastUsedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // 统计信息
    private Long totalRequests;
    
    private Long successfulRequests;
    
    private Long failedRequests;
    
    private Double avgResponseTime;
}