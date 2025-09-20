package com.drmp.controller;

import com.drmp.common.ApiResponse;
import com.drmp.dto.ids.IdsConfiguration;
import com.drmp.dto.ids.IdsConnectionStatus;
import com.drmp.dto.ids.IdsPushDataDTO;
import com.drmp.entity.Cases;
import com.drmp.entity.Organization;
import com.drmp.service.CaseService;
import com.drmp.service.OrganizationService;
import com.drmp.service.ids.IdsConfigurationService;
import com.drmp.service.ids.IdsIntegrationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@WebMvcTest(IdsController.class)
class IdsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IdsIntegrationService idsIntegrationService;

    @MockBean
    private IdsConfigurationService configurationService;

    @MockBean
    private CaseService caseService;

    @MockBean
    private OrganizationService organizationService;

    private IdsConfiguration testConfiguration;
    private Organization testOrganization;

    @BeforeEach
    void setUp() {
        // 创建测试配置
        testConfiguration = new IdsConfiguration();
        testConfiguration.setOrganizationId(100L);
        testConfiguration.setApiEndpoint("https://test-ids.example.com/api");
        testConfiguration.setApiToken("test-token");
        testConfiguration.setSecretKey("test-secret");
        testConfiguration.setEnabled(true);

        // 创建测试机构
        testOrganization = new Organization();
        testOrganization.setId(100L);
        testOrganization.setName("测试机构");
        testOrganization.setType("DISPOSAL");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testConfigureIds_Success() throws Exception {
        // Arrange
        IdsConfigurationService.IdsConnectionTestResult testResult = 
                new IdsConfigurationService.IdsConnectionTestResult(true, "连接成功", 200L);
        
        when(configurationService.testConnection(any(IdsConfiguration.class))).thenReturn(testResult);
        when(configurationService.saveConfiguration(eq(100L), any(IdsConfiguration.class))).thenReturn(true);

        // Act & Assert
        mockMvc.perform(post("/v1/ids/config/100")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testConfiguration)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("IDS配置保存成功"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testConfigureIds_ConnectionTestFailed() throws Exception {
        // Arrange
        IdsConfigurationService.IdsConnectionTestResult testResult = 
                new IdsConfigurationService.IdsConnectionTestResult(false, "连接失败", 5000L);
        
        when(configurationService.testConnection(any(IdsConfiguration.class))).thenReturn(testResult);

        // Act & Assert
        mockMvc.perform(post("/v1/ids/config/100")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testConfiguration)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("IDS连接测试失败: 连接失败"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetIdsConfiguration_Success() throws Exception {
        // Arrange
        when(configurationService.getConfiguration(100L)).thenReturn(testConfiguration);

        // Act & Assert
        mockMvc.perform(get("/v1/ids/config/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.organizationId").value(100))
                .andExpect(jsonPath("$.data.apiToken").value("****")) // 敏感信息已隐藏
                .andExpect(jsonPath("$.data.secretKey").value("****"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetIdsConfiguration_NotFound() throws Exception {
        // Arrange
        when(configurationService.getConfiguration(100L)).thenReturn(null);

        // Act & Assert
        mockMvc.perform(get("/v1/ids/config/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isEmpty());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testTestConnection_Success() throws Exception {
        // Arrange
        IdsConfigurationService.IdsConnectionTestResult testResult = 
                new IdsConfigurationService.IdsConnectionTestResult(true, "连接成功", 150L);
        
        when(configurationService.testConnection(any(IdsConfiguration.class))).thenReturn(testResult);

        // Act & Assert
        mockMvc.perform(post("/v1/ids/test-connection")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testConfiguration)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.success").value(true))
                .andExpect(jsonPath("$.data.message").value("连接成功"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetConnectionStatus() throws Exception {
        // Arrange
        IdsConnectionStatus status = new IdsConnectionStatus();
        status.setOrganizationId(100L);
        status.setConnected(true);
        status.setLastCheckTime(LocalDateTime.now());
        status.setMessage("连接正常");

        when(idsIntegrationService.getConnectionStatus(100L)).thenReturn(status);

        // Act & Assert
        mockMvc.perform(get("/v1/ids/status/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.organizationId").value(100))
                .andExpected(jsonPath("$.data.connected").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testSyncCases_Success() throws Exception {
        // Arrange
        when(organizationService.findById(100L)).thenReturn(testOrganization);
        when(caseService.findByIds(Arrays.asList(1L, 2L))).thenReturn(Arrays.asList(new Cases(), new Cases()));
        when(idsIntegrationService.syncCasesToIds(any(), any())).thenReturn(null); // CompletableFuture模拟

        // Act & Assert
        mockMvc.perform(post("/v1/ids/sync-cases/100")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("[1, 2]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpected(jsonPath("$.message").value("同步任务已启动"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testSyncCases_OrganizationNotFound() throws Exception {
        // Arrange
        when(organizationService.findById(100L)).thenReturn(null);

        // Act & Assert
        mockMvc.perform(post("/v1/ids/sync-cases/100")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("[1, 2]"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpected(jsonPath("$.message").value("机构不存在"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testSyncCases_NoCasesFound() throws Exception {
        // Arrange
        when(organizationService.findById(100L)).thenReturn(testOrganization);
        when(caseService.findByIds(Arrays.asList(1L, 2L))).thenReturn(Arrays.asList()); // 空列表

        // Act & Assert
        mockMvc.perform(post("/v1/ids/sync-cases/100")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("[1, 2]"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpected(jsonPath("$.message").value("未找到有效案件"));
    }

    @Test
    void testReceiveIdsPushData_Success() throws Exception {
        // Arrange
        IdsPushDataDTO pushData = new IdsPushDataDTO();
        pushData.setDataType("CASE_PROGRESS");
        pushData.setSourceSystem("IDS");
        pushData.setTimestamp(LocalDateTime.now());
        pushData.setData(new HashMap<>());

        when(idsIntegrationService.processIdsPushData(any(IdsPushDataDTO.class), eq(100L)))
                .thenReturn(new IdsDataProcessResult(true, "数据处理成功"));

        // Act & Assert
        mockMvc.perform(post("/v1/ids/webhook/100")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(pushData)))
                .andExpect(status().isOk())
                .andExpected(jsonPath("$.success").value(true))
                .andExpected(jsonPath("$.message").value("数据处理成功"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetIdsEnabledOrganizations() throws Exception {
        // Arrange
        when(configurationService.getIdsEnabledOrganizations())
                .thenReturn(Arrays.asList(testOrganization));

        // Act & Assert
        mockMvc.perform(get("/v1/ids/enabled-organizations"))
                .andExpect(status().isOk())
                .andExpected(jsonPath("$.success").value(true))
                .andExpected(jsonPath("$.data").isArray())
                .andExpected(jsonPath("$.data[0].id").value(100));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testBatchConfigureIds_Success() throws Exception {
        // Arrange
        Map<Long, IdsConfiguration> configurations = new HashMap<>();
        configurations.put(100L, testConfiguration);
        configurations.put(101L, testConfiguration);

        Map<Long, Boolean> results = new HashMap<>();
        results.put(100L, true);
        results.put(101L, false);

        when(configurationService.batchUpdateConfigurations(any())).thenReturn(results);

        // Act & Assert
        mockMvc.perform(post("/v1/ids/batch-config")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(configurations)))
                .andExpect(status().isOk())
                .andExpected(jsonPath("$.success").value(true))
                .andExpected(jsonPath("$.data.100").value(true))
                .andExpected(jsonPath("$.data.101").value(false));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDisableIdsConfiguration_Success() throws Exception {
        // Arrange
        when(configurationService.disableConfiguration(100L)).thenReturn(true);

        // Act & Assert
        mockMvc.perform(post("/v1/ids/disable/100")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpected(jsonPath("$.success").value(true))
                .andExpected(jsonPath("$.message").value("IDS配置已禁用"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDisableIdsConfiguration_Failed() throws Exception {
        // Arrange
        when(configurationService.disableConfiguration(100L)).thenReturn(false);

        // Act & Assert
        mockMvc.perform(post("/v1/ids/disable/100")
                .with(csrf()))
                .andExpect(status().isInternalServerError())
                .andExpected(jsonPath("$.success").value(false))
                .andExpected(jsonPath("$.message").value("禁用IDS配置失败"));
    }

    @Test
    void testUnauthorizedAccess() throws Exception {
        // Act & Assert - 未认证用户访问需要权限的接口
        mockMvc.perform(get("/v1/ids/config/100"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER") // 普通用户角色
    void testInsufficientPermissions() throws Exception {
        // Act & Assert - 普通用户访问管理员接口
        mockMvc.perform(get("/v1/ids/enabled-organizations"))
                .andExpect(status().isForbidden());
    }
}