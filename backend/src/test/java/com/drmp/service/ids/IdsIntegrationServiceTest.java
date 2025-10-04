package com.drmp.service.ids;

import com.drmp.dto.ids.*;
import com.drmp.entity.Cases;
import com.drmp.entity.Organization;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IdsIntegrationServiceTest {

    @Mock
    private IdsConfigurationService configurationService;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private IdsIntegrationService idsIntegrationService;

    private IdsConfiguration testConfig;
    private Cases testCase;
    private Organization testOrg;

    @BeforeEach
    void setUp() {
        // 设置Redis操作模拟
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        // 创建测试IDS配置
        testConfig = new IdsConfiguration();
        testConfig.setOrganizationId(100L);
        testConfig.setApiEndpoint("https://test-ids.example.com/api");
        testConfig.setApiToken("test-token");
        testConfig.setSecretKey("test-secret");
        testConfig.setEnabled(true);

        // 创建测试案件
        testCase = new Cases();
        testCase.setId(1L);
        testCase.setCaseNumber("CASE001");
        testCase.setDebtorName("张三");
        testCase.setDebtorIdCard("110101199001011234");
        testCase.setLoanAmount(new BigDecimal("10000.00"));
        testCase.setRemainingAmount(new BigDecimal("8000.00"));
        testCase.setOverdueDays(90);
        testCase.setCreatedAt(LocalDateTime.now());

        // 创建测试机构
        testOrg = new Organization();
        testOrg.setId(100L);
        testOrg.setName("测试处置机构");
        testOrg.setType("DISPOSAL");
    }

    @Test
    void testSyncCasesToIds_Success() throws Exception {
        // Arrange
        List<Cases> cases = Arrays.asList(testCase);
        
        when(configurationService.getConfiguration(100L)).thenReturn(testConfig);
        
        // 模拟HTTP请求成功
        IdsApiResponse<String> mockResponse = new IdsApiResponse<>();
        mockResponse.setCode(200);
        mockResponse.setMessage("同步成功");
        mockResponse.setData("sync-task-id");
        mockResponse.setSuccess(true);
        
        when(restTemplate.postForObject(anyString(), any(), eq(IdsApiResponse.class)))
                .thenReturn(mockResponse);

        // Act
        CompletableFuture<IdsSyncResult> result = idsIntegrationService.syncCasesToIds(cases, testOrg);
        IdsSyncResult syncResult = result.get();

        // Assert
        assertTrue(syncResult.isSuccess());
        assertEquals(1, syncResult.getTotalCount());
        assertEquals(1, syncResult.getSuccessCount());
        assertEquals(0, syncResult.getFailedCount());
        assertNotNull(syncResult.getSyncId());
    }

    @Test
    void testSyncCasesToIds_ConfigurationNotFound() throws Exception {
        // Arrange
        List<Cases> cases = Arrays.asList(testCase);
        
        when(configurationService.getConfiguration(100L)).thenReturn(null);

        // Act
        CompletableFuture<IdsSyncResult> result = idsIntegrationService.syncCasesToIds(cases, testOrg);
        IdsSyncResult syncResult = result.get();

        // Assert
        assertFalse(syncResult.isSuccess());
        assertEquals("IDS配置未找到", syncResult.getMessage());
    }

    @Test
    void testSyncCasesToIds_ConfigurationDisabled() throws Exception {
        // Arrange
        List<Cases> cases = Arrays.asList(testCase);
        testConfig.setEnabled(false);
        
        when(configurationService.getConfiguration(100L)).thenReturn(testConfig);

        // Act
        CompletableFuture<IdsSyncResult> result = idsIntegrationService.syncCasesToIds(cases, testOrg);
        IdsSyncResult syncResult = result.get();

        // Assert
        assertFalse(syncResult.isSuccess());
        assertEquals("IDS集成未启用", syncResult.getMessage());
    }

    @Test
    void testSyncCasesToIds_HttpRequestFailed() throws Exception {
        // Arrange
        List<Cases> cases = Arrays.asList(testCase);
        
        when(configurationService.getConfiguration(100L)).thenReturn(testConfig);
        when(restTemplate.postForObject(anyString(), any(), eq(IdsApiResponse.class)))
                .thenThrow(new RuntimeException("网络错误"));

        // Act
        CompletableFuture<IdsSyncResult> result = idsIntegrationService.syncCasesToIds(cases, testOrg);
        IdsSyncResult syncResult = result.get();

        // Assert
        assertFalse(syncResult.isSuccess());
        assertTrue(syncResult.getMessage().contains("同步失败"));
    }

    @Test
    void testGetConnectionStatus_Connected() {
        // Arrange
        when(configurationService.getConfiguration(100L)).thenReturn(testConfig);
        
        IdsConnectionStatus cachedStatus = new IdsConnectionStatus();
        cachedStatus.setOrganizationId(100L);
        cachedStatus.setConnected(true);
        cachedStatus.setLastCheckTime(LocalDateTime.now());
        
        when(valueOperations.get("ids:connection:status:100")).thenReturn(cachedStatus);

        // Act
        IdsConnectionStatus status = idsIntegrationService.getConnectionStatus(100L);

        // Assert
        assertNotNull(status);
        assertTrue(status.isConnected());
        assertEquals(100L, status.getOrganizationId());
    }

    @Test
    void testGetConnectionStatus_NotConfigured() {
        // Arrange
        when(configurationService.getConfiguration(100L)).thenReturn(null);

        // Act
        IdsConnectionStatus status = idsIntegrationService.getConnectionStatus(100L);

        // Assert
        assertNotNull(status);
        assertFalse(status.isConnected());
        assertEquals("IDS未配置", status.getMessage());
    }

    @Test
    void testProcessIdsPushData_ValidData() {
        // Arrange
        IdsPushDataDTO pushData = new IdsPushDataDTO();
        pushData.setDataType("CASE_PROGRESS");
        pushData.setSourceSystem("IDS");
        pushData.setTimestamp(LocalDateTime.now());
        pushData.setData(new Object()); // 模拟数据

        // Act
        IdsDataProcessResult result = idsIntegrationService.processIdsPushData(pushData, 100L);

        // Assert
        assertTrue(result.isSuccess());
        assertEquals("数据处理成功", result.getMessage());
    }

    @Test
    void testProcessIdsPushData_InvalidData() {
        // Arrange
        IdsPushDataDTO pushData = new IdsPushDataDTO();
        pushData.setDataType(null); // 无效数据类型

        // Act
        IdsDataProcessResult result = idsIntegrationService.processIdsPushData(pushData, 100L);

        // Assert
        assertFalse(result.isSuccess());
        assertEquals("无效的推送数据", result.getMessage());
    }

    @Test
    void testUpdateSyncProgress_Success() {
        // Arrange
        String syncId = "test-sync-id";
        int progress = 50;

        // Act
        idsIntegrationService.updateSyncProgress(syncId, progress, "处理中...");

        // Assert
        // 验证缓存更新
        verify(valueOperations).set(
                eq("ids:sync:progress:" + syncId), 
                argThat(arg -> {
                    if (arg instanceof IdsSyncProgress) {
                        IdsSyncProgress p = (IdsSyncProgress) arg;
                        return p.getProgress() == 50 && "处理中...".equals(p.getMessage());
                    }
                    return false;
                }),
                anyLong(),
                any()
        );
    }

    @Test
    void testGetSyncProgress_Exists() {
        // Arrange
        String syncId = "test-sync-id";
        IdsSyncProgress mockProgress = new IdsSyncProgress();
        mockProgress.setSyncId(syncId);
        mockProgress.setProgress(75);
        mockProgress.setMessage("处理中...");
        
        when(valueOperations.get("ids:sync:progress:" + syncId)).thenReturn(mockProgress);

        // Act
        IdsSyncProgress progress = idsIntegrationService.getSyncProgress(syncId);

        // Assert
        assertNotNull(progress);
        assertEquals(75, progress.getProgress());
        assertEquals("处理中...", progress.getMessage());
    }

    @Test
    void testGetSyncProgress_NotExists() {
        // Arrange
        String syncId = "non-existing-sync-id";
        when(valueOperations.get("ids:sync:progress:" + syncId)).thenReturn(null);

        // Act
        IdsSyncProgress progress = idsIntegrationService.getSyncProgress(syncId);

        // Assert
        assertNull(progress);
    }

    @Test
    void testValidateConnection_Success() {
        // Arrange
        when(configurationService.testConnection(testConfig))
                .thenReturn(new IdsConfigurationService.IdsConnectionTestResult(true, "连接成功", 200L));

        // Act
        boolean isValid = idsIntegrationService.validateConnection(testConfig);

        // Assert
        assertTrue(isValid);
    }

    @Test
    void testValidateConnection_Failed() {
        // Arrange
        when(configurationService.testConnection(testConfig))
                .thenReturn(new IdsConfigurationService.IdsConnectionTestResult(false, "连接失败", 5000L));

        // Act
        boolean isValid = idsIntegrationService.validateConnection(testConfig);

        // Assert
        assertFalse(isValid);
    }

    @Test
    void testBuildApiRequest() {
        // Arrange
        List<Cases> cases = Arrays.asList(testCase);

        // Act
        IdsApiRequest request = idsIntegrationService.buildApiRequest(cases, testOrg, testConfig);

        // Assert
        assertNotNull(request);
        assertEquals(testConfig.getApiToken(), request.getApiToken());
        assertEquals(testOrg.getId(), request.getOrganizationId());
        assertNotNull(request.getData());
        assertNotNull(request.getTimestamp());
        assertNotNull(request.getSignature());
    }

    @Test
    void testGenerateSignature() {
        // Arrange
        String data = "test-data";
        String secretKey = "test-secret";

        // Act
        String signature1 = idsIntegrationService.generateSignature(data, secretKey);
        String signature2 = idsIntegrationService.generateSignature(data, secretKey);

        // Assert
        assertNotNull(signature1);
        assertNotNull(signature2);
        assertEquals(signature1, signature2); // 相同输入应产生相同签名
        assertEquals(64, signature1.length()); // SHA-256十六进制长度
    }
}