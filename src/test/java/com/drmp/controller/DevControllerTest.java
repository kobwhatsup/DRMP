package com.drmp.controller;

import com.drmp.config.BaseControllerTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.test.context.support.WithMockUser;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("DevController 测试")
class DevControllerTest extends BaseControllerTest {

    @Test
    @DisplayName("health - 应返回健康状态")
    @WithMockUser
    void health_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/dev/health"))
            .andExpect(status().isOk());
    }
}
