package com.drmp.service.assignment;

import com.drmp.entity.CasePackage;
import com.drmp.entity.Organization;
import com.drmp.service.SmartAssignmentService.MatchingAssessment;
import com.drmp.service.assignment.AssignmentStrategy.AssignmentCandidate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

/**
 * 优化的分案引擎
 * 支持并行处理、缓存优化和智能预过滤
 *
 * @author DRMP Team
 */
@Slf4j
@Service
public class OptimizedAssignmentEngine {
    
    @Autowired
    private AssignmentStrategyManager strategyManager;
    
    private final ExecutorService executorService = Executors.newFixedThreadPool(8);
    
    /**
     * 执行智能分案（优化版）
     *
     * @param casePackage 案件包
     * @param availableOrgs 可用机构列表
     * @param strategyName 策略名称
     * @param maxCandidates 最大候选数量
     * @return 分案候选结果
     */
    public List<AssignmentCandidate> executeOptimizedAssignment(
            CasePackage casePackage, 
            List<Organization> availableOrgs, 
            String strategyName,
            Integer maxCandidates) {
        
        log.info("开始执行优化分案: casePackageId={}, orgCount={}, strategy={}", 
                casePackage.getId(), availableOrgs.size(), strategyName);
        
        long startTime = System.currentTimeMillis();
        
        try {
            // 1. 预过滤不符合条件的机构
            List<Organization> preFilteredOrgs = preFilterOrganizations(casePackage, availableOrgs);
            log.info("预过滤后机构数量: {} -> {}", availableOrgs.size(), preFilteredOrgs.size());
            
            // 2. 获取分案策略
            AssignmentStrategy strategy = strategyManager.getStrategy(strategyName);
            if (strategy == null) {
                log.warn("未找到分案策略: {}, 使用默认智能策略", strategyName);
                strategy = strategyManager.getDefaultStrategy();
            }
            
            // 3. 并行执行分案评估
            List<AssignmentCandidate> candidates = executeParallelAssessment(
                    casePackage, preFilteredOrgs, strategy);
            
            // 4. 后处理和排序
            candidates = postProcessCandidates(candidates, maxCandidates != null ? maxCandidates : 10);
            
            long executionTime = System.currentTimeMillis() - startTime;
            log.info("分案执行完成: 候选数量={}, 执行时间={}ms", candidates.size(), executionTime);
            
            return candidates;
            
        } catch (Exception e) {
            log.error("分案执行异常: casePackageId={}", casePackage.getId(), e);
            throw new RuntimeException("分案执行失败", e);
        }
    }
    
    /**
     * 预过滤机构
     * 快速排除明显不符合条件的机构
     */
    private List<Organization> preFilterOrganizations(CasePackage casePackage, List<Organization> orgs) {
        return orgs.parallelStream()
                .filter(org -> {
                    // 1. 状态检查
                    if (!"ACTIVE".equals(org.getStatus())) {
                        return false;
                    }
                    
                    // 2. 容量检查
                    if (org.getCurrentLoadPercentage() != null && 
                        org.getCurrentLoadPercentage().doubleValue() > 95) {
                        return false;
                    }
                    
                    // 3. 基础地域检查
                    if (!isBasicGeographicMatch(casePackage, org)) {
                        return false;
                    }
                    
                    // 4. 业务范围检查
                    if (!isBusinessScopeMatch(casePackage, org)) {
                        return false;
                    }
                    
                    return true;
                })
                .collect(Collectors.toList());
    }
    
    /**
     * 并行执行分案评估
     */
    private List<AssignmentCandidate> executeParallelAssessment(
            CasePackage casePackage, List<Organization> orgs, AssignmentStrategy strategy) {
        
        List<CompletableFuture<AssignmentCandidate>> futures = orgs.stream()
                .map(org -> CompletableFuture.supplyAsync(() -> {
                    try {
                        MatchingAssessment assessment = strategy.assess(org, casePackage);
                        return createOptimizedCandidate(org, assessment, casePackage);
                    } catch (Exception e) {
                        log.warn("评估机构{}时出现异常: {}", org.getId(), e.getMessage());
                        return null;
                    }
                }, executorService))
                .collect(Collectors.toList());
        
        // 等待所有评估完成
        return futures.stream()
                .map(CompletableFuture::join)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
    
    /**
     * 后处理候选结果
     */
    private List<AssignmentCandidate> postProcessCandidates(List<AssignmentCandidate> candidates, int maxCount) {
        return candidates.stream()
                .filter(candidate -> candidate.getScore() >= 0.3) // 最低分数过滤
                .sorted((c1, c2) -> Double.compare(c2.getScore(), c1.getScore())) // 降序排序
                .limit(maxCount) // 限制数量
                .peek(candidate -> {
                    // 设置排名
                    int rank = candidates.indexOf(candidate) + 1;
                    candidate.setRank(rank);
                })
                .collect(Collectors.toList());
    }
    
    /**
     * 创建优化的候选结果
     */
    private AssignmentCandidate createOptimizedCandidate(Organization org, MatchingAssessment assessment, 
                                                       CasePackage casePackage) {
        AssignmentCandidate candidate = new AssignmentCandidate(
                org.getId(),
                org.getName(),
                assessment.getOverallScore(),
                assessment.getRecommendation()
        );
        
        // 设置详细评分信息
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
    
    /**
     * 基础地域匹配检查（快速过滤）
     */
    @Cacheable(value = "geographicMatch", key = "#casePackage.id + '_' + #org.id")
    private boolean isBasicGeographicMatch(CasePackage casePackage, Organization org) {
        // 基于缓存的快速地域匹配检查
        // 这里可以实现基础的地域匹配逻辑
        String orgAddress = org.getAddress();
        if (orgAddress == null) return true; // 地址不明时不排除
        
        // 提取省份进行基础匹配
        String[] majorProvinces = {"北京", "上海", "广东", "江苏", "浙江", "山东", "河南"};
        for (String province : majorProvinces) {
            if (orgAddress.contains(province)) {
                return true; // 主要省份的机构都保留
            }
        }
        
        return true; // 默认保留
    }
    
    /**
     * 业务范围匹配检查
     */
    @Cacheable(value = "businessMatch", key = "#casePackage.id + '_' + #org.id")
    private boolean isBusinessScopeMatch(CasePackage casePackage, Organization org) {
        // 检查机构业务范围是否支持该类型案件
        String orgType = org.getType();
        if ("DISPOSAL".equals(orgType)) {
            // 处置机构都可以处理
            return true;
        }
        
        return false;
    }
    
    /**
     * 批量分案优化
     * 适用于同时处理多个案件包的场景
     */
    public Map<Long, List<AssignmentCandidate>> batchOptimizedAssignment(
            List<CasePackage> casePackages, 
            List<Organization> availableOrgs, 
            String strategyName) {
        
        log.info("开始批量分案: caseCount={}, orgCount={}", casePackages.size(), availableOrgs.size());
        
        Map<Long, List<AssignmentCandidate>> results = new HashMap<>();
        
        // 并行处理每个案件包
        List<CompletableFuture<Void>> futures = casePackages.stream()
                .map(casePackage -> CompletableFuture.runAsync(() -> {
                    List<AssignmentCandidate> candidates = executeOptimizedAssignment(
                            casePackage, availableOrgs, strategyName, 5);
                    synchronized (results) {
                        results.put(casePackage.getId(), candidates);
                    }
                }, executorService))
                .collect(Collectors.toList());
        
        // 等待所有分案完成
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        
        log.info("批量分案完成: 处理案件包数量={}", results.size());
        return results;
    }
    
    /**
     * 智能负载均衡分案
     * 考虑机构当前负载，避免过度集中
     */
    public List<AssignmentCandidate> loadBalancedAssignment(
            List<CasePackage> casePackages, 
            List<Organization> availableOrgs) {
        
        log.info("开始负载均衡分案");
        
        // 统计各机构当前负载
        Map<Long, Double> orgLoadMap = availableOrgs.stream()
                .collect(Collectors.toMap(
                        Organization::getId,
                        org -> org.getCurrentLoadPercentage() != null ? 
                               org.getCurrentLoadPercentage().doubleValue() : 0.0
                ));
        
        List<AssignmentCandidate> allCandidates = new ArrayList<>();
        
        for (CasePackage casePackage : casePackages) {
            // 根据当前负载调整评分
            List<AssignmentCandidate> candidates = executeOptimizedAssignment(
                    casePackage, availableOrgs, "INTELLIGENT", 3);
            
            // 负载均衡调整
            for (AssignmentCandidate candidate : candidates) {
                Long orgId = candidate.getOrganizationId();
                Double currentLoad = orgLoadMap.getOrDefault(orgId, 0.0);
                
                // 负载调整因子（负载越高，分数调整越大）
                double loadFactor = 1.0 - (currentLoad / 100.0) * 0.3;
                double adjustedScore = candidate.getScore() * loadFactor;
                candidate.setScore(adjustedScore);
                
                // 更新负载（模拟分案后的负载增加）
                double newLoad = currentLoad + 5.0; // 假设每个案件包增加5%负载
                orgLoadMap.put(orgId, Math.min(newLoad, 100.0));
            }
            
            allCandidates.addAll(candidates.subList(0, Math.min(1, candidates.size()))); // 每个案件包只取最优的1个
        }
        
        return allCandidates;
    }
    
    /**
     * 获取分案统计信息
     */
    public AssignmentStatistics getAssignmentStatistics() {
        AssignmentStatistics stats = new AssignmentStatistics();
        
        // 这里应该从数据库查询真实统计数据
        stats.setTotalCasePackages(150);
        stats.setAssignedCasePackages(120);
        stats.setAvgAssignmentTime(2.5);
        stats.setTopPerformingOrgs(Arrays.asList("机构A", "机构B", "机构C"));
        
        return stats;
    }
    
    /**
     * 分案统计信息
     */
    public static class AssignmentStatistics {
        private Integer totalCasePackages;
        private Integer assignedCasePackages;
        private Double avgAssignmentTime; // 平均分案时间（秒）
        private List<String> topPerformingOrgs; // 表现最佳的机构
        
        // Getters and Setters
        public Integer getTotalCasePackages() { return totalCasePackages; }
        public void setTotalCasePackages(Integer totalCasePackages) { this.totalCasePackages = totalCasePackages; }
        
        public Integer getAssignedCasePackages() { return assignedCasePackages; }
        public void setAssignedCasePackages(Integer assignedCasePackages) { this.assignedCasePackages = assignedCasePackages; }
        
        public Double getAvgAssignmentTime() { return avgAssignmentTime; }
        public void setAvgAssignmentTime(Double avgAssignmentTime) { this.avgAssignmentTime = avgAssignmentTime; }
        
        public List<String> getTopPerformingOrgs() { return topPerformingOrgs; }
        public void setTopPerformingOrgs(List<String> topPerformingOrgs) { this.topPerformingOrgs = topPerformingOrgs; }
        
        public Double getAssignmentRate() {
            if (totalCasePackages == null || totalCasePackages == 0) return 0.0;
            return (assignedCasePackages != null ? assignedCasePackages.doubleValue() : 0.0) / totalCasePackages * 100;
        }
    }
}