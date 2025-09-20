package com.drmp.controller.system;

import com.drmp.annotation.OperationLog;
import com.drmp.dto.request.system.ConfigCreateRequest;
import com.drmp.dto.request.system.ConfigQueryRequest;
import com.drmp.dto.request.system.ConfigUpdateRequest;
import com.drmp.dto.response.ApiResponse;
import com.drmp.dto.response.system.ConfigResponse;
import com.drmp.entity.system.SysOperationLog;
import com.drmp.service.system.ConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * 系统配置控制器
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/system/configs")
@RequiredArgsConstructor
@Validated
public class ConfigController {

    private final ConfigService configService;

    /**
     * 分页查询系统配置
     */
    @GetMapping
    @OperationLog(module = "系统配置", operationType = SysOperationLog.OperationType.QUERY, description = "查询系统配置列表")
    public ApiResponse<Page<ConfigResponse>> getConfigs(@Valid ConfigQueryRequest request) {
        Page<ConfigResponse> configs = configService.findConfigs(request);
        return ApiResponse.success(configs);
    }

    /**
     * 根据ID获取配置详情
     */
    @GetMapping("/{id}")
    @OperationLog(module = "系统配置", operationType = SysOperationLog.OperationType.QUERY, description = "查询系统配置详情")
    public ApiResponse<ConfigResponse> getConfigById(@PathVariable Long id) {
        ConfigResponse config = configService.getConfigById(id);
        return ApiResponse.success(config);
    }

    /**
     * 根据配置键获取配置
     */
    @GetMapping("/key/{configKey}")
    @OperationLog(module = "系统配置", operationType = SysOperationLog.OperationType.QUERY, description = "根据键查询系统配置")
    public ApiResponse<ConfigResponse> getConfigByKey(@PathVariable String configKey) {
        ConfigResponse config = configService.getConfigByKey(configKey);
        return ApiResponse.success(config);
    }

    /**
     * 创建系统配置
     */
    @PostMapping
    @OperationLog(module = "系统配置", operationType = SysOperationLog.OperationType.CREATE, description = "创建系统配置")
    public ApiResponse<ConfigResponse> createConfig(@Valid @RequestBody ConfigCreateRequest request) {
        ConfigResponse config = configService.createConfig(request);
        return ApiResponse.success(config);
    }

    /**
     * 更新系统配置
     */
    @PutMapping("/{id}")
    @OperationLog(module = "系统配置", operationType = SysOperationLog.OperationType.UPDATE, description = "更新系统配置")
    public ApiResponse<ConfigResponse> updateConfig(@PathVariable Long id, @Valid @RequestBody ConfigUpdateRequest request) {
        ConfigResponse config = configService.updateConfig(id, request);
        return ApiResponse.success(config);
    }

    /**
     * 删除系统配置
     */
    @DeleteMapping("/{id}")
    @OperationLog(module = "系统配置", operationType = SysOperationLog.OperationType.DELETE, description = "删除系统配置")
    public ApiResponse<Void> deleteConfig(@PathVariable Long id) {
        configService.deleteConfig(id);
        return ApiResponse.success();
    }

    /**
     * 批量删除系统配置
     */
    @DeleteMapping("/batch")
    @OperationLog(module = "系统配置", operationType = SysOperationLog.OperationType.DELETE, description = "批量删除系统配置")
    public ApiResponse<Void> deleteConfigs(@RequestBody List<Long> ids) {
        configService.deleteConfigs(ids);
        return ApiResponse.success();
    }

    /**
     * 根据配置组获取配置列表
     */
    @GetMapping("/group/{configGroup}")
    @OperationLog(module = "系统配置", operationType = SysOperationLog.OperationType.QUERY, description = "根据组查询系统配置")
    public ApiResponse<List<ConfigResponse>> getConfigsByGroup(@PathVariable String configGroup) {
        List<ConfigResponse> configs = configService.getConfigsByGroup(configGroup);
        return ApiResponse.success(configs);
    }

    /**
     * 获取所有配置组
     */
    @GetMapping("/groups")
    @OperationLog(module = "系统配置", operationType = SysOperationLog.OperationType.QUERY, description = "查询配置组列表")
    public ApiResponse<List<String>> getAllConfigGroups() {
        List<String> groups = configService.getAllConfigGroups();
        return ApiResponse.success(groups);
    }

    /**
     * 获取配置组统计
     */
    @GetMapping("/groups/statistics")
    @OperationLog(module = "系统配置", operationType = SysOperationLog.OperationType.QUERY, description = "查询配置组统计")
    public ApiResponse<Map<String, Long>> getConfigGroupStatistics() {
        Map<String, Long> statistics = configService.getConfigGroupStatistics();
        return ApiResponse.success(statistics);
    }

    /**
     * 检查配置键是否存在
     */
    @GetMapping("/exists/{configKey}")
    public ApiResponse<Boolean> existsByConfigKey(@PathVariable String configKey) {
        Boolean exists = configService.existsByConfigKey(configKey);
        return ApiResponse.success(exists);
    }

    /**
     * 更新配置值
     */
    @PutMapping("/value/{configKey}")
    @OperationLog(module = "系统配置", operationType = SysOperationLog.OperationType.UPDATE, description = "更新配置值")
    public ApiResponse<Void> updateConfigValue(@PathVariable String configKey, @RequestBody String configValue) {
        configService.updateConfigValue(configKey, configValue);
        return ApiResponse.success();
    }

    /**
     * 批量更新配置
     */
    @PutMapping("/batch")
    @OperationLog(module = "系统配置", operationType = SysOperationLog.OperationType.UPDATE, description = "批量更新配置")
    public ApiResponse<Void> batchUpdateConfigs(@RequestBody Map<String, String> configs) {
        configService.batchUpdateConfigs(configs);
        return ApiResponse.success();
    }

    /**
     * 获取系统配置
     */
    @GetMapping("/system")
    @OperationLog(module = "系统配置", operationType = SysOperationLog.OperationType.QUERY, description = "查询系统配置")
    public ApiResponse<List<ConfigResponse>> getSystemConfigs() {
        List<ConfigResponse> configs = configService.getSystemConfigs();
        return ApiResponse.success(configs);
    }

    /**
     * 获取用户配置
     */
    @GetMapping("/user")
    @OperationLog(module = "系统配置", operationType = SysOperationLog.OperationType.QUERY, description = "查询用户配置")
    public ApiResponse<List<ConfigResponse>> getUserConfigs() {
        List<ConfigResponse> configs = configService.getUserConfigs();
        return ApiResponse.success(configs);
    }

    /**
     * 导出配置
     */
    @PostMapping("/export")
    @OperationLog(module = "系统配置", operationType = SysOperationLog.OperationType.EXPORT, description = "导出系统配置")
    public ApiResponse<Void> exportConfigs() {
        String filePath = "/tmp/system_configs_" + System.currentTimeMillis() + ".json";
        configService.exportConfigs(filePath);
        return ApiResponse.success();
    }

    /**
     * 导入配置
     */
    @PostMapping("/import")
    @OperationLog(module = "系统配置", operationType = SysOperationLog.OperationType.IMPORT, description = "导入系统配置")
    public ApiResponse<Void> importConfigs(@RequestParam String filePath) {
        configService.importConfigs(filePath);
        return ApiResponse.success();
    }

    /**
     * 重置配置到默认值
     */
    @PostMapping("/reset/{configKey}")
    @OperationLog(module = "系统配置", operationType = SysOperationLog.OperationType.UPDATE, description = "重置配置到默认值")
    public ApiResponse<Void> resetConfigToDefault(@PathVariable String configKey) {
        configService.resetConfigToDefault(configKey);
        return ApiResponse.success();
    }

    /**
     * 重置配置组到默认值
     */
    @PostMapping("/reset/group/{configGroup}")
    @OperationLog(module = "系统配置", operationType = SysOperationLog.OperationType.UPDATE, description = "重置配置组到默认值")
    public ApiResponse<Void> resetConfigGroupToDefault(@PathVariable String configGroup) {
        configService.resetConfigGroupToDefault(configGroup);
        return ApiResponse.success();
    }

    /**
     * 刷新配置缓存
     */
    @PostMapping("/refresh-cache")
    @OperationLog(module = "系统配置", operationType = SysOperationLog.OperationType.UPDATE, description = "刷新配置缓存")
    public ApiResponse<Void> refreshCache() {
        configService.refreshCache();
        return ApiResponse.success();
    }

    /**
     * 验证配置值
     */
    @PostMapping("/validate/{configKey}")
    public ApiResponse<Boolean> validateConfigValue(@PathVariable String configKey, @RequestBody String configValue) {
        Boolean valid = configService.validateConfigValue(configKey, configValue);
        return ApiResponse.success(valid);
    }

    /**
     * 获取配置的字符串值
     */
    @GetMapping("/value/string/{configKey}")
    public ApiResponse<String> getStringValue(@PathVariable String configKey) {
        String value = configService.getStringValue(configKey);
        return ApiResponse.success(value);
    }

    /**
     * 获取配置的整数值
     */
    @GetMapping("/value/int/{configKey}")
    public ApiResponse<Integer> getIntValue(@PathVariable String configKey) {
        Integer value = configService.getIntValue(configKey);
        return ApiResponse.success(value);
    }

    /**
     * 获取配置的布尔值
     */
    @GetMapping("/value/boolean/{configKey}")
    public ApiResponse<Boolean> getBooleanValue(@PathVariable String configKey) {
        Boolean value = configService.getBooleanValue(configKey);
        return ApiResponse.success(value);
    }
}