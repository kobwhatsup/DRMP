package com.drmp.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.List;

/**
 * Role Create Request DTO
 * 角色创建请求数据传输对象
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleCreateRequest {

    /**
     * 角色代码
     */
    @NotBlank(message = "角色代码不能为空")
    @Size(min = 2, max = 50, message = "角色代码长度必须在2-50个字符之间")
    private String code;

    /**
     * 角色名称
     */
    @NotBlank(message = "角色名称不能为空")
    @Size(min = 2, max = 100, message = "角色名称长度必须在2-100个字符之间")
    private String name;

    /**
     * 角色描述
     */
    @Size(max = 500, message = "角色描述长度不能超过500个字符")
    private String description;

    /**
     * 机构类型（SOURCE/DISPOSAL/SYSTEM）
     */
    private String organizationType;

    /**
     * 是否启用
     */
    private Boolean enabled = true;

    /**
     * 权限ID列表
     */
    private List<Long> permissionIds;

    /**
     * 排序字段
     */
    private Integer sortOrder = 0;
}