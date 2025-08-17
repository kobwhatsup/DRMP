package com.drmp.dto.request;

import com.drmp.entity.WorkRecord;
import lombok.Data;

import javax.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * 更新作业记录请求DTO
 */
@Data
public class WorkRecordUpdateRequest {

    private WorkRecord.RecordType recordType;

    @Size(max = 200, message = "标题长度不能超过200字符")
    private String title;

    @Size(max = 2000, message = "内容长度不能超过2000字符")
    private String content;

    private LocalDateTime contactDate;

    private WorkRecord.ContactMethod contactMethod;

    private WorkRecord.ContactResult contactResult;

    private Integer contactDuration;

    @Size(max = 1000, message = "债务人回应长度不能超过1000字符")
    private String debtorResponse;

    private WorkRecord.DebtorAttitude debtorAttitude;

    @Size(max = 500, message = "下一步行动长度不能超过500字符")
    private String nextAction;

    private LocalDateTime nextContactDate;

    private Boolean followUpRequired;

    private Boolean isImportant;

    private Long templateId;

    @Size(max = 100, message = "模板名称长度不能超过100字符")
    private String templateName;

    private String attachments;

    @Size(max = 500, message = "标签长度不能超过500字符")
    private String tags;

    private Integer workDuration;

    @Size(max = 200, message = "位置长度不能超过200字符")
    private String location;

    @Size(max = 50, message = "天气长度不能超过50字符")
    private String weather;
}