package com.drmp.controller.system;

import com.drmp.config.BaseControllerTest;
import com.drmp.dto.request.system.OperationLogQueryRequest;
import com.drmp.dto.response.system.OperationLogResponse;
import com.drmp.service.system.OperationLogService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.*;

@DisplayName("OperationLogController 测试")
class OperationLogControllerTest extends BaseControllerTest {

    @MockBean
    private OperationLogService operationLogService;

    private OperationLogResponse testLog;
    private Page<OperationLogResponse> testPage;

    @BeforeEach
    public void setUp() {
        super.setUp();
        testLog = new OperationLogResponse();
        testLog.setId(1L);
        testLog.setUsername("testuser");
        testLog.setModuleName("系统配置");
        testLog.setOperationTypeDesc("创建");
        testLog.setOperationStatusDesc("成功");
        testLog.setOperatedAt(LocalDateTime.now());

        testPage = new PageImpl<>(Arrays.asList(testLog));
    }

    @Test
    @DisplayName("getOperationLogs - 应成功分页查询操作日志")
    @WithMockUser
    void getOperationLogs_ShouldReturnLogPage() throws Exception {
        when(operationLogService.findOperationLogs(any())).thenReturn(testPage);

        mockMvc.perform(get("/system/operation-logs"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content[0].id").value(1));

        verify(operationLogService).findOperationLogs(any());
    }

    @Test
    @DisplayName("getOperationLogById - 应成功获取操作日志详情")
    @WithMockUser
    void getOperationLogById_ShouldReturnLog() throws Exception {
        when(operationLogService.getOperationLogById(1L)).thenReturn(testLog);

        mockMvc.perform(get("/system/operation-logs/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.username").value("testuser"));
    }

    @Test
    @DisplayName("getUserOperationLogs - 应成功获取用户操作日志")
    @WithMockUser
    void getUserOperationLogs_ShouldReturnUserLogs() throws Exception {
        when(operationLogService.getUserOperationLogs(eq(1L), anyInt(), anyInt())).thenReturn(testPage);

        mockMvc.perform(get("/system/operation-logs/user/1")
                .param("page", "0")
                .param("size", "20"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content[0].username").value("testuser"));
    }

    @Test
    @DisplayName("getRecentOperationLogs - 应成功获取最近操作日志")
    @WithMockUser
    void getRecentOperationLogs_ShouldReturnRecentLogs() throws Exception {
        when(operationLogService.getRecentOperationLogs(10)).thenReturn(Arrays.asList(testLog));

        mockMvc.perform(get("/system/operation-logs/recent")
                .param("limit", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].moduleName").value("系统配置"));
    }

    @Test
    @DisplayName("getOperationLogStatistics - 应成功获取操作日志统计")
    @WithMockUser
    void getOperationLogStatistics_ShouldReturnStatistics() throws Exception {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", 100);
        stats.put("success", 95);
        stats.put("failure", 5);

        when(operationLogService.getOperationLogStatistics(any(), any())).thenReturn(stats);

        mockMvc.perform(get("/system/operation-logs/statistics")
                .param("startTime", "2025-01-01 00:00:00")
                .param("endTime", "2025-01-31 23:59:59"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.total").value(100));
    }

    @Test
    @DisplayName("getOperationTrend - 应成功获取操作趋势")
    @WithMockUser
    void getOperationTrend_ShouldReturnTrend() throws Exception {
        List<Map<String, Object>> trend = new ArrayList<>();
        Map<String, Object> item = new HashMap<>();
        item.put("date", "2025-01-01");
        item.put("count", 50);
        trend.add(item);

        when(operationLogService.getOperationTrend(any(), any())).thenReturn(trend);

        mockMvc.perform(get("/system/operation-logs/trend")
                .param("startTime", "2025-01-01 00:00:00")
                .param("endTime", "2025-01-31 23:59:59"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].count").value(50));
    }

    @Test
    @DisplayName("getActiveUserStats - 应成功获取活跃用户统计")
    @WithMockUser
    void getActiveUserStats_ShouldReturnStats() throws Exception {
        List<Map<String, Object>> stats = new ArrayList<>();
        when(operationLogService.getActiveUserStats(any(), any())).thenReturn(stats);

        mockMvc.perform(get("/system/operation-logs/active-users")
                .param("startTime", "2025-01-01 00:00:00")
                .param("endTime", "2025-01-31 23:59:59"))
            .andExpect(status().isOk());

        verify(operationLogService).getActiveUserStats(any(), any());
    }

    @Test
    @DisplayName("getModuleOperationStats - 应成功获取模块操作统计")
    @WithMockUser
    void getModuleOperationStats_ShouldReturnStats() throws Exception {
        List<Map<String, Object>> stats = new ArrayList<>();
        when(operationLogService.getModuleOperationStats(any(), any())).thenReturn(stats);

        mockMvc.perform(get("/system/operation-logs/module-stats")
                .param("startTime", "2025-01-01 00:00:00")
                .param("endTime", "2025-01-31 23:59:59"))
            .andExpect(status().isOk());

        verify(operationLogService).getModuleOperationStats(any(), any());
    }

    @Test
    @DisplayName("cleanExpiredLogs - 应成功清理过期日志")
    @WithMockUser
    void cleanExpiredLogs_ShouldCleanSuccessfully() throws Exception {
        when(operationLogService.cleanExpiredLogs(90)).thenReturn(100);

        mockMvc.perform(delete("/system/operation-logs/clean")
                .with(csrf())
                .param("retentionDays", "90"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data").value(100));
    }

    // TODO: Re-enable this test when export functionality is fully implemented in service layer
    // @Test
    // @DisplayName("exportOperationLogs - 应成功导出操作日志")
    // @WithMockUser
    // void exportOperationLogs_ShouldExportSuccessfully() throws Exception {
    //     OperationLogQueryRequest request = new OperationLogQueryRequest();
    //     request.setPage(1);
    //     request.setSize(20);
    //
    //     mockMvc.perform(post("/system/operation-logs/export")
    //             .with(csrf())
    //             .contentType(MediaType.APPLICATION_JSON)
    //             .content(objectMapper.writeValueAsString(request)))
    //         .andDo(print())
    //         .andExpect(status().isOk());
    //
    //     verify(operationLogService).exportOperationLogs(any(), anyString());
    // }

    @Test
    @DisplayName("deleteOperationLogs - 应成功批量删除操作日志")
    @WithMockUser
    void deleteOperationLogs_ShouldDeleteSuccessfully() throws Exception {
        List<Long> ids = Arrays.asList(1L, 2L, 3L);

        mockMvc.perform(delete("/system/operation-logs/batch")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(ids)))
            .andExpect(status().isOk());

        verify(operationLogService).deleteOperationLogs(anyList());
    }

    @Test
    @DisplayName("getOperationLogOverview - 应成功获取操作日志概览")
    @WithMockUser
    void getOperationLogOverview_ShouldReturnOverview() throws Exception {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", 100);

        when(operationLogService.getOperationLogStatistics(any(), any())).thenReturn(stats);
        when(operationLogService.getOperationTrend(any(), any())).thenReturn(new ArrayList<>());
        when(operationLogService.getRecentOperationLogs(5)).thenReturn(Arrays.asList(testLog));

        mockMvc.perform(get("/system/operation-logs/overview"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.total").value(100));
    }
}
