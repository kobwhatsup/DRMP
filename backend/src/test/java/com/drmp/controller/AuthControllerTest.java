package com.drmp.controller;

import com.drmp.auth.UnifiedAuthenticationManager;
import com.drmp.config.BaseControllerTest;
import com.drmp.dto.LoginRequest;
import com.drmp.dto.LoginResponse;
import com.drmp.entity.User;
import com.drmp.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * AuthController 测试
 */
@DisplayName("AuthController 测试")
class AuthControllerTest extends BaseControllerTest {

    @MockBean
    private AuthService authService;

    @MockBean
    private UnifiedAuthenticationManager authManager;

    private LoginResponse testLoginResponse;

    @BeforeEach
    public void setUp() {
        super.setUp();

        testLoginResponse = LoginResponse.builder()
            .accessToken("test_token")
            .refreshToken("refresh_token")
            .tokenType("Bearer")
            .expiresIn(3600L)
            .build();
    }

    @Test
    @DisplayName("POST /v1/auth/login - 登录成功")
    void login_ShouldReturnToken() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("password123");

        when(authService.login(any(), anyString())).thenReturn(testLoginResponse);

        mockMvc.perform(post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.accessToken").value("test_token"));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /v1/auth/logout - 登出成功")
    void logout_ShouldSucceed() throws Exception {
        mockMvc.perform(post("/v1/auth/logout"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("POST /v1/auth/refresh - 刷新Token")
    void refreshToken_ShouldReturnNewToken() throws Exception {
        when(authService.refreshToken(anyString())).thenReturn(testLoginResponse);

        mockMvc.perform(post("/v1/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"refreshToken\":\"old_refresh_token\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.accessToken").exists());
    }

    @Test
    @DisplayName("POST /v1/auth/validate-token - 验证Token")
    void validateToken_ShouldReturnValid() throws Exception {
        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("testuser");
        
        UnifiedAuthenticationManager.AuthenticationResult result = 
            UnifiedAuthenticationManager.AuthenticationResult.success(
                "test_token", "refresh_token", "session_id", mockUser);
        
        when(authManager.authenticateByToken(anyString())).thenReturn(result);

        mockMvc.perform(post("/v1/auth/validate-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"token\":\"test_token\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.valid").value(true));
    }

    @Test
    @DisplayName("POST /v1/auth/login - 用户名为空返回400")
    void login_ShouldReturn400_WhenUsernameEmpty() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("");
        request.setPassword("password");

        mockMvc.perform(post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /v1/auth/login - 密码为空返回400")
    void login_ShouldReturn400_WhenPasswordEmpty() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("");

        mockMvc.perform(post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /v1/auth/login - 用户名过短返回400")
    void login_ShouldReturn400_WhenUsernameTooShort() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("ab");
        request.setPassword("password");

        mockMvc.perform(post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /v1/auth/login - 密码过短返回400")
    void login_ShouldReturn400_WhenPasswordTooShort() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("12345");

        mockMvc.perform(post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }
}
