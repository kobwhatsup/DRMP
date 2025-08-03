package com.drmp.dto.request;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/**
 * 案件批量导入请求DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaseBatchImportRequest {

    @NotNull(message = "案件包ID不能为空")
    private Long casePackageId;
    
    @NotBlank(message = "文件名不能为空")
    @Size(max = 255, message = "文件名长度不能超过255个字符")
    private String fileName;
    
    @NotBlank(message = "文件类型不能为空")
    private String fileType;
    
    private Long fileSize;
    
    private String encoding;
    
    private Boolean validateOnly;
    
    private Boolean skipDuplicates;
    
    private String importMode;
    
    private String remarks;
}