package com.drmp.dto.response.system;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class PermissionResponse {
    
    private Long id;
    
    private String permissionCode;
    
    private String permissionName;
    
    private String description;
    
    private String resourceType;
    
    private String resourcePath;
    
    private String httpMethod;
    
    private Long parentId;
    
    private Integer sortOrder;
    
    private String status;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    private List<PermissionResponse> children = new ArrayList<>();
}