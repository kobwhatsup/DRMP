package com.drmp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Permission List Response DTO
 * 权限列表响应数据传输对象
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionListResponse {

    /**
     * 权限ID
     */
    private Long id;

    /**
     * 权限代码
     */
    private String code;

    /**
     * 权限名称
     */
    private String name;

    /**
     * 权限描述
     */
    private String description;

    /**
     * 资源名称
     */
    private String resource;

    /**
     * 操作名称
     */
    private String action;

    /**
     * 分组名称
     */
    private String groupName;

    /**
     * 角色数量
     */
    private Integer roleCount;

    /**
     * 排序字段
     */
    private Integer sortOrder;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
}