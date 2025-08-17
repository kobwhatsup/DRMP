package com.drmp.dto.response;

import com.drmp.entity.DocumentTemplate;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 文书模板响应DTO
 */
@Data
public class DocumentTemplateResponse {

    private Long id;
    private String templateName;
    private DocumentTemplate.TemplateType templateType;
    private String templateTypeDesc;
    private DocumentTemplate.DocumentCategory category;
    private String categoryDesc;
    private String templateContent;
    private String templateVariables;
    private String outputFormat;
    private String pageSize;
    private String pageOrientation;
    private String fontFamily;
    private Integer fontSize;
    private Boolean isSystemTemplate;
    private Boolean isActive;
    private Integer usageCount;
    private LocalDateTime lastUsedAt;
    private Long organizationId;
    private Long createdBy;
    private Long updatedBy;
    private Integer version;
    private String approvalStatus;
    private Long approvedBy;
    private LocalDateTime approvedAt;
    private String description;
    private String tags;
    private String[] tagList;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String displayName;
    private Boolean isAvailable;

    public void setTemplateType(DocumentTemplate.TemplateType templateType) {
        this.templateType = templateType;
        this.templateTypeDesc = templateType != null ? templateType.getDescription() : null;
    }

    public void setCategory(DocumentTemplate.DocumentCategory category) {
        this.category = category;
        this.categoryDesc = category != null ? category.getDescription() : null;
    }
}