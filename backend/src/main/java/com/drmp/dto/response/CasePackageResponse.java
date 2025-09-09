package com.drmp.dto.response;

import com.drmp.entity.enums.AssignmentType;
import com.drmp.entity.enums.CasePackageStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Case Package Response DTO
 * 案件包响应DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CasePackageResponse {
    
    /**
     * 案件包ID
     */
    private Long id;
    
    /**
     * 案件包编号
     */
    private String packageCode;
    
    /**
     * 案件包名称
     */
    private String packageName;
    
    /**
     * 状态
     */
    private CasePackageStatus status;
    
    /**
     * 分案类型
     */
    private AssignmentType assignmentType;
    
    /**
     * 案件数量
     */
    private Integer caseCount;
    
    /**
     * 总金额
     */
    private BigDecimal totalAmount;
    
    /**
     * 剩余金额
     */
    private BigDecimal remainingAmount;
    
    /**
     * 预期回收率
     */
    private BigDecimal expectedRecoveryRate;
    
    /**
     * 预期处置天数
     */
    private Integer expectedDisposalDays;
    
    /**
     * 优先处置方式
     */
    private String preferredDisposalMethods;
    
    /**
     * 源机构ID
     */
    private Long sourceOrgId;
    
    /**
     * 源机构名称
     */
    private String sourceOrgName;
    
    /**
     * 处置机构ID
     */
    private Long disposalOrgId;
    
    /**
     * 处置机构名称
     */
    private String disposalOrgName;
    
    /**
     * 委托开始日期
     */
    private LocalDate entrustStartDate;
    
    /**
     * 委托结束日期
     */
    private LocalDate entrustEndDate;
    
    /**
     * 描述
     */
    private String description;
    
    /**
     * 是否允许竞标
     */
    private Boolean allowBidding;
    
    /**
     * 竞标开始时间
     */
    private LocalDateTime biddingStartTime;
    
    /**
     * 竞标结束时间
     */
    private LocalDateTime biddingEndTime;
    
    /**
     * 发布时间
     */
    private LocalDateTime publishedAt;
    
    /**
     * 分配时间
     */
    private LocalDateTime assignedAt;
    
    /**
     * 完成时间
     */
    private LocalDateTime completedAt;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
    
    /**
     * 是否收藏
     */
    private Boolean isFavorite;
    
    /**
     * 当前竞标数量
     */
    private Integer currentBidCount;
    
    /**
     * 标签
     */
    private String[] tags;
}