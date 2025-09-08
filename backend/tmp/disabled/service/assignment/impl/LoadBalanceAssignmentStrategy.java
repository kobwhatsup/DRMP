package com.drmp.service.assignment.impl;

import com.drmp.entity.CasePackage;
import com.drmp.entity.Organization;
import com.drmp.service.SmartAssignmentService.MatchingAssessment;
import com.drmp.service.assignment.AssignmentStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * 基于负载均衡的分案策略
 * 优先选择当前负载较低的处置机构
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Component
public class LoadBalanceAssignmentStrategy implements AssignmentStrategy {
    
    private Map<String, Object> configParameters = new HashMap<>();
    
    @Override
    public String getStrategyName() {
        return "LOAD_BALANCE";
    }
    
    @Override
    public String getDescription() {
        return "基于负载均衡的分案策略，优先选择当前负载较低的处置机构";
    }
    
    @Override
    public int getPriority() {
        return 5; // 较高优先级
    }
    
    @Override
    public boolean supports(CasePackage casePackage) {
        // 所有案件包都支持负载均衡分案
        return true;
    }
    
    @Override
    public List<AssignmentCandidate> execute(CasePackage casePackage, List<Organization> candidateOrganizations) {
        log.info("Executing load balance assignment strategy for case package: {}", casePackage.getId());
        
        List<AssignmentCandidate> candidates = new ArrayList<>();
        
        // 获取所有机构的负载信息
        Map<Long, Double> organizationLoads = calculateOrganizationLoads(candidateOrganizations);
        
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
            detailScores.put("availability", assessment.getAvailabilityScore());
            detailScores.put("capacity", assessment.getCapacityScore());
            detailScores.put("performance", assessment.getPerformanceScore());
            detailScores.put("experience", assessment.getExperienceScore());
            detailScores.put("loadBalance", 1.0 - organizationLoads.getOrDefault(org.getId(), 0.5));
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
        
        log.info("Load balance assignment completed. Found {} candidates for case package {}", 
            candidates.size(), casePackage.getId());
        
        return candidates;
    }
    
    @Override
    public MatchingAssessment assess(Organization organization, CasePackage casePackage) {
        MatchingAssessment assessment = new MatchingAssessment();
        
        // 可用性评估（负载相关）
        Double availabilityScore = calculateAvailabilityScore(organization);
        
        // 容量匹配度评估
        Double capacityScore = calculateCapacityScore(organization, casePackage);
        
        // 绩效评估
        Double performanceScore = calculatePerformanceScore(organization);
        
        // 经验匹配度评估
        Double experienceScore = calculateExperienceScore(organization, casePackage);
        
        // 地域匹配度评估
        Double geographicScore = calculateGeographicScore(organization, casePackage);
        
        // 计算综合得分（负载均衡策略中，可用性权重最高）
        Double overallScore = availabilityScore * 0.4 + capacityScore * 0.25 + 
                             performanceScore * 0.15 + experienceScore * 0.1 + 
                             geographicScore * 0.1;
        
        assessment.setOverallScore(overallScore);
        assessment.setAvailabilityScore(availabilityScore);
        assessment.setCapacityScore(capacityScore);
        assessment.setPerformanceScore(performanceScore);
        assessment.setExperienceScore(experienceScore);
        assessment.setGeographicScore(geographicScore);
        
        // 生成优势和劣势分析
        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        
        if (availabilityScore >= 0.8) {
            strengths.add("当前负载较低，可立即处理");
        } else if (availabilityScore < 0.4) {
            weaknesses.add("当前负载较高，处理能力有限");
        }
        
        if (capacityScore >= 0.8) {
            strengths.add("处理能力充足");
        } else if (capacityScore < 0.4) {
            weaknesses.add("处理能力可能不足");
        }
        
        if (performanceScore >= 0.8) {
            strengths.add("历史绩效优秀");
        } else if (performanceScore < 0.4) {
            weaknesses.add("历史绩效有待提升");
        }
        
        assessment.setStrengths(strengths);
        assessment.setWeaknesses(weaknesses);
        
        // 生成推荐意见
        String recommendation = generateRecommendation(overallScore, availabilityScore, strengths, weaknesses);
        assessment.setRecommendation(recommendation);
        
        return assessment;
    }
    
    /**
     * 计算机构负载
     */
    private Map<Long, Double> calculateOrganizationLoads(List<Organization> organizations) {
        Map<Long, Double> loads = new HashMap<>();
        
        for (Organization org : organizations) {
            // 这里应该从数据库查询机构当前的案件负载
            // 简化处理，生成模拟数据
            double currentLoad = Math.random(); // 0-1之间的负载率
            loads.put(org.getId(), currentLoad);
        }
        
        return loads;
    }
    
    /**
     * 计算可用性得分（基于当前负载）
     */
    private Double calculateAvailabilityScore(Organization organization) {
        // 模拟负载计算
        double currentLoad = Math.random(); // 实际应该从数据库获取
        double maxCapacity = 100.0; // 最大处理能力
        double currentCases = currentLoad * maxCapacity;
        
        // 负载越低，可用性得分越高
        double availabilityRatio = Math.max(0, (maxCapacity - currentCases) / maxCapacity);
        
        // 转换为0.3-1.0的得分范围
        return 0.3 + (availabilityRatio * 0.7);
    }
    
    /**
     * 计算容量匹配得分
     */
    private Double calculateCapacityScore(Organization organization, CasePackage casePackage) {
        // 简化处理：基于案件包大小和机构容量的匹配度
        double packageSize = casePackage.getCaseCount() * casePackage.getTotalAmount().doubleValue() / 1000000; // 转换为百万
        double orgCapacity = 50 + (Math.random() * 100); // 模拟机构容量
        
        if (packageSize <= orgCapacity * 0.8) {
            return 0.9 + (Math.random() * 0.1); // 容量充足
        } else if (packageSize <= orgCapacity) {
            return 0.6 + (Math.random() * 0.3); // 容量刚好
        } else {
            return 0.2 + (Math.random() * 0.4); // 容量不足
        }
    }
    
    /**
     * 计算绩效得分
     */
    private Double calculatePerformanceScore(Organization organization) {
        // 基于历史绩效数据
        // 这里简化处理
        return 0.5 + (Math.random() * 0.5); // 0.5-1.0之间的随机值
    }
    
    /**
     * 计算经验匹配得分
     */
    private Double calculateExperienceScore(Organization organization, CasePackage casePackage) {
        // 基于机构在相似案件上的经验
        // 这里简化处理
        return 0.4 + (Math.random() * 0.6); // 0.4-1.0之间的随机值
    }
    
    /**
     * 计算地域匹配得分
     */
    private Double calculateGeographicScore(Organization organization, CasePackage casePackage) {
        // 地域匹配（在负载均衡策略中权重较低）
        // 这里简化处理
        return 0.3 + (Math.random() * 0.7); // 0.3-1.0之间的随机值
    }
    
    /**
     * 生成推荐意见
     */
    private String generateRecommendation(Double overallScore, Double availabilityScore, 
                                        List<String> strengths, List<String> weaknesses) {
        StringBuilder recommendation = new StringBuilder();
        
        if (overallScore >= 0.8) {
            recommendation.append("强烈推荐：");
            if (availabilityScore >= 0.8) {
                recommendation.append("负载低，可立即承接，");
            }
            recommendation.append(String.join("，", strengths));
        } else if (overallScore >= 0.6) {
            recommendation.append("推荐：整体条件良好");
            if (availabilityScore >= 0.7) {
                recommendation.append("，当前负载适中");
            }
        } else if (overallScore >= 0.4) {
            recommendation.append("一般：");
            if (availabilityScore < 0.5) {
                recommendation.append("当前负载较高，");
            }
            recommendation.append("存在以下不足：").append(String.join("，", weaknesses));
        } else {
            recommendation.append("不推荐：");
            if (availabilityScore < 0.3) {
                recommendation.append("负载过高，");
            }
            recommendation.append("匹配度较低，").append(String.join("，", weaknesses));
        }
        
        return recommendation.toString();
    }
    
    @Override
    public Map<String, Object> getConfigurationParameters() {
        Map<String, Object> params = new HashMap<>(configParameters);
        params.put("availabilityWeight", 0.4);
        params.put("capacityWeight", 0.25);
        params.put("performanceWeight", 0.15);
        params.put("experienceWeight", 0.1);
        params.put("geographicWeight", 0.1);
        params.put("maxLoadThreshold", 0.8);
        params.put("idealLoadThreshold", 0.6);
        return params;
    }
    
    @Override
    public void setConfigurationParameters(Map<String, Object> parameters) {
        this.configParameters = new HashMap<>(parameters);
    }
}