package com.drmp.service;

import com.drmp.entity.CaseFlowRecord;
import com.drmp.entity.enums.CaseFlowEvent;
import com.drmp.entity.enums.CasePackageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 案件流转服务接口
 * 管理案件生命周期中的状态变更和事件记录
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public interface CaseFlowService {
    
    /**
     * 记录案件包状态变更事件
     * 
     * @param casePackageId 案件包ID
     * @param eventType 事件类型
     * @param beforeStatus 变更前状态
     * @param afterStatus 变更后状态
     * @param description 事件描述
     * @param operatorId 操作人ID
     * @param operatorName 操作人姓名
     * @return 创建的流转记录
     */
    CaseFlowRecord recordPackageStatusChange(Long casePackageId, CaseFlowEvent eventType,
                                           CasePackageStatus beforeStatus, CasePackageStatus afterStatus,
                                           String description, Long operatorId, String operatorName);
    
    /**
     * 记录案件包事件
     * 
     * @param casePackageId 案件包ID
     * @param eventType 事件类型
     * @param description 事件描述
     * @param operatorId 操作人ID
     * @param operatorName 操作人姓名
     * @return 创建的流转记录
     */
    CaseFlowRecord recordPackageEvent(Long casePackageId, CaseFlowEvent eventType,
                                    String description, Long operatorId, String operatorName);
    
    /**
     * 记录个案事件
     * 
     * @param casePackageId 案件包ID
     * @param caseId 个案ID
     * @param eventType 事件类型
     * @param description 事件描述
     * @param operatorId 操作人ID
     * @param operatorName 操作人姓名
     * @return 创建的流转记录
     */
    CaseFlowRecord recordCaseEvent(Long casePackageId, Long caseId, CaseFlowEvent eventType,
                                 String description, Long operatorId, String operatorName);
    
    /**
     * 记录系统自动事件
     * 
     * @param casePackageId 案件包ID
     * @param eventType 事件类型
     * @param description 事件描述
     * @return 创建的流转记录
     */
    CaseFlowRecord recordSystemEvent(Long casePackageId, CaseFlowEvent eventType, String description);
    
    /**
     * 记录财务相关事件
     * 
     * @param casePackageId 案件包ID
     * @param eventType 事件类型
     * @param amount 涉及金额
     * @param description 事件描述
     * @param operatorId 操作人ID
     * @param operatorName 操作人姓名
     * @return 创建的流转记录
     */
    CaseFlowRecord recordFinancialEvent(Long casePackageId, CaseFlowEvent eventType, BigDecimal amount,
                                      String description, Long operatorId, String operatorName);
    
    /**
     * 获取案件包的流转记录
     * 
     * @param casePackageId 案件包ID
     * @param pageable 分页参数
     * @return 流转记录分页列表
     */
    Page<CaseFlowRecord> getCasePackageFlowRecords(Long casePackageId, Pageable pageable);
    
    /**
     * 获取个案的流转记录
     * 
     * @param caseId 个案ID
     * @param pageable 分页参数
     * @return 流转记录分页列表
     */
    Page<CaseFlowRecord> getCaseFlowRecords(Long caseId, Pageable pageable);
    
    /**
     * 根据事件类型查询流转记录
     * 
     * @param eventTypes 事件类型列表
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param pageable 分页参数
     * @return 流转记录分页列表
     */
    Page<CaseFlowRecord> getFlowRecordsByEventType(List<CaseFlowEvent> eventTypes,
                                                 LocalDateTime startTime, LocalDateTime endTime,
                                                 Pageable pageable);
    
    /**
     * 获取机构的流转记录
     * 
     * @param organizationId 机构ID
     * @param eventTypes 事件类型过滤（可选）
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param pageable 分页参数
     * @return 流转记录分页列表
     */
    Page<CaseFlowRecord> getOrganizationFlowRecords(Long organizationId, List<CaseFlowEvent> eventTypes,
                                                   LocalDateTime startTime, LocalDateTime endTime,
                                                   Pageable pageable);
    
    /**
     * 检查案件包状态转换是否合法
     * 
     * @param currentStatus 当前状态
     * @param targetStatus 目标状态
     * @param eventType 触发事件
     * @return 是否允许转换
     */
    boolean isValidStatusTransition(CasePackageStatus currentStatus, CasePackageStatus targetStatus, 
                                  CaseFlowEvent eventType);
    
    /**
     * 获取指定状态的下一步可能状态
     * 
     * @param currentStatus 当前状态
     * @return 可能的下一步状态列表
     */
    List<CasePackageStatus> getPossibleNextStatuses(CasePackageStatus currentStatus);
    
    /**
     * 获取状态转换所需的事件
     * 
     * @param currentStatus 当前状态
     * @param targetStatus 目标状态
     * @return 所需的事件类型
     */
    CaseFlowEvent getRequiredEventForTransition(CasePackageStatus currentStatus, CasePackageStatus targetStatus);
    
    /**
     * 获取案件包的处置时间线
     * 
     * @param casePackageId 案件包ID
     * @return 时间线数据
     */
    List<FlowTimelineItem> getCasePackageTimeline(Long casePackageId);
    
    /**
     * 获取流转统计数据
     * 
     * @param organizationId 机构ID（可选）
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 统计数据
     */
    FlowStatistics getFlowStatistics(Long organizationId, LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * 批量导入流转记录
     * 
     * @param records 流转记录列表
     * @return 导入结果
     */
    BatchImportResult batchImportFlowRecords(List<CaseFlowRecord> records);
    
    /**
     * 流转时间线项目
     */
    class FlowTimelineItem {
        private LocalDateTime eventTime;
        private CaseFlowEvent eventType;
        private String eventTitle;
        private String description;
        private String operatorName;
        private String beforeStatus;
        private String afterStatus;
        private BigDecimal amount;
        private String severity;
        private Map<String, Object> eventData;
        
        // Constructors
        public FlowTimelineItem() {}
        
        public FlowTimelineItem(LocalDateTime eventTime, CaseFlowEvent eventType, String eventTitle, 
                               String description, String operatorName) {
            this.eventTime = eventTime;
            this.eventType = eventType;
            this.eventTitle = eventTitle;
            this.description = description;
            this.operatorName = operatorName;
        }
        
        // Getters and Setters
        public LocalDateTime getEventTime() { return eventTime; }
        public void setEventTime(LocalDateTime eventTime) { this.eventTime = eventTime; }
        
        public CaseFlowEvent getEventType() { return eventType; }
        public void setEventType(CaseFlowEvent eventType) { this.eventType = eventType; }
        
        public String getEventTitle() { return eventTitle; }
        public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getOperatorName() { return operatorName; }
        public void setOperatorName(String operatorName) { this.operatorName = operatorName; }
        
        public String getBeforeStatus() { return beforeStatus; }
        public void setBeforeStatus(String beforeStatus) { this.beforeStatus = beforeStatus; }
        
        public String getAfterStatus() { return afterStatus; }
        public void setAfterStatus(String afterStatus) { this.afterStatus = afterStatus; }
        
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        
        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
        
        public Map<String, Object> getEventData() { return eventData; }
        public void setEventData(Map<String, Object> eventData) { this.eventData = eventData; }
    }
    
    /**
     * 流转统计数据
     */
    class FlowStatistics {
        private Long totalEvents;
        private Long packageEvents;
        private Long caseEvents;
        private Long systemEvents;
        private Map<CaseFlowEvent, Long> eventTypeCounts;
        private Map<String, Long> dailyEventCounts;
        private Map<String, Long> operatorEventCounts;
        private Double avgProcessingDays;
        private Map<String, Object> statusDistribution;
        
        // Constructors
        public FlowStatistics() {}
        
        // Getters and Setters
        public Long getTotalEvents() { return totalEvents; }
        public void setTotalEvents(Long totalEvents) { this.totalEvents = totalEvents; }
        
        public Long getPackageEvents() { return packageEvents; }
        public void setPackageEvents(Long packageEvents) { this.packageEvents = packageEvents; }
        
        public Long getCaseEvents() { return caseEvents; }
        public void setCaseEvents(Long caseEvents) { this.caseEvents = caseEvents; }
        
        public Long getSystemEvents() { return systemEvents; }
        public void setSystemEvents(Long systemEvents) { this.systemEvents = systemEvents; }
        
        public Map<CaseFlowEvent, Long> getEventTypeCounts() { return eventTypeCounts; }
        public void setEventTypeCounts(Map<CaseFlowEvent, Long> eventTypeCounts) { this.eventTypeCounts = eventTypeCounts; }
        
        public Map<String, Long> getDailyEventCounts() { return dailyEventCounts; }
        public void setDailyEventCounts(Map<String, Long> dailyEventCounts) { this.dailyEventCounts = dailyEventCounts; }
        
        public Map<String, Long> getOperatorEventCounts() { return operatorEventCounts; }
        public void setOperatorEventCounts(Map<String, Long> operatorEventCounts) { this.operatorEventCounts = operatorEventCounts; }
        
        public Double getAvgProcessingDays() { return avgProcessingDays; }
        public void setAvgProcessingDays(Double avgProcessingDays) { this.avgProcessingDays = avgProcessingDays; }
        
        public Map<String, Object> getStatusDistribution() { return statusDistribution; }
        public void setStatusDistribution(Map<String, Object> statusDistribution) { this.statusDistribution = statusDistribution; }
    }
    
    /**
     * 批量导入结果
     */
    class BatchImportResult {
        private int totalCount;
        private int successCount;
        private int failedCount;
        private List<String> errors;
        
        // Constructors
        public BatchImportResult() {}
        
        public BatchImportResult(int totalCount, int successCount, int failedCount, List<String> errors) {
            this.totalCount = totalCount;
            this.successCount = successCount;
            this.failedCount = failedCount;
            this.errors = errors;
        }
        
        // Getters and Setters
        public int getTotalCount() { return totalCount; }
        public void setTotalCount(int totalCount) { this.totalCount = totalCount; }
        
        public int getSuccessCount() { return successCount; }
        public void setSuccessCount(int successCount) { this.successCount = successCount; }
        
        public int getFailedCount() { return failedCount; }
        public void setFailedCount(int failedCount) { this.failedCount = failedCount; }
        
        public List<String> getErrors() { return errors; }
        public void setErrors(List<String> errors) { this.errors = errors; }
    }
}