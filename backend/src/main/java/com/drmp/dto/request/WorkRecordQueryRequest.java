package com.drmp.dto.request;

import com.drmp.entity.WorkRecord;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 查询作业记录请求DTO
 */
@Data
public class WorkRecordQueryRequest {

    private Long caseId;

    private Long handlerId;

    private WorkRecord.RecordType recordType;

    private WorkRecord.ContactMethod contactMethod;

    private WorkRecord.ContactResult contactResult;

    private WorkRecord.DebtorAttitude debtorAttitude;

    private Boolean followUpRequired;

    private Boolean isImportant;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private String keyword;

    private String tags;
}