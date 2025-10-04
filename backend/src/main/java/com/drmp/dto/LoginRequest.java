package com.drmp.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/**
 * Login Request DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
public class LoginRequest {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度必须在3-50之间")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 100, message = "密码长度必须在6-100之间")
    private String password;

    private String captcha;

    private String captchaKey;

    /**
     * 是否记住我（延长Token有效期至30天）
     */
    private Boolean rememberMe = false;
}