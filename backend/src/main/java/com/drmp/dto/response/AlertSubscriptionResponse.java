package com.drmp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 预警订阅响应DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertSubscriptionResponse {
    
    /**
     * 订阅ID
     */
    private String id;
    
    /**
     * 用户ID
     */
    private String userId;
    
    /**
     * 用户名称
     */
    private String userName;
    
    /**
     * 订阅的规则ID列表
     */
    private List<String> ruleIds;
    
    /**
     * 订阅的预警类型列表
     */
    private List<String> types;
    
    /**
     * 订阅的预警级别列表
     */
    private List<String> levels;
    
    /**
     * 通知渠道列表
     */
    private List<AlertChannel> channels;
    
    /**
     * 是否启用
     */
    private Boolean enabled;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
    
    /**
     * 最后通知时间
     */
    private LocalDateTime lastNotifiedAt;
    
    /**
     * 通知次数
     */
    private Integer notificationCount;
    
    /**
     * 通知渠道配置
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlertChannel {
        /**
         * 渠道类型
         */
        private String type;
        
        /**
         * 渠道配置
         */
        private Map<String, Object> config;
        
        /**
         * 最低预警级别
         */
        private String minLevel;
        
        /**
         * 发送时间配置
         */
        private String schedule;
        
        /**
         * 是否启用
         */
        private Boolean enabled;
    }
}