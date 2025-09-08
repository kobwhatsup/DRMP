package com.drmp.dto.notification;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 通知模板DTO
 *
 * @author DRMP Team
 */
@Data
public class NotificationTemplate {
    
    /**
     * 模板ID
     */
    private Long id;
    
    /**
     * 模板名称
     */
    private String name;
    
    /**
     * 模板代码
     */
    private String code;
    
    /**
     * 模板类型
     */
    private String type; // CASE_ASSIGNMENT, CONTRACT_SIGNED, PAYMENT_RECEIVED
    
    /**
     * 模板标题
     */
    private String titleTemplate;
    
    /**
     * 模板内容
     */
    private String contentTemplate;
    
    /**
     * 支持的通知渠道
     */
    private String[] supportedChannels; // WEBSOCKET, EMAIL, SMS
    
    /**
     * 模板变量定义
     */
    private Map<String, String> variables;
    
    /**
     * 模板状态
     */
    private String status = "ACTIVE"; // ACTIVE, INACTIVE, DRAFT
    
    /**
     * 是否系统模板
     */
    private boolean isSystemTemplate = false;
    
    /**
     * 创建人ID
     */
    private Long createdBy;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
    
    /**
     * 使用次数
     */
    private Long usageCount = 0L;
}