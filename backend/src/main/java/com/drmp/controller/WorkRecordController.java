package com.drmp.controller;

import com.drmp.dto.request.WorkRecordCreateRequest;
import com.drmp.dto.request.WorkRecordUpdateRequest;
import com.drmp.dto.request.WorkRecordQueryRequest;
import com.drmp.dto.response.ApiResponse;
import com.drmp.dto.response.PageResponse;
import com.drmp.dto.response.WorkRecordResponse;
import com.drmp.service.WorkRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/**
 * 作业记录控制器
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@Tag(name = "作业记录管理", description = "处置人员作业记录的增删改查")
@RestController
@RequestMapping("/api/v1/work-records")
@RequiredArgsConstructor
public class WorkRecordController {

    private final WorkRecordService workRecordService;

    @Operation(summary = "创建作业记录", description = "创建新的案件作业记录")
    @PostMapping
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<WorkRecordResponse> createWorkRecord(@Valid @RequestBody WorkRecordCreateRequest request) {
        WorkRecordResponse response = workRecordService.createWorkRecord(request);
        return ApiResponse.success(response);
    }

    @Operation(summary = "更新作业记录", description = "更新指定的作业记录")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<WorkRecordResponse> updateWorkRecord(
            @PathVariable Long id,
            @Valid @RequestBody WorkRecordUpdateRequest request) {
        WorkRecordResponse response = workRecordService.updateWorkRecord(id, request);
        return ApiResponse.success(response);
    }

    @Operation(summary = "删除作业记录", description = "软删除指定的作业记录")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<Void> deleteWorkRecord(@PathVariable Long id) {
        workRecordService.deleteWorkRecord(id);
        return ApiResponse.success();
    }

    @Operation(summary = "获取作业记录详情", description = "根据ID获取作业记录详情")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<WorkRecordResponse> getWorkRecord(@PathVariable Long id) {
        WorkRecordResponse response = workRecordService.getWorkRecord(id);
        return ApiResponse.success(response);
    }

    @Operation(summary = "分页查询作业记录", description = "根据条件分页查询作业记录")
    @GetMapping
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<PageResponse<WorkRecordResponse>> queryWorkRecords(
            @Valid WorkRecordQueryRequest request,
            Pageable pageable) {
        PageResponse<WorkRecordResponse> response = workRecordService.queryWorkRecords(request, pageable);
        return ApiResponse.success(response);
    }

    @Operation(summary = "获取案件的所有作业记录", description = "获取指定案件的所有作业记录")
    @GetMapping("/case/{caseId}")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<List<WorkRecordResponse>> getCaseWorkRecords(@PathVariable Long caseId) {
        List<WorkRecordResponse> response = workRecordService.getCaseWorkRecords(caseId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "获取需要跟进的记录", description = "获取当前用户需要跟进的作业记录")
    @GetMapping("/follow-ups")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<List<WorkRecordResponse>> getFollowUpRecords() {
        List<WorkRecordResponse> response = workRecordService.getFollowUpRecords();
        return ApiResponse.success(response);
    }

    @Operation(summary = "批量创建作业记录", description = "批量创建多个案件的作业记录")
    @PostMapping("/batch")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<List<WorkRecordResponse>> batchCreateWorkRecords(
            @Valid @RequestBody List<WorkRecordCreateRequest> requests) {
        List<WorkRecordResponse> response = workRecordService.batchCreateWorkRecords(requests);
        return ApiResponse.success(response);
    }

    @Operation(summary = "获取作业记录统计", description = "获取指定案件或处置人员的作业记录统计信息")
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<Object> getWorkRecordStatistics(
            @RequestParam(required = false) Long caseId,
            @RequestParam(required = false) Long handlerId) {
        Object response = workRecordService.getWorkRecordStatistics(caseId, handlerId);
        return ApiResponse.success(response);
    }
}