import React, { useState } from 'react';
import { Layout as AntdLayout, Menu, Button, Dropdown, Avatar, Typography, Space } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BranchesOutlined,
  ContainerOutlined,
  // ClusterOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import authService from '@/services/authService';

const { Header, Sider, Content } = AntdLayout;
const { Text } = Typography;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, logout } = useAuthStore();

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

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '工作台',
    },
    {
      key: '/organizations',
      icon: <TeamOutlined />,
      label: '机构管理',
      children: [
        {
          key: '/organizations',
          label: '机构列表',
        },
        {
          key: '/organizations/applications',
          label: '入驻申请',
        },
        {
          key: '/organizations/approval',
          label: '审核中心',
        },
        {
          key: '/organizations/permissions',
          label: '权限配置',
        },
        {
          key: '/organizations/statistics',
          label: '机构统计',
        },
      ],
    },
    {
      key: '/case-packages',
      icon: <FileTextOutlined />,
      label: '案件包管理',
    },
    {
      key: '/cases',
      icon: <FileTextOutlined />,
      label: '案件管理',
    },
    {
      key: '/assignment',
      icon: <BranchesOutlined />,
      label: '智能分案',
      children: [
        {
          key: '/assignment/config',
          label: '分案配置',
        },
      ],
    },
    {
      key: '/contracts',
      icon: <ContainerOutlined />,
      label: '合同管理',
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: '数据报表',
    },
  ];

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

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

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
            {collapsed ? 'DRMP' : 'DRMP平台'}
          </Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
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
            <Text type="secondary">{userInfo?.organizationName}</Text>
            <Dropdown
              menu={{
                items: userMenuItems,
              }}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  src={userInfo?.avatar}
                  icon={<UserOutlined />}
                  size="small"
                />
                <Text>{userInfo?.realName || userInfo?.username}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8 }}>
          {children}
        </Content>
      </AntdLayout>
    </AntdLayout>
  );
};

export default Layout;