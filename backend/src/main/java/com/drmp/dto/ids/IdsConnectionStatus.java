package com.drmp.dto.ids;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * IDS连接状态
 *
 * @author DRMP Team
 */
@Data
@Builder
public class IdsConnectionStatus {
    
    /**
     * 机构ID
     */
    private Long organizationId;
    
    /**
     * 是否已连接
     */
    private boolean connected;
    
    /**
     * 连接状态
     */
    private String status; // CONNECTED, DISCONNECTED, ERROR, NOT_CONFIGURED
    
    /**
     * 状态消息
     */
    private String message;
    
    /**
     * 最后同步时间
     */
    private LocalDateTime lastSyncTime;
    
    /**
     * API版本
     */
    private String apiVersion;
    
    /**
     * 响应时间（毫秒）
     */
    private Long responseTime;
    
    /**
     * 错误信息
     */
    private String errorMessage;
    
    /**
     * 检查时间
     */
    private LocalDateTime checkTime = LocalDateTime.now();
    
    /**
     * 创建未配置状态
     */
    public static IdsConnectionStatus notConfigured() {
        return IdsConnectionStatus.builder()
                .connected(false)
                .status("NOT_CONFIGURED")
                .message("机构未配置IDS系统")
                .checkTime(LocalDateTime.now())
                .build();
    }
    
    /**
     * 创建已禁用状态
     */
    public static IdsConnectionStatus disabled() {
        return IdsConnectionStatus.builder()
                .connected(false)
                .status("DISABLED")
                .message("IDS集成已禁用")
                .checkTime(LocalDateTime.now())
                .build();
    }
    
    /**
     * 创建错误状态
     */
    public static IdsConnectionStatus error(String errorMessage) {
        return IdsConnectionStatus.builder()
                .connected(false)
                .status("ERROR")
                .message("连接异常")
                .errorMessage(errorMessage)
                .checkTime(LocalDateTime.now())
                .build();
    }
}