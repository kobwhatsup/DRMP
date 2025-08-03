package com.drmp.dto.response.system;

import com.drmp.entity.system.SysConfig;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 系统配置响应
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfigResponse {

    /**
     * 配置ID
     */
    private Long id;

    /**
     * 配置键
     */
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
    private String configName;

    /**
     * 配置描述
     */
    private String description;

    /**
     * 值类型
     */
    private SysConfig.ValueType valueType;

    /**
     * 值类型描述
     */
    private String valueTypeDesc;

    /**
     * 是否加密存储
     */
    private Boolean isEncrypted;

    /**
     * 是否系统配置
     */
    private Boolean isSystem;

    /**
     * 是否可编辑
     */
    private Boolean editable;

    /**
     * 排序序号
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

    /**
     * 创建人ID
     */
    private Long createdBy;

    /**
     * 更新人ID
     */
    private Long updatedBy;

    /**
     * 从实体转换为响应对象
     */
    public static ConfigResponse fromEntity(SysConfig entity) {
        if (entity == null) {
            return null;
        }

        return ConfigResponse.builder()
                .id(entity.getId())
                .configKey(entity.getConfigKey())
                .configValue(entity.getConfigValue())
                .configGroup(entity.getConfigGroup())
                .configName(entity.getConfigName())
                .description(entity.getDescription())
                .valueType(entity.getValueType())
                .valueTypeDesc(entity.getValueType() != null ? entity.getValueType().getDescription() : null)
                .isEncrypted(entity.getIsEncrypted())
                .isSystem(entity.getIsSystem())
                .editable(entity.getEditable())
                .sortOrder(entity.getSortOrder())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }

    /**
     * 从实体转换为响应对象（不包含敏感信息）
     */
    public static ConfigResponse fromEntitySafe(SysConfig entity) {
        ConfigResponse response = fromEntity(entity);
        if (response != null && Boolean.TRUE.equals(response.getIsEncrypted())) {
            response.setConfigValue("******");
        }
        return response;
    }
}