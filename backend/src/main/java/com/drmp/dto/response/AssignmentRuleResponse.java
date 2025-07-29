package com.drmp.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Assignment Rule Response DTO
 * 分案规则响应
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
public class AssignmentRuleResponse {

    private Long id;
    
    private String ruleName;
    
    private String description;
    
    private String ruleType;
    
    private Integer priority;
    
    private Boolean enabled;
    
    private Map<String, Object> conditions;
    
    private Map<String, Object> actions;
    
    private Map<String, Object> weights;
    
    private Double minMatchingScore;
    
    private String targetRegions;
    
    private String targetAmountRange;
    
    private String targetCaseTypes;
    
    private String excludeOrganizations;
    
    private String includeOrganizations;
    
    private Integer maxAssignments;
    
    private String scheduleRule;
    
    private Boolean notifyOnMatch;
    
    private String notificationTemplate;
    
    private Long createdBy;
    
    private String createdByName;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    private Integer usageCount;
    
    private Integer successCount;
    
    private Double successRate;
    
    private LocalDateTime lastUsedAt;
}