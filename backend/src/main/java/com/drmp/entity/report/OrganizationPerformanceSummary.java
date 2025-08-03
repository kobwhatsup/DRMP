package com.drmp.entity.report;

import com.drmp.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 机构业绩汇总实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "organization_performance_summary")
public class OrganizationPerformanceSummary extends BaseEntity {

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;

    @Enumerated(EnumType.STRING)
    @Column(name = "organization_type", nullable = false)
    private OrganizationType organizationType;

    @Column(name = "statistic_date", nullable = false)
    private LocalDate statisticDate;

    // 基础指标
    @Column(name = "active_packages")
    private Integer activePackages = 0;

    @Column(name = "total_cases")
    private Integer totalCases = 0;

    @Column(name = "new_cases")
    private Integer newCases = 0;

    @Column(name = "completed_cases")
    private Integer completedCases = 0;

    // 金额指标
    @Column(name = "total_amount", precision = 15, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "recovered_amount", precision = 15, scale = 2)
    private BigDecimal recoveredAmount = BigDecimal.ZERO;

    @Column(name = "recovery_rate", precision = 8, scale = 4)
    private BigDecimal recoveryRate = BigDecimal.ZERO;

    // 效率指标
    @Column(name = "avg_processing_days", precision = 8, scale = 2)
    private BigDecimal avgProcessingDays = BigDecimal.ZERO;

    @Column(name = "success_rate", precision = 8, scale = 4)
    private BigDecimal successRate = BigDecimal.ZERO;

    // 案源方特有指标
    @Column(name = "partnered_orgs")
    private Integer partneredOrgs = 0;

    // 处置方特有指标
    @Column(name = "staff_count")
    private Integer staffCount = 0;

    @Column(name = "cases_per_staff", precision = 8, scale = 2)
    private BigDecimal casesPerStaff = BigDecimal.ZERO;

    /**
     * 机构类型枚举
     */
    public enum OrganizationType {
        SOURCE("案源机构"),
        DISPOSAL("处置机构");

        private final String description;

        OrganizationType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 计算回款率
     */
    public BigDecimal calculateRecoveryRate() {
        if (totalAmount != null && totalAmount.compareTo(BigDecimal.ZERO) > 0) {
            return recoveredAmount.divide(totalAmount, 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        return BigDecimal.ZERO;
    }

    /**
     * 计算成功率
     */
    public BigDecimal calculateSuccessRate() {
        if (totalCases != null && totalCases > 0) {
            return BigDecimal.valueOf(completedCases)
                    .divide(BigDecimal.valueOf(totalCases), 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        return BigDecimal.ZERO;
    }

    /**
     * 计算人均案件数
     */
    public BigDecimal calculateCasesPerStaff() {
        if (staffCount != null && staffCount > 0) {
            return BigDecimal.valueOf(totalCases)
                    .divide(BigDecimal.valueOf(staffCount), 2, BigDecimal.ROUND_HALF_UP);
        }
        return BigDecimal.ZERO;
    }
}