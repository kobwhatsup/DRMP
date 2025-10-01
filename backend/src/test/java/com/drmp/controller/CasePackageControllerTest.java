package com.drmp.controller;

import com.drmp.common.ApiResponse;
import com.drmp.dto.request.CasePackageCreateRequest;
import com.drmp.dto.request.CasePackageQueryRequest;
import com.drmp.dto.request.CasePackageUpdateRequest;
import com.drmp.dto.response.CasePackageDetailResponse;
import com.drmp.dto.response.CasePackageListResponse;
import com.drmp.entity.CasePackage;
import com.drmp.entity.enums.CasePackageStatus;
import com.drmp.exception.ResourceNotFoundException;
import com.drmp.service.CasePackageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * CasePackageController Test
 * 案件包控制器测试 - 使用@WebMvcTest优化测试性能
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@WebMvcTest(CasePackageController.class)
@ActiveProfiles("test")
@DisplayName("CasePackageController 测试")
class CasePackageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CasePackageService casePackageService;

    // ========== 获取案件包列表测试 ==========

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/v1/case-packages - 成功获取案件包列表")
    void getCasePackageList_ShouldReturnPage_WhenAuthorized() throws Exception {
        // Arrange
        List<CasePackageListResponse> packages = Arrays.asList(
            createMockListResponse(1L, "案件包1", CasePackageStatus.PUBLISHED),
            createMockListResponse(2L, "案件包2", CasePackageStatus.ASSIGNED)
        );
        Page<CasePackageListResponse> page = new PageImpl<>(packages);

        when(casePackageService.getCasePackageList(any(CasePackageQueryRequest.class), any(Pageable.class)))
            .thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/v1/case-packages")
                .param("page", "0")
                .param("size", "10")
                .param("sortBy", "createdAt")
                .param("sortDirection", "DESC"))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content").isArray())
            .andExpect(jsonPath("$.data.content", hasSize(2)))
            .andExpect(jsonPath("$.data.content[0].id").value(1))
            .andExpect(jsonPath("$.data.content[0].packageName").value("案件包1"));

        verify(casePackageService).getCasePackageList(any(), any());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("GET /api/v1/case-packages - 无权限时返回403")
    void getCasePackageList_ShouldReturn403_WhenUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/case-packages"))
            .andExpect(status().isForbidden());
    }

    // ========== 获取案件包详情测试 ==========

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/v1/case-packages/{id} - 成功获取详情")
    void getCasePackageDetail_ShouldReturnDetail_WhenExists() throws Exception {
        Long packageId = 1L;
        CasePackageDetailResponse mockDetail = createMockDetailResponse(packageId);

        when(casePackageService.getCasePackageDetail(packageId)).thenReturn(mockDetail);

        mockMvc.perform(get("/api/v1/case-packages/{id}", packageId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").value(packageId))
            .andExpect(jsonPath("$.data.packageName").value("测试案件包"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/v1/case-packages/{id} - 不存在时返回404")
    void getCasePackageDetail_ShouldReturn404_WhenNotFound() throws Exception {
        when(casePackageService.getCasePackageDetail(anyLong()))
            .thenThrow(new ResourceNotFoundException("案件包不存在"));

        mockMvc.perform(get("/api/v1/case-packages/{id}", 999L))
            .andExpect(status().isNotFound());
    }

    // ========== 创建案件包测试 ==========

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/v1/case-packages - 成功创建")
    void createCasePackage_ShouldReturnCreated_WhenValid() throws Exception {
        CasePackageCreateRequest request = new CasePackageCreateRequest();
        request.setPackageName("新案件包");

        CasePackage mockPackage = createMockCasePackage(1L, "新案件包");
        when(casePackageService.createCasePackage(any())).thenReturn(mockPackage);

        mockMvc.perform(post("/api/v1/case-packages")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    @WithMockUser(roles = "DISPOSAL_ORG")
    @DisplayName("POST /api/v1/case-packages - DISPOSAL_ORG无权限")
    void createCasePackage_ShouldReturn403_WhenDisposalOrg() throws Exception {
        CasePackageCreateRequest request = new CasePackageCreateRequest();
        request.setPackageName("新案件包");

        mockMvc.perform(post("/api/v1/case-packages")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden());
    }

    // ========== 辅助方法 ==========

    private CasePackageListResponse createMockListResponse(Long id, String name, CasePackageStatus status) {
        CasePackageListResponse response = new CasePackageListResponse();
        response.setId(id);
        response.setPackageName(name);
        response.setStatus(status);
        response.setCaseCount(100);
        response.setTotalAmount(new BigDecimal("5000000"));
        response.setCreatedAt(LocalDateTime.now());
        return response;
    }

    private CasePackageDetailResponse createMockDetailResponse(Long id) {
        CasePackageDetailResponse response = new CasePackageDetailResponse();
        response.setId(id);
        response.setPackageName("测试案件包");
        response.setStatus(CasePackageStatus.PUBLISHED);
        response.setCaseCount(100);
        response.setTotalAmount(new BigDecimal("5000000"));
        response.setCreatedAt(LocalDateTime.now());
        return response;
    }

    private CasePackage createMockCasePackage(Long id, String name) {
        CasePackage casePackage = new CasePackage();
        casePackage.setId(id);
        casePackage.setPackageName(name);
        casePackage.setStatus(CasePackageStatus.PUBLISHED);
        casePackage.setCreatedAt(LocalDateTime.now());
        return casePackage;
    }
}
