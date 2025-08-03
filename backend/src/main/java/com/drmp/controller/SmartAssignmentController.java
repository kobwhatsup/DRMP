package com.drmp.controller;

import com.drmp.dto.request.AssignmentRuleRequest;
import com.drmp.dto.response.ApiResponse;
import com.drmp.dto.response.AssignmentRecommendationResponse;
import com.drmp.dto.response.AssignmentRuleResponse;
import com.drmp.service.SmartAssignmentService;
import com.drmp.service.assignment.AssignmentStrategyManager;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/**
 * Smart Assignment Controller
 * 智能分案控制器
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/v1/smart-assignment")
@RequiredArgsConstructor
@Validated
@Tag(name = "智能分案管理", description = "智能分案相关API")
public class SmartAssignmentController {

    private final SmartAssignmentService smartAssignmentService;
    private final AssignmentStrategyManager strategyManager;

    @Operation(summary = "获取智能推荐", description = "为指定案件包获取智能推荐的处置机构")
    @GetMapping("/recommendations/{casePackageId}")
    @PreAuthorize("hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<List<AssignmentRecommendationResponse>>> getRecommendations(
            @PathVariable Long casePackageId,
            @Parameter(description = "推荐数量限制") @RequestParam(defaultValue = "10") Integer limit) {
        
        log.info("Getting smart recommendations for case package: {}", casePackageId);
        
        List<AssignmentRecommendationResponse> recommendations = 
            smartAssignmentService.getRecommendations(casePackageId, limit);
        
        return ResponseEntity.ok(ApiResponse.success(recommendations));
    }

    @Operation(summary = "执行自动分案", description = "使用指定规则执行自动分案")
    @PostMapping("/auto-assign/{casePackageId}")
    @PreAuthorize("hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<SmartAssignmentService.AssignmentResult>> executeAutoAssignment(
            @PathVariable Long casePackageId,
            @RequestParam Long ruleId) {
        
        log.info("Executing auto assignment for case package: {} with rule: {}", casePackageId, ruleId);
        
        SmartAssignmentService.AssignmentResult result = 
            smartAssignmentService.executeAutoAssignment(casePackageId, ruleId);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "批量智能分案", description = "对多个案件包执行批量智能分案")
    @PostMapping("/batch-assign")
    @PreAuthorize("hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<SmartAssignmentService.BatchAssignmentResult>> executeBatchAssignment(
            @RequestParam List<Long> casePackageIds,
            @RequestParam String strategy) {
        
        log.info("Executing batch assignment for {} case packages with strategy: {}", 
                casePackageIds.size(), strategy);
        
        SmartAssignmentService.BatchAssignmentResult result = 
            smartAssignmentService.executeBatchAssignment(casePackageIds, strategy);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "评估匹配度", description = "评估机构与案件包的匹配度")
    @GetMapping("/assess-matching")
    @PreAuthorize("hasRole('CASE_MANAGER') or hasRole('CASE_VIEWER')")
    public ResponseEntity<ApiResponse<SmartAssignmentService.MatchingAssessment>> assessMatching(
            @RequestParam Long organizationId,
            @RequestParam Long casePackageId) {
        
        log.info("Assessing matching between organization: {} and case package: {}", 
                organizationId, casePackageId);
        
        SmartAssignmentService.MatchingAssessment assessment = 
            smartAssignmentService.assessMatching(organizationId, casePackageId);
        
        return ResponseEntity.ok(ApiResponse.success(assessment));
    }

    @Operation(summary = "创建分案规则", description = "创建新的智能分案规则")
    @PostMapping("/rules")
    @PreAuthorize("hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<AssignmentRuleResponse>> createAssignmentRule(
            @Valid @RequestBody AssignmentRuleRequest request) {
        
        log.info("Creating assignment rule: {}", request.getRuleName());
        
        AssignmentRuleResponse response = smartAssignmentService.createAssignmentRule(request);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "更新分案规则", description = "更新现有的分案规则")
    @PutMapping("/rules/{ruleId}")
    @PreAuthorize("hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<AssignmentRuleResponse>> updateAssignmentRule(
            @PathVariable Long ruleId,
            @Valid @RequestBody AssignmentRuleRequest request) {
        
        log.info("Updating assignment rule: {}", ruleId);
        
        AssignmentRuleResponse response = smartAssignmentService.updateAssignmentRule(ruleId, request);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "删除分案规则", description = "删除指定的分案规则")
    @DeleteMapping("/rules/{ruleId}")
    @PreAuthorize("hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteAssignmentRule(@PathVariable Long ruleId) {
        
        log.info("Deleting assignment rule: {}", ruleId);
        
        smartAssignmentService.deleteAssignmentRule(ruleId);
        
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Operation(summary = "获取分案规则列表", description = "获取分案规则列表")
    @GetMapping("/rules")
    @PreAuthorize("hasRole('CASE_MANAGER') or hasRole('CASE_VIEWER')")
    public ResponseEntity<ApiResponse<List<AssignmentRuleResponse>>> getAssignmentRules(
            @RequestParam(required = false) Long organizationId) {
        
        List<AssignmentRuleResponse> rules = smartAssignmentService.getAssignmentRules(organizationId);
        
        return ResponseEntity.ok(ApiResponse.success(rules));
    }

    @Operation(summary = "测试分案规则", description = "测试分案规则是否匹配指定案件包")
    @PostMapping("/rules/{ruleId}/test")
    @PreAuthorize("hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<SmartAssignmentService.RuleTestResult>> testAssignmentRule(
            @PathVariable Long ruleId,
            @RequestParam Long casePackageId) {
        
        log.info("Testing assignment rule: {} with case package: {}", ruleId, casePackageId);
        
        SmartAssignmentService.RuleTestResult result = 
            smartAssignmentService.testAssignmentRule(ruleId, casePackageId);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "获取分案统计", description = "获取智能分案的统计数据")
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('CASE_MANAGER') or hasRole('CASE_VIEWER')")
    public ResponseEntity<ApiResponse<SmartAssignmentService.AssignmentStatistics>> getAssignmentStatistics(
            @RequestParam(required = false) Long organizationId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        SmartAssignmentService.AssignmentStatistics statistics = 
            smartAssignmentService.getAssignmentStatistics(organizationId, startDate, endDate);
        
        return ResponseEntity.ok(ApiResponse.success(statistics));
    }

    @Operation(summary = "获取机构能力画像", description = "获取机构的能力画像分析")
    @GetMapping("/capability-profile/{organizationId}")
    @PreAuthorize("hasRole('CASE_MANAGER') or hasRole('CASE_VIEWER')")
    public ResponseEntity<ApiResponse<SmartAssignmentService.OrganizationCapabilityProfile>> getCapabilityProfile(
            @PathVariable Long organizationId) {
        
        log.info("Getting capability profile for organization: {}", organizationId);
        
        SmartAssignmentService.OrganizationCapabilityProfile profile = 
            smartAssignmentService.getCapabilityProfile(organizationId);
        
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @Operation(summary = "预测成功率", description = "预测指定机构处理案件包的成功率")
    @GetMapping("/predict-success-rate")
    @PreAuthorize("hasRole('CASE_MANAGER') or hasRole('CASE_VIEWER')")
    public ResponseEntity<ApiResponse<Double>> predictSuccessRate(
            @RequestParam Long organizationId,
            @RequestParam Long casePackageId) {
        
        log.info("Predicting success rate for organization: {} and case package: {}", 
                organizationId, casePackageId);
        
        // 获取案件包
        // TODO: 需要从service中获取案件包实体
        Double successRate = smartAssignmentService.predictSuccessRate(organizationId, null);
        
        return ResponseEntity.ok(ApiResponse.success(successRate));
    }

    @Operation(summary = "获取可用策略列表", description = "获取所有可用的分案策略")
    @GetMapping("/strategies")
    @PreAuthorize("hasRole('CASE_MANAGER') or hasRole('CASE_VIEWER')")
    public ResponseEntity<ApiResponse<List<AssignmentStrategyManager.StrategyInfo>>> getAvailableStrategies() {
        log.info("Getting available assignment strategies");
        
        List<AssignmentStrategyManager.StrategyInfo> strategies = strategyManager.getStrategyInfoList();
        
        return ResponseEntity.ok(ApiResponse.success(strategies));
    }

    @Operation(summary = "使用指定策略获取推荐", description = "使用指定的分案策略为案件包获取推荐")
    @GetMapping("/recommendations/{casePackageId}/strategy/{strategyName}")
    @PreAuthorize("hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<List<AssignmentRecommendationResponse>>> getRecommendationsWithStrategy(
            @PathVariable Long casePackageId,
            @PathVariable String strategyName,
            @Parameter(description = "推荐数量限制") @RequestParam(defaultValue = "10") Integer limit) {
        
        log.info("Getting recommendations for case package: {} using strategy: {}", casePackageId, strategyName);
        
        // 获取推荐（内部会使用指定策略）
        List<AssignmentRecommendationResponse> recommendations = 
            smartAssignmentService.getRecommendations(casePackageId, limit);
        
        return ResponseEntity.ok(ApiResponse.success(recommendations));
    }

    @Operation(summary = "使用指定策略执行分案", description = "使用指定策略对单个案件包执行分案")
    @PostMapping("/assign/{casePackageId}/strategy/{strategyName}")
    @PreAuthorize("hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<SmartAssignmentService.BatchAssignmentResult>> assignWithStrategy(
            @PathVariable Long casePackageId,
            @PathVariable String strategyName) {
        
        log.info("Assigning case package: {} using strategy: {}", casePackageId, strategyName);
        
        SmartAssignmentService.BatchAssignmentResult result = 
            smartAssignmentService.executeBatchAssignment(List.of(casePackageId), strategyName);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}