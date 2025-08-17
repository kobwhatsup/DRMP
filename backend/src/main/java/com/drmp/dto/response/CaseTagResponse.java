package com.drmp.dto.response;

import com.drmp.entity.CaseTag;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 案件标签响应DTO
 */
@Data
public class CaseTagResponse {

    private Long id;
    private Long caseId;
    private String tagName;
    private CaseTag.TagCategory tagCategory;
    private String tagCategoryDesc;
    private String tagColor;
    private String tagDescription;
    private Boolean isSystemTag;
    private Integer usageCount;
    private LocalDateTime lastUsedAt;
    private Long createdBy;
    private Long organizationId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String displayName;

    public void setTagCategory(CaseTag.TagCategory tagCategory) {
        this.tagCategory = tagCategory;
        this.tagCategoryDesc = tagCategory != null ? tagCategory.getDescription() : null;
    }
}