package com.drmp.controller;

import com.drmp.config.BaseControllerTest;
import com.drmp.entity.CaseFlowRecord;
import com.drmp.entity.enums.CaseFlowEvent;
import com.drmp.service.CaseFlowService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.Arrays;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("CaseFlowController 测试")
class CaseFlowControllerTest extends BaseControllerTest {

    @MockBean
    private CaseFlowService caseFlowService;

    private CaseFlowRecord testRecord;

    @BeforeEach
    public void setUp() {
        super.setUp();

        testRecord = new CaseFlowRecord();
        testRecord.setId(1L);
        testRecord.setCasePackageId(1L);
        testRecord.setEventType(CaseFlowEvent.PACKAGE_PUBLISHED);
    }

    @Test
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("POST /v1/case-flow/package-event - 记录案件包事件")
    void recordPackageEvent_ShouldReturnRecord() throws Exception {
        when(caseFlowService.recordPackageEvent(anyLong(), any(), anyString(), anyLong(), anyString()))
            .thenReturn(testRecord);

        mockMvc.perform(post("/v1/case-flow/package-event")
                .param("casePackageId", "1")
                .param("eventType", "PACKAGE_PUBLISHED")
                .param("description", "案件包已发布")
                .param("operatorId", "1")
                .param("operatorName", "管理员"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @WithMockUser(roles = "CASE_VIEWER")
    @DisplayName("GET /v1/case-flow/package/{id} - 获取案件包流转记录")
    void getCasePackageFlowRecords_ShouldReturnPage() throws Exception {
        Page<CaseFlowRecord> page = new PageImpl<>(Arrays.asList(testRecord));
        when(caseFlowService.getCasePackageFlowRecords(anyLong(), any()))
            .thenReturn(page);

        mockMvc.perform(get("/v1/case-flow/package/{id}", 1L)
                .param("page", "0")
                .param("size", "20"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @WithMockUser(roles = "DISPOSAL_VIEWER")
    @DisplayName("GET /v1/case-flow/case/{id} - 获取个案流转记录")
    void getCaseFlowRecords_ShouldReturnPage() throws Exception {
        Page<CaseFlowRecord> page = new PageImpl<>(Arrays.asList(testRecord));
        when(caseFlowService.getCaseFlowRecords(anyLong(), any()))
            .thenReturn(page);

        mockMvc.perform(get("/v1/case-flow/case/{id}", 1L)
                .param("page", "0")
                .param("size", "20"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("POST /v1/case-flow/package-event - 无权限返回403")
    void recordPackageEvent_ShouldReturn403_WhenUnauthorized() throws Exception {
        mockMvc.perform(post("/v1/case-flow/package-event")
                .param("casePackageId", "1")
                .param("eventType", "PACKAGE_PUBLISHED")
                .param("description", "测试")
                .param("operatorId", "1")
                .param("operatorName", "测试"))
            .andExpect(status().isForbidden());
    }
}
