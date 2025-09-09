package com.drmp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 智能分案结果响应DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmartAssignResultResponse {
    
    /**
     * 分案执行ID
     */
    private String assignmentId;
    
    /**
     * 案件包ID
     */
    private Long casePackageId;
    
    /**
     * 案件包名称
     */
    private String casePackageName;
    
    /**
     * 总案件数
     */
    private Integer totalCases;
    
    /**
     * 成功分配数
     */
    private Integer assignedCases;
    
    /**
     * 未分配数
     */
    private Integer unassignedCount;
    
    /**
     * 分配成功率
     */
    private BigDecimal successRate;
    
    /**
     * 使用的分案策略
     */
    private String strategy;
    
    /**
     * 规则权重配置
     */
    private Map<String, Integer> ruleWeights;
    
    /**
     * 分配详情列表
     */
    private List<AssignmentDetail> assignmentDetails;
    
    /**
     * 未分配案件列表
     */
    private List<UnassignedCase> unassignedCases;
    
    /**
     * 执行时间
     */
    private LocalDateTime executedAt;
    
    /**
     * 执行耗时（毫秒）
     */
    private Long executionTime;
    
    /**
     * 是否预览模式
     */
    private Boolean isPreview;
    
    /**
     * 分案备注
     */
    private String remarks;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignmentDetail {
        private Long caseId;
        private String caseNumber;
        private BigDecimal caseAmount;
        private Long orgId;
        private String orgName;
        private BigDecimal matchScore;
        private Map<String, BigDecimal> scoreDetails;
        private String matchReason;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UnassignedCase {
        private Long caseId;
        private String caseNumber;
        private BigDecimal caseAmount;
        private String unassignedReason;
        private BigDecimal maxScore;
        private String suggestedAction;
    }
    
    /**
     * 机构分配统计
     */
    private List<OrgAssignmentStat> orgStats;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrgAssignmentStat {
        private Long orgId;
        private String orgName;
        private Integer assignedCount;
        private BigDecimal totalAmount;
        private BigDecimal avgMatchScore;
        private Integer currentLoad;
        private Integer maxCapacity;
        private BigDecimal utilizationRate;
    }
}