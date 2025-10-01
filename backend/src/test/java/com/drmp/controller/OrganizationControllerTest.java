package com.drmp.controller;

import com.drmp.config.BaseControllerTest;
import com.drmp.dto.request.OrganizationApprovalRequest;
import com.drmp.dto.request.OrganizationCreateRequest;
import com.drmp.dto.request.OrganizationUpdateRequest;
import com.drmp.dto.response.OrganizationDetailResponse;
import com.drmp.dto.response.OrganizationListResponse;
import com.drmp.dto.response.PageResponse;
import com.drmp.entity.enums.OrganizationStatus;
import com.drmp.entity.enums.OrganizationType;
import com.drmp.service.OrganizationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * OrganizationController 集成测试
 */
@DisplayName("OrganizationController 测试")
class OrganizationControllerTest extends BaseControllerTest {

    @MockBean
    private OrganizationService organizationService;

    private OrganizationDetailResponse testOrgDetail;
    private OrganizationListResponse testOrgList;

    @BeforeEach
    public void setUp() {
        super.setUp();
        testOrgDetail = new OrganizationDetailResponse();
        testOrgDetail.setId(1L);
        testOrgDetail.setOrgCode("ORG001");
        testOrgDetail.setOrgName("测试机构");
        testOrgDetail.setType(OrganizationType.BANK);
        testOrgDetail.setStatus(OrganizationStatus.ACTIVE);
        testOrgDetail.setCreatedAt(LocalDateTime.now());

        testOrgList = new OrganizationListResponse();
        testOrgList.setId(1L);
        testOrgList.setOrgCode("ORG001");
        testOrgList.setOrgName("测试机构");
        testOrgList.setType(OrganizationType.BANK);
        testOrgList.setStatus(OrganizationStatus.ACTIVE);
    }

    @Test
    @WithMockUser(authorities = "organization:read")
    @DisplayName("获取机构列表 - 成功")
    void getOrganizations_ShouldReturnPagedList() throws Exception {
        PageResponse<OrganizationListResponse> pageResponse = new PageResponse<>();
        pageResponse.setContent(Arrays.asList(testOrgList));
        pageResponse.setTotalElements(1L);
        pageResponse.setTotalPages(1);
        pageResponse.setPage(0);

        when(organizationService.getOrganizations(any(Pageable.class), any(), any(), any()))
                .thenReturn(pageResponse);

        mockMvc.perform(get("/v1/organizations")
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].orgCode").value("ORG001"));

        verify(organizationService).getOrganizations(any(Pageable.class), any(), any(), any());
    }

    @Test
    @WithMockUser(authorities = "organization:read")
    @DisplayName("获取机构列表 - 带过滤条件")
    void getOrganizations_WithFilters_ShouldReturnFilteredList() throws Exception {
        PageResponse<OrganizationListResponse> pageResponse = new PageResponse<>();
        pageResponse.setContent(Arrays.asList(testOrgList));

        when(organizationService.getOrganizations(any(Pageable.class), eq("测试"), eq(OrganizationType.BANK), eq(OrganizationStatus.ACTIVE)))
                .thenReturn(pageResponse);

        mockMvc.perform(get("/v1/organizations")
                        .param("keyword", "测试")
                        .param("type", "BANK")
                        .param("status", "ACTIVE")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(organizationService).getOrganizations(any(Pageable.class), eq("测试"), eq(OrganizationType.BANK), eq(OrganizationStatus.ACTIVE));
    }

    @Test
    @WithMockUser(authorities = "organization:read")
    @DisplayName("获取机构详情 - 成功")
    void getOrganization_ShouldReturnDetail() throws Exception {
        when(organizationService.getOrganizationDetail(1L)).thenReturn(testOrgDetail);

        mockMvc.perform(get("/v1/organizations/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.orgCode").value("ORG001"))
                .andExpect(jsonPath("$.data.orgName").value("测试机构"));

        verify(organizationService).getOrganizationDetail(1L);
    }

    @Test
    @WithMockUser(authorities = "organization:create")
    @DisplayName("创建机构 - 成功")
    void createOrganization_ShouldCreateSuccessfully() throws Exception {
        OrganizationCreateRequest request = new OrganizationCreateRequest();
        request.setOrgName("新机构");
        request.setType(OrganizationType.BANK);

        when(organizationService.createOrganization(any(OrganizationCreateRequest.class)))
                .thenReturn(testOrgDetail);

        mockMvc.perform(post("/v1/organizations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.orgCode").value("ORG001"));

        verify(organizationService).createOrganization(any(OrganizationCreateRequest.class));
    }

    @Test
    @WithMockUser(authorities = "organization:update")
    @DisplayName("更新机构 - 成功")
    void updateOrganization_ShouldUpdateSuccessfully() throws Exception {
        OrganizationUpdateRequest request = new OrganizationUpdateRequest();
        request.setEmail("new@example.com");

        when(organizationService.updateOrganization(eq(1L), any(OrganizationUpdateRequest.class)))
                .thenReturn(testOrgDetail);

        mockMvc.perform(put("/v1/organizations/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(organizationService).updateOrganization(eq(1L), any(OrganizationUpdateRequest.class));
    }

    @Test
    @WithMockUser(authorities = "organization:delete")
    @DisplayName("删除机构 - 成功")
    void deleteOrganization_ShouldDeleteSuccessfully() throws Exception {
        mockMvc.perform(delete("/v1/organizations/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(organizationService).deleteOrganization(1L);
    }

    @Test
    @WithMockUser(authorities = "organization:read")
    @DisplayName("获取待审批机构列表 - 成功")
    void getApplications_ShouldReturnPendingList() throws Exception {
        PageResponse<OrganizationListResponse> pageResponse = new PageResponse<>();
        pageResponse.setContent(Arrays.asList(testOrgList));

        when(organizationService.getOrganizations(any(Pageable.class), isNull(), isNull(), eq(OrganizationStatus.PENDING)))
                .thenReturn(pageResponse);

        mockMvc.perform(get("/v1/organizations/applications")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(organizationService).getOrganizations(any(Pageable.class), isNull(), isNull(), eq(OrganizationStatus.PENDING));
    }

    @Test
    @WithMockUser(authorities = "organization:approve")
    @DisplayName("审批通过机构 - 成功")
    void approveOrganization_ShouldApproveSuccessfully() throws Exception {
        OrganizationApprovalRequest request = new OrganizationApprovalRequest();
        request.setRemark("审批通过");

        when(organizationService.approveOrganization(eq(1L), any(OrganizationApprovalRequest.class)))
                .thenReturn(testOrgDetail);

        mockMvc.perform(post("/v1/organizations/1/approve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(organizationService).approveOrganization(eq(1L), any(OrganizationApprovalRequest.class));
    }

    @Test
    @WithMockUser(authorities = "organization:approve")
    @DisplayName("审批拒绝机构 - 成功")
    void rejectOrganization_ShouldRejectSuccessfully() throws Exception {
        OrganizationApprovalRequest request = new OrganizationApprovalRequest();
        request.setRemark("不符合要求");

        when(organizationService.rejectOrganization(eq(1L), any(OrganizationApprovalRequest.class)))
                .thenReturn(testOrgDetail);

        mockMvc.perform(post("/v1/organizations/1/reject")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(organizationService).rejectOrganization(eq(1L), any(OrganizationApprovalRequest.class));
    }

    @Test
    @WithMockUser(authorities = "organization:update")
    @DisplayName("暂停机构 - 成功")
    void suspendOrganization_ShouldSuspendSuccessfully() throws Exception {
        when(organizationService.suspendOrganization(eq(1L), anyString()))
                .thenReturn(testOrgDetail);

        mockMvc.perform(post("/v1/organizations/1/suspend")
                        .param("reason", "违规操作")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(organizationService).suspendOrganization(eq(1L), anyString());
    }

    @Test
    @WithMockUser(authorities = "organization:update")
    @DisplayName("激活机构 - 成功")
    void activateOrganization_ShouldActivateSuccessfully() throws Exception {
        when(organizationService.activateOrganization(1L))
                .thenReturn(testOrgDetail);

        mockMvc.perform(post("/v1/organizations/1/activate")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(organizationService).activateOrganization(1L);
    }

    @Test
    @WithMockUser(authorities = "organization:read")
    @DisplayName("获取机构统计信息 - 成功")
    void getOrganizationStatistics_ShouldReturnStats() throws Exception {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrganizations", 100L);
        stats.put("activeOrganizations", 80L);
        stats.put("pendingOrganizations", 10L);

        when(organizationService.getOrganizationStatistics()).thenReturn(stats);

        mockMvc.perform(get("/v1/organizations/statistics")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalOrganizations").value(100));

        verify(organizationService).getOrganizationStatistics();
    }

    @Test
    @WithMockUser(authorities = "organization:update")
    @DisplayName("更新会员费支付 - 成功")
    void updateMembershipPayment_ShouldUpdateSuccessfully() throws Exception {
        when(organizationService.updateMembershipPayment(eq(1L), anyString(), anyString(), anyString()))
                .thenReturn(testOrgDetail);

        mockMvc.perform(post("/v1/organizations/1/membership/payment")
                        .param("paymentMethod", "BANK_TRANSFER")
                        .param("paymentReference", "REF123")
                        .param("remark", "已支付")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(organizationService).updateMembershipPayment(eq(1L), anyString(), anyString(), anyString());
    }

    @Test
    @WithMockUser(authorities = "organization:read")
    @DisplayName("获取待缴会员费机构列表 - 成功")
    void getPendingMembershipPayments_ShouldReturnList() throws Exception {
        PageResponse<OrganizationListResponse> pageResponse = new PageResponse<>();
        pageResponse.setContent(Arrays.asList(testOrgList));

        when(organizationService.getPendingMembershipPayments(any(Pageable.class)))
                .thenReturn(pageResponse);

        mockMvc.perform(get("/v1/organizations/membership/pending")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(organizationService).getPendingMembershipPayments(any(Pageable.class));
    }

    @Test
    @DisplayName("未授权访问 - 应返回403")
    void unauthorizedAccess_ShouldReturn403() throws Exception {
        mockMvc.perform(get("/v1/organizations")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}
