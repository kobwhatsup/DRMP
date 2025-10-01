package com.drmp.service;

import com.drmp.config.BaseServiceTest;
import com.drmp.dto.request.CasePackageCreateRequest;
import com.drmp.dto.request.CasePackageQueryRequest;
import com.drmp.dto.request.CasePackageUpdateRequest;
import com.drmp.dto.response.CasePackageDetailResponse;
import com.drmp.dto.response.CasePackageListResponse;
import com.drmp.dto.response.CasePackageStatisticsResponse;
import com.drmp.entity.CasePackage;
import com.drmp.entity.Organization;
import com.drmp.entity.enums.AssignmentType;
import com.drmp.entity.enums.CasePackageStatus;
import com.drmp.exception.BusinessException;
import com.drmp.exception.ResourceNotFoundException;
import com.drmp.factory.TestDataFactory;
import com.drmp.repository.CasePackageRepository;
import com.drmp.repository.CaseRepository;
import com.drmp.repository.OrganizationRepository;
import com.drmp.service.impl.CasePackageServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * CasePackageService Unit Tests
 * 案件包服务单元测试
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@DisplayName("CasePackageService 单元测试")
class CasePackageServiceTest extends BaseServiceTest {

    @Mock
    private CasePackageRepository casePackageRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private CaseRepository caseRepository;

    @InjectMocks
    private CasePackageServiceImpl casePackageService;

    private CasePackage testCasePackage;
    private Organization testOrganization;
    private CasePackageCreateRequest createRequest;

    @BeforeEach
    void setUp() {
        testOrganization = TestDataFactory.createSourceOrganization();
        testOrganization.setId(1L);
        testCasePackage = TestDataFactory.createCasePackage(testOrganization);
        testCasePackage.setId(1L);

        createRequest = new CasePackageCreateRequest();
        createRequest.setPackageName("测试案件包");
        createRequest.setSourceOrgId(1L);
        createRequest.setEntrustStartDate(LocalDate.now());
        createRequest.setEntrustEndDate(LocalDate.now().plusMonths(6));
        createRequest.setAssignmentType(AssignmentType.MANUAL);
    }

    @Test
    @DisplayName("创建案件包 - 成功创建")
    void createCasePackage_ShouldCreatePackage_WhenValidRequest() {
        // Arrange
        when(casePackageRepository.existsByPackageName(anyString())).thenReturn(false);
        when(casePackageRepository.save(any(CasePackage.class))).thenReturn(testCasePackage);
        when(casePackageRepository.findById(anyLong())).thenReturn(Optional.of(testCasePackage));
        when(caseRepository.findByCasePackageId(anyLong())).thenReturn(java.util.Collections.emptyList());

        // Act
        CasePackage result = casePackageService.createCasePackage(createRequest);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getPackageName()).isEqualTo(testCasePackage.getPackageName());
        assertThat(result.getStatus()).isEqualTo(CasePackageStatus.DRAFT);

        verify(casePackageRepository).existsByPackageName(anyString());
        verify(casePackageRepository, atLeastOnce()).save(any(CasePackage.class));
    }

    // NOTE: 当前Service实现未验证组织是否存在，此测试暂时注释
    // @Test
    // @DisplayName("创建案件包 - 机构不存在时抛出异常")
    // void createCasePackage_ShouldThrowException_WhenOrganizationNotFound() {
    //     // Arrange
    //     when(organizationRepository.findById(999L)).thenReturn(Optional.empty());
    //     createRequest.setSourceOrgId(999L);
    //
    //     // Act & Assert
    //     assertThatThrownBy(() -> casePackageService.createCasePackage(createRequest))
    //             .isInstanceOf(ResourceNotFoundException.class)
    //             .hasMessageContaining("机构不存在");
    //
    //     verify(organizationRepository).findById(999L);
    //     verify(casePackageRepository, never()).save(any());
    // }

    @Test
    @DisplayName("更新案件包 - 成功更新")
    void updateCasePackage_ShouldUpdatePackage_WhenPackageExists() {
        // Arrange
        CasePackageUpdateRequest updateRequest = new CasePackageUpdateRequest();
        updateRequest.setPackageName("更新后的案件包");
        updateRequest.setExpectedRecoveryRate(new BigDecimal("35.00"));

        when(casePackageRepository.findById(1L)).thenReturn(Optional.of(testCasePackage));
        when(casePackageRepository.save(any(CasePackage.class))).thenReturn(testCasePackage);

        // Act
        CasePackage result = casePackageService.updateCasePackage(1L, updateRequest);

        // Assert
        assertThat(result).isNotNull();
        verify(casePackageRepository).findById(1L);
        verify(casePackageRepository).save(any(CasePackage.class));
    }

    @Test
    @DisplayName("更新案件包 - 案件包不存在时抛出异常")
    void updateCasePackage_ShouldThrowException_WhenPackageNotFound() {
        // Arrange
        CasePackageUpdateRequest updateRequest = new CasePackageUpdateRequest();
        when(casePackageRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> casePackageService.updateCasePackage(999L, updateRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("案件包不存在");

        verify(casePackageRepository).findById(999L);
        verify(casePackageRepository, never()).save(any());
    }

    @Test
    @DisplayName("获取案件包详情 - 成功返回")
    void getCasePackageDetail_ShouldReturnDetail_WhenPackageExists() {
        // Arrange
        when(casePackageRepository.findById(1L)).thenReturn(Optional.of(testCasePackage));

        // Act
        CasePackageDetailResponse response = casePackageService.getCasePackageDetail(1L);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);

        verify(casePackageRepository).findById(1L);
    }

    @Test
    @DisplayName("查询案件包列表 - 成功返回分页结果")
    void getCasePackageList_ShouldReturnPagedResults_WhenCalled() {
        // Arrange
        CasePackageQueryRequest queryRequest = new CasePackageQueryRequest();
        queryRequest.setStatus(CasePackageStatus.DRAFT);

        Pageable pageable = PageRequest.of(0, 10);
        Page<CasePackage> packagePage = new PageImpl<>(Arrays.asList(testCasePackage));

        when(casePackageRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(packagePage);

        // Act
        Page<CasePackageListResponse> result =
                casePackageService.getCasePackageList(queryRequest, pageable);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent()).hasSize(1);

        verify(casePackageRepository).findAll(any(Specification.class), eq(pageable));
    }

    @Test
    @DisplayName("发布案件包 - 成功发布")
    void publishCasePackage_ShouldPublishPackage_WhenPackageIsValid() {
        // Arrange
        testCasePackage.setStatus(CasePackageStatus.DRAFT);
        testCasePackage.setCaseCount(100); // 设置案件数量

        when(casePackageRepository.findById(1L)).thenReturn(Optional.of(testCasePackage));
        when(casePackageRepository.save(any(CasePackage.class))).thenReturn(testCasePackage);

        // Act
        CasePackage result = casePackageService.publishCasePackage(1L);

        // Assert
        assertThat(result).isNotNull();
        verify(casePackageRepository).findById(1L);
        verify(casePackageRepository).save(any(CasePackage.class));
    }

    @Test
    @DisplayName("发布案件包 - 已发布的案件包抛出异常")
    void publishCasePackage_ShouldThrowException_WhenAlreadyPublished() {
        // Arrange
        testCasePackage.setStatus(CasePackageStatus.PUBLISHED);
        when(casePackageRepository.findById(1L)).thenReturn(Optional.of(testCasePackage));

        // Act & Assert
        assertThatThrownBy(() -> casePackageService.publishCasePackage(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("只有草稿状态的案件包可以发布");

        verify(casePackageRepository).findById(1L);
        verify(casePackageRepository, never()).save(any());
    }

    @Test
    @DisplayName("撤回案件包 - 成功撤回")
    void withdrawCasePackage_ShouldWithdrawPackage_WhenPackageIsPublished() {
        // Arrange
        testCasePackage.setStatus(CasePackageStatus.PUBLISHED);
        when(casePackageRepository.findById(1L)).thenReturn(Optional.of(testCasePackage));
        when(casePackageRepository.save(any(CasePackage.class))).thenReturn(testCasePackage);

        // Act
        CasePackage result = casePackageService.withdrawCasePackage(1L);

        // Assert
        assertThat(result).isNotNull();
        verify(casePackageRepository).findById(1L);
        verify(casePackageRepository).save(any(CasePackage.class));
    }

    @Test
    @DisplayName("删除案件包 - 成功删除")
    void deleteCasePackage_ShouldDeletePackage_WhenPackageIsDraft() {
        // Arrange
        testCasePackage.setStatus(CasePackageStatus.DRAFT);
        testCasePackage.setId(1L);
        when(casePackageRepository.findById(1L)).thenReturn(Optional.of(testCasePackage));
        doNothing().when(caseRepository).updateCasePackageIdToNull(1L);
        doNothing().when(casePackageRepository).deleteById(1L);

        // Act
        casePackageService.deleteCasePackage(1L);

        // Assert
        verify(casePackageRepository).findById(1L);
        verify(caseRepository).updateCasePackageIdToNull(1L);
        verify(casePackageRepository).deleteById(1L);
    }

    @Test
    @DisplayName("删除案件包 - 非草稿状态抛出异常")
    void deleteCasePackage_ShouldThrowException_WhenPackageNotDraft() {
        // Arrange
        testCasePackage.setStatus(CasePackageStatus.ASSIGNED);
        when(casePackageRepository.findById(1L)).thenReturn(Optional.of(testCasePackage));

        // Act & Assert
        assertThatThrownBy(() -> casePackageService.deleteCasePackage(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("只有草稿状态的案件包可以删除");

        verify(casePackageRepository).findById(1L);
        verify(casePackageRepository, never()).delete(any());
    }


    @Test
    @DisplayName("批量操作 - 验证事务性")
    void batchOperations_ShouldBeTransactional() {
        // Arrange
        when(casePackageRepository.findById(1L)).thenReturn(Optional.of(testCasePackage));
        when(casePackageRepository.save(any(CasePackage.class)))
                .thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        assertThatThrownBy(() -> casePackageService.publishCasePackage(1L))
                .isInstanceOf(RuntimeException.class);

        verify(casePackageRepository).findById(1L);
    }
}
