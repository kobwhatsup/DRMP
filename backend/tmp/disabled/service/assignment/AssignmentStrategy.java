package com.drmp.service.assignment;

import com.drmp.entity.CasePackage;
import com.drmp.entity.Organization;
import com.drmp.service.SmartAssignmentService.MatchingAssessment;

import java.util.List;
import java.util.Map;

/**
 * 分案策略接口
 * 定义不同的分案算法策略
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public interface AssignmentStrategy {
    
    /**
     * 策略名称
     */
    String getStrategyName();
    
    /**
     * 策略描述
     */
    String getDescription();
    
    /**
     * 策略优先级（数字越小优先级越高）
     */
    int getPriority();
    
    /**
     * 是否支持该案件包类型
     */
    boolean supports(CasePackage casePackage);
    
    /**
     * 执行分案策略
     * 
     * @param casePackage 案件包
     * @param candidateOrganizations 候选处置机构列表
     * @return 分案结果列表，按匹配度降序排列
     */
    List<AssignmentCandidate> execute(CasePackage casePackage, List<Organization> candidateOrganizations);
    
    /**
     * 评估单个机构与案件包的匹配度
     * 
     * @param organization 处置机构
     * @param casePackage 案件包
     * @return 匹配度评估结果
     */
    MatchingAssessment assess(Organization organization, CasePackage casePackage);
    
    /**
     * 获取策略配置参数
     */
    Map<String, Object> getConfigurationParameters();
    
    /**
     * 设置策略配置参数
     */
    void setConfigurationParameters(Map<String, Object> parameters);
    
    /**
     * 分案候选结果
     */
    class AssignmentCandidate {
        private Long organizationId;
        private String organizationName;
        private Double score;
        private String reason;
        private Map<String, Double> detailScores;
        private MatchingAssessment assessment;
        private int rank;
        
        public AssignmentCandidate() {}
        
        public AssignmentCandidate(Long organizationId, String organizationName, Double score, String reason) {
            this.organizationId = organizationId;
            this.organizationName = organizationName;
            this.score = score;
            this.reason = reason;
        }
        
        // Getters and Setters
        public Long getOrganizationId() { return organizationId; }
        public void setOrganizationId(Long organizationId) { this.organizationId = organizationId; }
        
        public String getOrganizationName() { return organizationName; }
        public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }
        
        public Double getScore() { return score; }
        public void setScore(Double score) { this.score = score; }
        
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        
        public Map<String, Double> getDetailScores() { return detailScores; }
        public void setDetailScores(Map<String, Double> detailScores) { this.detailScores = detailScores; }
        
        public MatchingAssessment getAssessment() { return assessment; }
        public void setAssessment(MatchingAssessment assessment) { this.assessment = assessment; }
        
        public int getRank() { return rank; }
        public void setRank(int rank) { this.rank = rank; }
    }
}