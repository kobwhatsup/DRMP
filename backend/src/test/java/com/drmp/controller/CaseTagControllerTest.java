package com.drmp.controller;

import com.drmp.config.BaseControllerTest;
import com.drmp.dto.request.CaseTagCreateRequest;
import com.drmp.dto.response.CaseTagResponse;
import com.drmp.entity.CaseTag;
import com.drmp.service.CaseTagService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("CaseTagController 测试")
class CaseTagControllerTest extends BaseControllerTest {

    @MockBean
    private CaseTagService caseTagService;

    @Test
    @WithMockUser(roles = "DISPOSAL_STAFF")
    @DisplayName("POST /api/v1/case-tags - 创建标签")
    void createCaseTag_ShouldReturnResponse() throws Exception {
        CaseTagCreateRequest request = new CaseTagCreateRequest();
        request.setCaseId(1L);
        request.setTagName("重点案件");
        request.setTagCategory(CaseTag.TagCategory.PRIORITY);

        CaseTagResponse response = new CaseTagResponse();
        response.setId(1L);
        response.setTagName("重点案件");

        when(caseTagService.createCaseTag(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/case-tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @WithMockUser(roles = "DISPOSAL_STAFF")
    @DisplayName("GET /api/v1/case-tags/case/{caseId} - 获取案件标签")
    void getCaseTags_ShouldReturnList() throws Exception {
        List<CaseTagResponse> responses = Arrays.asList(new CaseTagResponse());
        when(caseTagService.getCaseTags(anyLong())).thenReturn(responses);

        mockMvc.perform(get("/api/v1/case-tags/case/{caseId}", 1L))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @WithMockUser(roles = "DISPOSAL_STAFF")
    @DisplayName("DELETE /api/v1/case-tags/{id} - 删除标签")
    void deleteCaseTag_ShouldSucceed() throws Exception {
        mockMvc.perform(delete("/api/v1/case-tags/{id}", 1L))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("POST /api/v1/case-tags - 无权限返回403")
    void createCaseTag_ShouldReturn403_WhenUnauthorized() throws Exception {
        CaseTagCreateRequest request = new CaseTagCreateRequest();
        request.setCaseId(1L);
        request.setTagName("测试");
        request.setTagCategory(CaseTag.TagCategory.PRIORITY);

        mockMvc.perform(post("/api/v1/case-tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden());
    }
}
