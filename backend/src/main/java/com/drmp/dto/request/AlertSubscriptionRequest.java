package com.drmp.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

/**
 * 预警订阅请求DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertSubscriptionRequest {
    
    /**
     * 用户ID
     */
    @NotBlank(message = "用户ID不能为空")
    private String userId;
    
    /**
     * 订阅的规则ID列表（空表示全部）
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
    @NotNull(message = "通知渠道不能为空")
    private List<AlertChannel> channels;
    
    /**
     * 是否启用
     */
    @NotNull(message = "启用状态不能为空")
    @Builder.Default
    private Boolean enabled = true;
    
    /**
     * 通知渠道配置
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlertChannel {
        /**
         * 渠道类型：IN_APP, EMAIL, SMS, WEBHOOK
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
         * 发送时间配置（Cron表达式）
         */
        private String schedule;
    }
}