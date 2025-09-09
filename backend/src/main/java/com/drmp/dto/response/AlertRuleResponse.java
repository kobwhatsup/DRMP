package com.drmp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 预警规则响应DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertRuleResponse {
    
    /**
     * 规则ID
     */
    private String id;
    
    /**
     * 规则名称
     */
    private String name;
    
    /**
     * 规则描述
     */
    private String description;
    
    /**
     * 预警类型
     */
    private String type;
    
    /**
     * 预警级别
     */
    private String level;
    
    /**
     * 是否启用
     */
    private Boolean enabled;
    
    /**
     * 触发条件列表
     */
    private List<AlertCondition> conditions;
    
    /**
     * 响应动作列表
     */
    private List<AlertAction> actions;
    
    /**
     * 执行计划（Cron表达式）
     */
    private String schedule;
    
    /**
     * 额外配置
     */
    private Map<String, Object> config;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
    
    /**
     * 创建人
     */
    private String createdBy;
    
    /**
     * 更新人
     */
    private String updatedBy;
    
    /**
     * 触发次数
     */
    private Integer triggerCount;
    
    /**
     * 最后触发时间
     */
    private LocalDateTime lastTriggeredAt;
    
    /**
     * 预警条件
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlertCondition {
        /**
         * 字段名
         */
        private String field;
        
        /**
         * 操作符
         */
        private String operator;
        
        /**
         * 阈值
         */
        private Object value;
        
        /**
         * 单位
         */
        private String unit;
    }
    
    /**
     * 预警动作
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlertAction {
        /**
         * 动作类型
         */
        private String type;
        
        /**
         * 动作配置
         */
        private Map<String, Object> config;
    }
}