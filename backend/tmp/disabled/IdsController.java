package com.drmp.controller;

import com.drmp.common.ApiResponse;
import com.drmp.dto.ids.*;
import com.drmp.entity.Cases;
import com.drmp.entity.Organization;
import com.drmp.service.ids.IdsIntegrationService;
import com.drmp.service.ids.IdsConfigurationService;
import com.drmp.service.CaseService;
import com.drmp.service.OrganizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * IDS系统集成API控制器
 *
 * @author DRMP Team
 */
@Slf4j
@RestController
@RequestMapping("/v1/ids")
@Tag(name = "IDS集成", description = "智调系统集成相关API")
public class IdsController {
    
    @Autowired
    private IdsIntegrationService idsIntegrationService;
    
    @Autowired
    private IdsConfigurationService configurationService;
    
    @Autowired
    private CaseService caseService;
    
    @Autowired
    private OrganizationService organizationService;
    
    /**
     * 配置IDS系统
     */
    @PostMapping("/config/{organizationId}")
    @Operation(summary = "配置IDS系统", description = "为机构配置IDS系统连接信息")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('ORG_ADMIN') and #organizationId == authentication.principal.organizationId)")
    public ApiResponse<Boolean> configureIds(
            @Parameter(description = "机构ID") @PathVariable Long organizationId,
            @Parameter(description = "IDS配置") @RequestBody IdsConfiguration configuration) {
        
        try {
            log.info("配置IDS系统: orgId={}", organizationId);
            
            // 设置机构ID
            configuration.setOrganizationId(organizationId);
            
            // 测试连接
            IdsConfigurationService.IdsConnectionTestResult testResult = 
                    configurationService.testConnection(configuration);
            
            if (!testResult.isSuccess()) {
                return ApiResponse.error(400, "IDS连接测试失败: " + testResult.getMessage());
            }
            
            // 保存配置
            boolean success = configurationService.saveConfiguration(organizationId, configuration);
            
            if (success) {
                return ApiResponse.success(true, "IDS配置保存成功");
            } else {
                return ApiResponse.error(500, "IDS配置保存失败");
            }
            
        } catch (Exception e) {
            log.error("配置IDS系统异常: orgId={}", organizationId, e);
            return ApiResponse.error(500, "配置IDS系统异常: " + e.getMessage());
        }
    }
    
    /**
     * 获取IDS配置
     */
    @GetMapping("/config/{organizationId}")
    @Operation(summary = "获取IDS配置", description = "获取机构的IDS系统配置信息")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('ORG_ADMIN') and #organizationId == authentication.principal.organizationId)")
    public ApiResponse<IdsConfiguration> getIdsConfiguration(
            @Parameter(description = "机构ID") @PathVariable Long organizationId) {
        
        try {
            IdsConfiguration configuration = configurationService.getConfiguration(organizationId);
            
            if (configuration != null) {
                // 隐藏敏感信息
                configuration.setApiToken("****");
                configuration.setSecretKey("****");
            }
            
            return ApiResponse.success(configuration);
            
        } catch (Exception e) {
            log.error("获取IDS配置异常: orgId={}", organizationId, e);
            return ApiResponse.error(500, "获取IDS配置异常: " + e.getMessage());
        }
    }
    
    /**
     * 测试IDS连接
     */
    @PostMapping("/test-connection")
    @Operation(summary = "测试IDS连接", description = "测试IDS系统连接是否正常")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORG_ADMIN')")
    public ApiResponse<IdsConfigurationService.IdsConnectionTestResult> testConnection(
            @Parameter(description = "IDS配置") @RequestBody IdsConfiguration configuration) {
        
        try {
            IdsConfigurationService.IdsConnectionTestResult result = 
                    configurationService.testConnection(configuration);
            
            return ApiResponse.success(result);
            
        } catch (Exception e) {
            log.error("测试IDS连接异常", e);
            return ApiResponse.error(500, "测试IDS连接异常: " + e.getMessage());
        }
    }
    
    /**
     * 获取连接状态
     */
    @GetMapping("/status/{organizationId}")
    @Operation(summary = "获取IDS连接状态", description = "获取机构IDS系统的实时连接状态")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('ORG_ADMIN') and #organizationId == authentication.principal.organizationId)")
    public ApiResponse<IdsConnectionStatus> getConnectionStatus(
            @Parameter(description = "机构ID") @PathVariable Long organizationId) {
        
        try {
            IdsConnectionStatus status = idsIntegrationService.getConnectionStatus(organizationId);
            return ApiResponse.success(status);
            
        } catch (Exception e) {
            log.error("获取IDS连接状态异常: orgId={}", organizationId, e);
            return ApiResponse.error(500, "获取IDS连接状态异常: " + e.getMessage());
        }
    }
    
    /**
     * 同步案件到IDS系统
     */
    @PostMapping("/sync-cases/{organizationId}")
    @Operation(summary = "同步案件到IDS", description = "将指定案件同步到IDS系统")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('ORG_ADMIN') and #organizationId == authentication.principal.organizationId)")
    public ApiResponse<String> syncCases(
            @Parameter(description = "机构ID") @PathVariable Long organizationId,
            @Parameter(description = "案件ID列表") @RequestBody List<Long> caseIds) {
        
        try {
            log.info("同步案件到IDS: orgId={}, caseCount={}", organizationId, caseIds.size());
            
            // 获取机构信息
            Organization organization = organizationService.findById(organizationId);
            if (organization == null) {
                return ApiResponse.error(404, "机构不存在");
            }
            
            // 获取案件列表
            List<Cases> cases = caseService.findByIds(caseIds);
            if (cases.isEmpty()) {
                return ApiResponse.error(400, "未找到有效案件");
            }
            
            // 异步执行同步
            CompletableFuture<IdsSyncResult> syncFuture = 
                    idsIntegrationService.syncCasesToIds(cases, organization);
            
            // 立即返回任务ID，客户端可以通过WebSocket获取进度
            String taskId = java.util.UUID.randomUUID().toString();
            
            // 异步处理结果
            syncFuture.whenComplete((result, throwable) -> {
                if (throwable != null) {
                    log.error("IDS同步异常: taskId={}", taskId, throwable);
                } else {
                    log.info("IDS同步完成: taskId={}, success={}", taskId, result.isSuccess());
                }
            });
            
            return ApiResponse.success(taskId, "同步任务已启动");
            
        } catch (Exception e) {
            log.error("同步案件到IDS异常: orgId={}", organizationId, e);
            return ApiResponse.error(500, "同步案件异常: " + e.getMessage());
        }
    }
    
    /**
     * 接收IDS推送数据
     */
    @PostMapping("/webhook/{organizationId}")
    @Operation(summary = "接收IDS推送数据", description = "接收IDS系统主动推送的数据")
    public ApiResponse<String> receiveIdsPushData(
            @Parameter(description = "机构ID") @PathVariable Long organizationId,
            @Parameter(description = "推送数据") @RequestBody IdsPushDataDTO pushData) {
        
        try {
            log.info("接收IDS推送数据: orgId={}, dataType={}", organizationId, pushData.getDataType());
            
            // 处理推送数据
            IdsDataProcessResult result = idsIntegrationService.processIdsPushData(pushData, organizationId);
            
            if (result.isSuccess()) {
                return ApiResponse.success("数据处理成功");
            } else {
                return ApiResponse.error(400, "数据处理失败: " + result.getMessage());
            }
            
        } catch (Exception e) {
            log.error("接收IDS推送数据异常: orgId={}", organizationId, e);
            return ApiResponse.error(500, "数据处理异常: " + e.getMessage());
        }
    }
    
    /**
     * 获取IDS启用的机构列表
     */
    @GetMapping("/enabled-organizations")
    @Operation(summary = "获取启用IDS的机构", description = "获取已启用IDS系统的处置机构列表")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<Organization>> getIdsEnabledOrganizations() {
        
        try {
            List<Organization> organizations = configurationService.getIdsEnabledOrganizations();
            return ApiResponse.success(organizations);
            
        } catch (Exception e) {
            log.error("获取IDS启用机构列表异常", e);
            return ApiResponse.error(500, "获取机构列表异常: " + e.getMessage());
        }
    }
    
    /**
     * 批量配置IDS
     */
    @PostMapping("/batch-config")
    @Operation(summary = "批量配置IDS", description = "批量为多个机构配置IDS系统")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Map<Long, Boolean>> batchConfigureIds(
            @Parameter(description = "批量配置") @RequestBody Map<Long, IdsConfiguration> configurations) {
        
        try {
            log.info("批量配置IDS: count={}", configurations.size());
            
            Map<Long, Boolean> results = configurationService.batchUpdateConfigurations(configurations);
            
            long successCount = results.values().stream().mapToLong(success -> success ? 1 : 0).sum();
            
            return ApiResponse.success(results, 
                    String.format("批量配置完成，成功：%d，失败：%d", successCount, configurations.size() - successCount));
            
        } catch (Exception e) {
            log.error("批量配置IDS异常", e);
            return ApiResponse.error(500, "批量配置异常: " + e.getMessage());
        }
    }
    
    /**
     * 禁用IDS配置
     */
    @PostMapping("/disable/{organizationId}")
    @Operation(summary = "禁用IDS配置", description = "禁用指定机构的IDS系统集成")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('ORG_ADMIN') and #organizationId == authentication.principal.organizationId)")
    public ApiResponse<Boolean> disableIdsConfiguration(
            @Parameter(description = "机构ID") @PathVariable Long organizationId) {
        
        try {
            log.info("禁用IDS配置: orgId={}", organizationId);
            
            boolean success = configurationService.disableConfiguration(organizationId);
            
            if (success) {
                return ApiResponse.success(true, "IDS配置已禁用");
            } else {
                return ApiResponse.error(500, "禁用IDS配置失败");
            }
            
        } catch (Exception e) {
            log.error("禁用IDS配置异常: orgId={}", organizationId, e);
            return ApiResponse.error(500, "禁用IDS配置异常: " + e.getMessage());
        }
    }
}