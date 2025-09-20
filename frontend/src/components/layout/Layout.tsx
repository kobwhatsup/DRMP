import authService from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { useTabStore } from '@/store/tabStore';
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Layout as AntdLayout, Avatar, Button, Dropdown, Space, Typography } from 'antd';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BreadcrumbNav from './BreadcrumbNav';
import SideMenu from './SideMenu';
import TabBar from './TabBar';
import TabContent from './TabContent';
import { useTabShortcuts } from '@/hooks/useTabShortcuts';
import { getMenuConfigByUserType } from '@/config/menuConfig';

const { Header, Sider, Content } = AntdLayout;
const { Text } = Typography;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { tabs, addTab, getTabByPath, setActiveTab } = useTabStore();

  // Enable keyboard shortcuts
  useTabShortcuts();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      navigate('/login');
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  // 获取用户类型
  const userType = user?.type || 'admin';

  // Initialize tab when component mounts or route changes
  useEffect(() => {
    const currentPath = location.pathname;

    // Skip login page
    if (currentPath === '/login') return;

    const existingTab = getTabByPath(currentPath);

    if (!existingTab) {
      // Get menu config to find the title
      const menuConfig = getMenuConfigByUserType(userType as 'admin' | 'source_org' | 'disposal_org');
      let title = '未知页面';

      // Find title from menu config
      const findTitle = (items: any[], path: string): string | null => {
        for (const item of items) {
          if (item.path === path) {
            return item.name;
          }
          if (item.children) {
            const found = findTitle(item.children, path);
            if (found) return found;
          }
        }
        return null;
      };

      const foundTitle = findTitle(menuConfig, currentPath);
      if (foundTitle) {
        title = foundTitle;
      } else {
        // Use pathname segments as fallback
        const segments = currentPath.split('/').filter(Boolean);
        if (segments.length > 0) {
          title = segments[segments.length - 1]
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
      }

      // Add tab for current route
      addTab({
        title,
        path: currentPath,
        closable: currentPath !== '/dashboard',
      });
    } else {
      // Activate existing tab
      setActiveTab(existingTab.id);
    }
  }, [location.pathname, userType, addTab, getTabByPath, setActiveTab]);

  // Add dashboard tab on initial load if no tabs exist
  useEffect(() => {
    if (tabs.length === 0 && location.pathname !== '/login') {
      addTab({
        title: '工作台',
        path: '/dashboard',
        closable: false,
        isFixed: true,
      });

      // Navigate to dashboard if not already there
      if (location.pathname === '/') {
        navigate('/dashboard');
      }
    }
  }, []);

  return (
    <AntdLayout className="main-layout" style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        theme="dark"
        width={200}
        collapsedWidth={80}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
            margin: 16,
            borderRadius: 6,
          }}
        >
          <Text strong style={{ color: 'white', fontSize: collapsed ? 16 : 18 }}>
            {collapsed ? 'DRMP' : '全国分散诉调平台'}
          </Text>
        </div>

        {/* 使用新的动态菜单组件 */}
        <SideMenu
          userType={userType as 'admin' | 'source_org' | 'disposal_org'}
          collapsed={collapsed}
        />
      </Sider>

      <AntdLayout style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Header style={{ padding: 0, background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 64, height: 64 }}
          />

          <Space style={{ marginRight: 24 }}>
            <Text type="secondary">{user?.organizationName}</Text>
            <Dropdown
              menu={{
                items: userMenuItems,
              }}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  src={user?.avatar}
                  icon={<UserOutlined />}

                />
                <Text>{user?.name || user?.username}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <TabBar />

        <Content style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px 16px', background: '#fff' }}>
            <BreadcrumbNav />
          </div>

          <div style={{ flex: 1, margin: '0 16px 16px 16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <TabContent>
              <div style={{ padding: 24, background: '#fff', borderRadius: 8, height: '100%' }}>
                {children}
              </div>
            </TabContent>
          </div>
        </Content>
      </AntdLayout>
    </AntdLayout>
  );
};

export default Layout;