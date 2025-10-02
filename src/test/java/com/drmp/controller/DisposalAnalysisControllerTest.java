package com.drmp.controller;

import com.drmp.config.BaseControllerTest;
import com.drmp.dto.request.DisposalAnalysisQueryRequest;
import com.drmp.dto.response.DisposalAnalysisResponse;
import com.drmp.service.DisposalAnalysisService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("DisposalAnalysisController 测试")
class DisposalAnalysisControllerTest extends BaseControllerTest {

    @MockBean
    private DisposalAnalysisService disposalAnalysisService;

    private DisposalAnalysisQueryRequest testRequest;

    @BeforeEach
    void setUp() {
        testRequest = new DisposalAnalysisQueryRequest();
        testRequest.setPage(1);
        testRequest.setSize(20);
        testRequest.setStartDate(LocalDateTime.now().minusDays(30));
        testRequest.setEndDate(LocalDateTime.now());
    }

    @Test
    @DisplayName("getComprehensiveAnalysis - 应成功获取综合分析")
    @WithMockUser(roles = "ADMIN")
    void getComprehensiveAnalysis_ShouldReturnData() throws Exception {
        DisposalAnalysisResponse response = new DisposalAnalysisResponse();
        when(disposalAnalysisService.getComprehensiveAnalysis(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/disposal-analysis/comprehensive")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testRequest)))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("getOverviewStatistics - 应成功获取概览统计")
    @WithMockUser(roles = "ADMIN")
    void getOverviewStatistics_ShouldReturnStatistics() throws Exception {
        DisposalAnalysisResponse.OverviewStatistics stats = 
            new DisposalAnalysisResponse.OverviewStatistics();
        when(disposalAnalysisService.getOverviewStatistics(any())).thenReturn(stats);

        mockMvc.perform(post("/api/v1/disposal-analysis/overview")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testRequest)))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("getTrendAnalysis - 应成功获取趋势分析")
    @WithMockUser(roles = "ADMIN")
    void getTrendAnalysis_ShouldReturnTrends() throws Exception {
        List<DisposalAnalysisResponse.TrendDataPoint> trends = new ArrayList<>();
        when(disposalAnalysisService.getTrendAnalysis(any())).thenReturn(trends);

        mockMvc.perform(post("/api/v1/disposal-analysis/trends")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testRequest)))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("getRealtimeData - 应成功获取实时数据")
    @WithMockUser(roles = "ADMIN")
    void getRealtimeData_ShouldReturnRealtimeData() throws Exception {
        Map<String, Object> realtimeData = new HashMap<>();
        when(disposalAnalysisService.getRealtimeData(any())).thenReturn(realtimeData);

        mockMvc.perform(get("/api/v1/disposal-analysis/realtime"))
            .andExpect(status().isOk());
    }
}
