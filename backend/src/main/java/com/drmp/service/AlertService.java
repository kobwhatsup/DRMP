package com.drmp.service;

import com.drmp.dto.request.AlertActionRequest;
import com.drmp.dto.request.AlertQueryRequest;
import com.drmp.dto.request.AlertRuleRequest;
import com.drmp.dto.request.AlertSubscriptionRequest;
import com.drmp.dto.response.AlertResponse;
import com.drmp.dto.response.AlertRuleResponse;
import com.drmp.dto.response.AlertStatisticsResponse;
import com.drmp.dto.response.AlertSubscriptionResponse;

import java.util.List;
import java.util.Map;

/**
 * 预警服务接口
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public interface AlertService {

    // ========== 预警规则管理 ==========
    
    /**
     * 获取预警规则列表
     */
    List<AlertRuleResponse> getRules(String type, Boolean enabled);
    
    /**
     * 获取预警规则详情
     */
    AlertRuleResponse getRule(String ruleId);
    
    /**
     * 创建预警规则
     */
    AlertRuleResponse createRule(AlertRuleRequest request);
    
    /**
     * 更新预警规则
     */
    AlertRuleResponse updateRule(String ruleId, AlertRuleRequest request);
    
    /**
     * 删除预警规则
     */
    void deleteRule(String ruleId);
    
    /**
     * 启用/禁用预警规则
     */
    void toggleRule(String ruleId, boolean enabled);
    
    // ========== 预警实例管理 ==========
    
    /**
     * 查询预警列表
     */
    List<AlertResponse> searchAlerts(AlertQueryRequest request);
    
    /**
     * 获取预警详情
     */
    AlertResponse getAlert(String alertId);
    
    /**
     * 处理预警
     */
    AlertResponse processAlert(AlertActionRequest request);
    
    /**
     * 批量确认预警
     */
    void batchAcknowledge(List<String> alertIds, String comment);
    
    /**
     * 批量关闭预警
     */
    void batchClose(List<String> alertIds, String resolution);
    
    // ========== 预警统计分析 ==========
    
    /**
     * 获取预警统计
     */
    AlertStatisticsResponse getStatistics(AlertQueryRequest request);
    
    /**
     * 获取预警趋势
     */
    List<Map<String, Object>> getTrends(String startTime, String endTime, String groupBy);
    
    /**
     * 获取热点预警
     */
    List<AlertResponse> getHotAlerts(int limit, String timeRange);
    
    /**
     * 获取预警分布
     */
    Map<String, Integer> getDistribution(String dimension);
    
    // ========== 预警订阅管理 ==========
    
    /**
     * 获取用户订阅配置
     */
    List<AlertSubscriptionResponse> getSubscriptions(String userId);
    
    /**
     * 创建订阅
     */
    AlertSubscriptionResponse createSubscription(AlertSubscriptionRequest request);
    
    /**
     * 更新订阅
     */
    AlertSubscriptionResponse updateSubscription(String subscriptionId, AlertSubscriptionRequest request);
    
    /**
     * 删除订阅
     */
    void deleteSubscription(String subscriptionId);
    
    /**
     * 检查是否为订阅所有者
     */
    boolean isSubscriptionOwner(String subscriptionId, String userId);
    
    // ========== 实时预警 ==========
    
    /**
     * 获取实时预警
     */
    List<AlertResponse> getRealtimeAlerts();
    
    /**
     * 手动触发预警检查
     */
    void triggerCheck(String ruleId);
    
    // ========== 预警历史 ==========
    
    /**
     * 获取预警历史
     */
    List<AlertResponse> getHistory(AlertQueryRequest request);
    
    /**
     * 导出预警报告
     */
    byte[] exportReport(AlertQueryRequest request, String format);
    
    // ========== 预警配置 ==========
    
    /**
     * 获取预警配置
     */
    Map<String, Object> getConfig();
    
    /**
     * 更新预警配置
     */
    void updateConfig(Map<String, Object> config);
    
    /**
     * 测试预警规则
     */
    Map<String, Object> testRule(AlertRuleRequest request);
    
    /**
     * 获取预警模板
     */
    List<AlertRuleResponse> getTemplates();
    
    /**
     * 从模板创建规则
     */
    AlertRuleResponse createFromTemplate(String templateId, AlertRuleRequest customization);
    
    // ========== 预警引擎 ==========
    
    /**
     * 执行预警检查
     */
    void executeAlertCheck();
    
    /**
     * 生成预警
     */
    void generateAlert(String ruleId, String level, String message, Map<String, Object> details);
    
    /**
     * 发送预警通知
     */
    void sendAlertNotification(String alertId);
}