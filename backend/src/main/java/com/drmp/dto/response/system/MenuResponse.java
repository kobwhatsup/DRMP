package com.drmp.dto.response.system;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class MenuResponse {
    
    private Long id;
    
    private String menuCode;
    
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
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    private List<MenuResponse> children = new ArrayList<>();
}