package com.drmp.service.assignment.impl;

import com.drmp.entity.CasePackage;
import com.drmp.entity.Organization;
import com.drmp.service.SmartAssignmentService.MatchingAssessment;
import com.drmp.service.assignment.AssignmentStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * 基于绩效的分案策略
 * 优先选择历史绩效优秀的处置机构
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Component
public class PerformanceAssignmentStrategy implements AssignmentStrategy {
    
    private Map<String, Object> configParameters = new HashMap<>();
    
    @Override
    public String getStrategyName() {
        return "PERFORMANCE";
    }
    
    @Override
    public String getDescription() {
        return "基于历史绩效的分案策略，优先选择历史绩效优秀的处置机构";
    }
    
    @Override
    public int getPriority() {
        return 1; // 最高优先级
    }
    
    @Override
    public boolean supports(CasePackage casePackage) {
        // 对于高价值案件包，优先使用绩效策略
        return casePackage.getTotalAmount().doubleValue() > 1000000; // 大于100万的案件包
    }
    
    @Override
    public List<AssignmentCandidate> execute(CasePackage casePackage, List<Organization> candidateOrganizations) {
        log.info("Executing performance assignment strategy for case package: {}", casePackage.getId());
        
        List<AssignmentCandidate> candidates = new ArrayList<>();
        
        for (Organization org : candidateOrganizations) {
            MatchingAssessment assessment = assess(org, casePackage);
            
            AssignmentCandidate candidate = new AssignmentCandidate(
                org.getId(),
                org.getName(),
                assessment.getOverallScore(),
                assessment.getRecommendation()
            );
            
            // 设置详细分数
            Map<String, Double> detailScores = new HashMap<>();
            detailScores.put("performance", assessment.getPerformanceScore());
            detailScores.put("experience", assessment.getExperienceScore());
            detailScores.put("capacity", assessment.getCapacityScore());
            detailScores.put("availability", assessment.getAvailabilityScore());
            detailScores.put("geographic", assessment.getGeographicScore());
            candidate.setDetailScores(detailScores);
            candidate.setAssessment(assessment);
            
            candidates.add(candidate);
        }
        
        // 按得分降序排列
        candidates.sort((c1, c2) -> Double.compare(c2.getScore(), c1.getScore()));
        
        // 设置排名
        for (int i = 0; i < candidates.size(); i++) {
            candidates.get(i).setRank(i + 1);
        }
        
        log.info("Performance assignment completed. Found {} candidates for case package {}", 
            candidates.size(), casePackage.getId());
        
        return candidates;
    }
    
    @Override
    public MatchingAssessment assess(Organization organization, CasePackage casePackage) {
        MatchingAssessment assessment = new MatchingAssessment();
        
        // 绩效评估（核心指标）
        Double performanceScore = calculatePerformanceScore(organization);
        
        // 经验匹配度评估
        Double experienceScore = calculateExperienceScore(organization, casePackage);
        
        // 容量匹配度评估
        Double capacityScore = calculateCapacityScore(organization, casePackage);
        
        // 可用性评估
        Double availabilityScore = calculateAvailabilityScore(organization);
        
        // 地域匹配度评估
        Double geographicScore = calculateGeographicScore(organization, casePackage);
        
        // 计算综合得分（绩效策略中，绩效和经验权重最高）
        Double overallScore = performanceScore * 0.4 + experienceScore * 0.3 + 
                             capacityScore * 0.15 + availabilityScore * 0.1 + 
                             geographicScore * 0.05;
        
        assessment.setOverallScore(overallScore);
        assessment.setPerformanceScore(performanceScore);
        assessment.setExperienceScore(experienceScore);
        assessment.setCapacityScore(capacityScore);
        assessment.setAvailabilityScore(availabilityScore);
        assessment.setGeographicScore(geographicScore);
        
        // 生成优势和劣势分析
        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        
        if (performanceScore >= 0.9) {
            strengths.add("历史绩效优异，回收率超过行业平均水平");
        } else if (performanceScore >= 0.7) {
            strengths.add("历史绩效良好");
        } else if (performanceScore < 0.5) {
            weaknesses.add("历史绩效有待提升");
        }
        
        if (experienceScore >= 0.8) {
            strengths.add("在类似案件处理上经验丰富");
        } else if (experienceScore < 0.4) {
            weaknesses.add("在类似案件处理上经验不足");
        }
        
        if (capacityScore >= 0.8) {
            strengths.add("处理能力充足");
        } else if (capacityScore < 0.4) {
            weaknesses.add("处理能力可能不足");
        }
        
        assessment.setStrengths(strengths);
        assessment.setWeaknesses(weaknesses);
        
        // 生成推荐意见
        String recommendation = generateRecommendation(overallScore, performanceScore, experienceScore, strengths, weaknesses);
        assessment.setRecommendation(recommendation);
        
        return assessment;
    }
    
    /**
     * 计算绩效得分
     */
    private Double calculatePerformanceScore(Organization organization) {
        // 这里应该基于真实的历史绩效数据计算
        // 包括：回收率、处理速度、客户满意度等指标
        
        // 模拟绩效计算
        Map<String, Double> performanceMetrics = getPerformanceMetrics(organization.getId());
        
        double recoveryRate = performanceMetrics.getOrDefault("recoveryRate", 0.6); // 回收率
        double processingSpeed = performanceMetrics.getOrDefault("processingSpeed", 0.7); // 处理速度
        double clientSatisfaction = performanceMetrics.getOrDefault("clientSatisfaction", 0.8); // 客户满意度
        double complianceRate = performanceMetrics.getOrDefault("complianceRate", 0.9); // 合规率
        
        // 综合绩效评分
        return recoveryRate * 0.4 + processingSpeed * 0.25 + 
               clientSatisfaction * 0.2 + complianceRate * 0.15;
    }
    
    /**
     * 计算经验匹配得分
     */
    private Double calculateExperienceScore(Organization organization, CasePackage casePackage) {
        // 基于机构在相似案件上的处理经验
        Map<String, Integer> experienceMetrics = getExperienceMetrics(organization.getId());
        
        // 案件金额范围经验
        double amountRange = casePackage.getTotalAmount().doubleValue();
        double amountExperience = 0.5;
        if (amountRange > 5000000) { // 大额案件
            amountExperience = experienceMetrics.getOrDefault("largeAmountCases", 0) > 10 ? 0.9 : 0.4;
        } else if (amountRange > 1000000) { // 中额案件
            amountExperience = experienceMetrics.getOrDefault("mediumAmountCases", 0) > 20 ? 0.8 : 0.6;
        } else { // 小额案件
            amountExperience = experienceMetrics.getOrDefault("smallAmountCases", 0) > 50 ? 0.7 : 0.8;
        }
        
        // 案件数量经验
        int caseCount = casePackage.getCaseCount();
        double volumeExperience = 0.5;
        if (caseCount > 1000) {
            volumeExperience = experienceMetrics.getOrDefault("largeBatchCases", 0) > 5 ? 0.9 : 0.3;
        } else if (caseCount > 100) {
            volumeExperience = experienceMetrics.getOrDefault("mediumBatchCases", 0) > 10 ? 0.8 : 0.6;
        } else {
            volumeExperience = 0.7; // 小批量案件相对容易处理
        }
        
        // 综合经验得分
        return (amountExperience + volumeExperience) / 2;
    }
    
    /**
     * 计算容量匹配得分
     */
    private Double calculateCapacityScore(Organization organization, CasePackage casePackage) {
        // 获取机构容量信息
        Map<String, Double> capacityInfo = getCapacityInfo(organization.getId());
        
        double maxCapacity = capacityInfo.getOrDefault("maxCapacity", 100.0);
        double currentLoad = capacityInfo.getOrDefault("currentLoad", 0.5);
        double availableCapacity = maxCapacity * (1 - currentLoad);
        
        double requiredCapacity = estimateRequiredCapacity(casePackage);
        
        if (availableCapacity >= requiredCapacity * 1.5) {
            return 1.0; // 容量充足
        } else if (availableCapacity >= requiredCapacity) {
            return 0.8; // 容量刚好
        } else if (availableCapacity >= requiredCapacity * 0.7) {
            return 0.5; // 容量紧张
        } else {
            return 0.2; // 容量不足
        }
    }
    
    /**
     * 计算可用性得分
     */
    private Double calculateAvailabilityScore(Organization organization) {
        Map<String, Double> capacityInfo = getCapacityInfo(organization.getId());
        double currentLoad = capacityInfo.getOrDefault("currentLoad", 0.5);
        
        // 负载越低，可用性越高
        return Math.max(0.1, 1.0 - currentLoad);
    }
    
    /**
     * 计算地域匹配得分
     */
    private Double calculateGeographicScore(Organization organization, CasePackage casePackage) {
        // 在绩效策略中，地域权重较低，主要作为辅助考虑因素
        return 0.5 + (Math.random() * 0.5); // 简化处理
    }
    
    /**
     * 获取绩效指标
     */
    private Map<String, Double> getPerformanceMetrics(Long organizationId) {
        // 这里应该从数据库查询真实的绩效数据
        // 简化处理，返回模拟数据
        Map<String, Double> metrics = new HashMap<>();
        metrics.put("recoveryRate", 0.6 + (Math.random() * 0.35)); // 60%-95%
        metrics.put("processingSpeed", 0.5 + (Math.random() * 0.5)); // 50%-100%
        metrics.put("clientSatisfaction", 0.7 + (Math.random() * 0.3)); // 70%-100%
        metrics.put("complianceRate", 0.8 + (Math.random() * 0.2)); // 80%-100%
        return metrics;
    }
    
    /**
     * 获取经验指标
     */
    private Map<String, Integer> getExperienceMetrics(Long organizationId) {
        // 这里应该从数据库查询真实的经验数据
        // 简化处理，返回模拟数据
        Map<String, Integer> metrics = new HashMap<>();
        metrics.put("largeAmountCases", (int)(Math.random() * 20)); // 大额案件数量
        metrics.put("mediumAmountCases", (int)(Math.random() * 50)); // 中额案件数量
        metrics.put("smallAmountCases", (int)(Math.random() * 100)); // 小额案件数量
        metrics.put("largeBatchCases", (int)(Math.random() * 10)); // 大批量案件数量
        metrics.put("mediumBatchCases", (int)(Math.random() * 20)); // 中批量案件数量
        return metrics;
    }
    
    /**
     * 获取容量信息
     */
    private Map<String, Double> getCapacityInfo(Long organizationId) {
        // 这里应该从数据库查询真实的容量数据
        Map<String, Double> info = new HashMap<>();
        info.put("maxCapacity", 50.0 + (Math.random() * 150)); // 最大容量
        info.put("currentLoad", Math.random() * 0.8); // 当前负载率
        return info;
    }
    
    /**
     * 估算所需容量
     */
    private Double estimateRequiredCapacity(CasePackage casePackage) {
        // 基于案件数量和复杂度估算所需容量
        double baseCapacity = casePackage.getCaseCount() * 0.1; // 每个案件需要0.1个容量单位
        double amountFactor = Math.log10(casePackage.getTotalAmount().doubleValue() / 10000) / 10; // 金额复杂度因子
        return baseCapacity * (1 + amountFactor);
    }
    
    /**
     * 生成推荐意见
     */
    private String generateRecommendation(Double overallScore, Double performanceScore, Double experienceScore,
                                        List<String> strengths, List<String> weaknesses) {
        StringBuilder recommendation = new StringBuilder();
        
        if (overallScore >= 0.85) {
            recommendation.append("强烈推荐：");
            if (performanceScore >= 0.9) {
                recommendation.append("顶级绩效机构，");
            }
            if (experienceScore >= 0.8) {
                recommendation.append("经验丰富，");
            }
            recommendation.append(String.join("，", strengths));
        } else if (overallScore >= 0.7) {
            recommendation.append("推荐：");
            if (performanceScore >= 0.8) {
                recommendation.append("绩效优良，");
            }
            recommendation.append("整体条件良好");
        } else if (overallScore >= 0.5) {
            recommendation.append("谨慎推荐：");
            if (performanceScore < 0.6) {
                recommendation.append("绩效表现一般，");
            }
            if (!weaknesses.isEmpty()) {
                recommendation.append("存在不足：").append(String.join("，", weaknesses));
            }
        } else {
            recommendation.append("不推荐：");
            if (performanceScore < 0.5) {
                recommendation.append("历史绩效不佳，");
            }
            recommendation.append("综合评估不符合要求，").append(String.join("，", weaknesses));
        }
        
        return recommendation.toString();
    }
    
    @Override
    public Map<String, Object> getConfigurationParameters() {
        Map<String, Object> params = new HashMap<>(configParameters);
        params.put("performanceWeight", 0.4);
        params.put("experienceWeight", 0.3);
        params.put("capacityWeight", 0.15);
        params.put("availabilityWeight", 0.1);
        params.put("geographicWeight", 0.05);
        params.put("minPerformanceThreshold", 0.6);
        params.put("preferredPerformanceThreshold", 0.8);
        return params;
    }
    
    @Override
    public void setConfigurationParameters(Map<String, Object> parameters) {
        this.configParameters = new HashMap<>(parameters);
    }
}