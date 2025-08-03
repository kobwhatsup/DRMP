package com.drmp.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 提醒响应DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReminderResponse {

    private Long id;

    private String title;

    private String content;

    private LocalDateTime remindAt;

    private String businessType;

    private String businessTypeName;

    private Long businessId;

    private String businessName;

    private String priority;

    private String priorityName;

    private String status;

    private String statusName;

    private String repeatType;

    private String repeatTypeName;

    private Integer repeatInterval;

    private String repeatUnit;

    private String repeatUnitName;

    private Integer maxRepeatTimes;

    private Integer currentRepeatCount;

    private LocalDateTime stopRepeatAt;

    private LocalDateTime nextRemindAt;

    private Boolean enabled;

    private Boolean completed;

    private LocalDateTime completedAt;

    private Long completedBy;

    private String completedByName;

    private String completionNote;

    private List<Long> targetUserIds;

    private List<String> targetUserNames;

    private List<Long> targetOrgIds;

    private List<String> targetOrgNames;

    private Long createdBy;

    private String createdByName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Map<String, Object> extraData;

    private List<String> tags;

    private String channel;

    private String channelName;

    private String actionType;

    private String actionTypeName;

    private String actionUrl;

    private Map<String, String> actionParams;

    private String template;

    private Map<String, String> templateParams;

    private String remark;

    // 执行历史
    private List<ReminderExecutionResponse> executions;

    // 统计信息
    private Integer totalExecutions;

    private Integer successfulExecutions;

    private Integer failedExecutions;

    private LocalDateTime lastExecutedAt;

    private Boolean lastExecutionSuccess;

    private String lastExecutionError;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReminderExecutionResponse {
        private Long id;
        private LocalDateTime executedAt;
        private Boolean success;
        private String errorMessage;
        private Integer notificationsSent;
        private LocalDateTime nextExecutionAt;
        private String executionNote;
    }
}