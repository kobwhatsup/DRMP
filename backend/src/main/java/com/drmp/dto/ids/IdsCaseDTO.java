package com.drmp.dto.ids;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * IDS系统案件传输对象
 *
 * @author DRMP Team
 */
@Data
public class IdsCaseDTO {
    
    /**
     * DRMP系统中的案件ID
     */
    private Long caseId;
    
    /**
     * 借据编号
     */
    private String loanNo;
    
    /**
     * 债务人姓名
     */
    private String debtorName;
    
    /**
     * 债务人身份证号
     */
    private String debtorIdCard;
    
    /**
     * 债务人手机号
     */
    private String debtorPhone;
    
    /**
     * 债务人性别
     */
    private String gender;
    
    /**
     * 贷款产品
     */
    private String loanProduct;
    
    /**
     * 贷款金额
     */
    private BigDecimal loanAmount;
    
    /**
     * 剩余应还金额
     */
    private BigDecimal remainingAmount;
    
    /**
     * 逾期天数
     */
    private Integer overdueDays;
    
    /**
     * 逾期日期
     */
    private LocalDate overdueDate;
    
    /**
     * 委托开始日期
     */
    private LocalDate commissionStartDate;
    
    /**
     * 委托结束日期
     */
    private LocalDate commissionEndDate;
    
    /**
     * 资方名称
     */
    private String capitalName;
    
    /**
     * 处置要求
     */
    private String disposalRequirements;
    
    /**
     * 期望回款率
     */
    private BigDecimal expectedRecoveryRate;
    
    /**
     * 期望处置周期（天）
     */
    private Integer expectedDisposalDays;
    
    /**
     * 案件优先级
     */
    private String priority = "NORMAL"; // HIGH, NORMAL, LOW
    
    /**
     * 案件标签
     */
    private String tags;
    
    /**
     * 扩展数据
     */
    private String extraData;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 最后更新时间
     */
    private LocalDateTime updatedAt;
}