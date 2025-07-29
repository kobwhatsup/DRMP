package com.drmp.controller;

import com.drmp.dto.response.ApiResponse;
import com.drmp.entity.CaseFlowRecord;
import com.drmp.entity.enums.CaseFlowEvent;
import com.drmp.entity.enums.CasePackageStatus;
import com.drmp.service.CaseFlowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 案件流转控制器
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/case-flow")
@RequiredArgsConstructor
@Validated
@Tag(name = "案件流转管理", description = "案件流转记录相关API")
public class CaseFlowController {

    private final CaseFlowService caseFlowService;

    @Operation(summary = "记录案件包事件", description = "记录案件包的流转事件")
    @PostMapping("/package-event")
    @PreAuthorize("hasRole('CASE_MANAGER') or hasRole('DISPOSAL_MANAGER')")
    public ResponseEntity<ApiResponse<CaseFlowRecord>> recordPackageEvent(
            @RequestParam Long casePackageId,
            @RequestParam CaseFlowEvent eventType,
            @RequestParam String description,
            @RequestParam Long operatorId,
            @RequestParam String operatorName) {
        
        log.info("Recording package event for case package {}: {}", casePackageId, eventType);
        
        CaseFlowRecord record = caseFlowService.recordPackageEvent(
            casePackageId, eventType, description, operatorId, operatorName);
        
        return ResponseEntity.ok(ApiResponse.success(record));
    }

    @Operation(summary = "记录个案事件", description = "记录个案的流转事件")
    @PostMapping("/case-event")
    @PreAuthorize("hasRole('DISPOSAL_MANAGER') or hasRole('DISPOSAL_OPERATOR')")
    public ResponseEntity<ApiResponse<CaseFlowRecord>> recordCaseEvent(
            @RequestParam Long casePackageId,
            @RequestParam Long caseId,
            @RequestParam CaseFlowEvent eventType,
            @RequestParam String description,
            @RequestParam Long operatorId,
            @RequestParam String operatorName) {
        
        log.info("Recording case event for case {}: {}", caseId, eventType);
        
        CaseFlowRecord record = caseFlowService.recordCaseEvent(
            casePackageId, caseId, eventType, description, operatorId, operatorName);
        
        return ResponseEntity.ok(ApiResponse.success(record));
    }

    @Operation(summary = "记录财务事件", description = "记录涉及金额的财务事件")
    @PostMapping("/financial-event")
    @PreAuthorize("hasRole('CASE_MANAGER') or hasRole('DISPOSAL_MANAGER')")
    public ResponseEntity<ApiResponse<CaseFlowRecord>> recordFinancialEvent(
            @RequestParam Long casePackageId,
            @RequestParam CaseFlowEvent eventType,
            @RequestParam BigDecimal amount,
            @RequestParam String description,
            @RequestParam Long operatorId,
            @RequestParam String operatorName) {
        
        log.info("Recording financial event for case package {}: {} with amount {}", 
                casePackageId, eventType, amount);
        
        CaseFlowRecord record = caseFlowService.recordFinancialEvent(
            casePackageId, eventType, amount, description, operatorId, operatorName);
        
        return ResponseEntity.ok(ApiResponse.success(record));
    }

    @Operation(summary = "获取案件包流转记录", description = "分页查询案件包的流转记录")
    @GetMapping("/package/{casePackageId}")
    @PreAuthorize("hasRole('CASE_VIEWER') or hasRole('CASE_MANAGER') or hasRole('DISPOSAL_VIEWER')")
    public ResponseEntity<ApiResponse<Page<CaseFlowRecord>>> getCasePackageFlowRecords(
            @PathVariable Long casePackageId,
            @Parameter(description = "页码，从0开始") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<CaseFlowRecord> records = caseFlowService.getCasePackageFlowRecords(casePackageId, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @Operation(summary = "获取个案流转记录", description = "分页查询个案的流转记录")
    @GetMapping("/case/{caseId}")
    @PreAuthorize("hasRole('DISPOSAL_VIEWER') or hasRole('DISPOSAL_MANAGER')")
    public ResponseEntity<ApiResponse<Page<CaseFlowRecord>>> getCaseFlowRecords(
            @PathVariable Long caseId,
            @Parameter(description = "页码，从0开始") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<CaseFlowRecord> records = caseFlowService.getCaseFlowRecords(caseId, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @Operation(summary = "获取案件包时间线", description = "获取案件包的完整处置时间线")
    @GetMapping("/timeline/{casePackageId}")
    @PreAuthorize("hasRole('CASE_VIEWER') or hasRole('CASE_MANAGER') or hasRole('DISPOSAL_VIEWER')")
    public ResponseEntity<ApiResponse<List<CaseFlowService.FlowTimelineItem>>> getCasePackageTimeline(
            @PathVariable Long casePackageId) {
        
        List<CaseFlowService.FlowTimelineItem> timeline = caseFlowService.getCasePackageTimeline(casePackageId);
        
        return ResponseEntity.ok(ApiResponse.success(timeline));
    }

    @Operation(summary = "按事件类型查询流转记录", description = "根据事件类型和时间范围查询流转记录")
    @GetMapping("/events")
    @PreAuthorize("hasRole('CASE_VIEWER') or hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<Page<CaseFlowRecord>>> getFlowRecordsByEventType(
            @RequestParam List<CaseFlowEvent> eventTypes,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @Parameter(description = "页码，从0开始") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<CaseFlowRecord> records = caseFlowService.getFlowRecordsByEventType(
            eventTypes, startTime, endTime, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @Operation(summary = "获取机构流转记录", description = "查询指定机构的流转记录")
    @GetMapping("/organization/{organizationId}")
    @PreAuthorize("hasRole('CASE_VIEWER') or hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<Page<CaseFlowRecord>>> getOrganizationFlowRecords(
            @PathVariable Long organizationId,
            @RequestParam(required = false) List<CaseFlowEvent> eventTypes,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @Parameter(description = "页码，从0开始") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<CaseFlowRecord> records = caseFlowService.getOrganizationFlowRecords(
            organizationId, eventTypes, startTime, endTime, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @Operation(summary = "检查状态转换有效性", description = "检查案件包状态转换是否合法")
    @GetMapping("/validate-transition")
    @PreAuthorize("hasRole('CASE_MANAGER') or hasRole('DISPOSAL_MANAGER')")
    public ResponseEntity<ApiResponse<Boolean>> validateStatusTransition(
            @RequestParam CasePackageStatus currentStatus,
            @RequestParam CasePackageStatus targetStatus,
            @RequestParam CaseFlowEvent eventType) {
        
        boolean isValid = caseFlowService.isValidStatusTransition(currentStatus, targetStatus, eventType);
        
        return ResponseEntity.ok(ApiResponse.success(isValid));
    }

    @Operation(summary = "获取可能的下一步状态", description = "获取指定状态的下一步可能状态")
    @GetMapping("/possible-next-statuses")
    @PreAuthorize("hasRole('CASE_MANAGER') or hasRole('DISPOSAL_MANAGER')")
    public ResponseEntity<ApiResponse<List<CasePackageStatus>>> getPossibleNextStatuses(
            @RequestParam CasePackageStatus currentStatus) {
        
        List<CasePackageStatus> nextStatuses = caseFlowService.getPossibleNextStatuses(currentStatus);
        
        return ResponseEntity.ok(ApiResponse.success(nextStatuses));
    }

    @Operation(summary = "获取状态转换所需事件", description = "获取从当前状态转换到目标状态所需的事件")
    @GetMapping("/required-event")
    @PreAuthorize("hasRole('CASE_MANAGER') or hasRole('DISPOSAL_MANAGER')")
    public ResponseEntity<ApiResponse<CaseFlowEvent>> getRequiredEventForTransition(
            @RequestParam CasePackageStatus currentStatus,
            @RequestParam CasePackageStatus targetStatus) {
        
        CaseFlowEvent requiredEvent = caseFlowService.getRequiredEventForTransition(currentStatus, targetStatus);
        
        return ResponseEntity.ok(ApiResponse.success(requiredEvent));
    }

    @Operation(summary = "获取流转统计", description = "获取指定时间范围内的流转统计数据")
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('CASE_VIEWER') or hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<CaseFlowService.FlowStatistics>> getFlowStatistics(
            @RequestParam(required = false) Long organizationId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        
        CaseFlowService.FlowStatistics statistics = caseFlowService.getFlowStatistics(
            organizationId, startTime, endTime);
        
        return ResponseEntity.ok(ApiResponse.success(statistics));
    }

    @Operation(summary = "批量导入流转记录", description = "批量导入流转记录数据")
    @PostMapping("/batch-import")
    @PreAuthorize("hasRole('CASE_MANAGER')")
    public ResponseEntity<ApiResponse<CaseFlowService.BatchImportResult>> batchImportFlowRecords(
            @RequestBody List<CaseFlowRecord> records) {
        
        log.info("Batch importing {} flow records", records.size());
        
        CaseFlowService.BatchImportResult result = caseFlowService.batchImportFlowRecords(records);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}