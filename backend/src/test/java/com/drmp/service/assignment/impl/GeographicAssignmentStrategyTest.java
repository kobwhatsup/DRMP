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

@DisplayName("GeographicAssignmentStrategy 测试")
class GeographicAssignmentStrategyTest {

    private GeographicAssignmentStrategy strategy;
    private CasePackage casePackage;
    private Organization org1;
    private Organization org2;

    @BeforeEach
    void setUp() {
        strategy = new GeographicAssignmentStrategy();
        
        casePackage = new CasePackage();
        casePackage.setId(1L);
        casePackage.setTotalAmount(new BigDecimal("500000"));
        
        org1 = new Organization();
        org1.setId(1L);
        org1.setName("机构1");
        
        org2 = new Organization();
        org2.setId(2L);
        org2.setName("机构2");
    }

    @Test
    @DisplayName("策略名称应为GEOGRAPHIC")
    void getStrategyName_ShouldReturnGeographic() {
        assertThat(strategy.getStrategyName()).isEqualTo("GEOGRAPHIC");
    }

    @Test
    @DisplayName("策略描述不应为空")
    void getDescription_ShouldNotBeEmpty() {
        assertThat(strategy.getDescription()).isNotEmpty();
    }

    @Test
    @DisplayName("优先级应为10")
    void getPriority_ShouldReturn10() {
        assertThat(strategy.getPriority()).isEqualTo(10);
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
        assertThat(candidates.get(0).getRank()).isEqualTo(1);
        assertThat(candidates.get(1).getRank()).isEqualTo(2);
    }

    @Test
    @DisplayName("execute - 候选结果应包含详细分数")
    void execute_CandidatesShouldHaveDetailScores() {
        List<Organization> orgs = Arrays.asList(org1);
        
        List<AssignmentStrategy.AssignmentCandidate> candidates = strategy.execute(casePackage, orgs);
        
        assertThat(candidates.get(0).getDetailScores()).isNotNull();
        assertThat(candidates.get(0).getDetailScores()).containsKeys("geographic", "capacity", "experience", "availability");
    }

    @Test
    @DisplayName("assess - 应返回匹配评估结果")
    void assess_ShouldReturnAssessment() {
        MatchingAssessment assessment = strategy.assess(org1, casePackage);
        
        assertThat(assessment).isNotNull();
        assertThat(assessment.getOverallScore()).isGreaterThan(0);
    }
}
