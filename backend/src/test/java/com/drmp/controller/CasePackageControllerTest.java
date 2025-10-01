package com.drmp.controller;

import com.drmp.config.BaseControllerTest;
import com.drmp.dto.request.CasePackageCreateRequest;
import com.drmp.dto.request.CasePackageQueryRequest;
import com.drmp.dto.response.CasePackageDetailResponse;
import com.drmp.dto.response.CasePackageListResponse;
import com.drmp.entity.CasePackage;
import com.drmp.entity.enums.CasePackageStatus;
import com.drmp.exception.ResourceNotFoundException;
import com.drmp.service.CasePackageService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * CasePackageController Test
 * 案件包控制器测试
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@DisplayName("CasePackageController 测试")
class CasePackageControllerTest extends BaseControllerTest {

    @MockBean
    private CasePackageService casePackageService;

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/v1/case-packages - 成功获取案件包列表")
    void getCasePackageList_ShouldReturnPage() throws Exception {
        List<CasePackageListResponse> packages = Arrays.asList(
            createMockListResponse(1L, "案件包1", CasePackageStatus.PUBLISHED),
            createMockListResponse(2L, "案件包2", CasePackageStatus.ASSIGNED)
        );
        Page<CasePackageListResponse> page = new PageImpl<>(packages);

        when(casePackageService.getCasePackageList(any(), any()))
            .thenReturn(page);

        mockMvc.perform(get("/api/v1/case-packages")
                .param("page", "0")
                .param("size", "10"))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.content").isArray())
            .andExpect(jsonPath("$.data.content", hasSize(2)));

        verify(casePackageService).getCasePackageList(any(), any());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("GET /api/v1/case-packages - 无权限时返回403")
    void getCasePackageList_ShouldReturn403() throws Exception {
        mockMvc.perform(get("/api/v1/case-packages"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/v1/case-packages/{id} - 成功获取详情")
    void getCasePackageDetail_ShouldReturnDetail() throws Exception {
        Long packageId = 1L;
        CasePackageDetailResponse mockDetail = createMockDetailResponse(packageId);

        when(casePackageService.getCasePackageDetail(packageId)).thenReturn(mockDetail);

        mockMvc.perform(get("/api/v1/case-packages/{id}", packageId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").value(packageId));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/v1/case-packages/{id} - 不存在时返回500")
    void getCasePackageDetail_ShouldReturn500() throws Exception {
        when(casePackageService.getCasePackageDetail(anyLong()))
            .thenThrow(new ResourceNotFoundException("案件包不存在"));

        mockMvc.perform(get("/api/v1/case-packages/{id}", 999L))
            .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/v1/case-packages - 成功创建")
    void createCasePackage_ShouldReturnCreated() throws Exception {
        CasePackageCreateRequest request = createValidRequest();

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
    void createCasePackage_ShouldReturn403() throws Exception {
        CasePackageCreateRequest request = createValidRequest();

        mockMvc.perform(post("/api/v1/case-packages")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden());
    }

    private CasePackageCreateRequest createValidRequest() {
        CasePackageCreateRequest request = new CasePackageCreateRequest();
        request.setPackageCode("PKG001");
        request.setPackageName("新案件包");
        request.setCaseCount(100);
        request.setTotalAmount(new BigDecimal("5000000"));
        request.setSourceOrgId(1L);
        request.setAssignmentType(com.drmp.entity.enums.AssignmentType.MANUAL);
        request.setEntrustStartDate(LocalDateTime.now().toLocalDate());
        request.setEntrustEndDate(LocalDateTime.now().plusMonths(6).toLocalDate());
        return request;
    }

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
