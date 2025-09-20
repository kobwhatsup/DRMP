package com.drmp.controller;

import com.drmp.dto.request.CaseProgressCreateRequest;
import com.drmp.dto.request.CaseProgressQueryRequest;
import com.drmp.dto.response.ApiResponse;
import com.drmp.dto.response.CaseProgressResponse;
import com.drmp.dto.response.ProgressSyncResponse;
import com.drmp.entity.CaseProgress;
import com.drmp.service.CaseProgressService;
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
 * 案件进度协同控制器
 * 处理案件进度跟踪、同步和协同功能
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/v1/case-progress")
@RequiredArgsConstructor
@Validated
@Tag(name = "案件进度协同", description = "案件进度跟踪、同步和协同功能")
public class CaseProgressController {

    private final CaseProgressService caseProgressService;

    @Operation(summary = "获取案件进度列表", description = "分页查询案件进度信息")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'DISPOSAL_HANDLER')")
    public ResponseEntity<ApiResponse<Page<CaseProgressResponse>>> getCaseProgressList(
            @Parameter(description = "查询参数") @Valid CaseProgressQueryRequest request) {
        
        log.info("Getting case progress list, request: {}", request);
        Page<CaseProgressResponse> result = caseProgressService.getCaseProgressList(request);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "获取指定案件的进度详情", description = "获取案件的完整进度跟踪记录")
    @GetMapping("/case/{caseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'DISPOSAL_HANDLER')")
    public ResponseEntity<ApiResponse<List<CaseProgressResponse>>> getCaseProgressByCaseId(
            @Parameter(description = "案件ID") @PathVariable Long caseId) {
        
        log.info("Getting case progress for case: {}", caseId);
        List<CaseProgressResponse> result = caseProgressService.getCaseProgressByCaseId(caseId);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "添加案件进度记录", description = "添加新的案件处置进度记录")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPOSAL_HANDLER')")
    public ResponseEntity<ApiResponse<CaseProgressResponse>> createCaseProgress(
            @Parameter(description = "进度信息") @Valid @RequestBody CaseProgressCreateRequest request) {
        
        log.info("Creating case progress, request: {}", request);
        request.setCreatedBy(SecurityUtils.getCurrentUserId());
        CaseProgressResponse result = caseProgressService.createCaseProgress(request);
        
        return ResponseEntity.ok(ApiResponse.success(result, "进度记录添加成功"));
    }

    @Operation(summary = "批量添加进度记录", description = "批量添加多个案件的进度记录")
    @PostMapping("/batch")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPOSAL_HANDLER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> batchCreateCaseProgress(
            @Parameter(description = "批量进度信息") @Valid @RequestBody List<CaseProgressCreateRequest> requests) {
        
        log.info("Batch creating case progress, count: {}", requests.size());
        Long currentUserId = SecurityUtils.getCurrentUserId();
        requests.forEach(request -> request.setCreatedBy(currentUserId));
        
        Map<String, Object> result = caseProgressService.batchCreateCaseProgress(requests);
        
        return ResponseEntity.ok(ApiResponse.success(result, "批量添加进度记录完成"));
    }

    @Operation(summary = "上传进度附件", description = "上传案件进度相关的附件文件")
    @PostMapping("/{progressId}/attachments")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISPOSAL_HANDLER')")
    public ResponseEntity<ApiResponse<String>> uploadProgressAttachment(
            @Parameter(description = "进度记录ID") @PathVariable Long progressId,
            @Parameter(description = "附件文件") @RequestParam("file") MultipartFile file,
            @Parameter(description = "附件类型") @RequestParam("type") String attachmentType) {
        
        log.info("Uploading progress attachment for progress: {}, type: {}", progressId, attachmentType);
        String fileUrl = caseProgressService.uploadProgressAttachment(progressId, file, attachmentType);
        
        return ResponseEntity.ok(ApiResponse.success(fileUrl, "附件上传成功"));
    }

    @Operation(summary = "同步IDS系统进度", description = "从智调系统同步案件处置进度")
    @PostMapping("/sync/ids")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_INTEGRATOR')")
    public ResponseEntity<ApiResponse<ProgressSyncResponse>> syncProgressFromIDS(
            @Parameter(description = "案件包ID") @RequestParam Long casePackageId,
            @Parameter(description = "强制同步") @RequestParam(defaultValue = "false") Boolean force) {
        
        log.info("Syncing progress from IDS for case package: {}, force: {}", casePackageId, force);
        ProgressSyncResponse result = caseProgressService.syncProgressFromIDS(casePackageId, force);
        
        return ResponseEntity.ok(ApiResponse.success(result, "IDS进度同步完成"));
    }

    @Operation(summary = "获取进度统计信息", description = "获取案件进度的统计分析数据")
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProgressStatistics(
            @Parameter(description = "机构ID") @RequestParam(required = false) Long organizationId,
            @Parameter(description = "开始日期") @RequestParam(required = false) String startDate,
            @Parameter(description = "结束日期") @RequestParam(required = false) String endDate) {
        
        log.info("Getting progress statistics for org: {}, period: {} to {}", organizationId, startDate, endDate);
        Map<String, Object> result = caseProgressService.getProgressStatistics(organizationId, startDate, endDate);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "获取实时进度更新", description = "获取指定时间后的进度更新")
    @GetMapping("/updates")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'DISPOSAL_HANDLER')")
    public ResponseEntity<ApiResponse<List<CaseProgressResponse>>> getProgressUpdates(
            @Parameter(description = "上次更新时间戳") @RequestParam Long lastUpdateTime,
            @Parameter(description = "机构ID") @RequestParam(required = false) Long organizationId) {
        
        log.info("Getting progress updates since: {}, org: {}", lastUpdateTime, organizationId);
        List<CaseProgressResponse> result = caseProgressService.getProgressUpdates(lastUpdateTime, organizationId);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "标记进度为已读", description = "标记进度更新为已读状态")
    @PostMapping("/mark-read")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'DISPOSAL_HANDLER')")
    public ResponseEntity<ApiResponse<Void>> markProgressAsRead(
            @Parameter(description = "进度ID列表") @RequestBody List<Long> progressIds) {
        
        log.info("Marking progress as read: {}", progressIds);
        caseProgressService.markProgressAsRead(progressIds, SecurityUtils.getCurrentUserId());
        
        return ResponseEntity.ok(ApiResponse.successWithMessage("标记已读成功"));
    }

    @Operation(summary = "设置进度提醒", description = "设置案件进度跟进提醒")
    @PostMapping("/reminders")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'DISPOSAL_HANDLER')")
    public ResponseEntity<ApiResponse<Void>> setProgressReminder(
            @Parameter(description = "案件ID") @RequestParam Long caseId,
            @Parameter(description = "提醒时间") @RequestParam String reminderTime,
            @Parameter(description = "提醒内容") @RequestParam String reminderContent) {
        
        log.info("Setting progress reminder for case: {}, time: {}", caseId, reminderTime);
        caseProgressService.setProgressReminder(caseId, reminderTime, reminderContent, SecurityUtils.getCurrentUserId());
        
        return ResponseEntity.ok(ApiResponse.successWithMessage("进度提醒设置成功"));
    }

    @Operation(summary = "导出进度报告", description = "导出案件进度跟踪报告")
    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER')")
    public ResponseEntity<byte[]> exportProgressReport(
            @Parameter(description = "查询参数") @Valid CaseProgressQueryRequest request,
            @Parameter(description = "导出格式") @RequestParam(defaultValue = "excel") String format) {
        
        log.info("Exporting progress report, format: {}", format);
        byte[] reportData = caseProgressService.exportProgressReport(request, format);
        
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=progress_report." + format)
                .header("Content-Type", "application/octet-stream")
                .body(reportData);
    }
}