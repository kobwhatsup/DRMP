package com.drmp.service.impl;

import com.drmp.entity.CaseFlowRecord;
import com.drmp.entity.enums.CaseFlowEvent;
import com.drmp.entity.enums.CasePackageStatus;
import com.drmp.repository.CaseFlowRecordRepository;
import com.drmp.service.CaseFlowService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 案件流转服务实现
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CaseFlowServiceImpl implements CaseFlowService {

    private final CaseFlowRecordRepository caseFlowRecordRepository;
    private final ObjectMapper objectMapper;

    /**
     * 状态转换规则映射
     * 定义从当前状态可以转换到的目标状态
     */
    private static final Map<CasePackageStatus, List<CasePackageStatus>> STATUS_TRANSITION_RULES = Map.of(
        CasePackageStatus.DRAFT, Arrays.asList(CasePackageStatus.PUBLISHED, CasePackageStatus.CANCELLED),
        CasePackageStatus.PUBLISHED, Arrays.asList(CasePackageStatus.WITHDRAWN, CasePackageStatus.ASSIGNED, CasePackageStatus.CANCELLED),
        CasePackageStatus.WITHDRAWN, Arrays.asList(CasePackageStatus.PUBLISHED, CasePackageStatus.CANCELLED),
        CasePackageStatus.ASSIGNED, Arrays.asList(CasePackageStatus.IN_PROGRESS, CasePackageStatus.WITHDRAWN, CasePackageStatus.CANCELLED),
        CasePackageStatus.IN_PROGRESS, Arrays.asList(CasePackageStatus.COMPLETED, CasePackageStatus.CANCELLED),
        CasePackageStatus.COMPLETED, Collections.emptyList(),
        CasePackageStatus.CANCELLED, Collections.emptyList()
    );

    /**
     * 状态转换所需事件映射
     */
    private static final Map<String, CaseFlowEvent> STATUS_TRANSITION_EVENTS = Map.ofEntries(
        Map.entry("DRAFT->PUBLISHED", CaseFlowEvent.PACKAGE_PUBLISHED),
        Map.entry("PUBLISHED->WITHDRAWN", CaseFlowEvent.PACKAGE_WITHDRAWN),
        Map.entry("PUBLISHED->ASSIGNED", CaseFlowEvent.PACKAGE_ASSIGNED),
        Map.entry("WITHDRAWN->PUBLISHED", CaseFlowEvent.PACKAGE_PUBLISHED),
        Map.entry("ASSIGNED->IN_PROGRESS", CaseFlowEvent.PACKAGE_STARTED),
        Map.entry("IN_PROGRESS->COMPLETED", CaseFlowEvent.PACKAGE_COMPLETED),
        Map.entry("DRAFT->CANCELLED", CaseFlowEvent.PACKAGE_CANCELLED),
        Map.entry("PUBLISHED->CANCELLED", CaseFlowEvent.PACKAGE_CANCELLED),
        Map.entry("WITHDRAWN->CANCELLED", CaseFlowEvent.PACKAGE_CANCELLED),
        Map.entry("ASSIGNED->CANCELLED", CaseFlowEvent.PACKAGE_CANCELLED),
        Map.entry("IN_PROGRESS->CANCELLED", CaseFlowEvent.PACKAGE_CANCELLED)
    );

    @Override
    public CaseFlowRecord recordPackageStatusChange(Long casePackageId, CaseFlowEvent eventType,
                                                  CasePackageStatus beforeStatus, CasePackageStatus afterStatus,
                                                  String description, Long operatorId, String operatorName) {
        log.info("Recording package status change for case package {}: {} -> {}", 
                casePackageId, beforeStatus, afterStatus);

        CaseFlowRecord record = CaseFlowRecord.createPackageEvent(casePackageId, eventType, description, operatorId, operatorName)
            .withStatusChange(beforeStatus.name(), afterStatus.name());

        return caseFlowRecordRepository.save(record);
    }

    @Override
    public CaseFlowRecord recordPackageEvent(Long casePackageId, CaseFlowEvent eventType,
                                           String description, Long operatorId, String operatorName) {
        log.debug("Recording package event for case package {}: {}", casePackageId, eventType);

        CaseFlowRecord record = CaseFlowRecord.createPackageEvent(casePackageId, eventType, description, operatorId, operatorName);
        return caseFlowRecordRepository.save(record);
    }

    @Override
    public CaseFlowRecord recordCaseEvent(Long casePackageId, Long caseId, CaseFlowEvent eventType,
                                        String description, Long operatorId, String operatorName) {
        log.debug("Recording case event for case {}: {}", caseId, eventType);

        CaseFlowRecord record = CaseFlowRecord.createCaseEvent(casePackageId, caseId, eventType, description, operatorId, operatorName);
        return caseFlowRecordRepository.save(record);
    }

    @Override
    public CaseFlowRecord recordSystemEvent(Long casePackageId, CaseFlowEvent eventType, String description) {
        log.debug("Recording system event for case package {}: {}", casePackageId, eventType);

        CaseFlowRecord record = CaseFlowRecord.createSystemEvent(casePackageId, eventType, description);
        return caseFlowRecordRepository.save(record);
    }

    @Override
    public CaseFlowRecord recordFinancialEvent(Long casePackageId, CaseFlowEvent eventType, BigDecimal amount,
                                             String description, Long operatorId, String operatorName) {
        log.info("Recording financial event for case package {}: {} with amount {}", 
                casePackageId, eventType, amount);

        CaseFlowRecord record = CaseFlowRecord.createPackageEvent(casePackageId, eventType, description, operatorId, operatorName)
            .withAmount(amount);

        return caseFlowRecordRepository.save(record);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CaseFlowRecord> getCasePackageFlowRecords(Long casePackageId, Pageable pageable) {
        return caseFlowRecordRepository.findByCasePackageIdOrderByEventTimeDesc(casePackageId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CaseFlowRecord> getCaseFlowRecords(Long caseId, Pageable pageable) {
        return caseFlowRecordRepository.findByCaseIdOrderByEventTimeDesc(caseId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CaseFlowRecord> getFlowRecordsByEventType(List<CaseFlowEvent> eventTypes,
                                                        LocalDateTime startTime, LocalDateTime endTime,
                                                        Pageable pageable) {
        return caseFlowRecordRepository.findByEventTypeInAndEventTimeBetweenOrderByEventTimeDesc(
                eventTypes, startTime, endTime, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CaseFlowRecord> getOrganizationFlowRecords(Long organizationId, List<CaseFlowEvent> eventTypes,
                                                         LocalDateTime startTime, LocalDateTime endTime,
                                                         Pageable pageable) {
        if (eventTypes != null && !eventTypes.isEmpty()) {
            return caseFlowRecordRepository.findByOperatorOrgIdAndEventTypeInAndEventTimeBetweenOrderByEventTimeDesc(
                    organizationId, eventTypes, startTime, endTime, pageable);
        } else {
            return caseFlowRecordRepository.findByOperatorOrgIdAndEventTimeBetweenOrderByEventTimeDesc(
                    organizationId, startTime, endTime, pageable);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isValidStatusTransition(CasePackageStatus currentStatus, CasePackageStatus targetStatus, 
                                         CaseFlowEvent eventType) {
        List<CasePackageStatus> allowedNextStatuses = STATUS_TRANSITION_RULES.get(currentStatus);
        if (allowedNextStatuses == null || allowedNextStatuses.isEmpty()) {
            return false;
        }

        if (!allowedNextStatuses.contains(targetStatus)) {
            return false;
        }

        // 检查事件类型是否匹配状态转换
        String transitionKey = currentStatus.name() + "->" + targetStatus.name();
        CaseFlowEvent expectedEvent = STATUS_TRANSITION_EVENTS.get(transitionKey);
        
        return expectedEvent != null && expectedEvent.equals(eventType);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CasePackageStatus> getPossibleNextStatuses(CasePackageStatus currentStatus) {
        return STATUS_TRANSITION_RULES.getOrDefault(currentStatus, Collections.emptyList());
    }

    @Override
    @Transactional(readOnly = true)
    public CaseFlowEvent getRequiredEventForTransition(CasePackageStatus currentStatus, CasePackageStatus targetStatus) {
        String transitionKey = currentStatus.name() + "->" + targetStatus.name();
        return STATUS_TRANSITION_EVENTS.get(transitionKey);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlowTimelineItem> getCasePackageTimeline(Long casePackageId) {
        List<CaseFlowRecord> records = caseFlowRecordRepository.findTimelineByCasePackageId(casePackageId);
        
        return records.stream()
            .map(this::convertToTimelineItem)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FlowStatistics getFlowStatistics(Long organizationId, LocalDateTime startTime, LocalDateTime endTime) {
        FlowStatistics statistics = new FlowStatistics();
        
        // 总事件数
        Long totalEvents = organizationId != null ? 
            caseFlowRecordRepository.countByOrganizationAndEventTimeBetween(organizationId, startTime, endTime) :
            caseFlowRecordRepository.countByEventTimeBetween(startTime, endTime);
        statistics.setTotalEvents(totalEvents);

        // 事件类型分布
        List<Object[]> eventTypeCounts = organizationId != null ?
            caseFlowRecordRepository.countByEventTypeForOrganization(organizationId, startTime, endTime) :
            caseFlowRecordRepository.countByEventTypeGroupedByEventTimeBetween(startTime, endTime);
        
        Map<CaseFlowEvent, Long> eventTypeMap = new HashMap<>();
        Long packageEvents = 0L, caseEvents = 0L, systemEvents = 0L;
        
        for (Object[] row : eventTypeCounts) {
            CaseFlowEvent eventType = (CaseFlowEvent) row[0];
            Long count = (Long) row[1];
            eventTypeMap.put(eventType, count);
            
            if (eventType.isPackageEvent()) {
                packageEvents += count;
            } else if (eventType.isCaseEvent()) {
                caseEvents += count;
            } else if (eventType.isSystemEvent()) {
                systemEvents += count;
            }
        }
        
        statistics.setEventTypeCounts(eventTypeMap);
        statistics.setPackageEvents(packageEvents);
        statistics.setCaseEvents(caseEvents);
        statistics.setSystemEvents(systemEvents);

        // 日期分布
        List<Object[]> dailyCounts = caseFlowRecordRepository.countByDateGroupedByEventTimeBetween(startTime, endTime);
        Map<String, Long> dailyEventCounts = dailyCounts.stream()
            .collect(Collectors.toMap(
                row -> row[0].toString(),
                row -> (Long) row[1]
            ));
        statistics.setDailyEventCounts(dailyEventCounts);

        // 操作人分布（仅机构统计）
        if (organizationId != null) {
            List<Object[]> operatorCounts = caseFlowRecordRepository.countByOperatorForOrganization(
                organizationId, startTime, endTime);
            Map<String, Long> operatorEventCounts = operatorCounts.stream()
                .collect(Collectors.toMap(
                    row -> (String) row[0],
                    row -> (Long) row[1]
                ));
            statistics.setOperatorEventCounts(operatorEventCounts);
        }

        // 平均处理天数
        Double avgProcessingDays = caseFlowRecordRepository.calculateAverageProcessingDays(startTime, endTime);
        statistics.setAvgProcessingDays(avgProcessingDays);

        return statistics;
    }

    @Override
    public BatchImportResult batchImportFlowRecords(List<CaseFlowRecord> records) {
        log.info("Batch importing {} flow records", records.size());
        
        List<String> errors = new ArrayList<>();
        int successCount = 0;
        
        for (CaseFlowRecord record : records) {
            try {
                // 基本验证
                if (record.getCasePackageId() == null) {
                    errors.add("案件包ID不能为空");
                    continue;
                }
                
                if (record.getEventType() == null) {
                    errors.add("事件类型不能为空");
                    continue;
                }
                
                if (record.getEventTime() == null) {
                    record.setEventTime(LocalDateTime.now());
                }
                
                caseFlowRecordRepository.save(record);
                successCount++;
                
            } catch (Exception e) {
                log.error("Failed to import flow record: {}", e.getMessage());
                errors.add("导入失败: " + e.getMessage());
            }
        }
        
        log.info("Batch import completed: {}/{} successful", successCount, records.size());
        return new BatchImportResult(records.size(), successCount, records.size() - successCount, errors);
    }

    /**
     * 转换为时间线项目
     */
    private FlowTimelineItem convertToTimelineItem(CaseFlowRecord record) {
        FlowTimelineItem item = new FlowTimelineItem(
            record.getEventTime(),
            record.getEventType(),
            record.getEventTitle(),
            record.getEventDescription(),
            record.getOperatorName()
        );
        
        item.setBeforeStatus(record.getBeforeStatus());
        item.setAfterStatus(record.getAfterStatus());
        item.setAmount(record.getAmount());
        item.setSeverity(record.getSeverity());
        
        // 解析事件数据
        if (record.getEventData() != null && !record.getEventData().isEmpty()) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> eventData = objectMapper.readValue(record.getEventData(), Map.class);
                item.setEventData(eventData);
            } catch (JsonProcessingException e) {
                log.warn("Failed to parse event data for record {}: {}", record.getId(), e.getMessage());
            }
        }
        
        return item;
    }
}