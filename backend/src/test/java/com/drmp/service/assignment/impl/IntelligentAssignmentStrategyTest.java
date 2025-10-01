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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;

@DisplayName("IntelligentAssignmentStrategy 测试")
class IntelligentAssignmentStrategyTest {

    private IntelligentAssignmentStrategy strategy;
    private CasePackage casePackage;
    private Organization org1;
    private Organization org2;

    @BeforeEach
    void setUp() {
        strategy = new IntelligentAssignmentStrategy();
        
        casePackage = new CasePackage();
        casePackage.setId(1L);
        casePackage.setTotalAmount(new BigDecimal("1500000"));
        casePackage.setCaseCount(100);
        
        org1 = new Organization();
        org1.setId(1L);
        org1.setName("机构A");
        
        org2 = new Organization();
        org2.setId(2L);
        org2.setName("机构B");
    }

    @Test
    @DisplayName("策略名称应为INTELLIGENT")
    void getStrategyName_ShouldReturnIntelligent() {
        assertThat(strategy.getStrategyName()).isEqualTo("INTELLIGENT");
    }

    @Test
    @DisplayName("策略描述应包含智能关键词")
    void getDescription_ShouldContainIntelligentKeyword() {
        String description = strategy.getDescription();
        assertThat(description).contains("智能");
    }

    @Test
    @DisplayName("优先级应为1")
    void getPriority_ShouldReturn1() {
        assertThat(strategy.getPriority()).isEqualTo(1);
    }

    @Test
    @DisplayName("应支持所有案件包")
    void supports_ShouldReturnTrue_ForAnyCasePackage() {
        assertThat(strategy.supports(casePackage)).isTrue();
    }

    @Test
    @DisplayName("execute - 应返回排序的候选列表")
    void execute_ShouldReturnSortedCandidates() {
        List<Organization> orgs = Arrays.asList(org1, org2);
        
        List<AssignmentStrategy.AssignmentCandidate> candidates = strategy.execute(casePackage, orgs);
        
        assertThat(candidates).isNotEmpty();
        assertThat(candidates).hasSize(2);
        if (candidates.size() > 1) {
            assertThat(candidates.get(0).getScore()).isGreaterThanOrEqualTo(candidates.get(1).getScore());
        }
    }

    @Test
    @DisplayName("execute - 候选结果应包含多维度分数")
    void execute_CandidatesShouldHaveMultiDimensionScores() {
        List<Organization> orgs = Arrays.asList(org1);
        
        List<AssignmentStrategy.AssignmentCandidate> candidates = strategy.execute(casePackage, orgs);
        
        assertThat(candidates.get(0).getDetailScores()).isNotNull();
        assertThat(candidates.get(0).getDetailScores().size()).isGreaterThan(2);
    }

    @Test
    @DisplayName("execute - 应设置排名")
    void execute_ShouldSetRank() {
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
        assertThat(assessment.getOverallScore()).isGreaterThan(0);
        assertThat(assessment.getOverallScore()).isLessThanOrEqualTo(100);
    }

    @Test
    @DisplayName("setConfigurationParameters - 应能设置配置参数")
    void setConfigurationParameters_ShouldAcceptParameters() {
        Map<String, Object> params = new HashMap<>();
        params.put("testKey", "testValue");
        
        strategy.setConfigurationParameters(params);
        Map<String, Object> retrieved = strategy.getConfigurationParameters();
        
        assertThat(retrieved).isNotNull();
    }

    @Test
    @DisplayName("getConfigurationParameters - 应返回配置参数")
    void getConfigurationParameters_ShouldReturnParameters() {
        Map<String, Object> params = strategy.getConfigurationParameters();
        
        assertThat(params).isNotNull();
    }
}
