package com.drmp.dto.request.system;

import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

/**
 * 用户更新请求DTO
 */
@Data
public class UserUpdateRequest {

    @Email(message = "邮箱格式不正确")
    private String email;

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;

    @Size(max = 50, message = "真实姓名长度不能超过50")
    private String realName;

    private String avatarUrl;

    private Long organizationId;

    private String userType;

    private String status;

    private Boolean emailVerified;

    private Boolean phoneVerified;

    private Boolean twoFactorEnabled;

    private Long[] roleIds;
}