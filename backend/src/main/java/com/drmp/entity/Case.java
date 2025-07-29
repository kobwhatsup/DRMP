package com.drmp.entity;

import lombok.*;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Case Entity
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Entity
@Table(name = "cases", indexes = {
    @Index(name = "idx_case_no", columnList = "case_no", unique = true),
    @Index(name = "idx_package_id", columnList = "case_package_id"),
    @Index(name = "idx_overdue_days", columnList = "overdue_days"),
    @Index(name = "idx_status", columnList = "status")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Case extends BaseEntity {

    @Column(name = "case_no", nullable = false, unique = true, length = 100)
    private String caseNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_package_id", nullable = false)
    private CasePackage casePackage;

    // Encrypted debtor information
    @Column(name = "debtor_id_card_encrypted", nullable = false, length = 255)
    private String debtorIdCardEncrypted;

    @Column(name = "debtor_name_encrypted", nullable = false, length = 255)
    private String debtorNameEncrypted;

    @Column(name = "debtor_phone_encrypted", length = 255)
    private String debtorPhoneEncrypted;

    @Column(name = "debtor_gender", length = 10)
    private String debtorGender;

    // Loan information
    @Column(name = "loan_contract_no", length = 100)
    private String loanContractNo;

    @Column(name = "loan_product", length = 100)
    private String loanProduct;

    @Column(name = "loan_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal loanAmount;

    @Column(name = "remaining_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal remainingAmount;

    @Column(name = "overdue_days", nullable = false)
    private Integer overdueDays;

    @Column(name = "overdue_date")
    private LocalDate overdueDate;

    // Case information
    @Column(name = "principal", length = 100)
    private String principal;

    @Column(name = "entrust_start_date", nullable = false)
    private LocalDate entrustStartDate;

    @Column(name = "entrust_end_date", nullable = false)
    private LocalDate entrustEndDate;

    @Column(name = "creditor_name", length = 200)
    private String creditorName;

    // JSON fields for flexible data storage
    @Column(name = "debt_info", columnDefinition = "JSON")
    private String debtInfo;

    @Column(name = "debtor_info", columnDefinition = "JSON")
    private String debtorInfo;

    @Column(name = "contact_info", columnDefinition = "JSON")
    private String contactInfo;

    @Column(name = "custom_fields", columnDefinition = "JSON")
    private String customFields;

    // Status
    @Column(name = "status", nullable = false, length = 30)
    private String status = "PENDING";

    @Column(name = "disposal_status", length = 30)
    private String disposalStatus;
}