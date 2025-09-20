package com.drmp.controller.system;

import com.drmp.dto.request.system.OperationLogQueryRequest;
import com.drmp.dto.response.ApiResponse;
import com.drmp.dto.response.system.OperationLogResponse;
import com.drmp.service.system.OperationLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 操作日志控制器
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/system/operation-logs")
@RequiredArgsConstructor
public class OperationLogController {

    private final OperationLogService operationLogService;

    /**
     * 分页查询操作日志
     */
    @GetMapping
    public ApiResponse<Page<OperationLogResponse>> getOperationLogs(@Valid OperationLogQueryRequest request) {
        Page<OperationLogResponse> logs = operationLogService.findOperationLogs(request);
        return ApiResponse.success(logs);
    }

    /**
     * 根据ID获取操作日志详情
     */
    @GetMapping("/{id}")
    public ApiResponse<OperationLogResponse> getOperationLogById(@PathVariable Long id) {
        OperationLogResponse log = operationLogService.getOperationLogById(id);
        return ApiResponse.success(log);
    }

    /**
     * 获取用户操作日志
     */
    @GetMapping("/user/{userId}")
    public ApiResponse<Page<OperationLogResponse>> getUserOperationLogs(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<OperationLogResponse> logs = operationLogService.getUserOperationLogs(userId, page, size);
        return ApiResponse.success(logs);
    }

    /**
     * 获取最近的操作日志
     */
    @GetMapping("/recent")
    public ApiResponse<List<OperationLogResponse>> getRecentOperationLogs(
            @RequestParam(defaultValue = "10") int limit) {
        List<OperationLogResponse> logs = operationLogService.getRecentOperationLogs(limit);
        return ApiResponse.success(logs);
    }

    /**
     * 获取操作日志统计
     */
    @GetMapping("/statistics")
    public ApiResponse<Map<String, Object>> getOperationLogStatistics(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        Map<String, Object> statistics = operationLogService.getOperationLogStatistics(startTime, endTime);
        return ApiResponse.success(statistics);
    }

    /**
     * 获取操作趋势数据
     */
    @GetMapping("/trend")
    public ApiResponse<List<Map<String, Object>>> getOperationTrend(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        List<Map<String, Object>> trend = operationLogService.getOperationTrend(startTime, endTime);
        return ApiResponse.success(trend);
    }

    /**
     * 获取活跃用户统计
     */
    @GetMapping("/active-users")
    public ApiResponse<List<Map<String, Object>>> getActiveUserStats(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        List<Map<String, Object>> stats = operationLogService.getActiveUserStats(startTime, endTime);
        return ApiResponse.success(stats);
    }

    /**
     * 获取模块操作统计
     */
    @GetMapping("/module-stats")
    public ApiResponse<List<Map<String, Object>>> getModuleOperationStats(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        List<Map<String, Object>> stats = operationLogService.getModuleOperationStats(startTime, endTime);
        return ApiResponse.success(stats);
    }

    /**
     * 清理过期日志
     */
    @DeleteMapping("/clean")
    public ApiResponse<Integer> cleanExpiredLogs(
            @RequestParam(defaultValue = "90") int retentionDays) {
        int deletedCount = operationLogService.cleanExpiredLogs(retentionDays);
        return ApiResponse.success(deletedCount);
    }

    /**
     * 导出操作日志
     */
    @PostMapping("/export")
    public ApiResponse<Void> exportOperationLogs(@Valid @RequestBody OperationLogQueryRequest request) {
        String filePath = "/tmp/operation_logs_" + System.currentTimeMillis() + ".xlsx";
        operationLogService.exportOperationLogs(request, filePath);
        return ApiResponse.success();
    }

    /**
     * 批量删除操作日志
     */
    @DeleteMapping("/batch")
    public ApiResponse<Void> deleteOperationLogs(@RequestBody List<Long> ids) {
        operationLogService.deleteOperationLogs(ids);
        return ApiResponse.success();
    }

    /**
     * 获取操作日志概览
     */
    @GetMapping("/overview")
    public ApiResponse<Map<String, Object>> getOperationLogOverview() {
        LocalDateTime endTime = LocalDateTime.now();
        LocalDateTime startTime = endTime.minusDays(7); // 最近7天
        
        Map<String, Object> overview = operationLogService.getOperationLogStatistics(startTime, endTime);
        List<Map<String, Object>> trend = operationLogService.getOperationTrend(startTime, endTime);
        List<Map<String, Object>> recentLogs = operationLogService.getRecentOperationLogs(5)
            .stream()
            .map(log -> {
                Map<String, Object> item = new java.util.HashMap<>();
                item.put("username", log.getUsername());
                item.put("operationType", log.getOperationTypeDesc());
                item.put("moduleName", log.getModuleName());
                item.put("operatedAt", log.getOperatedAt());
                item.put("operationStatus", log.getOperationStatusDesc());
                return item;
            })
            .collect(java.util.stream.Collectors.toList());
        
        overview.put("trend", trend);
        overview.put("recentLogs", recentLogs);
        
        return ApiResponse.success(overview);
    }
}