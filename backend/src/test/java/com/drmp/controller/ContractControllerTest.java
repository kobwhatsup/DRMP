package com.drmp.controller;

import com.drmp.config.BaseControllerTest;
import com.drmp.dto.request.ContractCreateRequest;
import com.drmp.dto.request.ContractUpdateRequest;
import com.drmp.dto.response.ContractDetailResponse;
import com.drmp.dto.response.ContractListResponse;
import com.drmp.entity.enums.ContractStatus;
import com.drmp.entity.enums.ContractType;
import com.drmp.service.ContractService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.ArgumentMatchers;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * ContractController 测试
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@DisplayName("ContractController 测试")
class ContractControllerTest extends BaseControllerTest {

    @MockBean
    private ContractService contractService;

    private ContractDetailResponse testContractDetail;
    private ContractListResponse testContractList;

    @BeforeEach
    public void setUp() {
        super.setUp();

        testContractDetail = new ContractDetailResponse();
        testContractDetail.setId(1L);
        testContractDetail.setContractNumber("CON2025010001");
        testContractDetail.setTitle("处置委托合同");
        testContractDetail.setContractType(ContractType.DISPOSAL_CONTRACT);
        testContractDetail.setStatus(ContractStatus.DRAFT);
        testContractDetail.setContractAmount(new BigDecimal("100000.00"));

        testContractList = new ContractListResponse();
        testContractList.setId(1L);
        testContractList.setContractNumber("CON2025010001");
        testContractList.setTitle("处置委托合同");
        testContractList.setContractType(ContractType.DISPOSAL_CONTRACT);
        testContractList.setStatus(ContractStatus.DRAFT);
    }

    @Test
    @WithMockUser(roles = "CONTRACT_MANAGER")
    @DisplayName("POST /v1/contracts - 创建合同成功")
    void createContract_ShouldReturnCreated() throws Exception {
        ContractCreateRequest request = new ContractCreateRequest();
        request.setContractNumber("CON2025010001");
        request.setTitle("处置委托合同");
        request.setContractType(ContractType.DISPOSAL_CONTRACT);
        request.setPartyAId(1L);
        request.setPartyAName("银行A");
        request.setPartyBId(2L);
        request.setPartyBName("律所B");

        when(contractService.createContract(any())).thenReturn(testContractDetail);

        mockMvc.perform(post("/v1/contracts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.id").value(1))
            .andExpect(jsonPath("$.data.contractNumber").value("CON2025010001"));

        verify(contractService).createContract(any());
    }

    @Test
    @WithMockUser(roles = "CONTRACT_MANAGER")
    @DisplayName("PUT /v1/contracts/{id} - 更新合同成功")
    void updateContract_ShouldReturnUpdated() throws Exception {
        ContractUpdateRequest request = new ContractUpdateRequest();
        request.setTitle("更新后的合同");

        when(contractService.updateContract(eq(1L), any())).thenReturn(testContractDetail);

        mockMvc.perform(put("/v1/contracts/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));

        verify(contractService).updateContract(eq(1L), any());
    }

    @Test
    @WithMockUser(roles = "CONTRACT_VIEWER")
    @DisplayName("GET /v1/contracts/{id} - 获取合同详情")
    void getContractById_ShouldReturnDetail() throws Exception {
        when(contractService.getContractById(1L)).thenReturn(testContractDetail);

        mockMvc.perform(get("/v1/contracts/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").value(1))
            .andExpect(jsonPath("$.data.contractNumber").value("CON2025010001"));
    }

    @Test
    @WithMockUser(roles = "CONTRACT_VIEWER")
    @DisplayName("GET /v1/contracts/number/{number} - 根据编号获取合同")
    void getContractByNumber_ShouldReturnDetail() throws Exception {
        when(contractService.getContractByNumber("CON2025010001")).thenReturn(testContractDetail);

        mockMvc.perform(get("/v1/contracts/number/CON2025010001"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.contractNumber").value("CON2025010001"));
    }

    @Test
    @WithMockUser(roles = "CONTRACT_VIEWER")
    @DisplayName("GET /v1/contracts - 获取合同列表")
    void getContractList_ShouldReturnPage() throws Exception {
        Page<ContractListResponse> page = new PageImpl<>(Arrays.asList(testContractList));
        when(contractService.getContractList(ArgumentMatchers.any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/v1/contracts")
                .param("page", "0")
                .param("size", "20"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content").isArray())
            .andExpect(jsonPath("$.data.content", hasSize(1)));
    }

    @Test
    @WithMockUser(roles = "CONTRACT_VIEWER")
    @DisplayName("GET /v1/contracts/search - 条件查询合同")
    void searchContracts_ShouldReturnFiltered() throws Exception {
        Page<ContractListResponse> page = new PageImpl<>(Arrays.asList(testContractList));
        when(contractService.searchContracts(any(), any(), any(), any(), any(), any(), any())).thenReturn(page);

        mockMvc.perform(get("/v1/contracts/search")
                .param("contractType", "DISPOSAL_CONTRACT")
                .param("status", "DRAFT"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @WithMockUser(roles = "CONTRACT_VIEWER")
    @DisplayName("GET /v1/contracts/search/keyword - 关键词搜索")
    void searchByKeyword_ShouldReturnResults() throws Exception {
        Page<ContractListResponse> page = new PageImpl<>(Arrays.asList(testContractList));
        when(contractService.searchByKeyword(eq("处置"), any())).thenReturn(page);

        mockMvc.perform(get("/v1/contracts/search/keyword")
                .param("keyword", "处置"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @WithMockUser(roles = "CONTRACT_MANAGER")
    @DisplayName("POST /v1/contracts/{id}/submit-review - 提交审核")
    void submitForReview_ShouldSucceed() throws Exception {
        mockMvc.perform(post("/v1/contracts/1/submit-review"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));

        verify(contractService).submitForReview(1L);
    }

    @Test
    @WithMockUser(roles = "LEGAL_REVIEWER")
    @DisplayName("POST /v1/contracts/{id}/review - 审核合同")
    void reviewContract_ShouldSucceed() throws Exception {
        mockMvc.perform(post("/v1/contracts/1/review")
                .param("approved", "true")
                .param("comments", "审核通过")
                .param("reviewerId", "1")
                .param("reviewerName", "审核员"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));

        verify(contractService).reviewContract(eq(1L), eq(true), anyString(), anyLong(), anyString());
    }

    @Test
    @WithMockUser(roles = "CONTRACT_MANAGER")
    @DisplayName("POST /v1/contracts/{id}/send-signature - 发送签署")
    void sendForSignature_ShouldSucceed() throws Exception {
        mockMvc.perform(post("/v1/contracts/1/send-signature"))
            .andExpect(status().isOk());

        verify(contractService).sendForSignature(1L);
    }

    @Test
    @WithMockUser(roles = "CONTRACT_SIGNER")
    @DisplayName("POST /v1/contracts/{id}/sign - 签署合同")
    void signContract_ShouldSucceed() throws Exception {
        mockMvc.perform(post("/v1/contracts/1/sign")
                .param("partyType", "PARTY_A")
                .param("signerName", "张三"))
            .andExpect(status().isOk());

        verify(contractService).signContract(eq(1L), eq("PARTY_A"), eq("张三"));
    }

    @Test
    @WithMockUser(roles = "CONTRACT_MANAGER")
    @DisplayName("POST /v1/contracts/{id}/make-effective - 使合同生效")
    void makeContractEffective_ShouldSucceed() throws Exception {
        mockMvc.perform(post("/v1/contracts/1/make-effective"))
            .andExpect(status().isOk());

        verify(contractService).makeContractEffective(1L);
    }

    @Test
    @WithMockUser(roles = "CONTRACT_MANAGER")
    @DisplayName("POST /v1/contracts/{id}/renew - 续约合同")
    void renewContract_ShouldReturnNewContract() throws Exception {
        when(contractService.renewContract(eq(1L), any())).thenReturn(testContractDetail);

        mockMvc.perform(post("/v1/contracts/1/renew")
                .param("newExpiryDate", "2026-01-01"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    @WithMockUser(roles = "CONTRACT_MANAGER")
    @DisplayName("DELETE /v1/contracts/{id} - 删除合同")
    void deleteContract_ShouldSucceed() throws Exception {
        mockMvc.perform(delete("/v1/contracts/1"))
            .andExpect(status().isOk());

        verify(contractService).deleteContract(1L);
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("POST /v1/contracts - 无权限时返回403")
    void createContract_ShouldReturn403_WhenUnauthorized() throws Exception {
        ContractCreateRequest request = new ContractCreateRequest();
        request.setContractNumber("CON2025010001");
        request.setTitle("处置委托合同");
        request.setContractType(ContractType.DISPOSAL_CONTRACT);
        request.setPartyAId(1L);
        request.setPartyAName("银行A");
        request.setPartyBId(2L);
        request.setPartyBName("律所B");

        mockMvc.perform(post("/v1/contracts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden());
    }
}
