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

@DisplayName("LoadBalanceAssignmentStrategy 测试")
class LoadBalanceAssignmentStrategyTest {

    private LoadBalanceAssignmentStrategy strategy;
    private CasePackage casePackage;
    private Organization org1;
    private Organization org2;

    @BeforeEach
    void setUp() {
        strategy = new LoadBalanceAssignmentStrategy();
        
        casePackage = new CasePackage();
        casePackage.setId(1L);
        casePackage.setTotalAmount(new BigDecimal("500000"));
        casePackage.setCaseCount(50);
        
        org1 = new Organization();
        org1.setId(1L);
        org1.setName("机构1");
        
        org2 = new Organization();
        org2.setId(2L);
        org2.setName("机构2");
    }

    @Test
    @DisplayName("策略名称应为LOAD_BALANCE")
    void getStrategyName_ShouldReturnLoadBalance() {
        assertThat(strategy.getStrategyName()).isEqualTo("LOAD_BALANCE");
    }

    @Test
    @DisplayName("优先级应为5")
    void getPriority_ShouldReturn5() {
        assertThat(strategy.getPriority()).isEqualTo(5);
    }

    @Test
    @DisplayName("应支持所有案件包")
    void supports_ShouldReturnTrue_ForAnyCasePackage() {
        assertThat(strategy.supports(casePackage)).isTrue();
    }

    @Test
    @DisplayName("execute - 应返回候选列表")
    void execute_ShouldReturnCandidates() {
        List<Organization> orgs = Arrays.asList(org1, org2);
        
        List<AssignmentStrategy.AssignmentCandidate> candidates = strategy.execute(casePackage, orgs);
        
        assertThat(candidates).isNotEmpty();
        assertThat(candidates).hasSize(2);
        assertThat(candidates.get(0).getScore()).isGreaterThan(0);
    }

    @Test
    @DisplayName("execute - 候选结果应设置排名")
    void execute_CandidatesShouldHaveRank() {
        List<Organization> orgs = Arrays.asList(org1, org2);
        
        List<AssignmentStrategy.AssignmentCandidate> candidates = strategy.execute(casePackage, orgs);
        
        assertThat(candidates.get(0).getRank()).isEqualTo(1);
        assertThat(candidates.get(1).getRank()).isEqualTo(2);
    }

    @Test
    @DisplayName("assess - 应返回评估结果")
    void assess_ShouldReturnAssessment() {
        MatchingAssessment assessment = strategy.assess(org1, casePackage);
        
        assertThat(assessment).isNotNull();
    }
}
