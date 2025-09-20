package com.drmp.controller.system;

import com.drmp.dto.request.system.MenuCreateRequest;
import com.drmp.dto.request.system.MenuUpdateRequest;
import com.drmp.dto.response.ApiResponse;
import com.drmp.dto.response.system.MenuResponse;
import com.drmp.service.system.SysMenuService;
// import io.swagger.annotations.Api;
// import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

// @Api(tags = "系统管理 - 菜单管理")
@RestController
@RequestMapping("/v1/system/menus")
@RequiredArgsConstructor
public class SysMenuController {
    
    private final SysMenuService menuService;
    
    // @ApiOperation("创建菜单")
    @PostMapping
    @PreAuthorize("hasAuthority('system:menu:create')")
    public ApiResponse<MenuResponse> createMenu(@Valid @RequestBody MenuCreateRequest request) {
        MenuResponse response = menuService.createMenu(request);
        return ApiResponse.success(response);
    }
    
    // @ApiOperation("更新菜单")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('system:menu:update')")
    public ApiResponse<MenuResponse> updateMenu(@PathVariable Long id, 
                                               @Valid @RequestBody MenuUpdateRequest request) {
        request.setId(id);
        MenuResponse response = menuService.updateMenu(request);
        return ApiResponse.success(response);
    }
    
    // @ApiOperation("删除菜单")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('system:menu:delete')")
    public ApiResponse<Void> deleteMenu(@PathVariable Long id) {
        menuService.deleteMenu(id);
        return ApiResponse.success();
    }
    
    // @ApiOperation("获取菜单详情")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('system:menu:view')")
    public ApiResponse<MenuResponse> getMenu(@PathVariable Long id) {
        MenuResponse response = menuService.getMenu(id);
        return ApiResponse.success(response);
    }
    
    // @ApiOperation("获取菜单树")
    @GetMapping("/tree")
    @PreAuthorize("hasAuthority('system:menu:list')")
    public ApiResponse<List<MenuResponse>> getMenuTree() {
        List<MenuResponse> tree = menuService.getMenuTree();
        return ApiResponse.success(tree);
    }
    
    // @ApiOperation("获取用户菜单树")
    @GetMapping("/user-tree")
    public ApiResponse<List<MenuResponse>> getUserMenuTree() {
        // TODO: 从Security Context获取当前用户ID
        Long userId = 1L;
        List<MenuResponse> tree = menuService.getUserMenuTree(userId);
        return ApiResponse.success(tree);
    }
    
    // @ApiOperation("搜索菜单")
    @GetMapping("/search")
    @PreAuthorize("hasAuthority('system:menu:list')")
    public ApiResponse<Page<MenuResponse>> searchMenus(@RequestParam String keyword, Pageable pageable) {
        Page<MenuResponse> page = menuService.searchMenus(keyword, pageable);
        return ApiResponse.success(page);
    }
    
    // @ApiOperation("分配角色菜单")
    @PostMapping("/role/{roleId}/assign")
    @PreAuthorize("hasAuthority('system:role:assign-menu')")
    public ApiResponse<Void> assignRoleMenus(@PathVariable Long roleId, 
                                            @RequestBody List<Long> menuIds) {
        menuService.assignRoleMenus(roleId, menuIds);
        return ApiResponse.success();
    }
    
    // @ApiOperation("获取角色菜单ID列表")
    @GetMapping("/role/{roleId}/menu-ids")
    @PreAuthorize("hasAuthority('system:role:view')")
    public ApiResponse<List<Long>> getRoleMenuIds(@PathVariable Long roleId) {
        List<Long> menuIds = menuService.getRoleMenuIds(roleId);
        return ApiResponse.success(menuIds);
    }
    
    // @ApiOperation("获取用户权限列表")
    @GetMapping("/user-permissions")
    public ApiResponse<List<String>> getUserPermissions() {
        // TODO: 从Security Context获取当前用户ID
        Long userId = 1L;
        List<String> permissions = menuService.getUserPermissions(userId);
        return ApiResponse.success(permissions);
    }
    
    // @ApiOperation("刷新菜单缓存")
    @PostMapping("/refresh-cache")
    @PreAuthorize("hasAuthority('system:menu:refresh')")
    public ApiResponse<Void> refreshMenuCache() {
        menuService.refreshMenuCache();
        return ApiResponse.success();
    }
}