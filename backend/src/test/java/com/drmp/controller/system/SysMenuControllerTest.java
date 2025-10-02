package com.drmp.controller.system;

import com.drmp.config.BaseControllerTest;
import com.drmp.dto.request.system.MenuCreateRequest;
import com.drmp.dto.request.system.MenuUpdateRequest;
import com.drmp.dto.response.system.MenuResponse;
import com.drmp.service.system.SysMenuService;
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

@DisplayName("SysMenuController 测试")
class SysMenuControllerTest extends BaseControllerTest {

    @MockBean
    private SysMenuService menuService;

    private MenuResponse testMenu;

    @BeforeEach
    public void setUp() {
        super.setUp();
        testMenu = new MenuResponse();
        testMenu.setId(1L);
        testMenu.setMenuName("系统管理");
    }

    @Test
    @DisplayName("createMenu - 应成功创建菜单")
    @WithMockUser(authorities = "system:menu:create")
    void createMenu_ShouldCreateSuccessfully() throws Exception {
        MenuCreateRequest request = new MenuCreateRequest();
        request.setMenuCode("system");
        request.setMenuName("系统管理");
        request.setMenuType("MENU");

        when(menuService.createMenu(any())).thenReturn(testMenu);

        mockMvc.perform(post("/v1/system/menus")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    @DisplayName("updateMenu - 应成功更新菜单")
    @WithMockUser(authorities = "system:menu:update")
    void updateMenu_ShouldUpdateSuccessfully() throws Exception {
        MenuUpdateRequest request = new MenuUpdateRequest();
        request.setId(1L);
        request.setMenuName("更新后的菜单");

        when(menuService.updateMenu(any())).thenReturn(testMenu);

        mockMvc.perform(put("/v1/system/menus/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk());

        verify(menuService).updateMenu(any());
    }

    @Test
    @DisplayName("deleteMenu - 应成功删除菜单")
    @WithMockUser(authorities = "system:menu:delete")
    void deleteMenu_ShouldDeleteSuccessfully() throws Exception {
        mockMvc.perform(delete("/v1/system/menus/1")
                .with(csrf()))
            .andExpect(status().isOk());

        verify(menuService).deleteMenu(1L);
    }

    @Test
    @DisplayName("getMenu - 应成功获取菜单详情")
    @WithMockUser(authorities = "system:menu:view")
    void getMenu_ShouldReturnMenu() throws Exception {
        when(menuService.getMenu(1L)).thenReturn(testMenu);

        mockMvc.perform(get("/v1/system/menus/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.menuName").value("系统管理"));
    }

    @Test
    @DisplayName("getMenuTree - 应成功获取菜单树")
    @WithMockUser(authorities = "system:menu:list")
    void getMenuTree_ShouldReturnTree() throws Exception {
        when(menuService.getMenuTree()).thenReturn(Arrays.asList(testMenu));

        mockMvc.perform(get("/v1/system/menus/tree"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].id").value(1));
    }

    @Test
    @DisplayName("getUserMenuTree - 应成功获取用户菜单树")
    @WithMockUser
    void getUserMenuTree_ShouldReturnUserTree() throws Exception {
        when(menuService.getUserMenuTree(anyLong())).thenReturn(Arrays.asList(testMenu));

        mockMvc.perform(get("/v1/system/menus/user-tree"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("searchMenus - 应成功搜索菜单")
    @WithMockUser(authorities = "system:menu:list")
    void searchMenus_ShouldReturnSearchResults() throws Exception {
        Page<MenuResponse> page = new PageImpl<>(Arrays.asList(testMenu));
        when(menuService.searchMenus(anyString(), any())).thenReturn(page);

        mockMvc.perform(get("/v1/system/menus/search")
                .param("keyword", "系统"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("assignRoleMenus - 应成功分配角色菜单")
    @WithMockUser(authorities = "system:role:assign-menu")
    void assignRoleMenus_ShouldAssignSuccessfully() throws Exception {
        List<Long> menuIds = Arrays.asList(1L, 2L, 3L);

        mockMvc.perform(post("/v1/system/menus/role/1/assign")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(menuIds)))
            .andExpect(status().isOk());

        verify(menuService).assignRoleMenus(eq(1L), anyList());
    }

    @Test
    @DisplayName("getRoleMenuIds - 应成功获取角色菜单ID列表")
    @WithMockUser(authorities = "system:role:view")
    void getRoleMenuIds_ShouldReturnMenuIds() throws Exception {
        when(menuService.getRoleMenuIds(1L)).thenReturn(Arrays.asList(1L, 2L, 3L));

        mockMvc.perform(get("/v1/system/menus/role/1/menu-ids"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.length()").value(3));
    }
}
