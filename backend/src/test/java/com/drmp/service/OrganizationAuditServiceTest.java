package com.drmp.service;

import com.drmp.config.BaseServiceTest;
import com.drmp.entity.Organization;
import com.drmp.entity.OrganizationAuditLog;
import com.drmp.entity.User;
import com.drmp.entity.enums.OrganizationStatus;
import com.drmp.repository.OrganizationAuditLogRepository;
import com.drmp.repository.UserRepository;
import com.drmp.service.impl.OrganizationAuditServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * OrganizationAuditService 单元测试
 */
@DisplayName("OrganizationAuditService 测试")
class OrganizationAuditServiceTest extends BaseServiceTest {

    @Mock
    private OrganizationAuditLogRepository auditLogRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private OrganizationAuditServiceImpl organizationAuditService;

    private Organization testOrganization;
    private OrganizationAuditLog testAuditLog;

    @BeforeEach
    void setUp() {
        testOrganization = new Organization();
        testOrganization.setId(1L);
        testOrganization.setOrgCode("ORG001");
        testOrganization.setName("测试机构");
        testOrganization.setStatus(OrganizationStatus.PENDING);

        testAuditLog = OrganizationAuditLog.builder()
            .id(1L)
            .organizationId(1L)
            .orgCode("ORG001")
            .orgName("测试机构")
            .operationType("CREATE")
            .oldStatus(null)
            .newStatus(OrganizationStatus.PENDING)
            .remark("机构创建")
            .operatorId(1L)
            .operatorName("系统管理员")
            .operationTime(LocalDateTime.now())
            .ipAddress("127.0.0.1")
            .userAgent("Test Agent")
            .build();
    }

    @Test
    @DisplayName("记录机构操作日志 - 成功")
    void logOrganizationOperation_ShouldSaveLog() {
        when(auditLogRepository.save(any(OrganizationAuditLog.class)))
            .thenReturn(testAuditLog);

        organizationAuditService.logOrganizationOperation(
            testOrganization,
            "CREATE",
            null,
            OrganizationStatus.PENDING,
            "机构创建",
            null
        );

        verify(auditLogRepository).save(any(OrganizationAuditLog.class));
    }

    @Test
    @DisplayName("记录机构创建日志")
    void logOrganizationCreation_ShouldSaveLog() {
        when(auditLogRepository.save(any(OrganizationAuditLog.class)))
            .thenReturn(testAuditLog);

        organizationAuditService.logOrganizationCreation(testOrganization, "新机构注册");

        verify(auditLogRepository).save(any(OrganizationAuditLog.class));
    }

    @Test
    @DisplayName("记录机构更新日志")
    void logOrganizationUpdate_ShouldSaveLog() {
        when(auditLogRepository.save(any(OrganizationAuditLog.class)))
            .thenReturn(testAuditLog);

        organizationAuditService.logOrganizationUpdate(testOrganization, "更新机构信息");

        verify(auditLogRepository).save(any(OrganizationAuditLog.class));
    }

    @Test
    @DisplayName("记录机构审核通过日志")
    void logOrganizationApproval_ShouldSaveLog() {
        when(auditLogRepository.save(any(OrganizationAuditLog.class)))
            .thenReturn(testAuditLog);

        organizationAuditService.logOrganizationApproval(
            testOrganization,
            OrganizationStatus.PENDING,
            "审核通过"
        );

        verify(auditLogRepository).save(any(OrganizationAuditLog.class));
    }

    @Test
    @DisplayName("记录机构审核拒绝日志")
    void logOrganizationRejection_ShouldSaveLog() {
        when(auditLogRepository.save(any(OrganizationAuditLog.class)))
            .thenReturn(testAuditLog);

        organizationAuditService.logOrganizationRejection(
            testOrganization,
            OrganizationStatus.PENDING,
            "资质不符合要求"
        );

        verify(auditLogRepository).save(any(OrganizationAuditLog.class));
    }

    @Test
    @DisplayName("记录机构暂停日志")
    void logOrganizationSuspension_ShouldSaveLog() {
        when(auditLogRepository.save(any(OrganizationAuditLog.class)))
            .thenReturn(testAuditLog);

        organizationAuditService.logOrganizationSuspension(
            testOrganization,
            OrganizationStatus.ACTIVE,
            "违规操作"
        );

        verify(auditLogRepository).save(any(OrganizationAuditLog.class));
    }

    @Test
    @DisplayName("记录机构激活日志")
    void logOrganizationActivation_ShouldSaveLog() {
        when(auditLogRepository.save(any(OrganizationAuditLog.class)))
            .thenReturn(testAuditLog);

        organizationAuditService.logOrganizationActivation(
            testOrganization,
            OrganizationStatus.SUSPENDED
        );

        verify(auditLogRepository).save(any(OrganizationAuditLog.class));
    }

    @Test
    @DisplayName("获取机构审计历史 - 分页")
    void getOrganizationAuditHistory_WithPagination_ShouldReturnPage() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<OrganizationAuditLog> page = new PageImpl<>(
            Arrays.asList(testAuditLog),
            pageable,
            1
        );

        when(auditLogRepository.findByOrganizationIdOrderByOperationTimeDesc(1L, pageable))
            .thenReturn(page);

        Page<OrganizationAuditLog> result =
            organizationAuditService.getOrganizationAuditHistory(1L, pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("获取机构审计历史 - 全部")
    void getOrganizationAuditHistory_WithoutPagination_ShouldReturnList() {
        when(auditLogRepository.findByOrganizationIdOrderByOperationTimeDesc(1L))
            .thenReturn(Arrays.asList(testAuditLog));

        List<OrganizationAuditLog> result =
            organizationAuditService.getOrganizationAuditHistory(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getOrgCode()).isEqualTo("ORG001");
    }

    @Test
    @DisplayName("获取审计统计信息 - 有数据")
    void getAuditStatistics_WithData_ShouldReturnStatistics() {
        List<Object[]> approvalStats = new ArrayList<>();
        approvalStats.add(new Object[]{"APPROVE", 10L});
        approvalStats.add(new Object[]{"REJECT", 5L});

        when(auditLogRepository.getApprovalStatistics()).thenReturn(approvalStats);
        when(auditLogRepository.countTodayLogsByOperationType("CREATE")).thenReturn(3L);
        when(auditLogRepository.countWeekLogsByOperationType(eq("APPROVE"), any(LocalDateTime.class)))
            .thenReturn(7L);

        Map<String, Object> result = organizationAuditService.getAuditStatistics();

        assertThat(result).containsEntry("totalApprovals", 10L);
        assertThat(result).containsEntry("totalRejections", 5L);
        assertThat(result).containsEntry("totalOperations", 15L);
        assertThat(result).containsEntry("todayPending", 3L);
        assertThat(result).containsEntry("weekApproved", 7L);
        assertThat(result).containsKey("approvalRate");
    }

    @Test
    @DisplayName("获取审计统计信息 - 无数据")
    void getAuditStatistics_WithNoData_ShouldReturnDefaultValues() {
        when(auditLogRepository.getApprovalStatistics()).thenReturn(new ArrayList<>());
        when(auditLogRepository.countTodayLogsByOperationType("CREATE")).thenReturn(0L);
        when(auditLogRepository.countWeekLogsByOperationType(eq("APPROVE"), any(LocalDateTime.class)))
            .thenReturn(0L);

        Map<String, Object> result = organizationAuditService.getAuditStatistics();

        assertThat(result).containsEntry("totalApprovals", 0L);
        assertThat(result).containsEntry("totalRejections", 0L);
        assertThat(result).containsEntry("approvalRate", 0.0);
    }

    @Test
    @DisplayName("根据操作类型获取审计日志")
    void getAuditLogsByOperationType_ShouldReturnLogs() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<OrganizationAuditLog> page = new PageImpl<>(
            Arrays.asList(testAuditLog),
            pageable,
            1
        );

        when(auditLogRepository.findByOperationTypeOrderByOperationTimeDesc("CREATE", pageable))
            .thenReturn(page);

        Page<OrganizationAuditLog> result =
            organizationAuditService.getAuditLogsByOperationType("CREATE", pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getOperationType()).isEqualTo("CREATE");
    }

    @Test
    @DisplayName("根据操作人获取审计日志")
    void getAuditLogsByOperator_ShouldReturnLogs() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<OrganizationAuditLog> page = new PageImpl<>(
            Arrays.asList(testAuditLog),
            pageable,
            1
        );

        when(auditLogRepository.findByOperatorIdOrderByOperationTimeDesc(1L, pageable))
            .thenReturn(page);

        Page<OrganizationAuditLog> result =
            organizationAuditService.getAuditLogsByOperator(1L, pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getOperatorId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("记录异常 - 不影响主流程")
    void logOrganizationOperation_WhenException_ShouldNotThrow() {
        when(auditLogRepository.save(any(OrganizationAuditLog.class)))
            .thenThrow(new RuntimeException("Database error"));

        // 应该不抛出异常
        organizationAuditService.logOrganizationOperation(
            testOrganization,
            "CREATE",
            null,
            OrganizationStatus.PENDING,
            "测试",
            null
        );

        verify(auditLogRepository).save(any(OrganizationAuditLog.class));
    }
}
