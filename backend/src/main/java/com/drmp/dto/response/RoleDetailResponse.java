package com.drmp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Role Detail Response DTO
 * 角色详情响应数据传输对象
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleDetailResponse {

    /**
     * 角色ID
     */
    private Long id;

    /**
     * 角色代码
     */
    private String code;

    /**
     * 角色名称
     */
    private String name;

    /**
     * 角色描述
     */
    private String description;

    /**
     * 机构类型
     */
    private String organizationType;

    /**
     * 机构类型名称
     */
    private String organizationTypeName;

    /**
     * 是否系统角色
     */
    private Boolean isSystem;

    /**
     * 是否启用
     */
    private Boolean enabled;

    /**
     * 排序字段
     */
    private Integer sortOrder;

    /**
     * 权限列表
     */
    private List<PermissionListResponse> permissions;

    /**
     * 用户列表
     */
    private List<UserSimpleResponse> users;

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
     * 权限数量
     */
    public Integer getPermissionCount() {
        return permissions != null ? permissions.size() : 0;
    }

    /**
     * 用户数量
     */
    public Integer getUserCount() {
        return users != null ? users.size() : 0;
    }
}