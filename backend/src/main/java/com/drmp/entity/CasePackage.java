package com.drmp.entity;

import com.drmp.entity.enums.CasePackageStatus;
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
    @JoinColumn(name = "source_organization_id", nullable = false)
    private Organization sourceOrganization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disposal_organization_id")
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

    @Column(name = "preferred_disposal_methods", length = 500)
    private String preferredDisposalMethods;

    @Column(name = "expected_recovery_rate_min", precision = 5, scale = 2)
    private BigDecimal expectedRecoveryRateMin;

    @Column(name = "disposal_period_days")
    private Integer disposalPeriodDays;

    @Column(name = "assignment_strategy", length = 50)
    private String assignmentStrategy;

    @Column(name = "assignment_rules", columnDefinition = "JSON")
    private String assignmentRules;

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
}