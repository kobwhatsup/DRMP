package com.drmp.controller;

import com.drmp.dto.request.BatchOperationRequest;
import com.drmp.dto.response.ApiResponse;
import com.drmp.dto.response.BatchOperationResponse;
import com.drmp.dto.response.PageResponse;
import com.drmp.entity.BatchOperation;
import com.drmp.service.BatchOperationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/**
 * 批量操作控制器
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@Tag(name = "批量操作管理", description = "案件批量操作功能")
@RestController
@RequestMapping("/api/v1/batch-operations")
@RequiredArgsConstructor
public class BatchOperationController {

    private final BatchOperationService batchOperationService;

    @Operation(summary = "创建批量操作", description = "创建新的批量操作任务")
    @PostMapping
    @PreAuthorize("hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<BatchOperationResponse> createBatchOperation(@Valid @RequestBody BatchOperationRequest request) {
        BatchOperationResponse response = batchOperationService.createBatchOperation(request);
        return ApiResponse.success(response);
    }

    @Operation(summary = "执行批量操作", description = "执行指定的批量操作")
    @PostMapping("/{operationId}/execute")
    @PreAuthorize("hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<BatchOperationResponse> executeBatchOperation(@PathVariable Long operationId) {
        BatchOperationResponse response = batchOperationService.executeBatchOperation(operationId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "异步执行批量操作", description = "异步执行批量操作，适用于大量数据")
    @PostMapping("/{operationId}/execute-async")
    @PreAuthorize("hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<Void> executeBatchOperationAsync(@PathVariable Long operationId) {
        batchOperationService.executeBatchOperationAsync(operationId);
        return ApiResponse.success();
    }

    @Operation(summary = "取消批量操作", description = "取消正在执行的批量操作")
    @PostMapping("/{operationId}/cancel")
    @PreAuthorize("hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<Void> cancelBatchOperation(@PathVariable Long operationId) {
        batchOperationService.cancelBatchOperation(operationId);
        return ApiResponse.success();
    }

    @Operation(summary = "获取批量操作详情", description = "获取批量操作的详细信息")
    @GetMapping("/{operationId}")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<BatchOperationResponse> getBatchOperation(@PathVariable Long operationId) {
        BatchOperationResponse response = batchOperationService.getBatchOperation(operationId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "查询批量操作", description = "分页查询批量操作记录")
    @GetMapping
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<PageResponse<BatchOperationResponse>> queryBatchOperations(
            @RequestParam(required = false) Long organizationId,
            @RequestParam(required = false) BatchOperation.OperationType operationType,
            @RequestParam(required = false) BatchOperation.BatchStatus status,
            Pageable pageable) {
        PageResponse<BatchOperationResponse> response = batchOperationService.queryBatchOperations(
                organizationId, operationType, status, pageable);
        return ApiResponse.success(response);
    }

    @Operation(summary = "获取用户批量操作", description = "获取当前用户的批量操作记录")
    @GetMapping("/my-operations")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<List<BatchOperationResponse>> getUserBatchOperations() {
        // Long userId = SecurityUtils.getCurrentUserId();
        Long userId = 1L; // TODO: 从SecurityUtils获取
        List<BatchOperationResponse> response = batchOperationService.getUserBatchOperations(userId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "重试批量操作", description = "重试失败的批量操作")
    @PostMapping("/{operationId}/retry")
    @PreAuthorize("hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<BatchOperationResponse> retryBatchOperation(@PathVariable Long operationId) {
        BatchOperationResponse response = batchOperationService.retryBatchOperation(operationId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "批量更新案件状态", description = "批量更新多个案件的状态")
    @PostMapping("/case-status-update")
    @PreAuthorize("hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<BatchOperationResponse> batchUpdateCaseStatus(
            @RequestParam List<Long> caseIds,
            @RequestParam String newStatus,
            @RequestParam String reason) {
        BatchOperationResponse response = batchOperationService.batchUpdateCaseStatus(caseIds, newStatus, reason);
        return ApiResponse.success(response);
    }

    @Operation(summary = "批量分配案件", description = "批量分配案件给指定处理人")
    @PostMapping("/case-assignment")
    @PreAuthorize("hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<BatchOperationResponse> batchAssignCases(
            @RequestParam List<Long> caseIds,
            @RequestParam Long assigneeId,
            @RequestParam String reason) {
        BatchOperationResponse response = batchOperationService.batchAssignCases(caseIds, assigneeId, reason);
        return ApiResponse.success(response);
    }

    @Operation(summary = "批量退案", description = "批量退回案件给案源机构")
    @PostMapping("/case-return")
    @PreAuthorize("hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<BatchOperationResponse> batchReturnCases(
            @RequestParam List<Long> caseIds,
            @RequestParam String reason) {
        BatchOperationResponse response = batchOperationService.batchReturnCases(caseIds, reason);
        return ApiResponse.success(response);
    }

    @Operation(summary = "批量留案", description = "批量申请继续留案处理")
    @PostMapping("/case-retain")
    @PreAuthorize("hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<BatchOperationResponse> batchRetainCases(
            @RequestParam List<Long> caseIds,
            @RequestParam String reason) {
        BatchOperationResponse response = batchOperationService.batchRetainCases(caseIds, reason);
        return ApiResponse.success(response);
    }

    @Operation(summary = "批量结案", description = "批量结案处理")
    @PostMapping("/case-close")
    @PreAuthorize("hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<BatchOperationResponse> batchCloseCases(
            @RequestParam List<Long> caseIds,
            @RequestParam String result,
            @RequestParam String reason) {
        BatchOperationResponse response = batchOperationService.batchCloseCases(caseIds, result, reason);
        return ApiResponse.success(response);
    }

    @Operation(summary = "批量添加标签", description = "批量为案件添加标签")
    @PostMapping("/add-tags")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<BatchOperationResponse> batchAddTags(
            @RequestParam List<Long> caseIds,
            @RequestParam List<String> tags) {
        BatchOperationResponse response = batchOperationService.batchAddTags(caseIds, tags);
        return ApiResponse.success(response);
    }

    @Operation(summary = "批量移除标签", description = "批量移除案件标签")
    @PostMapping("/remove-tags")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<BatchOperationResponse> batchRemoveTags(
            @RequestParam List<Long> caseIds,
            @RequestParam List<String> tags) {
        BatchOperationResponse response = batchOperationService.batchRemoveTags(caseIds, tags);
        return ApiResponse.success(response);
    }

    @Operation(summary = "获取批量操作统计", description = "获取批量操作的统计信息")
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<Object> getBatchOperationStatistics(@RequestParam(required = false) Long organizationId) {
        Object response = batchOperationService.getBatchOperationStatistics(organizationId);
        return ApiResponse.success(response);
    }
}