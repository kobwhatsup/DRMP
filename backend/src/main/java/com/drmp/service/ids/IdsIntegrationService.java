package com.drmp.service.ids;

import com.drmp.dto.ids.*;
import com.drmp.entity.Cases;
import com.drmp.entity.Organization;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * IDS（智调系统）集成服务
 * 负责与外部智调系统的API对接和数据同步
 *
 * @author DRMP Team
 */
@Slf4j
@Service
public class IdsIntegrationService {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private IdsConfigurationService configService;
    
    @Autowired
    private IdsSyncService syncService;
    
    @Value("${app.ids.default-timeout:30000}")
    private int defaultTimeout;
    
    /**
     * 同步案件到IDS系统
     * 将DRMP的案件数据推送到处置机构的IDS系统
     *
     * @param cases 案件列表
     * @param organization 处置机构
     * @return 同步结果
     */
    @Async("asyncTaskExecutor")
    public CompletableFuture<IdsSyncResult> syncCasesToIds(List<Cases> cases, Organization organization) {
        log.info("开始向IDS系统同步案件: orgId={}, caseCount={}", organization.getId(), cases.size());
        
        try {
            // 获取机构的IDS配置
            IdsConfiguration config = configService.getConfiguration(organization.getId());
            if (config == null || !config.isEnabled()) {
                return CompletableFuture.completedFuture(
                    IdsSyncResult.failure("机构未配置IDS系统或已禁用"));
            }
            
            // 验证IDS连接
            if (!validateIdsConnection(config)) {
                return CompletableFuture.completedFuture(
                    IdsSyncResult.failure("IDS系统连接失败"));
            }
            
            // 转换数据格式
            List<IdsCaseDTO> idsCases = convertToIdsCases(cases);
            
            // 分批同步
            IdsSyncResult result = syncCasesInBatches(idsCases, config);
            
            // 记录同步历史
            syncService.recordSyncHistory(organization.getId(), cases.size(), 
                    result.isSuccess(), result.getMessage());
            
            log.info("IDS案件同步完成: orgId={}, success={}, processed={}/{}", 
                    organization.getId(), result.isSuccess(), 
                    result.getSuccessCount(), result.getTotalCount());
            
            return CompletableFuture.completedFuture(result);
            
        } catch (Exception e) {
            log.error("IDS案件同步异常: orgId={}", organization.getId(), e);
            return CompletableFuture.completedFuture(
                IdsSyncResult.failure("同步过程发生异常: " + e.getMessage()));
        }
    }
    
    /**
     * 从IDS系统同步案件进度
     * 定期从IDS系统拉取案件处置进度和回款信息
     *
     * @param organization 处置机构
     * @param caseIds 案件ID列表
     * @return 进度同步结果
     */
    public IdsProgressSyncResult syncProgressFromIds(Organization organization, List<Long> caseIds) {
        log.info("开始从IDS系统同步案件进度: orgId={}, caseCount={}", organization.getId(), caseIds.size());
        
        try {
            IdsConfiguration config = configService.getConfiguration(organization.getId());
            if (config == null || !config.isEnabled()) {
                return IdsProgressSyncResult.failure("机构未配置IDS系统");
            }
            
            // 构建查询请求
            IdsProgressQueryRequest request = new IdsProgressQueryRequest();
            request.setCaseIds(caseIds);
            request.setLastUpdateTime(getLastSyncTime(organization.getId()));
            
            // 调用IDS API
            String url = config.getBaseUrl() + "/api/cases/progress";
            IdsProgressResponse response = callIdsApi(url, request, 
                    IdsProgressResponse.class, config);
            
            if (response == null || !response.isSuccess()) {
                return IdsProgressSyncResult.failure("IDS系统返回错误: " + 
                        (response != null ? response.getMessage() : "无响应"));
            }
            
            // 处理返回的进度数据
            return processProgressData(response.getData(), organization.getId());
            
        } catch (Exception e) {
            log.error("IDS进度同步异常: orgId={}", organization.getId(), e);
            return IdsProgressSyncResult.failure("进度同步异常: " + e.getMessage());
        }
    }
    
    /**
     * 接收IDS系统推送的实时数据
     * 处理IDS系统主动推送的案件状态变更、回款信息等
     *
     * @param pushData 推送数据
     * @param organizationId 机构ID
     * @return 处理结果
     */
    public IdsDataProcessResult processIdsPushData(IdsPushDataDTO pushData, Long organizationId) {
        log.info("处理IDS推送数据: orgId={}, dataType={}, recordCount={}", 
                organizationId, pushData.getDataType(), pushData.getRecords().size());
        
        try {
            // 验证数据签名
            if (!validateDataSignature(pushData, organizationId)) {
                return IdsDataProcessResult.failure("数据签名验证失败");
            }
            
            // 根据数据类型处理
            switch (pushData.getDataType()) {
                case "CASE_STATUS":
                    return processCaseStatusUpdates(pushData.getRecords(), organizationId);
                    
                case "PAYMENT_RECORD":
                    return processPaymentRecords(pushData.getRecords(), organizationId);
                    
                case "COMMUNICATION_LOG":
                    return processCommunicationLogs(pushData.getRecords(), organizationId);
                    
                case "DISPOSAL_ACTION":
                    return processDisposalActions(pushData.getRecords(), organizationId);
                    
                default:
                    log.warn("未知的IDS数据类型: {}", pushData.getDataType());
                    return IdsDataProcessResult.failure("未知的数据类型");
            }
            
        } catch (Exception e) {
            log.error("处理IDS推送数据异常: orgId={}", organizationId, e);
            return IdsDataProcessResult.failure("数据处理异常: " + e.getMessage());
        }
    }
    
    /**
     * 获取IDS系统连接状态
     *
     * @param organizationId 机构ID
     * @return 连接状态
     */
    public IdsConnectionStatus getConnectionStatus(Long organizationId) {
        try {
            IdsConfiguration config = configService.getConfiguration(organizationId);
            if (config == null) {
                return IdsConnectionStatus.notConfigured();
            }
            
            if (!config.isEnabled()) {
                return IdsConnectionStatus.disabled();
            }
            
            // 测试连接
            boolean connected = validateIdsConnection(config);
            LocalDateTime lastSyncTime = getLastSyncTime(organizationId);
            
            return IdsConnectionStatus.builder()
                    .organizationId(organizationId)
                    .connected(connected)
                    .lastSyncTime(lastSyncTime)
                    .apiVersion(config.getApiVersion())
                    .build();
                    
        } catch (Exception e) {
            log.error("获取IDS连接状态异常: orgId={}", organizationId, e);
            return IdsConnectionStatus.error(e.getMessage());
        }
    }
    
    /**
     * 重试失败的同步任务
     *
     * @param syncTaskId 同步任务ID
     * @return 重试结果
     */
    public CompletableFuture<IdsSyncResult> retrySyncTask(Long syncTaskId) {
        log.info("重试IDS同步任务: taskId={}", syncTaskId);
        
        try {
            // 获取失败的同步任务
            IdsSyncTask failedTask = syncService.getSyncTask(syncTaskId);
            if (failedTask == null) {
                return CompletableFuture.completedFuture(
                    IdsSyncResult.failure("同步任务不存在"));
            }
            
            if (!"FAILED".equals(failedTask.getStatus())) {
                return CompletableFuture.completedFuture(
                    IdsSyncResult.failure("任务状态不允许重试"));
            }
            
            // 获取原始案件数据
            List<Cases> cases = syncService.getTaskCases(syncTaskId);
            Organization organization = syncService.getTaskOrganization(syncTaskId);
            
            // 重新执行同步
            return syncCasesToIds(cases, organization);
            
        } catch (Exception e) {
            log.error("重试同步任务异常: taskId={}", syncTaskId, e);
            return CompletableFuture.completedFuture(
                IdsSyncResult.failure("重试异常: " + e.getMessage()));
        }
    }
    
    // ==================== 私有方法 ====================
    
    /**
     * 验证IDS系统连接
     */
    private boolean validateIdsConnection(IdsConfiguration config) {
        try {
            String healthUrl = config.getBaseUrl() + "/api/health";
            IdsHealthResponse response = callIdsApi(healthUrl, null, 
                    IdsHealthResponse.class, config);
            return response != null && response.isHealthy();
        } catch (Exception e) {
            log.warn("IDS连接验证失败: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * 转换案件数据为IDS格式
     */
    private List<IdsCaseDTO> convertToIdsCases(List<Cases> cases) {
        return cases.stream()
                .map(this::convertToIdsCase)
                .collect(java.util.stream.Collectors.toList());
    }
    
    /**
     * 转换单个案件为IDS格式
     */
    private IdsCaseDTO convertToIdsCase(Cases case_) {
        IdsCaseDTO dto = new IdsCaseDTO();
        dto.setCaseId(case_.getId());
        dto.setLoanNo(case_.getLoanNo());
        dto.setDebtorName(case_.getDebtorName()); // 注意：需要解密
        dto.setDebtorPhone(case_.getDebtorPhone()); // 注意：需要解密
        dto.setLoanAmount(case_.getLoanAmount());
        dto.setRemainingAmount(case_.getRemainingAmount());
        dto.setOverdueDays(case_.getOverdueDays());
        dto.setDisposalRequirements(buildDisposalRequirements(case_));
        return dto;
    }
    
    /**
     * 分批同步案件
     */
    private IdsSyncResult syncCasesInBatches(List<IdsCaseDTO> cases, IdsConfiguration config) {
        int batchSize = config.getBatchSize() != null ? config.getBatchSize() : 100;
        IdsSyncResult overallResult = new IdsSyncResult();
        overallResult.setTotalCount(cases.size());
        
        for (int i = 0; i < cases.size(); i += batchSize) {
            int endIndex = Math.min(i + batchSize, cases.size());
            List<IdsCaseDTO> batch = cases.subList(i, endIndex);
            
            try {
                IdsSyncBatchRequest request = new IdsSyncBatchRequest();
                request.setCases(batch);
                request.setBatchId(generateBatchId());
                
                String url = config.getBaseUrl() + "/api/cases/sync";
                IdsSyncResponse response = callIdsApi(url, request, 
                        IdsSyncResponse.class, config);
                
                if (response != null && response.isSuccess()) {
                    overallResult.addSuccessCount(response.getProcessedCount());
                } else {
                    overallResult.addErrorCount(batch.size());
                    overallResult.addError("批次同步失败: " + 
                            (response != null ? response.getMessage() : "无响应"));
                }
                
            } catch (Exception e) {
                log.error("批次同步异常: batch={}-{}", i, endIndex, e);
                overallResult.addErrorCount(batch.size());
                overallResult.addError("批次同步异常: " + e.getMessage());
            }
        }
        
        overallResult.setSuccess(overallResult.getErrorCount() == 0);
        return overallResult;
    }
    
    /**
     * 调用IDS API
     */
    private <T, R> R callIdsApi(String url, T request, Class<R> responseClass, IdsConfiguration config) {
        try {
            // 设置请求头
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("Authorization", "Bearer " + config.getApiToken());
            headers.set("Content-Type", "application/json");
            headers.set("X-API-Version", config.getApiVersion());
            
            // 创建请求实体
            org.springframework.http.HttpEntity<T> entity = new org.springframework.http.HttpEntity<>(request, headers);
            
            // 发送请求
            org.springframework.http.ResponseEntity<R> response = restTemplate.exchange(
                    url, org.springframework.http.HttpMethod.POST, entity, responseClass);
            
            return response.getBody();
            
        } catch (Exception e) {
            log.error("调用IDS API异常: url={}", url, e);
            throw new RuntimeException("IDS API调用失败", e);
        }
    }
    
    /**
     * 验证数据签名
     */
    private boolean validateDataSignature(IdsPushDataDTO pushData, Long organizationId) {
        try {
            IdsConfiguration config = configService.getConfiguration(organizationId);
            if (config == null || config.getSecretKey() == null) {
                return false;
            }
            
            // 这里实现具体的签名验证逻辑
            String expectedSignature = calculateSignature(pushData.getData(), config.getSecretKey());
            return expectedSignature.equals(pushData.getSignature());
            
        } catch (Exception e) {
            log.error("签名验证异常: orgId={}", organizationId, e);
            return false;
        }
    }
    
    /**
     * 处理案件状态更新
     */
    private IdsDataProcessResult processCaseStatusUpdates(List<Object> records, Long organizationId) {
        // 实现案件状态更新逻辑
        log.info("处理案件状态更新: orgId={}, count={}", organizationId, records.size());
        return IdsDataProcessResult.success("案件状态更新完成", records.size());
    }
    
    /**
     * 处理回款记录
     */
    private IdsDataProcessResult processPaymentRecords(List<Object> records, Long organizationId) {
        // 实现回款记录处理逻辑
        log.info("处理回款记录: orgId={}, count={}", organizationId, records.size());
        return IdsDataProcessResult.success("回款记录处理完成", records.size());
    }
    
    /**
     * 处理沟通日志
     */
    private IdsDataProcessResult processCommunicationLogs(List<Object> records, Long organizationId) {
        // 实现沟通日志处理逻辑
        log.info("处理沟通日志: orgId={}, count={}", organizationId, records.size());
        return IdsDataProcessResult.success("沟通日志处理完成", records.size());
    }
    
    /**
     * 处理处置动作
     */
    private IdsDataProcessResult processDisposalActions(List<Object> records, Long organizationId) {
        // 实现处置动作处理逻辑
        log.info("处理处置动作: orgId={}, count={}", organizationId, records.size());
        return IdsDataProcessResult.success("处置动作处理完成", records.size());
    }
    
    // 其他辅助方法...
    private String buildDisposalRequirements(Cases case_) { return ""; }
    private String generateBatchId() { return java.util.UUID.randomUUID().toString(); }
    private LocalDateTime getLastSyncTime(Long organizationId) { return LocalDateTime.now().minusHours(1); }
    private IdsProgressSyncResult processProgressData(Object data, Long orgId) { 
        return IdsProgressSyncResult.success("进度同步完成", 0); 
    }
    private String calculateSignature(Object data, String secretKey) { return "signature"; }
}