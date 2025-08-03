package com.drmp.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 通知查询请求DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationQueryRequest extends BasePageRequest {

    private Long userId;

    private String notificationType;

    private List<String> notificationTypes;

    private String status;

    private List<String> statuses;

    private String priority;

    private List<String> priorities;

    private String category;

    private List<String> categories;

    private Boolean read;

    private String channel;

    private String businessType;

    private Long businessId;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private String keyword;

    private List<String> tags;

    private Long senderId;

    private String orderBy = "createdAt";

    private String orderDirection = "DESC";
}