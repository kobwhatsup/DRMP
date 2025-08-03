package com.drmp.dto.request.system;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class PermissionCreateRequest {
    
    @NotBlank(message = "权限编码不能为空")
    private String permissionCode;
    
    @NotBlank(message = "权限名称不能为空")
    private String permissionName;
    
    private String description;
    
    @NotNull(message = "资源类型不能为空")
    private String resourceType = "API";
    
    private String resourcePath;
    
    private String httpMethod;
    
    private Long parentId = 0L;
    
    private Integer sortOrder = 0;
}