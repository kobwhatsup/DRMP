package com.drmp.controller;

import com.drmp.dto.response.ApiResponse;
import com.drmp.dto.response.AssignmentRecommendationResponse;
import com.drmp.exception.ResourceNotFoundException;
import com.drmp.service.SmartAssignmentService;
import com.drmp.service.SmartAssignmentService.*;
import com.drmp.service.assignment.AssignmentStrategyManager;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
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
@WebMvcTest(SmartAssignmentController.class)
@ActiveProfiles("test")
@DisplayName("SmartAssignmentController 测试")
class SmartAssignmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SmartAssignmentService smartAssignmentService;

    @MockBean
    private AssignmentStrategyManager strategyManager;

    // ========== 获取智能推荐测试 ==========

    @Test
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("GET /recommendations/{id} - 成功获取推荐列表")
    void getRecommendations_ShouldReturnRecommendations_WhenAuthorized() throws Exception {
        // Arrange
        Long casePackageId = 1L;
        List<AssignmentRecommendationResponse> recommendations = Arrays.asList(
            createMockRecommendation(1L, "优秀律所", 0.95),
            createMockRecommendation(2L, "普通律所", 0.75)
        );

        when(smartAssignmentService.getRecommendations(eq(casePackageId), anyInt()))
            .thenReturn(recommendations);

        // Act & Assert
        mockMvc.perform(get("/v1/smart-assignment/recommendations/{id}", casePackageId)
                .param("limit", "10"))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data").isArray())
            .andExpect(jsonPath("$.data", hasSize(2)))
            .andExpect(jsonPath("$.data[0].organizationId").value(1))
            .andExpect(jsonPath("$.data[0].organizationName").value("优秀律所"))
            .andExpect(jsonPath("$.data[0].matchScore").value(0.95))
            .andExpect(jsonPath("$.data[1].matchScore").value(0.75));

        verify(smartAssignmentService).getRecommendations(casePackageId, 10);
    }

    @Test
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("GET /recommendations/{id} - 案件包不存在时返回404")
    void getRecommendations_ShouldReturn404_WhenCasePackageNotFound() throws Exception {
        // Arrange
        Long casePackageId = 999L;
        when(smartAssignmentService.getRecommendations(eq(casePackageId), anyInt()))
            .thenThrow(new ResourceNotFoundException("案件包不存在"));

        // Act & Assert
        mockMvc.perform(get("/v1/smart-assignment/recommendations/{id}", casePackageId))
            .andDo(print())
            .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("GET /recommendations/{id} - 无权限时返回403")
    void getRecommendations_ShouldReturn403_WhenUnauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/v1/smart-assignment/recommendations/{id}", 1L))
            .andDo(print())
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /recommendations/{id} - 未认证时返回401")
    void getRecommendations_ShouldReturn401_WhenUnauthenticated() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/v1/smart-assignment/recommendations/{id}", 1L))
            .andDo(print())
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("GET /recommendations/{id} - 使用默认limit参数")
    void getRecommendations_ShouldUseDefaultLimit_WhenNotSpecified() throws Exception {
        // Arrange
        when(smartAssignmentService.getRecommendations(anyLong(), anyInt()))
            .thenReturn(new ArrayList<>());

        // Act & Assert
        mockMvc.perform(get("/v1/smart-assignment/recommendations/{id}", 1L))
            .andExpect(status().isOk());

        verify(smartAssignmentService).getRecommendations(1L, 10); // 默认limit=10
    }

    // ========== 自动分案测试 ==========

    @Test
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("POST /auto-assign/{id} - 成功执行自动分案")
    void executeAutoAssignment_ShouldReturnResult_WhenSuccessful() throws Exception {
        // Arrange
        Long casePackageId = 1L;
        Long ruleId = 1L;

        AssignmentResult mockResult = new AssignmentResult();
        mockResult.setSuccess(true);
        mockResult.setAssignedOrganizationId(1L);
        mockResult.setAssignedOrganizationName("优秀律所");
        mockResult.setMatchingScore(0.9);
        mockResult.setStrategy("INTELLIGENT");
        mockResult.setReason("自动分案成功");

        when(smartAssignmentService.executeAutoAssignment(casePackageId, ruleId))
            .thenReturn(mockResult);

        // Act & Assert
        mockMvc.perform(post("/v1/smart-assignment/auto-assign/{id}", casePackageId)
                .param("ruleId", ruleId.toString()))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.success").value(true))
            .andExpect(jsonPath("$.data.assignedOrganizationId").value(1))
            .andExpect(jsonPath("$.data.matchingScore").value(0.9))
            .andExpect(jsonPath("$.data.strategy").value("INTELLIGENT"));

        verify(smartAssignmentService).executeAutoAssignment(casePackageId, ruleId);
    }

    @Test
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("POST /auto-assign/{id} - 分案失败时返回失败结果")
    void executeAutoAssignment_ShouldReturnFailure_WhenAssignmentFails() throws Exception {
        // Arrange
        Long casePackageId = 1L;
        Long ruleId = 1L;

        AssignmentResult mockResult = new AssignmentResult();
        mockResult.setSuccess(false);
        mockResult.setReason("没有找到合适的处置机构");

        when(smartAssignmentService.executeAutoAssignment(casePackageId, ruleId))
            .thenReturn(mockResult);

        // Act & Assert
        mockMvc.perform(post("/v1/smart-assignment/auto-assign/{id}", casePackageId)
                .param("ruleId", ruleId.toString()))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.success").value(false))
            .andExpect(jsonPath("$.data.reason").value("没有找到合适的处置机构"));
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("POST /auto-assign/{id} - 无权限时返回403")
    void executeAutoAssignment_ShouldReturn403_WhenUnauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/v1/smart-assignment/auto-assign/{id}", 1L)
                .param("ruleId", "1"))
            .andDo(print())
            .andExpect(status().isForbidden());
    }

    // ========== 批量分案测试 ==========

    @Test
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("POST /batch-assign - 成功执行批量分案")
    void executeBatchAssignment_ShouldReturnResults_WhenSuccessful() throws Exception {
        // Arrange
        BatchAssignmentResult mockResult = new BatchAssignmentResult();
        mockResult.setTotalCount(3);
        mockResult.setSuccessCount(2);
        mockResult.setFailedCount(1);

        List<AssignmentResult> results = new ArrayList<>();
        AssignmentResult result1 = new AssignmentResult();
        result1.setSuccess(true);
        results.add(result1);
        mockResult.setResults(results);

        Map<String, Object> summary = new HashMap<>();
        summary.put("successRate", 66.67);
        mockResult.setSummary(summary);

        when(smartAssignmentService.executeBatchAssignment(anyList(), anyString()))
            .thenReturn(mockResult);

        // Act & Assert
        mockMvc.perform(post("/v1/smart-assignment/batch-assign")
                .param("casePackageIds", "1", "2", "3")
                .param("strategy", "INTELLIGENT"))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.totalCount").value(3))
            .andExpect(jsonPath("$.data.successCount").value(2))
            .andExpect(jsonPath("$.data.failedCount").value(1));

        verify(smartAssignmentService).executeBatchAssignment(
            argThat(list -> list.size() == 3),
            eq("INTELLIGENT")
        );
    }

    @Test
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("POST /batch-assign - 空列表时正确处理")
    void executeBatchAssignment_ShouldHandleEmptyList_WhenNoCasePackages() throws Exception {
        // Arrange
        BatchAssignmentResult mockResult = new BatchAssignmentResult();
        mockResult.setTotalCount(0);
        mockResult.setSuccessCount(0);
        mockResult.setFailedCount(0);
        mockResult.setResults(new ArrayList<>());

        when(smartAssignmentService.executeBatchAssignment(anyList(), anyString()))
            .thenReturn(mockResult);

        // Act & Assert
        mockMvc.perform(post("/v1/smart-assignment/batch-assign")
                .param("casePackageIds", "")
                .param("strategy", "INTELLIGENT"))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalCount").value(0));
    }

    // ========== 匹配度评估测试 ==========

    @Test
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("GET /assess-matching - 成功评估匹配度")
    void assessMatching_ShouldReturnAssessment_WhenSuccessful() throws Exception {
        // Arrange
        Long organizationId = 1L;
        Long casePackageId = 1L;

        MatchingAssessment mockAssessment = new MatchingAssessment();
        mockAssessment.setOverallScore(0.85);
        mockAssessment.setGeographicScore(0.9);
        mockAssessment.setCapacityScore(0.8);
        mockAssessment.setExperienceScore(0.85);
        mockAssessment.setPerformanceScore(0.9);
        mockAssessment.setAvailabilityScore(0.75);
        mockAssessment.setStrengths(Arrays.asList("地域优势", "经验丰富"));
        mockAssessment.setWeaknesses(Arrays.asList("负载较高"));
        mockAssessment.setRecommendation("推荐：综合匹配度85%");

        when(smartAssignmentService.assessMatching(organizationId, casePackageId))
            .thenReturn(mockAssessment);

        // Act & Assert
        mockMvc.perform(get("/v1/smart-assignment/assess-matching")
                .param("organizationId", organizationId.toString())
                .param("casePackageId", casePackageId.toString()))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.overallScore").value(0.85))
            .andExpect(jsonPath("$.data.geographicScore").value(0.9))
            .andExpect(jsonPath("$.data.strengths", hasSize(2)))
            .andExpect(jsonPath("$.data.strengths[0]").value("地域优势"))
            .andExpect(jsonPath("$.data.weaknesses", hasSize(1)))
            .andExpect(jsonPath("$.data.recommendation").value("推荐：综合匹配度85%"));

        verify(smartAssignmentService).assessMatching(organizationId, casePackageId);
    }

    @Test
    @WithMockUser(roles = "CASE_VIEWER")
    @DisplayName("GET /assess-matching - CASE_VIEWER角色有权限访问")
    void assessMatching_ShouldAllow_WhenUserHasCaseViewerRole() throws Exception {
        // Arrange
        MatchingAssessment mockAssessment = new MatchingAssessment();
        mockAssessment.setOverallScore(0.5);

        when(smartAssignmentService.assessMatching(anyLong(), anyLong()))
            .thenReturn(mockAssessment);

        // Act & Assert
        mockMvc.perform(get("/v1/smart-assignment/assess-matching")
                .param("organizationId", "1")
                .param("casePackageId", "1"))
            .andDo(print())
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("GET /assess-matching - 机构不存在时返回404")
    void assessMatching_ShouldReturn404_WhenOrganizationNotFound() throws Exception {
        // Arrange
        when(smartAssignmentService.assessMatching(anyLong(), anyLong()))
            .thenThrow(new ResourceNotFoundException("机构不存在"));

        // Act & Assert
        mockMvc.perform(get("/v1/smart-assignment/assess-matching")
                .param("organizationId", "999")
                .param("casePackageId", "1"))
            .andDo(print())
            .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("GET /assess-matching - 缺少必需参数时返回400")
    void assessMatching_ShouldReturn400_WhenMissingRequiredParams() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/v1/smart-assignment/assess-matching")
                .param("organizationId", "1"))
            .andDo(print())
            .andExpect(status().isBadRequest());
    }

    // ========== 辅助方法 ==========

    private AssignmentRecommendationResponse createMockRecommendation(Long orgId, String orgName, Double score) {
        return AssignmentRecommendationResponse.builder()
            .organizationId(orgId)
            .organizationName(orgName)
            .organizationType("LAW_FIRM")
            .matchScore(score)
            .regionMatchScore(0.9)
            .capacityScore(0.8)
            .experienceScore(0.85)
            .performanceScore(0.9)
            .currentLoad(50)
            .maxCapacity(500)
            .strengths(Arrays.asList("地域优势", "经验丰富"))
            .concerns(new ArrayList<>())
            .recommendation("推荐")
            .contactPerson("张律师")
            .contactPhone("13800138000")
            .contactEmail("test@lawfirm.com")
            .assignmentStrategy("INTELLIGENT")
            .rank(1)
            .build();
    }
}
