package com.drmp.dto.response;

import com.drmp.entity.WorkRecord;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 作业记录响应DTO
 */
@Data
public class WorkRecordResponse {

    private Long id;
    private Long caseId;
    private Long handlerId;
    private String handlerName;
    private WorkRecord.RecordType recordType;
    private String recordTypeDesc;
    private String title;
    private String content;
    private LocalDateTime contactDate;
    private WorkRecord.ContactMethod contactMethod;
    private String contactMethodDesc;
    private WorkRecord.ContactResult contactResult;
    private String contactResultDesc;
    private Integer contactDuration;
    private String formattedContactDuration;
    private String debtorResponse;
    private WorkRecord.DebtorAttitude debtorAttitude;
    private String debtorAttitudeDesc;
    private String nextAction;
    private LocalDateTime nextContactDate;
    private Boolean followUpRequired;
    private Boolean isImportant;
    private Long templateId;
    private String templateName;
    private String attachments;
    private String tags;
    private String[] tagList;
    private Integer workDuration;
    private String location;
    private String weather;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean needsFollowUp;

    public void setRecordType(WorkRecord.RecordType recordType) {
        this.recordType = recordType;
        this.recordTypeDesc = recordType != null ? recordType.getDescription() : null;
    }

    public void setContactMethod(WorkRecord.ContactMethod contactMethod) {
        this.contactMethod = contactMethod;
        this.contactMethodDesc = contactMethod != null ? contactMethod.getDescription() : null;
    }

    public void setContactResult(WorkRecord.ContactResult contactResult) {
        this.contactResult = contactResult;
        this.contactResultDesc = contactResult != null ? contactResult.getDescription() : null;
    }

    public void setDebtorAttitude(WorkRecord.DebtorAttitude debtorAttitude) {
        this.debtorAttitude = debtorAttitude;
        this.debtorAttitudeDesc = debtorAttitude != null ? debtorAttitude.getDescription() : null;
    }
}