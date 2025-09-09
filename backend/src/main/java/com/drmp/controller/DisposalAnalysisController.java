package com.drmp.controller;

import com.drmp.dto.request.DisposalAnalysisQueryRequest;
import com.drmp.dto.response.DisposalAnalysisResponse;
import com.drmp.service.DisposalAnalysisService;
import com.drmp.common.ApiResponse;
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
 * 处置分析控制器
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Tag(name = "处置分析", description = "处置分析相关API")
@RestController
@RequestMapping("/api/v1/disposal-analysis")
@RequiredArgsConstructor
@Slf4j
public class DisposalAnalysisController {

    private final DisposalAnalysisService disposalAnalysisService;

    /**
     * 获取处置分析综合数据
     */
    @Operation(summary = "获取处置分析综合数据", description = "根据查询条件获取完整的处置分析数据")
    @PostMapping("/comprehensive")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPOSAL_MANAGER', 'ANALYST')")
    public ResponseEntity<ApiResponse<DisposalAnalysisResponse>> getComprehensiveAnalysis(
            @Valid @RequestBody DisposalAnalysisQueryRequest request) {
        
        log.info("获取处置分析综合数据，查询条件: {}", request);
        
        DisposalAnalysisResponse response = disposalAnalysisService.getComprehensiveAnalysis(request);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 获取处置概览统计
     */
    @Operation(summary = "获取处置概览统计", description = "获取处置概览的统计数据")
    @PostMapping("/overview")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPOSAL_MANAGER', 'ANALYST')")
    public ResponseEntity<ApiResponse<DisposalAnalysisResponse.OverviewStatistics>> getOverviewStatistics(
            @Valid @RequestBody DisposalAnalysisQueryRequest request) {
        
        log.info("获取处置概览统计，查询条件: {}", request);
        
        DisposalAnalysisResponse.OverviewStatistics statistics = 
            disposalAnalysisService.getOverviewStatistics(request);
        
        return ResponseEntity.ok(ApiResponse.success(statistics));
    }

    /**
     * 获取趋势分析数据
     */
    @Operation(summary = "获取趋势分析数据", description = "获取指定时间范围内的趋势分析数据")
    @PostMapping("/trends")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPOSAL_MANAGER', 'ANALYST')")
    public ResponseEntity<ApiResponse<List<DisposalAnalysisResponse.TrendDataPoint>>> getTrendAnalysis(
            @Valid @RequestBody DisposalAnalysisQueryRequest request) {
        
        log.info("获取趋势分析数据，查询条件: {}", request);
        
        List<DisposalAnalysisResponse.TrendDataPoint> trends = 
            disposalAnalysisService.getTrendAnalysis(request);
        
        return ResponseEntity.ok(ApiResponse.success(trends));
    }

    /**
     * 获取机构绩效分析
     */
    @Operation(summary = "获取机构绩效分析", description = "获取各处置机构的绩效分析数据")
    @PostMapping("/organization-performance")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPOSAL_MANAGER', 'ANALYST')")
    public ResponseEntity<ApiResponse<List<DisposalAnalysisResponse.OrganizationPerformance>>> getOrganizationPerformance(
            @Valid @RequestBody DisposalAnalysisQueryRequest request) {
        
        log.info("获取机构绩效分析，查询条件: {}", request);
        
        List<DisposalAnalysisResponse.OrganizationPerformance> performance = 
            disposalAnalysisService.getOrganizationPerformance(request);
        
        return ResponseEntity.ok(ApiResponse.success(performance));
    }

    /**
     * 获取类型分布分析
     */
    @Operation(summary = "获取类型分布分析", description = "获取案件类型分布分析数据")
    @PostMapping("/type-distribution")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPOSAL_MANAGER', 'ANALYST')")
    public ResponseEntity<ApiResponse<List<DisposalAnalysisResponse.TypeDistribution>>> getTypeDistribution(
            @Valid @RequestBody DisposalAnalysisQueryRequest request) {
        
        log.info("获取类型分布分析，查询条件: {}", request);
        
        List<DisposalAnalysisResponse.TypeDistribution> distribution = 
            disposalAnalysisService.getTypeDistribution(request);
        
        return ResponseEntity.ok(ApiResponse.success(distribution));
    }

    /**
     * 获取效率分析
     */
    @Operation(summary = "获取效率分析", description = "获取处置效率分析数据")
    @PostMapping("/efficiency")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPOSAL_MANAGER', 'ANALYST')")
    public ResponseEntity<ApiResponse<DisposalAnalysisResponse.EfficiencyAnalysis>> getEfficiencyAnalysis(
            @Valid @RequestBody DisposalAnalysisQueryRequest request) {
        
        log.info("获取效率分析，查询条件: {}", request);
        
        DisposalAnalysisResponse.EfficiencyAnalysis efficiency = 
            disposalAnalysisService.getEfficiencyAnalysis(request);
        
        return ResponseEntity.ok(ApiResponse.success(efficiency));
    }

    /**
     * 获取地域分析
     */
    @Operation(summary = "获取地域分析", description = "获取地域处置分析数据")
    @PostMapping("/region-analysis")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPOSAL_MANAGER', 'ANALYST')")
    public ResponseEntity<ApiResponse<List<DisposalAnalysisResponse.RegionAnalysis>>> getRegionAnalysis(
            @Valid @RequestBody DisposalAnalysisQueryRequest request) {
        
        log.info("获取地域分析，查询条件: {}", request);
        
        List<DisposalAnalysisResponse.RegionAnalysis> regionAnalysis = 
            disposalAnalysisService.getRegionAnalysis(request);
        
        return ResponseEntity.ok(ApiResponse.success(regionAnalysis));
    }

    /**
     * 获取预警数据
     */
    @Operation(summary = "获取预警数据", description = "获取处置相关的预警信息")
    @PostMapping("/alerts")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPOSAL_MANAGER', 'ANALYST')")
    public ResponseEntity<ApiResponse<List<DisposalAnalysisResponse.AlertData>>> getAlerts(
            @Valid @RequestBody DisposalAnalysisQueryRequest request) {
        
        log.info("获取预警数据，查询条件: {}", request);
        
        List<DisposalAnalysisResponse.AlertData> alerts = 
            disposalAnalysisService.getAlerts(request);
        
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    /**
     * 获取预测分析
     */
    @Operation(summary = "获取预测分析", description = "获取基于历史数据的预测分析")
    @PostMapping("/predictions")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPOSAL_MANAGER', 'ANALYST')")
    public ResponseEntity<ApiResponse<List<DisposalAnalysisResponse.PredictionData>>> getPredictions(
            @Valid @RequestBody DisposalAnalysisQueryRequest request) {
        
        log.info("获取预测分析，查询条件: {}", request);
        
        List<DisposalAnalysisResponse.PredictionData> predictions = 
            disposalAnalysisService.getPredictions(request);
        
        return ResponseEntity.ok(ApiResponse.success(predictions));
    }

    /**
     * 导出分析报告
     */
    @Operation(summary = "导出分析报告", description = "导出处置分析报告")
    @PostMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPOSAL_MANAGER', 'ANALYST')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> exportAnalysisReport(
            @Valid @RequestBody DisposalAnalysisQueryRequest request,
            @Parameter(description = "导出格式") @RequestParam(defaultValue = "excel") String format) {
        
        log.info("导出分析报告，查询条件: {}, 格式: {}", request, format);
        
        Map<String, Object> exportResult = disposalAnalysisService.exportAnalysisReport(request, format);
        
        return ResponseEntity.ok(ApiResponse.success(exportResult));
    }

    /**
     * 获取关键指标卡片数据
     */
    @Operation(summary = "获取关键指标卡片", description = "获取关键指标的卡片展示数据")
    @PostMapping("/key-indicators")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPOSAL_MANAGER', 'ANALYST')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getKeyIndicators(
            @Valid @RequestBody DisposalAnalysisQueryRequest request) {
        
        log.info("获取关键指标卡片，查询条件: {}", request);
        
        List<Map<String, Object>> indicators = disposalAnalysisService.getKeyIndicators(request);
        
        return ResponseEntity.ok(ApiResponse.success(indicators));
    }

    /**
     * 获取实时分析数据
     */
    @Operation(summary = "获取实时分析数据", description = "获取实时更新的分析数据")
    @GetMapping("/realtime")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPOSAL_MANAGER', 'ANALYST')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRealtimeData(
            @Parameter(description = "机构ID列表") @RequestParam(required = false) List<Long> orgIds) {
        
        log.info("获取实时分析数据，机构ID: {}", orgIds);
        
        Map<String, Object> realtimeData = disposalAnalysisService.getRealtimeData(orgIds);
        
        return ResponseEntity.ok(ApiResponse.success(realtimeData));
    }
}