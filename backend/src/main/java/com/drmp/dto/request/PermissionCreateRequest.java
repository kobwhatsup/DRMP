package com.drmp.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

/**
 * Permission Create Request DTO
 * 权限创建请求数据传输对象
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionCreateRequest {

    /**
     * 权限代码（格式：resource:action）
     */
    @NotBlank(message = "权限代码不能为空")
    @Pattern(regexp = "^[a-zA-Z_][a-zA-Z0-9_]*:[a-zA-Z_][a-zA-Z0-9_]*$", 
             message = "权限代码格式不正确，应为resource:action格式")
    @Size(min = 3, max = 100, message = "权限代码长度必须在3-100个字符之间")
    private String code;

    /**
     * 权限名称
     */
    @NotBlank(message = "权限名称不能为空")
    @Size(min = 2, max = 100, message = "权限名称长度必须在2-100个字符之间")
    private String name;

    /**
     * 权限描述
     */
    @Size(max = 500, message = "权限描述长度不能超过500个字符")
    private String description;

    /**
     * 资源名称
     */
    @NotBlank(message = "资源名称不能为空")
    @Size(min = 2, max = 50, message = "资源名称长度必须在2-50个字符之间")
    private String resource;

    /**
     * 操作名称
     */
    @NotBlank(message = "操作名称不能为空")
    @Size(min = 2, max = 50, message = "操作名称长度必须在2-50个字符之间")
    private String action;

    /**
     * 分组名称
     */
    private String groupName;

    /**
     * 排序字段
     */
    private Integer sortOrder = 0;
}