package com.drmp.entity.report;

import com.drmp.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 平台运营统计实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "platform_operation_stats")
public class PlatformOperationStats extends BaseEntity {

    @Column(name = "statistic_date", nullable = false, unique = true)
    private LocalDate statisticDate;

    // 机构统计
    @Column(name = "total_orgs")
    private Integer totalOrgs = 0;

    @Column(name = "active_orgs")
    private Integer activeOrgs = 0;

    @Column(name = "new_orgs")
    private Integer newOrgs = 0;

    @Column(name = "source_orgs")
    private Integer sourceOrgs = 0;

    @Column(name = "disposal_orgs")
    private Integer disposalOrgs = 0;

    // 案件统计
    @Column(name = "total_packages")
    private Integer totalPackages = 0;

    @Column(name = "active_packages")
    private Integer activePackages = 0;

    @Column(name = "total_cases")
    private Long totalCases = 0L;

    @Column(name = "processing_cases")
    private Long processingCases = 0L;

    @Column(name = "completed_cases")
    private Long completedCases = 0L;

    // 金额统计
    @Column(name = "total_amount", precision = 18, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "recovered_amount", precision = 18, scale = 2)
    private BigDecimal recoveredAmount = BigDecimal.ZERO;

    @Column(name = "platform_commission", precision = 18, scale = 2)
    private BigDecimal platformCommission = BigDecimal.ZERO;

    // 效率统计
    @Column(name = "avg_assignment_hours", precision = 8, scale = 2)
    private BigDecimal avgAssignmentHours = BigDecimal.ZERO;

    @Column(name = "avg_processing_days", precision = 8, scale = 2)
    private BigDecimal avgProcessingDays = BigDecimal.ZERO;

    @Column(name = "overall_recovery_rate", precision = 8, scale = 4)
    private BigDecimal overallRecoveryRate = BigDecimal.ZERO;

    // 系统健康指标
    @Column(name = "api_call_count")
    private Long apiCallCount = 0L;

    @Column(name = "error_rate", precision = 8, scale = 4)
    private BigDecimal errorRate = BigDecimal.ZERO;

    @Column(name = "avg_response_time", precision = 8, scale = 2)
    private BigDecimal avgResponseTime = BigDecimal.ZERO;

    // 收入统计
    @Column(name = "membership_revenue", precision = 15, scale = 2)
    private BigDecimal membershipRevenue = BigDecimal.ZERO;

    @Column(name = "service_revenue", precision = 15, scale = 2)
    private BigDecimal serviceRevenue = BigDecimal.ZERO;

    /**
     * 计算整体回款率
     */
    public BigDecimal calculateOverallRecoveryRate() {
        if (totalAmount != null && totalAmount.compareTo(BigDecimal.ZERO) > 0) {
            return recoveredAmount.divide(totalAmount, 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        return BigDecimal.ZERO;
    }

    /**
     * 计算案件完成率
     */
    public BigDecimal calculateCompletionRate() {
        if (totalCases != null && totalCases > 0) {
            return BigDecimal.valueOf(completedCases)
                    .divide(BigDecimal.valueOf(totalCases), 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        return BigDecimal.ZERO;
    }

    /**
     * 计算机构活跃率
     */
    public BigDecimal calculateOrgActiveRate() {
        if (totalOrgs != null && totalOrgs > 0) {
            return BigDecimal.valueOf(activeOrgs)
                    .divide(BigDecimal.valueOf(totalOrgs), 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        return BigDecimal.ZERO;
    }

    /**
     * 计算总收入
     */
    public BigDecimal calculateTotalRevenue() {
        return membershipRevenue.add(serviceRevenue);
    }

    /**
     * 计算平均每案件金额
     */
    public BigDecimal calculateAvgAmountPerCase() {
        if (totalCases != null && totalCases > 0) {
            return totalAmount.divide(BigDecimal.valueOf(totalCases), 2, BigDecimal.ROUND_HALF_UP);
        }
        return BigDecimal.ZERO;
    }
}