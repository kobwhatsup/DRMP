package com.drmp.service;

import com.drmp.config.BaseServiceTest;
import com.drmp.dto.request.AssignmentRuleRequest;
import com.drmp.dto.response.AssignmentRecommendationResponse;
import com.drmp.dto.response.AssignmentRuleResponse;
import com.drmp.entity.AssignmentRule;
import com.drmp.entity.CasePackage;
import com.drmp.entity.Organization;
import com.drmp.entity.enums.CasePackageStatus;
import com.drmp.entity.enums.OrganizationType;
import com.drmp.exception.BusinessException;
import com.drmp.exception.ResourceNotFoundException;
import com.drmp.repository.AssignmentRuleRepository;
import com.drmp.repository.CasePackageRepository;
import com.drmp.repository.OrganizationRepository;
import com.drmp.service.SmartAssignmentService.*;
import com.drmp.service.assignment.AssignmentStrategy;
import com.drmp.service.assignment.AssignmentStrategy.AssignmentCandidate;
import com.drmp.service.assignment.AssignmentStrategyManager;
import com.drmp.service.impl.SmartAssignmentServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * SmartAssignmentService Test
 * 智能分案服务测试
 *
 * 测试覆盖：
 * - 智能推荐 (getRecommendations)
 * - 自动分案 (executeAutoAssignment)
 * - 批量分案 (executeBatchAssignment)
 * - 匹配度评估 (assessMatching)
 * - 分案规则CRUD
 * - 统计与分析
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@DisplayName("SmartAssignmentService 测试")
class SmartAssignmentServiceTest extends BaseServiceTest {

    @InjectMocks
    private SmartAssignmentServiceImpl smartAssignmentService;

    @Mock
    private AssignmentRuleRepository assignmentRuleRepository;

    @Mock
    private CasePackageRepository casePackageRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private AssignmentStrategyManager strategyManager;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AssignmentStrategy mockStrategy;

    private CasePackage testCasePackage;
    private Organization testOrganization;
    private AssignmentRule testRule;
    private List<Organization> testOrganizations;

    @BeforeEach
    void setUp() {
        // 初始化测试案件包
        testCasePackage = new CasePackage();
        testCasePackage.setId(1L);
        testCasePackage.setPackageName("测试案件包");
        testCasePackage.setCaseCount(100);
        testCasePackage.setTotalAmount(new BigDecimal("5000000"));
        testCasePackage.setStatus(CasePackageStatus.PUBLISHED);
        testCasePackage.setDescription("广东省案件包");

        // 初始化测试机构
        testOrganization = new Organization();
        testOrganization.setId(1L);
        testOrganization.setName("优秀律所");
        testOrganization.setType(OrganizationType.LAW_FIRM);
        testOrganization.setAddress("广东省广州市");
        testOrganization.setMonthlyCaseCapacity(500);
        testOrganization.setCurrentLoadPercentage(50);
        testOrganization.setMembershipPaid(true);
        testOrganization.setContactPerson("张律师");
        testOrganization.setContactPhone("13800138000");
        testOrganization.setEmail("test@lawfirm.com");

        // 初始化测试机构列表
        testOrganizations = new ArrayList<>();
        testOrganizations.add(testOrganization);

        // 第二个机构
        Organization org2 = new Organization();
        org2.setId(2L);
        org2.setName("一般律所");
        org2.setType(OrganizationType.LAW_FIRM);
        org2.setAddress("浙江省杭州市");
        org2.setMonthlyCaseCapacity(300);
        org2.setCurrentLoadPercentage(80);
        org2.setMembershipPaid(true);
        testOrganizations.add(org2);

        // 初始化测试规则
        testRule = new AssignmentRule();
        testRule.setId(1L);
        testRule.setRuleName("高价值案件分案规则");
        testRule.setRuleType("PERFORMANCE");
        testRule.setPriority(1);
        testRule.setEnabled(true);
        testRule.setMinMatchingScore(0.7);
        testRule.setCreatedBy(1L);
    }

    // ========== 智能推荐测试 ==========

    @Nested
    @DisplayName("智能推荐 (getRecommendations)")
    class GetRecommendationsTests {

        @Test
        @DisplayName("成功获取推荐机构列表")
        void getRecommendations_ShouldReturnRecommendations_WhenValidRequest() {
            // Arrange
            when(casePackageRepository.findById(1L)).thenReturn(Optional.of(testCasePackage));
            when(organizationRepository.findAll()).thenReturn(testOrganizations);
            when(strategyManager.getOptimalStrategy(any())).thenReturn(mockStrategy);
            when(mockStrategy.getStrategyName()).thenReturn("INTELLIGENT");

            AssignmentCandidate candidate = new AssignmentCandidate(1L, "优秀律所", 0.85, "强烈推荐");
            Map<String, Double> detailScores = new HashMap<>();
            detailScores.put("geographic", 0.9);
            detailScores.put("capacity", 0.8);
            detailScores.put("experience", 0.85);
            detailScores.put("performance", 0.9);
            candidate.setDetailScores(detailScores);
            candidate.setRank(1);

            MatchingAssessment assessment = new MatchingAssessment();
            assessment.setOverallScore(0.85);
            assessment.setStrengths(Arrays.asList("地域匹配度高", "处理能力充足"));
            assessment.setWeaknesses(new ArrayList<>());
            assessment.setRecommendation("强烈推荐");
            candidate.setAssessment(assessment);

            when(mockStrategy.execute(any(), any())).thenReturn(Arrays.asList(candidate));

            // Act
            List<AssignmentRecommendationResponse> recommendations = smartAssignmentService.getRecommendations(1L, 10);

            // Assert
            assertThat(recommendations).isNotEmpty();
            assertThat(recommendations).hasSize(1);

            AssignmentRecommendationResponse firstRec = recommendations.get(0);
            assertThat(firstRec.getOrganizationId()).isEqualTo(1L);
            assertThat(firstRec.getOrganizationName()).isEqualTo("优秀律所");
            assertThat(firstRec.getMatchScore()).isEqualTo(0.85);
            assertThat(firstRec.getAssignmentStrategy()).isEqualTo("INTELLIGENT");
            assertThat(firstRec.getRegionMatchScore()).isEqualTo(0.9);

            verify(casePackageRepository).findById(1L);
            verify(strategyManager).getOptimalStrategy(testCasePackage);
            verify(mockStrategy).execute(eq(testCasePackage), anyList());
        }

        @Test
        @DisplayName("案件包不存在时应抛出异常")
        void getRecommendations_ShouldThrowException_WhenCasePackageNotFound() {
            // Arrange
            when(casePackageRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> smartAssignmentService.getRecommendations(999L, 10))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("案件包不存在");

            verify(casePackageRepository).findById(999L);
            verifyNoInteractions(strategyManager);
        }

        @Test
        @DisplayName("应限制返回数量")
        void getRecommendations_ShouldLimitResults_WhenLimitSpecified() {
            // Arrange
            when(casePackageRepository.findById(1L)).thenReturn(Optional.of(testCasePackage));
            when(organizationRepository.findAll()).thenReturn(testOrganizations);
            when(strategyManager.getOptimalStrategy(any())).thenReturn(mockStrategy);
            when(mockStrategy.getStrategyName()).thenReturn("INTELLIGENT");

            List<AssignmentCandidate> candidates = new ArrayList<>();
            for (int i = 1; i <= 20; i++) {
                AssignmentCandidate candidate = new AssignmentCandidate((long) i, "机构" + i, 0.8 - i * 0.01, "推荐");
                candidate.setDetailScores(new HashMap<>());
                candidate.setAssessment(new MatchingAssessment());
                candidates.add(candidate);
            }
            when(mockStrategy.execute(any(), any())).thenReturn(candidates);

            // Act
            List<AssignmentRecommendationResponse> recommendations = smartAssignmentService.getRecommendations(1L, 5);

            // Assert
            assertThat(recommendations).hasSize(5);
        }

        @Test
        @DisplayName("无可用机构时返回空列表")
        void getRecommendations_ShouldReturnEmptyList_WhenNoOrganizationsAvailable() {
            // Arrange
            when(casePackageRepository.findById(1L)).thenReturn(Optional.of(testCasePackage));
            when(organizationRepository.findAll()).thenReturn(new ArrayList<>());
            when(strategyManager.getOptimalStrategy(any())).thenReturn(mockStrategy);
            when(mockStrategy.getStrategyName()).thenReturn("INTELLIGENT");
            when(mockStrategy.execute(any(), any())).thenReturn(new ArrayList<>());

            // Act
            List<AssignmentRecommendationResponse> recommendations = smartAssignmentService.getRecommendations(1L, 10);

            // Assert
            assertThat(recommendations).isEmpty();
        }
    }

    // ========== 自动分案测试 ==========

    @Nested
    @DisplayName("自动分案 (executeAutoAssignment)")
    class ExecuteAutoAssignmentTests {

        @Test
        @DisplayName("成功执行自动分案")
        void executeAutoAssignment_ShouldSucceed_WhenRuleMatchesAndOrgAvailable() {
            // Arrange
            when(casePackageRepository.findById(1L)).thenReturn(Optional.of(testCasePackage));
            when(assignmentRuleRepository.findById(1L)).thenReturn(Optional.of(testRule));
            when(organizationRepository.findAll()).thenReturn(testOrganizations);
            when(organizationRepository.findById(1L)).thenReturn(Optional.of(testOrganization));
            when(strategyManager.getOptimalStrategy(any())).thenReturn(mockStrategy);
            when(mockStrategy.getStrategyName()).thenReturn("PERFORMANCE");

            AssignmentCandidate candidate = new AssignmentCandidate(1L, "优秀律所", 0.85, "强烈推荐");
            Map<String, Double> detailScores = new HashMap<>();
            detailScores.put("performance", 0.9);
            candidate.setDetailScores(detailScores);
            candidate.setAssessment(new MatchingAssessment());
            when(mockStrategy.execute(any(), any())).thenReturn(Arrays.asList(candidate));

            // Mock testAssignmentRule 内部逻辑
            testRule.setTargetAmountRange("1000000-10000000");

            // Act
            AssignmentResult result = smartAssignmentService.executeAutoAssignment(1L, 1L);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.isSuccess()).isTrue();
            assertThat(result.getAssignedOrganizationId()).isEqualTo(1L);
            assertThat(result.getAssignedOrganizationName()).isEqualTo("优秀律所");
            assertThat(result.getMatchingScore()).isEqualTo(0.85);
            assertThat(result.getStrategy()).isEqualTo("PERFORMANCE");

            verify(casePackageRepository).save(argThat(pkg ->
                pkg.getDisposalOrganization() != null &&
                pkg.getStatus() == CasePackageStatus.ASSIGNED
            ));
            verify(assignmentRuleRepository).save(argThat(rule ->
                rule.getUsageCount() == 1 &&
                rule.getSuccessCount() == 1
            ));
        }

        @Test
        @DisplayName("规则不匹配时应返回失败结果")
        void executeAutoAssignment_ShouldFail_WhenRuleDoesNotMatch() {
            // Arrange
            testCasePackage.setTotalAmount(new BigDecimal("100000")); // 低于目标范围
            testRule.setTargetAmountRange("1000000-10000000");

            when(casePackageRepository.findById(1L)).thenReturn(Optional.of(testCasePackage));
            when(assignmentRuleRepository.findById(1L)).thenReturn(Optional.of(testRule));

            // Act
            AssignmentResult result = smartAssignmentService.executeAutoAssignment(1L, 1L);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.isSuccess()).isFalse();
            assertThat(result.getReason()).contains("规则条件不匹配");

            verify(casePackageRepository, never()).save(any());
        }

        @Test
        @DisplayName("匹配度低于最小要求时应返回失败")
        void executeAutoAssignment_ShouldFail_WhenScoreBelowMinimum() {
            // Arrange
            testRule.setMinMatchingScore(0.9);

            when(casePackageRepository.findById(1L)).thenReturn(Optional.of(testCasePackage));
            when(assignmentRuleRepository.findById(1L)).thenReturn(Optional.of(testRule));
            when(organizationRepository.findAll()).thenReturn(testOrganizations);
            when(strategyManager.getOptimalStrategy(any())).thenReturn(mockStrategy);
            when(mockStrategy.getStrategyName()).thenReturn("PERFORMANCE");

            AssignmentCandidate candidate = new AssignmentCandidate(1L, "优秀律所", 0.7, "推荐");
            candidate.setDetailScores(new HashMap<>());
            candidate.setAssessment(new MatchingAssessment());
            when(mockStrategy.execute(any(), any())).thenReturn(Arrays.asList(candidate));

            // Act
            AssignmentResult result = smartAssignmentService.executeAutoAssignment(1L, 1L);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.isSuccess()).isFalse();
            assertThat(result.getReason()).contains("最佳匹配机构的分数低于最小要求");

            verify(casePackageRepository, never()).save(any());
        }

        @Test
        @DisplayName("无推荐机构时应返回失败")
        void executeAutoAssignment_ShouldFail_WhenNoRecommendations() {
            // Arrange
            when(casePackageRepository.findById(1L)).thenReturn(Optional.of(testCasePackage));
            when(assignmentRuleRepository.findById(1L)).thenReturn(Optional.of(testRule));
            when(organizationRepository.findAll()).thenReturn(new ArrayList<>());
            when(strategyManager.getOptimalStrategy(any())).thenReturn(mockStrategy);
            when(mockStrategy.getStrategyName()).thenReturn("PERFORMANCE");
            when(mockStrategy.execute(any(), any())).thenReturn(new ArrayList<>());

            // Act
            AssignmentResult result = smartAssignmentService.executeAutoAssignment(1L, 1L);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.isSuccess()).isFalse();
            assertThat(result.getReason()).contains("没有找到合适的处置机构");
        }

        @Test
        @DisplayName("规则不存在时应抛出异常")
        void executeAutoAssignment_ShouldThrowException_WhenRuleNotFound() {
            // Arrange
            when(casePackageRepository.findById(1L)).thenReturn(Optional.of(testCasePackage));
            when(assignmentRuleRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> smartAssignmentService.executeAutoAssignment(1L, 999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("分案规则不存在");
        }
    }

    // ========== 批量分案测试 ==========

    @Nested
    @DisplayName("批量分案 (executeBatchAssignment)")
    class ExecuteBatchAssignmentTests {

        @Test
        @DisplayName("成功执行批量分案")
        void executeBatchAssignment_ShouldSucceed_WhenAllCasePackagesValid() {
            // Arrange
            CasePackage pkg1 = createTestCasePackage(1L, "案件包1");
            CasePackage pkg2 = createTestCasePackage(2L, "案件包2");

            when(casePackageRepository.findById(1L)).thenReturn(Optional.of(pkg1));
            when(casePackageRepository.findById(2L)).thenReturn(Optional.of(pkg2));
            when(organizationRepository.findAll()).thenReturn(testOrganizations);
            when(organizationRepository.findById(anyLong())).thenReturn(Optional.of(testOrganization));
            when(strategyManager.getStrategy("INTELLIGENT")).thenReturn(mockStrategy);
            when(mockStrategy.getStrategyName()).thenReturn("INTELLIGENT");

            AssignmentCandidate candidate = new AssignmentCandidate(1L, "优秀律所", 0.85, "推荐");
            when(mockStrategy.execute(any(), any())).thenReturn(Arrays.asList(candidate));

            // Act
            BatchAssignmentResult result = smartAssignmentService.executeBatchAssignment(
                Arrays.asList(1L, 2L), "INTELLIGENT"
            );

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getTotalCount()).isEqualTo(2);
            assertThat(result.getSuccessCount()).isEqualTo(2);
            assertThat(result.getFailedCount()).isEqualTo(0);
            assertThat(result.getResults()).hasSize(2);
            assertThat(result.getSummary()).containsKey("successRate");
            assertThat(result.getSummary().get("successRate")).isEqualTo(100.0);

            verify(casePackageRepository, times(2)).save(any());
        }

        @Test
        @DisplayName("部分失败时应正确统计")
        void executeBatchAssignment_ShouldCountCorrectly_WhenSomeFail() {
            // Arrange
            CasePackage pkg1 = createTestCasePackage(1L, "案件包1");

            when(casePackageRepository.findById(1L)).thenReturn(Optional.of(pkg1));
            when(casePackageRepository.findById(2L)).thenReturn(Optional.empty()); // 第二个不存在
            when(organizationRepository.findAll()).thenReturn(testOrganizations);
            when(organizationRepository.findById(1L)).thenReturn(Optional.of(testOrganization));
            when(strategyManager.getOptimalStrategy(any())).thenReturn(mockStrategy);
            when(mockStrategy.getStrategyName()).thenReturn("INTELLIGENT");

            AssignmentCandidate candidate = new AssignmentCandidate(1L, "优秀律所", 0.85, "推荐");
            when(mockStrategy.execute(any(), any())).thenReturn(Arrays.asList(candidate));

            // Act
            BatchAssignmentResult result = smartAssignmentService.executeBatchAssignment(
                Arrays.asList(1L, 2L), null
            );

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getTotalCount()).isEqualTo(2);
            assertThat(result.getSuccessCount()).isEqualTo(1);
            assertThat(result.getFailedCount()).isEqualTo(1);
            assertThat(result.getSummary().get("successRate")).isEqualTo(50.0);
        }

        @Test
        @DisplayName("无可用机构时所有分案应失败")
        void executeBatchAssignment_ShouldFailAll_WhenNoOrganizationsAvailable() {
            // Arrange
            CasePackage pkg1 = createTestCasePackage(1L, "案件包1");

            when(casePackageRepository.findById(1L)).thenReturn(Optional.of(pkg1));
            when(organizationRepository.findAll()).thenReturn(new ArrayList<>());
            when(strategyManager.getOptimalStrategy(any())).thenReturn(mockStrategy);
            when(mockStrategy.getStrategyName()).thenReturn("INTELLIGENT");

            // Act
            BatchAssignmentResult result = smartAssignmentService.executeBatchAssignment(
                Arrays.asList(1L), null
            );

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getTotalCount()).isEqualTo(1);
            assertThat(result.getSuccessCount()).isEqualTo(0);
            assertThat(result.getFailedCount()).isEqualTo(1);

            AssignmentResult firstResult = result.getResults().get(0);
            assertThat(firstResult.isSuccess()).isFalse();
            assertThat(firstResult.getReason()).contains("没有可用的处置机构");
        }

        @Test
        @DisplayName("使用指定策略执行批量分案")
        void executeBatchAssignment_ShouldUseSpecifiedStrategy_WhenStrategyProvided() {
            // Arrange
            CasePackage pkg1 = createTestCasePackage(1L, "案件包1");

            when(casePackageRepository.findById(1L)).thenReturn(Optional.of(pkg1));
            when(organizationRepository.findAll()).thenReturn(testOrganizations);
            when(organizationRepository.findById(1L)).thenReturn(Optional.of(testOrganization));
            when(strategyManager.getStrategy("PERFORMANCE")).thenReturn(mockStrategy);
            when(mockStrategy.getStrategyName()).thenReturn("PERFORMANCE");

            AssignmentCandidate candidate = new AssignmentCandidate(1L, "优秀律所", 0.9, "强烈推荐");
            when(mockStrategy.execute(any(), any())).thenReturn(Arrays.asList(candidate));

            // Act
            BatchAssignmentResult result = smartAssignmentService.executeBatchAssignment(
                Arrays.asList(1L), "PERFORMANCE"
            );

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getSuccessCount()).isEqualTo(1);

            verify(strategyManager).getStrategy("PERFORMANCE");
            verify(strategyManager, never()).getOptimalStrategy(any());
        }

        @Test
        @DisplayName("策略不存在时应使用默认策略")
        void executeBatchAssignment_ShouldUseDefaultStrategy_WhenStrategyUnknown() {
            // Arrange
            CasePackage pkg1 = createTestCasePackage(1L, "案件包1");

            when(casePackageRepository.findById(1L)).thenReturn(Optional.of(pkg1));
            when(organizationRepository.findAll()).thenReturn(testOrganizations);
            when(organizationRepository.findById(1L)).thenReturn(Optional.of(testOrganization));
            when(strategyManager.getStrategy("UNKNOWN_STRATEGY")).thenThrow(new IllegalArgumentException("Unknown strategy"));
            when(strategyManager.getDefaultStrategy()).thenReturn(mockStrategy);
            when(mockStrategy.getStrategyName()).thenReturn("INTELLIGENT");

            AssignmentCandidate candidate = new AssignmentCandidate(1L, "优秀律所", 0.85, "推荐");
            when(mockStrategy.execute(any(), any())).thenReturn(Arrays.asList(candidate));

            // Act
            BatchAssignmentResult result = smartAssignmentService.executeBatchAssignment(
                Arrays.asList(1L), "UNKNOWN_STRATEGY"
            );

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getSuccessCount()).isEqualTo(1);

            verify(strategyManager).getStrategy("UNKNOWN_STRATEGY");
            verify(strategyManager).getDefaultStrategy();
        }
    }

    // ========== 匹配度评估测试 ==========

    @Nested
    @DisplayName("匹配度评估 (assessMatching)")
    class AssessMatchingTests {

        @Test
        @DisplayName("成功评估机构与案件包匹配度")
        void assessMatching_ShouldReturnAssessment_WhenValidRequest() {
            // Arrange
            when(organizationRepository.findById(1L)).thenReturn(Optional.of(testOrganization));
            when(casePackageRepository.findById(1L)).thenReturn(Optional.of(testCasePackage));
            when(strategyManager.getOptimalStrategy(any())).thenReturn(mockStrategy);
            when(mockStrategy.getStrategyName()).thenReturn("INTELLIGENT");

            MatchingAssessment expectedAssessment = new MatchingAssessment();
            expectedAssessment.setOverallScore(0.85);
            expectedAssessment.setGeographicScore(0.9);
            expectedAssessment.setCapacityScore(0.8);
            expectedAssessment.setExperienceScore(0.85);
            expectedAssessment.setPerformanceScore(0.9);
            expectedAssessment.setAvailabilityScore(0.75);
            expectedAssessment.setStrengths(Arrays.asList("地域优势", "经验丰富"));
            expectedAssessment.setWeaknesses(new ArrayList<>());
            expectedAssessment.setRecommendation("强烈推荐");

            when(mockStrategy.assess(any(), any())).thenReturn(expectedAssessment);

            // Act
            MatchingAssessment result = smartAssignmentService.assessMatching(1L, 1L);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getOverallScore()).isEqualTo(0.85);
            assertThat(result.getGeographicScore()).isEqualTo(0.9);
            assertThat(result.getStrengths()).contains("地域优势", "经验丰富");
            assertThat(result.getRecommendation()).isEqualTo("强烈推荐");

            verify(strategyManager).getOptimalStrategy(testCasePackage);
            verify(mockStrategy).assess(testOrganization, testCasePackage);
        }

        @Test
        @DisplayName("机构不存在时应抛出异常")
        void assessMatching_ShouldThrowException_WhenOrganizationNotFound() {
            // Arrange
            when(organizationRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> smartAssignmentService.assessMatching(999L, 1L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("机构不存在");

            verify(organizationRepository).findById(999L);
            verifyNoInteractions(strategyManager);
        }

        @Test
        @DisplayName("案件包不存在时应抛出异常")
        void assessMatching_ShouldThrowException_WhenCasePackageNotFound() {
            // Arrange
            when(organizationRepository.findById(1L)).thenReturn(Optional.of(testOrganization));
            when(casePackageRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> smartAssignmentService.assessMatching(1L, 999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("案件包不存在");
        }
    }

    // ========== 分案规则CRUD测试 ==========

    @Nested
    @DisplayName("分案规则管理")
    class AssignmentRuleManagementTests {

        @Test
        @DisplayName("成功创建分案规则")
        void createAssignmentRule_ShouldSucceed_WhenValidRequest() throws Exception {
            // Arrange
            AssignmentRuleRequest request = new AssignmentRuleRequest();
            request.setRuleName("高价值案件规则");
            request.setDescription("针对高价值案件的分案规则");
            request.setRuleType("PERFORMANCE");
            request.setPriority(1);
            request.setEnabled(true);
            request.setMinMatchingScore(0.8);
            request.setTargetAmountRange("1000000-10000000");

            when(assignmentRuleRepository.save(any())).thenAnswer(invocation -> {
                AssignmentRule rule = invocation.getArgument(0);
                rule.setId(1L);
                rule.setCreatedAt(LocalDateTime.now());
                rule.setUpdatedAt(LocalDateTime.now());
                return rule;
            });

            // Act
            AssignmentRuleResponse response = smartAssignmentService.createAssignmentRule(request);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getId()).isEqualTo(1L);
            assertThat(response.getRuleName()).isEqualTo("高价值案件规则");
            assertThat(response.getRuleType()).isEqualTo("PERFORMANCE");
            assertThat(response.getMinMatchingScore()).isEqualTo(0.8);

            verify(assignmentRuleRepository).save(argThat(rule ->
                rule.getRuleName().equals("高价值案件规则") &&
                rule.getEnabled() == true
            ));
        }

        // TODO: 以下测试需要 mockito-inline 支持静态方法 mock
        // 暂时注释掉，避免测试执行失败

        /*
        @Test
        @DisplayName("成功更新分案规则")
        void updateAssignmentRule_ShouldSucceed_WhenValidRequest() {
            // NOTE: 此测试需要 mock SecurityUtils.getCurrentUserId() 静态方法
            // 需要添加 mockito-inline 依赖才能运行
        }

        @Test
        @DisplayName("无权限更新规则时应抛出异常")
        void updateAssignmentRule_ShouldThrowException_WhenUnauthorized() {
            // NOTE: 此测试需要 mock SecurityUtils.getCurrentUserId() 静态方法
        }

        @Test
        @DisplayName("成功删除分案规则")
        void deleteAssignmentRule_ShouldSucceed_WhenAuthorized() {
            // NOTE: 此测试需要 mock SecurityUtils.getCurrentUserId() 静态方法
        }
        */

        @Test
        @DisplayName("获取启用的分案规则列表")
        void getAssignmentRules_ShouldReturnEnabledRules_WhenOrgIdIsNull() {
            // Arrange
            List<AssignmentRule> rules = Arrays.asList(testRule);
            when(assignmentRuleRepository.findByEnabledTrueOrderByPriorityAsc()).thenReturn(rules);

            // Act
            List<AssignmentRuleResponse> responses = smartAssignmentService.getAssignmentRules(null);

            // Assert
            assertThat(responses).hasSize(1);
            assertThat(responses.get(0).getRuleName()).isEqualTo("高价值案件分案规则");

            verify(assignmentRuleRepository).findByEnabledTrueOrderByPriorityAsc();
        }

        @Test
        @DisplayName("根据机构ID获取分案规则")
        void getAssignmentRules_ShouldReturnRulesByOrg_WhenOrgIdProvided() {
            // Arrange
            List<AssignmentRule> rules = Arrays.asList(testRule);
            when(assignmentRuleRepository.findByCreatedByOrderByCreatedAtDesc(1L)).thenReturn(rules);

            // Act
            List<AssignmentRuleResponse> responses = smartAssignmentService.getAssignmentRules(1L);

            // Assert
            assertThat(responses).hasSize(1);
            verify(assignmentRuleRepository).findByCreatedByOrderByCreatedAtDesc(1L);
        }
    }

    // ========== 统计与分析测试 ==========

    @Nested
    @DisplayName("统计与分析")
    class StatisticsAndAnalysisTests {

        @Test
        @DisplayName("获取分案统计数据")
        void getAssignmentStatistics_ShouldReturnStatistics() {
            // Act
            AssignmentStatistics statistics = smartAssignmentService.getAssignmentStatistics(
                1L, "2025-01-01", "2025-01-31"
            );

            // Assert
            assertThat(statistics).isNotNull();
            assertThat(statistics.getTotalAssignments()).isNotNull();
            assertThat(statistics.getSuccessRate()).isNotNull();
        }

        @Test
        @DisplayName("获取机构能力画像")
        void getCapabilityProfile_ShouldReturnProfile_WhenOrganizationExists() {
            // Arrange
            when(organizationRepository.findById(1L)).thenReturn(Optional.of(testOrganization));

            // Act
            OrganizationCapabilityProfile profile = smartAssignmentService.getCapabilityProfile(1L);

            // Assert
            assertThat(profile).isNotNull();
            assertThat(profile.getOrganizationId()).isEqualTo(1L);
            assertThat(profile.getOrganizationName()).isEqualTo("优秀律所");
            assertThat(profile.getCurrentLoad()).isEqualTo(50.0);

            verify(organizationRepository).findById(1L);
        }

        @Test
        @DisplayName("机构不存在时获取能力画像应抛出异常")
        void getCapabilityProfile_ShouldThrowException_WhenOrganizationNotFound() {
            // Arrange
            when(organizationRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> smartAssignmentService.getCapabilityProfile(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("机构不存在");
        }

        @Test
        @DisplayName("预测分案成功率")
        void predictSuccessRate_ShouldReturnPrediction() {
            // Act
            Double successRate = smartAssignmentService.predictSuccessRate(1L, testCasePackage);

            // Assert
            assertThat(successRate).isNotNull();
            assertThat(successRate).isBetween(0.0, 100.0);
        }
    }

    // ========== 规则测试功能测试 ==========

    @Nested
    @DisplayName("规则测试 (testAssignmentRule)")
    class TestAssignmentRuleTests {

        @Test
        @DisplayName("规则匹配成功")
        void testAssignmentRule_ShouldMatch_WhenConditionsMet() {
            // Arrange
            testRule.setTargetAmountRange("1000000-10000000");
            testCasePackage.setTotalAmount(new BigDecimal("5000000"));

            when(assignmentRuleRepository.findById(1L)).thenReturn(Optional.of(testRule));
            when(casePackageRepository.findById(1L)).thenReturn(Optional.of(testCasePackage));

            // Act
            RuleTestResult result = smartAssignmentService.testAssignmentRule(1L, 1L);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.isRuleMatched()).isTrue();
            assertThat(result.getScore()).isGreaterThan(0.0);
            assertThat(result.getMatchedCriteria()).isNotEmpty();
        }

        @Test
        @DisplayName("规则不匹配")
        void testAssignmentRule_ShouldNotMatch_WhenConditionsNotMet() {
            // Arrange
            testRule.setTargetAmountRange("10000000-50000000");
            testCasePackage.setTotalAmount(new BigDecimal("500000")); // 低于范围

            when(assignmentRuleRepository.findById(1L)).thenReturn(Optional.of(testRule));
            when(casePackageRepository.findById(1L)).thenReturn(Optional.of(testCasePackage));

            // Act
            RuleTestResult result = smartAssignmentService.testAssignmentRule(1L, 1L);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.isRuleMatched()).isFalse();
            assertThat(result.getReason()).contains("金额范围不符合要求");
            assertThat(result.getUnmatchedCriteria()).isNotEmpty();
        }
    }

    // ========== 辅助方法 ==========

    private CasePackage createTestCasePackage(Long id, String name) {
        CasePackage pkg = new CasePackage();
        pkg.setId(id);
        pkg.setPackageName(name);
        pkg.setCaseCount(50);
        pkg.setTotalAmount(new BigDecimal("2000000"));
        pkg.setStatus(CasePackageStatus.PUBLISHED);
        return pkg;
    }
}
