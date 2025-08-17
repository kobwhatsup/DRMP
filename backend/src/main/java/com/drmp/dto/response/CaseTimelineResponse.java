package com.drmp.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 案件时间线响应DTO
 */
@Data
public class CaseTimelineResponse {

    private Long id;
    private String eventType;
    private String eventTypeDesc;
    private String title;
    private String content;
    private String handlerName;
    private LocalDateTime eventTime;
    private Boolean isImportant;
    private String attachments;
    private String tags;
    private String source;
}