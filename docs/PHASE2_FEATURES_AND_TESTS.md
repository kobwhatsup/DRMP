# 第二阶段：功能完善与测试补充 - 完整实施方案

**项目**: DRMP分散诉调平台
**阶段**: Phase 2 - 功能完善与测试
**预计时间**: 3-4周
**优先级**: P1 (高优先级)
**前置条件**: Phase 1已完成

---

## 📊 阶段目标

### 核心目标
1. **补充测试覆盖** - 从5%提升到70%+
2. **完善核心功能** - 对账、报表、智能分案
3. **性能优化** - 数据库、缓存、API响应
4. **API文档完善** - Swagger注解和使用文档

### 成功标准
- ✅ 单元测试覆盖率 ≥ 70%
- ✅ 核心业务功能100%可用
- ✅ API响应时间 < 500ms (P95)
- ✅ 可通过UAT测试

---

## 🎯 任务分解 (按优先级)

### 模块1: 补充测试体系 (Week 1-2, 优先级: P0)

#### 1.1 单元测试框架搭建

**目标**: 建立完整的测试基础设施

**技术栈**:
```xml
<!-- JUnit 5 + Mockito + AssertJ -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>

<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-inline</artifactId>
    <scope>test</scope>
</dependency>

<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>test</scope>
</dependency>
```

**实施步骤**:

1. **创建测试配置**:
```java
// backend/src/test/java/com/drmp/config/TestConfig.java
@TestConfiguration
public class TestConfig {

    @Bean
    @Primary
    public DataSource dataSource() {
        return new EmbeddedDatabaseBuilder()
            .setType(EmbeddedDatabaseType.H2)
            .build();
    }

    @Bean
    @Primary
    public RedisConnectionFactory redisConnectionFactory() {
        // 使用内存Redis或Mock
        return new MockRedisConnectionFactory();
    }
}
```

2. **创建测试基类**:
```java
// backend/src/test/java/com/drmp/BaseTest.java
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
public abstract class BaseTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    protected <T> String toJson(T object) throws Exception {
        return objectMapper.writeValueAsString(object);
    }
}
```

3. **测试数据工厂**:
```java
// backend/src/test/java/com/drmp/factory/TestDataFactory.java
public class TestDataFactory {

    public static Organization createTestOrganization() {
        return Organization.builder()
            .orgCode("TEST_ORG_001")
            .name("测试机构")
            .type(OrganizationType.SOURCE)
            .status(OrganizationStatus.ACTIVE)
            .build();
    }

    public static CasePackage createTestCasePackage(Organization org) {
        return CasePackage.builder()
            .packageCode("PKG_TEST_001")
            .packageName("测试案件包")
            .sourceOrganization(org)
            .caseCount(100)
            .totalAmount(new BigDecimal("1000000"))
            .status(CasePackageStatus.PUBLISHED)
            .build();
    }

    // ... 更多工厂方法
}
```

---

#### 1.2 Service层单元测试

**目标**: 核心业务逻辑100%覆盖

**优先级测试清单**:

| Service | 测试优先级 | 预估工时 | 核心场景 |
|---------|----------|---------|---------|
| SmartAssignmentService | P0 | 4h | 匹配度计算、策略选择 |
| CasePackageService | P0 | 3h | 创建、更新、状态流转 |
| AuthService | P0 | 2h | 登录、权限验证 |
| OrganizationService | P1 | 2h | 注册、审核 |
| CaseProgressService | P1 | 2h | 进度更新、同步 |
| ContractService | P2 | 2h | 合同生成、签署 |

**示例测试 - SmartAssignmentServiceTest**:

```java
@ExtendWith(MockitoExtension.class)
class SmartAssignmentServiceTest {

    @Mock
    private CasePackageRepository casePackageRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private AssignmentStrategyManager strategyManager;

    @InjectMocks
    private SmartAssignmentServiceImpl smartAssignmentService;

    private CasePackage testCasePackage;
    private List<Organization> testOrganizations;

    @BeforeEach
    void setUp() {
        testCasePackage = TestDataFactory.createTestCasePackage();
        testOrganizations = TestDataFactory.createTestOrganizations(3);
    }

    @Test
    @DisplayName("应该根据地域匹配度返回推荐机构")
    void shouldReturnRecommendationsByRegion() {
        // Given
        when(casePackageRepository.findById(1L))
            .thenReturn(Optional.of(testCasePackage));
        when(organizationRepository.findByStatusAndType(any(), any()))
            .thenReturn(testOrganizations);

        AssignmentStrategy mockStrategy = mock(RegionBasedStrategy.class);
        when(strategyManager.getOptimalStrategy(testCasePackage))
            .thenReturn(mockStrategy);

        List<AssignmentCandidate> candidates = createMockCandidates();
        when(mockStrategy.execute(testCasePackage, testOrganizations))
            .thenReturn(candidates);

        // When
        List<AssignmentRecommendationResponse> recommendations =
            smartAssignmentService.getRecommendations(1L, 5);

        // Then
        assertThat(recommendations).hasSize(3);
        assertThat(recommendations.get(0).getMatchScore()).isGreaterThan(0.8);
        assertThat(recommendations.get(0).getRegionMatchScore()).isGreaterThan(0.7);

        verify(casePackageRepository).findById(1L);
        verify(strategyManager).getOptimalStrategy(testCasePackage);
    }

    @Test
    @DisplayName("当没有符合条件的机构时应该返回空列表")
    void shouldReturnEmptyWhenNoMatchingOrganizations() {
        // Given
        when(casePackageRepository.findById(1L))
            .thenReturn(Optional.of(testCasePackage));
        when(organizationRepository.findByStatusAndType(any(), any()))
            .thenReturn(Collections.emptyList());

        // When
        List<AssignmentRecommendationResponse> recommendations =
            smartAssignmentService.getRecommendations(1L, 5);

        // Then
        assertThat(recommendations).isEmpty();
    }

    @Test
    @DisplayName("当案件包不存在时应该抛出异常")
    void shouldThrowExceptionWhenCasePackageNotFound() {
        // Given
        when(casePackageRepository.findById(999L))
            .thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() ->
            smartAssignmentService.getRecommendations(999L, 5))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("案件包不存在");
    }

    @Test
    @DisplayName("应该正确计算综合匹配度")
    void shouldCalculateOverallScoreCorrectly() {
        // 测试匹配度计算逻辑
        // 权重: 地域30% + 容量25% + 业绩25% + 价格20%

        // Given
        Organization org = testOrganizations.get(0);
        MatchingAssessment assessment = smartAssignmentService
            .assessMatching(org.getId(), testCasePackage.getId());

        // Then
        double expectedScore =
            0.3 * assessment.getGeographicScore() +
            0.25 * assessment.getCapacityScore() +
            0.25 * assessment.getPerformanceScore() +
            0.2 * assessment.getAvailabilityScore();

        assertThat(assessment.getOverallScore())
            .isCloseTo(expectedScore, within(0.01));
    }
}
```

**测试覆盖目标**:
- ✅ 正常流程: 每个方法至少1个成功案例
- ✅ 异常处理: 参数校验、资源不存在、业务异常
- ✅ 边界条件: 空列表、最大值、最小值
- ✅ 并发场景: 乐���锁、分布式锁

---

#### 1.3 Controller层集成测试

**目标**: API接口功能验证

**示例测试 - CasePackageControllerTest**:

```java
@WebMvcTest(CasePackageController.class)
@Import(SecurityConfig.class)
class CasePackageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CasePackageService casePackageService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("POST /v1/case-packages - 应该成功创建案件包")
    void shouldCreateCasePackage() throws Exception {
        // Given
        CasePackageCreateRequest request = CasePackageCreateRequest.builder()
            .packageName("测试案件包")
            .caseCount(100)
            .totalAmount(new BigDecimal("1000000"))
            .build();

        CasePackageResponse response = CasePackageResponse.builder()
            .id(1L)
            .packageCode("PKG_20241001_001")
            .packageName("测试案件包")
            .build();

        when(casePackageService.createCasePackage(any()))
            .thenReturn(response);

        // When & Then
        mockMvc.perform(post("/v1/case-packages")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.id").value(1))
            .andExpect(jsonPath("$.data.packageCode").value("PKG_20241001_001"))
            .andDo(print());

        verify(casePackageService).createCasePackage(any());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("POST /v1/case-packages - 无权限应该返回403")
    void shouldReturn403WhenNoPermission() throws Exception {
        // When & Then
        mockMvc.perform(post("/v1/case-packages")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /v1/case-packages - 未登录应该返回401")
    void shouldReturn401WhenNotAuthenticated() throws Exception {
        // When & Then
        mockMvc.perform(post("/v1/case-packages")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "CASE_MANAGER")
    @DisplayName("POST /v1/case-packages - 参数校验失败应该返回400")
    void shouldReturn400WhenValidationFails() throws Exception {
        // Given - 缺少必填字段
        String invalidRequest = "{}";

        // When & Then
        mockMvc.perform(post("/v1/case-packages")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value(400))
            .andExpect(jsonPath("$.message").exists());
    }
}
```

---

#### 1.4 Repository层数据访问测试

**示例测试 - CasePackageRepositoryTest**:

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class CasePackageRepositoryTest {

    @Autowired
    private CasePackageRepository casePackageRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    @DisplayName("应该根据状态和机构ID查询案件包")
    void shouldFindByStatusAndOrganization() {
        // Given
        Organization org = TestDataFactory.createTestOrganization();
        entityManager.persist(org);

        CasePackage pkg1 = TestDataFactory.createTestCasePackage(org);
        pkg1.setStatus(CasePackageStatus.PUBLISHED);
        entityManager.persist(pkg1);

        CasePackage pkg2 = TestDataFactory.createTestCasePackage(org);
        pkg2.setStatus(CasePackageStatus.ASSIGNED);
        entityManager.persist(pkg2);

        entityManager.flush();

        // When
        List<CasePackage> result = casePackageRepository
            .findBySourceOrganizationAndStatus(
                org,
                CasePackageStatus.PUBLISHED
            );

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus())
            .isEqualTo(CasePackageStatus.PUBLISHED);
    }

    @Test
    @DisplayName("应该支持复杂条件查询")
    void shouldSupportComplexQuery() {
        // 测试Specification查询
        // 测试分页排序
        // 测试联表查询
    }
}
```

---

#### 1.5 前端单元测试

**技术栈**:
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "jest": "^29.3.1"
  }
}
```

**示例测试 - CasePackageList.test.tsx**:

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CasePackageList } from './CasePackageList';
import { casePackageService } from '@/services/casePackageService';

jest.mock('@/services/casePackageService');

describe('CasePackageList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该正确渲染案件包列表', async () => {
    // Given
    const mockData = {
      items: [
        { id: 1, packageName: '测试案件包1', caseCount: 100 },
        { id: 2, packageName: '测试案件包2', caseCount: 200 },
      ],
      total: 2,
    };

    (casePackageService.list as jest.Mock).mockResolvedValue(mockData);

    // When
    render(<CasePackageList />);

    // Then
    await waitFor(() => {
      expect(screen.getByText('测试案件包1')).toBeInTheDocument();
      expect(screen.getByText('测试案件包2')).toBeInTheDocument();
    });
  });

  it('应该处理加载错误', async () => {
    // Given
    (casePackageService.list as jest.Mock)
      .mockRejectedValue(new Error('网络错误'));

    // When
    render(<CasePackageList />);

    // Then
    await waitFor(() => {
      expect(screen.getByText(/加载失败/i)).toBeInTheDocument();
    });
  });

  it('应该支持搜索功能', async () => {
    // Given
    const user = userEvent.setup();
    (casePackageService.list as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
    });

    // When
    render(<CasePackageList />);
    const searchInput = screen.getByPlaceholderText('搜索案件包');
    await user.type(searchInput, '测试');

    // Then
    await waitFor(() => {
      expect(casePackageService.list).toHaveBeenCalledWith(
        expect.objectContaining({ keyword: '测试' })
      );
    });
  });
});
```

---

### 模块2: 完善核心业务功能 (Week 2-3, 优先级: P0)

#### 2.1 智能分案引擎完善

**当前状态**: 接口定义完整，算法实现不完整

**实施计划**:

**Step 1: 实现分案策略**

```java
// 1. 地域匹配策略
@Component
public class RegionBasedStrategy implements AssignmentStrategy {

    @Override
    public List<AssignmentCandidate> execute(
        CasePackage casePackage,
        List<Organization> organizations
    ) {
        // 提取案件地域分布
        Map<String, Integer> caseRegionMap = analyzeCaseRegions(casePackage);

        return organizations.stream()
            .map(org -> {
                double score = calculateRegionMatch(org, caseRegionMap);
                return AssignmentCandidate.builder()
                    .organizationId(org.getId())
                    .organizationName(org.getName())
                    .score(score)
                    .detailScores(Map.of("geographic", score))
                    .build();
            })
            .sorted(Comparator.comparing(AssignmentCandidate::getScore).reversed())
            .collect(Collectors.toList());
    }

    private double calculateRegionMatch(
        Organization org,
        Map<String, Integer> caseRegions
    ) {
        Set<String> orgRegions = org.getServiceRegions();
        int totalCases = caseRegions.values().stream()
            .mapToInt(Integer::intValue).sum();

        int matchedCases = caseRegions.entrySet().stream()
            .filter(e -> orgRegions.contains(e.getKey()))
            .mapToInt(Map.Entry::getValue)
            .sum();

        return totalCases > 0 ? (double) matchedCases / totalCases : 0.0;
    }
}

// 2. 容量匹配策略
@Component
public class CapacityBasedStrategy implements AssignmentStrategy {

    @Override
    public List<AssignmentCandidate> execute(
        CasePackage casePackage,
        List<Organization> organizations
    ) {
        int requiredCapacity = casePackage.getCaseCount();

        return organizations.stream()
            .filter(org -> hasEnoughCapacity(org, requiredCapacity))
            .map(org -> {
                double score = calculateCapacityScore(org, requiredCapacity);
                return createCandidate(org, score, "capacity");
            })
            .sorted(Comparator.comparing(AssignmentCandidate::getScore).reversed())
            .collect(Collectors.toList());
    }

    private boolean hasEnoughCapacity(Organization org, int required) {
        int available = org.getMonthlyCaseCapacity() *
                       (100 - org.getCurrentLoadPercentage()) / 100;
        return available >= required;
    }

    private double calculateCapacityScore(Organization org, int required) {
        int available = org.getMonthlyCaseCapacity() *
                       (100 - org.getCurrentLoadPercentage()) / 100;

        if (available < required) return 0.0;

        // 容量刚好时得分最高，过多或过少都扣分
        double ratio = (double) required / available;
        return ratio >= 0.5 && ratio <= 0.8 ? 1.0 : ratio;
    }
}

// 3. 业绩匹配策略
@Component
public class PerformanceBasedStrategy implements AssignmentStrategy {

    @Autowired
    private CasePackageRepository casePackageRepository;

    @Override
    public List<AssignmentCandidate> execute(
        CasePackage casePackage,
        List<Organization> organizations
    ) {
        // 查询各机构历史业绩
        Map<Long, PerformanceMetrics> performanceMap =
            calculatePerformanceMetrics(organizations);

        return organizations.stream()
            .map(org -> {
                PerformanceMetrics metrics = performanceMap.get(org.getId());
                double score = calculatePerformanceScore(metrics);
                return createCandidate(org, score, "performance", metrics);
            })
            .sorted(Comparator.comparing(AssignmentCandidate::getScore).reversed())
            .collect(Collectors.toList());
    }

    private Map<Long, PerformanceMetrics> calculatePerformanceMetrics(
        List<Organization> orgs
    ) {
        // 计算过去6个月的:
        // 1. 回款率
        // 2. 处置周期
        // 3. 案件完成率
        // 4. 客户满意度
        return orgs.stream()
            .collect(Collectors.toMap(
                Organization::getId,
                this::getOrgPerformanceMetrics
            ));
    }
}

// 4. 综合策略 (组合多个策略)
@Component
public class CompositeStrategy implements AssignmentStrategy {

    @Autowired
    private List<AssignmentStrategy> strategies;

    @Override
    public List<AssignmentCandidate> execute(
        CasePackage casePackage,
        List<Organization> organizations
    ) {
        // 权重配置
        Map<String, Double> weights = Map.of(
            "region", 0.30,
            "capacity", 0.25,
            "performance", 0.25,
            "cost", 0.20
        );

        // 执行所有策略
        Map<String, List<AssignmentCandidate>> strategyResults =
            strategies.stream()
                .collect(Collectors.toMap(
                    s -> s.getStrategyName(),
                    s -> s.execute(casePackage, organizations)
                ));

        // 综合打分
        return organizations.stream()
            .map(org -> calculateCompositeScore(org, strategyResults, weights))
            .sorted(Comparator.comparing(AssignmentCandidate::getScore).reversed())
            .collect(Collectors.toList());
    }
}
```

**Step 2: 策略选择器**

```java
@Component
public class AssignmentStrategyManager {

    @Autowired
    private RegionBasedStrategy regionStrategy;

    @Autowired
    private CapacityBasedStrategy capacityStrategy;

    @Autowired
    private PerformanceBasedStrategy performanceStrategy;

    @Autowired
    private CompositeStrategy compositeStrategy;

    public AssignmentStrategy getOptimalStrategy(CasePackage casePackage) {
        // 根据案件包特征选择最优策略

        // 1. 如果明确指定了策略
        if (StringUtils.isNotBlank(casePackage.getAssignmentStrategy())) {
            return getStrategyByName(casePackage.getAssignmentStrategy());
        }

        // 2. 智能选择策略
        if (isRegionSensitive(casePackage)) {
            return regionStrategy;
        }

        if (isUrgent(casePackage)) {
            return capacityStrategy;  // 优先考虑容量
        }

        if (isHighValue(casePackage)) {
            return performanceStrategy;  // 优先考虑业绩
        }

        // 3. 默认使用综合策略
        return compositeStrategy;
    }

    private boolean isRegionSensitive(CasePackage pkg) {
        // 案件集中在某几个地区
        return pkg.getCases().stream()
            .map(Case::getDebtorProvince)
            .distinct()
            .count() <= 3;
    }

    private boolean isUrgent(CasePackage pkg) {
        // 处置周期短
        return pkg.getExpectedDisposalDays() != null &&
               pkg.getExpectedDisposalDays() < 90;
    }

    private boolean isHighValue(CasePackage pkg) {
        // 金额大
        return pkg.getTotalAmount().compareTo(new BigDecimal("10000000")) > 0;
    }
}
```

---

#### 2.2 对账结算系统完善

**当前状态**: 基础框架存在，流程不完整

**实施计划**:

**Step 1: 对账流程设计**

```java
// 对账单生成Service
@Service
@RequiredArgsConstructor
public class ReconciliationServiceImpl implements ReconciliationService {

    private final CasePackageRepository casePackageRepository;
    private final CaseProgressRepository caseProgressRepository;
    private final ReconciliationRecordRepository reconciliationRepository;

    /**
     * 生成月度对账单
     */
    @Transactional
    public ReconciliationRecord generateMonthlyReconciliation(
        Long organizationId,
        YearMonth month
    ) {
        log.info("生成对账单: 机构={}, 月份={}", organizationId, month);

        // 1. 查询该月所有案件进度
        LocalDateTime startDate = month.atDay(1).atStartOfDay();
        LocalDateTime endDate = month.atEndOfMonth().atTime(23, 59, 59);

        List<CaseProgress> progresses = caseProgressRepository
            .findByOrganizationAndPeriod(
                organizationId,
                startDate,
                endDate
            );

        // 2. 计算回款统计
        ReconciliationSummary summary = calculateSummary(progresses);

        // 3. 计算应结算金额
        BigDecimal settlementAmount = calculateSettlementAmount(
            summary,
            organizationId
        );

        // 4. 生成对账记录
        ReconciliationRecord record = ReconciliationRecord.builder()
            .organizationId(organizationId)
            .month(month)
            .totalCases(summary.getTotalCases())
            .settledCases(summary.getSettledCases())
            .totalRecovery(summary.getTotalRecovery())
            .settlementAmount(settlementAmount)
            .status(ReconciliationStatus.PENDING_REVIEW)
            .generatedAt(LocalDateTime.now())
            .build();

        return reconciliationRepository.save(record);
    }

    /**
     * 计算结算金额
     */
    private BigDecimal calculateSettlementAmount(
        ReconciliationSummary summary,
        Long organizationId
    ) {
        Organization org = organizationRepository.findById(organizationId)
            .orElseThrow();

        // 根据结算方式计算
        String settlementMethod = org.getSettlementMethods().iterator().next();

        switch (settlementMethod) {
            case "FULL_RISK":
                // 全风险: 回款额 * 比例
                return summary.getTotalRecovery()
                    .multiply(new BigDecimal("0.30"));

            case "HALF_RISK":
                // 半风险: 基础服务费 + 回款提成
                BigDecimal baseFee = calculateBaseFee(summary.getTotalCases());
                BigDecimal commission = summary.getTotalRecovery()
                    .multiply(new BigDecimal("0.15"));
                return baseFee.add(commission);

            case "NO_RISK":
                // 无风险: 固定服务费
                return summary.getTotalCases()
                    .multiply(new BigDecimal("50"));  // 每案50元

            default:
                throw new BusinessException("不支持的结算方式");
        }
    }

    /**
     * 确认对账单
     */
    @Transactional
    public void confirmReconciliation(
        Long recordId,
        ReconciliationConfirmRequest request
    ) {
        ReconciliationRecord record = reconciliationRepository
            .findById(recordId)
            .orElseThrow();

        // 双方确认
        if (request.getConfirmedBySource()) {
            record.setSourceOrgConfirmedAt(LocalDateTime.now());
            record.setSourceOrgConfirmedBy(SecurityUtils.getCurrentUserId());
        }

        if (request.getConfirmedByDisposal()) {
            record.setDisposalOrgConfirmedAt(LocalDateTime.now());
            record.setDisposalOrgConfirmedBy(SecurityUtils.getCurrentUserId());
        }

        // 双方都确认后进入待支付状态
        if (record.getSourceOrgConfirmedAt() != null &&
            record.getDisposalOrgConfirmedAt() != null) {
            record.setStatus(ReconciliationStatus.CONFIRMED);
        }

        reconciliationRepository.save(record);
    }

    /**
     * 处理对账差异
     */
    @Transactional
    public DisputeRecord createDispute(
        Long recordId,
        DisputeCreateRequest request
    ) {
        ReconciliationRecord record = reconciliationRepository
            .findById(recordId)
            .orElseThrow();

        // 创建异议记录
        DisputeRecord dispute = DisputeRecord.builder()
            .reconciliationId(recordId)
            .raiseBy(SecurityUtils.getCurrentUserId())
            .raiseByOrg(SecurityUtils.getCurrentOrgId())
            .disputeType(request.getDisputeType())
            .description(request.getDescription())
            .evidenceUrls(request.getEvidenceUrls())
            .status(DisputeStatus.PENDING)
            .createdAt(LocalDateTime.now())
            .build();

        // 对账单进入争议状态
        record.setStatus(ReconciliationStatus.DISPUTED);

        reconciliationRepository.save(record);
        return disputeRepository.save(dispute);
    }
}
```

**Step 2: 对账差异处理流程**

```java
@Service
@RequiredArgsConstructor
public class DisputeResolutionService {

    /**
     * 处理对账异议
     */
    @Transactional
    public void resolveDispute(
        Long disputeId,
        DisputeResolution resolution
    ) {
        DisputeRecord dispute = disputeRepository.findById(disputeId)
            .orElseThrow();

        // 记录处理结果
        dispute.setResolvedBy(SecurityUtils.getCurrentUserId());
        dispute.setResolvedAt(LocalDateTime.now());
        dispute.setResolution(resolution.getDecision());
        dispute.setResolutionRemark(resolution.getRemark());
        dispute.setStatus(DisputeStatus.RESOLVED);

        // 更新对账单
        ReconciliationRecord record = reconciliationRepository
            .findById(dispute.getReconciliationId())
            .orElseThrow();

        if (resolution.isNeedAdjust()) {
            // 调整金额
            record.setSettlementAmount(resolution.getAdjustedAmount());
            record.setAdjustReason(resolution.getAdjustReason());
        }

        record.setStatus(ReconciliationStatus.PENDING_REVIEW);

        disputeRepository.save(dispute);
        reconciliationRepository.save(record);

        // 发送通知
        notificationService.sendDisputeResolutionNotification(dispute, resolution);
    }
}
```

---

#### 2.3 数据报表看板完善

**目标**: 可视化核心指标

**实施计划**:

**Step 1: 后端报表Service**

```java
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    @Cacheable(value = "dashboard", key = "#orgId + '_' + #type")
    public DashboardData getDashboardData(Long orgId, String type) {
        if ("SOURCE".equals(type)) {
            return getSourceOrgDashboard(orgId);
        } else {
            return getDisposalOrgDashboard(orgId);
        }
    }

    /**
     * 案源机构看板
     */
    private DashboardData getSourceOrgDashboard(Long orgId) {
        return DashboardData.builder()
            // 总览指标
            .totalCasePackages(getTotalPackages(orgId))
            .totalCases(getTotalCases(orgId))
            .totalAmount(getTotalAmount(orgId))
            .recoveryAmount(getRecoveryAmount(orgId))
            .recoveryRate(calculateRecoveryRate(orgId))

            // 趋势数据
            .monthlyTrend(getMonthlyTrend(orgId, 12))
            .caseStatusDistribution(getCaseStatusDist(orgId))
            .topDisposalOrgs(getTopDisposalOrgs(orgId, 10))

            // 实时数据
            .recentActivities(getRecentActivities(orgId, 20))
            .pendingApprovals(getPendingApprovals(orgId))
            .build();
    }

    /**
     * 处置机构看板
     */
    private DashboardData getDisposalOrgDashboard(Long orgId) {
        return DashboardData.builder()
            // 业绩指标
            .receivedCases(getReceivedCases(orgId))
            .settledCases(getSettledCases(orgId))
            .settlementRate(calculateSettlementRate(orgId))
            .totalRecovery(getTotalRecovery(orgId))
            .avgProcessingDays(getAvgProcessingDays(orgId))

            // 容量指标
            .currentLoad(getCurrentLoad(orgId))
            .monthlyCapacity(getMonthlyCapacity(orgId))
            .availableCapacity(getAvailableCapacity(orgId))

            // 排名数据
            .performanceRanking(getPerformanceRanking(orgId))
            .regionPerformance(getRegionPerformance(orgId))

            .build();
    }

    /**
     * 月度趋势分析
     */
    private List<MonthlyTrendData> getMonthlyTrend(Long orgId, int months) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(months);

        // 按月聚合数据
        return caseProgressRepository
            .findMonthlyStatistics(orgId, startDate, endDate)
            .stream()
            .map(stat -> MonthlyTrendData.builder()
                .month(stat.getMonth())
                .caseCount(stat.getCaseCount())
                .recoveryAmount(stat.getRecoveryAmount())
                .settlementAmount(stat.getSettlementAmount())
                .build())
            .collect(Collectors.toList());
    }
}
```

**Step 2: 前端图表组件**

```typescript
// 使用@ant-design/plots
import { Column, Line, Pie } from '@ant-design/plots';

// 月度趋势图
export const MonthlyTrendChart: React.FC<Props> = ({ data }) => {
  const config = {
    data,
    xField: 'month',
    yField: 'recoveryAmount',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  return <Line {...config} />;
};

// 案件状态分布饼图
export const CaseStatusChart: React.FC<Props> = ({ data }) => {
  const config = {
    data,
    angleField: 'value',
    colorField: 'status',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  };

  return <Pie {...config} />;
};

// 机构业绩排名柱状图
export const PerformanceRankingChart: React.FC<Props> = ({ data }) => {
  const config = {
    data,
    xField: 'orgName',
    yField: 'recoveryAmount',
    seriesField: 'metric',
    isGroup: true,
    columnStyle: {
      radius: [20, 20, 0, 0],
    },
  };

  return <Column {...config} />;
};
```

---

### 模块3: 性能优化 (Week 3, 优先级: P1)

#### 3.1 数据库优化

**3.1.1 索引优化**

```sql
-- 分析慢查询
SHOW FULL PROCESSLIST;
SELECT * FROM information_schema.PROCESSLIST WHERE TIME > 1;

-- 添加复合索引
ALTER TABLE case_packages
ADD INDEX idx_source_status_created (source_org_id, status, created_at DESC);

ALTER TABLE cases
ADD INDEX idx_package_debtor (case_package_id, debtor_id_card);

ALTER TABLE case_progress
ADD INDEX idx_org_case_created (organization_id, case_id, created_at DESC);

-- 添加全文索引
ALTER TABLE cases
ADD FULLTEXT INDEX idx_fulltext_debtor (customer_name, debtor_phone);
```

**3.1.2 查询优化**

```java
// 使用EntityGraph避免N+1问题
@EntityGraph(attributePaths = {"sourceOrganization", "disposalOrganization", "cases"})
CasePackage findDetailById(Long id);

// 使用DTO投影减少数据传输
@Query("SELECT new com.drmp.dto.CasePackageSummaryDTO(" +
       "cp.id, cp.packageName, cp.caseCount, cp.totalAmount) " +
       "FROM CasePackage cp WHERE cp.sourceOrganization.id = :orgId")
List<CasePackageSummaryDTO> findSummaryByOrg(@Param("orgId") Long orgId);

// 批量查询
@Query("SELECT c FROM Case c WHERE c.id IN :ids")
List<Case> findAllByIds(@Param("ids") List<Long> ids);
```

**3.1.3 分表策略**

```java
// 按月分表 - 案件表
@Entity
@Table(name = "cases")
@PartitionKey("created_at")
public class Case extends BaseEntity {
    // 使用分区键优化查询
}

// 分表路由
@Component
public class CaseTableRouter {

    public String getTableName(LocalDate date) {
        return "cases_" + date.format(DateTimeFormatter.ofPattern("yyyyMM"));
    }

    // 创建新分区
    @Scheduled(cron = "0 0 0 1 * ?")  // 每月1号
    public void createNextMonthPartition() {
        String tableName = getTableName(LocalDate.now().plusMonths(1));
        jdbcTemplate.execute(
            "CREATE TABLE IF NOT EXISTS " + tableName + " LIKE cases"
        );
    }
}
```

---

#### 3.2 缓存优化

**3.2.1 多级缓存架构**

```java
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager(
        RedisConnectionFactory redisConnectionFactory
    ) {
        // L1: Caffeine本地缓存
        CaffeineCacheManager caffeineCacheManager = new CaffeineCacheManager();
        caffeineCacheManager.setCaffeine(Caffeine.newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(5, TimeUnit.MINUTES));

        // L2: Redis分布式缓存
        RedisCacheManager redisCacheManager = RedisCacheManager.builder(
            redisConnectionFactory)
            .cacheDefaults(RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(30)))
            .build();

        // 组合缓存管理器
        return new CompositeCacheManager(
            caffeineCacheManager,
            redisCacheManager
        );
    }
}

// 缓存使用
@Service
public class OrganizationServiceImpl {

    @Cacheable(value = "organizations", key = "#id")
    public Organization findById(Long id) {
        return organizationRepository.findById(id).orElseThrow();
    }

    @CachePut(value = "organizations", key = "#org.id")
    public Organization update(Organization org) {
        return organizationRepository.save(org);
    }

    @CacheEvict(value = "organizations", key = "#id")
    public void delete(Long id) {
        organizationRepository.deleteById(id);
    }

    // 批量删除缓存
    @CacheEvict(value = "organizations", allEntries = true)
    public void clearCache() {
        log.info("清除所有机构缓存");
    }
}
```

**3.2.2 缓存预热**

```java
@Component
@RequiredArgsConstructor
public class CacheWarmer implements ApplicationListener<ApplicationReadyEvent> {

    private final OrganizationService organizationService;
    private final CacheManager cacheManager;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        log.info("开始缓存预热...");

        // 预加载活跃机构
        List<Organization> activeOrgs = organizationService
            .findByStatus(OrganizationStatus.ACTIVE);

        Cache orgCache = cacheManager.getCache("organizations");
        activeOrgs.forEach(org ->
            orgCache.put(org.getId(), org)
        );

        log.info("缓存预热完成，加载{}个机构", activeOrgs.size());
    }
}
```

---

#### 3.3 API性能优化

**3.3.1 异步处理**

```java
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("async-");
        executor.setRejectedExecutionHandler(
            new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}

@Service
public class CaseBatchImportServiceImpl {

    @Async("taskExecutor")
    public CompletableFuture<BatchImportResult> importCases(
        MultipartFile file,
        Long orgId
    ) {
        try {
            // 1. 解析Excel
            List<CaseImportDTO> dtos = parseExcel(file);

            // 2. 数据验证
            List<ImportError> errors = validateCases(dtos);
            if (!errors.isEmpty()) {
                return CompletableFuture.completedFuture(
                    BatchImportResult.fail(errors)
                );
            }

            // 3. 批量保存(每批500条)
            int batchSize = 500;
            int totalCount = dtos.size();
            int successCount = 0;

            for (int i = 0; i < totalCount; i += batchSize) {
                List<CaseImportDTO> batch = dtos.subList(
                    i,
                    Math.min(i + batchSize, totalCount)
                );
                successCount += saveBatch(batch, orgId);

                // 更新进度
                updateProgress(i + batch.size(), totalCount);
            }

            return CompletableFuture.completedFuture(
                BatchImportResult.success(successCount)
            );

        } catch (Exception e) {
            log.error("批量导入失败", e);
            return CompletableFuture.completedFuture(
                BatchImportResult.error(e.getMessage())
            );
        }
    }
}
```

**3.3.2 分页优化**

```java
// 避免深分页问题
@Service
public class CaseServiceImpl {

    // 方式1: 使用游标分页
    public List<Case> findCasesByIdCursor(Long afterId, int limit) {
        return caseRepository.findByIdGreaterThanOrderByIdAsc(afterId,
            PageRequest.of(0, limit));
    }

    // 方式2: 使用覆盖索引
    @Query("SELECT c.id FROM Case c WHERE c.status = :status ORDER BY c.id")
    List<Long> findIdsByStatus(@Param("status") CaseStatus status);

    // 然后分批查询详情
    public List<Case> findByIds(List<Long> ids) {
        return caseRepository.findAllById(ids);
    }
}
```

---

### 模块4: API文档完善 (Week 4, 优先级: P2)

#### 4.1 Swagger注解完善

```java
@RestController
@RequestMapping("/v1/case-packages")
@Tag(name = "案件包管理", description = "案件包的创建、查询、分配等操作")
@RequiredArgsConstructor
public class CasePackageController {

    @PostMapping
    @Operation(summary = "创建案件包", description = "案源机构创建新的案件包")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "创建成功"),
        @ApiResponse(responseCode = "400", description = "参数错误"),
        @ApiResponse(responseCode = "401", description = "未认证"),
        @ApiResponse(responseCode = "403", description = "无权限")
    })
    @PreAuthorize("hasRole('CASE_MANAGER')")
    public ApiResponse<CasePackageResponse> createCasePackage(
        @Valid @RequestBody
        @Parameter(description = "案件包创建请求", required = true)
        CasePackageCreateRequest request
    ) {
        CasePackageResponse response = casePackageService
            .createCasePackage(request);
        return ApiResponse.success(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取案件包详情")
    @Parameters({
        @Parameter(name = "id", description = "案件包ID", required = true, example = "1")
    })
    public ApiResponse<CasePackageDetailResponse> getDetail(
        @PathVariable Long id
    ) {
        return ApiResponse.success(
            casePackageService.getDetail(id)
        );
    }

    @PostMapping("/{id}/assign")
    @Operation(
        summary = "分配案件包",
        description = "将案件包分配给指定的处置机构"
    )
    public ApiResponse<Void> assignCasePackage(
        @PathVariable
        @Parameter(description = "案件包ID")
        Long id,

        @Valid @RequestBody
        @Parameter(description = "分配请求")
        CasePackageAssignRequest request
    ) {
        casePackageService.assign(id, request);
        return ApiResponse.success();
    }
}
```

#### 4.2 生成API文档

```yaml
# application.yml
springdoc:
  api-docs:
    path: /v3/api-docs
    enabled: true
  swagger-ui:
    path: /swagger-ui.html
    enabled: true
    tags-sorter: alpha
    operations-sorter: alpha
    display-request-duration: true
    show-extensions: true
  show-actuator: false
  group-configs:
    - group: 案件管理
      paths-to-match: /v1/case-packages/**, /v1/cases/**
    - group: 机构管理
      paths-to-match: /v1/organizations/**
    - group: 智能分案
      paths-to-match: /v1/smart-assignment/**
```

---

## 📊 实施时间表

### Week 1: 测试框架与Service层测试

| 天 | 任务 | 产出 |
|----|------|------|
| Day 1-2 | 测试框架搭建 | 测试基类、工厂类、配置 |
| Day 3-4 | SmartAssignmentService测试 | 10+测试用例 |
| Day 5 | CasePackageService测试 | 8+测试用例 |

### Week 2: Controller测试与智能分案

| 天 | 任务 | 产出 |
|----|------|------|
| Day 1-2 | Controller集成测试 | 核心API测试 |
| Day 3-4 | 实现分案策略 | 4种策略实现 |
| Day 5 | 策略测试与优化 | 策略单元测试 |

### Week 3: 对账系统与性能优化

| 天 | 任务 | 产出 |
|----|------|------|
| Day 1-2 | 对账流程实现 | 对账生成、确认、争议 |
| Day 3 | 数据库优化 | 索引、查询优化 |
| Day 4 | 缓存优化 | 多级缓存、预热 |
| Day 5 | API性能优化 | 异步、分页优化 |

### Week 4: 报表看板与文档

| 天 | 任务 | 产出 |
|----|------|------|
| Day 1-2 | 报表Service实现 | 看板数据API |
| Day 3 | 前端图表组件 | 5+图表组件 |
| Day 4 | API文档完善 | Swagger注解 |
| Day 5 | 测试与验收 | 完整测试报告 |

---

## ✅ 验收标准

### 1. 测试覆盖率

```bash
# 后端测试覆盖率报告
mvn clean test jacoco:report

# 前端测试覆盖率
npm run test:coverage

# 目标:
# - Service层: ≥ 80%
# - Controller层: ≥ 70%
# - 整体: ≥ 70%
```

### 2. 功能完整性

- [ ] 智能分案4种策略全部实现
- [ ] 对账流程闭环(生成→确认→争议→结算)
- [ ] 报表看板数据完整
- [ ] API文档100%覆盖

### 3. 性能指标

| 指标 | 目标 | 测试方法 |
|------|------|---------|
| API响应时间(P95) | < 500ms | JMeter压测 |
| 批量导入1万案件 | < 30s | 实际测试 |
| 数据库查询 | < 100ms | Explain分析 |
| 缓存命中率 | > 80% | Redis监控 |

### 4. 代码质量

```bash
# SonarQube扫描
mvn sonar:sonar

# 目标:
# - 代码重复率: < 3%
# - 代码规范: A级
# - 安全漏洞: 0个
# - Bug: 0个Critical
```

---

## 🚀 快速开始

### 运行测试

```bash
# 后端单元测试
cd backend
mvn clean test

# 后端集成测试
mvn clean verify

# 前端测试
cd frontend
npm run test

# 前端覆盖率报告
npm run test:coverage
```

### 性能测试

```bash
# JMeter压测脚本
jmeter -n -t performance-test.jmx -l result.jtl

# 查看报告
jmeter -g result.jtl -o report/
```

---

## 📞 支持与协作

**开发规范**:
- 测试先行(TDD)
- 代码审查(Code Review)
- 持续集成(CI)

**文档更新**:
- API变更及时更新Swagger
- 重要功能补充使用文档
- 性能优化记录到Wiki

**问题反馈**:
- Bug提issue到GitHub
- 功能讨论到项目群
- 紧急问题直接联系负责人

---

**下一阶段**: Phase 3 - 生产部署准备

**文档版本**: v1.0
**最后更新**: 2024年10月1日
