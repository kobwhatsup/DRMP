package com.drmp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Permission Detail Response DTO
 * 权限详情响应数据传输对象
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionDetailResponse {

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
     * 排序字段
     */
    private Integer sortOrder;

    /**
     * 角色列表
     */
    private List<RoleListResponse> roles;

    /**
     * 创建人ID
     */
    private Long createdBy;

    /**
     * 创建人姓名
     */
    private String createdByName;

    /**
     * 更新人ID
     */
    private Long updatedBy;

    /**
     * 更新人姓名
     */
    private String updatedByName;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

    /**
     * 角色数量
     */
    public Integer getRoleCount() {
        return roles != null ? roles.size() : 0;
    }
}