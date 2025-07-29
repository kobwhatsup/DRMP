package com.drmp.repository;

import com.drmp.entity.AssignmentRule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Assignment Rule Repository
 * 分案规则数据访问层
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Repository
public interface AssignmentRuleRepository extends JpaRepository<AssignmentRule, Long>, JpaSpecificationExecutor<AssignmentRule> {

    /**
     * 查找启用的规则，按优先级排序
     */
    List<AssignmentRule> findByEnabledTrueOrderByPriorityAsc();

    /**
     * 根据规则类型查找启用的规则
     */
    List<AssignmentRule> findByRuleTypeAndEnabledTrueOrderByPriorityAsc(String ruleType);

    /**
     * 根据创建者查找规则
     */
    List<AssignmentRule> findByCreatedByOrderByCreatedAtDesc(Long createdBy);

    /**
     * 分页查找规则
     */
    Page<AssignmentRule> findByCreatedBy(Long createdBy, Pageable pageable);

    /**
     * 查找指定时间范围内使用过的规则
     */
    @Query("SELECT ar FROM AssignmentRule ar WHERE ar.lastUsedAt BETWEEN :startDate AND :endDate")
    List<AssignmentRule> findUsedRulesBetween(@Param("startDate") LocalDateTime startDate, 
                                             @Param("endDate") LocalDateTime endDate);

    /**
     * 统计规则使用情况
     */
    @Query("SELECT ar.ruleType, COUNT(ar), SUM(ar.usageCount), AVG(ar.successCount * 100.0 / NULLIF(ar.usageCount, 0)) " +
           "FROM AssignmentRule ar GROUP BY ar.ruleType")
    List<Object[]> getUsageStatistics();

    /**
     * 查找最常用的规则
     */
    @Query("SELECT ar FROM AssignmentRule ar WHERE ar.enabled = true ORDER BY ar.usageCount DESC")
    List<AssignmentRule> findMostUsedRules(Pageable pageable);

    /**
     * 查找成功率最高的规则
     */
    @Query("SELECT ar FROM AssignmentRule ar WHERE ar.enabled = true AND ar.usageCount > 0 " +
           "ORDER BY (ar.successCount * 100.0 / ar.usageCount) DESC")
    List<AssignmentRule> findHighestSuccessRateRules(Pageable pageable);

    /**
     * 根据目标地区查找规则
     */
    @Query("SELECT ar FROM AssignmentRule ar WHERE ar.enabled = true AND " +
           "(:region IS NULL OR ar.targetRegions IS NULL OR ar.targetRegions LIKE %:region%)")
    List<AssignmentRule> findByTargetRegion(@Param("region") String region);

    /**
     * 根据金额范围查找规则
     */
    @Query("SELECT ar FROM AssignmentRule ar WHERE ar.enabled = true AND " +
           "(:amountRange IS NULL OR ar.targetAmountRange IS NULL OR ar.targetAmountRange = :amountRange)")
    List<AssignmentRule> findByAmountRange(@Param("amountRange") String amountRange);

    /**
     * 根据案件类型查找规则
     */
    @Query("SELECT ar FROM AssignmentRule ar WHERE ar.enabled = true AND " +
           "(:caseType IS NULL OR ar.targetCaseTypes IS NULL OR ar.targetCaseTypes LIKE %:caseType%)")
    List<AssignmentRule> findByCaseType(@Param("caseType") String caseType);

    /**
     * 查找可用于指定机构的规则
     */
    @Query("SELECT ar FROM AssignmentRule ar WHERE ar.enabled = true AND " +
           "(:orgId IS NULL OR ar.excludeOrganizations IS NULL OR ar.excludeOrganizations NOT LIKE %:orgId%) AND " +
           "(:orgId IS NULL OR ar.includeOrganizations IS NULL OR ar.includeOrganizations LIKE %:orgId%)")
    List<AssignmentRule> findAvailableForOrganization(@Param("orgId") String orgId);

    /**
     * 查找需要通知的规则
     */
    @Query("SELECT ar FROM AssignmentRule ar WHERE ar.enabled = true AND ar.notifyOnMatch = true")
    List<AssignmentRule> findNotificationRules();

    /**
     * 根据优先级范围查找规则
     */
    List<AssignmentRule> findByEnabledTrueAndPriorityBetweenOrderByPriorityAsc(Integer minPriority, Integer maxPriority);
}