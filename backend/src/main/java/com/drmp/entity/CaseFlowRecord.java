package com.drmp.entity;

import com.drmp.entity.enums.CaseFlowEvent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 案件流转记录实体
 * 记录案件处置过程中的各种状态变更和关键事件
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Entity
@Table(name = "case_flow_records", indexes = {
    @Index(name = "idx_case_package_id", columnList = "case_package_id"),
    @Index(name = "idx_case_id", columnList = "case_id"),
    @Index(name = "idx_event_time", columnList = "event_time"),
    @Index(name = "idx_event_type", columnList = "event_type"),
    @Index(name = "idx_operator_id", columnList = "operator_id")
})
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaseFlowRecord extends BaseEntity {

    /**
     * 关联的案件包ID
     */
    @Column(name = "case_package_id")
    private Long casePackageId;
    
    /**
     * 关联的个案ID（可选）
     */
    @Column(name = "case_id")
    private Long caseId;
    
    /**
     * 流转事件类型
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 50)
    private CaseFlowEvent eventType;
    
    /**
     * 事件发生时间
     */
    @Column(name = "event_time", nullable = false)
    private LocalDateTime eventTime;
    
    /**
     * 操作人ID
     */
    @Column(name = "operator_id")
    private Long operatorId;
    
    /**
     * 操作人姓名
     */
    @Column(name = "operator_name", length = 100)
    private String operatorName;
    
    /**
     * 操作人机构ID
     */
    @Column(name = "operator_org_id")
    private Long operatorOrgId;
    
    /**
     * 操作人机构名称
     */
    @Column(name = "operator_org_name", length = 200)
    private String operatorOrgName;
    
    /**
     * 事件标题
     */
    @Column(name = "event_title", length = 200)
    private String eventTitle;
    
    /**
     * 事件描述
     */
    @Column(name = "event_description", length = 1000)
    private String eventDescription;
    
    /**
     * 状态变更前的值
     */
    @Column(name = "before_status", length = 50)
    private String beforeStatus;
    
    /**
     * 状态变更后的值
     */
    @Column(name = "after_status", length = 50)
    private String afterStatus;
    
    /**
     * 涉及金额
     */
    @Column(name = "amount", precision = 15, scale = 2)
    private BigDecimal amount;
    
    /**
     * 关联的业务对象ID（如协议ID、合同ID等）
     */
    @Column(name = "related_object_id")
    private Long relatedObjectId;
    
    /**
     * 关联的业务对象类型
     */
    @Column(name = "related_object_type", length = 50)
    private String relatedObjectType;
    
    /**
     * 事件附加数据（JSON格式）
     */
    @Column(name = "event_data", columnDefinition = "TEXT")
    private String eventData;
    
    /**
     * 是否为系统自动事件
     */
    @Column(name = "is_system_event", nullable = false)
    @Builder.Default
    private Boolean isSystemEvent = false;
    
    /**
     * 事件严重程度（INFO, WARN, ERROR）
     */
    @Column(name = "severity", length = 20)
    @Builder.Default
    private String severity = "INFO";
    
    /**
     * 事件标签（用于分类和检索）
     */
    @Column(name = "tags", length = 500)
    private String tags;
    
    /**
     * 备注
     */
    @Column(name = "remarks", length = 1000)
    private String remarks;
    
    /**
     * 创建事件记录的便捷方法
     */
    public static CaseFlowRecord createPackageEvent(Long casePackageId, CaseFlowEvent eventType, 
                                                   String description, Long operatorId, String operatorName) {
        return CaseFlowRecord.builder()
            .casePackageId(casePackageId)
            .eventType(eventType)
            .eventTime(LocalDateTime.now())
            .operatorId(operatorId)
            .operatorName(operatorName)
            .eventTitle(eventType.getDisplayName())
            .eventDescription(description)
            .isSystemEvent(false)
            .build();
    }
    
    /**
     * 创建个案事件记录的便捷方法
     */
    public static CaseFlowRecord createCaseEvent(Long casePackageId, Long caseId, CaseFlowEvent eventType, 
                                               String description, Long operatorId, String operatorName) {
        return CaseFlowRecord.builder()
            .casePackageId(casePackageId)
            .caseId(caseId)
            .eventType(eventType)
            .eventTime(LocalDateTime.now())
            .operatorId(operatorId)
            .operatorName(operatorName)
            .eventTitle(eventType.getDisplayName())
            .eventDescription(description)
            .isSystemEvent(false)
            .build();
    }
    
    /**
     * 创建系统事件记录的便捷方法
     */
    public static CaseFlowRecord createSystemEvent(Long casePackageId, CaseFlowEvent eventType, 
                                                 String description) {
        return CaseFlowRecord.builder()
            .casePackageId(casePackageId)
            .eventType(eventType)
            .eventTime(LocalDateTime.now())
            .eventTitle(eventType.getDisplayName())
            .eventDescription(description)
            .isSystemEvent(true)
            .operatorName("系统")
            .build();
    }
    
    /**
     * 设置状态变更信息
     */
    public CaseFlowRecord withStatusChange(String beforeStatus, String afterStatus) {
        this.beforeStatus = beforeStatus;
        this.afterStatus = afterStatus;
        return this;
    }
    
    /**
     * 设置涉及金额
     */
    public CaseFlowRecord withAmount(BigDecimal amount) {
        this.amount = amount;
        return this;
    }
    
    /**
     * 设置关联对象
     */
    public CaseFlowRecord withRelatedObject(Long objectId, String objectType) {
        this.relatedObjectId = objectId;
        this.relatedObjectType = objectType;
        return this;
    }
    
    /**
     * 设置事件数据
     */
    public CaseFlowRecord withEventData(String eventData) {
        this.eventData = eventData;
        return this;
    }
    
    /**
     * 设置严重程度
     */
    public CaseFlowRecord withSeverity(String severity) {
        this.severity = severity;
        return this;
    }
    
    /**
     * 设置标签
     */
    public CaseFlowRecord withTags(String tags) {
        this.tags = tags;
        return this;
    }
}