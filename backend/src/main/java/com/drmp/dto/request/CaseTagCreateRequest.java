package com.drmp.dto.request;

import com.drmp.entity.CaseTag;
import lombok.Data;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 * 创建案件标签请求DTO
 */
@Data
public class CaseTagCreateRequest {

    @NotNull(message = "案件ID不能为空")
    private Long caseId;

    @NotNull(message = "标签名称不能为空")
    @Size(max = 50, message = "标签名称长度不能超过50字符")
    private String tagName;

    @NotNull(message = "标签分类不能为空")
    private CaseTag.TagCategory tagCategory;

    @Size(max = 7, message = "标签颜色长度不能超过7字符")
    private String tagColor;

    @Size(max = 200, message = "标签描述长度不能超过200字符")
    private String tagDescription;

    private Boolean isSystemTag = false;
}