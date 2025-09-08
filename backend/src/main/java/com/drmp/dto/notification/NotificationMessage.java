package com.drmp.dto.notification;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 通知消息DTO
 *
 * @author DRMP Team
 */
@Data
public class NotificationMessage {
    
    /**
     * 消息ID
     */
    private Long id;
    
    /**
     * 消息类型
     */
    private String type; // CASE_ASSIGNMENT, CONTRACT_SIGNED, PAYMENT_RECEIVED, SYSTEM_ALERT
    
    /**
     * 消息标题
     */
    private String title;
    
    /**
     * 消息内容
     */
    private String content;
    
    /**
     * 接收人ID
     */
    private Long recipientId;
    
    /**
     * 接收人类型
     */
    private String recipientType; // USER, ORGANIZATION, ALL
    
    /**
     * 发送人ID
     */
    private Long senderId;
    
    /**
     * 消息优先级
     */
    private String priority = "NORMAL"; // LOW, NORMAL, HIGH, URGENT
    
    /**
     * 消息状态
     */
    private String status = "PENDING"; // PENDING, SENT, READ, FAILED
    
    /**
     * 通知渠道
     */
    private String channel; // WEBSOCKET, EMAIL, SMS, WECHAT
    
    /**
     * 扩展数据
     */
    private Map<String, Object> extraData;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 发送时间
     */
    private LocalDateTime sentAt;
    
    /**
     * 已读时间
     */
    private LocalDateTime readAt;
    
    /**
     * 过期时间
     */
    private LocalDateTime expireAt;
    
    /**
     * 重试次数
     */
    private Integer retryCount = 0;
    
    /**
     * 是否可重试
     */
    private boolean retryable = true;
    
    /**
     * 消息分组
     */
    private String category; // BUSINESS, SYSTEM, MARKETING
    
    /**
     * 关联业务ID
     */
    private String businessId;
    
    /**
     * 关联业务类型
     */
    private String businessType; // CASE, CONTRACT, PAYMENT
}