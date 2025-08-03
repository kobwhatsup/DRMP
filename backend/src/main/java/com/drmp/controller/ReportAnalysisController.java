package com.drmp.controller;

import com.drmp.dto.request.ReportQueryRequest;
import com.drmp.dto.response.ApiResponse;
import com.drmp.service.ReportAnalysisService;
import com.drmp.util.SecurityUtils;
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
import java.util.Map;

/**
 * 报表分析控制器
 * 提供实时数据统计、可视化报表和数据导出功能
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/v1/reports")
@RequiredArgsConstructor
@Validated
@Tag(name = "报表分析", description = "实时数据统计、可视化报表和数据导出功能")
public class ReportAnalysisController {

    private final ReportAnalysisService reportAnalysisService;

    @Operation(summary = "获取平台运营看板", description = "获取平台整体运营数据看板")
    @GetMapping("/platform-dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLATFORM_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPlatformDashboard(
            @Parameter(description = "时间范围") @RequestParam(defaultValue = "30") Integer days,
            @Parameter(description = "刷新间隔") @RequestParam(defaultValue = "300") Integer refreshInterval) {
        
        log.info("Getting platform dashboard for {} days with refresh interval {} seconds", days, refreshInterval);
        Map<String, Object> result = reportAnalysisService.getPlatformDashboard(days, refreshInterval);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "获取案源机构看板", description = "获取案源机构专属数据看板")
    @GetMapping("/source-org-dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOURCE_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSourceOrgDashboard(
            @Parameter(description = "机构ID") @RequestParam(required = false) Long organizationId,
            @Parameter(description = "时间范围") @RequestParam(defaultValue = "30") Integer days) {
        
        Long orgId = organizationId != null ? organizationId : SecurityUtils.getCurrentOrgId();
        log.info("Getting source org dashboard for org: {}, days: {}", orgId, days);
        
        Map<String, Object> result = reportAnalysisService.getSourceOrgDashboard(orgId, days);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "获取处置机构看板", description = "获取处置机构专属数据看板")
    @GetMapping("/disposal-org-dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDisposalOrgDashboard(
            @Parameter(description = "机构ID") @RequestParam(required = false) Long organizationId,
            @Parameter(description = "时间范围") @RequestParam(defaultValue = "30") Integer days) {
        
        Long orgId = organizationId != null ? organizationId : SecurityUtils.getCurrentOrgId();
        log.info("Getting disposal org dashboard for org: {}, days: {}", orgId, days);
        
        Map<String, Object> result = reportAnalysisService.getDisposalOrgDashboard(orgId, days);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "获取实时数据概览", description = "获取实时更新的关键指标数据")
    @GetMapping("/real-time-overview")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'PLATFORM_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRealTimeOverview(
            @Parameter(description = "机构ID") @RequestParam(required = false) Long organizationId) {
        
        log.info("Getting real-time overview for org: {}", organizationId);
        Map<String, Object> result = reportAnalysisService.getRealTimeOverview(organizationId);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "获取案件处置趋势", description = "获取案件处置效率和趋势分析")
    @GetMapping("/case-disposal-trends")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCaseDisposalTrends(
            @Parameter(description = "查询条件") @Valid ReportQueryRequest request) {
        
        log.info("Getting case disposal trends with request: {}", request);
        Map<String, Object> result = reportAnalysisService.getCaseDisposalTrends(request);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "获取回款分析报告", description = "获取回款率、回款趋势等财务分析")
    @GetMapping("/recovery-analysis")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRecoveryAnalysis(
            @Parameter(description = "查询条件") @Valid ReportQueryRequest request) {
        
        log.info("Getting recovery analysis with request: {}", request);
        Map<String, Object> result = reportAnalysisService.getRecoveryAnalysis(request);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "获取机构业绩排名", description = "获取机构业绩排行榜和对比分析")
    @GetMapping("/organization-performance-ranking")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLATFORM_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOrganizationPerformanceRanking(
            @Parameter(description = "机构类型") @RequestParam(required = false) String organizationType,
            @Parameter(description = "排序字段") @RequestParam(defaultValue = "recoveryRate") String sortBy,
            @Parameter(description = "时间范围") @RequestParam(defaultValue = "30") Integer days,
            @Parameter(description = "返回数量") @RequestParam(defaultValue = "20") Integer limit) {
        
        log.info("Getting organization performance ranking: type={}, sortBy={}, days={}, limit={}", 
            organizationType, sortBy, days, limit);
        
        Map<String, Object> result = reportAnalysisService.getOrganizationPerformanceRanking(
            organizationType, sortBy, days, limit);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "获取地域分布分析", description = "获取案件和机构的地域分布统计")
    @GetMapping("/geographical-distribution")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLATFORM_MANAGER', 'CASE_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getGeographicalDistribution(
            @Parameter(description = "分析维度") @RequestParam(defaultValue = "cases") String dimension,
            @Parameter(description = "时间范围") @RequestParam(defaultValue = "30") Integer days) {
        
        log.info("Getting geographical distribution: dimension={}, days={}", dimension, days);
        Map<String, Object> result = reportAnalysisService.getGeographicalDistribution(dimension, days);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "生成自定义报表", description = "根据用户配置生成自定义分析报表")
    @PostMapping("/custom-report")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'PLATFORM_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateCustomReport(
            @Parameter(description = "自定义报表配置") @Valid @RequestBody Map<String, Object> reportConfig) {
        
        log.info("Generating custom report with config: {}", reportConfig);
        Map<String, Object> result = reportAnalysisService.generateCustomReport(reportConfig, SecurityUtils.getCurrentUserId());
        
        return ResponseEntity.ok(ApiResponse.success(result, "自定义报表生成成功"));
    }

    @Operation(summary = "导出报表数据", description = "导出指定报表的详细数据")
    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'PLATFORM_MANAGER')")
    public ResponseEntity<byte[]> exportReportData(
            @Parameter(description = "报表类型") @RequestParam String reportType,
            @Parameter(description = "导出格式") @RequestParam(defaultValue = "excel") String format,
            @Parameter(description = "查询条件") @Valid ReportQueryRequest request) {
        
        log.info("Exporting report data: type={}, format={}", reportType, format);
        byte[] reportData = reportAnalysisService.exportReportData(reportType, format, request);
        
        String fileName = String.format("%s_report.%s", reportType, format);
        
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=" + fileName)
                .header("Content-Type", "application/octet-stream")
                .body(reportData);
    }

    @Operation(summary = "获取报表模板", description = "获取可用的报表模板列表")
    @GetMapping("/templates")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'PLATFORM_MANAGER')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getReportTemplates(
            @Parameter(description = "模板分类") @RequestParam(required = false) String category) {
        
        log.info("Getting report templates for category: {}", category);
        List<Map<String, Object>> result = reportAnalysisService.getReportTemplates(category);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "保存报表模板", description = "保存用户自定义的报表模板")
    @PostMapping("/templates")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'PLATFORM_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> saveReportTemplate(
            @Parameter(description = "模板配置") @Valid @RequestBody Map<String, Object> templateConfig) {
        
        log.info("Saving report template with config: {}", templateConfig);
        Map<String, Object> result = reportAnalysisService.saveReportTemplate(templateConfig, SecurityUtils.getCurrentUserId());
        
        return ResponseEntity.ok(ApiResponse.success(result, "报表模板保存成功"));
    }

    @Operation(summary = "获取数据钻取详情", description = "获取指定指标的钻取详细数据")
    @GetMapping("/drill-down")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'PLATFORM_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDrillDownData(
            @Parameter(description = "指标类型") @RequestParam String metricType,
            @Parameter(description = "维度值") @RequestParam String dimensionValue,
            @Parameter(description = "钻取层级") @RequestParam(defaultValue = "1") Integer level,
            @Parameter(description = "查询条件") @Valid ReportQueryRequest request) {
        
        log.info("Getting drill-down data: metricType={}, dimensionValue={}, level={}", 
            metricType, dimensionValue, level);
        
        Map<String, Object> result = reportAnalysisService.getDrillDownData(metricType, dimensionValue, level, request);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "获取预警分析", description = "获取异常数据和风险预警分析")
    @GetMapping("/alert-analysis")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLATFORM_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAlertAnalysis(
            @Parameter(description = "预警类型") @RequestParam(required = false) String alertType,
            @Parameter(description = "严重程度") @RequestParam(required = false) String severity) {
        
        log.info("Getting alert analysis: alertType={}, severity={}", alertType, severity);
        Map<String, Object> result = reportAnalysisService.getAlertAnalysis(alertType, severity);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "获取缓存状态", description = "获取报表缓存状态和性能信息")
    @GetMapping("/cache-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCacheStatus() {
        
        log.info("Getting report cache status");
        Map<String, Object> result = reportAnalysisService.getCacheStatus();
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "刷新报表缓存", description = "手动刷新指定报表的缓存数据")
    @PostMapping("/refresh-cache")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> refreshCache(
            @Parameter(description = "报表类型") @RequestParam String reportType,
            @Parameter(description = "缓存键") @RequestParam(required = false) String cacheKey) {
        
        log.info("Refreshing report cache: reportType={}, cacheKey={}", reportType, cacheKey);
        reportAnalysisService.refreshCache(reportType, cacheKey);
        
        return ResponseEntity.ok(ApiResponse.successWithMessage("缓存刷新成功"));
    }
}