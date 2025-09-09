package com.drmp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

/**
 * 预警统计响应DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertStatisticsResponse {
    
    /**
     * 总预警数
     */
    private Integer total;
    
    /**
     * 按级别统计
     */
    private Map<String, Integer> byLevel;
    
    /**
     * 按类型统计
     */
    private Map<String, Integer> byType;
    
    /**
     * 按状态统计
     */
    private Map<String, Integer> byStatus;
    
    /**
     * 未解决预警数
     */
    private Integer unresolved;
    
    /**
     * 今日预警数
     */
    private Integer todayCount;
    
    /**
     * 本周预警数
     */
    private Integer weekCount;
    
    /**
     * 本月预警数
     */
    private Integer monthCount;
    
    /**
     * 平均响应时间（分钟）
     */
    private BigDecimal avgResponseTime;
    
    /**
     * 平均解决时间（分钟）
     */
    private BigDecimal avgResolutionTime;
    
    /**
     * 解决率
     */
    private BigDecimal resolutionRate;
    
    /**
     * 升级率
     */
    private BigDecimal escalationRate;
    
    /**
     * 误报率
     */
    private BigDecimal falsePositiveRate;
    
    /**
     * 最活跃规则
     */
    private String mostActiveRule;
    
    /**
     * 最常见类型
     */
    private String mostCommonType;
    
    /**
     * 最严重级别预警数
     */
    private Integer criticalCount;
    
    /**
     * 高危预警数
     */
    private Integer highCount;
    
    /**
     * 中等预警数
     */
    private Integer mediumCount;
    
    /**
     * 低危预警数
     */
    private Integer lowCount;
}