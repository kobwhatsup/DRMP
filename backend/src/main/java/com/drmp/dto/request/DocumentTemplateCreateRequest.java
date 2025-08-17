package com.drmp.dto.request;

import com.drmp.entity.DocumentTemplate;
import lombok.Data;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.Map;

/**
 * 创建文书模板请求DTO
 */
@Data
public class DocumentTemplateCreateRequest {

    @NotNull(message = "模板名称不能为空")
    @Size(max = 200, message = "模板名称长度不能超过200字符")
    private String templateName;

    @NotNull(message = "模板类型不能为空")
    private DocumentTemplate.TemplateType templateType;

    @NotNull(message = "文档分类不能为空")
    private DocumentTemplate.DocumentCategory category;

    @NotNull(message = "模板内容不能为空")
    private String templateContent;

    private Map<String, Object> templateVariables;

    @Size(max = 20, message = "输出格式长度不能超过20字符")
    private String outputFormat = "PDF";

    @Size(max = 20, message = "页面大小长度不能超过20字符")
    private String pageSize = "A4";

    @Size(max = 20, message = "页面方向长度不能超过20字符")
    private String pageOrientation = "PORTRAIT";

    @Size(max = 50, message = "字体名称长度不能超过50字符")
    private String fontFamily = "SimSun";

    private Integer fontSize = 12;

    private Boolean isSystemTemplate = false;

    private Boolean isActive = true;

    @Size(max = 500, message = "描述长度不能超过500字符")
    private String description;

    @Size(max = 200, message = "标签长度不能超过200字符")
    private String tags;
}