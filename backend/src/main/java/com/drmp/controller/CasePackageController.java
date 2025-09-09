package com.drmp.controller;

import com.drmp.common.ApiResponse;
import com.drmp.dto.request.*;
import com.drmp.dto.response.*;
import com.drmp.entity.CasePackage;
import com.drmp.entity.enums.CasePackageStatus;
import com.drmp.service.CasePackageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.math.BigDecimal;
import java.util.List;

/**
 * Case Package Management Controller
 * 案件包管理控制器
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/case-packages")
@RequiredArgsConstructor
@Tag(name = "Case Package Management", description = "案件包管理相关接口")
public class CasePackageController {
    
    private final CasePackageService casePackageService;
    
    // ========== 基础管理接口 ==========
    
    @GetMapping
    @Operation(summary = "获取案件包列表", description = "分页查询案件包列表")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'DISPOSAL_ORG')")
    public ApiResponse<Page<CasePackageListResponse>> getCasePackageList(
            @Parameter(description = "页码", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "每页大小", example = "10") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "排序字段") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "排序方向") @RequestParam(defaultValue = "DESC") String sortDirection,
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "状态") @RequestParam(required = false) String status,
            @Parameter(description = "分案类型") @RequestParam(required = false) String assignmentType,
            @Parameter(description = "源机构ID") @RequestParam(required = false) Long sourceOrgId) {
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        CasePackageQueryRequest request = new CasePackageQueryRequest();
        request.setKeyword(keyword);
        if (status != null) {
            request.setStatus(CasePackageStatus.valueOf(status));
        }
        request.setSourceOrgId(sourceOrgId);
        
        Page<CasePackageListResponse> result = casePackageService.getCasePackageList(request, pageable);
        return ApiResponse.success(result);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "获取案件包详情", description = "根据ID获取案件包详细信息")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'DISPOSAL_ORG')")
    public ApiResponse<CasePackageDetailResponse> getCasePackageDetail(@PathVariable Long id) {
        CasePackageDetailResponse result = casePackageService.getCasePackageDetail(id);
        return ApiResponse.success(result);
    }
    
    @PostMapping
    @Operation(summary = "创建案件包", description = "创建新的案件包")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER')")
    public ApiResponse<CasePackage> createCasePackage(@Valid @RequestBody CasePackageCreateRequest request) {
        CasePackage result = casePackageService.createCasePackage(request);
        return ApiResponse.success(result);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "更新案件包", description = "更新案件包信息")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER')")
    public ApiResponse<CasePackage> updateCasePackage(
            @PathVariable Long id,
            @Valid @RequestBody CasePackageUpdateRequest request) {
        CasePackage result = casePackageService.updateCasePackage(id, request);
        return ApiResponse.success(result);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "删除案件包", description = "删除指定的案件包")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteCasePackage(@PathVariable Long id) {
        casePackageService.deleteCasePackage(id);
        return ApiResponse.success(null);
    }
    
    @PostMapping("/{id}/publish")
    @Operation(summary = "发布案件包", description = "发布案件包到市场")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER')")
    public ApiResponse<CasePackage> publishCasePackage(@PathVariable Long id) {
        CasePackage result = casePackageService.publishCasePackage(id);
        return ApiResponse.success(result);
    }
    
    @PostMapping("/{id}/withdraw")
    @Operation(summary = "撤回案件包", description = "撤回已发布的案件包")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER')")
    public ApiResponse<CasePackage> withdrawCasePackage(@PathVariable Long id) {
        CasePackage result = casePackageService.withdrawCasePackage(id);
        return ApiResponse.success(result);
    }
    
    // ========== 案件管理接口 ==========
    
    @PostMapping("/{id}/import")
    @Operation(summary = "批量导入案件", description = "通过Excel文件批量导入案件")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER')")
    public ApiResponse<BatchImportResult> importCases(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        BatchImportResult result = casePackageService.importCases(id, file);
        return ApiResponse.success(result);
    }
    
    @GetMapping("/{id}/export")
    @Operation(summary = "导出案件数据", description = "导出案件包中的案件数据")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER')")
    public ResponseEntity<byte[]> exportCases(
            @PathVariable Long id,
            @RequestParam(defaultValue = "excel") String format) {
        
        byte[] data = casePackageService.exportCases(id, format);
        
        String filename = "cases_" + System.currentTimeMillis();
        String extension = "excel".equals(format) ? ".xlsx" : ".csv";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", filename + extension);
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(data);
    }
    
    @GetMapping("/{id}/cases")
    @Operation(summary = "获取案件列表", description = "获取案件包中的案件列表")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'DISPOSAL_ORG')")
    public ApiResponse<Page<CaseResponse>> getCasesInPackage(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<CaseResponse> result = casePackageService.getCasesInPackage(id, pageable);
        return ApiResponse.success(result);
    }
    
    @PostMapping("/{id}/cases")
    @Operation(summary = "添加案件", description = "添加案件到案件包")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER')")
    public ApiResponse<Void> addCases(
            @PathVariable Long id,
            @RequestBody List<Long> caseIds) {
        casePackageService.addCases(id, caseIds);
        return ApiResponse.success(null);
    }
    
    @DeleteMapping("/{id}/cases")
    @Operation(summary = "移除案件", description = "从案件包移除案件")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER')")
    public ApiResponse<Void> removeCases(
            @PathVariable Long id,
            @RequestBody List<Long> caseIds) {
        casePackageService.removeCases(id, caseIds);
        return ApiResponse.success(null);
    }
    
    @PostMapping("/{id}/transfer")
    @Operation(summary = "转移案件", description = "转移案件到其他案件包")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER')")
    public ApiResponse<Void> transferCases(
            @PathVariable Long id,
            @RequestParam Long targetPackageId,
            @RequestBody List<Long> caseIds) {
        casePackageService.transferCases(id, targetPackageId, caseIds);
        return ApiResponse.success(null);
    }
    
    // ========== 竞标管理接口 ==========
    
    @PostMapping("/bids")
    @Operation(summary = "提交竞标", description = "处置机构提交竞标")
    @PreAuthorize("hasRole('DISPOSAL_ORG')")
    public ApiResponse<CasePackageBidResponse> submitBid(@Valid @RequestBody CasePackageBidRequest request) {
        CasePackageBidResponse result = casePackageService.submitBid(request);
        return ApiResponse.success(result);
    }
    
    @GetMapping("/{id}/bids")
    @Operation(summary = "获取竞标列表", description = "获取案件包的所有竞标")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER')")
    public ApiResponse<List<CasePackageBidResponse>> getBidList(@PathVariable Long id) {
        List<CasePackageBidResponse> result = casePackageService.getBidList(id);
        return ApiResponse.success(result);
    }
    
    @GetMapping("/my-bids")
    @Operation(summary = "获取我的竞标", description = "获取当前机构的竞标记录")
    @PreAuthorize("hasRole('DISPOSAL_ORG')")
    public ApiResponse<Page<CasePackageBidResponse>> getMyBids(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam Long orgId) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<CasePackageBidResponse> result = casePackageService.getMyBids(orgId, pageable);
        return ApiResponse.success(result);
    }
    
    @PostMapping("/{id}/select-winner")
    @Operation(summary = "选择中标方", description = "选择竞标获胜者")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER')")
    public ApiResponse<CasePackage> selectWinner(
            @PathVariable Long id,
            @RequestParam Long bidId) {
        CasePackage result = casePackageService.selectWinner(id, bidId);
        return ApiResponse.success(result);
    }
    
    @PostMapping("/bids/{bidId}/withdraw")
    @Operation(summary = "撤回竞标", description = "撤回已提交的竞标")
    @PreAuthorize("hasRole('DISPOSAL_ORG')")
    public ApiResponse<Void> withdrawBid(@PathVariable Long bidId) {
        casePackageService.withdrawBid(bidId);
        return ApiResponse.success(null);
    }
    
    @GetMapping("/market")
    @Operation(summary = "获取案件市场", description = "获取可竞标的案件包列表")
    @PreAuthorize("hasRole('DISPOSAL_ORG')")
    public ApiResponse<Page<CasePackageListResponse>> getMarketPackages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(required = false) Integer minCaseCount,
            @RequestParam(required = false) Integer maxCaseCount) {
        
        MarketQueryRequest request = new MarketQueryRequest();
        request.setKeyword(keyword);
        request.setMinAmount(minAmount);
        request.setMaxAmount(maxAmount);
        request.setMinCaseCount(minCaseCount);
        request.setMaxCaseCount(maxCaseCount);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<CasePackageListResponse> result = casePackageService.getMarketPackages(request, pageable);
        return ApiResponse.success(result);
    }
    
    // ========== 智能分案接口 ==========
    
    @PostMapping("/smart-assign")
    @Operation(summary = "执行智能分案", description = "执行智能分案算法")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER')")
    public ApiResponse<SmartAssignResultResponse> executeSmartAssignment(@Valid @RequestBody SmartAssignRequest request) {
        SmartAssignResultResponse result = casePackageService.executeSmartAssignment(request);
        return ApiResponse.success(result);
    }
    
    @PostMapping("/smart-assign/preview")
    @Operation(summary = "预览智能分案", description = "预览智能分案结果")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER')")
    public ApiResponse<SmartAssignResultResponse> previewSmartAssignment(@Valid @RequestBody SmartAssignRequest request) {
        SmartAssignResultResponse result = casePackageService.previewSmartAssignment(request);
        return ApiResponse.success(result);
    }
    
    @PostMapping("/assignments/{assignmentId}/confirm")
    @Operation(summary = "确认分案结果", description = "确认并执行分案结果")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER')")
    public ApiResponse<Void> confirmAssignment(@PathVariable String assignmentId) {
        casePackageService.confirmAssignment(assignmentId);
        return ApiResponse.success(null);
    }
    
    @GetMapping("/{id}/recommended-orgs")
    @Operation(summary = "获取推荐机构", description = "获取案件包的推荐处置机构")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER')")
    public ApiResponse<List<RecommendedOrgResponse>> getRecommendedOrgs(@PathVariable Long id) {
        List<RecommendedOrgResponse> result = casePackageService.getRecommendedOrgs(id);
        return ApiResponse.success(result);
    }
    
    // ========== 分案规则管理 ==========
    
    @GetMapping("/assignment-rules")
    @Operation(summary = "获取分案规则列表", description = "获取所有分案规则")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER')")
    public ApiResponse<List<AssignmentRuleResponse>> getAssignmentRules() {
        List<AssignmentRuleResponse> result = casePackageService.getAssignmentRules();
        return ApiResponse.success(result);
    }
    
    @PostMapping("/assignment-rules")
    @Operation(summary = "创建分案规则", description = "创建新的分案规则")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<AssignmentRuleResponse> createAssignmentRule(@Valid @RequestBody AssignmentRuleRequest request) {
        AssignmentRuleResponse result = casePackageService.createAssignmentRule(request);
        return ApiResponse.success(result);
    }
    
    @PutMapping("/assignment-rules/{id}")
    @Operation(summary = "更新分案规则", description = "更新分案规则")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<AssignmentRuleResponse> updateAssignmentRule(
            @PathVariable Long id,
            @Valid @RequestBody AssignmentRuleRequest request) {
        AssignmentRuleResponse result = casePackageService.updateAssignmentRule(id, request);
        return ApiResponse.success(result);
    }
    
    @DeleteMapping("/assignment-rules/{id}")
    @Operation(summary = "删除分案规则", description = "删除指定的分案规则")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteAssignmentRule(@PathVariable Long id) {
        casePackageService.deleteAssignmentRule(id);
        return ApiResponse.success(null);
    }
    
    // ========== 统计分析接口 ==========
    
    @GetMapping("/statistics")
    @Operation(summary = "获取统计信息", description = "获取案件包统计信息")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER')")
    public ApiResponse<CasePackageStatisticsResponse> getStatistics(@RequestParam(required = false) Long orgId) {
        CasePackageStatisticsResponse result = casePackageService.getStatistics(orgId);
        return ApiResponse.success(result);
    }
    
    @GetMapping("/status-distribution")
    @Operation(summary = "获取状态分布", description = "获取案件包状态分布统计")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER')")
    public ApiResponse<Object> getStatusDistribution() {
        // Implementation would return status distribution data
        return ApiResponse.success(null);
    }
    
    @GetMapping("/bidding-statistics")
    @Operation(summary = "获取竞标统计", description = "获取竞标相关统计信息")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER')")
    public ApiResponse<Object> getBiddingStatistics() {
        // Implementation would return bidding statistics
        return ApiResponse.success(null);
    }
    
    @GetMapping("/assignment-efficiency")
    @Operation(summary = "获取分案效率", description = "获取分案效率统计")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER')")
    public ApiResponse<Object> getAssignmentEfficiency() {
        // Implementation would return assignment efficiency data
        return ApiResponse.success(null);
    }
    
    // ========== 辅助功能接口 ==========
    
    @GetMapping("/import-template")
    @Operation(summary = "下载导入模板", description = "下载案件导入Excel模板")
    public ResponseEntity<byte[]> downloadImportTemplate() {
        byte[] data = casePackageService.downloadImportTemplate();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "case_import_template.xlsx");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(data);
    }
    
    @GetMapping("/check-name")
    @Operation(summary = "检查名称重复", description = "检查案件包名称是否已存在")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER')")
    public ApiResponse<Boolean> checkPackageName(@RequestParam String name) {
        boolean exists = casePackageService.checkPackageName(name);
        return ApiResponse.success(exists);
    }
    
    @PostMapping("/{id}/toggle-favorite")
    @Operation(summary = "收藏/取消收藏", description = "切换案件包收藏状态")
    @PreAuthorize("hasRole('DISPOSAL_ORG')")
    public ApiResponse<Void> toggleFavorite(
            @PathVariable Long id,
            @RequestParam Long userId) {
        casePackageService.toggleFavorite(id, userId);
        return ApiResponse.success(null);
    }
    
    @GetMapping("/favorites")
    @Operation(summary = "获取收藏列表", description = "获取用户收藏的案件包")
    @PreAuthorize("hasRole('DISPOSAL_ORG')")
    public ApiResponse<Page<CasePackageListResponse>> getFavoritePackages(@RequestParam Long userId) {
        Page<CasePackageListResponse> result = casePackageService.getFavoritePackages(userId);
        return ApiResponse.success(result);
    }
}