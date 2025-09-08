package com.drmp.service.ids;

import com.drmp.dto.ids.IdsConfiguration;
import com.drmp.entity.Organization;
import com.drmp.repository.OrganizationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * IDS配置服务
 * 管理处置机构的IDS系统配置信息
 *
 * @author DRMP Team
 */
@Slf4j
@Service
public class IdsConfigurationService {
    
    @Autowired
    private OrganizationRepository organizationRepository;
    
    /**
     * 获取机构的IDS配置
     * 使用缓存提升查询性能
     *
     * @param organizationId 机构ID
     * @return IDS配置
     */
    @Cacheable(value = "idsConfig", key = "#organizationId")
    public IdsConfiguration getConfiguration(Long organizationId) {
        try {
            Organization org = organizationRepository.findById(organizationId).orElse(null);
            if (org == null) {
                log.warn("机构不存在: orgId={}", organizationId);
                return null;
            }
            
            // 从机构扩展信息中获取IDS配置
            Map<String, Object> idsConfig = extractIdsConfig(org.getExtraData());
            if (idsConfig == null || idsConfig.isEmpty()) {
                log.debug("机构未配置IDS: orgId={}", organizationId);
                return null;
            }
            
            return buildIdsConfiguration(organizationId, idsConfig);
            
        } catch (Exception e) {
            log.error("获取IDS配置异常: orgId={}", organizationId, e);
            return null;
        }
    }
    
    /**
     * 保存IDS配置
     *
     * @param organizationId 机构ID
     * @param configuration IDS配置
     * @return 保存结果
     */
    @Transactional
    @CacheEvict(value = "idsConfig", key = "#organizationId")
    public boolean saveConfiguration(Long organizationId, IdsConfiguration configuration) {
        try {
            Organization org = organizationRepository.findById(organizationId).orElse(null);
            if (org == null) {
                log.warn("机构不存在: orgId={}", organizationId);
                return false;
            }
            
            // 验证配置有效性
            if (!validateConfiguration(configuration)) {
                log.warn("IDS配置验证失败: orgId={}", organizationId);
                return false;
            }
            
            // 更新机构的IDS配置
            Map<String, Object> extraData = org.getExtraData();
            if (extraData == null) {
                extraData = new java.util.HashMap<>();
            }
            
            Map<String, Object> idsConfig = convertToConfigMap(configuration);
            extraData.put("ids_config", idsConfig);
            
            org.setExtraData(extraData);
            org.setUpdatedAt(LocalDateTime.now());
            organizationRepository.save(org);
            
            log.info("IDS配置保存成功: orgId={}", organizationId);
            return true;
            
        } catch (Exception e) {
            log.error("保存IDS配置异常: orgId={}", organizationId, e);
            return false;
        }
    }
    
    /**
     * 测试IDS连接
     *
     * @param configuration IDS配置
     * @return 测试结果
     */
    public IdsConnectionTestResult testConnection(IdsConfiguration configuration) {
        try {
            if (!validateConfiguration(configuration)) {
                return IdsConnectionTestResult.failure("配置验证失败");
            }
            
            // 创建测试请求
            String healthUrl = configuration.getBaseUrl() + "/api/health";
            
            // 设置请求头
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("Authorization", "Bearer " + configuration.getApiToken());
            headers.set("Content-Type", "application/json");
            headers.set("X-API-Version", configuration.getApiVersion());
            
            // 发送测试请求
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            org.springframework.http.HttpEntity<Void> entity = new org.springframework.http.HttpEntity<>(headers);
            
            long startTime = System.currentTimeMillis();
            org.springframework.http.ResponseEntity<Map> response = restTemplate.exchange(
                    healthUrl, org.springframework.http.HttpMethod.GET, entity, Map.class);
            long responseTime = System.currentTimeMillis() - startTime;
            
            if (response.getStatusCode().is2xxSuccessful()) {
                Map<String, Object> body = response.getBody();
                boolean healthy = body != null && Boolean.TRUE.equals(body.get("healthy"));
                
                return IdsConnectionTestResult.success(
                        "连接成功", responseTime, 
                        body != null ? body.get("version") : "unknown");
            } else {
                return IdsConnectionTestResult.failure(
                        "连接失败: HTTP " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            log.error("IDS连接测试异常", e);
            return IdsConnectionTestResult.failure("连接异常: " + e.getMessage());
        }
    }
    
    /**
     * 获取所有启用IDS的机构
     *
     * @return 机构列表
     */
    public List<Organization> getIdsEnabledOrganizations() {
        try {
            // 查询所有处置机构
            List<Organization> allOrgs = organizationRepository.findByTypeAndStatus("DISPOSAL", "ACTIVE");
            
            // 过滤出启用IDS的机构
            return allOrgs.stream()
                    .filter(org -> {
                        IdsConfiguration config = getConfiguration(org.getId());
                        return config != null && config.isEnabled();
                    })
                    .collect(java.util.stream.Collectors.toList());
                    
        } catch (Exception e) {
            log.error("获取IDS启用机构列表异常", e);
            return java.util.Collections.emptyList();
        }
    }
    
    /**
     * 禁用机构的IDS配置
     *
     * @param organizationId 机构ID
     * @return 操作结果
     */
    @Transactional
    @CacheEvict(value = "idsConfig", key = "#organizationId")
    public boolean disableConfiguration(Long organizationId) {
        try {
            IdsConfiguration config = getConfiguration(organizationId);
            if (config == null) {
                return true; // 已经没有配置
            }
            
            config.setEnabled(false);
            return saveConfiguration(organizationId, config);
            
        } catch (Exception e) {
            log.error("禁用IDS配置异常: orgId={}", organizationId, e);
            return false;
        }
    }
    
    /**
     * 批量更新IDS配置
     *
     * @param configurations 配置映射（机构ID -> 配置）
     * @return 更新结果
     */
    @Transactional
    public Map<Long, Boolean> batchUpdateConfigurations(Map<Long, IdsConfiguration> configurations) {
        Map<Long, Boolean> results = new java.util.HashMap<>();
        
        for (Map.Entry<Long, IdsConfiguration> entry : configurations.entrySet()) {
            Long orgId = entry.getKey();
            IdsConfiguration config = entry.getValue();
            
            boolean success = saveConfiguration(orgId, config);
            results.put(orgId, success);
        }
        
        return results;
    }
    
    // ==================== 私有方法 ====================
    
    /**
     * 从扩展数据中提取IDS配置
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> extractIdsConfig(Map<String, Object> extraData) {
        if (extraData == null) {
            return null;
        }
        
        Object idsConfigObj = extraData.get("ids_config");
        if (idsConfigObj instanceof Map) {
            return (Map<String, Object>) idsConfigObj;
        }
        
        return null;
    }
    
    /**
     * 构建IDS配置对象
     */
    private IdsConfiguration buildIdsConfiguration(Long organizationId, Map<String, Object> configMap) {
        IdsConfiguration config = new IdsConfiguration();
        config.setOrganizationId(organizationId);
        config.setEnabled(Boolean.TRUE.equals(configMap.get("enabled")));
        config.setBaseUrl((String) configMap.get("baseUrl"));
        config.setApiToken((String) configMap.get("apiToken"));
        config.setApiVersion((String) configMap.get("apiVersion"));
        config.setSecretKey((String) configMap.get("secretKey"));
        config.setTimeout((Integer) configMap.get("timeout"));
        config.setBatchSize((Integer) configMap.get("batchSize"));
        config.setAutoSync(Boolean.TRUE.equals(configMap.get("autoSync")));
        config.setSyncInterval((Integer) configMap.get("syncInterval"));
        
        return config;
    }
    
    /**
     * 将配置对象转换为Map
     */
    private Map<String, Object> convertToConfigMap(IdsConfiguration config) {
        Map<String, Object> configMap = new java.util.HashMap<>();
        configMap.put("enabled", config.isEnabled());
        configMap.put("baseUrl", config.getBaseUrl());
        configMap.put("apiToken", config.getApiToken());
        configMap.put("apiVersion", config.getApiVersion());
        configMap.put("secretKey", config.getSecretKey());
        configMap.put("timeout", config.getTimeout());
        configMap.put("batchSize", config.getBatchSize());
        configMap.put("autoSync", config.isAutoSync());
        configMap.put("syncInterval", config.getSyncInterval());
        configMap.put("updatedAt", LocalDateTime.now().toString());
        
        return configMap;
    }
    
    /**
     * 验证配置有效性
     */
    private boolean validateConfiguration(IdsConfiguration config) {
        if (config == null) {
            return false;
        }
        
        // 基本字段验证
        if (config.getBaseUrl() == null || config.getBaseUrl().trim().isEmpty()) {
            log.warn("IDS配置验证失败: baseUrl为空");
            return false;
        }
        
        if (config.getApiToken() == null || config.getApiToken().trim().isEmpty()) {
            log.warn("IDS配置验证失败: apiToken为空");
            return false;
        }
        
        // URL格式验证
        try {
            new java.net.URL(config.getBaseUrl());
        } catch (Exception e) {
            log.warn("IDS配置验证失败: baseUrl格式不正确 - {}", config.getBaseUrl());
            return false;
        }
        
        // 数值范围验证
        if (config.getTimeout() != null && (config.getTimeout() < 1000 || config.getTimeout() > 300000)) {
            log.warn("IDS配置验证失败: timeout超出范围 - {}", config.getTimeout());
            return false;
        }
        
        if (config.getBatchSize() != null && (config.getBatchSize() < 1 || config.getBatchSize() > 1000)) {
            log.warn("IDS配置验证失败: batchSize超出范围 - {}", config.getBatchSize());
            return false;
        }
        
        return true;
    }
    
    /**
     * IDS连接测试结果
     */
    public static class IdsConnectionTestResult {
        private boolean success;
        private String message;
        private Long responseTime;
        private Object version;
        
        public static IdsConnectionTestResult success(String message, Long responseTime, Object version) {
            IdsConnectionTestResult result = new IdsConnectionTestResult();
            result.success = true;
            result.message = message;
            result.responseTime = responseTime;
            result.version = version;
            return result;
        }
        
        public static IdsConnectionTestResult failure(String message) {
            IdsConnectionTestResult result = new IdsConnectionTestResult();
            result.success = false;
            result.message = message;
            return result;
        }
        
        // Getters
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public Long getResponseTime() { return responseTime; }
        public Object getVersion() { return version; }
    }
}