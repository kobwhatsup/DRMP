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
 * 提醒创建请求DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReminderCreateRequest {

    @NotBlank(message = "提醒标题不能为空")
    @Size(max = 255, message = "提醒标题长度不能超过255字符")
    private String title;

    @NotBlank(message = "提醒内容不能为空")
    @Size(max = 1000, message = "提醒内容长度不能超过1000字符")
    private String content;

    @NotNull(message = "提醒时间不能为空")
    private LocalDateTime remindAt;

    @NotBlank(message = "业务类型不能为空")
    private String businessType;

    private Long businessId;

    private String businessName;

    @Builder.Default
    private String priority = "NORMAL";

    @Builder.Default
    private String repeatType = "ONCE";

    private Integer repeatInterval;

    private String repeatUnit;

    private Integer maxRepeatTimes;

    private LocalDateTime stopRepeatAt;

    @Builder.Default
    private Boolean enabled = true;

    private List<Long> targetUserIds;

    private List<Long> targetOrgIds;

    private Long createdBy;

    private String createdByName;

    private Map<String, Object> extraData;

    private List<String> tags;

    @Builder.Default
    private String channel = "SYSTEM";

    private String actionType;

    private String actionUrl;

    private Map<String, String> actionParams;

    private String template;

    private Map<String, String> templateParams;

    private String remark;
}