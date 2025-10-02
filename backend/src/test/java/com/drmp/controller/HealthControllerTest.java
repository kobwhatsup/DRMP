package com.drmp.controller;

import com.drmp.config.BaseControllerTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("HealthController 测试")
class HealthControllerTest extends BaseControllerTest {

    @Test
    @DisplayName("health - 应返回健康状态")
    void health_ShouldReturnHealthStatus() throws Exception {
        mockMvc.perform(get("/api/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.status").value("UP"))
            .andExpect(jsonPath("$.data.application").value("DRMP Platform"))
            .andExpect(jsonPath("$.data.version").value("1.0.0-SNAPSHOT"))
            .andExpect(jsonPath("$.message").value("Service is healthy"));
    }

    @Test
    @DisplayName("health - 应包含时间戳")
    void health_ShouldIncludeTimestamp() throws Exception {
        mockMvc.perform(get("/api/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.timestamp").exists());
    }
}
