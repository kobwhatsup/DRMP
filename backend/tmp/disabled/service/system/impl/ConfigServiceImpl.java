package com.drmp.service.system.impl;

import com.drmp.dto.request.system.ConfigCreateRequest;
import com.drmp.dto.request.system.ConfigQueryRequest;
import com.drmp.dto.request.system.ConfigUpdateRequest;
import com.drmp.dto.response.system.ConfigResponse;
import com.drmp.entity.system.SysConfig;
import com.drmp.exception.BusinessException;
import com.drmp.exception.ResourceNotFoundException;
import com.drmp.repository.system.SysConfigRepository;
import com.drmp.service.system.ConfigService;
import com.drmp.util.JsonUtils;
import com.drmp.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 系统配置服务实现
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ConfigServiceImpl implements ConfigService {

    private final SysConfigRepository configRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<ConfigResponse> findConfigs(ConfigQueryRequest request) {
        Pageable pageable = PageRequest.of(
            request.getPage(),
            request.getSize(),
            Sort.by(Sort.Direction.ASC, "configGroup", "sortOrder")
        );

        Page<SysConfig> page = configRepository.findByConditions(
            request.getConfigGroup(),
            request.getConfigKey(),
            request.getConfigName(),
            request.getIsSystem(),
            request.getEditable(),
            pageable
        );

        return page.map(ConfigResponse::fromEntitySafe);
    }

    @Override
    @Transactional(readOnly = true)
    public ConfigResponse getConfigById(Long id) {
        SysConfig config = getConfigEntity(id);
        return ConfigResponse.fromEntity(config);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "systemConfig", key = "#configKey")
    public ConfigResponse getConfigByKey(String configKey) {
        SysConfig config = configRepository.findByConfigKey(configKey)
            .orElseThrow(() -> new ResourceNotFoundException("配置不存在：" + configKey));
        return ConfigResponse.fromEntity(config);
    }

    @Override
    @CacheEvict(value = "systemConfig", allEntries = true)
    public ConfigResponse createConfig(ConfigCreateRequest request) {
        // 检查配置键是否已存在
        if (configRepository.existsByConfigKey(request.getConfigKey())) {
            throw new BusinessException("配置键已存在：" + request.getConfigKey());
        }

        // 验证配置值
        if (!validateConfigValue(request.getConfigKey(), request.getConfigValue())) {
            throw new BusinessException("配置值格式不正确");
        }

        SysConfig config = new SysConfig();
        config.setConfigKey(request.getConfigKey());
        config.setConfigValue(request.getConfigValue());
        config.setConfigGroup(request.getConfigGroup());
        config.setConfigName(request.getConfigName());
        config.setDescription(request.getDescription());
        config.setValueType(request.getValueType());
        config.setIsEncrypted(request.getIsEncrypted());
        config.setIsSystem(request.getIsSystem());
        config.setEditable(request.getEditable());
        config.setSortOrder(request.getSortOrder());
        config.setCreatedBy(SecurityUtils.getCurrentUserId());
        config.setCreatedAt(LocalDateTime.now());

        config = configRepository.save(config);
        log.info("创建系统配置成功：{}", request.getConfigKey());

        return ConfigResponse.fromEntity(config);
    }

    @Override
    @CacheEvict(value = "systemConfig", allEntries = true)
    public ConfigResponse updateConfig(Long id, ConfigUpdateRequest request) {
        SysConfig config = getConfigEntity(id);

        // 检查是否可编辑
        if (Boolean.FALSE.equals(config.getEditable())) {
            throw new BusinessException("该配置不允许编辑");
        }

        // 验证配置值
        if (!validateConfigValue(config.getConfigKey(), request.getConfigValue())) {
            throw new BusinessException("配置值格式不正确");
        }

        config.setConfigValue(request.getConfigValue());
        config.setConfigGroup(request.getConfigGroup());
        config.setConfigName(request.getConfigName());
        config.setDescription(request.getDescription());
        config.setValueType(request.getValueType());
        config.setIsEncrypted(request.getIsEncrypted());
        config.setEditable(request.getEditable());
        config.setSortOrder(request.getSortOrder());
        config.setUpdatedBy(SecurityUtils.getCurrentUserId());
        config.setUpdatedAt(LocalDateTime.now());

        config = configRepository.save(config);
        log.info("更新系统配置成功：{}", config.getConfigKey());

        return ConfigResponse.fromEntity(config);
    }

    @Override
    @CacheEvict(value = "systemConfig", allEntries = true)
    public void deleteConfig(Long id) {
        SysConfig config = getConfigEntity(id);

        // 检查是否可删除
        if (Boolean.TRUE.equals(config.getIsSystem())) {
            throw new BusinessException("系统配置不允许删除");
        }

        configRepository.delete(config);
        log.info("删除系统配置成功：{}", config.getConfigKey());
    }

    @Override
    @CacheEvict(value = "systemConfig", allEntries = true)
    public void deleteConfigs(List<Long> ids) {
        List<SysConfig> configs = configRepository.findAllById(ids);

        // 检查是否包含系统配置
        boolean hasSystemConfig = configs.stream()
            .anyMatch(config -> Boolean.TRUE.equals(config.getIsSystem()));
        if (hasSystemConfig) {
            throw new BusinessException("不能删除系统配置");
        }

        configRepository.deleteAllById(ids);
        log.info("批量删除系统配置成功，数量：{}", ids.size());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConfigResponse> getConfigsByGroup(String configGroup) {
        List<SysConfig> configs = configRepository.findByConfigGroupOrderBySortOrderAsc(configGroup);
        return configs.stream()
            .map(ConfigResponse::fromEntitySafe)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllConfigGroups() {
        return configRepository.findAllConfigGroups();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getConfigGroupStatistics() {
        List<Object[]> statistics = configRepository.getConfigGroupStatistics();
        Map<String, Long> result = new HashMap<>();
        for (Object[] stat : statistics) {
            String group = (String) stat[0];
            Long count = (Long) stat[1];
            result.put(group, count);
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public Boolean existsByConfigKey(String configKey) {
        return configRepository.existsByConfigKey(configKey);
    }

    @Override
    @Transactional(readOnly = true)
    public Boolean existsByConfigKeyAndIdNot(String configKey, Long id) {
        return configRepository.existsByConfigKeyAndIdNot(configKey, id);
    }

    @Override
    @CacheEvict(value = "systemConfig", key = "#configKey")
    public void updateConfigValue(String configKey, String configValue) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        int updatedRows = configRepository.updateConfigValueByKey(configKey, configValue, currentUserId);
        if (updatedRows == 0) {
            throw new ResourceNotFoundException("配置不存在：" + configKey);
        }
        log.info("更新配置值成功：{} = {}", configKey, configValue);
    }

    @Override
    @CacheEvict(value = "systemConfig", allEntries = true)
    public void batchUpdateConfigs(Map<String, String> configs) {
        for (Map.Entry<String, String> entry : configs.entrySet()) {
            updateConfigValue(entry.getKey(), entry.getValue());
        }
        log.info("批量更新配置成功，数量：{}", configs.size());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConfigResponse> getSystemConfigs() {
        List<SysConfig> configs = configRepository.findByIsSystemTrueOrderByConfigGroupAscSortOrderAsc();
        return configs.stream()
            .map(ConfigResponse::fromEntitySafe)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConfigResponse> getUserConfigs() {
        List<SysConfig> configs = configRepository.findByIsSystemFalseOrderByConfigGroupAscSortOrderAsc();
        return configs.stream()
            .map(ConfigResponse::fromEntitySafe)
            .collect(Collectors.toList());
    }

    @Override
    public void exportConfigs(String filePath) {
        // TODO: 实现配置导出功能
        log.info("导出系统配置到文件：{}", filePath);
    }

    @Override
    public void importConfigs(String filePath) {
        // TODO: 实现配置导入功能
        log.info("从文件导入系统配置：{}", filePath);
    }

    @Override
    @CacheEvict(value = "systemConfig", key = "#configKey")
    public void resetConfigToDefault(String configKey) {
        String defaultValue = getDefaultValue(configKey);
        if (defaultValue != null) {
            updateConfigValue(configKey, defaultValue);
            log.info("重置配置到默认值：{} = {}", configKey, defaultValue);
        }
    }

    @Override
    @CacheEvict(value = "systemConfig", allEntries = true)
    public void resetConfigGroupToDefault(String configGroup) {
        List<SysConfig> configs = configRepository.findByConfigGroupOrderBySortOrderAsc(configGroup);
        for (SysConfig config : configs) {
            String defaultValue = getDefaultValue(config.getConfigKey());
            if (defaultValue != null) {
                updateConfigValue(config.getConfigKey(), defaultValue);
            }
        }
        log.info("重置配置组到默认值：{}", configGroup);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "systemConfig", key = "#configKey + '_value'")
    public <T> T getConfigValue(String configKey, Class<T> clazz) {
        ConfigResponse config = getConfigByKey(configKey);
        String value = config.getConfigValue();
        
        if (value == null) {
            return null;
        }

        try {
            if (clazz == String.class) {
                return clazz.cast(value);
            } else if (clazz == Integer.class) {
                return clazz.cast(Integer.valueOf(value));
            } else if (clazz == Long.class) {
                return clazz.cast(Long.valueOf(value));
            } else if (clazz == Boolean.class) {
                return clazz.cast(Boolean.valueOf(value));
            } else if (clazz == Double.class) {
                return clazz.cast(Double.valueOf(value));
            } else {
                // 尝试JSON反序列化
                return JsonUtils.fromJsonString(value, clazz);
            }
        } catch (Exception e) {
            log.warn("配置值类型转换失败：{} -> {}", configKey, clazz.getSimpleName(), e);
            return null;
        }
    }

    @Override
    public String getStringValue(String configKey) {
        return getConfigValue(configKey, String.class);
    }

    @Override
    public Integer getIntValue(String configKey) {
        return getConfigValue(configKey, Integer.class);
    }

    @Override
    public Long getLongValue(String configKey) {
        return getConfigValue(configKey, Long.class);
    }

    @Override
    public Boolean getBooleanValue(String configKey) {
        return getConfigValue(configKey, Boolean.class);
    }

    @Override
    public Double getDoubleValue(String configKey) {
        return getConfigValue(configKey, Double.class);
    }

    @Override
    @CacheEvict(value = "systemConfig", allEntries = true)
    public void refreshCache() {
        log.info("刷新系统配置缓存");
    }

    @Override
    public Boolean validateConfigValue(String configKey, String configValue) {
        if (configValue == null) {
            return true;
        }

        try {
            ConfigResponse config = getConfigByKey(configKey);
            SysConfig.ValueType valueType = config.getValueType();

            switch (valueType) {
                case STRING:
                    return true;
                case NUMBER:
                    Double.parseDouble(configValue);
                    return true;
                case BOOLEAN:
                    String lowerValue = configValue.toLowerCase();
                    return "true".equals(lowerValue) || "false".equals(lowerValue);
                case JSON:
                    return JsonUtils.isValidJson(configValue);
                case ARRAY:
                    return JsonUtils.isValidJson(configValue) && configValue.trim().startsWith("[");
                default:
                    return true;
            }
        } catch (Exception e) {
            log.warn("配置值验证失败：{} = {}", configKey, configValue, e);
            return false;
        }
    }

    @Override
    public String getDefaultValue(String configKey) {
        // TODO: 实现获取默认值的逻辑
        // 可以从配置文件或者预定义的默认值映射中获取
        Map<String, String> defaultValues = getDefaultValueMap();
        return defaultValues.get(configKey);
    }

    /**
     * 获取配置实体
     */
    private SysConfig getConfigEntity(Long id) {
        return configRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("配置不存在"));
    }

    /**
     * 获取默认值映射
     */
    private Map<String, String> getDefaultValueMap() {
        Map<String, String> defaultValues = new HashMap<>();
        defaultValues.put("system.title", "DRMP全国分散诉调平台");
        defaultValues.put("system.logo.url", "/assets/logo.png");
        defaultValues.put("security.password.min.length", "8");
        defaultValues.put("security.password.complexity", "true");
        defaultValues.put("security.login.max.failure", "5");
        defaultValues.put("security.session.timeout", "1800");
        defaultValues.put("file.upload.max.size", "10485760");
        defaultValues.put("file.upload.allowed.types", ".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx");
        defaultValues.put("notification.email.enabled", "true");
        defaultValues.put("notification.sms.enabled", "false");
        return defaultValues;
    }
}