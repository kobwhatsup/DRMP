package com.drmp.entity;

import lombok.*;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 案件包竞标记录实体
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Entity
@Table(name = "case_package_bids", indexes = {
    @Index(name = "idx_package_id", columnList = "case_package_id"),
    @Index(name = "idx_org_id", columnList = "disposal_org_id"),
    @Index(name = "idx_status", columnList = "status")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CasePackageBid extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_package_id", nullable = false)
    private CasePackage casePackage;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disposal_org_id", nullable = false)
    private Organization disposalOrganization;
    
    @Column(name = "bid_amount", precision = 15, scale = 2)
    private BigDecimal bidAmount;
    
    @Column(name = "proposed_recovery_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal proposedRecoveryRate;
    
    @Column(name = "proposed_disposal_days", nullable = false)
    private Integer proposedDisposalDays;
    
    @Column(name = "proposal", columnDefinition = "TEXT")
    private String proposal;
    
    @Column(name = "technical_score", precision = 5, scale = 2)
    private BigDecimal technicalScore;
    
    @Column(name = "price_score", precision = 5, scale = 2)
    private BigDecimal priceScore;
    
    @Column(name = "comprehensive_score", precision = 5, scale = 2)
    private BigDecimal comprehensiveScore;
    
    @Column(name = "ranking")
    private Integer ranking;
    
    @Column(name = "status", nullable = false, length = 20)
    private String status; // SUBMITTED, UNDER_REVIEW, WON, LOST, WITHDRAWN
    
    @Column(name = "is_winner")
    private Boolean isWinner;
    
    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;
    
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
    
    @Column(name = "review_comments", columnDefinition = "TEXT")
    private String reviewComments;
    
    @Column(name = "attachments", columnDefinition = "JSON")
    private String attachments;
    
    @PrePersist
    protected void onCreate() {
        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "SUBMITTED";
        }
        if (isWinner == null) {
            isWinner = false;
        }
    }

    // Convenience methods for repository compatibility
    @Transient
    public Long getCasePackageId() {
        return casePackage != null ? casePackage.getId() : null;
    }

    public void setCasePackageId(Long casePackageId) {
        if (casePackageId != null && (casePackage == null || !casePackageId.equals(casePackage.getId()))) {
            CasePackage cp = new CasePackage();
            cp.setId(casePackageId);
            this.casePackage = cp;
        }
    }

    @Transient
    public String getCasePackageName() {
        return casePackage != null ? casePackage.getPackageName() : null;
    }

    @Transient
    public Long getDisposalOrgId() {
        return disposalOrganization != null ? disposalOrganization.getId() : null;
    }

    public void setDisposalOrgId(Long disposalOrgId) {
        if (disposalOrgId != null && (disposalOrganization == null || !disposalOrgId.equals(disposalOrganization.getId()))) {
            Organization org = new Organization();
            org.setId(disposalOrgId);
            this.disposalOrganization = org;
        }
    }

    @Transient
    public String getDisposalOrgName() {
        return disposalOrganization != null ? disposalOrganization.getName() : null;
    }
}