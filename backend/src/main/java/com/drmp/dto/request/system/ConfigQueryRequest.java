package com.drmp.dto.request.system;

import com.drmp.dto.request.BasePageRequest;
import com.drmp.entity.system.SysConfig;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 系统配置查询请求
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ConfigQueryRequest extends BasePageRequest {

    /**
     * 配置组
     */
    private String configGroup;

    /**
     * 配置键
     */
    private String configKey;

    /**
     * 配置名称
     */
    private String configName;

    /**
     * 是否系统配置
     */
    private Boolean isSystem;

    /**
     * 是否可编辑
     */
    private Boolean editable;

    /**
     * 值类型
     */
    private SysConfig.ValueType valueType;

    /**
     * 是否加密
     */
    private Boolean isEncrypted;
}