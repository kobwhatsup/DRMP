package com.drmp.service;

import com.drmp.dto.request.BasePageRequest;
import com.drmp.dto.response.ApiResponse;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 对账服务接口
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public interface ReconciliationService {

    /**
     * 生成对账单
     */
    Map<String, Object> generateReconciliation(Long orgId, LocalDate startDate, LocalDate endDate);
    
    /**
     * 获取对账单列表
     */
    Page<Map<String, Object>> getReconciliationList(BasePageRequest request);
    
    /**
     * 获取对账单详情
     */
    Map<String, Object> getReconciliationDetail(Long reconciliationId);
    
    /**
     * 确认对账单
     */
    void confirmReconciliation(Long reconciliationId, Long userId);
    
    /**
     * 提交异议
     */
    void submitDispute(Long reconciliationId, String disputeReason, List<Map<String, Object>> disputeItems, Long userId);
    
    /**
     * 处理异议
     */
    void handleDispute(Long disputeId, String handleResult, String handleRemark, Long userId);
    
    /**
     * 获取异议列表
     */
    Page<Map<String, Object>> getDisputeList(BasePageRequest request);
    
    /**
     * 获取异议详情
     */
    Map<String, Object> getDisputeDetail(Long disputeId);
    
    /**
     * 导出对账单
     */
    byte[] exportReconciliation(Long reconciliationId);
    
    /**
     * 批量确认对账单
     */
    Map<String, Object> batchConfirmReconciliation(List<Long> reconciliationIds, Long userId);
    
    /**
     * 获取对账统计
     */
    Map<String, Object> getReconciliationStats(Long orgId, LocalDate startDate, LocalDate endDate);
    
    /**
     * 自动对账
     */
    void autoReconciliation();
    
    /**
     * 发送对账通知
     */
    void sendReconciliationNotification(Long reconciliationId);
    
    /**
     * 获取对账规则配置
     */
    Map<String, Object> getReconciliationRules(Long orgId);
    
    /**
     * 更新对账规则配置
     */
    void updateReconciliationRules(Long orgId, Map<String, Object> rules, Long userId);
}