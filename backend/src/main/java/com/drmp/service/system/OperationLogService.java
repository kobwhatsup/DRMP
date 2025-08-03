package com.drmp.service.system;

import com.drmp.dto.request.system.OperationLogQueryRequest;
import com.drmp.dto.response.system.OperationLogResponse;
import com.drmp.entity.system.SysOperationLog;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 操作日志服务接口
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public interface OperationLogService {

    /**
     * 记录操作日志
     */
    void saveOperationLog(SysOperationLog operationLog);

    /**
     * 分页查询操作日志
     */
    Page<OperationLogResponse> findOperationLogs(OperationLogQueryRequest request);

    /**
     * 根据ID获取操作日志详情
     */
    OperationLogResponse getOperationLogById(Long id);

    /**
     * 获取用户操作日志
     */
    Page<OperationLogResponse> getUserOperationLogs(Long userId, int page, int size);

    /**
     * 获取最近的操作日志
     */
    List<OperationLogResponse> getRecentOperationLogs(int limit);

    /**
     * 统计操作日志
     */
    Map<String, Object> getOperationLogStatistics(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 获取操作趋势数据
     */
    List<Map<String, Object>> getOperationTrend(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 获取活跃用户统计
     */
    List<Map<String, Object>> getActiveUserStats(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 获取模块操作统计
     */
    List<Map<String, Object>> getModuleOperationStats(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 清理过期日志
     */
    int cleanExpiredLogs(int retentionDays);

    /**
     * 导出操作日志
     */
    void exportOperationLogs(OperationLogQueryRequest request, String filePath);

    /**
     * 批量删除操作日志
     */
    void deleteOperationLogs(List<Long> ids);

    /**
     * 记录用户登录日志
     */
    void saveLoginLog(Long userId, String username, String ip, String userAgent, boolean success, String failureReason);

    /**
     * 记录用户登出日志
     */
    void saveLogoutLog(Long userId, String username, String ip);

    /**
     * 记录系统操作日志
     */
    void saveSystemLog(String operation, String module, String description, Object data);

    /**
     * 异步记录操作日志
     */
    void saveOperationLogAsync(SysOperationLog operationLog);
}