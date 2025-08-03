package com.drmp.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * 案件进度创建请求DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaseProgressCreateRequest {

    @NotNull(message = "案件ID不能为空")
    private Long caseId;

    @NotBlank(message = "进度类型不能为空")
    @Size(max = 50, message = "进度类型长度不能超过50字符")
    private String progressType;

    @NotBlank(message = "进度内容不能为空")
    @Size(max = 2000, message = "进度内容长度不能超过2000字符")
    private String progressContent;

    @Size(max = 50, message = "联系方式长度不能超过50字符")
    private String contactMethod;

    @Size(max = 500, message = "联系结果长度不能超过500字符")
    private String contactResult;

    @Size(max = 500, message = "下一步行动长度不能超过500字符")
    private String nextAction;

    private LocalDateTime nextContactTime;

    @Size(max = 1000, message = "备注长度不能超过1000字符")
    private String remark;

    private String attachmentUrls;

    private Boolean isKeyMilestone;

    private String milestoneName;

    private Double progressPercentage;

    private String handlerName;

    private String handlerPhone;

    private Long createdBy;

    private LocalDateTime createdAt;

    // IDS系统同步相关字段
    private String idsTaskId;
    private String idsStatus;
    private String syncSource;
}