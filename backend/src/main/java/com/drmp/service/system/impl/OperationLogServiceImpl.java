package com.drmp.service.system.impl;

import com.drmp.dto.request.system.OperationLogQueryRequest;
import com.drmp.dto.response.system.OperationLogResponse;
import com.drmp.entity.system.SysOperationLog;
import com.drmp.exception.ResourceNotFoundException;
import com.drmp.repository.system.SysOperationLogRepository;
import com.drmp.service.system.OperationLogService;
import com.drmp.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 操作日志服务实现
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OperationLogServiceImpl implements OperationLogService {

    private final SysOperationLogRepository operationLogRepository;

    @Override
    public void saveOperationLog(SysOperationLog operationLog) {
        try {
            operationLogRepository.save(operationLog);
        } catch (Exception e) {
            log.error("保存操作日志失败", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OperationLogResponse> findOperationLogs(OperationLogQueryRequest request) {
        Pageable pageable = PageRequest.of(
            request.getPage(),
            request.getSize(),
            Sort.by(Sort.Direction.DESC, "operatedAt")
        );

        Page<SysOperationLog> page = operationLogRepository.findByConditions(
            request.getUserId(),
            request.getUsername(),
            request.getOperationType(),
            request.getModuleName(),
            request.getOperationStatus(),
            request.getStartTime(),
            request.getEndTime(),
            pageable
        );

        return page.map(OperationLogResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public OperationLogResponse getOperationLogById(Long id) {
        SysOperationLog operationLog = operationLogRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("操作日志不存在"));
        return OperationLogResponse.fromEntity(operationLog);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OperationLogResponse> getUserOperationLogs(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "operatedAt"));
        Page<SysOperationLog> logPage = operationLogRepository.findByUserIdOrderByOperatedAtDesc(userId, pageable);
        return logPage.map(OperationLogResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OperationLogResponse> getRecentOperationLogs(int limit) {
        List<SysOperationLog> logs = operationLogRepository.findTop10ByOrderByOperatedAtDesc();
        return logs.stream()
            .limit(limit)
            .map(OperationLogResponse::fromEntity)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getOperationLogStatistics(LocalDateTime startTime, LocalDateTime endTime) {
        Map<String, Object> statistics = new HashMap<>();

        // 总操作次数
        Long totalOperations = operationLogRepository.countByTimeRange(startTime, endTime);
        statistics.put("totalOperations", totalOperations);

        // 成功操作次数
        Long successOperations = operationLogRepository.findByOperatedAtBetweenOrderByOperatedAtDesc(startTime, endTime, PageRequest.of(0, Integer.MAX_VALUE))
            .stream()
            .mapToLong(log -> log.getOperationStatus() == SysOperationLog.OperationStatus.SUCCESS ? 1 : 0)
            .sum();
        statistics.put("successOperations", successOperations);

        // 失败操作次数
        statistics.put("failureOperations", totalOperations - successOperations);

        // 成功率
        double successRate = totalOperations > 0 ? (double) successOperations / totalOperations * 100 : 0;
        statistics.put("successRate", Math.round(successRate * 100.0) / 100.0);

        // 操作类型分布
        List<Object[]> operationTypeStats = operationLogRepository.countByOperationTypeAndTimeRange(startTime, endTime);
        Map<String, Long> operationTypeMap = new HashMap<>();
        for (Object[] stat : operationTypeStats) {
            SysOperationLog.OperationType type = (SysOperationLog.OperationType) stat[0];
            Long count = (Long) stat[1];
            operationTypeMap.put(type.getDescription(), count);
        }
        statistics.put("operationTypeDistribution", operationTypeMap);

        // 模块操作分布
        List<Object[]> moduleStats = operationLogRepository.countByModuleAndTimeRange(startTime, endTime);
        Map<String, Long> moduleMap = new HashMap<>();
        for (Object[] stat : moduleStats) {
            String moduleName = (String) stat[0];
            Long count = (Long) stat[1];
            if (moduleName != null) {
                moduleMap.put(moduleName, count);
            }
        }
        statistics.put("moduleDistribution", moduleMap);

        return statistics;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getOperationTrend(LocalDateTime startTime, LocalDateTime endTime) {
        List<Object[]> trendData = operationLogRepository.getOperationTrend(startTime, endTime);
        return trendData.stream()
            .map(data -> {
                Map<String, Object> item = new HashMap<>();
                item.put("date", data[0]);
                item.put("count", data[1]);
                return item;
            })
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getActiveUserStats(LocalDateTime startTime, LocalDateTime endTime) {
        List<Object[]> userStats = operationLogRepository.getActiveUserStats(startTime, endTime);
        return userStats.stream()
            .map(data -> {
                Map<String, Object> item = new HashMap<>();
                item.put("userId", data[0]);
                item.put("username", data[1]);
                item.put("operationCount", data[2]);
                return item;
            })
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getModuleOperationStats(LocalDateTime startTime, LocalDateTime endTime) {
        List<Object[]> moduleStats = operationLogRepository.countByModuleAndTimeRange(startTime, endTime);
        return moduleStats.stream()
            .map(data -> {
                Map<String, Object> item = new HashMap<>();
                item.put("moduleName", data[0]);
                item.put("operationCount", data[1]);
                return item;
            })
            .collect(Collectors.toList());
    }

    @Override
    public int cleanExpiredLogs(int retentionDays) {
        LocalDateTime expireTime = LocalDateTime.now().minusDays(retentionDays);
        int deletedCount = operationLogRepository.deleteExpiredLogs(expireTime);
        log.info("清理过期操作日志完成，删除记录数：{}", deletedCount);
        return deletedCount;
    }

    @Override
    public void exportOperationLogs(OperationLogQueryRequest request, String filePath) {
        // TODO: 实现日志导出功能
        log.info("导出操作日志到文件：{}", filePath);
    }

    @Override
    public void deleteOperationLogs(List<Long> ids) {
        if (ids != null && !ids.isEmpty()) {
            operationLogRepository.deleteAllById(ids);
            log.info("批量删除操作日志，数量：{}", ids.size());
        }
    }

    @Override
    public void saveLoginLog(Long userId, String username, String ip, String userAgent, boolean success, String failureReason) {
        SysOperationLog operationLog = SysOperationLog.builder()
            .userId(userId)
            .username(username)
            .operationType(SysOperationLog.OperationType.LOGIN)
            .moduleName("系统登录")
            .businessType("用户登录")
            .methodName("login")
            .requestMethod("POST")
            .requestUrl("/api/auth/login")
            .operationIp(ip)
            .userAgent(userAgent)
            .operationStatus(success ? SysOperationLog.OperationStatus.SUCCESS : SysOperationLog.OperationStatus.FAILURE)
            .errorMessage(success ? null : failureReason)
            .operatedAt(LocalDateTime.now())
            .build();

        saveOperationLogAsync(operationLog);
    }

    @Override
    public void saveLogoutLog(Long userId, String username, String ip) {
        SysOperationLog operationLog = SysOperationLog.builder()
            .userId(userId)
            .username(username)
            .operationType(SysOperationLog.OperationType.LOGOUT)
            .moduleName("系统登录")
            .businessType("用户登出")
            .methodName("logout")
            .requestMethod("POST")
            .requestUrl("/api/auth/logout")
            .operationIp(ip)
            .operationStatus(SysOperationLog.OperationStatus.SUCCESS)
            .operatedAt(LocalDateTime.now())
            .build();

        saveOperationLogAsync(operationLog);
    }

    @Override
    public void saveSystemLog(String operation, String module, String description, Object data) {
        SysOperationLog operationLog = SysOperationLog.builder()
            .userId(SecurityUtils.getCurrentUserId())
            .username(SecurityUtils.getCurrentUsername())
            .operationType(SysOperationLog.OperationType.valueOf(operation.toUpperCase()))
            .moduleName(module)
            .businessType("系统操作")
            .methodName(description)
            .requestParams(data != null ? data.toString() : null)
            .operationStatus(SysOperationLog.OperationStatus.SUCCESS)
            .operatedAt(LocalDateTime.now())
            .build();

        saveOperationLogAsync(operationLog);
    }

    @Override
    @Async
    public void saveOperationLogAsync(SysOperationLog operationLog) {
        try {
            operationLogRepository.save(operationLog);
        } catch (Exception e) {
            log.error("异步保存操作日志失败", e);
        }
    }
}