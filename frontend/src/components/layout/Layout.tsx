import authService from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Layout as AntdLayout, Avatar, Button, Dropdown, Space, Typography } from 'antd';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BreadcrumbNav from './BreadcrumbNav';
import SideMenu from './SideMenu';

const { Header, Sider, Content } = AntdLayout;
const { Text } = Typography;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

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

  return (
    <AntdLayout className="main-layout" style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
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

      <AntdLayout>
        <Header style={{ padding: 0, background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

        <Content style={{ margin: '0 24px' }}>
          {/* 面包屑导航 */}
          <BreadcrumbNav />

          <div style={{ padding: 24, background: '#fff', borderRadius: 8, minHeight: 'calc(100vh - 200px)' }}>
            {children}
          </div>
        </Content>
      </AntdLayout>
    </AntdLayout>
  );
};

export default Layout;