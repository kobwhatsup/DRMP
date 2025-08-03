package com.drmp.dto.request.system;

import com.drmp.entity.system.SysConfig;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

/**
 * 系统配置创建请求
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
public class ConfigCreateRequest {

    /**
     * 配置键
     */
    @NotBlank(message = "配置键不能为空")
    private String configKey;

    /**
     * 配置值
     */
    private String configValue;

    /**
     * 配置组
     */
    private String configGroup;

    /**
     * 配置名称
     */
    @NotBlank(message = "配置名称不能为空")
    private String configName;

    /**
     * 配置描述
     */
    private String description;

    /**
     * 值类型
     */
    @NotNull(message = "值类型不能为空")
    private SysConfig.ValueType valueType;

    /**
     * 是否加密存储
     */
    private Boolean isEncrypted = false;

    /**
     * 是否系统配置
     */
    private Boolean isSystem = false;

    /**
     * 是否可编辑
     */
    private Boolean editable = true;

    /**
     * 排序序号
     */
    private Integer sortOrder = 0;
}