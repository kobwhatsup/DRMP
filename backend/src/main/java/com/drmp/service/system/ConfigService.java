package com.drmp.service.system;

import com.drmp.dto.request.system.ConfigCreateRequest;
import com.drmp.dto.request.system.ConfigQueryRequest;
import com.drmp.dto.request.system.ConfigUpdateRequest;
import com.drmp.dto.response.system.ConfigResponse;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

/**
 * 系统配置服务接口
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public interface ConfigService {

    /**
     * 分页查询系统配置
     */
    Page<ConfigResponse> findConfigs(ConfigQueryRequest request);

    /**
     * 根据ID获取配置详情
     */
    ConfigResponse getConfigById(Long id);

    /**
     * 根据配置键获取配置
     */
    ConfigResponse getConfigByKey(String configKey);

    /**
     * 创建系统配置
     */
    ConfigResponse createConfig(ConfigCreateRequest request);

    /**
     * 更新系统配置
     */
    ConfigResponse updateConfig(Long id, ConfigUpdateRequest request);

    /**
     * 删除系统配置
     */
    void deleteConfig(Long id);

    /**
     * 批量删除系统配置
     */
    void deleteConfigs(List<Long> ids);

    /**
     * 根据配置组获取配置列表
     */
    List<ConfigResponse> getConfigsByGroup(String configGroup);

    /**
     * 获取所有配置组
     */
    List<String> getAllConfigGroups();

    /**
     * 获取配置组统计
     */
    Map<String, Long> getConfigGroupStatistics();

    /**
     * 检查配置键是否存在
     */
    Boolean existsByConfigKey(String configKey);

    /**
     * 检查配置键是否存在（排除指定ID）
     */
    Boolean existsByConfigKeyAndIdNot(String configKey, Long id);

    /**
     * 根据配置键更新配置值
     */
    void updateConfigValue(String configKey, String configValue);

    /**
     * 批量更新配置
     */
    void batchUpdateConfigs(Map<String, String> configs);

    /**
     * 获取系统配置（只读）
     */
    List<ConfigResponse> getSystemConfigs();

    /**
     * 获取用户配置（可编辑）
     */
    List<ConfigResponse> getUserConfigs();

    /**
     * 导出配置
     */
    void exportConfigs(String filePath);

    /**
     * 导入配置
     */
    void importConfigs(String filePath);

    /**
     * 重置配置到默认值
     */
    void resetConfigToDefault(String configKey);

    /**
     * 重置配置组到默认值
     */
    void resetConfigGroupToDefault(String configGroup);

    /**
     * 获取配置值（根据类型转换）
     */
    <T> T getConfigValue(String configKey, Class<T> clazz);

    /**
     * 获取配置值（字符串）
     */
    String getStringValue(String configKey);

    /**
     * 获取配置值（整数）
     */
    Integer getIntValue(String configKey);

    /**
     * 获取配置值（长整数）
     */
    Long getLongValue(String configKey);

    /**
     * 获取配置值（布尔值）
     */
    Boolean getBooleanValue(String configKey);

    /**
     * 获取配置值（双精度）
     */
    Double getDoubleValue(String configKey);

    /**
     * 刷新配置缓存
     */
    void refreshCache();

    /**
     * 验证配置值
     */
    Boolean validateConfigValue(String configKey, String configValue);

    /**
     * 获取配置值的默认值
     */
    String getDefaultValue(String configKey);
}