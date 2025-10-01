package com.drmp.service;

import com.drmp.config.BaseServiceTest;
import com.drmp.entity.CaseFlowRecord;
import com.drmp.entity.enums.CaseFlowEvent;
import com.drmp.entity.enums.CasePackageStatus;
import com.drmp.repository.CaseFlowRecordRepository;
import com.drmp.service.impl.CaseFlowServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * CaseFlowService 单元测试
 * 测试案件流转服务的业务逻辑
 */
@DisplayName("CaseFlowService 测试")
class CaseFlowServiceTest extends BaseServiceTest {

    @Mock
    private CaseFlowRecordRepository caseFlowRecordRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private CaseFlowServiceImpl caseFlowService;

    private CaseFlowRecord testRecord;
    private Long testCasePackageId;
    private Long testCaseId;
    private Long testOperatorId;
    private String testOperatorName;

    @BeforeEach
    void setUp() {
        testCasePackageId = 1L;
        testCaseId = 100L;
        testOperatorId = 10L;
        testOperatorName = "测试操作员";

        testRecord = new CaseFlowRecord();
        testRecord.setId(1L);
        testRecord.setCasePackageId(testCasePackageId);
        testRecord.setEventType(CaseFlowEvent.PACKAGE_PUBLISHED);
        testRecord.setEventDescription("案件包发布");
        testRecord.setEventTime(LocalDateTime.now());
        testRecord.setOperatorId(testOperatorId);
        testRecord.setOperatorName(testOperatorName);
    }

    @Test
    @DisplayName("记录案件包状态变更 - 成功创建记录")
    void recordPackageStatusChange_ShouldCreateRecord() {
        // Arrange
        CasePackageStatus beforeStatus = CasePackageStatus.DRAFT;
        CasePackageStatus afterStatus = CasePackageStatus.PUBLISHED;

        when(caseFlowRecordRepository.save(any(CaseFlowRecord.class)))
            .thenAnswer(invocation -> {
                CaseFlowRecord record = invocation.getArgument(0);
                record.setId(1L);
                return record;
            });

        // Act
        CaseFlowRecord result = caseFlowService.recordPackageStatusChange(
            testCasePackageId,
            CaseFlowEvent.PACKAGE_PUBLISHED,
            beforeStatus,
            afterStatus,
            "案件包状态变更",
            testOperatorId,
            testOperatorName
        );

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getBeforeStatus()).isEqualTo(beforeStatus.name());
        assertThat(result.getAfterStatus()).isEqualTo(afterStatus.name());

        verify(caseFlowRecordRepository).save(argThat(record ->
            record.getCasePackageId().equals(testCasePackageId) &&
            record.getEventType() == CaseFlowEvent.PACKAGE_PUBLISHED &&
            record.getBeforeStatus().equals(beforeStatus.name()) &&
            record.getAfterStatus().equals(afterStatus.name())
        ));
    }

    @Test
    @DisplayName("记录案件包事件 - 成功创建记录")
    void recordPackageEvent_ShouldCreateRecord() {
        // Arrange
        when(caseFlowRecordRepository.save(any(CaseFlowRecord.class)))
            .thenReturn(testRecord);

        // Act
        CaseFlowRecord result = caseFlowService.recordPackageEvent(
            testCasePackageId,
            CaseFlowEvent.PACKAGE_PUBLISHED,
            "案件包发布",
            testOperatorId,
            testOperatorName
        );

        // Assert
        assertThat(result).isNotNull();
        verify(caseFlowRecordRepository).save(any(CaseFlowRecord.class));
    }

    @Test
    @DisplayName("记录个案事件 - 成功创建记录")
    void recordCaseEvent_ShouldCreateRecord() {
        // Arrange
        when(caseFlowRecordRepository.save(any(CaseFlowRecord.class)))
            .thenReturn(testRecord);

        // Act
        CaseFlowRecord result = caseFlowService.recordCaseEvent(
            testCasePackageId,
            testCaseId,
            CaseFlowEvent.CASE_ASSIGNED,
            "案件分配",
            testOperatorId,
            testOperatorName
        );

        // Assert
        assertThat(result).isNotNull();
        verify(caseFlowRecordRepository).save(argThat(record ->
            record.getCasePackageId().equals(testCasePackageId) &&
            record.getCaseId().equals(testCaseId)
        ));
    }

    @Test
    @DisplayName("记录系统事件 - 成功创建系统记录")
    void recordSystemEvent_ShouldCreateSystemRecord() {
        // Arrange
        when(caseFlowRecordRepository.save(any(CaseFlowRecord.class)))
            .thenReturn(testRecord);

        // Act
        CaseFlowRecord result = caseFlowService.recordSystemEvent(
            testCasePackageId,
            CaseFlowEvent.DEADLINE_APPROACHING,
            "处置期限即将到期"
        );

        // Assert
        assertThat(result).isNotNull();
        verify(caseFlowRecordRepository).save(argThat(record ->
            record.getCasePackageId().equals(testCasePackageId) &&
            record.getIsSystemEvent()
        ));
    }

    @Test
    @DisplayName("记录财务事件 - 成功创建包含金额的记录")
    void recordFinancialEvent_ShouldCreateRecordWithAmount() {
        // Arrange
        BigDecimal amount = new BigDecimal("100000.00");
        when(caseFlowRecordRepository.save(any(CaseFlowRecord.class)))
            .thenAnswer(invocation -> {
                CaseFlowRecord record = invocation.getArgument(0);
                record.setId(1L);
                return record;
            });

        // Act
        CaseFlowRecord result = caseFlowService.recordFinancialEvent(
            testCasePackageId,
            CaseFlowEvent.CASE_PAYMENT_RECEIVED,
            amount,
            "收到还款",
            testOperatorId,
            testOperatorName
        );

        // Assert
        assertThat(result).isNotNull();
        verify(caseFlowRecordRepository).save(argThat(record ->
            record.getAmount() != null &&
            record.getAmount().compareTo(amount) == 0
        ));
    }

    @Test
    @DisplayName("获取案件包流转记录 - 返回分页数据")
    void getCasePackageFlowRecords_ShouldReturnPagedRecords() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        List<CaseFlowRecord> records = Arrays.asList(testRecord);
        Page<CaseFlowRecord> page = new PageImpl<>(records, pageable, 1);

        when(caseFlowRecordRepository.findByCasePackageIdOrderByEventTimeDesc(testCasePackageId, pageable))
            .thenReturn(page);

        // Act
        Page<CaseFlowRecord> result = caseFlowService.getCasePackageFlowRecords(testCasePackageId, pageable);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);
        verify(caseFlowRecordRepository).findByCasePackageIdOrderByEventTimeDesc(testCasePackageId, pageable);
    }

    @Test
    @DisplayName("获取个案流转记录 - 返回分页数据")
    void getCaseFlowRecords_ShouldReturnPagedRecords() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        List<CaseFlowRecord> records = Arrays.asList(testRecord);
        Page<CaseFlowRecord> page = new PageImpl<>(records, pageable, 1);

        when(caseFlowRecordRepository.findByCaseIdOrderByEventTimeDesc(testCaseId, pageable))
            .thenReturn(page);

        // Act
        Page<CaseFlowRecord> result = caseFlowService.getCaseFlowRecords(testCaseId, pageable);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(caseFlowRecordRepository).findByCaseIdOrderByEventTimeDesc(testCaseId, pageable);
    }

    @Test
    @DisplayName("按事件类型查询 - 返回指定类型的记录")
    void getFlowRecordsByEventType_ShouldReturnFilteredRecords() {
        // Arrange
        List<CaseFlowEvent> eventTypes = Arrays.asList(CaseFlowEvent.PACKAGE_PUBLISHED);
        LocalDateTime startTime = LocalDateTime.now().minusDays(7);
        LocalDateTime endTime = LocalDateTime.now();
        Pageable pageable = PageRequest.of(0, 10);

        Page<CaseFlowRecord> page = new PageImpl<>(Arrays.asList(testRecord));
        when(caseFlowRecordRepository.findByEventTypeInAndEventTimeBetweenOrderByEventTimeDesc(
            eventTypes, startTime, endTime, pageable))
            .thenReturn(page);

        // Act
        Page<CaseFlowRecord> result = caseFlowService.getFlowRecordsByEventType(
            eventTypes, startTime, endTime, pageable);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isNotEmpty();
        verify(caseFlowRecordRepository).findByEventTypeInAndEventTimeBetweenOrderByEventTimeDesc(
            eventTypes, startTime, endTime, pageable);
    }

    @Test
    @DisplayName("获取机构流转记录 - 有事件类型过滤")
    void getOrganizationFlowRecords_WithEventTypes_ShouldReturnFilteredRecords() {
        // Arrange
        Long organizationId = 5L;
        List<CaseFlowEvent> eventTypes = Arrays.asList(CaseFlowEvent.PACKAGE_PUBLISHED);
        LocalDateTime startTime = LocalDateTime.now().minusDays(7);
        LocalDateTime endTime = LocalDateTime.now();
        Pageable pageable = PageRequest.of(0, 10);

        Page<CaseFlowRecord> page = new PageImpl<>(Arrays.asList(testRecord));
        when(caseFlowRecordRepository.findByOperatorOrgIdAndEventTypeInAndEventTimeBetweenOrderByEventTimeDesc(
            organizationId, eventTypes, startTime, endTime, pageable))
            .thenReturn(page);

        // Act
        Page<CaseFlowRecord> result = caseFlowService.getOrganizationFlowRecords(
            organizationId, eventTypes, startTime, endTime, pageable);

        // Assert
        assertThat(result).isNotNull();
        verify(caseFlowRecordRepository).findByOperatorOrgIdAndEventTypeInAndEventTimeBetweenOrderByEventTimeDesc(
            organizationId, eventTypes, startTime, endTime, pageable);
    }

    @Test
    @DisplayName("获取机构流转记录 - 无事件类型过滤")
    void getOrganizationFlowRecords_WithoutEventTypes_ShouldReturnAllRecords() {
        // Arrange
        Long organizationId = 5L;
        LocalDateTime startTime = LocalDateTime.now().minusDays(7);
        LocalDateTime endTime = LocalDateTime.now();
        Pageable pageable = PageRequest.of(0, 10);

        Page<CaseFlowRecord> page = new PageImpl<>(Arrays.asList(testRecord));
        when(caseFlowRecordRepository.findByOperatorOrgIdAndEventTimeBetweenOrderByEventTimeDesc(
            organizationId, startTime, endTime, pageable))
            .thenReturn(page);

        // Act
        Page<CaseFlowRecord> result = caseFlowService.getOrganizationFlowRecords(
            organizationId, null, startTime, endTime, pageable);

        // Assert
        assertThat(result).isNotNull();
        verify(caseFlowRecordRepository).findByOperatorOrgIdAndEventTimeBetweenOrderByEventTimeDesc(
            organizationId, startTime, endTime, pageable);
    }

    @Test
    @DisplayName("验证状态转换 - 有效的转换")
    void isValidStatusTransition_ValidTransition_ShouldReturnTrue() {
        // Act
        boolean result = caseFlowService.isValidStatusTransition(
            CasePackageStatus.DRAFT,
            CasePackageStatus.PUBLISHED,
            CaseFlowEvent.PACKAGE_PUBLISHED
        );

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("验证状态转换 - 无效的目标状态")
    void isValidStatusTransition_InvalidTargetStatus_ShouldReturnFalse() {
        // Act
        boolean result = caseFlowService.isValidStatusTransition(
            CasePackageStatus.DRAFT,
            CasePackageStatus.COMPLETED,
            CaseFlowEvent.PACKAGE_PUBLISHED
        );

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("验证状态转换 - 错误的事件类型")
    void isValidStatusTransition_WrongEventType_ShouldReturnFalse() {
        // Act
        boolean result = caseFlowService.isValidStatusTransition(
            CasePackageStatus.DRAFT,
            CasePackageStatus.PUBLISHED,
            CaseFlowEvent.PACKAGE_WITHDRAWN
        );

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("获取可能的下一步状态 - 返回允许的状态列表")
    void getPossibleNextStatuses_ShouldReturnAllowedStatuses() {
        // Act
        List<CasePackageStatus> result = caseFlowService.getPossibleNextStatuses(CasePackageStatus.DRAFT);

        // Assert
        assertThat(result).isNotEmpty();
        assertThat(result).contains(CasePackageStatus.PUBLISHED, CasePackageStatus.CANCELLED);
    }

    @Test
    @DisplayName("获取可能的下一步状态 - 终态返回空列表")
    void getPossibleNextStatuses_FinalStatus_ShouldReturnEmptyList() {
        // Act
        List<CasePackageStatus> result = caseFlowService.getPossibleNextStatuses(CasePackageStatus.COMPLETED);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("获取状态转换所需事件 - 返回正确的事件类型")
    void getRequiredEventForTransition_ShouldReturnCorrectEvent() {
        // Act
        CaseFlowEvent result = caseFlowService.getRequiredEventForTransition(
            CasePackageStatus.DRAFT,
            CasePackageStatus.PUBLISHED
        );

        // Assert
        assertThat(result).isEqualTo(CaseFlowEvent.PACKAGE_PUBLISHED);
    }

    @Test
    @DisplayName("获取案件包时间线 - 返回时间线数据")
    void getCasePackageTimeline_ShouldReturnTimeline() {
        // Arrange
        when(caseFlowRecordRepository.findTimelineByCasePackageId(testCasePackageId))
            .thenReturn(Arrays.asList(testRecord));

        // Act
        List<CaseFlowService.FlowTimelineItem> result = caseFlowService.getCasePackageTimeline(testCasePackageId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(caseFlowRecordRepository).findTimelineByCasePackageId(testCasePackageId);
    }

    @Test
    @DisplayName("获取流转统计 - 返回统计数据")
    void getFlowStatistics_ShouldReturnStatistics() {
        // Arrange
        LocalDateTime startTime = LocalDateTime.now().minusDays(30);
        LocalDateTime endTime = LocalDateTime.now();

        when(caseFlowRecordRepository.countByEventTimeBetween(startTime, endTime))
            .thenReturn(100L);
        List<Object[]> eventTypeCounts = new ArrayList<>();
        eventTypeCounts.add(new Object[]{CaseFlowEvent.PACKAGE_PUBLISHED, 50L});
        when(caseFlowRecordRepository.countByEventTypeGroupedByEventTimeBetween(startTime, endTime))
            .thenReturn(eventTypeCounts);

        List<Object[]> dailyCounts = new ArrayList<>();
        dailyCounts.add(new Object[]{"2025-01-01", 10L});
        when(caseFlowRecordRepository.countByDateGroupedByEventTimeBetween(startTime, endTime))
            .thenReturn(dailyCounts);
        when(caseFlowRecordRepository.calculateAverageProcessingDays(startTime, endTime))
            .thenReturn(15.5);

        // Act
        CaseFlowService.FlowStatistics result = caseFlowService.getFlowStatistics(null, startTime, endTime);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalEvents()).isEqualTo(100L);
        assertThat(result.getAvgProcessingDays()).isEqualTo(15.5);
        verify(caseFlowRecordRepository).countByEventTimeBetween(startTime, endTime);
    }

    @Test
    @DisplayName("批量导入流转记录 - 成功导入")
    void batchImportFlowRecords_ShouldImportSuccessfully() {
        // Arrange
        CaseFlowRecord record1 = new CaseFlowRecord();
        record1.setCasePackageId(1L);
        record1.setEventType(CaseFlowEvent.PACKAGE_PUBLISHED);

        CaseFlowRecord record2 = new CaseFlowRecord();
        record2.setCasePackageId(2L);
        record2.setEventType(CaseFlowEvent.PACKAGE_ASSIGNED);

        List<CaseFlowRecord> records = Arrays.asList(record1, record2);

        when(caseFlowRecordRepository.save(any(CaseFlowRecord.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        CaseFlowService.BatchImportResult result = caseFlowService.batchImportFlowRecords(records);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalCount()).isEqualTo(2);
        assertThat(result.getSuccessCount()).isEqualTo(2);
        assertThat(result.getFailedCount()).isEqualTo(0);
        verify(caseFlowRecordRepository, times(2)).save(any(CaseFlowRecord.class));
    }

    @Test
    @DisplayName("批量导入流转记录 - 部分失败")
    void batchImportFlowRecords_WithValidationErrors_ShouldReturnPartialSuccess() {
        // Arrange
        CaseFlowRecord validRecord = new CaseFlowRecord();
        validRecord.setCasePackageId(1L);
        validRecord.setEventType(CaseFlowEvent.PACKAGE_PUBLISHED);

        CaseFlowRecord invalidRecord = new CaseFlowRecord();
        // 缺少必需字段

        List<CaseFlowRecord> records = Arrays.asList(validRecord, invalidRecord);

        when(caseFlowRecordRepository.save(any(CaseFlowRecord.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        CaseFlowService.BatchImportResult result = caseFlowService.batchImportFlowRecords(records);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalCount()).isEqualTo(2);
        assertThat(result.getSuccessCount()).isLessThan(2);
        assertThat(result.getErrors()).isNotEmpty();
    }
}
