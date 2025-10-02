package com.drmp.controller.system;

import com.drmp.config.BaseControllerTest;
import com.drmp.dto.request.system.PermissionCreateRequest;
import com.drmp.dto.request.system.PermissionUpdateRequest;
import com.drmp.dto.response.system.PermissionResponse;
import com.drmp.service.system.SysPermissionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("SysPermissionController 测试")
class SysPermissionControllerTest extends BaseControllerTest {

    @MockBean
    private SysPermissionService permissionService;

    private PermissionResponse testPermission;

    @BeforeEach
    public void setUp() {
        super.setUp();
        testPermission = new PermissionResponse();
        testPermission.setId(1L);
        testPermission.setPermissionName("用户管理");
    }

    @Test
    @DisplayName("createPermission - 应成功创建权限")
    @WithMockUser(authorities = "system:permission:create")
    void createPermission_ShouldCreateSuccessfully() throws Exception {
        PermissionCreateRequest request = new PermissionCreateRequest();
        request.setPermissionCode("user:view");
        request.setPermissionName("查看用户");
        request.setResourceType("API");

        when(permissionService.createPermission(any())).thenReturn(testPermission);

        mockMvc.perform(post("/v1/system/permissions")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    @DisplayName("updatePermission - 应成功更新权限")
    @WithMockUser(authorities = "system:permission:update")
    void updatePermission_ShouldUpdateSuccessfully() throws Exception {
        PermissionUpdateRequest request = new PermissionUpdateRequest();
        request.setId(1L);
        request.setPermissionName("更新后的权限");

        when(permissionService.updatePermission(any())).thenReturn(testPermission);

        mockMvc.perform(put("/v1/system/permissions/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk());

        verify(permissionService).updatePermission(any());
    }

    @Test
    @DisplayName("deletePermission - 应成功删除权限")
    @WithMockUser(authorities = "system:permission:delete")
    void deletePermission_ShouldDeleteSuccessfully() throws Exception {
        mockMvc.perform(delete("/v1/system/permissions/1")
                .with(csrf()))
            .andExpect(status().isOk());

        verify(permissionService).deletePermission(1L);
    }

    @Test
    @DisplayName("getPermission - 应成功获取权限详情")
    @WithMockUser(authorities = "system:permission:view")
    void getPermission_ShouldReturnPermission() throws Exception {
        when(permissionService.getPermission(1L)).thenReturn(testPermission);

        mockMvc.perform(get("/v1/system/permissions/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.permissionName").value("用户管理"));
    }

    @Test
    @DisplayName("getPermissionTree - 应成功获取权限树")
    @WithMockUser(authorities = "system:permission:list")
    void getPermissionTree_ShouldReturnTree() throws Exception {
        when(permissionService.getPermissionTree()).thenReturn(Arrays.asList(testPermission));

        mockMvc.perform(get("/v1/system/permissions/tree"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].id").value(1));
    }

    @Test
    @DisplayName("getPermissionsByType - 应根据类型获取权限")
    @WithMockUser(authorities = "system:permission:list")
    void getPermissionsByType_ShouldReturnPermissions() throws Exception {
        when(permissionService.getPermissionsByResourceType(anyString()))
            .thenReturn(Arrays.asList(testPermission));

        mockMvc.perform(get("/v1/system/permissions/by-type/BUTTON"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("searchPermissions - 应成功搜索权限")
    @WithMockUser(authorities = "system:permission:list")
    void searchPermissions_ShouldReturnSearchResults() throws Exception {
        Page<PermissionResponse> page = new PageImpl<>(Arrays.asList(testPermission));
        when(permissionService.searchPermissions(anyString(), any())).thenReturn(page);

        mockMvc.perform(get("/v1/system/permissions/search")
                .param("keyword", "用户"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("assignRolePermissions - 应成功分配角色权限")
    @WithMockUser(authorities = "system:role:assign-permission")
    void assignRolePermissions_ShouldAssignSuccessfully() throws Exception {
        List<Long> permissionIds = Arrays.asList(1L, 2L, 3L);

        mockMvc.perform(post("/v1/system/permissions/role/1/assign")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(permissionIds)))
            .andExpect(status().isOk());

        verify(permissionService).assignRolePermissions(eq(1L), anyList());
    }

    @Test
    @DisplayName("getRolePermissionIds - 应成功获取角色权限ID列表")
    @WithMockUser(authorities = "system:role:view")
    void getRolePermissionIds_ShouldReturnPermissionIds() throws Exception {
        when(permissionService.getRolePermissionIds(1L))
            .thenReturn(Arrays.asList(1L, 2L, 3L));

        mockMvc.perform(get("/v1/system/permissions/role/1/permission-ids"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.length()").value(3));
    }
}
