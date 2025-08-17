package com.drmp.dto.request;

import lombok.Data;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 文档生成请求DTO
 */
@Data
public class DocumentGenerationRequest {

    @NotNull(message = "模板ID不能为空")
    private Long templateId;

    @NotEmpty(message = "案件ID列表不能为空")
    private List<Long> caseIds;

    @NotNull(message = "文档名称不能为空")
    @Size(max = 200, message = "文档名称长度不能超过200字符")
    private String documentName;

    private Map<String, Object> customData;

    private LocalDateTime expiresAt;

    @Size(max = 1000, message = "备注长度不能超过1000字符")
    private String remarks;

    private Boolean asyncGeneration = true;

    private Boolean autoDownload = false;

    private String outputFormat = "PDF";
}