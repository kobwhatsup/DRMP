package com.drmp.entity;

import com.drmp.entity.enums.CasePackageStatus;
import com.drmp.entity.enums.AssignmentType;
import lombok.*;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Case Package Entity
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Entity
@Table(name = "case_packages", indexes = {
    @Index(name = "idx_package_code", columnList = "package_code", unique = true),
    @Index(name = "idx_source_org", columnList = "source_organization_id"),
    @Index(name = "idx_disposal_org", columnList = "disposal_organization_id"),
    @Index(name = "idx_status", columnList = "status")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CasePackage extends BaseEntity {

    @Column(name = "package_code", nullable = false, unique = true, length = 50)
    private String packageCode;

    @Column(name = "package_name", nullable = false, length = 200)
    private String packageName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_org_id", nullable = false)
    private Organization sourceOrganization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disposal_org_id")
    private Organization disposalOrganization;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private CasePackageStatus status;

    @Column(name = "case_count", nullable = false)
    private Integer caseCount;

    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "remaining_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal remainingAmount;

    @Column(name = "expected_recovery_rate", precision = 5, scale = 2)
    private BigDecimal expectedRecoveryRate;

    @Column(name = "expected_disposal_days")
    private Integer expectedDisposalDays;

    @Column(name = "disposal_types", columnDefinition = "TEXT")
    private String preferredDisposalMethods;

    @Column(name = "expected_recovery_rate_min", precision = 5, scale = 2)
    private BigDecimal expectedRecoveryRateMin;

    @Column(name = "disposal_period_days")
    private Integer disposalPeriodDays;

    @Column(name = "assignment_strategy", length = 100)
    private String assignmentStrategy;

    @Column(name = "assignment_rules", columnDefinition = "JSON")
    private String assignmentRules;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "assignment_type", length = 30)
    private AssignmentType assignmentType;
    
    @Column(name = "allow_bidding")
    private Boolean allowBidding;
    
    @Column(name = "bidding_start_time")
    private LocalDateTime biddingStartTime;
    
    @Column(name = "bidding_end_time")
    private LocalDateTime biddingEndTime;
    
    @Column(name = "min_bid_amount", precision = 15, scale = 2)
    private BigDecimal minBidAmount;
    
    @Column(name = "bid_bond_amount", precision = 15, scale = 2)
    private BigDecimal bidBondAmount;
    
    @Column(name = "bidding_requirements", columnDefinition = "TEXT")
    private String biddingRequirements;
    
    @Column(name = "evaluation_criteria", columnDefinition = "JSON")
    private String evaluationCriteria;
    
    @Column(name = "smart_assign_config", columnDefinition = "JSON")
    private String smartAssignConfig;
    
    @Column(name = "winning_bid_id")
    private Long winningBidId;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "entrust_start_date", nullable = false)
    private LocalDate entrustStartDate;

    @Column(name = "entrust_end_date", nullable = false)
    private LocalDate entrustEndDate;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "casePackage", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Case> cases = new ArrayList<>();

    @OneToMany(mappedBy = "casePackage", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CasePackageAssignment> assignments = new ArrayList<>();
    
    @OneToMany(mappedBy = "casePackage", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CasePackageBid> bids = new ArrayList<>();
    
    // 便捷方法
    @Transient
    public Long getSourceOrgId() {
        return sourceOrganization != null ? sourceOrganization.getId() : null;
    }
    
    public void setSourceOrgId(Long sourceOrgId) {
        if (sourceOrgId != null && (sourceOrganization == null || !sourceOrgId.equals(sourceOrganization.getId()))) {
            Organization org = new Organization();
            org.setId(sourceOrgId);
            this.sourceOrganization = org;
        }
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
    public String getSourceOrgName() {
        return sourceOrganization != null ? sourceOrganization.getName() : null;
    }
    
    @Transient
    public String getDisposalOrgName() {
        return disposalOrganization != null ? disposalOrganization.getName() : null;
    }
}