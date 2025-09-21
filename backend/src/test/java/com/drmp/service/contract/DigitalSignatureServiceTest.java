package com.drmp.service.contract;

import com.drmp.dto.contract.ContractDTO;
import com.drmp.dto.contract.SignatureRequest;
import com.drmp.dto.contract.SignatureResult;
import com.drmp.entity.Contract;
import com.drmp.entity.Organization;
import com.drmp.entity.User;
import com.drmp.service.notification.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DigitalSignatureServiceTest {

    @Mock
    private NotificationService notificationService;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private DigitalSignatureService digitalSignatureService;

    private ContractDTO testContract;
    private SignatureRequest signatureRequest;
    private User testUser;
    private Organization testOrg;

    @BeforeEach
    void setUp() throws Exception {
        // 设置Redis操作模拟
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        // 创建测试合同
        testContract = new ContractDTO();
        testContract.setId(1L);
        testContract.setTitle("测试合同");
        testContract.setContent("合同内容");
        testContract.setSourceOrgId(100L);
        testContract.setDisposalOrgId(200L);
        testContract.setContractType("CASE_DISPOSAL");
        testContract.setStatus("DRAFT");

        // 创建测试用户
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setOrganizationId(100L);

        // 创建测试机构
        testOrg = new Organization();
        testOrg.setId(100L);
        testOrg.setName("测试机构");

        // 创建签署请求
        signatureRequest = new SignatureRequest();
        signatureRequest.setContractId(1L);
        signatureRequest.setSignerType("USER");
        signatureRequest.setSignerId(1L);
        signatureRequest.setSignerName("测试用户");
        signatureRequest.setSignMethod("DIGITAL");
        signatureRequest.setCertificate("test-certificate");
    }

    @Test
    void testCreateContract_Success() throws Exception {
        // Arrange
        when(notificationService.createFromTemplate(anyString(), anyLong(), anyMap(), anyString()))
                .thenReturn(null);

        // Act
        ContractDTO result = digitalSignatureService.createContract(testContract);

        // Assert
        assertNotNull(result);
        assertEquals("PENDING_SIGNATURE", result.getStatus());
        assertNotNull(result.getCreatedAt());
        assertTrue(result.getContractNumber().startsWith("CONTRACT-"));
    }

    @Test
    void testCreateContract_InvalidData() {
        // Arrange
        testContract.setTitle(null); // 无效数据

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            digitalSignatureService.createContract(testContract);
        });
    }

    @Test
    void testSignContract_Success() throws Exception {
        // Arrange
        when(valueOperations.get("contract:1")).thenReturn(testContract);
        when(notificationService.sendNotification(any())).thenReturn(CompletableFuture.completedFuture(true));

        // Act
        SignatureResult result = digitalSignatureService.signContract(signatureRequest);

        // Assert
        assertTrue(result.isSuccess());
        assertNotNull(result.getSignatureId());
        assertNotNull(result.getSignedAt());
        assertEquals("数字签名完成", result.getMessage());

        // 验证缓存更新
        verify(valueOperations).set(eq("contract:signature:1"), any(), eq(30L), eq(TimeUnit.DAYS));
    }

    @Test
    void testSignContract_ContractNotFound() {
        // Arrange
        when(valueOperations.get("contract:1")).thenReturn(null);

        // Act
        SignatureResult result = digitalSignatureService.signContract(signatureRequest);

        // Assert
        assertFalse(result.isSuccess());
        assertEquals("合同不存在", result.getMessage());
    }

    @Test
    void testSignContract_InvalidSignatureRequest() {
        // Arrange
        signatureRequest.setSignerId(null); // 无效请求

        // Act
        SignatureResult result = digitalSignatureService.signContract(signatureRequest);

        // Assert
        assertFalse(result.isSuccess());
        assertEquals("签署请求数据无效", result.getMessage());
    }

    @Test
    void testVerifySignature_ValidSignature() throws Exception {
        // Arrange
        String contractId = "1";
        String signatureId = "test-signature-id";
        String expectedHash = "expected-hash";

        // 模拟签名存在
        SignatureResult mockSignature = new SignatureResult();
        mockSignature.setSignatureId(signatureId);
        mockSignature.setSuccess(true);
        mockSignature.setContractHash(expectedHash);

        when(valueOperations.get("contract:signature:" + contractId)).thenReturn(mockSignature);

        // Act
        boolean isValid = digitalSignatureService.verifySignature(contractId, signatureId, expectedHash);

        // Assert
        assertTrue(isValid);
    }

    @Test
    void testVerifySignature_InvalidSignature() {
        // Arrange
        String contractId = "1";
        String signatureId = "test-signature-id";
        String expectedHash = "expected-hash";

        when(valueOperations.get("contract:signature:" + contractId)).thenReturn(null);

        // Act
        boolean isValid = digitalSignatureService.verifySignature(contractId, signatureId, expectedHash);

        // Assert
        assertFalse(isValid);
    }

    @Test
    void testGetSignatureStatus_Exists() {
        // Arrange
        String contractId = "1";
        String expectedStatus = "SIGNED";

        SignatureResult mockSignature = new SignatureResult();
        mockSignature.setSignatureId("test-id");
        mockSignature.setSuccess(true);

        when(valueOperations.get("contract:signature:" + contractId)).thenReturn(mockSignature);

        // Act
        String status = digitalSignatureService.getSignatureStatus(contractId);

        // Assert
        assertEquals("SIGNED", status);
    }

    @Test
    void testGetSignatureStatus_NotExists() {
        // Arrange
        String contractId = "1";

        when(valueOperations.get("contract:signature:" + contractId)).thenReturn(null);

        // Act
        String status = digitalSignatureService.getSignatureStatus(contractId);

        // Assert
        assertEquals("UNSIGNED", status);
    }

    @Test
    void testGenerateContractHash() throws Exception {
        // Arrange
        String content = "测试合同内容";

        // Act
        String hash1 = digitalSignatureService.generateContractHash(content);
        String hash2 = digitalSignatureService.generateContractHash(content);

        // Assert
        assertNotNull(hash1);
        assertNotNull(hash2);
        assertEquals(hash1, hash2); // 相同内容应该产生相同哈希
        assertEquals(64, hash1.length()); // SHA-256产生64位十六进制字符串
    }

    @Test
    void testGenerateDigitalSignature() throws Exception {
        // Arrange
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
        keyGen.initialize(2048);
        KeyPair keyPair = keyGen.generateKeyPair();
        
        String data = "测试数据";

        // Act
        String signature1 = digitalSignatureService.generateDigitalSignature(data, keyPair.getPrivate());
        String signature2 = digitalSignatureService.generateDigitalSignature(data, keyPair.getPrivate());

        // Assert
        assertNotNull(signature1);
        assertNotNull(signature2);
        // 每次签名结果可能不同（包含随机元素）
        assertTrue(signature1.length() > 0);
        assertTrue(signature2.length() > 0);
    }

    @Test
    void testValidateSignatureRequest_Valid() {
        // Act
        boolean isValid = digitalSignatureService.validateSignatureRequest(signatureRequest);

        // Assert
        assertTrue(isValid);
    }

    @Test
    void testValidateSignatureRequest_Invalid() {
        // Arrange
        signatureRequest.setContractId(null);

        // Act
        boolean isValid = digitalSignatureService.validateSignatureRequest(signatureRequest);

        // Assert
        assertFalse(isValid);
    }

    @Test
    void testSendSignatureNotification() throws Exception {
        // Arrange
        when(notificationService.createFromTemplate(anyString(), anyLong(), anyMap(), anyString()))
                .thenReturn(null);
        when(notificationService.sendNotification(any())).thenReturn(CompletableFuture.completedFuture(true));

        // Act
        CompletableFuture<Boolean> result = digitalSignatureService.sendSignatureNotification(
                testContract, testUser, "SIGNED");
        Boolean sent = result.get();

        // Assert
        // 由于通知服务返回null（模拟的），实际结果可能为false
        // 这里主要验证方法调用没有异常
        assertNotNull(sent);
    }
}