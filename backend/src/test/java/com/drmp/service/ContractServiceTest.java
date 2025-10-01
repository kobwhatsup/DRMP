package com.drmp.service;

import com.drmp.config.BaseServiceTest;
import com.drmp.dto.request.ContractCreateRequest;
import com.drmp.dto.request.ContractUpdateRequest;
import com.drmp.dto.response.ContractDetailResponse;
import com.drmp.dto.response.ContractListResponse;
import com.drmp.entity.Contract;
import com.drmp.entity.enums.ContractStatus;
import com.drmp.entity.enums.ContractType;
import com.drmp.exception.BusinessException;
import com.drmp.repository.ContractRepository;
import com.drmp.service.impl.ContractServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * ContractService 单元测试 - 简化版
 */
@DisplayName("ContractService 测试")
class ContractServiceTest extends BaseServiceTest {

    @Mock
    private ContractRepository contractRepository;

    @InjectMocks
    private ContractServiceImpl contractService;

    private Contract testContract;
    private ContractCreateRequest createRequest;

    @BeforeEach
    void setUp() {
        testContract = new Contract();
        testContract.setId(1L);
        testContract.setContractNumber("DC2025010100001");
        testContract.setContractType(ContractType.DISPOSAL_CONTRACT);
        testContract.setStatus(ContractStatus.DRAFT);
        testContract.setPartyAId(10L);
        testContract.setPartyBId(20L);
        testContract.setVersion(1);

        createRequest = new ContractCreateRequest();
        createRequest.setContractType(ContractType.DISPOSAL_CONTRACT);
        createRequest.setPartyAId(10L);
        createRequest.setPartyBId(20L);
    }

    @Test
    @DisplayName("创建合同 - 成功创建")
    void createContract_ShouldCreateSuccessfully() {
        lenient().when(contractRepository.existsByContractNumber(any())).thenReturn(false);
        when(contractRepository.save(any(Contract.class))).thenAnswer(invocation -> {
            Contract contract = invocation.getArgument(0);
            contract.setId(1L);
            return contract;
        });
        lenient().when(contractRepository.count()).thenReturn(0L);

        ContractDetailResponse result = contractService.createContract(createRequest);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("创建合同 - 合同编号已存在")
    void createContract_WithExistingNumber_ShouldThrowException() {
        createRequest.setContractNumber("DC2025010100001");
        when(contractRepository.existsByContractNumber("DC2025010100001")).thenReturn(true);

        assertThatThrownBy(() -> contractService.createContract(createRequest))
            .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("更新合同 - 成功更新")
    void updateContract_ShouldUpdateSuccessfully() {
        ContractUpdateRequest updateRequest = new ContractUpdateRequest();
        when(contractRepository.findById(1L)).thenReturn(Optional.of(testContract));
        when(contractRepository.save(any(Contract.class))).thenReturn(testContract);

        ContractDetailResponse result = contractService.updateContract(1L, updateRequest);

        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("更新合同 - 终态不能修改")
    void updateContract_WhenFinalStatus_ShouldThrowException() {
        testContract.setStatus(ContractStatus.TERMINATED);
        ContractUpdateRequest updateRequest = new ContractUpdateRequest();
        when(contractRepository.findById(1L)).thenReturn(Optional.of(testContract));

        assertThatThrownBy(() -> contractService.updateContract(1L, updateRequest))
            .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("根据ID获取合同")
    void getContractById_ShouldReturnContract() {
        when(contractRepository.findById(1L)).thenReturn(Optional.of(testContract));

        ContractDetailResponse result = contractService.getContractById(1L);

        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("根据合同编号获取")
    void getContractByNumber_ShouldReturnContract() {
        when(contractRepository.findByContractNumber("DC2025010100001"))
            .thenReturn(Optional.of(testContract));

        ContractDetailResponse result = contractService.getContractByNumber("DC2025010100001");

        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("分页查询合同")
    void getContractList_ShouldReturnPagedContracts() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Contract> contractPage = new PageImpl<>(Arrays.asList(testContract), pageable, 1);
        when(contractRepository.findAll(pageable)).thenReturn(contractPage);

        Page<ContractListResponse> result = contractService.getContractList(pageable);

        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(1);
    }

    @Test
    @DisplayName("提交审核")
    void submitForReview_ShouldSubmitSuccessfully() {
        when(contractRepository.findById(1L)).thenReturn(Optional.of(testContract));
        when(contractRepository.save(any(Contract.class))).thenReturn(testContract);

        contractService.submitForReview(1L);

        verify(contractRepository).save(any(Contract.class));
    }

    @Test
    @DisplayName("审核通过")
    void reviewContract_WhenApproved_ShouldApproveContract() {
        testContract.setStatus(ContractStatus.PENDING_REVIEW);
        when(contractRepository.findById(1L)).thenReturn(Optional.of(testContract));
        when(contractRepository.save(any(Contract.class))).thenReturn(testContract);

        contractService.reviewContract(1L, true, "审核通过", 5L, "审核员");

        verify(contractRepository).save(any(Contract.class));
    }

    @Test
    @DisplayName("发送签署")
    void sendForSignature_ShouldSendSuccessfully() {
        testContract.setStatus(ContractStatus.APPROVED);
        when(contractRepository.findById(1L)).thenReturn(Optional.of(testContract));
        when(contractRepository.save(any(Contract.class))).thenReturn(testContract);

        contractService.sendForSignature(1L);

        verify(contractRepository).save(any(Contract.class));
    }

    @Test
    @DisplayName("取消合同")
    void cancelContract_ShouldCancelSuccessfully() {
        when(contractRepository.findById(1L)).thenReturn(Optional.of(testContract));
        when(contractRepository.save(any(Contract.class))).thenReturn(testContract);

        contractService.cancelContract(1L);

        verify(contractRepository).save(any(Contract.class));
    }

    @Test
    @DisplayName("生成合同编号")
    void generateContractNumber_ShouldGenerateNumber() {
        when(contractRepository.count()).thenReturn(10L);

        String result = contractService.generateContractNumber(ContractType.DISPOSAL_CONTRACT);

        assertThat(result).isNotNull();
        assertThat(result).startsWith("DC");
    }

    @Test
    @DisplayName("检查编号可用性")
    void isContractNumberAvailable_ShouldReturnCorrectResult() {
        when(contractRepository.existsByContractNumber("DC2025010100999")).thenReturn(false);

        boolean result = contractService.isContractNumberAvailable("DC2025010100999");

        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("获取即将到期合同")
    void getExpiringContracts_ShouldReturnContracts() {
        when(contractRepository.findExpiringContracts(any(), any(), anyList()))
            .thenReturn(Arrays.asList(testContract));

        List<ContractListResponse> result = contractService.getExpiringContracts(30);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("删除草稿合同")
    void deleteContract_WhenDraft_ShouldDeleteSuccessfully() {
        when(contractRepository.findById(1L)).thenReturn(Optional.of(testContract));
        doNothing().when(contractRepository).delete(any(Contract.class));

        contractService.deleteContract(1L);

        verify(contractRepository).delete(testContract);
    }
}
