package com.drmp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Role List Response DTO
 * 角色列表响应数据传输对象
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleListResponse {

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
     * 权限数量
     */
    private Integer permissionCount;

    /**
     * 用户数量
     */
    private Integer userCount;

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