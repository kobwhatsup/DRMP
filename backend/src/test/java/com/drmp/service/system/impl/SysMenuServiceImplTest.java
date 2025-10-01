package com.drmp.service.system.impl;

import com.drmp.dto.request.system.MenuCreateRequest;
import com.drmp.dto.request.system.MenuUpdateRequest;
import com.drmp.dto.response.system.MenuResponse;
import com.drmp.entity.system.SysMenu;
import com.drmp.repository.system.SysMenuRepository;
import com.drmp.repository.system.SysRoleMenuRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * SysMenuServiceImpl 测试
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("SysMenuServiceImpl 测试")
class SysMenuServiceImplTest {

    @Mock
    private SysMenuRepository menuRepository;

    @Mock
    private SysRoleMenuRepository roleMenuRepository;

    @InjectMocks
    private SysMenuServiceImpl menuService;

    private SysMenu testMenu;
    private MenuCreateRequest createRequest;
    private MenuUpdateRequest updateRequest;

    @BeforeEach
    void setUp() {
        testMenu = new SysMenu()
            .setId(1L)
            .setMenuCode("user_management")
            .setMenuName("用户管理")
            .setMenuType(SysMenu.MenuType.MENU)
            .setPath("/user")
            .setParentId(0L)
            .setIcon("user")
            .setSortOrder(1)
            .setStatus(SysMenu.Status.ACTIVE);

        createRequest = new MenuCreateRequest();
        createRequest.setMenuCode("user_management");
        createRequest.setMenuName("用户管理");
        createRequest.setMenuType("MENU");

        updateRequest = new MenuUpdateRequest();
        updateRequest.setId(1L);
        updateRequest.setMenuName("用户管理（更新）");
    }

    @Test
    @DisplayName("createMenu - 应成功创建菜单")
    void createMenu_ShouldCreateSuccessfully() {
        // Arrange
        when(menuRepository.findByMenuCode("user_management")).thenReturn(Optional.empty());
        when(menuRepository.save(any(SysMenu.class))).thenReturn(testMenu);

        // Act
        MenuResponse result = menuService.createMenu(createRequest);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getMenuCode()).isEqualTo("user_management");
        verify(menuRepository).save(any(SysMenu.class));
    }

    @Test
    @DisplayName("createMenu - 菜单编码已存在应抛出异常")
    void createMenu_ShouldThrowException_WhenCodeExists() {
        // Arrange
        when(menuRepository.findByMenuCode("user_management")).thenReturn(Optional.of(testMenu));

        // Act & Assert
        assertThatThrownBy(() -> menuService.createMenu(createRequest))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("菜单编码已存在");
    }

    @Test
    @DisplayName("updateMenu - 应成功更新菜单")
    void updateMenu_ShouldUpdateSuccessfully() {
        // Arrange
        when(menuRepository.findById(1L)).thenReturn(Optional.of(testMenu));
        when(menuRepository.save(any(SysMenu.class))).thenReturn(testMenu);

        // Act
        MenuResponse result = menuService.updateMenu(updateRequest);

        // Assert
        assertThat(result).isNotNull();
        verify(menuRepository).save(any(SysMenu.class));
    }

    @Test
    @DisplayName("updateMenu - 菜单不存在应抛出异常")
    void updateMenu_ShouldThrowException_WhenNotFound() {
        // Arrange
        when(menuRepository.findById(999L)).thenReturn(Optional.empty());
        updateRequest.setId(999L);

        // Act & Assert
        assertThatThrownBy(() -> menuService.updateMenu(updateRequest))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("菜单不存在");
    }

    @Test
    @DisplayName("deleteMenu - 应成功删除菜单")
    void deleteMenu_ShouldDeleteSuccessfully() {
        // Arrange
        when(menuRepository.hasChildren(1L)).thenReturn(false);

        // Act
        menuService.deleteMenu(1L);

        // Assert
        verify(roleMenuRepository).deleteByMenuId(1L);
        verify(menuRepository).deleteById(1L);
    }

    @Test
    @DisplayName("deleteMenu - 存在子菜单应抛出异常")
    void deleteMenu_ShouldThrowException_WhenHasChildren() {
        // Arrange
        when(menuRepository.hasChildren(1L)).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> menuService.deleteMenu(1L))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("存在子菜单");
    }

    @Test
    @DisplayName("getMenu - 应返回菜单详情")
    void getMenu_ShouldReturnMenuDetails() {
        // Arrange
        when(menuRepository.findById(1L)).thenReturn(Optional.of(testMenu));

        // Act
        MenuResponse result = menuService.getMenu(1L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getMenuCode()).isEqualTo("user_management");
    }

    @Test
    @DisplayName("getMenuTree - 应返回菜单树")
    void getMenuTree_ShouldReturnTree() {
        // Arrange
        SysMenu parent = new SysMenu()
            .setId(1L)
            .setMenuCode("system")
            .setMenuName("系统管理")
            .setParentId(0L)
            .setMenuType(SysMenu.MenuType.DIRECTORY)
            .setStatus(SysMenu.Status.ACTIVE);

        SysMenu child = new SysMenu()
            .setId(2L)
            .setMenuCode("user_management")
            .setMenuName("用户管理")
            .setParentId(1L)
            .setMenuType(SysMenu.MenuType.MENU)
            .setStatus(SysMenu.Status.ACTIVE);

        when(menuRepository.findByStatusOrderBySortOrder(SysMenu.Status.ACTIVE))
            .thenReturn(Arrays.asList(parent, child));

        // Act
        List<MenuResponse> result = menuService.getMenuTree();

        // Assert
        assertThat(result).isNotEmpty();
        assertThat(result.get(0).getChildren()).isNotEmpty();
    }

    @Test
    @DisplayName("getUserMenuTree - 应返回用户菜单树")
    void getUserMenuTree_ShouldReturnUserMenuTree() {
        // Arrange
        when(menuRepository.findUserMenus(1L)).thenReturn(Arrays.asList(testMenu));

        // Act
        List<MenuResponse> result = menuService.getUserMenuTree(1L);

        // Assert
        assertThat(result).isNotEmpty();
    }

    @Test
    @DisplayName("searchMenus - 应返回搜索结果")
    void searchMenus_ShouldReturnSearchResults() {
        // Arrange
        Page<SysMenu> menuPage = new PageImpl<>(Arrays.asList(testMenu));
        when(menuRepository.searchMenus(eq("用户"), any(PageRequest.class)))
            .thenReturn(menuPage);

        // Act
        Page<MenuResponse> result = menuService.searchMenus("用户", PageRequest.of(0, 10));

        // Assert
        assertThat(result).isNotEmpty();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("assignRoleMenus - 应成功分配角色菜单")
    void assignRoleMenus_ShouldAssignSuccessfully() {
        // Arrange
        List<Long> menuIds = Arrays.asList(1L, 2L, 3L);

        // Act
        menuService.assignRoleMenus(1L, menuIds);

        // Assert
        verify(roleMenuRepository).deleteByRoleId(1L);
        verify(roleMenuRepository).saveAll(anyList());
    }

    @Test
    @DisplayName("getRoleMenuIds - 应返回角色菜单ID列表")
    void getRoleMenuIds_ShouldReturnMenuIds() {
        // Arrange
        List<Long> menuIds = Arrays.asList(1L, 2L, 3L);
        when(roleMenuRepository.findMenuIdsByRoleId(1L)).thenReturn(menuIds);

        // Act
        List<Long> result = menuService.getRoleMenuIds(1L);

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(1L, 2L, 3L);
    }

    @Test
    @DisplayName("getUserPermissions - 应返回用户权限列表")
    void getUserPermissions_ShouldReturnUserPermissions() {
        // Arrange
        List<String> permissions = Arrays.asList("user:create", "user:update", "user:delete");
        when(menuRepository.findUserPermissions(1L)).thenReturn(permissions);

        // Act
        List<String> result = menuService.getUserPermissions(1L);

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result).contains("user:create", "user:update", "user:delete");
    }

    @Test
    @DisplayName("refreshMenuCache - 应刷新菜单缓存")
    void refreshMenuCache_ShouldRefreshCache() {
        // Act & Assert
        assertThatCode(() -> menuService.refreshMenuCache())
            .doesNotThrowAnyException();
    }
}
