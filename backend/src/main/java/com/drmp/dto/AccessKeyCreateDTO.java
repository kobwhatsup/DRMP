package com.drmp.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Min;
import java.time.LocalDateTime;

/**
 * 创建访问密钥DTO
 */
@Data
public class AccessKeyCreateDTO {

    @NotBlank(message = "密钥名称不能为空")
    private String name;

    private String description;

    @NotBlank(message = "密钥类型不能为空")
    private String keyTypeCode;

    @NotBlank(message = "所有者类型不能为空")
    private String ownerType; // PLATFORM, ORGANIZATION, USER

    @NotNull(message = "所有者ID不能为空")
    private Long ownerId;

    private String permissions; // JSON格式的权限配置

    private String ipWhitelist; // JSON格式的IP白名单

    @Min(value = 1, message = "访问频率限制必须大于0")
    private Integer rateLimitPerMinute = 1000;

    private LocalDateTime expiresAt; // 过期时间，为空表示永不过期
}