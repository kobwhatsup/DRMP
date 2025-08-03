package com.drmp.dto.request.system;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class MenuUpdateRequest {
    
    @NotNull(message = "菜单ID不能为空")
    private Long id;
    
    @NotBlank(message = "菜单名称不能为空")
    private String menuName;
    
    private Long parentId;
    
    private String menuType;
    
    private String path;
    
    private String component;
    
    private String icon;
    
    private Integer sortOrder;
    
    private Boolean visible;
    
    private String status;
    
    private String permissionCode;
    
    private Boolean cacheFlag;
    
    private Boolean externalLink;
    
    private String remark;
}