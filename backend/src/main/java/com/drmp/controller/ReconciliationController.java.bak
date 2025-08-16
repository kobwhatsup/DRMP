package com.drmp.controller;

import com.drmp.dto.request.ReconciliationQueryRequest;
import com.drmp.dto.request.ReconciliationCreateRequest;
import com.drmp.dto.request.DisputeCreateRequest;
import com.drmp.dto.response.ApiResponse;
import com.drmp.dto.response.ReconciliationResponse;
import com.drmp.dto.response.DisputeResponse;
import com.drmp.service.ReconciliationService;
import com.drmp.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * 对账协调控制器
 * 处理对账、异议、争议解决等功能
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/v1/reconciliation")
@RequiredArgsConstructor
@Validated
@Tag(name = "对账协调", description = "对账、异议处理、争议解决功能")
public class ReconciliationController {

    private final ReconciliationService reconciliationService;

    @Operation(summary = "创建对账单", description = "为指定案件包创建对账单")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<ReconciliationResponse>> createReconciliation(
            @Parameter(description = "对账单信息") @Valid @RequestBody ReconciliationCreateRequest request) {
        
        log.info("Creating reconciliation for case package: {}", request.getCasePackageId());
        request.setCreatedBy(SecurityUtils.getCurrentUserId());
        ReconciliationResponse result = reconciliationService.createReconciliation(request);
        
        return ResponseEntity.ok(ApiResponse.success(result, "对账单创建成功"));
    }

    @Operation(summary = "获取对账单列表", description = "分页查询对账单列表")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<Page<ReconciliationResponse>>> getReconciliationList(
            @Parameter(description = "查询参数") @Valid ReconciliationQueryRequest request) {
        
        log.info("Getting reconciliation list with request: {}", request);
        Page<ReconciliationResponse> result = reconciliationService.getReconciliationList(request);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "获取对账单详情", description = "获取指定对账单的详细信息")
    @GetMapping("/{reconciliationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<ReconciliationResponse>> getReconciliationDetail(
            @Parameter(description = "对账单ID") @PathVariable Long reconciliationId) {
        
        log.info("Getting reconciliation detail: {}", reconciliationId);
        ReconciliationResponse result = reconciliationService.getReconciliationDetail(reconciliationId);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "确认对账单", description = "确认对账单数据正确")
    @PostMapping("/{reconciliationId}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<ReconciliationResponse>> confirmReconciliation(
            @Parameter(description = "对账单ID") @PathVariable Long reconciliationId,
            @Parameter(description = "确认备注") @RequestParam(required = false) String confirmNote) {
        
        log.info("Confirming reconciliation: {}", reconciliationId);
        ReconciliationResponse result = reconciliationService.confirmReconciliation(
            reconciliationId, confirmNote, SecurityUtils.getCurrentUserId());
        
        return ResponseEntity.ok(ApiResponse.success(result, "对账单确认成功"));
    }

    @Operation(summary = "拒绝对账单", description = "拒绝对账单并说明原因")
    @PostMapping("/{reconciliationId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<ReconciliationResponse>> rejectReconciliation(
            @Parameter(description = "对账单ID") @PathVariable Long reconciliationId,
            @Parameter(description = "拒绝原因") @RequestParam String rejectReason) {
        
        log.info("Rejecting reconciliation: {}, reason: {}", reconciliationId, rejectReason);
        ReconciliationResponse result = reconciliationService.rejectReconciliation(
            reconciliationId, rejectReason, SecurityUtils.getCurrentUserId());
        
        return ResponseEntity.ok(ApiResponse.success(result, "对账单拒绝成功"));
    }

    @Operation(summary = "创建异议", description = "对对账单数据提出异议")
    @PostMapping("/{reconciliationId}/disputes")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<DisputeResponse>> createDispute(
            @Parameter(description = "对账单ID") @PathVariable Long reconciliationId,
            @Parameter(description = "异议信息") @Valid @RequestBody DisputeCreateRequest request) {
        
        log.info("Creating dispute for reconciliation: {}", reconciliationId);
        request.setReconciliationId(reconciliationId);
        request.setCreatedBy(SecurityUtils.getCurrentUserId());
        DisputeResponse result = reconciliationService.createDispute(request);
        
        return ResponseEntity.ok(ApiResponse.success(result, "异议提交成功"));
    }

    @Operation(summary = "获取异议列表", description = "获取指定对账单的异议列表")
    @GetMapping("/{reconciliationId}/disputes")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<List<DisputeResponse>>> getDisputeList(
            @Parameter(description = "对账单ID") @PathVariable Long reconciliationId) {
        
        log.info("Getting dispute list for reconciliation: {}", reconciliationId);
        List<DisputeResponse> result = reconciliationService.getDisputesByReconciliation(reconciliationId);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "处理异议", description = "处理异议并给出解决方案")
    @PostMapping("/disputes/{disputeId}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLATFORM_MANAGER')")
    public ResponseEntity<ApiResponse<DisputeResponse>> resolveDispute(
            @Parameter(description = "异议ID") @PathVariable Long disputeId,
            @Parameter(description = "解决方案") @RequestParam String resolution,
            @Parameter(description = "解决说明") @RequestParam(required = false) String resolutionNote) {
        
        log.info("Resolving dispute: {}, resolution: {}", disputeId, resolution);
        DisputeResponse result = reconciliationService.resolveDispute(
            disputeId, resolution, resolutionNote, SecurityUtils.getCurrentUserId());
        
        return ResponseEntity.ok(ApiResponse.success(result, "异议处理完成"));
    }

    @Operation(summary = "自动对账", description = "系统自动对账并生成对账单")
    @PostMapping("/auto-reconcile")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_SCHEDULER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> autoReconcile(
            @Parameter(description = "案件包ID列表") @RequestParam List<Long> casePackageIds,
            @Parameter(description = "对账周期") @RequestParam String reconciliationPeriod) {
        
        log.info("Auto reconciling case packages: {}, period: {}", casePackageIds, reconciliationPeriod);
        Map<String, Object> result = reconciliationService.autoReconcile(casePackageIds, reconciliationPeriod);
        
        return ResponseEntity.ok(ApiResponse.success(result, "自动对账完成"));
    }

    @Operation(summary = "批量确认对账", description = "批量确认多个对账单")
    @PostMapping("/batch-confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> batchConfirmReconciliation(
            @Parameter(description = "对账单ID列表") @RequestBody List<Long> reconciliationIds,
            @Parameter(description = "确认备注") @RequestParam(required = false) String confirmNote) {
        
        log.info("Batch confirming reconciliations: {}", reconciliationIds);
        Map<String, Object> result = reconciliationService.batchConfirmReconciliation(
            reconciliationIds, confirmNote, SecurityUtils.getCurrentUserId());
        
        return ResponseEntity.ok(ApiResponse.success(result, "批量确认完成"));
    }

    @Operation(summary = "导出对账单", description = "导出对账单数据到Excel")
    @GetMapping("/{reconciliationId}/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<byte[]> exportReconciliation(
            @Parameter(description = "对账单ID") @PathVariable Long reconciliationId,
            @Parameter(description = "导出格式") @RequestParam(defaultValue = "excel") String format) {
        
        log.info("Exporting reconciliation: {}, format: {}", reconciliationId, format);
        byte[] reportData = reconciliationService.exportReconciliation(reconciliationId, format);
        
        String fileName = String.format("reconciliation_%d.%s", reconciliationId, format);
        
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=" + fileName)
                .header("Content-Type", "application/octet-stream")
                .body(reportData);
    }

    @Operation(summary = "上传对账凭证", description = "上传对账相关的凭证文件")
    @PostMapping("/{reconciliationId}/upload-evidence")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<String>> uploadReconciliationEvidence(
            @Parameter(description = "对账单ID") @PathVariable Long reconciliationId,
            @Parameter(description = "凭证文件") @RequestParam("file") MultipartFile file,
            @Parameter(description = "凭证类型") @RequestParam String evidenceType,
            @Parameter(description = "凭证说明") @RequestParam(required = false) String description) {
        
        log.info("Uploading evidence for reconciliation: {}, type: {}", reconciliationId, evidenceType);
        String fileUrl = reconciliationService.uploadReconciliationEvidence(
            reconciliationId, file, evidenceType, description, SecurityUtils.getCurrentUserId());
        
        return ResponseEntity.ok(ApiResponse.success(fileUrl, "凭证上传成功"));
    }

    @Operation(summary = "获取对账统计", description = "获取对账相关的统计数据")
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReconciliationStatistics(
            @Parameter(description = "机构ID") @RequestParam(required = false) Long organizationId,
            @Parameter(description = "开始日期") @RequestParam(required = false) String startDate,
            @Parameter(description = "结束日期") @RequestParam(required = false) String endDate) {
        
        log.info("Getting reconciliation statistics for org: {}, period: {} to {}", 
            organizationId, startDate, endDate);
        Map<String, Object> result = reconciliationService.getReconciliationStatistics(
            organizationId, startDate, endDate);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "发送对账提醒", description = "发送对账确认提醒通知")
    @PostMapping("/{reconciliationId}/send-reminder")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> sendReconciliationReminder(
            @Parameter(description = "对账单ID") @PathVariable Long reconciliationId,
            @Parameter(description = "提醒内容") @RequestParam(required = false) String reminderContent) {
        
        log.info("Sending reconciliation reminder: {}", reconciliationId);
        reconciliationService.sendReconciliationReminder(reconciliationId, reminderContent);
        
        return ResponseEntity.ok(ApiResponse.successWithMessage("提醒发送成功"));
    }

    @Operation(summary = "获取待处理对账", description = "获取需要当前用户处理的对账单")
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<List<ReconciliationResponse>>> getPendingReconciliations() {
        
        Long currentUserId = SecurityUtils.getCurrentUserId();
        log.info("Getting pending reconciliations for user: {}", currentUserId);
        List<ReconciliationResponse> result = reconciliationService.getPendingReconciliations(currentUserId);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "生成对账差异报告", description = "生成对账数据的差异分析报告")
    @PostMapping("/{reconciliationId}/diff-report")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateDifferenceReport(
            @Parameter(description = "对账单ID") @PathVariable Long reconciliationId) {
        
        log.info("Generating difference report for reconciliation: {}", reconciliationId);
        Map<String, Object> result = reconciliationService.generateDifferenceReport(reconciliationId);
        
        return ResponseEntity.ok(ApiResponse.success(result, "差异报告生成成功"));
    }
}