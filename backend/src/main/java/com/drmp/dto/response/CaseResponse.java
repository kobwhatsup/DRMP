package com.drmp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 案件响应DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaseResponse {
    
    /**
     * 案件ID
     */
    private Long id;
    
    /**
     * 案件编号
     */
    private String caseNumber;
    
    /**
     * 案件包ID
     */
    private Long casePackageId;
    
    /**
     * 案件包名称
     */
    private String casePackageName;
    
    /**
     * 债务人姓名
     */
    private String debtorName;
    
    /**
     * 债务人身份证号（脱敏）
     */
    private String debtorIdCard;
    
    /**
     * 债务人手机号（脱敏）
     */
    private String debtorPhone;
    
    /**
     * 债务人地址
     */
    private String debtorAddress;
    
    /**
     * 贷款金额
     */
    private BigDecimal loanAmount;
    
    /**
     * 剩余本金
     */
    private BigDecimal remainingPrincipal;
    
    /**
     * 剩余利息
     */
    private BigDecimal remainingInterest;
    
    /**
     * 总欠款金额
     */
    private BigDecimal totalDebtAmount;
    
    /**
     * 逾期天数
     */
    private Integer overdueDays;
    
    /**
     * 逾期阶段
     */
    private String overdueStage;
    
    /**
     * 贷款日期
     */
    private LocalDate loanDate;
    
    /**
     * 到期日期
     */
    private LocalDate dueDate;
    
    /**
     * 最后还款日期
     */
    private LocalDate lastPaymentDate;
    
    /**
     * 案件状态
     */
    private String status;
    
    /**
     * 处置状态
     */
    private String disposalStatus;
    
    /**
     * 处置方式
     */
    private String disposalMethod;
    
    /**
     * 分配的处置机构ID
     */
    private Long assignedOrgId;
    
    /**
     * 分配的处置机构名称
     */
    private String assignedOrgName;
    
    /**
     * 分配的处置人员ID
     */
    private Long assignedUserId;
    
    /**
     * 分配的处置人员姓名
     */
    private String assignedUserName;
    
    /**
     * 分配时间
     */
    private LocalDateTime assignedAt;
    
    /**
     * 开始处置时间
     */
    private LocalDateTime disposalStartedAt;
    
    /**
     * 处置完成时间
     */
    private LocalDateTime disposalCompletedAt;
    
    /**
     * 回收金额
     */
    private BigDecimal recoveredAmount;
    
    /**
     * 回收率
     */
    private BigDecimal recoveryRate;
    
    /**
     * 处置天数
     */
    private Integer disposalDays;
    
    /**
     * 债务类型
     */
    private String debtType;
    
    /**
     * 担保方式
     */
    private String guaranteeMethod;
    
    /**
     * 抵押物信息
     */
    private String collateralInfo;
    
    /**
     * 风险等级
     */
    private String riskLevel;
    
    /**
     * 标签
     */
    private String tags;
    
    /**
     * 备注
     */
    private String remarks;
    
    /**
     * 扩展信息（JSON格式存储的其他字段）
     */
    private Map<String, Object> extendedInfo;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
}