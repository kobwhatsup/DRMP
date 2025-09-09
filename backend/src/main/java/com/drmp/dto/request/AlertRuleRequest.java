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
 * 预警规则请求DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertRuleRequest {
    
    /**
     * 规则名称
     */
    @NotBlank(message = "规则名称不能为空")
    private String name;
    
    /**
     * 规则描述
     */
    private String description;
    
    /**
     * 预警类型
     */
    @NotBlank(message = "预警类型不能为空")
    private String type;
    
    /**
     * 预警级别
     */
    @NotBlank(message = "预警级别不能为空")
    private String level;
    
    /**
     * 是否启用
     */
    @NotNull(message = "启用状态不能为空")
    @Builder.Default
    private Boolean enabled = true;
    
    /**
     * 触发条件列表
     */
    @NotNull(message = "触发条件不能为空")
    private List<AlertCondition> conditions;
    
    /**
     * 响应动作列表
     */
    @NotNull(message = "响应动作不能为空")
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