package com.drmp.controller;

import lombok.extern.slf4j.Slf4j;
import com.drmp.dto.request.CasePackageCreateRequest;
import com.drmp.dto.request.CasePackageQueryRequest;
import com.drmp.dto.request.CasePackageUpdateRequest;
import com.drmp.dto.response.ApiResponse;
import com.drmp.dto.response.CasePackageDetailResponse;
import com.drmp.dto.response.CasePackageListResponse;
import com.drmp.dto.response.CasePackageStatisticsResponse;
import com.drmp.entity.enums.CasePackageStatus;
import com.drmp.service.CasePackageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Case Package Controller
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/v1/case-packages")
@RequiredArgsConstructor
@Validated
@Tag(name = "案件包管理", description = "案件包相关API")
public class CasePackageController {

    private final CasePackageService casePackageService;

    @Operation(summary = "创建案件包", description = "创建新的案件包")
    @PostMapping
    @PreAuthorize("hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<CasePackageDetailResponse>> createCasePackage(
            @Valid @RequestBody CasePackageCreateRequest request) {
        log.info("Creating case package: {}", request.getPackageName());
        
        CasePackageDetailResponse response = casePackageService.createCasePackage(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "更新案件包", description = "更新案件包信息")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<CasePackageDetailResponse>> updateCasePackage(
            @PathVariable Long id,
            @Valid @RequestBody CasePackageUpdateRequest request) {
        log.info("Updating case package: {}", id);
        
        CasePackageDetailResponse response = casePackageService.updateCasePackage(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "删除案件包", description = "删除案件包")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteCasePackage(@PathVariable Long id) {
        log.info("Deleting case package: {}", id);
        
        casePackageService.deleteCasePackage(id);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Operation(summary = "获取案件包详情", description = "根据ID获取案件包详细信息")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CASE_VIEWER') or hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<CasePackageDetailResponse>> getCasePackageDetail(@PathVariable Long id) {
        CasePackageDetailResponse response = casePackageService.getCasePackageDetail(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "分页查询案件包列表", description = "根据条件分页查询案件包列表")
    @GetMapping
    @PreAuthorize("hasRole('CASE_VIEWER') or hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<Page<CasePackageListResponse>>> getCasePackageList(
            @Parameter(description = "关键词搜索") @RequestParam(required = false) String keyword,
            @Parameter(description = "状态筛选") @RequestParam(required = false) CasePackageStatus status,
            @Parameter(description = "案源机构ID") @RequestParam(required = false) Long sourceOrgId,
            @Parameter(description = "处置机构ID") @RequestParam(required = false) Long disposalOrgId,
            @Parameter(description = "页码，从0开始") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "排序字段") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "排序方向") @RequestParam(defaultValue = "desc") String sortDir) {
        
        CasePackageQueryRequest queryRequest = new CasePackageQueryRequest();
        queryRequest.setKeyword(keyword);
        queryRequest.setStatus(status);
        queryRequest.setSourceOrgId(sourceOrgId);
        queryRequest.setDisposalOrgId(disposalOrgId);
        
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        
        Page<CasePackageListResponse> response = casePackageService.getCasePackageList(queryRequest, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "发布案件包", description = "将案件包发布到市场")
    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<CasePackageDetailResponse>> publishCasePackage(@PathVariable Long id) {
        log.info("Publishing case package: {}", id);
        
        CasePackageDetailResponse response = casePackageService.publishCasePackage(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "撤回案件包", description = "从市场撤回案件包")
    @PostMapping("/{id}/withdraw")
    @PreAuthorize("hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<CasePackageDetailResponse>> withdrawCasePackage(@PathVariable Long id) {
        log.info("Withdrawing case package: {}", id);
        
        CasePackageDetailResponse response = casePackageService.withdrawCasePackage(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "分配案件包", description = "将案件包分配给处置机构")
    @PostMapping("/{id}/assign")
    @PreAuthorize("hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<CasePackageDetailResponse>> assignCasePackage(
            @PathVariable Long id,
            @RequestParam @NotNull Long disposalOrgId) {
        log.info("Assigning case package {} to organization {}", id, disposalOrgId);
        
        CasePackageDetailResponse response = casePackageService.assignCasePackage(id, disposalOrgId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "接受案件包", description = "处置机构接受案件包分配")
    @PostMapping("/{id}/accept")
    @PreAuthorize("hasRole('DISPOSAL_MANAGER')")
    public ResponseEntity<ApiResponse<CasePackageDetailResponse>> acceptCasePackage(@PathVariable Long id) {
        log.info("Accepting case package: {}", id);
        
        CasePackageDetailResponse response = casePackageService.acceptCasePackage(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "拒绝案件包", description = "处置机构拒绝案件包分配")
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('DISPOSAL_MANAGER')")
    public ResponseEntity<ApiResponse<CasePackageDetailResponse>> rejectCasePackage(
            @PathVariable Long id,
            @RequestParam String reason) {
        log.info("Rejecting case package: {} with reason: {}", id, reason);
        
        CasePackageDetailResponse response = casePackageService.rejectCasePackage(id, reason);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "完成案件包", description = "标记案件包处置完成")
    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('DISPOSAL_MANAGER') or hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<CasePackageDetailResponse>> completeCasePackage(@PathVariable Long id) {
        log.info("Completing case package: {}", id);
        
        CasePackageDetailResponse response = casePackageService.completeCasePackage(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "批量导入案件", description = "从Excel/CSV文件批量导入案件到案件包")
    @PostMapping("/{id}/import-cases")
    @PreAuthorize("hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> batchImportCases(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        log.info("Batch importing cases for package: {} with file: {}", id, file.getOriginalFilename());
        
        CompletableFuture<CasePackageService.BatchImportResult> future = 
            casePackageService.batchImportCases(id, file);
        
        // 返回任务ID，客户端可以通过WebSocket或轮询获取进度
        return ResponseEntity.ok(ApiResponse.successWithMessage("导入任务已启动，请稍后查看结果"));
    }

    @Operation(summary = "获取案件包统计", description = "获取案件包统计信息")
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('CASE_VIEWER') or hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<CasePackageStatisticsResponse>> getCasePackageStatistics(
            @RequestParam(required = false) Long organizationId) {
        
        CasePackageStatisticsResponse response = casePackageService.getCasePackageStatistics(organizationId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "获取案件市场列表", description = "获取已发布且未分配的案件包列表")
    @GetMapping("/market")
    @PreAuthorize("hasRole('DISPOSAL_VIEWER') or hasRole('DISPOSAL_MANAGER')")
    public ResponseEntity<ApiResponse<Page<CasePackageListResponse>>> getMarketCasePackages(
            @Parameter(description = "最小金额") @RequestParam(required = false) Double minAmount,
            @Parameter(description = "最大金额") @RequestParam(required = false) Double maxAmount,
            @Parameter(description = "最小逾期天数") @RequestParam(required = false) Integer minOverdueDays,
            @Parameter(description = "最大逾期天数") @RequestParam(required = false) Integer maxOverdueDays,
            @Parameter(description = "页码，从0开始") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "排序字段") @RequestParam(defaultValue = "publishedAt") String sortBy,
            @Parameter(description = "排序方向") @RequestParam(defaultValue = "desc") String sortDir) {
        
        CasePackageQueryRequest queryRequest = new CasePackageQueryRequest();
        queryRequest.setMinAmount(minAmount);
        queryRequest.setMaxAmount(maxAmount);
        queryRequest.setMinOverdueDays(minOverdueDays);
        queryRequest.setMaxOverdueDays(maxOverdueDays);
        
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        
        Page<CasePackageListResponse> response = casePackageService.getMarketCasePackages(queryRequest, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "申请案件包", description = "处置机构申请承接案件包")
    @PostMapping("/{id}/apply")
    @PreAuthorize("hasRole('DISPOSAL_MANAGER')")
    public ResponseEntity<ApiResponse<String>> applyCasePackage(
            @PathVariable Long id,
            @RequestParam String proposal) {
        log.info("Applying for case package: {} with proposal: {}", id, proposal);
        
        String applicationId = casePackageService.applyCasePackage(id, proposal);
        return ResponseEntity.ok(ApiResponse.success(applicationId, "申请已提交"));
    }

    @Operation(summary = "获取机构案件包历史", description = "获取指定机构的案件包历史记录")
    @GetMapping("/organization/{organizationId}/history")
    @PreAuthorize("hasRole('CASE_VIEWER') or hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<Page<CasePackageListResponse>>> getOrganizationCasePackageHistory(
            @PathVariable Long organizationId,
            @RequestParam(required = false) CasePackageStatus status,
            @Parameter(description = "页码，从0开始") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "排序字段") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "排序方向") @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        
        Page<CasePackageListResponse> response = casePackageService.getOrganizationCasePackageHistory(
            organizationId, status, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "智能分案", description = "根据规则智能推荐处置机构")
    @PostMapping("/{id}/smart-assign")
    @PreAuthorize("hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<List<String>>> smartAssignCasePackage(@PathVariable Long id) {
        log.info("Smart assigning case package: {}", id);
        
        List<String> recommendations = casePackageService.smartAssignCasePackage(id);
        return ResponseEntity.ok(ApiResponse.success(recommendations));
    }

    @Operation(summary = "批量操作案件包", description = "批量执行案件包操作")
    @PostMapping("/batch-operation")
    @PreAuthorize("hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<CasePackageService.BatchOperationResult>> batchOperateCasePackages(
            @RequestParam List<Long> ids,
            @RequestParam String action) {
        log.info("Batch operating case packages: {} with action: {}", ids, action);
        
        CasePackageService.BatchOperationResult result = casePackageService.batchOperateCasePackages(ids, action);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}