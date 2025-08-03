package com.drmp.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 案件进度响应DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaseProgressResponse {

    private Long id;
    
    private Long caseId;
    
    private String caseNo;
    
    private String debtorName;
    
    private String progressType;
    
    private String progressTypeName;
    
    private String progressContent;
    
    private String contactMethod;
    
    private String contactResult;
    
    private String nextAction;
    
    private LocalDateTime nextContactTime;
    
    private String remark;
    
    private List<String> attachmentUrls;
    
    private Boolean isKeyMilestone;
    
    private String milestoneName;
    
    private Double progressPercentage;
    
    private String handlerName;
    
    private String handlerPhone;
    
    private Long createdBy;
    
    private String createdByName;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    // 同步相关信息
    private String syncSource;
    
    private String syncSourceName;
    
    private LocalDateTime syncTime;
    
    private String idsTaskId;
    
    private String idsStatus;
    
    // 协同信息
    private Boolean isRead;
    
    private LocalDateTime readTime;
    
    private List<Long> readByUsers;
    
    private String status;
    
    private String statusName;
    
    // 统计信息
    private Integer commentCount;
    
    private Integer attachmentCount;
    
    private Boolean hasReminder;
    
    private LocalDateTime reminderTime;
    
    // 机构信息
    private Long organizationId;
    
    private String organizationName;
    
    // 案件基本信息
    private String casePackageName;
    
    private String sourceOrgName;
    
    private String disposalOrgName;
}