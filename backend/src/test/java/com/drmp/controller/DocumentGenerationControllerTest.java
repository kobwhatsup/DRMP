package com.drmp.controller;

import com.drmp.config.BaseControllerTest;
import com.drmp.dto.request.DocumentGenerationRequest;
import com.drmp.dto.response.DocumentGenerationResponse;
import com.drmp.entity.DocumentGeneration;
import com.drmp.service.DocumentGenerationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * DocumentGenerationController 测试
 */
@DisplayName("DocumentGenerationController 测试")
class DocumentGenerationControllerTest extends BaseControllerTest {

    @MockBean
    private DocumentGenerationService documentGenerationService;

    private DocumentGenerationResponse testResponse;

    @BeforeEach
    public void setUp() {
        super.setUp();

        testResponse = new DocumentGenerationResponse();
        testResponse.setId(1L);
        testResponse.setCaseId(1L);
        testResponse.setTemplateId(1L);
        testResponse.setStatus(DocumentGeneration.GenerationStatus.COMPLETED);
        testResponse.setFileUrl("http://example.com/doc.pdf");
        testResponse.setGeneratedAt(LocalDateTime.now());
    }

    @Test
    @WithMockUser(roles = "DISPOSAL_STAFF")
    @DisplayName("POST /api/v1/documents/generate/single - 生成单个文档")
    void generateDocument_ShouldReturnResponse() throws Exception {
        when(documentGenerationService.generateDocument(anyLong(), anyLong(), any()))
            .thenReturn(testResponse);

        mockMvc.perform(post("/api/v1/documents/generate/single")
                .param("templateId", "1")
                .param("caseId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    @WithMockUser(roles = "DISPOSAL_STAFF")
    @DisplayName("POST /api/v1/documents/generate/batch - 批量生成文档")
    void batchGenerateDocuments_ShouldReturnList() throws Exception {
        DocumentGenerationRequest request = new DocumentGenerationRequest();
        request.setTemplateId(1L);
        request.setCaseIds(Arrays.asList(1L, 2L, 3L));
        request.setDocumentName("批量生成文档");

        when(documentGenerationService.batchGenerateDocuments(any()))
            .thenReturn(Arrays.asList(testResponse));

        mockMvc.perform(post("/api/v1/documents/generate/batch")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @WithMockUser(roles = "DISPOSAL_STAFF")
    @DisplayName("GET /api/v1/documents/generations/{id}/status - 获取生成状态")
    void getGenerationStatus_ShouldReturnStatus() throws Exception {
        when(documentGenerationService.getGenerationStatus(anyLong()))
            .thenReturn(testResponse);

        mockMvc.perform(get("/api/v1/documents/generations/{id}/status", 1L))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.status").value("COMPLETED"));
    }

    @Test
    @WithMockUser(roles = "DISPOSAL_STAFF")
    @DisplayName("GET /api/v1/documents/case/{caseId} - 获取案件文档")
    void getCaseDocuments_ShouldReturnList() throws Exception {
        when(documentGenerationService.getCaseDocuments(anyLong()))
            .thenReturn(Arrays.asList(testResponse));

        mockMvc.perform(get("/api/v1/documents/case/{caseId}", 1L))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("POST /api/v1/documents/generate/single - 无权限时返回403")
    void generateDocument_ShouldReturn403_WhenUnauthorized() throws Exception {
        mockMvc.perform(post("/api/v1/documents/generate/single")
                .param("templateId", "1")
                .param("caseId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isForbidden());
    }
}
