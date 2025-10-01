package com.drmp.controller;

import com.drmp.config.BaseControllerTest;
import com.drmp.dto.response.AssignmentRecommendationResponse;
import com.drmp.exception.ResourceNotFoundException;
import com.drmp.service.SmartAssignmentService;
import com.drmp.service.SmartAssignmentService.*;
import com.drmp.service.assignment.AssignmentStrategyManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * SmartAssignmentController Test
 * 智能分案控制器测试
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@DisplayName("SmartAssignmentController 测试")
class SmartAssignmentControllerTest extends BaseControllerTest {

    @MockBean
    private SmartAssignmentService smartAssignmentService;

    @MockBean
    private AssignmentStrategyManager strategyManager;

    @Test
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("GET /recommendations/{id} - 成功获取推荐列表")
    void getRecommendations_ShouldReturnRecommendations() throws Exception {
        Long casePackageId = 1L;
        List<AssignmentRecommendationResponse> recommendations = Arrays.asList(
            createMockRecommendation(1L, "优秀律所", 0.95),
            createMockRecommendation(2L, "普通律所", 0.75)
        );

        when(smartAssignmentService.getRecommendations(eq(casePackageId), anyInt()))
            .thenReturn(recommendations);

        mockMvc.perform(get("/v1/smart-assignment/recommendations/{id}", casePackageId)
                .param("limit", "10"))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.message").value("操作成功"))
            .andExpect(jsonPath("$.data").isArray())
            .andExpect(jsonPath("$.data", hasSize(2)))
            .andExpect(jsonPath("$.data[0].organizationId").value(1))
            .andExpect(jsonPath("$.data[0].matchScore").value(0.95));

        verify(smartAssignmentService).getRecommendations(casePackageId, 10);
    }

    @Test
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("GET /recommendations/{id} - 案件包不存在时返回500")
    void getRecommendations_ShouldReturn500_WhenNotFound() throws Exception {
        when(smartAssignmentService.getRecommendations(anyLong(), anyInt()))
            .thenThrow(new ResourceNotFoundException("案件包不存在"));

        mockMvc.perform(get("/v1/smart-assignment/recommendations/{id}", 999L))
            .andDo(print())
            .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("GET /recommendations/{id} - 无权限时返回403")
    void getRecommendations_ShouldReturn403_WhenUnauthorized() throws Exception {
        mockMvc.perform(get("/v1/smart-assignment/recommendations/{id}", 1L))
            .andDo(print())
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("POST /auto-assign/{id} - 成功执行自动分案")
    void executeAutoAssignment_ShouldReturnResult() throws Exception {
        Long casePackageId = 1L;
        Long ruleId = 1L;

        AssignmentResult mockResult = new AssignmentResult();
        mockResult.setSuccess(true);
        mockResult.setAssignedOrganizationId(1L);
        mockResult.setAssignedOrganizationName("优秀律所");
        mockResult.setMatchingScore(0.9);

        when(smartAssignmentService.executeAutoAssignment(casePackageId, ruleId))
            .thenReturn(mockResult);

        mockMvc.perform(post("/v1/smart-assignment/auto-assign/{id}", casePackageId)
                .param("ruleId", ruleId.toString()))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.success").value(true))
            .andExpect(jsonPath("$.data.assignedOrganizationId").value(1));
    }

    @Test
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("POST /batch-assign - 成功执行批量分案")
    void executeBatchAssignment_ShouldReturnResults() throws Exception {
        BatchAssignmentResult mockResult = new BatchAssignmentResult();
        mockResult.setTotalCount(3);
        mockResult.setSuccessCount(2);
        mockResult.setFailedCount(1);

        when(smartAssignmentService.executeBatchAssignment(anyList(), anyString()))
            .thenReturn(mockResult);

        mockMvc.perform(post("/v1/smart-assignment/batch-assign")
                .param("casePackageIds", "1", "2", "3")
                .param("strategy", "INTELLIGENT"))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalCount").value(3))
            .andExpect(jsonPath("$.data.successCount").value(2));
    }

    @Test
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("GET /assess-matching - 成功评估匹配度")
    void assessMatching_ShouldReturnAssessment() throws Exception {
        MatchingAssessment mockAssessment = new MatchingAssessment();
        mockAssessment.setOverallScore(0.85);
        mockAssessment.setGeographicScore(0.9);
        mockAssessment.setStrengths(Arrays.asList("地域优势"));

        when(smartAssignmentService.assessMatching(anyLong(), anyLong()))
            .thenReturn(mockAssessment);

        mockMvc.perform(get("/v1/smart-assignment/assess-matching")
                .param("organizationId", "1")
                .param("casePackageId", "1"))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.overallScore").value(0.85));
    }

    private AssignmentRecommendationResponse createMockRecommendation(Long orgId, String orgName, Double score) {
        return AssignmentRecommendationResponse.builder()
            .organizationId(orgId)
            .organizationName(orgName)
            .organizationType("LAW_FIRM")
            .matchScore(score)
            .regionMatchScore(0.9)
            .capacityScore(0.8)
            .currentLoad(50)
            .maxCapacity(500)
            .recommendation("推荐")
            .contactPerson("张律师")
            .contactPhone("13800138000")
            .contactEmail("test@lawfirm.com")
            .assignmentStrategy("INTELLIGENT")
            .rank(1)
            .build();
    }
}
