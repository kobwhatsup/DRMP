package com.drmp.controller;

import com.drmp.common.ApiResponse;
import com.drmp.dto.request.AlertActionRequest;
import com.drmp.dto.request.AlertQueryRequest;
import com.drmp.dto.request.AlertRuleRequest;
import com.drmp.dto.request.AlertSubscriptionRequest;
import com.drmp.dto.response.AlertResponse;
import com.drmp.dto.response.AlertRuleResponse;
import com.drmp.dto.response.AlertStatisticsResponse;
import com.drmp.dto.response.AlertSubscriptionResponse;
import com.drmp.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * 预警管理控制器
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Tag(name = "预警管理", description = "预警管理相关API")
@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
@Slf4j
public class AlertController {

    private final AlertService alertService;

    // ========== 预警规则管理 ==========

    /**
     * 获取预警规则列表
     */
    @Operation(summary = "获取预警规则列表", description = "获取所有预警规则")
    @GetMapping("/rules")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER')")
    public ResponseEntity<ApiResponse<List<AlertRuleResponse>>> getRules(
            @Parameter(description = "预警类型") @RequestParam(required = false) String type,
            @Parameter(description = "是否启用") @RequestParam(required = false) Boolean enabled) {
        
        log.info("获取预警规则列表，类型: {}, 启用: {}", type, enabled);
        List<AlertRuleResponse> rules = alertService.getRules(type, enabled);
        return ResponseEntity.ok(ApiResponse.success(rules));
    }

    /**
     * 获取预警规则详情
     */
    @Operation(summary = "获取预警规则详情", description = "根据ID获取预警规则详情")
    @GetMapping("/rules/{ruleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER')")
    public ResponseEntity<ApiResponse<AlertRuleResponse>> getRule(@PathVariable String ruleId) {
        log.info("获取预警规则详情，ID: {}", ruleId);
        AlertRuleResponse rule = alertService.getRule(ruleId);
        return ResponseEntity.ok(ApiResponse.success(rule));
    }

    /**
     * 创建预警规则
     */
    @Operation(summary = "创建预警规则", description = "创建新的预警规则")
    @PostMapping("/rules")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AlertRuleResponse>> createRule(@Valid @RequestBody AlertRuleRequest request) {
        log.info("创建预警规则: {}", request.getName());
        AlertRuleResponse rule = alertService.createRule(request);
        return ResponseEntity.ok(ApiResponse.success(rule));
    }

    /**
     * 更新预警规则
     */
    @Operation(summary = "更新预警规则", description = "更新预警规则配置")
    @PutMapping("/rules/{ruleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AlertRuleResponse>> updateRule(
            @PathVariable String ruleId,
            @Valid @RequestBody AlertRuleRequest request) {
        
        log.info("更新预警规则，ID: {}", ruleId);
        AlertRuleResponse rule = alertService.updateRule(ruleId, request);
        return ResponseEntity.ok(ApiResponse.success(rule));
    }

    /**
     * 删除预警规则
     */
    @Operation(summary = "删除预警规则", description = "删除指定的预警规则")
    @DeleteMapping("/rules/{ruleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRule(@PathVariable String ruleId) {
        log.info("删除预警规则，ID: {}", ruleId);
        alertService.deleteRule(ruleId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 启用/禁用预警规则
     */
    @Operation(summary = "切换预警规则状态", description = "启用或禁用预警规则")
    @PatchMapping("/rules/{ruleId}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> toggleRule(
            @PathVariable String ruleId,
            @RequestParam boolean enabled) {
        
        log.info("切换预警规则状态，ID: {}, 启用: {}", ruleId, enabled);
        alertService.toggleRule(ruleId, enabled);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ========== 预警实例管理 ==========

    /**
     * 查询预警列表
     */
    @Operation(summary = "查询预警列表", description = "根据条件查询预警列表")
    @PostMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'OPERATOR')")
    public ResponseEntity<ApiResponse<List<AlertResponse>>> searchAlerts(@Valid @RequestBody AlertQueryRequest request) {
        log.info("查询预警列表，条件: {}", request);
        List<AlertResponse> alerts = alertService.searchAlerts(request);
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    /**
     * 获取预警详情
     */
    @Operation(summary = "获取预警详情", description = "根据ID获取预警详情")
    @GetMapping("/{alertId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'OPERATOR')")
    public ResponseEntity<ApiResponse<AlertResponse>> getAlert(@PathVariable String alertId) {
        log.info("获取预警详情，ID: {}", alertId);
        AlertResponse alert = alertService.getAlert(alertId);
        return ResponseEntity.ok(ApiResponse.success(alert));
    }

    /**
     * 处理预警
     */
    @Operation(summary = "处理预警", description = "确认、解决、关闭或升级预警")
    @PostMapping("/process")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'OPERATOR')")
    public ResponseEntity<ApiResponse<AlertResponse>> processAlert(@Valid @RequestBody AlertActionRequest request) {
        log.info("处理预警，ID: {}, 动作: {}", request.getAlertId(), request.getAction());
        AlertResponse alert = alertService.processAlert(request);
        return ResponseEntity.ok(ApiResponse.success(alert));
    }

    /**
     * 批量确认预警
     */
    @Operation(summary = "批量确认预警", description = "批量确认多个预警")
    @PostMapping("/batch-acknowledge")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'OPERATOR')")
    public ResponseEntity<ApiResponse<Void>> batchAcknowledge(
            @RequestBody Map<String, Object> request) {
        
        @SuppressWarnings("unchecked")
        List<String> alertIds = (List<String>) request.get("alertIds");
        String comment = (String) request.get("comment");
        
        log.info("批量确认预警，数量: {}", alertIds.size());
        alertService.batchAcknowledge(alertIds, comment);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 批量关闭预警
     */
    @Operation(summary = "批量关闭预警", description = "批量关闭多个预警")
    @PostMapping("/batch-close")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> batchClose(
            @RequestBody Map<String, Object> request) {
        
        @SuppressWarnings("unchecked")
        List<String> alertIds = (List<String>) request.get("alertIds");
        String resolution = (String) request.get("resolution");
        
        log.info("批量关闭预警，数量: {}", alertIds.size());
        alertService.batchClose(alertIds, resolution);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ========== 预警统计分析 ==========

    /**
     * 获取预警统计
     */
    @Operation(summary = "获取预警统计", description = "获取预警统计数据")
    @PostMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'ANALYST')")
    public ResponseEntity<ApiResponse<AlertStatisticsResponse>> getStatistics(
            @RequestBody(required = false) AlertQueryRequest request) {
        
        log.info("获取预警统计");
        AlertStatisticsResponse statistics = alertService.getStatistics(request);
        return ResponseEntity.ok(ApiResponse.success(statistics));
    }

    /**
     * 获取预警趋势
     */
    @Operation(summary = "获取预警趋势", description = "获取预警趋势数据")
    @PostMapping("/trends")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'ANALYST')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTrends(
            @RequestBody Map<String, Object> request) {
        
        String startTime = (String) request.get("startTime");
        String endTime = (String) request.get("endTime");
        String groupBy = (String) request.get("groupBy");
        
        log.info("获取预警趋势，时间范围: {} - {}, 分组: {}", startTime, endTime, groupBy);
        List<Map<String, Object>> trends = alertService.getTrends(startTime, endTime, groupBy);
        return ResponseEntity.ok(ApiResponse.success(trends));
    }

    /**
     * 获取热点预警
     */
    @Operation(summary = "获取热点预警", description = "获取最新的重要预警")
    @GetMapping("/hot")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'OPERATOR')")
    public ResponseEntity<ApiResponse<List<AlertResponse>>> getHotAlerts(
            @Parameter(description = "数量限制") @RequestParam(defaultValue = "5") int limit,
            @Parameter(description = "时间范围") @RequestParam(required = false) String timeRange) {
        
        log.info("获取热点预警，限制: {}, 时间范围: {}", limit, timeRange);
        List<AlertResponse> alerts = alertService.getHotAlerts(limit, timeRange);
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    /**
     * 获取预警分布
     */
    @Operation(summary = "获取预警分布", description = "按指定维度获取预警分布")
    @PostMapping("/distribution")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'ANALYST')")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> getDistribution(
            @RequestBody Map<String, String> request) {
        
        String dimension = request.get("dimension");
        log.info("获取预警分布，维度: {}", dimension);
        Map<String, Integer> distribution = alertService.getDistribution(dimension);
        return ResponseEntity.ok(ApiResponse.success(distribution));
    }

    // ========== 预警订阅管理 ==========

    /**
     * 获取用户订阅配置
     */
    @Operation(summary = "获取用户订阅配置", description = "获取指定用户的预警订阅配置")
    @GetMapping("/subscriptions/users/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER') or #userId == authentication.principal.id")
    public ResponseEntity<ApiResponse<List<AlertSubscriptionResponse>>> getSubscriptions(@PathVariable String userId) {
        log.info("获取用户订阅配置，用户ID: {}", userId);
        List<AlertSubscriptionResponse> subscriptions = alertService.getSubscriptions(userId);
        return ResponseEntity.ok(ApiResponse.success(subscriptions));
    }

    /**
     * 创建订阅
     */
    @Operation(summary = "创建订阅", description = "创建预警订阅")
    @PostMapping("/subscriptions")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'OPERATOR')")
    public ResponseEntity<ApiResponse<AlertSubscriptionResponse>> createSubscription(
            @Valid @RequestBody AlertSubscriptionRequest request) {
        
        log.info("创建预警订阅，用户: {}", request.getUserId());
        AlertSubscriptionResponse subscription = alertService.createSubscription(request);
        return ResponseEntity.ok(ApiResponse.success(subscription));
    }

    /**
     * 更新订阅
     */
    @Operation(summary = "更新订阅", description = "更新预警订阅配置")
    @PutMapping("/subscriptions/{subscriptionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER') or @alertService.isSubscriptionOwner(#subscriptionId, authentication.principal.id)")
    public ResponseEntity<ApiResponse<AlertSubscriptionResponse>> updateSubscription(
            @PathVariable String subscriptionId,
            @Valid @RequestBody AlertSubscriptionRequest request) {
        
        log.info("更新预警订阅，ID: {}", subscriptionId);
        AlertSubscriptionResponse subscription = alertService.updateSubscription(subscriptionId, request);
        return ResponseEntity.ok(ApiResponse.success(subscription));
    }

    /**
     * 删除订阅
     */
    @Operation(summary = "删除订阅", description = "删除预警订阅")
    @DeleteMapping("/subscriptions/{subscriptionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER') or @alertService.isSubscriptionOwner(#subscriptionId, authentication.principal.id)")
    public ResponseEntity<ApiResponse<Void>> deleteSubscription(@PathVariable String subscriptionId) {
        log.info("删除预警订阅，ID: {}", subscriptionId);
        alertService.deleteSubscription(subscriptionId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ========== 实时预警 ==========

    /**
     * 获取实时预警
     */
    @Operation(summary = "获取实时预警", description = "获取最新的实时预警")
    @GetMapping("/realtime")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'OPERATOR')")
    public ResponseEntity<ApiResponse<List<AlertResponse>>> getRealtimeAlerts() {
        log.info("获取实时预警");
        List<AlertResponse> alerts = alertService.getRealtimeAlerts();
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    /**
     * 手动触发预警检查
     */
    @Operation(summary = "触发预警检查", description = "手动触发预警规则检查")
    @PostMapping("/trigger")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> triggerCheck(
            @RequestBody Map<String, String> request) {
        
        String ruleId = request.get("ruleId");
        log.info("手动触发预警检查，规则ID: {}", ruleId);
        alertService.triggerCheck(ruleId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ========== 预警历史 ==========

    /**
     * 获取预警历史
     */
    @Operation(summary = "获取预警历史", description = "获取预警历史记录")
    @PostMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'ANALYST')")
    public ResponseEntity<ApiResponse<List<AlertResponse>>> getHistory(
            @Valid @RequestBody AlertQueryRequest request) {
        
        log.info("获取预警历史");
        List<AlertResponse> history = alertService.getHistory(request);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    /**
     * 导出预警报告
     */
    @Operation(summary = "导出预警报告", description = "导出预警数据报告")
    @PostMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER', 'ANALYST')")
    public ResponseEntity<byte[]> exportReport(
            @Valid @RequestBody AlertQueryRequest request,
            @Parameter(description = "导出格式") @RequestParam(defaultValue = "excel") String format) {
        
        log.info("导出预警报告，格式: {}", format);
        byte[] report = alertService.exportReport(request, format);
        
        return ResponseEntity.ok()
                .header("Content-Type", format.equals("pdf") ? "application/pdf" : "application/vnd.ms-excel")
                .header("Content-Disposition", "attachment; filename=alert-report." + format)
                .body(report);
    }

    // ========== 预警配置 ==========

    /**
     * 获取预警配置
     */
    @Operation(summary = "获取预警配置", description = "获取全局预警配置")
    @GetMapping("/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getConfig() {
        log.info("获取预警配置");
        Map<String, Object> config = alertService.getConfig();
        return ResponseEntity.ok(ApiResponse.success(config));
    }

    /**
     * 更新预警配置
     */
    @Operation(summary = "更新预警配置", description = "更新全局预警配置")
    @PutMapping("/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateConfig(@RequestBody Map<String, Object> config) {
        log.info("更新预警配置");
        alertService.updateConfig(config);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 测试预警规则
     */
    @Operation(summary = "测试预警规则", description = "测试预警规则是否有效")
    @PostMapping("/test")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testRule(@Valid @RequestBody AlertRuleRequest request) {
        log.info("测试预警规则: {}", request.getName());
        Map<String, Object> result = alertService.testRule(request);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * 获取预警模板
     */
    @Operation(summary = "获取预警模板", description = "获取预定义的预警规则模板")
    @GetMapping("/templates")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALERT_MANAGER')")
    public ResponseEntity<ApiResponse<List<AlertRuleResponse>>> getTemplates() {
        log.info("获取预警模板");
        List<AlertRuleResponse> templates = alertService.getTemplates();
        return ResponseEntity.ok(ApiResponse.success(templates));
    }

    /**
     * 从模板创建规则
     */
    @Operation(summary = "从模板创建规则", description = "基于模板创建预警规则")
    @PostMapping("/templates/{templateId}/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AlertRuleResponse>> createFromTemplate(
            @PathVariable String templateId,
            @Valid @RequestBody AlertRuleRequest customization) {
        
        log.info("从模板创建规则，模板ID: {}", templateId);
        AlertRuleResponse rule = alertService.createFromTemplate(templateId, customization);
        return ResponseEntity.ok(ApiResponse.success(rule));
    }
}