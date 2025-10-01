package com.drmp.controller.system;

import com.drmp.auth.UnifiedAuthenticationManager;
import com.drmp.config.BaseControllerTest;
import com.drmp.gateway.ApiGatewayMetrics;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("GatewayManagementController 测试")
class GatewayManagementControllerTest extends BaseControllerTest {

    @MockBean
    private ApiGatewayMetrics gatewayMetrics;

    @MockBean
    private UnifiedAuthenticationManager authManager;

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    @DisplayName("GET /v1/system/gateway/status - 获取网关状态")
    void getGatewayStatus_ShouldReturnStatus() throws Exception {
        when(gatewayMetrics.getStats()).thenReturn(mock(ApiGatewayMetrics.GatewayStats.class));
        mockMvc.perform(get("/v1/system/gateway/status"))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    @DisplayName("GET /v1/system/gateway/status - 无权限返回403")
    void getGatewayStatus_ShouldReturn403_WhenUnauthorized() throws Exception {
        mockMvc.perform(get("/v1/system/gateway/status"))
            .andExpect(status().isForbidden());
    }
}
