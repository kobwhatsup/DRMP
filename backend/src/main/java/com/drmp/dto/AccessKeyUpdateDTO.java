package com.drmp.dto;

import lombok.Data;

import javax.validation.constraints.Min;
import java.time.LocalDateTime;

/**
 * 更新访问密钥DTO
 */
@Data
public class AccessKeyUpdateDTO {

    private String name;

    private String description;

    private String permissions; // JSON格式的权限配置

    private String ipWhitelist; // JSON格式的IP白名单

    @Min(value = 1, message = "访问频率限制必须大于0")
    private Integer rateLimitPerMinute;

    private LocalDateTime expiresAt; // 过期时间，为空表示永不过期
}