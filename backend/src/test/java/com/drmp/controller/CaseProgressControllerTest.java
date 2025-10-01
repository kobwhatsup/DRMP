package com.drmp.controller;

import com.drmp.config.BaseControllerTest;
import com.drmp.dto.request.CaseProgressCreateRequest;
import com.drmp.dto.request.CaseProgressQueryRequest;
import com.drmp.dto.response.CaseProgressResponse;
import com.drmp.dto.response.ProgressSyncResponse;
import com.drmp.service.CaseProgressService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * CaseProgressController 测试
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@DisplayName("CaseProgressController 测试")
class CaseProgressControllerTest extends BaseControllerTest {

    @MockBean
    private CaseProgressService caseProgressService;

    private CaseProgressResponse testProgress;

    @BeforeEach
    public void setUp() {
        super.setUp();

        testProgress = new CaseProgressResponse();
        testProgress.setId(1L);
        testProgress.setCaseId(1L);
        testProgress.setProgressType("CONTACT");
        testProgress.setProgressContent("已联系债务人");
        testProgress.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("GET /v1/case-progress - 获取进度列表")
    void getCaseProgressList_ShouldReturnPage() throws Exception {
        Page<CaseProgressResponse> page = new PageImpl<>(Arrays.asList(testProgress));
        when(caseProgressService.getCaseProgressList(ArgumentMatchers.any(CaseProgressQueryRequest.class)))
            .thenReturn(page);

        mockMvc.perform(get("/v1/case-progress"))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.content").isArray())
            .andExpect(jsonPath("$.data.content", hasSize(1)));
    }

    @Test
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("GET /v1/case-progress/case/{caseId} - 获取案件进度")
    void getCaseProgressByCaseId_ShouldReturnList() throws Exception {
        List<CaseProgressResponse> progressList = Arrays.asList(testProgress);
        when(caseProgressService.getCaseProgressByCaseId(1L)).thenReturn(progressList);

        mockMvc.perform(get("/v1/case-progress/case/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data").isArray())
            .andExpect(jsonPath("$.data", hasSize(1)))
            .andExpect(jsonPath("$.data[0].caseId").value(1));

        verify(caseProgressService).getCaseProgressByCaseId(1L);
    }

    @Test
    @WithMockUser(roles = "DISPOSAL_HANDLER")
    @DisplayName("POST /v1/case-progress - 添加进度记录")
    void createCaseProgress_ShouldReturnCreated() throws Exception {
        CaseProgressCreateRequest request = new CaseProgressCreateRequest();
        request.setCaseId(1L);
        request.setProgressType("CONTACT");
        request.setProgressContent("已联系债务人");

        when(caseProgressService.createCaseProgress(any())).thenReturn(testProgress);

        mockMvc.perform(post("/v1/case-progress")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.message").value("进度记录添加成功"))
            .andExpect(jsonPath("$.data.id").value(1));

        verify(caseProgressService).createCaseProgress(any());
    }

    @Test
    @WithMockUser(roles = "DISPOSAL_HANDLER")
    @DisplayName("POST /v1/case-progress/batch - 批量添加进度")
    void batchCreateCaseProgress_ShouldReturnResult() throws Exception {
        CaseProgressCreateRequest request1 = new CaseProgressCreateRequest();
        request1.setCaseId(1L);
        request1.setProgressType("CONTACT");
        request1.setProgressContent("已联系债务人1");

        CaseProgressCreateRequest request2 = new CaseProgressCreateRequest();
        request2.setCaseId(2L);
        request2.setProgressType("CONTACT");
        request2.setProgressContent("已联系债务人2");

        List<CaseProgressCreateRequest> requests = Arrays.asList(request1, request2);

        Map<String, Object> result = new HashMap<>();
        result.put("total", 2);
        result.put("success", 2);
        result.put("failed", 0);

        when(caseProgressService.batchCreateCaseProgress(anyList())).thenReturn(result);

        mockMvc.perform(post("/v1/case-progress/batch")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requests)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.message").value("批量添加进度记录完成"))
            .andExpect(jsonPath("$.data.total").value(2))
            .andExpect(jsonPath("$.data.success").value(2));
    }

    @Test
    @WithMockUser(roles = "DISPOSAL_HANDLER")
    @DisplayName("POST /v1/case-progress/{id}/attachments - 上传附件")
    void uploadProgressAttachment_ShouldReturnUrl() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.pdf",
            "application/pdf",
            "test content".getBytes()
        );

        when(caseProgressService.uploadProgressAttachment(eq(1L), any(), eq("EVIDENCE")))
            .thenReturn("https://cdn.example.com/files/test.pdf");

        mockMvc.perform(multipart("/v1/case-progress/1/attachments")
                .file(file)
                .param("type", "EVIDENCE"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.message").value("附件上传成功"))
            .andExpect(jsonPath("$.data").value("https://cdn.example.com/files/test.pdf"));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_INTEGRATOR")
    @DisplayName("POST /v1/case-progress/sync/ids - 同步IDS进度")
    void syncProgressFromIDS_ShouldReturnSyncResult() throws Exception {
        ProgressSyncResponse syncResponse = new ProgressSyncResponse();
        syncResponse.setTotalCases(10);
        syncResponse.setSyncedCases(8);
        syncResponse.setFailedCases(2);

        when(caseProgressService.syncProgressFromIDS(eq(1L), eq(false))).thenReturn(syncResponse);

        mockMvc.perform(post("/v1/case-progress/sync/ids")
                .param("casePackageId", "1")
                .param("force", "false"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.message").value("IDS进度同步完成"))
            .andExpect(jsonPath("$.data.totalCases").value(10))
            .andExpect(jsonPath("$.data.syncedCases").value(8));
    }

    @Test
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("GET /v1/case-progress/statistics - 获取进度统计")
    void getProgressStatistics_ShouldReturnStats() throws Exception {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProgress", 100);
        stats.put("todayProgress", 10);
        stats.put("activeHandlers", 5);

        when(caseProgressService.getProgressStatistics(anyLong(), anyString(), anyString()))
            .thenReturn(stats);

        mockMvc.perform(get("/v1/case-progress/statistics")
                .param("organizationId", "1")
                .param("startDate", "2025-01-01")
                .param("endDate", "2025-01-31"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.totalProgress").value(100))
            .andExpect(jsonPath("$.data.todayProgress").value(10));
    }

    @Test
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("GET /v1/case-progress/updates - 获取实时更新")
    void getProgressUpdates_ShouldReturnUpdates() throws Exception {
        List<CaseProgressResponse> updates = Arrays.asList(testProgress);
        when(caseProgressService.getProgressUpdates(anyLong(), anyLong())).thenReturn(updates);

        mockMvc.perform(get("/v1/case-progress/updates")
                .param("lastUpdateTime", "1609459200000")
                .param("organizationId", "1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data").isArray())
            .andExpect(jsonPath("$.data", hasSize(1)));
    }

    @Test
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("POST /v1/case-progress/mark-read - 标记已读")
    void markProgressAsRead_ShouldSucceed() throws Exception {
        List<Long> progressIds = Arrays.asList(1L, 2L, 3L);

        mockMvc.perform(post("/v1/case-progress/mark-read")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(progressIds)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.message").value("标记已读成功"));

        verify(caseProgressService).markProgressAsRead(anyList(), isNull());
    }

    @Test
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("POST /v1/case-progress/reminders - 设置提醒")
    void setProgressReminder_ShouldSucceed() throws Exception {
        mockMvc.perform(post("/v1/case-progress/reminders")
                .param("caseId", "1")
                .param("reminderTime", "2025-01-10T10:00:00")
                .param("reminderContent", "跟进债务人还款"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.message").value("进度提醒设置成功"));

        verify(caseProgressService).setProgressReminder(eq(1L), anyString(), anyString(), isNull());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("POST /v1/case-progress - 无权限时返回403")
    void createCaseProgress_ShouldReturn403_WhenUnauthorized() throws Exception {
        CaseProgressCreateRequest request = new CaseProgressCreateRequest();
        request.setCaseId(1L);
        request.setProgressType("CONTACT");
        request.setProgressContent("测试内容");

        mockMvc.perform(post("/v1/case-progress")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden());
    }
}
