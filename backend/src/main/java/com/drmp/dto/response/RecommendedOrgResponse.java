package com.drmp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 推荐处置机构响应DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedOrgResponse {
    
    /**
     * 机构ID
     */
    private Long orgId;
    
    /**
     * 机构编码
     */
    private String orgCode;
    
    /**
     * 机构名称
     */
    private String orgName;
    
    /**
     * 机构类型（调解中心/律所）
     */
    private String orgType;
    
    /**
     * 匹配分数（0-100）
     */
    private BigDecimal matchScore;
    
    /**
     * 推荐理由
     */
    private List<String> recommendReasons;
    
    /**
     * 分数明细
     */
    private Map<String, BigDecimal> scoreDetails;
    
    /**
     * 机构所在地区
     */
    private String region;
    
    /**
     * 专长领域
     */
    private List<String> specialties;
    
    /**
     * 当前负载
     */
    private Integer currentLoad;
    
    /**
     * 最大处理能力
     */
    private Integer maxCapacity;
    
    /**
     * 负载率
     */
    private BigDecimal utilizationRate;
    
    /**
     * 历史业绩
     */
    private PerformanceStats performanceStats;
    
    /**
     * 资质信息
     */
    private QualificationInfo qualification;
    
    /**
     * 联系信息
     */
    private ContactInfo contactInfo;
    
    /**
     * 是否已合作过
     */
    private Boolean hasCooperated;
    
    /**
     * 上次合作时间
     */
    private String lastCooperationDate;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformanceStats {
        /**
         * 累计处理案件数
         */
        private Integer totalCasesHandled;
        
        /**
         * 平均回收率
         */
        private BigDecimal avgRecoveryRate;
        
        /**
         * 平均处置天数
         */
        private BigDecimal avgDisposalDays;
        
        /**
         * 成功率
         */
        private BigDecimal successRate;
        
        /**
         * 客户满意度评分
         */
        private BigDecimal satisfactionScore;
        
        /**
         * 近6个月业绩趋势
         */
        private String performanceTrend;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QualificationInfo {
        /**
         * 营业执照号
         */
        private String businessLicense;
        
        /**
         * 成立年限
         */
        private Integer establishedYears;
        
        /**
         * 注册资本
         */
        private BigDecimal registeredCapital;
        
        /**
         * 员工规模
         */
        private String staffSize;
        
        /**
         * 资质证书列表
         */
        private List<String> certificates;
        
        /**
         * 信用评级
         */
        private String creditRating;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContactInfo {
        /**
         * 联系人姓名
         */
        private String contactPerson;
        
        /**
         * 联系人职位
         */
        private String contactPosition;
        
        /**
         * 联系电话
         */
        private String contactPhone;
        
        /**
         * 邮箱
         */
        private String contactEmail;
        
        /**
         * 办公地址
         */
        private String officeAddress;
    }
}