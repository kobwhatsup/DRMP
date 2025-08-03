package com.drmp.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 通知创建请求DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationCreateRequest {

    @NotBlank(message = "通知类型不能为空")
    private String notificationType;

    @NotBlank(message = "通知标题不能为空")
    @Size(max = 255, message = "通知标题长度不能超过255字符")
    private String title;

    @NotBlank(message = "通知内容不能为空")
    @Size(max = 2000, message = "通知内容长度不能超过2000字符")
    private String content;

    @NotNull(message = "接收用户ID列表不能为空")
    private List<Long> recipientUserIds;

    private List<Long> recipientOrgIds;

    private String priority = "NORMAL";

    private String channel = "SYSTEM";

    private Boolean scheduled = false;

    private LocalDateTime scheduledAt;

    private Long businessId;

    private String businessType;

    private Map<String, Object> extraData;

    private String template;

    private Map<String, String> templateParams;

    private Boolean push = true;

    private Boolean email = false;

    private Boolean sms = false;

    private Long senderId;

    private String senderName;

    private List<String> tags;

    private String category;

    private Boolean persistent = true;

    private Integer retryCount = 0;

    private LocalDateTime expiresAt;
}