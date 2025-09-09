package com.drmp.service.impl;

import com.drmp.dto.request.*;
import com.drmp.dto.response.*;
import com.drmp.service.AlertService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 预警服务实现类
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Service
public class AlertServiceImpl implements AlertService {

    @Override
    public Page<AlertResponse> getAlerts(AlertQueryRequest request, Pageable pageable) {
        log.info("获取预警列表: request={}, pageable={}", request, pageable);
        
        // 模拟数据
        List<AlertResponse> alerts = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            alerts.add(AlertResponse.builder()
                    .id("ALERT" + System.currentTimeMillis() + i)
                    .ruleId("RULE001")
                    .ruleName("逾期超30天预警")
                    .type("OVERDUE")
                    .level("HIGH")
                    .status("UNRESOLVED")
                    .title("案件逾期预警")
                    .message("案件 CASE2024001 已逾期35天未处理")
                    .details(new HashMap<String, Object>() {{
                        put("caseId", "CASE2024001");
                        put("overdueDays", 35);
                        put("amount", 50000);
                    }})
                    .suggestedActions(Arrays.asList(
                            "立即联系债务人",
                            "评估是否需要升级处置方式",
                            "检查是否有新的联系方式"
                    ))
                    .triggeredAt(LocalDateTime.now().minusHours(i))
                    .relatedEntityType("CASE")
                    .relatedEntityId("CASE2024001")
                    .tags(Arrays.asList("逾期", "高风险"))
                    .responseTime(15)
                    .build());
        }
        
        return new PageImpl<>(alerts, pageable, 50);
    }

    @Override
    public AlertResponse getAlertById(String id) {
        log.info("获取预警详情: id={}", id);
        
        return AlertResponse.builder()
                .id(id)
                .ruleId("RULE001")
                .ruleName("逾期超30天预警")
                .type("OVERDUE")
                .level("HIGH")
                .status("UNRESOLVED")
                .title("案件逾期预警")
                .message("案件 CASE2024001 已逾期35天未处理")
                .details(new HashMap<String, Object>() {{
                    put("caseId", "CASE2024001");
                    put("overdueDays", 35);
                    put("amount", 50000);
                    put("debtorName", "张三");
                    put("orgName", "XX调解中心");
                }})
                .suggestedActions(Arrays.asList(
                        "立即联系债务人",
                        "评估是否需要升级处置方式",
                        "检查是否有新的联系方式"
                ))
                .triggeredAt(LocalDateTime.now().minusHours(2))
                .relatedEntityType("CASE")
                .relatedEntityId("CASE2024001")
                .tags(Arrays.asList("逾期", "高风险"))
                .responseTime(15)
                .build();
    }

    @Override
    public AlertResponse acknowledgeAlert(String id, String userId) {
        log.info("确认预警: id={}, userId={}", id, userId);
        
        AlertResponse alert = getAlertById(id);
        alert.setStatus("ACKNOWLEDGED");
        alert.setAcknowledgedAt(LocalDateTime.now());
        alert.setAcknowledgedBy(userId);
        
        return alert;
    }

    @Override
    public AlertResponse resolveAlert(String id, String userId, String resolution) {
        log.info("解决预警: id={}, userId={}, resolution={}", id, userId, resolution);
        
        AlertResponse alert = getAlertById(id);
        alert.setStatus("RESOLVED");
        alert.setResolvedAt(LocalDateTime.now());
        alert.setResolvedBy(userId);
        alert.setResolution(resolution);
        alert.setResolutionTime(120);
        
        return alert;
    }

    @Override
    public AlertResponse escalateAlert(String id, String targetUserId, String reason) {
        log.info("升级预警: id={}, targetUserId={}, reason={}", id, targetUserId, reason);
        
        AlertResponse alert = getAlertById(id);
        alert.setStatus("ESCALATED");
        alert.setEscalatedTo(targetUserId);
        
        return alert;
    }

    @Override
    public void batchAcknowledge(List<String> alertIds, String userId) {
        log.info("批量确认预警: alertIds={}, userId={}", alertIds, userId);
        
        alertIds.forEach(id -> acknowledgeAlert(id, userId));
    }

    @Override
    public void batchResolve(List<String> alertIds, String userId, String resolution) {
        log.info("批量解决预警: alertIds={}, userId={}, resolution={}", alertIds, userId, resolution);
        
        alertIds.forEach(id -> resolveAlert(id, userId, resolution));
    }

    @Override
    public Page<AlertRuleResponse> getRules(Pageable pageable) {
        log.info("获取预警规则列表: pageable={}", pageable);
        
        List<AlertRuleResponse> rules = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            rules.add(AlertRuleResponse.builder()
                    .id("RULE00" + (i + 1))
                    .name("预警规则" + (i + 1))
                    .description("当满足条件时触发预警")
                    .type("OVERDUE")
                    .level("HIGH")
                    .enabled(true)
                    .conditions(Arrays.asList(
                            AlertRuleResponse.AlertCondition.builder()
                                    .field("overdueDays")
                                    .operator(">")
                                    .value(30)
                                    .unit("天")
                                    .build()
                    ))
                    .actions(Arrays.asList(
                            AlertRuleResponse.AlertAction.builder()
                                    .type("NOTIFICATION")
                                    .config(new HashMap<String, Object>() {{
                                        put("channel", "EMAIL");
                                        put("template", "OVERDUE_ALERT");
                                    }})
                                    .build()
                    ))
                    .schedule("0 0 9 * * ?")
                    .config(new HashMap<>())
                    .createdAt(LocalDateTime.now().minusDays(30))
                    .updatedAt(LocalDateTime.now().minusDays(1))
                    .createdBy("admin")
                    .updatedBy("admin")
                    .triggerCount(25)
                    .lastTriggeredAt(LocalDateTime.now().minusHours(3))
                    .build());
        }
        
        return new PageImpl<>(rules, pageable, 20);
    }

    @Override
    public AlertRuleResponse getRuleById(String id) {
        log.info("获取预警规则详情: id={}", id);
        
        return AlertRuleResponse.builder()
                .id(id)
                .name("逾期超30天预警规则")
                .description("当案件逾期超过30天时触发预警")
                .type("OVERDUE")
                .level("HIGH")
                .enabled(true)
                .conditions(Arrays.asList(
                        AlertRuleResponse.AlertCondition.builder()
                                .field("overdueDays")
                                .operator(">")
                                .value(30)
                                .unit("天")
                                .build(),
                        AlertRuleResponse.AlertCondition.builder()
                                .field("amount")
                                .operator(">")
                                .value(10000)
                                .unit("元")
                                .build()
                ))
                .actions(Arrays.asList(
                        AlertRuleResponse.AlertAction.builder()
                                .type("NOTIFICATION")
                                .config(new HashMap<String, Object>() {{
                                    put("channel", "EMAIL");
                                    put("template", "OVERDUE_ALERT");
                                    put("recipients", Arrays.asList("manager@example.com"));
                                }})
                                .build(),
                        AlertRuleResponse.AlertAction.builder()
                                .type("SMS")
                                .config(new HashMap<String, Object>() {{
                                    put("phone", "13800138000");
                                    put("template", "SMS_OVERDUE");
                                }})
                                .build()
                ))
                .schedule("0 0 9 * * ?")
                .config(new HashMap<String, Object>() {{
                    put("maxAlertsPerDay", 100);
                    put("cooldownMinutes", 60);
                }})
                .createdAt(LocalDateTime.now().minusDays(30))
                .updatedAt(LocalDateTime.now().minusDays(1))
                .createdBy("admin")
                .updatedBy("admin")
                .triggerCount(150)
                .lastTriggeredAt(LocalDateTime.now().minusHours(3))
                .build();
    }

    @Override
    public AlertRuleResponse createRule(AlertRuleRequest request) {
        log.info("创建预警规则: request={}", request);
        
        String ruleId = "RULE" + System.currentTimeMillis();
        
        return AlertRuleResponse.builder()
                .id(ruleId)
                .name(request.getName())
                .description(request.getDescription())
                .type(request.getType())
                .level(request.getLevel())
                .enabled(request.getEnabled())
                .conditions(request.getConditions().stream()
                        .map(c -> AlertRuleResponse.AlertCondition.builder()
                                .field(c.getField())
                                .operator(c.getOperator())
                                .value(c.getValue())
                                .unit(c.getUnit())
                                .build())
                        .collect(Collectors.toList()))
                .actions(request.getActions().stream()
                        .map(a -> AlertRuleResponse.AlertAction.builder()
                                .type(a.getType())
                                .config(a.getConfig())
                                .build())
                        .collect(Collectors.toList()))
                .schedule(request.getSchedule())
                .config(request.getConfig())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .createdBy("current_user")
                .updatedBy("current_user")
                .triggerCount(0)
                .build();
    }

    @Override
    public AlertRuleResponse updateRule(String id, AlertRuleRequest request) {
        log.info("更新预警规则: id={}, request={}", id, request);
        
        AlertRuleResponse rule = getRuleById(id);
        rule.setName(request.getName());
        rule.setDescription(request.getDescription());
        rule.setType(request.getType());
        rule.setLevel(request.getLevel());
        rule.setEnabled(request.getEnabled());
        rule.setConditions(request.getConditions().stream()
                .map(c -> AlertRuleResponse.AlertCondition.builder()
                        .field(c.getField())
                        .operator(c.getOperator())
                        .value(c.getValue())
                        .unit(c.getUnit())
                        .build())
                .collect(Collectors.toList()));
        rule.setActions(request.getActions().stream()
                .map(a -> AlertRuleResponse.AlertAction.builder()
                        .type(a.getType())
                        .config(a.getConfig())
                        .build())
                .collect(Collectors.toList()));
        rule.setSchedule(request.getSchedule());
        rule.setConfig(request.getConfig());
        rule.setUpdatedAt(LocalDateTime.now());
        rule.setUpdatedBy("current_user");
        
        return rule;
    }

    @Override
    public void deleteRule(String id) {
        log.info("删除预警规则: id={}", id);
    }

    @Override
    public void toggleRule(String id, boolean enabled) {
        log.info("切换预警规则状态: id={}, enabled={}", id, enabled);
    }

    @Override
    public Map<String, Object> testRule(String id, Map<String, Object> testData) {
        log.info("测试预警规则: id={}, testData={}", id, testData);
        
        Map<String, Object> result = new HashMap<>();
        result.put("matched", true);
        result.put("triggeredConditions", Arrays.asList("overdueDays > 30", "amount > 10000"));
        result.put("actions", Arrays.asList("发送邮件通知", "发送短信通知"));
        result.put("testResult", "规则匹配成功，将触发2个动作");
        
        return result;
    }

    @Override
    public AlertStatisticsResponse getStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("获取预警统计: startDate={}, endDate={}", startDate, endDate);
        
        Map<String, Integer> byLevel = new HashMap<>();
        byLevel.put("CRITICAL", 5);
        byLevel.put("HIGH", 25);
        byLevel.put("MEDIUM", 45);
        byLevel.put("LOW", 30);
        
        Map<String, Integer> byType = new HashMap<>();
        byType.put("OVERDUE", 35);
        byType.put("RISK", 25);
        byType.put("PERFORMANCE", 20);
        byType.put("SYSTEM", 15);
        byType.put("OTHER", 10);
        
        Map<String, Integer> byStatus = new HashMap<>();
        byStatus.put("UNRESOLVED", 45);
        byStatus.put("ACKNOWLEDGED", 25);
        byStatus.put("RESOLVED", 30);
        byStatus.put("ESCALATED", 5);
        
        return AlertStatisticsResponse.builder()
                .total(105)
                .byLevel(byLevel)
                .byType(byType)
                .byStatus(byStatus)
                .unresolved(45)
                .todayCount(12)
                .weekCount(68)
                .monthCount(105)
                .avgResponseTime(new BigDecimal("15.5"))
                .avgResolutionTime(new BigDecimal("120.3"))
                .resolutionRate(new BigDecimal("71.4"))
                .escalationRate(new BigDecimal("4.8"))
                .falsePositiveRate(new BigDecimal("2.1"))
                .mostActiveRule("逾期超30天预警")
                .mostCommonType("OVERDUE")
                .criticalCount(5)
                .highCount(25)
                .mediumCount(45)
                .lowCount(30)
                .build();
    }

    @Override
    public Page<AlertSubscriptionResponse> getSubscriptions(String userId, Pageable pageable) {
        log.info("获取预警订阅: userId={}, pageable={}", userId, pageable);
        
        List<AlertSubscriptionResponse> subscriptions = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            subscriptions.add(AlertSubscriptionResponse.builder()
                    .id("SUB00" + (i + 1))
                    .userId(userId)
                    .userName("用户" + (i + 1))
                    .ruleIds(Arrays.asList("RULE001", "RULE002"))
                    .types(Arrays.asList("OVERDUE", "RISK"))
                    .levels(Arrays.asList("HIGH", "CRITICAL"))
                    .channels(Arrays.asList(
                            AlertSubscriptionResponse.AlertChannel.builder()
                                    .type("EMAIL")
                                    .config(new HashMap<String, Object>() {{
                                        put("address", "user@example.com");
                                    }})
                                    .minLevel("MEDIUM")
                                    .schedule("* * * * *")
                                    .enabled(true)
                                    .build(),
                            AlertSubscriptionResponse.AlertChannel.builder()
                                    .type("SMS")
                                    .config(new HashMap<String, Object>() {{
                                        put("phone", "13800138000");
                                    }})
                                    .minLevel("HIGH")
                                    .schedule("9-18 * * * *")
                                    .enabled(true)
                                    .build()
                    ))
                    .enabled(true)
                    .createdAt(LocalDateTime.now().minusDays(10))
                    .updatedAt(LocalDateTime.now().minusDays(1))
                    .lastNotifiedAt(LocalDateTime.now().minusHours(2))
                    .notificationCount(35)
                    .build());
        }
        
        return new PageImpl<>(subscriptions, pageable, 10);
    }

    @Override
    public AlertSubscriptionResponse createSubscription(AlertSubscriptionRequest request) {
        log.info("创建预警订阅: request={}", request);
        
        String subId = "SUB" + System.currentTimeMillis();
        
        return AlertSubscriptionResponse.builder()
                .id(subId)
                .userId(request.getUserId())
                .userName("当前用户")
                .ruleIds(request.getRuleIds())
                .types(request.getTypes())
                .levels(request.getLevels())
                .channels(request.getChannels().stream()
                        .map(c -> AlertSubscriptionResponse.AlertChannel.builder()
                                .type(c.getType())
                                .config(c.getConfig())
                                .minLevel(c.getMinLevel())
                                .schedule(c.getSchedule())
                                .enabled(c.getEnabled())
                                .build())
                        .collect(Collectors.toList()))
                .enabled(request.getEnabled())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .notificationCount(0)
                .build();
    }

    @Override
    public AlertSubscriptionResponse updateSubscription(String id, AlertSubscriptionRequest request) {
        log.info("更新预警订阅: id={}, request={}", id, request);
        
        return AlertSubscriptionResponse.builder()
                .id(id)
                .userId(request.getUserId())
                .userName("当前用户")
                .ruleIds(request.getRuleIds())
                .types(request.getTypes())
                .levels(request.getLevels())
                .channels(request.getChannels().stream()
                        .map(c -> AlertSubscriptionResponse.AlertChannel.builder()
                                .type(c.getType())
                                .config(c.getConfig())
                                .minLevel(c.getMinLevel())
                                .schedule(c.getSchedule())
                                .enabled(c.getEnabled())
                                .build())
                        .collect(Collectors.toList()))
                .enabled(request.getEnabled())
                .createdAt(LocalDateTime.now().minusDays(10))
                .updatedAt(LocalDateTime.now())
                .lastNotifiedAt(LocalDateTime.now().minusHours(2))
                .notificationCount(35)
                .build();
    }

    @Override
    public void deleteSubscription(String id) {
        log.info("删除预警订阅: id={}", id);
    }

    @Override
    public void sendTestNotification(String subscriptionId) {
        log.info("发送测试通知: subscriptionId={}", subscriptionId);
    }
    
    @Override
    public void sendAlertNotification(String alertId) {
        log.info("发送预警通知: alertId={}", alertId);
        // TODO: 实现预警通知发送逻辑
    }
}