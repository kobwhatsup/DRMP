package com.drmp.dto.request;

import lombok.Data;

import javax.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 案件进度更新请求DTO
 */
@Data
public class CaseProgressUpdateRequest {

    @Size(max = 50, message = "进度类型长度不能超过50字符")
    private String progressType;

    @Size(max = 50, message = "进度状态长度不能超过50字符")
    private String progressStatus;

    @Size(max = 2000, message = "进度描述长度不能超过2000字符")
    private String progressDescription;

    @Size(max = 2000, message = "联系结果长度不能超过2000字符")
    private String contactResult;

    private Integer contactCount;

    private BigDecimal recoveryAmount;

    private LocalDateTime expectedCompletionDate;

    private LocalDateTime actualCompletionDate;

    @Size(max = 500, message = "下一步行动长度不能超过500字符")
    private String nextAction;

    private LocalDateTime nextContactDate;

    private String attachmentUrls;

    @Size(max = 2000, message = "备注长度不能超过2000字符")
    private String remarks;
}