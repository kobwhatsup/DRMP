package com.drmp.dto.request;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.Map;

/**
 * Assignment Rule Request DTO
 * 分案规则请求
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
public class AssignmentRuleRequest {

    @NotBlank(message = "规则名称不能为空")
    @Size(max = 100, message = "规则名称长度不能超过100")
    private String ruleName;

    @Size(max = 500, message = "规则描述长度不能超过500")
    private String description;

    @NotNull(message = "规则类型不能为空")
    private String ruleType; // AUTO, SEMI_AUTO, MANUAL

    @NotNull(message = "规则优先级不能为空")
    private Integer priority;

    private Boolean enabled = true;

    @NotNull(message = "规则条件不能为空")
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
}