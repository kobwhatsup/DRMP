package com.drmp.service;

import com.drmp.dto.request.AssignmentApplicationRequest;
import com.drmp.dto.response.AssignmentApplicationResponse;
import com.drmp.dto.response.AssignmentRecommendationResponse;
import com.drmp.entity.CasePackage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Case Assignment Service Interface
 * 案件分配服务接口 - 处理智能分案、申请、评估等功能
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public interface CaseAssignmentService {

    /**
     * 智能推荐处置机构
     * 
     * @param casePackageId 案件包ID
     * @return 推荐的处置机构列表
     */
    List<AssignmentRecommendationResponse> getRecommendedDisposalOrganizations(Long casePackageId);

    /**
     * 提交案件包申请
     * 
     * @param request 申请请求
     * @return 申请结果
     */
    AssignmentApplicationResponse submitApplication(AssignmentApplicationRequest request);

    /**
     * 获取案件包的所有申请
     * 
     * @param casePackageId 案件包ID
     * @param pageable 分页参数
     * @return 申请列表
     */
    Page<AssignmentApplicationResponse> getCasePackageApplications(Long casePackageId, Pageable pageable);

    /**
     * 审核申请（接受或拒绝）
     * 
     * @param applicationId 申请ID
     * @param approve 是否批准
     * @param reason 审核理由
     * @return 审核结果
     */
    AssignmentApplicationResponse reviewApplication(Long applicationId, boolean approve, String reason);

    /**
     * 获取机构的申请历史
     * 
     * @param organizationId 机构ID
     * @param pageable 分页参数
     * @return 申请历史
     */
    Page<AssignmentApplicationResponse> getOrganizationApplicationHistory(Long organizationId, Pageable pageable);

    /**
     * 自动分配案件包（基于策略）
     * 
     * @param casePackageId 案件包ID
     * @param strategy 分配策略
     * @return 分配结果
     */
    AssignmentResult autoAssignCasePackage(Long casePackageId, String strategy);

    /**
     * 评估处置机构能力
     * 
     * @param organizationId 机构ID
     * @param casePackage 案件包
     * @return 能力评估结果
     */
    CapabilityAssessment assessOrganizationCapability(Long organizationId, CasePackage casePackage);

    /**
     * 获取分配统计信息
     * 
     * @param organizationId 机构ID（可选）
     * @return 统计信息
     */
    AssignmentStatistics getAssignmentStatistics(Long organizationId);

    /**
     * 分配结果
     */
    class AssignmentResult {
        private boolean success;
        private Long assignedOrganizationId;
        private String assignedOrganizationName;
        private String strategy;
        private Double matchScore;
        private String reason;

        // Constructors
        public AssignmentResult() {}

        public AssignmentResult(boolean success, Long assignedOrganizationId, String assignedOrganizationName, 
                              String strategy, Double matchScore, String reason) {
            this.success = success;
            this.assignedOrganizationId = assignedOrganizationId;
            this.assignedOrganizationName = assignedOrganizationName;
            this.strategy = strategy;
            this.matchScore = matchScore;
            this.reason = reason;
        }

        // Getters and Setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public Long getAssignedOrganizationId() { return assignedOrganizationId; }
        public void setAssignedOrganizationId(Long assignedOrganizationId) { this.assignedOrganizationId = assignedOrganizationId; }

        public String getAssignedOrganizationName() { return assignedOrganizationName; }
        public void setAssignedOrganizationName(String assignedOrganizationName) { this.assignedOrganizationName = assignedOrganizationName; }

        public String getStrategy() { return strategy; }
        public void setStrategy(String strategy) { this.strategy = strategy; }

        public Double getMatchScore() { return matchScore; }
        public void setMatchScore(Double matchScore) { this.matchScore = matchScore; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    /**
     * 能力评估结果
     */
    class CapabilityAssessment {
        private Double overallScore;
        private Double regionMatchScore;
        private Double amountHandlingScore;
        private Double experienceScore;
        private Double currentLoadScore;
        private Double historyPerformanceScore;
        private List<String> strengths;
        private List<String> concerns;
        private String recommendation;

        // Constructors
        public CapabilityAssessment() {}

        // Getters and Setters
        public Double getOverallScore() { return overallScore; }
        public void setOverallScore(Double overallScore) { this.overallScore = overallScore; }

        public Double getRegionMatchScore() { return regionMatchScore; }
        public void setRegionMatchScore(Double regionMatchScore) { this.regionMatchScore = regionMatchScore; }

        public Double getAmountHandlingScore() { return amountHandlingScore; }
        public void setAmountHandlingScore(Double amountHandlingScore) { this.amountHandlingScore = amountHandlingScore; }

        public Double getExperienceScore() { return experienceScore; }
        public void setExperienceScore(Double experienceScore) { this.experienceScore = experienceScore; }

        public Double getCurrentLoadScore() { return currentLoadScore; }
        public void setCurrentLoadScore(Double currentLoadScore) { this.currentLoadScore = currentLoadScore; }

        public Double getHistoryPerformanceScore() { return historyPerformanceScore; }
        public void setHistoryPerformanceScore(Double historyPerformanceScore) { this.historyPerformanceScore = historyPerformanceScore; }

        public List<String> getStrengths() { return strengths; }
        public void setStrengths(List<String> strengths) { this.strengths = strengths; }

        public List<String> getConcerns() { return concerns; }
        public void setConcerns(List<String> concerns) { this.concerns = concerns; }

        public String getRecommendation() { return recommendation; }
        public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
    }

    /**
     * 分配统计信息
     */
    class AssignmentStatistics {
        private Long totalApplications;
        private Long approvedApplications;
        private Long rejectedApplications;
        private Long pendingApplications;
        private Double averageProcessingTime;
        private Double successRate;
        private Long totalAssignedPackages;
        private Double totalAssignedAmount;

        // Constructors
        public AssignmentStatistics() {}

        // Getters and Setters
        public Long getTotalApplications() { return totalApplications; }
        public void setTotalApplications(Long totalApplications) { this.totalApplications = totalApplications; }

        public Long getApprovedApplications() { return approvedApplications; }
        public void setApprovedApplications(Long approvedApplications) { this.approvedApplications = approvedApplications; }

        public Long getRejectedApplications() { return rejectedApplications; }
        public void setRejectedApplications(Long rejectedApplications) { this.rejectedApplications = rejectedApplications; }

        public Long getPendingApplications() { return pendingApplications; }
        public void setPendingApplications(Long pendingApplications) { this.pendingApplications = pendingApplications; }

        public Double getAverageProcessingTime() { return averageProcessingTime; }
        public void setAverageProcessingTime(Double averageProcessingTime) { this.averageProcessingTime = averageProcessingTime; }

        public Double getSuccessRate() { return successRate; }
        public void setSuccessRate(Double successRate) { this.successRate = successRate; }

        public Long getTotalAssignedPackages() { return totalAssignedPackages; }
        public void setTotalAssignedPackages(Long totalAssignedPackages) { this.totalAssignedPackages = totalAssignedPackages; }

        public Double getTotalAssignedAmount() { return totalAssignedAmount; }
        public void setTotalAssignedAmount(Double totalAssignedAmount) { this.totalAssignedAmount = totalAssignedAmount; }
    }
}