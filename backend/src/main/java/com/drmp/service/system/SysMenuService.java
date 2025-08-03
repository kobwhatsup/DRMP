package com.drmp.service.system;

import com.drmp.dto.request.system.MenuCreateRequest;
import com.drmp.dto.request.system.MenuUpdateRequest;
import com.drmp.dto.response.system.MenuResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SysMenuService {
    
    MenuResponse createMenu(MenuCreateRequest request);
    
    MenuResponse updateMenu(MenuUpdateRequest request);
    
    void deleteMenu(Long menuId);
    
    MenuResponse getMenu(Long menuId);
    
    List<MenuResponse> getMenuTree();
    
    List<MenuResponse> getUserMenuTree(Long userId);
    
    Page<MenuResponse> searchMenus(String keyword, Pageable pageable);
    
    void assignRoleMenus(Long roleId, List<Long> menuIds);
    
    List<Long> getRoleMenuIds(Long roleId);
    
    List<String> getUserPermissions(Long userId);
    
    void refreshMenuCache();
}