package com.drmp.service.system.impl;

import com.drmp.dto.request.system.OperationLogQueryRequest;
import com.drmp.dto.response.system.OperationLogResponse;
import com.drmp.entity.system.SysOperationLog;
import com.drmp.exception.ResourceNotFoundException;
import com.drmp.repository.system.SysOperationLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * OperationLogServiceImpl 测试
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("OperationLogServiceImpl 测试")
class OperationLogServiceImplTest {

    @Mock
    private SysOperationLogRepository operationLogRepository;

    @InjectMocks
    private OperationLogServiceImpl operationLogService;

    private SysOperationLog testLog;
    private OperationLogQueryRequest queryRequest;

    @BeforeEach
    void setUp() {
        // 初始化测试日志
        testLog = SysOperationLog.builder()
            .id(1L)
            .userId(1L)
            .username("testuser")
            .operationType(SysOperationLog.OperationType.CREATE)
            .moduleName("用户管理")
            .businessType("创建用户")
            .methodName("createUser")
            .requestMethod("POST")
            .requestUrl("/api/users")
            .requestParams("{\"username\":\"test\"}")
            .responseResult("{\"id\":1}")
            .operationIp("192.168.1.1")
            .operationStatus(SysOperationLog.OperationStatus.SUCCESS)
            .operatedAt(LocalDateTime.now())
            .executionTime(100L)
            .build();

        // 初始化查询请求
        queryRequest = new OperationLogQueryRequest();
        queryRequest.setPage(0);
        queryRequest.setSize(10);
    }

    @Test
    @DisplayName("saveOperationLog - 应成功保存操作日志")
    void saveOperationLog_ShouldSaveSuccessfully() {
        // Arrange
        when(operationLogRepository.save(any(SysOperationLog.class))).thenReturn(testLog);

        // Act
        operationLogService.saveOperationLog(testLog);

        // Assert
        verify(operationLogRepository).save(testLog);
    }

    @Test
    @DisplayName("saveOperationLog - 保存失败不应抛出异常")
    void saveOperationLog_ShouldNotThrowException_OnFailure() {
        // Arrange
        when(operationLogRepository.save(any(SysOperationLog.class))).thenThrow(new RuntimeException("DB Error"));

        // Act & Assert
        assertThatCode(() -> operationLogService.saveOperationLog(testLog))
            .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("findOperationLogs - 应返回操作日志分页列表")
    void findOperationLogs_ShouldReturnPagedLogs() {
        // Arrange
        Page<SysOperationLog> logPage = new PageImpl<>(Arrays.asList(testLog));
        when(operationLogRepository.findByConditions(any(), any(), any(), any(), any(), any(), any(), any(Pageable.class)))
            .thenReturn(logPage);

        // Act
        Page<OperationLogResponse> result = operationLogService.findOperationLogs(queryRequest);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getUsername()).isEqualTo("testuser");
    }

    @Test
    @DisplayName("getOperationLogById - 应返回操作日志详情")
    void getOperationLogById_ShouldReturnLogDetails() {
        // Arrange
        when(operationLogRepository.findById(1L)).thenReturn(Optional.of(testLog));

        // Act
        OperationLogResponse result = operationLogService.getOperationLogById(1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getUsername()).isEqualTo("testuser");
        assertThat(result.getModuleName()).isEqualTo("用户管理");
    }

    @Test
    @DisplayName("getOperationLogById - 日志不存在应抛出异常")
    void getOperationLogById_ShouldThrowException_WhenNotFound() {
        // Arrange
        when(operationLogRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> operationLogService.getOperationLogById(999L))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("操作日志不存在");
    }

    @Test
    @DisplayName("getUserOperationLogs - 应返回用户操作日志")
    void getUserOperationLogs_ShouldReturnUserLogs() {
        // Arrange
        Page<SysOperationLog> logPage = new PageImpl<>(Arrays.asList(testLog));
        when(operationLogRepository.findByUserIdOrderByOperatedAtDesc(eq(1L), any(Pageable.class)))
            .thenReturn(logPage);

        // Act
        Page<OperationLogResponse> result = operationLogService.getUserOperationLogs(1L, 0, 10);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("getRecentOperationLogs - 应返回最近操作日志")
    void getRecentOperationLogs_ShouldReturnRecentLogs() {
        // Arrange
        when(operationLogRepository.findTop10ByOrderByOperatedAtDesc())
            .thenReturn(Arrays.asList(testLog));

        // Act
        List<OperationLogResponse> result = operationLogService.getRecentOperationLogs(5);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("getOperationLogStatistics - 应返回统计信息")
    void getOperationLogStatistics_ShouldReturnStatistics() {
        // Arrange
        LocalDateTime start = LocalDateTime.now().minusDays(7);
        LocalDateTime end = LocalDateTime.now();

        when(operationLogRepository.countByTimeRange(start, end)).thenReturn(100L);
        when(operationLogRepository.findByOperatedAtBetweenOrderByOperatedAtDesc(eq(start), eq(end), any()))
            .thenReturn(new PageImpl<>(Collections.singletonList(testLog)));

        List<Object[]> typeStats = new ArrayList<>();
        typeStats.add(new Object[]{SysOperationLog.OperationType.CREATE, 50L});
        when(operationLogRepository.countByOperationTypeAndTimeRange(start, end))
            .thenReturn(typeStats);

        List<Object[]> moduleStats = new ArrayList<>();
        moduleStats.add(new Object[]{"用户管理", 30L});
        when(operationLogRepository.countByModuleAndTimeRange(start, end))
            .thenReturn(moduleStats);

        // Act
        Map<String, Object> result = operationLogService.getOperationLogStatistics(start, end);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).containsKeys("totalOperations", "successOperations", "failureOperations", "successRate");
        assertThat(result.get("totalOperations")).isEqualTo(100L);
    }

    @Test
    @DisplayName("getOperationTrend - 应返回操作趋势数据")
    void getOperationTrend_ShouldReturnTrendData() {
        // Arrange
        LocalDateTime start = LocalDateTime.now().minusDays(7);
        LocalDateTime end = LocalDateTime.now();
        List<Object[]> trendData = new ArrayList<>();
        trendData.add(new Object[]{"2025-10-01", 50L});
        when(operationLogRepository.getOperationTrend(start, end))
            .thenReturn(trendData);

        // Act
        List<Map<String, Object>> result = operationLogService.getOperationTrend(start, end);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).containsKeys("date", "count");
    }

    @Test
    @DisplayName("getActiveUserStats - 应返回活跃用户统计")
    void getActiveUserStats_ShouldReturnUserStats() {
        // Arrange
        LocalDateTime start = LocalDateTime.now().minusDays(7);
        LocalDateTime end = LocalDateTime.now();
        List<Object[]> userStats = new ArrayList<>();
        userStats.add(new Object[]{1L, "testuser", 100L});
        when(operationLogRepository.getActiveUserStats(start, end))
            .thenReturn(userStats);

        // Act
        List<Map<String, Object>> result = operationLogService.getActiveUserStats(start, end);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).containsKeys("userId", "username", "operationCount");
    }

    @Test
    @DisplayName("getModuleOperationStats - 应返回模块操作统计")
    void getModuleOperationStats_ShouldReturnModuleStats() {
        // Arrange
        LocalDateTime start = LocalDateTime.now().minusDays(7);
        LocalDateTime end = LocalDateTime.now();
        List<Object[]> modStats = new ArrayList<>();
        modStats.add(new Object[]{"用户管理", 50L});
        when(operationLogRepository.countByModuleAndTimeRange(start, end))
            .thenReturn(modStats);

        // Act
        List<Map<String, Object>> result = operationLogService.getModuleOperationStats(start, end);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).get("moduleName")).isEqualTo("用户管理");
        assertThat(result.get(0).get("operationCount")).isEqualTo(50L);
    }

    @Test
    @DisplayName("cleanExpiredLogs - 应清理过期日志")
    void cleanExpiredLogs_ShouldCleanExpiredLogs() {
        // Arrange
        when(operationLogRepository.deleteExpiredLogs(any(LocalDateTime.class))).thenReturn(50);

        // Act
        int result = operationLogService.cleanExpiredLogs(30);

        // Assert
        assertThat(result).isEqualTo(50);
        verify(operationLogRepository).deleteExpiredLogs(any(LocalDateTime.class));
    }

    @Test
    @DisplayName("deleteOperationLogs - 应批量删除操作日志")
    void deleteOperationLogs_ShouldDeleteMultipleLogs() {
        // Arrange
        List<Long> ids = Arrays.asList(1L, 2L, 3L);

        // Act
        operationLogService.deleteOperationLogs(ids);

        // Assert
        verify(operationLogRepository).deleteAllById(ids);
    }

    @Test
    @DisplayName("deleteOperationLogs - 空列表不应执行删除")
    void deleteOperationLogs_ShouldNotDelete_WhenEmptyList() {
        // Act
        operationLogService.deleteOperationLogs(Collections.emptyList());

        // Assert
        verify(operationLogRepository, never()).deleteAllById(any());
    }

    @Test
    @DisplayName("saveLoginLog - 应保存登录成功日志")
    void saveLoginLog_ShouldSaveSuccessLoginLog() {
        // Arrange
        when(operationLogRepository.save(any(SysOperationLog.class))).thenReturn(testLog);

        // Act
        operationLogService.saveLoginLog(1L, "testuser", "192.168.1.1", "Chrome", true, null);

        // Assert
        verify(operationLogRepository).save(argThat(log ->
            log.getOperationType() == SysOperationLog.OperationType.LOGIN &&
            log.getOperationStatus() == SysOperationLog.OperationStatus.SUCCESS &&
            log.getErrorMessage() == null
        ));
    }

    @Test
    @DisplayName("saveLoginLog - 应保存登录失败日志")
    void saveLoginLog_ShouldSaveFailedLoginLog() {
        // Arrange
        when(operationLogRepository.save(any(SysOperationLog.class))).thenReturn(testLog);

        // Act
        operationLogService.saveLoginLog(1L, "testuser", "192.168.1.1", "Chrome", false, "密码错误");

        // Assert
        verify(operationLogRepository).save(argThat(log ->
            log.getOperationType() == SysOperationLog.OperationType.LOGIN &&
            log.getOperationStatus() == SysOperationLog.OperationStatus.FAILURE &&
            log.getErrorMessage().equals("密码错误")
        ));
    }

    @Test
    @DisplayName("saveLogoutLog - 应保存登出日志")
    void saveLogoutLog_ShouldSaveLogoutLog() {
        // Arrange
        when(operationLogRepository.save(any(SysOperationLog.class))).thenReturn(testLog);

        // Act
        operationLogService.saveLogoutLog(1L, "testuser", "192.168.1.1");

        // Assert
        verify(operationLogRepository).save(argThat(log ->
            log.getOperationType() == SysOperationLog.OperationType.LOGOUT &&
            log.getOperationStatus() == SysOperationLog.OperationStatus.SUCCESS
        ));
    }

    @Test
    @DisplayName("saveOperationLogAsync - 应异步保存日志")
    void saveOperationLogAsync_ShouldSaveAsync() {
        // Arrange
        when(operationLogRepository.save(any(SysOperationLog.class))).thenReturn(testLog);

        // Act
        operationLogService.saveOperationLogAsync(testLog);

        // Assert
        verify(operationLogRepository).save(testLog);
    }

    @Test
    @DisplayName("saveOperationLogAsync - 保存失败不应抛出异常")
    void saveOperationLogAsync_ShouldNotThrowException_OnFailure() {
        // Arrange
        when(operationLogRepository.save(any(SysOperationLog.class)))
            .thenThrow(new RuntimeException("DB Error"));

        // Act & Assert
        assertThatCode(() -> operationLogService.saveOperationLogAsync(testLog))
            .doesNotThrowAnyException();
    }
}
