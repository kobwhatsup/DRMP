package com.drmp.entity;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * 案件进度实体
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "case_progress")
public class CaseProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "case_id", nullable = false)
    private Long caseId;
    
    @Column(name = "disposal_org_id")
    private Long disposalOrgId;
    
    @Column(name = "handler_id")
    private Long handlerId;
    
    @Column(name = "handler_name", length = 100)
    private String handlerName;
    
    @Column(name = "progress_type", length = 50)
    private String progressType;
    
    @Column(name = "progress_status", length = 50)
    private String progressStatus;
    
    @Column(name = "progress_description", columnDefinition = "TEXT")
    private String progressDescription;
    
    @Column(name = "contact_result", columnDefinition = "TEXT")
    private String contactResult;
    
    @Column(name = "contact_count")
    private Integer contactCount;
    
    @Column(name = "recovery_amount", precision = 15, scale = 2)
    private BigDecimal recoveryAmount;
    
    @Column(name = "expected_completion_date")
    private LocalDateTime expectedCompletionDate;
    
    @Column(name = "actual_completion_date")
    private LocalDateTime actualCompletionDate;
    
    @Column(name = "next_action", length = 500)
    private String nextAction;
    
    @Column(name = "next_contact_date")
    private LocalDateTime nextContactDate;
    
    @Column(name = "attachment_urls", columnDefinition = "TEXT")
    private String attachmentUrls;
    
    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "created_by")
    private Long createdBy;
    
    @Column(name = "updated_by")
    private Long updatedBy;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}