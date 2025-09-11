package com.drmp.entity;

import com.drmp.entity.enums.OrganizationStatus;
import com.drmp.entity.enums.OrganizationType;
import lombok.*;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Organization Entity
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Entity
@Table(name = "organizations", indexes = {
    @Index(name = "idx_org_code", columnList = "org_code", unique = true),
    @Index(name = "idx_org_type_status", columnList = "org_type,status")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Organization extends BaseEntity {

    @Column(name = "org_code", nullable = false, unique = true, length = 50)
    private String orgCode;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private OrganizationType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private OrganizationStatus status;

    @Column(name = "contact_person", length = 50)
    private String contactPerson;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "business_license", length = 500)
    private String businessLicense;

    @Column(name = "team_size")
    private Integer teamSize;

    @Column(name = "monthly_case_capacity")
    private Integer monthlyCaseCapacity;

    @Column(name = "current_load_percentage")
    private Integer currentLoadPercentage;

    @Column(name = "membership_fee", precision = 10, scale = 2)
    private BigDecimal membershipFee;

    @Column(name = "membership_start_date")
    private LocalDate membershipStartDate;

    @Column(name = "membership_end_date")
    private LocalDate membershipEndDate;

    @Builder.Default
    @Column(name = "membership_status", length = 20)
    private String membershipStatus = "UNPAID";

    @Builder.Default
    @Column(name = "membership_paid", nullable = false)
    private Boolean membershipPaid = false;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "payment_reference", length = 100)
    private String paymentReference;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "org_service_regions", joinColumns = @JoinColumn(name = "org_id"))
    @Column(name = "region")
    private Set<String> serviceRegions = new HashSet<>();

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "org_business_scopes", joinColumns = @JoinColumn(name = "org_id"))
    @Column(name = "scope")
    private Set<String> businessScopes = new HashSet<>();

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "org_disposal_types", joinColumns = @JoinColumn(name = "org_id"))
    @Column(name = "disposal_type")
    private Set<String> disposalTypes = new HashSet<>();

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "org_settlement_methods", joinColumns = @JoinColumn(name = "org_id"))
    @Column(name = "settlement_method")
    private Set<String> settlementMethods = new HashSet<>();

    @Column(name = "cooperation_cases", columnDefinition = "TEXT")
    private String cooperationCases;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "approval_status", length = 20)
    private String approvalStatus;

    @Column(name = "approval_by")
    private Long approvalBy;

    @Column(name = "approval_at")
    private LocalDateTime approvalAt;

    @Column(name = "approval_remark", length = 500)
    private String approvalRemark;

    @Column(name = "registration_type", length = 20)
    private String registrationType; // ONLINE, OFFLINE

    @Column(name = "legal_representative", length = 100)
    private String legalRepresentative;

    @Column(name = "registered_capital")
    private Double registeredCapital;

    @Column(name = "registration_date")
    private LocalDateTime registrationDate;

    @Column(name = "qualification_documents", columnDefinition = "TEXT")
    private String qualificationDocuments;

    @Column(name = "bank_account", length = 100)
    private String bankAccount;

    @Column(name = "bank_name", length = 200)
    private String bankName;

    @Builder.Default
    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<User> users = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "sourceOrganization", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CasePackage> sourceCasePackages = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "disposalOrganization", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CasePackage> disposalCasePackages = new ArrayList<>();

    /**
     * 获取机构名称
     * 
     * @return 机构名称
     */
    public String getName() {
        return this.name;
    }
}