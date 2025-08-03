package com.drmp.dto.request.system;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class PermissionUpdateRequest {
    
    @NotNull(message = "权限ID不能为空")
    private Long id;
    
    @NotBlank(message = "权限名称不能为空")
    private String permissionName;
    
    private String description;
    
    private String resourceType;
    
    private String resourcePath;
    
    private String httpMethod;
    
    private Long parentId;
    
    private Integer sortOrder;
    
    private String status;
}