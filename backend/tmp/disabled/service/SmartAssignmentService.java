package com.drmp.service;

import com.drmp.dto.request.AssignmentRuleRequest;
import com.drmp.dto.response.AssignmentRecommendationResponse;
import com.drmp.dto.response.AssignmentRuleResponse;
import com.drmp.entity.CasePackage;
import com.drmp.entity.Organization;

import java.util.List;
import java.util.Map;

/**
 * Smart Assignment Service Interface
 * 智能分案服务接口
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public interface SmartAssignmentService {

    /**
     * 智能推荐处置机构
     * 
     * @param casePackageId 案件包ID
     * @param limit 推荐数量限制
     * @return 推荐的处置机构列表
     */
    List<AssignmentRecommendationResponse> getRecommendations(Long casePackageId, Integer limit);

    /**
     * 基于规则的自动分案
     * 
     * @param casePackageId 案件包ID
     * @param ruleId 分案规则ID
     * @return 分案结果
     */
    AssignmentResult executeAutoAssignment(Long casePackageId, Long ruleId);

    /**
     * 批量智能分案
     * 
     * @param casePackageIds 案件包ID列表
     * @param strategy 分案策略
     * @return 批量分案结果
     */
    BatchAssignmentResult executeBatchAssignment(List<Long> casePackageIds, String strategy);

    /**
     * 评估机构与案件包的匹配度
     * 
     * @param organizationId 机构ID
     * @param casePackageId 案件包ID
     * @return 匹配度评估结果
     */
    MatchingAssessment assessMatching(Long organizationId, Long casePackageId);

    /**
     * 创建分案规则
     * 
     * @param request 规则创建请求
     * @return 创建的规则
     */
    AssignmentRuleResponse createAssignmentRule(AssignmentRuleRequest request);

    /**
     * 更新分案规则
     * 
     * @param ruleId 规则ID
     * @param request 更新请求
     * @return 更新后的规则
     */
    AssignmentRuleResponse updateAssignmentRule(Long ruleId, AssignmentRuleRequest request);

    /**
     * 删除分案规则
     * 
     * @param ruleId 规则ID
     */
    void deleteAssignmentRule(Long ruleId);

    /**
     * 获取分案规则列表
     * 
     * @param organizationId 机构ID（可选）
     * @return 规则列表
     */
    List<AssignmentRuleResponse> getAssignmentRules(Long organizationId);

    /**
     * 测试分案规则
     * 
     * @param ruleId 规则ID
     * @param casePackageId 测试案件包ID
     * @return 测试结果
     */
    RuleTestResult testAssignmentRule(Long ruleId, Long casePackageId);

    /**
     * 获取分案统计数据
     * 
     * @param organizationId 机构ID（可选）
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 统计数据
     */
    AssignmentStatistics getAssignmentStatistics(Long organizationId, String startDate, String endDate);

    /**
     * 获取机构能力画像
     * 
     * @param organizationId 机构ID
     * @return 能力画像
     */
    OrganizationCapabilityProfile getCapabilityProfile(Long organizationId);

    /**
     * 预测分案成功率
     * 
     * @param organizationId 机构ID
     * @param casePackage 案件包
     * @return 预测成功率
     */
    Double predictSuccessRate(Long organizationId, CasePackage casePackage);

    /**
     * 分案结果
     */
    class AssignmentResult {
        private boolean success;
        private Long assignedOrganizationId;
        private String assignedOrganizationName;
        private Double matchingScore;
        private String strategy;
        private String reason;
        private Map<String, Object> details;

        // Constructors
        public AssignmentResult() {}

        public AssignmentResult(boolean success, Long assignedOrganizationId, String assignedOrganizationName,
                              Double matchingScore, String strategy, String reason) {
            this.success = success;
            this.assignedOrganizationId = assignedOrganizationId;
            this.assignedOrganizationName = assignedOrganizationName;
            this.matchingScore = matchingScore;
            this.strategy = strategy;
            this.reason = reason;
        }

        // Getters and Setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public Long getAssignedOrganizationId() { return assignedOrganizationId; }
        public void setAssignedOrganizationId(Long assignedOrganizationId) { this.assignedOrganizationId = assignedOrganizationId; }

        public String getAssignedOrganizationName() { return assignedOrganizationName; }
        public void setAssignedOrganizationName(String assignedOrganizationName) { this.assignedOrganizationName = assignedOrganizationName; }

        public Double getMatchingScore() { return matchingScore; }
        public void setMatchingScore(Double matchingScore) { this.matchingScore = matchingScore; }

        public String getStrategy() { return strategy; }
        public void setStrategy(String strategy) { this.strategy = strategy; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }

        public Map<String, Object> getDetails() { return details; }
        public void setDetails(Map<String, Object> details) { this.details = details; }
    }

    /**
     * 批量分案结果
     */
    class BatchAssignmentResult {
        private int totalCount;
        private int successCount;
        private int failedCount;
        private List<AssignmentResult> results;
        private Map<String, Object> summary;

        // Constructors
        public BatchAssignmentResult() {}

        // Getters and Setters
        public int getTotalCount() { return totalCount; }
        public void setTotalCount(int totalCount) { this.totalCount = totalCount; }

        public int getSuccessCount() { return successCount; }
        public void setSuccessCount(int successCount) { this.successCount = successCount; }

        public int getFailedCount() { return failedCount; }
        public void setFailedCount(int failedCount) { this.failedCount = failedCount; }

        public List<AssignmentResult> getResults() { return results; }
        public void setResults(List<AssignmentResult> results) { this.results = results; }

        public Map<String, Object> getSummary() { return summary; }
        public void setSummary(Map<String, Object> summary) { this.summary = summary; }
    }

    /**
     * 匹配度评估结果
     */
    class MatchingAssessment {
        private Double overallScore;
        private Double geographicScore;
        private Double capacityScore;
        private Double experienceScore;
        private Double performanceScore;
        private Double availabilityScore;
        private List<String> strengths;
        private List<String> weaknesses;
        private String recommendation;
        private Map<String, Object> detailScores;

        // Constructors
        public MatchingAssessment() {}

        // Getters and Setters
        public Double getOverallScore() { return overallScore; }
        public void setOverallScore(Double overallScore) { this.overallScore = overallScore; }

        public Double getGeographicScore() { return geographicScore; }
        public void setGeographicScore(Double geographicScore) { this.geographicScore = geographicScore; }

        public Double getCapacityScore() { return capacityScore; }
        public void setCapacityScore(Double capacityScore) { this.capacityScore = capacityScore; }

        public Double getExperienceScore() { return experienceScore; }
        public void setExperienceScore(Double experienceScore) { this.experienceScore = experienceScore; }

        public Double getPerformanceScore() { return performanceScore; }
        public void setPerformanceScore(Double performanceScore) { this.performanceScore = performanceScore; }

        public Double getAvailabilityScore() { return availabilityScore; }
        public void setAvailabilityScore(Double availabilityScore) { this.availabilityScore = availabilityScore; }

        public List<String> getStrengths() { return strengths; }
        public void setStrengths(List<String> strengths) { this.strengths = strengths; }

        public List<String> getWeaknesses() { return weaknesses; }
        public void setWeaknesses(List<String> weaknesses) { this.weaknesses = weaknesses; }

        public String getRecommendation() { return recommendation; }
        public void setRecommendation(String recommendation) { this.recommendation = recommendation; }

        public Map<String, Object> getDetailScores() { return detailScores; }
        public void setDetailScores(Map<String, Object> detailScores) { this.detailScores = detailScores; }
    }

    /**
     * 规则测试结果
     */
    class RuleTestResult {
        private boolean ruleMatched;
        private Double score;
        private String reason;
        private Map<String, Object> conditions;
        private List<String> matchedCriteria;
        private List<String> unmatchedCriteria;

        // Constructors
        public RuleTestResult() {}

        // Getters and Setters
        public boolean isRuleMatched() { return ruleMatched; }
        public void setRuleMatched(boolean ruleMatched) { this.ruleMatched = ruleMatched; }

        public Double getScore() { return score; }
        public void setScore(Double score) { this.score = score; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }

        public Map<String, Object> getConditions() { return conditions; }
        public void setConditions(Map<String, Object> conditions) { this.conditions = conditions; }

        public List<String> getMatchedCriteria() { return matchedCriteria; }
        public void setMatchedCriteria(List<String> matchedCriteria) { this.matchedCriteria = matchedCriteria; }

        public List<String> getUnmatchedCriteria() { return unmatchedCriteria; }
        public void setUnmatchedCriteria(List<String> unmatchedCriteria) { this.unmatchedCriteria = unmatchedCriteria; }
    }

    /**
     * 分案统计数据
     */
    class AssignmentStatistics {
        private Long totalAssignments;
        private Long successfulAssignments;
        private Long failedAssignments;
        private Double successRate;
        private Double avgMatchingScore;
        private Map<String, Long> assignmentsByStrategy;
        private Map<String, Double> performanceByOrganization;
        private List<Map<String, Object>> recentAssignments;

        // Constructors
        public AssignmentStatistics() {}

        // Getters and Setters
        public Long getTotalAssignments() { return totalAssignments; }
        public void setTotalAssignments(Long totalAssignments) { this.totalAssignments = totalAssignments; }

        public Long getSuccessfulAssignments() { return successfulAssignments; }
        public void setSuccessfulAssignments(Long successfulAssignments) { this.successfulAssignments = successfulAssignments; }

        public Long getFailedAssignments() { return failedAssignments; }
        public void setFailedAssignments(Long failedAssignments) { this.failedAssignments = failedAssignments; }

        public Double getSuccessRate() { return successRate; }
        public void setSuccessRate(Double successRate) { this.successRate = successRate; }

        public Double getAvgMatchingScore() { return avgMatchingScore; }
        public void setAvgMatchingScore(Double avgMatchingScore) { this.avgMatchingScore = avgMatchingScore; }

        public Map<String, Long> getAssignmentsByStrategy() { return assignmentsByStrategy; }
        public void setAssignmentsByStrategy(Map<String, Long> assignmentsByStrategy) { this.assignmentsByStrategy = assignmentsByStrategy; }

        public Map<String, Double> getPerformanceByOrganization() { return performanceByOrganization; }
        public void setPerformanceByOrganization(Map<String, Double> performanceByOrganization) { this.performanceByOrganization = performanceByOrganization; }

        public List<Map<String, Object>> getRecentAssignments() { return recentAssignments; }
        public void setRecentAssignments(List<Map<String, Object>> recentAssignments) { this.recentAssignments = recentAssignments; }
    }

    /**
     * 机构能力画像
     */
    class OrganizationCapabilityProfile {
        private Long organizationId;
        private String organizationName;
        private Double overallCapability;
        private Map<String, Double> regionStrengths;
        private Map<String, Double> amountRangeStrengths;
        private Map<String, Double> caseTypeStrengths;
        private Double currentLoad;
        private Double averageSuccessRate;
        private List<String> specializations;
        private Map<String, Object> historicalPerformance;

        // Constructors
        public OrganizationCapabilityProfile() {}

        // Getters and Setters
        public Long getOrganizationId() { return organizationId; }
        public void setOrganizationId(Long organizationId) { this.organizationId = organizationId; }

        public String getOrganizationName() { return organizationName; }
        public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }

        public Double getOverallCapability() { return overallCapability; }
        public void setOverallCapability(Double overallCapability) { this.overallCapability = overallCapability; }

        public Map<String, Double> getRegionStrengths() { return regionStrengths; }
        public void setRegionStrengths(Map<String, Double> regionStrengths) { this.regionStrengths = regionStrengths; }

        public Map<String, Double> getAmountRangeStrengths() { return amountRangeStrengths; }
        public void setAmountRangeStrengths(Map<String, Double> amountRangeStrengths) { this.amountRangeStrengths = amountRangeStrengths; }

        public Map<String, Double> getCaseTypeStrengths() { return caseTypeStrengths; }
        public void setCaseTypeStrengths(Map<String, Double> caseTypeStrengths) { this.caseTypeStrengths = caseTypeStrengths; }

        public Double getCurrentLoad() { return currentLoad; }
        public void setCurrentLoad(Double currentLoad) { this.currentLoad = currentLoad; }

        public Double getAverageSuccessRate() { return averageSuccessRate; }
        public void setAverageSuccessRate(Double averageSuccessRate) { this.averageSuccessRate = averageSuccessRate; }

        public List<String> getSpecializations() { return specializations; }
        public void setSpecializations(List<String> specializations) { this.specializations = specializations; }

        public Map<String, Object> getHistoricalPerformance() { return historicalPerformance; }
        public void setHistoricalPerformance(Map<String, Object> historicalPerformance) { this.historicalPerformance = historicalPerformance; }
    }
}