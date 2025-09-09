package com.drmp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 预警响应DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertResponse {
    
    /**
     * 预警ID
     */
    private String id;
    
    /**
     * 规则ID
     */
    private String ruleId;
    
    /**
     * 规则名称
     */
    private String ruleName;
    
    /**
     * 预警类型
     */
    private String type;
    
    /**
     * 预警级别
     */
    private String level;
    
    /**
     * 预警状态
     */
    private String status;
    
    /**
     * 预警标题
     */
    private String title;
    
    /**
     * 预警消息
     */
    private String message;
    
    /**
     * 预警详情
     */
    private Map<String, Object> details;
    
    /**
     * 建议措施
     */
    private List<String> suggestedActions;
    
    /**
     * 触发时间
     */
    private LocalDateTime triggeredAt;
    
    /**
     * 确认时间
     */
    private LocalDateTime acknowledgedAt;
    
    /**
     * 确认人
     */
    private String acknowledgedBy;
    
    /**
     * 解决时间
     */
    private LocalDateTime resolvedAt;
    
    /**
     * 解决人
     */
    private String resolvedBy;
    
    /**
     * 解决方案
     */
    private String resolution;
    
    /**
     * 升级目标
     */
    private String escalatedTo;
    
    /**
     * 关联实体类型
     */
    private String relatedEntityType;
    
    /**
     * 关联实体ID
     */
    private String relatedEntityId;
    
    /**
     * 标签
     */
    private List<String> tags;
    
    /**
     * 响应时间（分钟）
     */
    private Integer responseTime;
    
    /**
     * 解决时间（分钟）
     */
    private Integer resolutionTime;
}