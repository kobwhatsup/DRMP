package com.drmp.entity;

import lombok.*;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * Case Package Assignment Entity
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Entity
@Table(name = "case_package_assignments", indexes = {
    @Index(name = "idx_package_id", columnList = "case_package_id"),
    @Index(name = "idx_disposal_org", columnList = "disposal_org_id"),
    @Index(name = "idx_status", columnList = "status")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CasePackageAssignment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_package_id", nullable = false)
    private CasePackage casePackage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_org_id", nullable = false)
    private Organization sourceOrg;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disposal_org_id", nullable = false)
    private Organization disposalOrg;

    @Column(name = "assignment_type", nullable = false, length = 30)
    private String assignmentType;

    @Column(name = "assignment_strategy", length = 50)
    private String assignmentStrategy;

    @Column(name = "assignment_reason", length = 500)
    private String assignmentReason;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "PENDING";

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @Column(name = "response_status", length = 30)
    private String responseStatus;

    @Column(name = "response_remark", length = 500)
    private String responseRemark;
}