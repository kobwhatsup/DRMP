package com.drmp.service.assignment.impl;

import com.drmp.entity.CasePackage;
import com.drmp.entity.Organization;
import com.drmp.service.SmartAssignmentService.MatchingAssessment;
import com.drmp.service.assignment.AssignmentStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * 基于地域的分案策略
 * 优先匹配同地区的处置机构
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Component
public class GeographicAssignmentStrategy implements AssignmentStrategy {
    
    private Map<String, Object> configParameters = new HashMap<>();
    
    @Override
    public String getStrategyName() {
        return "GEOGRAPHIC";
    }
    
    @Override
    public String getDescription() {
        return "基于地域匹配的分案策略，优先选择同地区的处置机构";
    }
    
    @Override
    public int getPriority() {
        return 10; // 中等优先级
    }
    
    @Override
    public boolean supports(CasePackage casePackage) {
        // 所有案件包都支持地域分案
        return true;
    }
    
    @Override
    public List<AssignmentCandidate> execute(CasePackage casePackage, List<Organization> candidateOrganizations) {
        log.info("Executing geographic assignment strategy for case package: {}", casePackage.getId());
        
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
            detailScores.put("geographic", assessment.getGeographicScore());
            detailScores.put("capacity", assessment.getCapacityScore());
            detailScores.put("experience", assessment.getExperienceScore());
            detailScores.put("availability", assessment.getAvailabilityScore());
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
        
        log.info("Geographic assignment completed. Found {} candidates for case package {}", 
            candidates.size(), casePackage.getId());
        
        return candidates;
    }
    
    @Override
    public MatchingAssessment assess(Organization organization, CasePackage casePackage) {
        MatchingAssessment assessment = new MatchingAssessment();
        
        // 地域匹配度评估
        Double geographicScore = calculateGeographicScore(organization, casePackage);
        
        // 容量匹配度评估
        Double capacityScore = calculateCapacityScore(organization, casePackage);
        
        // 经验匹配度评估
        Double experienceScore = calculateExperienceScore(organization, casePackage);
        
        // 可用性评估
        Double availabilityScore = calculateAvailabilityScore(organization);
        
        // 绩效评估
        Double performanceScore = calculatePerformanceScore(organization);
        
        // 计算综合得分
        Double overallScore = calculateOverallScore(
            geographicScore, capacityScore, experienceScore, 
            availabilityScore, performanceScore
        );
        
        assessment.setOverallScore(overallScore);
        assessment.setGeographicScore(geographicScore);
        assessment.setCapacityScore(capacityScore);
        assessment.setExperienceScore(experienceScore);
        assessment.setAvailabilityScore(availabilityScore);
        assessment.setPerformanceScore(performanceScore);
        
        // 生成优势和劣势分析
        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        
        if (geographicScore >= 0.8) {
            strengths.add("地域匹配度高");
        } else if (geographicScore < 0.4) {
            weaknesses.add("地域距离较远");
        }
        
        if (capacityScore >= 0.8) {
            strengths.add("处理能力充足");
        } else if (capacityScore < 0.4) {
            weaknesses.add("处理能力不足");
        }
        
        if (experienceScore >= 0.8) {
            strengths.add("相关经验丰富");
        } else if (experienceScore < 0.4) {
            weaknesses.add("相关经验不足");
        }
        
        assessment.setStrengths(strengths);
        assessment.setWeaknesses(weaknesses);
        
        // 生成推荐意见
        String recommendation = generateRecommendation(overallScore, strengths, weaknesses);
        assessment.setRecommendation(recommendation);
        
        return assessment;
    }
    
    /**
     * 计算地域匹配得分
     */
    private Double calculateGeographicScore(Organization organization, CasePackage casePackage) {
        // 这里简化处理，实际应该基于具体的地理位置数据
        // 假设从案件包和机构的地址信息中提取省份、城市等信息进行匹配
        
        String orgProvince = extractProvince(organization.getAddress());
        String caseProvince = extractProvinceFromCasePackage(casePackage);
        
        if (orgProvince != null && caseProvince != null) {
            if (orgProvince.equals(caseProvince)) {
                return 1.0; // 同省份
            } else {
                // 可以基于省份距离等因素计算相似度
                return 0.3; // 不同省份
            }
        }
        
        return 0.5; // 信息不足，给中等分数
    }
    
    /**
     * 计算容量匹配得分
     */
    private Double calculateCapacityScore(Organization organization, CasePackage casePackage) {
        // 基于机构当前负载和案件包规模计算
        // 这里简化处理
        return 0.7 + (Math.random() * 0.3); // 0.7-1.0之间的随机值
    }
    
    /**
     * 计算经验匹配得分
     */
    private Double calculateExperienceScore(Organization organization, CasePackage casePackage) {
        // 基于机构历史处理类似案件的经验
        // 这里简化处理
        return 0.6 + (Math.random() * 0.4); // 0.6-1.0之间的随机值
    }
    
    /**
     * 计算可用性得分
     */
    private Double calculateAvailabilityScore(Organization organization) {
        // 基于机构当前工作负载
        // 这里简化处理
        return 0.7 + (Math.random() * 0.3); // 0.7-1.0之间的随机值
    }
    
    /**
     * 计算绩效得分
     */
    private Double calculatePerformanceScore(Organization organization) {
        // 基于机构历史绩效
        // 这里简化处理
        return 0.6 + (Math.random() * 0.4); // 0.6-1.0之间的随机值
    }
    
    /**
     * 计算综合得分
     */
    private Double calculateOverallScore(Double geographic, Double capacity, Double experience, 
                                       Double availability, Double performance) {
        // 地域策略中，地域权重较高
        return geographic * 0.4 + capacity * 0.2 + experience * 0.2 + 
               availability * 0.1 + performance * 0.1;
    }
    
    /**
     * 生成推荐意见
     */
    private String generateRecommendation(Double score, List<String> strengths, List<String> weaknesses) {
        if (score >= 0.8) {
            return "强烈推荐：" + String.join("，", strengths);
        } else if (score >= 0.6) {
            return "推荐：整体匹配度良好";
        } else if (score >= 0.4) {
            return "一般：存在以下不足：" + String.join("，", weaknesses);
        } else {
            return "不推荐：匹配度较低，" + String.join("，", weaknesses);
        }
    }
    
    /**
     * 从地址中提取省份信息
     */
    private String extractProvince(String address) {
        if (address == null || address.isEmpty()) {
            return null;
        }
        
        // 简化的省份提取逻辑
        String[] provinces = {"北京", "上海", "天津", "重庆", "广东", "江苏", "浙江", "山东", "河南", "四川"};
        for (String province : provinces) {
            if (address.contains(province)) {
                return province;
            }
        }
        return null;
    }
    
    /**
     * 从案件包中提取省份信息
     */
    private String extractProvinceFromCasePackage(CasePackage casePackage) {
        // 这里可以从案件包的相关信息中提取地域信息
        // 简化处理，假设从描述或其他字段中提取
        return extractProvince(casePackage.getDescription());
    }
    
    @Override
    public Map<String, Object> getConfigurationParameters() {
        Map<String, Object> params = new HashMap<>(configParameters);
        params.put("geographicWeight", 0.4);
        params.put("capacityWeight", 0.2);
        params.put("experienceWeight", 0.2);
        params.put("availabilityWeight", 0.1);
        params.put("performanceWeight", 0.1);
        return params;
    }
    
    @Override
    public void setConfigurationParameters(Map<String, Object> parameters) {
        this.configParameters = new HashMap<>(parameters);
    }
}