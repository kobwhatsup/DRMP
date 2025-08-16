package com.drmp.service.impl;

import com.drmp.dto.request.AssignmentRuleRequest;
import com.drmp.dto.response.AssignmentRecommendationResponse;
import com.drmp.dto.response.AssignmentRuleResponse;
import com.drmp.entity.AssignmentRule;
import com.drmp.entity.CasePackage;
import com.drmp.entity.Organization;
import com.drmp.exception.BusinessException;
import com.drmp.exception.ResourceNotFoundException;
import com.drmp.repository.AssignmentRuleRepository;
import com.drmp.repository.CasePackageRepository;
import com.drmp.repository.OrganizationRepository;
import com.drmp.service.SmartAssignmentService;
import com.drmp.service.assignment.AssignmentStrategy;
import com.drmp.service.assignment.AssignmentStrategyManager;
import com.drmp.util.SecurityUtils;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Smart Assignment Service Implementation
 * 智能分案服务实现
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class SmartAssignmentServiceImpl implements SmartAssignmentService {

    private final AssignmentRuleRepository assignmentRuleRepository;
    private final CasePackageRepository casePackageRepository;
    private final OrganizationRepository organizationRepository;
    private final ObjectMapper objectMapper;
    private final AssignmentStrategyManager strategyManager;

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentRecommendationResponse> getRecommendations(Long casePackageId, Integer limit) {
        log.info("Getting smart recommendations for case package: {}", casePackageId);
        
        CasePackage casePackage = getCasePackageEntity(casePackageId);
        List<Organization> availableOrganizations = getAvailableOrganizations();
        
        // 选择最适合的分案策略
        AssignmentStrategy strategy = strategyManager.getOptimalStrategy(casePackage);
        log.info("Using assignment strategy: {} for case package: {}", strategy.getStrategyName(), casePackageId);
        
        // 执行分案策略
        List<AssignmentStrategy.AssignmentCandidate> candidates = strategy.execute(casePackage, availableOrganizations);
        
        // 转换为响应对象
        List<AssignmentRecommendationResponse> recommendations = new ArrayList<>();
        
        for (AssignmentStrategy.AssignmentCandidate candidate : candidates) {
            Organization org = availableOrganizations.stream()
                .filter(o -> o.getId().equals(candidate.getOrganizationId()))
                .findFirst()
                .orElse(null);
                
            if (org == null) continue;
            
            AssignmentRecommendationResponse recommendation = AssignmentRecommendationResponse.builder()
                .organizationId(candidate.getOrganizationId())
                .organizationName(candidate.getOrganizationName())
                .organizationType(org.getType().toString())
                .matchScore(candidate.getScore())
                .regionMatchScore(candidate.getDetailScores().getOrDefault("geographic", 0.0))
                .capacityScore(candidate.getDetailScores().getOrDefault("capacity", 0.0))
                .experienceScore(candidate.getDetailScores().getOrDefault("experience", 0.0))
                .performanceScore(candidate.getDetailScores().getOrDefault("performance", 0.0))
                .currentLoad(org.getCurrentLoadPercentage())
                .maxCapacity(org.getMonthlyCaseCapacity())
                .strengths(candidate.getAssessment() != null ? candidate.getAssessment().getStrengths() : new ArrayList<>())
                .concerns(candidate.getAssessment() != null ? candidate.getAssessment().getWeaknesses() : new ArrayList<>())
                .recommendation(candidate.getReason())
                .contactPerson(org.getContactPerson())
                .contactPhone(org.getContactPhone())
                .contactEmail(org.getEmail())
                .assignmentStrategy(strategy.getStrategyName())
                .rank(candidate.getRank())
                .build();
                
            recommendations.add(recommendation);
        }
        
        // 限制返回数量
        return recommendations.stream()
            .limit(limit != null ? limit : 10)
            .collect(Collectors.toList());
    }

    @Override
    public AssignmentResult executeAutoAssignment(Long casePackageId, Long ruleId) {
        log.info("Executing auto assignment for case package: {} with rule: {}", casePackageId, ruleId);
        
        CasePackage casePackage = getCasePackageEntity(casePackageId);
        AssignmentRule rule = getAssignmentRuleEntity(ruleId);
        
        // 测试规则匹配
        RuleTestResult testResult = testAssignmentRule(ruleId, casePackageId);
        if (!testResult.isRuleMatched()) {
            return new AssignmentResult(false, null, null, 0.0, rule.getRuleType(), 
                "规则条件不匹配: " + testResult.getReason());
        }
        
        // 获取推荐机构
        List<AssignmentRecommendationResponse> recommendations = getRecommendations(casePackageId, 5);
        if (recommendations.isEmpty()) {
            return new AssignmentResult(false, null, null, 0.0, rule.getRuleType(), 
                "没有找到合适的处置机构");
        }
        
        // 选择最佳匹配的机构
        AssignmentRecommendationResponse bestMatch = recommendations.get(0);
        
        // 检查最小匹配度要求
        if (rule.getMinMatchingScore() != null && bestMatch.getMatchScore() < rule.getMinMatchingScore()) {
            return new AssignmentResult(false, null, null, bestMatch.getMatchScore(), rule.getRuleType(), 
                "最佳匹配机构的分数低于最小要求: " + rule.getMinMatchingScore());
        }
        
        // 执行分配
        try {
            casePackage.setDisposalOrganization(organizationRepository.findById(bestMatch.getOrganizationId()).orElse(null));
            casePackage.setStatus(com.drmp.entity.enums.CasePackageStatus.ASSIGNED);
            casePackage.setAssignedAt(LocalDateTime.now());
            casePackageRepository.save(casePackage);
            
            // 更新规则使用统计
            rule.incrementUsage();
            rule.incrementSuccess();
            assignmentRuleRepository.save(rule);
            
            log.info("Auto assignment successful: case package {} assigned to organization {}", 
                    casePackageId, bestMatch.getOrganizationId());
            
            return new AssignmentResult(true, bestMatch.getOrganizationId(), bestMatch.getOrganizationName(), 
                bestMatch.getMatchScore(), rule.getRuleType(), "自动分案成功");
                
        } catch (Exception e) {
            log.error("Auto assignment failed", e);
            rule.incrementUsage();
            assignmentRuleRepository.save(rule);
            
            return new AssignmentResult(false, null, null, bestMatch.getMatchScore(), rule.getRuleType(), 
                "分案执行失败: " + e.getMessage());
        }
    }

    @Override
    public BatchAssignmentResult executeBatchAssignment(List<Long> casePackageIds, String strategyName) {
        log.info("Executing batch assignment for {} case packages with strategy: {}", casePackageIds.size(), strategyName);
        
        BatchAssignmentResult batchResult = new BatchAssignmentResult();
        batchResult.setTotalCount(casePackageIds.size());
        
        List<AssignmentResult> results = new ArrayList<>();
        int successCount = 0;
        
        // 获取指定的策略
        AssignmentStrategy strategy = null;
        if (strategyName != null && !strategyName.isEmpty()) {
            try {
                strategy = strategyManager.getStrategy(strategyName);
            } catch (IllegalArgumentException e) {
                log.warn("Unknown strategy: {}, using default strategy", strategyName);
                strategy = strategyManager.getDefaultStrategy();
            }
        }
        
        // 优化：批量预加载所有案件包，避免N+1查询
        Map<Long, CasePackage> casePackageMap = casePackageRepository.findAllById(casePackageIds)
                .stream().collect(Collectors.toMap(CasePackage::getId, Function.identity()));
        
        // 一次性获取可用机构，避免在循环中重复查询
        List<Organization> availableOrganizations = getAvailableOrganizations();
        Map<Long, Organization> organizationMap = availableOrganizations.stream()
                .collect(Collectors.toMap(Organization::getId, Function.identity()));
        
        List<CasePackage> updatedCasePackages = new ArrayList<>();
        
        for (Long casePackageId : casePackageIds) {
            try {
                CasePackage casePackage = casePackageMap.get(casePackageId);
                if (casePackage == null) {
                    results.add(new AssignmentResult(false, null, null, 0.0, "unknown", "案件包不存在"));
                    continue;
                }
                
                // 选择策略
                AssignmentStrategy selectedStrategy = strategy != null ? strategy : strategyManager.getOptimalStrategy(casePackage);
                
                if (availableOrganizations.isEmpty()) {
                    results.add(new AssignmentResult(false, null, null, 0.0, selectedStrategy.getStrategyName(), 
                        "没有可用的处置机构"));
                    continue;
                }
                
                // 执行分案策略
                List<AssignmentStrategy.AssignmentCandidate> candidates = selectedStrategy.execute(casePackage, availableOrganizations);
                if (candidates.isEmpty()) {
                    results.add(new AssignmentResult(false, null, null, 0.0, selectedStrategy.getStrategyName(), 
                        "没有找到合适的处置机构"));
                    continue;
                }
                
                // 选择最佳候选
                AssignmentStrategy.AssignmentCandidate bestCandidate = candidates.get(0);
                
                // 从预加载的机构Map中获取，避免额外数据库查询
                Organization selectedOrg = organizationMap.get(bestCandidate.getOrganizationId());
                if (selectedOrg == null) {
                    results.add(new AssignmentResult(false, null, null, bestCandidate.getScore(), 
                        selectedStrategy.getStrategyName(), "选中的机构不存在"));
                    continue;
                }
                
                // 更新案件包状态（先在内存中更新，稍后批量保存）
                casePackage.setDisposalOrganization(selectedOrg);
                casePackage.setStatus(com.drmp.entity.enums.CasePackageStatus.ASSIGNED);
                casePackage.setAssignedAt(LocalDateTime.now());
                updatedCasePackages.add(casePackage);
                
                AssignmentResult result = new AssignmentResult(true, bestCandidate.getOrganizationId(), 
                    bestCandidate.getOrganizationName(), bestCandidate.getScore(), 
                    selectedStrategy.getStrategyName(), "批量分案成功");
                results.add(result);
                successCount++;
                
                log.debug("Case package {} assigned to organization {} using strategy {}", 
                    casePackageId, bestCandidate.getOrganizationId(), selectedStrategy.getStrategyName());
                
            } catch (Exception e) {
                log.error("Batch assignment failed for case package: {}", casePackageId, e);
                results.add(new AssignmentResult(false, null, null, 0.0, strategyName, 
                    "处理失败: " + e.getMessage()));
            }
        }
        
        // 批量保存所有更新的案件包，提高数据库操作效率
        if (!updatedCasePackages.isEmpty()) {
            casePackageRepository.saveAll(updatedCasePackages);
            log.info("Batch saved {} updated case packages", updatedCasePackages.size());
        }
        
        batchResult.setResults(results);
        batchResult.setSuccessCount(successCount);
        batchResult.setFailedCount(casePackageIds.size() - successCount);
        
        // 生成摘要
        Map<String, Object> summary = new HashMap<>();
        summary.put("successRate", (double) successCount / casePackageIds.size() * 100);
        summary.put("strategy", strategyName);
        summary.put("processedAt", LocalDateTime.now());
        batchResult.setSummary(summary);
        
        log.info("Batch assignment completed: {}/{} successful", successCount, casePackageIds.size());
        return batchResult;
    }

    @Override
    @Transactional(readOnly = true)
    public MatchingAssessment assessMatching(Long organizationId, Long casePackageId) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("机构不存在"));
        CasePackage casePackage = getCasePackageEntity(casePackageId);
        
        // 使用最适合的策略进行评估
        AssignmentStrategy strategy = strategyManager.getOptimalStrategy(casePackage);
        log.debug("Using strategy {} to assess matching between organization {} and case package {}", 
            strategy.getStrategyName(), organizationId, casePackageId);
        
        return strategy.assess(organization, casePackage);
    }

    @Override
    public AssignmentRuleResponse createAssignmentRule(AssignmentRuleRequest request) {
        log.info("Creating assignment rule: {}", request.getRuleName());
        
        AssignmentRule rule = AssignmentRule.builder()
            .ruleName(request.getRuleName())
            .description(request.getDescription())
            .ruleType(request.getRuleType())
            .priority(request.getPriority())
            .enabled(request.getEnabled())
            .minMatchingScore(request.getMinMatchingScore())
            .targetRegions(request.getTargetRegions())
            .targetAmountRange(request.getTargetAmountRange())
            .targetCaseTypes(request.getTargetCaseTypes())
            .excludeOrganizations(request.getExcludeOrganizations())
            .includeOrganizations(request.getIncludeOrganizations())
            .maxAssignments(request.getMaxAssignments())
            .scheduleRule(request.getScheduleRule())
            .notifyOnMatch(request.getNotifyOnMatch())
            .notificationTemplate(request.getNotificationTemplate())
            .createdBy(SecurityUtils.getCurrentUserId())
            .build();
            
        // 转换JSON字段
        try {
            if (request.getConditions() != null) {
                rule.setConditions(objectMapper.writeValueAsString(request.getConditions()));
            }
            if (request.getActions() != null) {
                rule.setActions(objectMapper.writeValueAsString(request.getActions()));
            }
            if (request.getWeights() != null) {
                rule.setWeights(objectMapper.writeValueAsString(request.getWeights()));
            }
        } catch (JsonProcessingException e) {
            throw new BusinessException("规则配置JSON格式错误: " + e.getMessage());
        }
        
        rule = assignmentRuleRepository.save(rule);
        
        log.info("Assignment rule created successfully: {}", rule.getId());
        return convertToRuleResponse(rule);
    }

    @Override
    public AssignmentRuleResponse updateAssignmentRule(Long ruleId, AssignmentRuleRequest request) {
        log.info("Updating assignment rule: {}", ruleId);
        
        AssignmentRule rule = getAssignmentRuleEntity(ruleId);
        
        // 检查权限
        if (!Objects.equals(rule.getCreatedBy(), SecurityUtils.getCurrentUserId())) {
            throw new BusinessException("无权限修改此规则");
        }
        
        // 更新字段
        rule.setRuleName(request.getRuleName());
        rule.setDescription(request.getDescription());
        rule.setRuleType(request.getRuleType());
        rule.setPriority(request.getPriority());
        rule.setEnabled(request.getEnabled());
        rule.setMinMatchingScore(request.getMinMatchingScore());
        rule.setTargetRegions(request.getTargetRegions());
        rule.setTargetAmountRange(request.getTargetAmountRange());
        rule.setTargetCaseTypes(request.getTargetCaseTypes());
        rule.setExcludeOrganizations(request.getExcludeOrganizations());
        rule.setIncludeOrganizations(request.getIncludeOrganizations());
        rule.setMaxAssignments(request.getMaxAssignments());
        rule.setScheduleRule(request.getScheduleRule());
        rule.setNotifyOnMatch(request.getNotifyOnMatch());
        rule.setNotificationTemplate(request.getNotificationTemplate());
        
        // 更新JSON字段
        try {
            if (request.getConditions() != null) {
                rule.setConditions(objectMapper.writeValueAsString(request.getConditions()));
            }
            if (request.getActions() != null) {
                rule.setActions(objectMapper.writeValueAsString(request.getActions()));
            }
            if (request.getWeights() != null) {
                rule.setWeights(objectMapper.writeValueAsString(request.getWeights()));
            }
        } catch (JsonProcessingException e) {
            throw new BusinessException("规则配置JSON格式错误: " + e.getMessage());
        }
        
        rule = assignmentRuleRepository.save(rule);
        
        log.info("Assignment rule updated successfully: {}", ruleId);
        return convertToRuleResponse(rule);
    }

    @Override
    public void deleteAssignmentRule(Long ruleId) {
        log.info("Deleting assignment rule: {}", ruleId);
        
        AssignmentRule rule = getAssignmentRuleEntity(ruleId);
        
        // 检查权限
        if (!Objects.equals(rule.getCreatedBy(), SecurityUtils.getCurrentUserId())) {
            throw new BusinessException("无权限删除此规则");
        }
        
        assignmentRuleRepository.delete(rule);
        
        log.info("Assignment rule deleted successfully: {}", ruleId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentRuleResponse> getAssignmentRules(Long organizationId) {
        List<AssignmentRule> rules;
        
        if (organizationId != null) {
            rules = assignmentRuleRepository.findByCreatedByOrderByCreatedAtDesc(organizationId);
        } else {
            rules = assignmentRuleRepository.findByEnabledTrueOrderByPriorityAsc();
        }
        
        return rules.stream()
            .map(this::convertToRuleResponse)
            .collect(Collectors.toList());
    }

    @Override
    public RuleTestResult testAssignmentRule(Long ruleId, Long casePackageId) {
        AssignmentRule rule = getAssignmentRuleEntity(ruleId);
        CasePackage casePackage = getCasePackageEntity(casePackageId);
        
        RuleTestResult result = new RuleTestResult();
        List<String> matchedCriteria = new ArrayList<>();
        List<String> unmatchedCriteria = new ArrayList<>();
        
        // 测试基本条件
        boolean ruleMatched = true;
        StringBuilder reason = new StringBuilder();
        
        // 测试金额范围
        if (rule.getTargetAmountRange() != null && !rule.getTargetAmountRange().isEmpty()) {
            boolean amountMatched = checkAmountRange(casePackage.getTotalAmount(), rule.getTargetAmountRange());
            if (amountMatched) {
                matchedCriteria.add("金额范围匹配");
            } else {
                unmatchedCriteria.add("金额范围不匹配");
                ruleMatched = false;
                reason.append("金额范围不符合要求; ");
            }
        }
        
        // 测试地区匹配
        if (rule.getTargetRegions() != null && !rule.getTargetRegions().isEmpty()) {
            // TODO: 实现地区匹配逻辑
            matchedCriteria.add("地区匹配");
        }
        
        // 测试案件类型
        if (rule.getTargetCaseTypes() != null && !rule.getTargetCaseTypes().isEmpty()) {
            // TODO: 实现案件类型匹配逻辑
            matchedCriteria.add("案件类型匹配");
        }
        
        result.setRuleMatched(ruleMatched);
        result.setScore(ruleMatched ? 85.0 : 0.0);
        result.setReason(reason.toString().isEmpty() ? "规则匹配成功" : reason.toString());
        result.setMatchedCriteria(matchedCriteria);
        result.setUnmatchedCriteria(unmatchedCriteria);
        
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public AssignmentStatistics getAssignmentStatistics(Long organizationId, String startDate, String endDate) {
        // TODO: 实现详细的统计逻辑
        AssignmentStatistics statistics = new AssignmentStatistics();
        statistics.setTotalAssignments(100L);
        statistics.setSuccessfulAssignments(85L);
        statistics.setFailedAssignments(15L);
        statistics.setSuccessRate(85.0);
        statistics.setAvgMatchingScore(78.5);
        
        return statistics;
    }

    @Override
    @Transactional(readOnly = true)
    public OrganizationCapabilityProfile getCapabilityProfile(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("机构不存在"));
            
        OrganizationCapabilityProfile profile = new OrganizationCapabilityProfile();
        profile.setOrganizationId(organizationId);
        profile.setOrganizationName(organization.getName());
        profile.setOverallCapability(75.0);
        profile.setCurrentLoad((double) (organization.getCurrentLoadPercentage() != null ? 
            organization.getCurrentLoadPercentage() : 0));
        profile.setAverageSuccessRate(80.0);
        
        // TODO: 实现详细的能力画像分析
        
        return profile;
    }

    @Override
    public Double predictSuccessRate(Long organizationId, CasePackage casePackage) {
        // TODO: 实现基于机器学习的成功率预测
        return 75.0;
    }

    // 私有辅助方法

    private CasePackage getCasePackageEntity(Long id) {
        return casePackageRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("案件包不存在"));
    }

    private AssignmentRule getAssignmentRuleEntity(Long id) {
        return assignmentRuleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("分案规则不存在"));
    }

    private List<Organization> getAvailableOrganizations() {
        // 获取活跃状态且已支付会员费的处置机构，避免加载不可用的机构
        return organizationRepository.findByTypeAndStatus(
                com.drmp.entity.enums.OrganizationType.MEDIATION_CENTER, 
                com.drmp.entity.enums.OrganizationStatus.ACTIVE)
                .stream()
                .filter(org -> org.getMembershipPaid() != null && org.getMembershipPaid())
                .filter(org -> org.getCurrentLoadPercentage() == null || org.getCurrentLoadPercentage() < 95) // 过滤负载过高的机构
                .collect(Collectors.toList());
    }

    private List<AssignmentRule> getApplicableRules(Long casePackageId, String strategy) {
        // TODO: 根据策略和案件包特征获取适用的规则
        return assignmentRuleRepository.findByRuleTypeAndEnabledTrueOrderByPriorityAsc(strategy);
    }

    private Double calculateGeographicScore(Organization organization, CasePackage casePackage) {
        // TODO: 实现地理位置匹配度计算
        return 80.0;
    }

    private Double calculateCapacityScore(Organization organization, CasePackage casePackage) {
        // 基于机构当前负载和案件包大小计算容量匹配度
        Integer currentLoad = organization.getCurrentLoadPercentage();
        Integer maxCapacity = organization.getMonthlyCaseCapacity();
        
        if (currentLoad == null || maxCapacity == null) {
            return 50.0;
        }
        
        if (currentLoad >= 90) {
            return 20.0;
        } else if (currentLoad >= 70) {
            return 60.0;
        } else if (currentLoad >= 50) {
            return 80.0;
        } else {
            return 100.0;
        }
    }

    private Double calculateExperienceScore(Organization organization, CasePackage casePackage) {
        // TODO: 基于历史处理经验计算经验匹配度
        return 75.0;
    }

    private Double calculatePerformanceScore(Organization organization) {
        // TODO: 基于历史业绩计算性能评分
        return 85.0;
    }

    private Double calculateAvailabilityScore(Organization organization) {
        // 基于机构状态和会员费状态计算可用性评分
        if (!organization.getMembershipPaid()) {
            return 0.0;
        }
        
        // TODO: 考虑其他可用性因素
        return 90.0;
    }

    private List<String> generateStrengths(Organization org, Double... scores) {
        List<String> strengths = new ArrayList<>();
        
        if (scores[0] > 80) strengths.add("地理位置优势");
        if (scores[1] > 80) strengths.add("处理能力充足");
        if (scores[2] > 80) strengths.add("经验丰富");
        if (scores[3] > 80) strengths.add("历史业绩优秀");
        
        return strengths;
    }

    private List<String> generateWeaknesses(Organization org, Double... scores) {
        List<String> weaknesses = new ArrayList<>();
        
        if (scores[0] < 60) weaknesses.add("地理位置匹配度低");
        if (scores[1] < 60) weaknesses.add("当前负载较高");
        if (scores[2] < 60) weaknesses.add("相关经验不足");
        if (scores[3] < 60) weaknesses.add("历史业绩一般");
        
        return weaknesses;
    }

    private String generateRecommendation(Double overallScore, List<String> strengths, List<String> weaknesses) {
        if (overallScore >= 80) {
            return "强烈推荐：综合匹配度高，建议优先分配";
        } else if (overallScore >= 60) {
            return "推荐：匹配度良好，可以考虑分配";
        } else if (overallScore >= 40) {
            return "谨慎考虑：匹配度中等，需要评估风险";
        } else {
            return "不推荐：匹配度较低，建议选择其他机构";
        }
    }

    private boolean checkAmountRange(BigDecimal amount, String targetRange) {
        // TODO: 实现金额范围检查逻辑
        return true;
    }

    private AssignmentRuleResponse convertToRuleResponse(AssignmentRule rule) {
        AssignmentRuleResponse response = new AssignmentRuleResponse();
        response.setId(rule.getId());
        response.setRuleName(rule.getRuleName());
        response.setDescription(rule.getDescription());
        response.setRuleType(rule.getRuleType());
        response.setPriority(rule.getPriority());
        response.setEnabled(rule.getEnabled());
        response.setMinMatchingScore(rule.getMinMatchingScore());
        response.setTargetRegions(rule.getTargetRegions());
        response.setTargetAmountRange(rule.getTargetAmountRange());
        response.setTargetCaseTypes(rule.getTargetCaseTypes());
        response.setExcludeOrganizations(rule.getExcludeOrganizations());
        response.setIncludeOrganizations(rule.getIncludeOrganizations());
        response.setMaxAssignments(rule.getMaxAssignments());
        response.setScheduleRule(rule.getScheduleRule());
        response.setNotifyOnMatch(rule.getNotifyOnMatch());
        response.setNotificationTemplate(rule.getNotificationTemplate());
        response.setCreatedBy(rule.getCreatedBy());
        response.setCreatedAt(rule.getCreatedAt());
        response.setUpdatedAt(rule.getUpdatedAt());
        response.setUsageCount(rule.getUsageCount());
        response.setSuccessCount(rule.getSuccessCount());
        response.setSuccessRate(rule.getSuccessRate());
        response.setLastUsedAt(rule.getLastUsedAt());
        
        return response;
    }
}