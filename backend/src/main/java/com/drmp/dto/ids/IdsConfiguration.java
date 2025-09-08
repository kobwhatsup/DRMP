package com.drmp.dto.ids;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * IDS系统配置
 *
 * @author DRMP Team
 */
@Data
public class IdsConfiguration {
    
    /**
     * 关联的机构ID
     */
    private Long organizationId;
    
    /**
     * 是否启用IDS集成
     */
    private boolean enabled = false;
    
    /**
     * IDS系统基础URL
     */
    private String baseUrl;
    
    /**
     * API访问令牌
     */
    private String apiToken;
    
    /**
     * API版本
     */
    private String apiVersion = "v1";
    
    /**
     * 签名密钥
     */
    private String secretKey;
    
    /**
     * 请求超时时间（毫秒）
     */
    private Integer timeout = 30000;
    
    /**
     * 批量同步大小
     */
    private Integer batchSize = 100;
    
    /**
     * 是否启用自动同步
     */
    private boolean autoSync = false;
    
    /**
     * 同步间隔（分钟）
     */
    private Integer syncInterval = 60;
    
    /**
     * 重试次数
     */
    private Integer maxRetries = 3;
    
    /**
     * 重试间隔（秒）
     */
    private Integer retryInterval = 5;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
    
    /**
     * 最后同步时间
     */
    private LocalDateTime lastSyncTime;
    
    /**
     * 配置状态
     */
    private String status = "ACTIVE"; // ACTIVE, DISABLED, ERROR
    
    /**
     * 错误信息
     */
    private String errorMessage;
}