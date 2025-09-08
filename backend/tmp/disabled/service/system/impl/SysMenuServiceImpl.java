package com.drmp.service.system.impl;

import com.drmp.dto.request.system.MenuCreateRequest;
import com.drmp.dto.request.system.MenuUpdateRequest;
import com.drmp.dto.response.system.MenuResponse;
import com.drmp.entity.system.SysMenu;
import com.drmp.entity.system.SysRoleMenu;
import com.drmp.repository.system.SysMenuRepository;
import com.drmp.repository.system.SysRoleMenuRepository;
import com.drmp.service.system.SysMenuService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SysMenuServiceImpl implements SysMenuService {
    
    private final SysMenuRepository menuRepository;
    private final SysRoleMenuRepository roleMenuRepository;
    
    @Override
    @Transactional
    public MenuResponse createMenu(MenuCreateRequest request) {
        log.info("创建菜单: {}", request.getMenuName());
        
        if (menuRepository.findByMenuCode(request.getMenuCode()).isPresent()) {
            throw new RuntimeException("菜单编码已存在: " + request.getMenuCode());
        }
        
        SysMenu menu = new SysMenu();
        BeanUtils.copyProperties(request, menu);
        menu.setMenuType(SysMenu.MenuType.valueOf(request.getMenuType()));
        menu.setStatus(SysMenu.Status.ACTIVE);
        
        menu = menuRepository.save(menu);
        return convertToResponse(menu);
    }
    
    @Override
    @Transactional
    public MenuResponse updateMenu(MenuUpdateRequest request) {
        log.info("更新菜单: {}", request.getId());
        
        SysMenu menu = menuRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("菜单不存在"));
        
        BeanUtils.copyProperties(request, menu, "id", "menuCode", "createdAt", "createdBy");
        
        if (request.getMenuType() != null) {
            menu.setMenuType(SysMenu.MenuType.valueOf(request.getMenuType()));
        }
        if (request.getStatus() != null) {
            menu.setStatus(SysMenu.Status.valueOf(request.getStatus()));
        }
        
        menu = menuRepository.save(menu);
        return convertToResponse(menu);
    }
    
    @Override
    @Transactional
    @CacheEvict(value = "menuCache", allEntries = true)
    public void deleteMenu(Long menuId) {
        log.info("删除菜单: {}", menuId);
        
        if (menuRepository.hasChildren(menuId)) {
            throw new RuntimeException("该菜单存在子菜单，无法删除");
        }
        
        roleMenuRepository.deleteByMenuId(menuId);
        menuRepository.deleteById(menuId);
    }
    
    @Override
    public MenuResponse getMenu(Long menuId) {
        SysMenu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new RuntimeException("菜单不存在"));
        return convertToResponse(menu);
    }
    
    @Override
    @Cacheable(value = "menuCache", key = "'allMenuTree'")
    public List<MenuResponse> getMenuTree() {
        List<SysMenu> allMenus = menuRepository.findByStatusOrderBySortOrder(SysMenu.Status.ACTIVE);
        return buildMenuTree(allMenus, 0L);
    }
    
    @Override
    @Cacheable(value = "menuCache", key = "'userMenuTree:' + #userId")
    public List<MenuResponse> getUserMenuTree(Long userId) {
        List<SysMenu> userMenus = menuRepository.findUserMenus(userId);
        return buildMenuTree(userMenus, 0L);
    }
    
    @Override
    public Page<MenuResponse> searchMenus(String keyword, Pageable pageable) {
        Page<SysMenu> menuPage = menuRepository.searchMenus(keyword, pageable);
        return menuPage.map(this::convertToResponse);
    }
    
    @Override
    @Transactional
    @CacheEvict(value = "menuCache", allEntries = true)
    public void assignRoleMenus(Long roleId, List<Long> menuIds) {
        log.info("分配角色菜单 - 角色ID: {}, 菜单数量: {}", roleId, menuIds.size());
        
        roleMenuRepository.deleteByRoleId(roleId);
        
        List<SysRoleMenu> roleMenus = menuIds.stream()
                .map(menuId -> {
                    SysRoleMenu roleMenu = new SysRoleMenu();
                    roleMenu.setRoleId(roleId);
                    roleMenu.setMenuId(menuId);
                    return roleMenu;
                })
                .collect(Collectors.toList());
        
        roleMenuRepository.saveAll(roleMenus);
    }
    
    @Override
    public List<Long> getRoleMenuIds(Long roleId) {
        return roleMenuRepository.findMenuIdsByRoleId(roleId);
    }
    
    @Override
    @Cacheable(value = "menuCache", key = "'userPermissions:' + #userId")
    public List<String> getUserPermissions(Long userId) {
        return menuRepository.findUserPermissions(userId);
    }
    
    @Override
    @CacheEvict(value = "menuCache", allEntries = true)
    public void refreshMenuCache() {
        log.info("刷新菜单缓存");
    }
    
    private List<MenuResponse> buildMenuTree(List<SysMenu> menus, Long parentId) {
        Map<Long, List<SysMenu>> menuMap = menus.stream()
                .collect(Collectors.groupingBy(SysMenu::getParentId));
        
        return buildTree(menuMap, parentId);
    }
    
    private List<MenuResponse> buildTree(Map<Long, List<SysMenu>> menuMap, Long parentId) {
        List<MenuResponse> tree = new ArrayList<>();
        List<SysMenu> children = menuMap.get(parentId);
        
        if (children != null) {
            for (SysMenu menu : children) {
                MenuResponse response = convertToResponse(menu);
                response.setChildren(buildTree(menuMap, menu.getId()));
                tree.add(response);
            }
        }
        
        return tree;
    }
    
    private MenuResponse convertToResponse(SysMenu menu) {
        MenuResponse response = new MenuResponse();
        BeanUtils.copyProperties(menu, response);
        response.setMenuType(menu.getMenuType().name());
        response.setStatus(menu.getStatus().name());
        return response;
    }
}