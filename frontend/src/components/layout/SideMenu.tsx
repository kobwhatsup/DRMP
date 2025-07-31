import React, { useState, useEffect } from 'react';
import { Menu, Spin } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { MenuItem, getMenuConfigByUserType, getBreadcrumb } from '@/config/menuConfig';

interface SideMenuProps {
  userType: 'admin' | 'source_org' | 'disposal_org';
  collapsed?: boolean;
}

const SideMenu: React.FC<SideMenuProps> = ({ userType, collapsed = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    // 根据用户类型加载对应的菜单配置
    const menuConfig = getMenuConfigByUserType(userType);
    setMenuItems(menuConfig);
    setLoading(false);
  }, [userType]);

  useEffect(() => {
    // 根据当前路径设置选中的菜单项
    const currentPath = location.pathname;
    const matchedItem = findMenuItemByPath(menuItems, currentPath);
    
    if (matchedItem) {
      setSelectedKeys([matchedItem.key]);
      
      // 如果是子菜单项，需要展开父菜单
      const parentKeys = findParentKeys(menuItems, matchedItem.key);
      if (!collapsed) {
        setOpenKeys(parentKeys);
      }
    }
  }, [location.pathname, menuItems, collapsed]);

  // 根据路径查找菜单项
  const findMenuItemByPath = (items: MenuItem[], path: string): MenuItem | null => {
    for (const item of items) {
      if (item.path === path) {
        return item;
      }
      if (item.children) {
        const found = findMenuItemByPath(item.children, path);
        if (found) return found;
      }
    }
    return null;
  };

  // 查找父级菜单的keys
  const findParentKeys = (items: MenuItem[], targetKey: string, parents: string[] = []): string[] => {
    for (const item of items) {
      if (item.key === targetKey) {
        return parents;
      }
      if (item.children) {
        const result = findParentKeys(item.children, targetKey, [...parents, item.key]);
        if (result.length > 0 || item.children.some(child => child.key === targetKey)) {
          return [...parents, item.key];
        }
      }
    }
    return [];
  };

  // 转换菜单项为Ant Design Menu格式
  const convertToAntdMenuItems = (items: MenuItem[]) => {
    return items.map(item => {
      const menuItem: any = {
        key: item.key,
        icon: item.icon ? React.createElement(item.icon) : null,
        label: item.name,
        onClick: () => {
          if (item.path && !item.children) {
            navigate(item.path);
          }
        }
      };

      if (item.children && item.children.length > 0) {
        menuItem.children = convertToAntdMenuItems(item.children);
      }

      return menuItem;
    });
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    const menuItem = findMenuItemByKey(menuItems, key);
    if (menuItem && menuItem.path && !menuItem.children) {
      navigate(menuItem.path);
    }
  };

  const findMenuItemByKey = (items: MenuItem[], key: string): MenuItem | null => {
    for (const item of items) {
      if (item.key === key) {
        return item;
      }
      if (item.children) {
        const found = findMenuItemByKey(item.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px' 
      }}>
        <Spin />
      </div>
    );
  }

  return (
    <Menu
      mode="inline"
      theme="dark"
      selectedKeys={selectedKeys}
      openKeys={collapsed ? [] : openKeys}
      onOpenChange={handleOpenChange}
      onClick={handleMenuClick}
      items={convertToAntdMenuItems(menuItems)}
      style={{ 
        height: '100%', 
        borderRight: 0,
        overflow: 'auto'
      }}
    />
  );
};

export default SideMenu;