package com.drmp.service;

import com.drmp.config.BaseServiceTest;
import com.drmp.dto.request.OrganizationCreateRequest;
import com.drmp.dto.request.OrganizationUpdateRequest;
import com.drmp.dto.response.OrganizationDetailResponse;
import com.drmp.entity.Organization;
import com.drmp.entity.enums.OrganizationStatus;
import com.drmp.entity.enums.OrganizationType;
import com.drmp.exception.BusinessException;
import com.drmp.factory.TestDataFactory;
import com.drmp.repository.OrganizationRepository;
import com.drmp.repository.UserRepository;
import com.drmp.service.impl.OrganizationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * OrganizationService Unit Tests
 * 机构服务单元测试
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@DisplayName("OrganizationService 单元测试")
class OrganizationServiceTest extends BaseServiceTest {

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrganizationAuditService auditService;

    @InjectMocks
    private OrganizationServiceImpl organizationService;

    private Organization testOrganization;
    private OrganizationCreateRequest createRequest;
    private OrganizationUpdateRequest updateRequest;

    @BeforeEach
    void setUp() {
        // 创建测试机构
        testOrganization = TestDataFactory.createDisposalOrganization();
        testOrganization.setId(1L);
        testOrganization.setOrgCode("ORG20250101");
        testOrganization.setName("北京律师事务所");
        testOrganization.setType(OrganizationType.LAW_FIRM);
        testOrganization.setStatus(OrganizationStatus.ACTIVE);
        testOrganization.setApprovalStatus("APPROVED");
        testOrganization.setContactPerson("张三");
        testOrganization.setContactPhone("13800138000");
        testOrganization.setEmail("org@example.com");
        testOrganization.setTeamSize(50);
        testOrganization.setMonthlyCaseCapacity(1000);

        // 创建请求对象
        createRequest = new OrganizationCreateRequest();
        createRequest.setOrgCode("ORG20250102");
        createRequest.setOrgName("上海律师事务所");
        createRequest.setType(OrganizationType.LAW_FIRM);
        createRequest.setContactPerson("李四");
        createRequest.setContactPhone("13900139000");
        createRequest.setEmail("shanghai@example.com");
        createRequest.setBusinessLicense("91310000MA1234567X");

        updateRequest = new OrganizationUpdateRequest();
        updateRequest.setOrgName("北京律师事务所（更新）");
        updateRequest.setContactPerson("王五");
        updateRequest.setContactPhone("13700137000");
        updateRequest.setTeamSize(60);
        updateRequest.setMonthlyCaseCapacity(1200);
    }

    @Test
    @DisplayName("获取机构详情 - 成功返回详情")
    void getOrganizationDetail_ShouldReturnDetail_WhenOrganizationExists() {
        // Arrange
        when(organizationRepository.findByIdWithCollections(1L))
                .thenReturn(Optional.of(testOrganization));

        // Act
        OrganizationDetailResponse result = organizationService.getOrganizationDetail(1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getOrgCode()).isEqualTo("ORG20250101");
        assertThat(result.getType()).isEqualTo(OrganizationType.LAW_FIRM);
        assertThat(result.getStatus()).isEqualTo(OrganizationStatus.ACTIVE);
        assertThat(result.getContactPerson()).isEqualTo("张三");
        assertThat(result.getContactPhone()).isEqualTo("13800138000");
        assertThat(result.getEmail()).isEqualTo("org@example.com");

        verify(organizationRepository).findByIdWithCollections(1L);
    }

    @Test
    @DisplayName("获取机构详情 - 机构不存在时抛出异常")
    void getOrganizationDetail_ShouldThrowException_WhenOrganizationNotFound() {
        // Arrange
        when(organizationRepository.findByIdWithCollections(999L))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> organizationService.getOrganizationDetail(999L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("机构不存在");

        verify(organizationRepository).findByIdWithCollections(999L);
    }

    @Test
    @DisplayName("创建机构 - 成功创建")
    void createOrganization_ShouldCreateOrganization_WhenRequestValid() {
        // Arrange
        when(organizationRepository.existsByOrgCode("ORG20250102")).thenReturn(false);
        when(organizationRepository.save(any(Organization.class))).thenAnswer(invocation -> {
            Organization org = invocation.getArgument(0);
            org.setId(2L);
            return org;
        });

        // Act
        OrganizationDetailResponse result = organizationService.createOrganization(createRequest);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(2L);
        assertThat(result.getOrgCode()).isEqualTo("ORG20250102");
        assertThat(result.getStatus()).isEqualTo(OrganizationStatus.PENDING);

        verify(organizationRepository).existsByOrgCode("ORG20250102");
        verify(organizationRepository).save(argThat(org ->
            org.getOrgCode().equals("ORG20250102") &&
            org.getStatus() == OrganizationStatus.PENDING &&
            org.getApprovalStatus().equals("PENDING")
        ));
    }

    @Test
    @DisplayName("创建机构 - 机构代码已存在时抛出异常")
    void createOrganization_ShouldThrowException_WhenOrgCodeExists() {
        // Arrange
        when(organizationRepository.existsByOrgCode("ORG20250102")).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> organizationService.createOrganization(createRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("机构代码已存在");

        verify(organizationRepository).existsByOrgCode("ORG20250102");
        verify(organizationRepository, never()).save(any());
    }

    @Test
    @DisplayName("更新机构 - 成功更新机构信息")
    void updateOrganization_ShouldUpdateOrganization_WhenOrganizationExists() {
        // Arrange
        when(organizationRepository.findById(1L)).thenReturn(Optional.of(testOrganization));
        when(organizationRepository.save(any(Organization.class))).thenReturn(testOrganization);

        // Act
        OrganizationDetailResponse result = organizationService.updateOrganization(1L, updateRequest);

        // Assert
        assertThat(result).isNotNull();
        verify(organizationRepository).findById(1L);
        verify(organizationRepository).save(argThat(org ->
            org.getName().equals("北京律师事务所（更新）") &&
            org.getContactPerson().equals("王五") &&
            org.getContactPhone().equals("13700137000") &&
            org.getTeamSize() == 60 &&
            org.getMonthlyCaseCapacity() == 1200
        ));
    }

    @Test
    @DisplayName("更新机构 - 机构不存在时抛出异常")
    void updateOrganization_ShouldThrowException_WhenOrganizationNotFound() {
        // Arrange
        when(organizationRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> organizationService.updateOrganization(999L, updateRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("机构不存在");

        verify(organizationRepository).findById(999L);
        verify(organizationRepository, never()).save(any());
    }

    @Test
    @DisplayName("更新机构 - 部分字段更新")
    void updateOrganization_ShouldOnlyUpdateProvidedFields() {
        // Arrange
        OrganizationUpdateRequest partialUpdate = new OrganizationUpdateRequest();
        partialUpdate.setContactPerson("新联系人");
        // 其他字段不设置

        when(organizationRepository.findById(1L)).thenReturn(Optional.of(testOrganization));
        when(organizationRepository.save(any(Organization.class))).thenReturn(testOrganization);

        // Act
        organizationService.updateOrganization(1L, partialUpdate);

        // Assert
        verify(organizationRepository).save(argThat(org ->
            org.getContactPerson().equals("新联系人") &&
            org.getName().equals("北京律师事务所") && // 原值未变
            org.getContactPhone().equals("13800138000") // 原值未变
        ));
    }

    @Test
    @DisplayName("删除机构 - 成功删除")
    void deleteOrganization_ShouldDeleteOrganization_WhenOrganizationExists() {
        // Arrange
        when(organizationRepository.findById(1L)).thenReturn(Optional.of(testOrganization));
        doNothing().when(organizationRepository).delete(testOrganization);

        // Act
        organizationService.deleteOrganization(1L);

        // Assert
        verify(organizationRepository).findById(1L);
        verify(organizationRepository).delete(testOrganization);
    }

    @Test
    @DisplayName("删除机构 - 机构不存在时抛出异常")
    void deleteOrganization_ShouldThrowException_WhenOrganizationNotFound() {
        // Arrange
        when(organizationRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> organizationService.deleteOrganization(999L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("机构不存在");

        verify(organizationRepository).findById(999L);
        verify(organizationRepository, never()).delete(any());
    }

    @Test
    @DisplayName("暂停机构 - 成功暂停活跃机构")
    void suspendOrganization_ShouldSuspendOrganization_WhenOrganizationActive() {
        // Arrange
        testOrganization.setStatus(OrganizationStatus.ACTIVE);

        when(organizationRepository.findById(1L)).thenReturn(Optional.of(testOrganization));
        when(organizationRepository.save(any(Organization.class))).thenReturn(testOrganization);

        // Act
        OrganizationDetailResponse result = organizationService.suspendOrganization(1L, "违反服务协议");

        // Assert
        assertThat(result).isNotNull();
        verify(organizationRepository).findById(1L);
        verify(organizationRepository).save(argThat(org ->
            org.getStatus() == OrganizationStatus.SUSPENDED
        ));
    }

    @Test
    @DisplayName("激活机构 - 成功激活已暂停的机构")
    void activateOrganization_ShouldActivateOrganization_WhenOrganizationSuspended() {
        // Arrange
        testOrganization.setStatus(OrganizationStatus.SUSPENDED);

        when(organizationRepository.findById(1L)).thenReturn(Optional.of(testOrganization));
        when(organizationRepository.save(any(Organization.class))).thenReturn(testOrganization);

        // Act
        OrganizationDetailResponse result = organizationService.activateOrganization(1L);

        // Assert
        assertThat(result).isNotNull();
        verify(organizationRepository).findById(1L);
        verify(organizationRepository).save(argThat(org ->
            org.getStatus() == OrganizationStatus.ACTIVE
        ));
    }

    @Test
    @DisplayName("获取机构统计数据 - 返回统计信息")
    void getOrganizationStatistics_ShouldReturnStatistics() {
        // Arrange
        when(organizationRepository.count()).thenReturn(100L);
        when(organizationRepository.countByStatus(OrganizationStatus.ACTIVE)).thenReturn(80L);
        when(organizationRepository.countByStatus(OrganizationStatus.PENDING)).thenReturn(15L);
        when(organizationRepository.countByStatus(OrganizationStatus.SUSPENDED)).thenReturn(5L);
        when(organizationRepository.countByStatus(OrganizationStatus.REJECTED)).thenReturn(0L);
        when(organizationRepository.countByTypes(anyList())).thenReturn(60L);

        // Act
        var statistics = organizationService.getOrganizationStatistics();

        // Assert
        assertThat(statistics).isNotNull();
        assertThat(statistics).isNotEmpty();

        verify(organizationRepository).count();
        verify(organizationRepository, atLeastOnce()).countByStatus(any());
        verify(organizationRepository, atLeastOnce()).countByTypes(anyList());
    }
}
