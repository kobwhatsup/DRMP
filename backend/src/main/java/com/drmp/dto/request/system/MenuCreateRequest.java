package com.drmp.dto.request.system;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class MenuCreateRequest {
    
    @NotBlank(message = "菜单编码不能为空")
    private String menuCode;
    
    @NotBlank(message = "菜单名称不能为空")
    private String menuName;
    
    private Long parentId = 0L;
    
    @NotNull(message = "菜单类型不能为空")
    private String menuType;
    
    private String path;
    
    private String component;
    
    private String icon;
    
    private Integer sortOrder = 0;
    
    private Boolean visible = true;
    
    private String permissionCode;
    
    private Boolean cacheFlag = false;
    
    private Boolean externalLink = false;
    
    private String remark;
}