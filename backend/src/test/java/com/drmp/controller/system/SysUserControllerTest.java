package com.drmp.controller.system;

import com.drmp.config.BaseControllerTest;
import com.drmp.dto.request.system.UserCreateRequest;
import com.drmp.dto.request.system.UserUpdateRequest;
import com.drmp.dto.response.system.UserResponse;
import com.drmp.service.system.SysUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.Arrays;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("SysUserController 测试")
class SysUserControllerTest extends BaseControllerTest {

    @MockBean
    private SysUserService userService;

    private UserResponse testUser;
    private Page<UserResponse> testPage;

    @BeforeEach
    public void setUp() {
        super.setUp();
        testUser = UserResponse.builder()
            .id(1L)
            .username("testuser")
            .build();

        testPage = new PageImpl<>(Arrays.asList(testUser));
    }

    @Test
    @DisplayName("getUsers - 应成功分页查询用户")
    @WithMockUser(authorities = "system:user:list")
    void getUsers_ShouldReturnUserPage() throws Exception {
        when(userService.getUsers(any())).thenReturn(testPage);

        mockMvc.perform(get("/v1/system/users"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content[0].id").value(1));

        verify(userService).getUsers(any());
    }

    @Test
    @DisplayName("getUserById - 应成功获取用户详情")
    @WithMockUser(authorities = "system:user:list")
    void getUserById_ShouldReturnUser() throws Exception {
        when(userService.getUserById(1L)).thenReturn(testUser);

        mockMvc.perform(get("/v1/system/users/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.username").value("testuser"));
    }

    @Test
    @DisplayName("createUser - 应成功创建用户")
    @WithMockUser(authorities = "system:user:create")
    void createUser_ShouldCreateSuccessfully() throws Exception {
        UserCreateRequest request = new UserCreateRequest();
        request.setUsername("testuser");
        request.setPassword("password123");
        request.setUserType("ADMIN");

        when(userService.createUser(any(), anyLong())).thenReturn(testUser);

        mockMvc.perform(post("/v1/system/users")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("用户创建成功"));
    }

    @Test
    @DisplayName("updateUser - 应成功更新用户")
    @WithMockUser(authorities = "system:user:update")
    void updateUser_ShouldUpdateSuccessfully() throws Exception {
        UserUpdateRequest request = new UserUpdateRequest();
        request.setRealName("Updated Name");
        request.setEmail("test@example.com");

        when(userService.updateUser(eq(1L), any(), anyLong())).thenReturn(testUser);

        mockMvc.perform(put("/v1/system/users/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("用户更新成功"));
    }

    @Test
    @DisplayName("deleteUser - 应成功删除用户")
    @WithMockUser(authorities = "system:user:delete")
    void deleteUser_ShouldDeleteSuccessfully() throws Exception {
        mockMvc.perform(delete("/v1/system/users/1")
                .with(csrf()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("用户删除成功"));

        verify(userService).deleteUser(eq(1L), anyLong());
    }

    @Test
    @DisplayName("deleteUsers - 应成功批量删除用户")
    @WithMockUser(authorities = "system:user:delete")
    void deleteUsers_ShouldBatchDeleteSuccessfully() throws Exception {
        Long[] ids = {1L, 2L, 3L};

        mockMvc.perform(delete("/v1/system/users/batch")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(ids)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("批量删除成功"));

        verify(userService).deleteUsers(any(), anyLong());
    }
}
