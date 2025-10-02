package com.drmp.controller.system;

import com.drmp.config.BaseControllerTest;
import com.drmp.dto.request.system.ConfigCreateRequest;
import com.drmp.dto.request.system.ConfigQueryRequest;
import com.drmp.dto.request.system.ConfigUpdateRequest;
import com.drmp.dto.response.system.ConfigResponse;
import com.drmp.entity.system.SysConfig;
import com.drmp.service.system.ConfigService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("ConfigController 测试")
class ConfigControllerTest extends BaseControllerTest {

    @MockBean
    private ConfigService configService;

    private ConfigResponse testConfig;
    private Page<ConfigResponse> testPage;

    @BeforeEach
    public void setUp() {
        super.setUp();
        testConfig = new ConfigResponse();
        testConfig.setId(1L);
        testConfig.setConfigKey("system.name");
        testConfig.setConfigValue("DRMP Platform");
        testConfig.setConfigGroup("system");

        testPage = new PageImpl<>(Arrays.asList(testConfig));
    }

    @Test
    @DisplayName("getConfigs - 应成功分页查询配置")
    @WithMockUser
    void getConfigs_ShouldReturnConfigPage() throws Exception {
        when(configService.findConfigs(any())).thenReturn(testPage);

        mockMvc.perform(get("/system/configs"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content[0].id").value(1));

        verify(configService).findConfigs(any());
    }

    @Test
    @DisplayName("getConfigById - 应成功获取配置详情")
    @WithMockUser
    void getConfigById_ShouldReturnConfig() throws Exception {
        when(configService.getConfigById(1L)).thenReturn(testConfig);

        mockMvc.perform(get("/system/configs/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.configKey").value("system.name"));
    }

    @Test
    @DisplayName("getConfigByKey - 应根据键获取配置")
    @WithMockUser
    void getConfigByKey_ShouldReturnConfig() throws Exception {
        when(configService.getConfigByKey("system.name")).thenReturn(testConfig);

        mockMvc.perform(get("/system/configs/key/system.name"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.configValue").value("DRMP Platform"));
    }

    @Test
    @DisplayName("createConfig - 应成功创建配置")
    @WithMockUser
    void createConfig_ShouldCreateSuccessfully() throws Exception {
        ConfigCreateRequest request = new ConfigCreateRequest();
        request.setConfigKey("test.key");
        request.setConfigName("测试配置");
        request.setConfigValue("test value");
        request.setConfigGroup("test");
        request.setValueType(SysConfig.ValueType.STRING);

        when(configService.createConfig(any())).thenReturn(testConfig);

        mockMvc.perform(post("/system/configs")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    @DisplayName("updateConfig - 应成功更新配置")
    @WithMockUser
    void updateConfig_ShouldUpdateSuccessfully() throws Exception {
        ConfigUpdateRequest request = new ConfigUpdateRequest();
        request.setConfigValue("new value");
        request.setConfigName("测试配置");
        request.setValueType(SysConfig.ValueType.STRING);

        when(configService.updateConfig(eq(1L), any())).thenReturn(testConfig);

        mockMvc.perform(put("/system/configs/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk());

        verify(configService).updateConfig(eq(1L), any());
    }

    @Test
    @DisplayName("deleteConfig - 应成功删除配置")
    @WithMockUser
    void deleteConfig_ShouldDeleteSuccessfully() throws Exception {
        mockMvc.perform(delete("/system/configs/1")
                .with(csrf()))
            .andExpect(status().isOk());

        verify(configService).deleteConfig(1L);
    }

    @Test
    @DisplayName("deleteConfigs - 应成功批量删除配置")
    @WithMockUser
    void deleteConfigs_ShouldBatchDeleteSuccessfully() throws Exception {
        List<Long> ids = Arrays.asList(1L, 2L, 3L);

        mockMvc.perform(delete("/system/configs/batch")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(ids)))
            .andExpect(status().isOk());

        verify(configService).deleteConfigs(anyList());
    }

    @Test
    @DisplayName("getConfigsByGroup - 应根据组获取配置列表")
    @WithMockUser
    void getConfigsByGroup_ShouldReturnConfigs() throws Exception {
        when(configService.getConfigsByGroup("system")).thenReturn(Arrays.asList(testConfig));

        mockMvc.perform(get("/system/configs/group/system"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].configGroup").value("system"));
    }

    @Test
    @DisplayName("getAllConfigGroups - 应成功获取所有配置组")
    @WithMockUser
    void getAllConfigGroups_ShouldReturnGroups() throws Exception {
        when(configService.getAllConfigGroups()).thenReturn(Arrays.asList("system", "business", "security"));

        mockMvc.perform(get("/system/configs/groups"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.length()").value(3));
    }

    @Test
    @DisplayName("getConfigGroupStatistics - 应成功获取配置组统计")
    @WithMockUser
    void getConfigGroupStatistics_ShouldReturnStatistics() throws Exception {
        Map<String, Long> stats = new HashMap<>();
        stats.put("system", 10L);
        stats.put("business", 5L);

        when(configService.getConfigGroupStatistics()).thenReturn(stats);

        mockMvc.perform(get("/system/configs/groups/statistics"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.system").value(10));
    }

    @Test
    @DisplayName("existsByConfigKey - 应检查配置键是否存在")
    @WithMockUser
    void existsByConfigKey_ShouldReturnTrue() throws Exception {
        when(configService.existsByConfigKey("system.name")).thenReturn(true);

        mockMvc.perform(get("/system/configs/exists/system.name"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data").value(true));
    }

    @Test
    @DisplayName("updateConfigValue - 应成功更新配置值")
    @WithMockUser
    void updateConfigValue_ShouldUpdateSuccessfully() throws Exception {
        mockMvc.perform(put("/system/configs/value/system.name")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("\"New Platform Name\""))
            .andExpect(status().isOk());

        verify(configService).updateConfigValue(eq("system.name"), anyString());
    }

    @Test
    @DisplayName("batchUpdateConfigs - 应成功批量更新配置")
    @WithMockUser
    void batchUpdateConfigs_ShouldUpdateSuccessfully() throws Exception {
        Map<String, String> configs = new HashMap<>();
        configs.put("key1", "value1");
        configs.put("key2", "value2");

        mockMvc.perform(put("/system/configs/batch")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(configs)))
            .andExpect(status().isOk());

        verify(configService).batchUpdateConfigs(anyMap());
    }

    @Test
    @DisplayName("getSystemConfigs - 应成功获取系统配置")
    @WithMockUser
    void getSystemConfigs_ShouldReturnConfigs() throws Exception {
        when(configService.getSystemConfigs()).thenReturn(Arrays.asList(testConfig));

        mockMvc.perform(get("/system/configs/system"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].configKey").value("system.name"));
    }

    @Test
    @DisplayName("refreshCache - 应成功刷新配置缓存")
    @WithMockUser
    void refreshCache_ShouldRefreshSuccessfully() throws Exception {
        mockMvc.perform(post("/system/configs/refresh-cache")
                .with(csrf()))
            .andExpect(status().isOk());

        verify(configService).refreshCache();
    }
}
