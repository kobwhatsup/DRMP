package com.drmp.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 通知响应DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private Long id;

    private String notificationType;

    private String notificationTypeName;

    private String title;

    private String content;

    private String priority;

    private String priorityName;

    private String status;

    private String statusName;

    private String channel;

    private String channelName;

    private String category;

    private String categoryName;

    private Boolean read;

    private LocalDateTime readAt;

    private Long recipientUserId;

    private String recipientUserName;

    private Long recipientOrgId;

    private String recipientOrgName;

    private Long businessId;

    private String businessType;

    private String businessTypeName;

    private String businessName;

    private Map<String, Object> extraData;

    private List<String> tags;

    private Long senderId;

    private String senderName;

    private LocalDateTime scheduledAt;

    private LocalDateTime sentAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime expiresAt;

    private Boolean expired;

    private Integer retryCount;

    private Integer maxRetryCount;

    private String errorMessage;

    private String actionType;

    private String actionUrl;

    private Map<String, String> actionParams;

    // 推送状态
    private Boolean pushed;

    private LocalDateTime pushedAt;

    private Boolean emailSent;

    private LocalDateTime emailSentAt;

    private Boolean smsSent;

    private LocalDateTime smsSentAt;

    // 统计信息
    private Integer totalRecipients;

    private Integer readCount;

    private Integer unreadCount;
}