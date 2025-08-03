package com.drmp.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 案件详情实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "case_details")
public class CaseDetail extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_package_id", nullable = false)
    private CasePackage casePackage;

    @Column(name = "case_number", unique = true, nullable = false, length = 100)
    private String caseNumber;

    // 债务人基本信息
    @Column(name = "debtor_id_card", nullable = false, length = 32)
    private String debtorIdCard; // 加密存储

    @Column(name = "debtor_name", nullable = false, length = 100)
    private String debtorName;

    @Column(name = "debtor_phone", length = 20)
    private String debtorPhone;

    @Enumerated(EnumType.STRING)
    @Column(name = "debtor_gender")
    private Gender debtorGender;

    @Column(name = "debtor_education", length = 50)
    private String debtorEducation;

    @Column(name = "debtor_nation", length = 50)
    private String debtorNation;

    @Column(name = "debtor_marriage", length = 50)
    private String debtorMarriage;

    // 债务人地址信息
    @Column(name = "registered_province", length = 50)
    private String registeredProvince;

    @Column(name = "registered_city", length = 50)
    private String registeredCity;

    @Column(name = "registered_address", columnDefinition = "TEXT")
    private String registeredAddress;

    @Column(name = "current_province", length = 50)
    private String currentProvince;

    @Column(name = "current_city", length = 50)
    private String currentCity;

    @Column(name = "current_address", columnDefinition = "TEXT")
    private String currentAddress;

    // 债务人工作信息
    @Column(name = "work_company", length = 200)
    private String workCompany;

    @Column(name = "work_position", length = 100)
    private String workPosition;

    @Column(name = "work_start_date")
    private LocalDate workStartDate;

    @Column(name = "work_phone", length = 20)
    private String workPhone;

    @Column(name = "work_province", length = 50)
    private String workProvince;

    @Column(name = "work_city", length = 50)
    private String workCity;

    @Column(name = "work_address", columnDefinition = "TEXT")
    private String workAddress;

    // 借款项目信息
    @Column(name = "loan_project", nullable = false, length = 200)
    private String loanProject;

    @Column(name = "contract_number", length = 100)
    private String contractNumber;

    @Column(name = "loan_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal loanAmount;

    @Column(name = "remaining_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal remainingAmount;

    @Column(name = "overdue_days", nullable = false)
    private Integer overdueDays;

    @Column(name = "principal_amount", precision = 15, scale = 2)
    private BigDecimal principalAmount;

    @Column(name = "interest_amount", precision = 15, scale = 2)
    private BigDecimal interestAmount;

    @Column(name = "penalty_amount", precision = 15, scale = 2)
    private BigDecimal penaltyAmount;

    // 委托信息
    @Column(name = "entrust_party", nullable = false, length = 200)
    private String entrustParty;

    @Column(name = "entrust_start_time", nullable = false)
    private LocalDateTime entrustStartTime;

    @Column(name = "entrust_end_time", nullable = false)
    private LocalDateTime entrustEndTime;

    @Column(name = "funding_party", nullable = false, length = 200)
    private String fundingParty;

    @Column(name = "first_entrust_time")
    private LocalDateTime firstEntrustTime;

    // 贷款详细信息
    @Column(name = "contract_amount", precision = 15, scale = 2)
    private BigDecimal contractAmount;

    @Column(name = "total_periods")
    private Integer totalPeriods;

    @Column(name = "monthly_payment", precision = 15, scale = 2)
    private BigDecimal monthlyPayment;

    @Column(name = "monthly_interest_rate", precision = 8, scale = 6)
    private BigDecimal monthlyInterestRate;

    @Column(name = "monthly_fee_rate", precision = 8, scale = 6)
    private BigDecimal monthlyFeeRate;

    @Column(name = "annual_interest_rate", precision = 8, scale = 6)
    private BigDecimal annualInterestRate;

    @Column(name = "loan_date")
    private LocalDate loanDate;

    @Column(name = "first_payment_date")
    private LocalDate firstPaymentDate;

    @Column(name = "loan_due_date")
    private LocalDate loanDueDate;

    @Column(name = "payment_method", length = 100)
    private String paymentMethod;

    @Column(name = "min_payment", precision = 15, scale = 2)
    private BigDecimal minPayment;

    @Column(name = "paid_amount", precision = 15, scale = 2)
    private BigDecimal paidAmount;

    @Column(name = "paid_periods")
    private Integer paidPeriods;

    @Column(name = "is_completed")
    private Boolean isCompleted = false;

    @Column(name = "remaining_periods")
    private Integer remainingPeriods;

    @Column(name = "remaining_principal", precision = 15, scale = 2)
    private BigDecimal remainingPrincipal;

    @Column(name = "remaining_interest_rate", precision = 8, scale = 6)
    private BigDecimal remainingInterestRate;

    @Column(name = "monthly_remaining_principal", precision = 15, scale = 2)
    private BigDecimal monthlyRemainingPrincipal;

    @Column(name = "overdue_date")
    private LocalDate overdueDate;

    @Column(name = "outstanding_interest", precision = 15, scale = 2)
    private BigDecimal outstandingInterest;

    @Column(name = "overdue_penalty", precision = 15, scale = 2)
    private BigDecimal overduePenalty;

    @Column(name = "penalty_interest_rate", precision = 8, scale = 6)
    private BigDecimal penaltyInterestRate;

    @Column(name = "overdue_penalty_interest", precision = 15, scale = 2)
    private BigDecimal overduePenaltyInterest;

    @Column(name = "remaining_payment_periods")
    private Integer remainingPaymentPeriods;

    @Column(name = "overdue_m_value")
    private Integer overdueMValue;

    @Column(name = "preferential_policy", columnDefinition = "TEXT")
    private String preferentialPolicy;

    // 商品信息
    @Column(name = "product_name", length = 200)
    private String productName;

    @Column(name = "product_type", length = 100)
    private String productType;

    @Column(name = "product_price", precision = 15, scale = 2)
    private BigDecimal productPrice;

    @Column(name = "product_down_payment", precision = 15, scale = 2)
    private BigDecimal productDownPayment;

    // 渠道信息
    @Column(name = "channel_name", length = 200)
    private String channelName;

    @Column(name = "channel_type", length = 100)
    private String channelType;

    @Column(name = "has_jurisdiction_agreement")
    private Boolean hasJurisdictionAgreement = false;

    // 其他债权信息
    @Column(name = "funding_nature", length = 100)
    private String fundingNature;

    @Column(name = "debtor_number", length = 100)
    private String debtorNumber;

    @Column(name = "total_debt_amount", precision = 15, scale = 2)
    private BigDecimal totalDebtAmount;

    @Column(name = "guarantor", length = 200)
    private String guarantor;

    @Column(name = "guarantee_fee", precision = 15, scale = 2)
    private BigDecimal guaranteeFee;

    @Column(name = "payment_method_type", length = 100)
    private String paymentMethodType;

    @Column(name = "account_number", length = 50)
    private String accountNumber;

    @Column(name = "bank_name", length = 200)
    private String bankName;

    // 自定义字段
    @Column(name = "custom_field_1", length = 500)
    private String customField1;

    @Column(name = "custom_field_2", length = 500)
    private String customField2;

    @Column(name = "custom_field_3", length = 500)
    private String customField3;

    @Column(name = "custom_field_4", length = 500)
    private String customField4;

    @Column(name = "custom_field_5", length = 500)
    private String customField5;

    @Column(name = "custom_field_6", length = 500)
    private String customField6;

    @Column(name = "custom_field_7", length = 500)
    private String customField7;

    @Column(name = "custom_field_8", length = 500)
    private String customField8;

    @Column(name = "custom_field_9", length = 500)
    private String customField9;

    @Column(name = "custom_field_10", length = 500)
    private String customField10;

    // 处置状态
    @Enumerated(EnumType.STRING)
    @Column(name = "disposal_status")
    private DisposalStatus disposalStatus = DisposalStatus.PENDING;

    @Column(name = "assigned_org_id")
    private Long assignedOrgId;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "disposal_start_time")
    private LocalDateTime disposalStartTime;

    @Column(name = "disposal_end_time")
    private LocalDateTime disposalEndTime;

    @Column(name = "current_recovered_amount", precision = 15, scale = 2)
    private BigDecimal currentRecoveredAmount = BigDecimal.ZERO;

    // 关联关系
    @OneToMany(mappedBy = "caseDetail", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CaseContact> contacts;

    @OneToMany(mappedBy = "caseDetail", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CaseAttachment> attachments;

    /**
     * 性别枚举
     */
    public enum Gender {
        M("男"),
        F("女"),
        U("未知");

        private final String description;

        Gender(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 处置状态枚举
     */
    public enum DisposalStatus {
        PENDING("待处置"),
        ASSIGNED("已分配"),
        PROCESSING("处置中"),
        MEDIATION_SUCCESS("调解成功"),
        LITIGATION_FILED("已立案"),
        COMPLETED("已完成"),
        CLOSED("已关闭");

        private final String description;

        DisposalStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 计算回款率
     */
    public BigDecimal getRecoveryRate() {
        if (remainingAmount != null && remainingAmount.compareTo(BigDecimal.ZERO) > 0) {
            return currentRecoveredAmount.divide(remainingAmount, 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        return BigDecimal.ZERO;
    }

    /**
     * 检查是否已完成处置
     */
    public boolean isDisposalCompleted() {
        return disposalStatus == DisposalStatus.COMPLETED || 
               disposalStatus == DisposalStatus.CLOSED;
    }

    /**
     * 检查是否可以开始处置
     */
    public boolean canStartDisposal() {
        return disposalStatus == DisposalStatus.ASSIGNED;
    }
}