package com.drmp.controller;

import com.drmp.config.BaseControllerTest;
import com.drmp.service.ReportCacheService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("ReportPerformanceController 测试")
class ReportPerformanceControllerTest extends BaseControllerTest {

    @MockBean
    private ReportCacheService reportCacheService;

    @Test
    @DisplayName("getCacheStatistics - 应成功获取缓存统计")
    @WithMockUser(roles = "ADMIN")
    void getCacheStatistics_ShouldReturnStats() throws Exception {
        Map<String, Object> stats = new HashMap<>();
        stats.put("hitRate", 0.85);
        stats.put("size", 1000);
        when(reportCacheService.getReportCacheStats()).thenReturn(stats);

        mockMvc.perform(get("/v1/reports/performance/cache/statistics"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("clearCache - 应成功清理缓存")
    @WithMockUser(roles = "ADMIN")
    void clearCache_ShouldClearSuccessfully() throws Exception {
        mockMvc.perform(post("/v1/reports/performance/cache/clear")
                .with(csrf())
                .param("reportType", "disposal")
                .param("pattern", "*"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));
    }
}
