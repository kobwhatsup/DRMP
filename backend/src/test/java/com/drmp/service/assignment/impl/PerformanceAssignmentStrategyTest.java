package com.drmp.service.assignment.impl;

import com.drmp.entity.CasePackage;
import com.drmp.entity.Organization;
import com.drmp.service.SmartAssignmentService.MatchingAssessment;
import com.drmp.service.assignment.AssignmentStrategy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

@DisplayName("PerformanceAssignmentStrategy 测试")
class PerformanceAssignmentStrategyTest {

    private PerformanceAssignmentStrategy strategy;
    private CasePackage highValuePackage;
    private CasePackage lowValuePackage;
    private Organization org1;
    private Organization org2;

    @BeforeEach
    void setUp() {
        strategy = new PerformanceAssignmentStrategy();
        
        highValuePackage = new CasePackage();
        highValuePackage.setId(1L);
        highValuePackage.setTotalAmount(new BigDecimal("2000000"));
        highValuePackage.setCaseCount(100);
        
        lowValuePackage = new CasePackage();
        lowValuePackage.setId(2L);
        lowValuePackage.setTotalAmount(new BigDecimal("500000"));
        lowValuePackage.setCaseCount(50);
        
        org1 = new Organization();
        org1.setId(1L);
        org1.setName("机构1");
        
        org2 = new Organization();
        org2.setId(2L);
        org2.setName("机构2");
    }

    @Test
    @DisplayName("策略名称应为PERFORMANCE")
    void getStrategyName_ShouldReturnPerformance() {
        assertThat(strategy.getStrategyName()).isEqualTo("PERFORMANCE");
    }

    @Test
    @DisplayName("优先级应为1")
    void getPriority_ShouldReturn1() {
        assertThat(strategy.getPriority()).isEqualTo(1);
    }

    @Test
    @DisplayName("应支持高价值案件包")
    void supports_ShouldReturnTrue_ForHighValuePackage() {
        assertThat(strategy.supports(highValuePackage)).isTrue();
    }

    @Test
    @DisplayName("不应支持低价值案件包")
    void supports_ShouldReturnFalse_ForLowValuePackage() {
        assertThat(strategy.supports(lowValuePackage)).isFalse();
    }

    @Test
    @DisplayName("execute - 应返回候选列表")
    void execute_ShouldReturnCandidates() {
        List<Organization> orgs = Arrays.asList(org1, org2);
        
        List<AssignmentStrategy.AssignmentCandidate> candidates = strategy.execute(highValuePackage, orgs);
        
        assertThat(candidates).isNotEmpty();
        assertThat(candidates).hasSize(2);
    }

    @Test
    @DisplayName("assess - 应返回评估结果")
    void assess_ShouldReturnAssessment() {
        MatchingAssessment assessment = strategy.assess(org1, highValuePackage);
        
        assertThat(assessment).isNotNull();
        assertThat(assessment.getOverallScore()).isGreaterThan(0);
    }
}
