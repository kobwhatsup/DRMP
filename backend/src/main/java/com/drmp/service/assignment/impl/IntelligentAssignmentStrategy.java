package com.drmp.service.assignment.impl;

import com.drmp.entity.CasePackage;
import com.drmp.entity.Organization;
import com.drmp.service.SmartAssignmentService.MatchingAssessment;
import com.drmp.service.assignment.AssignmentStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 智能综合分案策略
 * 基于多维度评分的智能匹配算法
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Component
public class IntelligentAssignmentStrategy implements AssignmentStrategy {
    
    // 默认权重配置
    private static final double DEFAULT_GEOGRAPHIC_WEIGHT = 0.30;
    private static final double DEFAULT_PERFORMANCE_WEIGHT = 0.25;
    private static final double DEFAULT_CAPACITY_WEIGHT = 0.25;
    private static final double DEFAULT_EXPERIENCE_WEIGHT = 0.15;
    private static final double DEFAULT_COST_WEIGHT = 0.05;
    
    private Map<String, Object> configParameters = new HashMap<>();
    
    @Override
    public String getStrategyName() {
        return "INTELLIGENT";
    }
    
    @Override
    public String getDescription() {
        return "智能综合分案策略，基于地域、业绩、容量、经验、成本等多维度进行智能匹配";
    }
    
    @Override
    public int getPriority() {
        return 1; // 最高优先级
    }
    
    @Override
    public boolean supports(CasePackage casePackage) {
        // 智能策略支持所有类型的案件包
        return true;
    }
    
    @Override
    public List<AssignmentCandidate> execute(CasePackage casePackage, List<Organization> candidateOrganizations) {
        log.info("Executing intelligent assignment strategy for case package: {}", casePackage.getId());
        
        List<AssignmentCandidate> candidates = new ArrayList<>();
        
        // 分析案件包特征
        CasePackageFeatures caseFeatures = analyzeCasePackageFeatures(casePackage);
        log.info("Case package features analyzed: {}", caseFeatures);
        
        for (Organization org : candidateOrganizations) {
            try {
                // 评估机构与案件包的匹配度
                MatchingAssessment assessment = assess(org, casePackage);
                
                // 创建候选结果
                AssignmentCandidate candidate = createAssignmentCandidate(org, assessment, caseFeatures);
                candidates.add(candidate);
                
            } catch (Exception e) {
                log.error("Error assessing organization {} for case package {}: {}", 
                    org.getId(), casePackage.getId(), e.getMessage());
            }
        }
        
        // 按综合得分降序排列
        candidates.sort((c1, c2) -> Double.compare(c2.getScore(), c1.getScore()));
        
        // 设置排名
        for (int i = 0; i < candidates.size(); i++) {
            candidates.get(i).setRank(i + 1);
        }
        
        // 应用智能过滤规则
        candidates = applyIntelligentFilters(candidates, caseFeatures);
        
        log.info("Intelligent assignment completed. Generated {} candidates for case package {}", 
            candidates.size(), casePackage.getId());
        
        return candidates;
    }
    
    @Override
    public MatchingAssessment assess(Organization organization, CasePackage casePackage) {
        MatchingAssessment assessment = new MatchingAssessment();
        
        try {
            // 1. 地域匹配度评估
            Double geographicScore = calculateGeographicScore(organization, casePackage);
            
            // 2. 业绩匹配度评估
            Double performanceScore = calculatePerformanceScore(organization, casePackage);
            
            // 3. 容量匹配度评估
            Double capacityScore = calculateCapacityScore(organization, casePackage);
            
            // 4. 经验匹配度评估
            Double experienceScore = calculateExperienceScore(organization, casePackage);
            
            // 5. 成本效益评估
            Double costScore = calculateCostEfficiencyScore(organization, casePackage);
            
            // 6. 可用性评估
            Double availabilityScore = calculateAvailabilityScore(organization);
            
            // 计算综合得分
            Double overallScore = calculateWeightedScore(
                geographicScore, performanceScore, capacityScore, 
                experienceScore, costScore, availabilityScore
            );
            
            // 设置评估结果
            assessment.setOverallScore(overallScore);
            assessment.setGeographicScore(geographicScore);
            assessment.setPerformanceScore(performanceScore);
            assessment.setCapacityScore(capacityScore);
            assessment.setExperienceScore(experienceScore);
            assessment.setAvailabilityScore(availabilityScore);
            
            // 生成优势和劣势分析
            generateStrengthsAndWeaknesses(assessment);
            
            // 生成推荐意见
            String recommendation = generateIntelligentRecommendation(assessment, organization, casePackage);
            assessment.setRecommendation(recommendation);
            
        } catch (Exception e) {
            log.error("Error during assessment for organization {}: {}", organization.getId(), e.getMessage());
            // 设置默认值，避免评估失败
            assessment.setOverallScore(0.5);
            assessment.setRecommendation("评估过程中出现异常，建议人工审核");
        }
        
        return assessment;
    }
    
    /**
     * 分析案件包特征
     */
    private CasePackageFeatures analyzeCasePackageFeatures(CasePackage casePackage) {
        CasePackageFeatures features = new CasePackageFeatures();
        
        // 基础特征
        features.setCaseCount(casePackage.getCaseCount() != null ? casePackage.getCaseCount() : 0);
        features.setTotalAmount(casePackage.getTotalAmount() != null ? casePackage.getTotalAmount() : BigDecimal.ZERO);
        features.setAvgAmount(features.getCaseCount() > 0 ? 
            features.getTotalAmount().divide(BigDecimal.valueOf(features.getCaseCount()), 2, BigDecimal.ROUND_HALF_UP) : 
            BigDecimal.ZERO);
        
        // 复杂度评估
        features.setComplexityScore(calculateCaseComplexity(casePackage));
        
        // 紧急程度评估
        features.setUrgencyLevel(calculateUrgencyLevel(casePackage));
        
        // 地域信息提取
        features.setPrimaryRegion(extractPrimaryRegion(casePackage));
        
        return features;
    }
    
    /**
     * 计算地域匹配得分
     */
    private Double calculateGeographicScore(Organization organization, CasePackage casePackage) {
        // 提取案件包主要地域
        String caseRegion = extractPrimaryRegion(casePackage);
        String orgProvince = extractProvince(organization.getAddress());
        String orgCity = extractCity(organization.getAddress());
        
        if (caseRegion == null || orgProvince == null) {
            return 0.6; // 信息不足时给中等分数
        }
        
        // 省份匹配度
        if (caseRegion.equals(orgProvince)) {
            return 1.0; // 同省份，完美匹配
        }
        
        // 邻近省份匹配度
        if (isAdjacentProvince(caseRegion, orgProvince)) {
            return 0.7; // 邻近省份
        }
        
        // 同地区匹配度（华东、华北等）
        if (isSameRegion(caseRegion, orgProvince)) {
            return 0.5; // 同大区
        }
        
        return 0.2; // 距离较远
    }
    
    /**
     * 计算业绩匹配得分
     */
    private Double calculatePerformanceScore(Organization organization, CasePackage casePackage) {
        // 获取机构历史业绩数据（这里模拟，实际应从数据库查询）
        Double historicalRecoveryRate = getHistoricalRecoveryRate(organization);
        Double historicalSuccessRate = getHistoricalSuccessRate(organization);
        Integer casesHandled = getTotalCasesHandled(organization);
        
        // 业绩基础分数
        Double baseScore = (historicalRecoveryRate + historicalSuccessRate) / 2;
        
        // 经验调整因子
        Double experienceFactor = Math.min(1.0, casesHandled / 1000.0); // 处理1000件案子算经验丰富
        
        // 案件类型匹配度
        Double caseTypeMatch = calculateCaseTypeMatchScore(organization, casePackage);
        
        return baseScore * 0.6 + experienceFactor * 0.2 + caseTypeMatch * 0.2;
    }
    
    /**
     * 计算容量匹配得分
     */
    private Double calculateCapacityScore(Organization organization, CasePackage casePackage) {
        Integer monthlyCapacity = organization.getMonthlyCaseCapacity();
        Double currentLoad = organization.getCurrentLoadPercentage() != null ? 
            organization.getCurrentLoadPercentage().doubleValue() : 0.0;
        Integer caseCount = casePackage.getCaseCount();
        
        if (monthlyCapacity == null || currentLoad == null || caseCount == null) {
            return 0.5; // 信息不足
        }
        
        // 计算剩余容量
        Integer remainingCapacity = (int) (monthlyCapacity * (100 - currentLoad) / 100);
        
        if (remainingCapacity <= 0) {
            return 0.0; // 无剩余容量
        }
        
        if (caseCount <= remainingCapacity * 0.5) {
            return 1.0; // 容量充足
        } else if (caseCount <= remainingCapacity * 0.8) {
            return 0.8; // 容量较为充足
        } else if (caseCount <= remainingCapacity) {
            return 0.6; // 容量刚好
        } else {
            return 0.2; // 容量不足
        }
    }
    
    /**
     * 计算经验匹配得分
     */
    private Double calculateExperienceScore(Organization organization, CasePackage casePackage) {
        // 获取机构在相关领域的经验
        List<String> orgSpecialties = getOrganizationSpecialties(organization);
        String caseCategory = determineCaseCategory(casePackage);
        
        // 专业领域匹配度
        Double specialtyMatch = 0.0;
        for (String specialty : orgSpecialties) {
            if (specialty.contains(caseCategory) || caseCategory.contains(specialty)) {
                specialtyMatch = 1.0;
                break;
            } else if (isRelatedSpecialty(specialty, caseCategory)) {
                specialtyMatch = Math.max(specialtyMatch, 0.7);
            }
        }
        
        // 从业年限加分
        Integer yearsInBusiness = getYearsInBusiness(organization);
        Double experienceFactor = Math.min(1.0, yearsInBusiness / 5.0); // 5年以上算经验丰富
        
        return specialtyMatch * 0.7 + experienceFactor * 0.3;
    }
    
    /**
     * 计算成本效益得分
     */
    private Double calculateCostEfficiencyScore(Organization organization, CasePackage casePackage) {
        // 获取机构的费率信息（模拟数据）
        Double commissionRate = getCommissionRate(organization);
        Double fixedFee = getFixedFee(organization);
        
        // 计算预估成本
        BigDecimal totalAmount = casePackage.getTotalAmount();
        Double estimatedCost = 0.0;
        
        if (commissionRate != null && totalAmount != null) {
            estimatedCost = totalAmount.doubleValue() * commissionRate;
        }
        
        if (fixedFee != null) {
            estimatedCost += fixedFee;
        }
        
        // 成本效益评分（成本越低分数越高）
        if (estimatedCost == 0.0) {
            return 0.5; // 信息不足
        }
        
        // 根据行业平均成本进行评分
        Double industryAvgCost = getIndustryAverageCost(casePackage);
        if (estimatedCost <= industryAvgCost * 0.8) {
            return 1.0; // 成本优势明显
        } else if (estimatedCost <= industryAvgCost) {
            return 0.8; // 成本合理
        } else if (estimatedCost <= industryAvgCost * 1.2) {
            return 0.6; // 成本略高
        } else {
            return 0.3; // 成本偏高
        }
    }
    
    /**
     * 计算可用性得分
     */
    private Double calculateAvailabilityScore(Organization organization) {
        Double currentLoad = organization.getCurrentLoadPercentage() != null ? 
            organization.getCurrentLoadPercentage().doubleValue() : 0.0;
        if (currentLoad == null) {
            return 0.6; // 信息不足
        }
        
        if (currentLoad < 50) {
            return 1.0; // 负载很低，可用性极高
        } else if (currentLoad < 70) {
            return 0.8; // 负载适中
        } else if (currentLoad < 85) {
            return 0.6; // 负载较高
        } else if (currentLoad < 95) {
            return 0.3; // 负载很高
        } else {
            return 0.1; // 几乎满负载
        }
    }
    
    /**
     * 计算加权综合得分
     */
    private Double calculateWeightedScore(Double geographic, Double performance, Double capacity, 
                                        Double experience, Double cost, Double availability) {
        double geoWeight = getWeight("geographicWeight", DEFAULT_GEOGRAPHIC_WEIGHT);
        double perfWeight = getWeight("performanceWeight", DEFAULT_PERFORMANCE_WEIGHT);
        double capWeight = getWeight("capacityWeight", DEFAULT_CAPACITY_WEIGHT);
        double expWeight = getWeight("experienceWeight", DEFAULT_EXPERIENCE_WEIGHT);
        double costWeight = getWeight("costWeight", DEFAULT_COST_WEIGHT);
        
        // 可用性作为乘数因子而不是加权因子
        Double baseScore = geographic * geoWeight + 
                          performance * perfWeight + 
                          capacity * capWeight + 
                          experience * expWeight + 
                          cost * costWeight;
        
        // 可用性作为调节因子
        return baseScore * (0.5 + availability * 0.5);
    }
    
    /**
     * 应用智能过滤规则
     */
    private List<AssignmentCandidate> applyIntelligentFilters(List<AssignmentCandidate> candidates, 
                                                            CasePackageFeatures features) {
        return candidates.stream()
            .filter(candidate -> {
                // 最低分数过滤
                if (candidate.getScore() < 0.3) {
                    return false;
                }
                
                // 容量过滤
                if (candidate.getDetailScores().getOrDefault("capacity", 0.0) < 0.2) {
                    return false;
                }
                
                return true;
            })
            .limit(10) // 最多返回10个候选
            .collect(Collectors.toList());
    }
    
    /**
     * 创建分案候选结果
     */
    private AssignmentCandidate createAssignmentCandidate(Organization org, MatchingAssessment assessment, 
                                                        CasePackageFeatures features) {
        AssignmentCandidate candidate = new AssignmentCandidate(
            org.getId(),
            org.getName(),
            assessment.getOverallScore(),
            assessment.getRecommendation()
        );
        
        // 设置详细分数
        Map<String, Double> detailScores = new HashMap<>();
        detailScores.put("geographic", assessment.getGeographicScore());
        detailScores.put("performance", assessment.getPerformanceScore());
        detailScores.put("capacity", assessment.getCapacityScore());
        detailScores.put("experience", assessment.getExperienceScore());
        detailScores.put("availability", assessment.getAvailabilityScore());
        
        candidate.setDetailScores(detailScores);
        candidate.setAssessment(assessment);
        
        return candidate;
    }
    
    // ========== 辅助方法 ==========
    
    private Double getWeight(String key, Double defaultValue) {
        return (Double) configParameters.getOrDefault(key, defaultValue);
    }
    
    private String extractPrimaryRegion(CasePackage casePackage) {
        // 从案件包描述或其他字段中提取主要地域信息
        String description = casePackage.getDescription();
        if (description != null) {
            return extractProvince(description);
        }
        return null;
    }
    
    private String extractProvince(String address) {
        if (address == null) return null;
        
        String[] provinces = {"北京", "上海", "天津", "重庆", "广东", "江苏", "浙江", "山东", 
                             "河南", "四川", "湖北", "湖南", "河北", "福建", "安徽", "江西"};
        for (String province : provinces) {
            if (address.contains(province)) {
                return province;
            }
        }
        return null;
    }
    
    private String extractCity(String address) {
        // 简化的城市提取逻辑
        return null;
    }
    
    private boolean isAdjacentProvince(String province1, String province2) {
        // 简化的邻近省份判断逻辑
        Map<String, List<String>> adjacentMap = new HashMap<>();
        adjacentMap.put("北京", Arrays.asList("天津", "河北"));
        adjacentMap.put("上海", Arrays.asList("江苏", "浙江"));
        // ... 其他省份的邻近关系
        
        return adjacentMap.getOrDefault(province1, Collections.emptyList()).contains(province2) ||
               adjacentMap.getOrDefault(province2, Collections.emptyList()).contains(province1);
    }
    
    private boolean isSameRegion(String province1, String province2) {
        // 简化的大区判断逻辑
        Map<String, String> regionMap = new HashMap<>();
        regionMap.put("北京", "华北");
        regionMap.put("天津", "华北");
        regionMap.put("河北", "华北");
        regionMap.put("上海", "华东");
        regionMap.put("江苏", "华东");
        regionMap.put("浙江", "华东");
        // ... 其他省份的大区归属
        
        String region1 = regionMap.get(province1);
        String region2 = regionMap.get(province2);
        
        return region1 != null && region1.equals(region2);
    }
    
    // 模拟数据获取方法（实际应从数据库查询）
    private Double getHistoricalRecoveryRate(Organization org) {
        return 0.7 + Math.random() * 0.25; // 0.7-0.95
    }
    
    private Double getHistoricalSuccessRate(Organization org) {
        return 0.75 + Math.random() * 0.2; // 0.75-0.95
    }
    
    private Integer getTotalCasesHandled(Organization org) {
        return (int) (Math.random() * 2000); // 0-2000
    }
    
    private Double calculateCaseTypeMatchScore(Organization org, CasePackage casePackage) {
        return 0.7 + Math.random() * 0.3; // 0.7-1.0
    }
    
    private List<String> getOrganizationSpecialties(Organization org) {
        return Arrays.asList("金融纠纷", "债权债务", "合同纠纷");
    }
    
    private String determineCaseCategory(CasePackage casePackage) {
        return "金融纠纷"; // 简化
    }
    
    private boolean isRelatedSpecialty(String specialty, String category) {
        return specialty.contains("金融") && category.contains("金融");
    }
    
    private Integer getYearsInBusiness(Organization org) {
        return (int) (Math.random() * 10) + 1; // 1-10年
    }
    
    private Double getCommissionRate(Organization org) {
        return 0.15 + Math.random() * 0.1; // 15%-25%
    }
    
    private Double getFixedFee(Organization org) {
        return Math.random() * 5000; // 0-5000元固定费用
    }
    
    private Double getIndustryAverageCost(CasePackage casePackage) {
        return casePackage.getTotalAmount().doubleValue() * 0.2; // 假设行业平均20%
    }
    
    private Double calculateCaseComplexity(CasePackage casePackage) {
        // 基于金额、案件数量等计算复杂度
        BigDecimal avgAmount = casePackage.getTotalAmount().divide(
            BigDecimal.valueOf(casePackage.getCaseCount()), 2, BigDecimal.ROUND_HALF_UP);
        
        if (avgAmount.compareTo(BigDecimal.valueOf(100000)) > 0) {
            return 0.9; // 高复杂度
        } else if (avgAmount.compareTo(BigDecimal.valueOf(50000)) > 0) {
            return 0.7; // 中等复杂度
        } else {
            return 0.5; // 低复杂度
        }
    }
    
    private String calculateUrgencyLevel(CasePackage casePackage) {
        // 基于发布时间、期望处置周期等判断紧急程度
        return "NORMAL"; // 简化
    }
    
    private void generateStrengthsAndWeaknesses(MatchingAssessment assessment) {
        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        
        if (assessment.getGeographicScore() >= 0.8) {
            strengths.add("地域匹配度优秀");
        } else if (assessment.getGeographicScore() < 0.4) {
            weaknesses.add("地域距离较远");
        }
        
        if (assessment.getPerformanceScore() >= 0.8) {
            strengths.add("历史业绩表现优异");
        } else if (assessment.getPerformanceScore() < 0.4) {
            weaknesses.add("历史业绩有待提升");
        }
        
        if (assessment.getCapacityScore() >= 0.8) {
            strengths.add("处理能力充足");
        } else if (assessment.getCapacityScore() < 0.4) {
            weaknesses.add("当前负载较重");
        }
        
        assessment.setStrengths(strengths);
        assessment.setWeaknesses(weaknesses);
    }
    
    private String generateIntelligentRecommendation(MatchingAssessment assessment, 
                                                   Organization org, CasePackage casePackage) {
        Double score = assessment.getOverallScore();
        List<String> strengths = assessment.getStrengths();
        List<String> weaknesses = assessment.getWeaknesses();
        
        if (score >= 0.85) {
            return String.format("强烈推荐：综合匹配度%.1f%%，%s", 
                score * 100, String.join("，", strengths));
        } else if (score >= 0.7) {
            return String.format("推荐：综合匹配度%.1f%%，整体表现良好", score * 100);
        } else if (score >= 0.5) {
            return String.format("一般：综合匹配度%.1f%%，存在改进空间：%s", 
                score * 100, String.join("，", weaknesses));
        } else {
            return String.format("不推荐：综合匹配度%.1f%%，匹配度较低", score * 100);
        }
    }
    
    @Override
    public Map<String, Object> getConfigurationParameters() {
        Map<String, Object> params = new HashMap<>(configParameters);
        params.put("geographicWeight", DEFAULT_GEOGRAPHIC_WEIGHT);
        params.put("performanceWeight", DEFAULT_PERFORMANCE_WEIGHT);
        params.put("capacityWeight", DEFAULT_CAPACITY_WEIGHT);
        params.put("experienceWeight", DEFAULT_EXPERIENCE_WEIGHT);
        params.put("costWeight", DEFAULT_COST_WEIGHT);
        return params;
    }
    
    @Override
    public void setConfigurationParameters(Map<String, Object> parameters) {
        this.configParameters = new HashMap<>(parameters);
    }
    
    /**
     * 案件包特征类
     */
    private static class CasePackageFeatures {
        private Integer caseCount;
        private BigDecimal totalAmount;
        private BigDecimal avgAmount;
        private Double complexityScore;
        private String urgencyLevel;
        private String primaryRegion;
        
        // Getters and Setters
        public Integer getCaseCount() { return caseCount; }
        public void setCaseCount(Integer caseCount) { this.caseCount = caseCount; }
        
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
        
        public BigDecimal getAvgAmount() { return avgAmount; }
        public void setAvgAmount(BigDecimal avgAmount) { this.avgAmount = avgAmount; }
        
        public Double getComplexityScore() { return complexityScore; }
        public void setComplexityScore(Double complexityScore) { this.complexityScore = complexityScore; }
        
        public String getUrgencyLevel() { return urgencyLevel; }
        public void setUrgencyLevel(String urgencyLevel) { this.urgencyLevel = urgencyLevel; }
        
        public String getPrimaryRegion() { return primaryRegion; }
        public void setPrimaryRegion(String primaryRegion) { this.primaryRegion = primaryRegion; }
        
        @Override
        public String toString() {
            return String.format("CasePackageFeatures{caseCount=%d, totalAmount=%s, avgAmount=%s, complexity=%.2f, urgency=%s, region=%s}",
                caseCount, totalAmount, avgAmount, complexityScore, urgencyLevel, primaryRegion);
        }
    }
}