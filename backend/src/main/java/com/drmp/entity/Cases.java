package com.drmp.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 案件实体类
 */
@Data
@Entity
@Table(name = "cases")
@NoArgsConstructor
@AllArgsConstructor
public class Cases {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_no")
    private String caseNo;

    @Column(name = "debtor_name")
    private String debtorName;

    @Column(name = "debtor_id_card")
    private String debtorIdCard;

    @Column(name = "loan_amount")
    private BigDecimal loanAmount;

    @Column(name = "remaining_amount")
    private BigDecimal remainingAmount;

    @Column(name = "overdue_days")
    private Integer overdueDays;

    @Column(name = "status")
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}