package com.drmp.repository;

import com.drmp.config.BaseRepositoryTest;
import com.drmp.entity.Contract;
import com.drmp.entity.enums.ContractStatus;
import com.drmp.entity.enums.ContractType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * ContractRepository 测试
 */
@DisplayName("ContractRepository 测试")
class ContractRepositoryTest extends BaseRepositoryTest {

    @Autowired
    private ContractRepository contractRepository;

    private Contract testContract;

    @BeforeEach
    public void setUp() {
        super.setUp();
        contractRepository.deleteAll();

        testContract = new Contract();
        testContract.setContractNumber("CON2025010001");
        testContract.setTitle("案件包处置委托合同");
        testContract.setContractType(ContractType.DISPOSAL_CONTRACT);
        testContract.setStatus(ContractStatus.EFFECTIVE);
        testContract.setCasePackageId(1L);
        testContract.setPartyAId(1L);
        testContract.setPartyAName("银行A");
        testContract.setPartyBId(2L);
        testContract.setPartyBName("律所B");
        testContract.setContractAmount(new BigDecimal("100000.00"));
        testContract.setEffectiveDate(LocalDate.now());
        testContract.setExpiryDate(LocalDate.now().plusMonths(6));
        testContract.setRiskLevel("LOW");
        testContract.setRequiresLegalReview(false);
        testContract = contractRepository.save(testContract);
    }

    @Test
    @DisplayName("保存合同 - 成功")
    void saveContract_ShouldSaveSuccessfully() {
        Contract newContract = new Contract();
        newContract.setContractNumber("CON2025010002");
        newContract.setTitle("新合同");
        newContract.setContractType(ContractType.DISPOSAL_CONTRACT);
        newContract.setStatus(ContractStatus.DRAFT);
        newContract.setPartyAId(1L);
        newContract.setPartyBId(2L);

        Contract saved = contractRepository.save(newContract);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getContractNumber()).isEqualTo("CON2025010002");
    }

    @Test
    @DisplayName("根据合同编号查找 - 成功")
    void findByContractNumber_ShouldReturnContract() {
        Optional<Contract> found = contractRepository.findByContractNumber("CON2025010001");

        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo("案件包处置委托合同");
    }

    @Test
    @DisplayName("根据合同编号查找 - 未找到")
    void findByContractNumber_NotFound_ShouldReturnEmpty() {
        Optional<Contract> found = contractRepository.findByContractNumber("NON_EXISTENT");

        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("检查合同编号是否存在 - 存在")
    void existsByContractNumber_Exists_ShouldReturnTrue() {
        boolean exists = contractRepository.existsByContractNumber("CON2025010001");

        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("检查合同编号是否存在 - 不存在")
    void existsByContractNumber_NotExists_ShouldReturnFalse() {
        boolean exists = contractRepository.existsByContractNumber("NON_EXISTENT");

        assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("根据案件包ID查找合同")
    void findByCasePackageId_ShouldReturnContracts() {
        List<Contract> contracts = contractRepository.findByCasePackageId(1L);

        assertThat(contracts).hasSize(1);
        assertThat(contracts.get(0).getContractNumber()).isEqualTo("CON2025010001");
    }

    @Test
    @DisplayName("根据案件包ID和合同类型查找")
    void findByCasePackageIdAndContractType_ShouldReturnContracts() {
        List<Contract> contracts = contractRepository.findByCasePackageIdAndContractType(1L, ContractType.DISPOSAL_CONTRACT);

        assertThat(contracts).hasSize(1);
    }

    @Test
    @DisplayName("根据甲方ID查找合同")
    void findByPartyAId_ShouldReturnPagedContracts() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Contract> page = contractRepository.findByPartyAId(1L, pageable);

        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getTotalElements()).isEqualTo(1);
    }

    @Test
    @DisplayName("根据乙方ID查找合同")
    void findByPartyBId_ShouldReturnPagedContracts() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Contract> page = contractRepository.findByPartyBId(2L, pageable);

        assertThat(page.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("根据合同状态查找")
    void findByStatus_ShouldReturnPagedContracts() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Contract> page = contractRepository.findByStatus(ContractStatus.EFFECTIVE, pageable);

        assertThat(page.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("查找即将到期的合同")
    void findExpiringContracts_ShouldReturnContracts() {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusMonths(12);
        List<ContractStatus> statuses = Arrays.asList(ContractStatus.EFFECTIVE, ContractStatus.PARTIALLY_SIGNED);

        List<Contract> contracts = contractRepository.findExpiringContracts(startDate, endDate, statuses);

        assertThat(contracts).hasSize(1);
    }

    @Test
    @DisplayName("查找已过期的合同")
    void findExpiredContracts_ShouldReturnContracts() {
        // 创建已过期合同
        Contract expiredContract = new Contract();
        expiredContract.setContractNumber("CON2024010001");
        expiredContract.setTitle("已过期合同");
        expiredContract.setContractType(ContractType.DISPOSAL_CONTRACT);
        expiredContract.setStatus(ContractStatus.EFFECTIVE);
        expiredContract.setPartyAId(1L);
        expiredContract.setPartyBId(2L);
        expiredContract.setEffectiveDate(LocalDate.now().minusYears(1));
        expiredContract.setExpiryDate(LocalDate.now().minusDays(1));
        contractRepository.save(expiredContract);

        LocalDate currentDate = LocalDate.now();
        List<ContractStatus> statuses = Arrays.asList(ContractStatus.EFFECTIVE);

        List<Contract> contracts = contractRepository.findExpiredContracts(currentDate, statuses);

        assertThat(contracts).hasSizeGreaterThanOrEqualTo(1);
    }

    @Test
    @DisplayName("查找机构合同数量")
    void countByOrganizationId_ShouldReturnCount() {
        Long count = contractRepository.countByOrganizationId(1L);

        assertThat(count).isEqualTo(1);
    }

    @Test
    @DisplayName("统计各状态合同数量")
    void countByStatus_ShouldReturnStatistics() {
        List<Object[]> stats = contractRepository.countByStatus();

        assertThat(stats).isNotEmpty();
        assertThat(stats.get(0)).hasSize(2);
    }

    @Test
    @DisplayName("统计各类型合同数量")
    void countByContractType_ShouldReturnStatistics() {
        List<Object[]> stats = contractRepository.countByContractType();

        assertThat(stats).isNotEmpty();
        assertThat(stats.get(0)).hasSize(2);
    }

    @Test
    @DisplayName("复合条件查询合同")
    void findByConditions_ShouldReturnPagedContracts() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Contract> page = contractRepository.findByConditions(
                ContractType.DISPOSAL_CONTRACT,
                ContractStatus.EFFECTIVE,
                1L,
                null,
                LocalDate.now().minusDays(1),
                LocalDate.now().plusDays(1),
                pageable
        );

        assertThat(page.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("根据关键词搜索合同")
    void searchByKeyword_ShouldReturnPagedContracts() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Contract> page = contractRepository.searchByKeyword("案件包", pageable);

        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getContent().get(0).getTitle()).contains("案件包");
    }

    @Test
    @DisplayName("根据机构ID查找合同")
    void findByOrganizationId_ShouldReturnPagedContracts() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Contract> page = contractRepository.findByOrganizationId(1L, pageable);

        assertThat(page.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("根据合同类型查找")
    void findByContractType_ShouldReturnPagedContracts() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Contract> page = contractRepository.findByContractType(ContractType.DISPOSAL_CONTRACT, pageable);

        assertThat(page.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("查找高风险合同")
    void findHighRiskContracts_ShouldReturnContracts() {
        // 创建高风险合同
        Contract highRiskContract = new Contract();
        highRiskContract.setContractNumber("CON2025010003");
        highRiskContract.setTitle("高风险合同");
        highRiskContract.setContractType(ContractType.DISPOSAL_CONTRACT);
        highRiskContract.setStatus(ContractStatus.EFFECTIVE);
        highRiskContract.setPartyAId(1L);
        highRiskContract.setPartyBId(2L);
        highRiskContract.setRiskLevel("HIGH");
        highRiskContract.setEffectiveDate(LocalDate.now());
        highRiskContract.setExpiryDate(LocalDate.now().plusMonths(6));
        contractRepository.save(highRiskContract);

        List<Contract> contracts = contractRepository.findHighRiskContracts();

        assertThat(contracts).hasSizeGreaterThanOrEqualTo(1);
    }

    @Test
    @DisplayName("删除合同 - 成功")
    void deleteContract_ShouldDeleteSuccessfully() {
        contractRepository.delete(testContract);

        Optional<Contract> found = contractRepository.findById(testContract.getId());
        assertThat(found).isEmpty();
    }
}
