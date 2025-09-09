package com.drmp.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

/**
 * 智能分案请求DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmartAssignRequest {
    
    @NotNull(message = "案件包ID不能为空")
    private Long casePackageId;
    
    /**
     * 分案策略类型
     * REGION_BASED: 地域优先
     * PERFORMANCE_BASED: 业绩优先
     * LOAD_BALANCE: 负载均衡
     * SPECIALTY_MATCH: 专业匹配
     * COMPREHENSIVE: 综合评分
     */
    @NotNull(message = "分案策略不能为空")
    private String strategy;
    
    /**
     * 分案规则权重配置
     */
    private Map<String, Integer> ruleWeights;
    
    /**
     * 地域权重（0-100）
     */
    private Integer regionWeight;
    
    /**
     * 业绩权重（0-100）
     */
    private Integer performanceWeight;
    
    /**
     * 负载权重（0-100）
     */
    private Integer loadWeight;
    
    /**
     * 专业匹配权重（0-100）
     */
    private Integer specialtyWeight;
    
    /**
     * 最低匹配分数阈值
     */
    private Double minMatchScore;
    
    /**
     * 每个机构最大分配案件数
     */
    private Integer maxCasesPerOrg;
    
    /**
     * 排除的机构ID列表
     */
    private List<Long> excludeOrgIds;
    
    /**
     * 指定的机构ID列表（仅从这些机构中分配）
     */
    private List<Long> includeOrgIds;
    
    /**
     * 是否预览（true: 仅预览不执行分配）
     */
    private Boolean preview;
    
    /**
     * 是否允许部分分配（当无法全部分配时）
     */
    private Boolean allowPartialAssignment;
    
    /**
     * 分案备注
     */
    private String remarks;
}