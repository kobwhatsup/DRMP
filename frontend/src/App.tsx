import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { App as AntdApp } from 'antd';
import { useAuthStore } from '@/store/authStore';
import Layout from '@/components/layout/Layout';
import AppRouter from '@/components/layout/AppRouter';


// 开发模式配置
const isDevelopment = process.env.NODE_ENV === 'development';
const SKIP_LOGIN_IN_DEV = true; // 设置为 false 可以恢复正常登录流程

/**
 * 开发模式自动登录组件
 */
const DevAutoLogin: React.FC = () => {
  const { login } = useAuthStore();
  
  useEffect(() => {
    const performDevLogin = async () => {
      if (isDevelopment && SKIP_LOGIN_IN_DEV) {
        try {
          // 总是重新获取新的token，确保有效性
          const API_VERSION = process.env.REACT_APP_USE_DEV_API === 'true' ? '/v1/dev' : '';
          const response = await fetch(`http://localhost:8080/api${API_VERSION}/auth/token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            
            // 使用有效的JWT token登录
            login(data.accessToken, data.refreshToken, data.userInfo);
            
            console.log('🚀 开发模式: 已使用有效JWT token自动登录为系统管理员');
          } else {
            console.error('获取开发环境JWT token失败:', response.statusText);
            
            // 如果开发接口失败，回退到模拟token（可能会导致API调用失败）
            const mockUserInfo = {
              id: 1,
              username: 'admin',
              email: 'admin@drmp.com',
              name: '系统管理员',
              phone: '13800000000',
              avatar: '',
              organizationId: 1,
              organizationName: 'DRMP系统管理',
              type: 'admin' as 'admin' | 'source_org' | 'disposal_org',
              roles: ['ADMIN'],
              permissions: [
                'user:read', 'user:create', 'user:update', 'user:delete',
                'organization:read', 'organization:create', 'organization:update', 'organization:delete', 'organization:approve',
                'case_package:read', 'case_package:create', 'case_package:update', 'case_package:delete', 'case_package:assign',
                'case:read', 'case:update',
                'report:read', 'report:export',
                'system:config', 'system:log'
              ]
            };
            
            login('dev-access-token', 'dev-refresh-token', mockUserInfo);
            console.log('⚠️ 开发模式: 使用模拟token登录（API调用可能失败）');
          }
        } catch (error) {
          console.error('开发环境自动登录失败:', error);
        }
      }
    };

    performDevLogin();
  }, [login]);
  
  return null;
};

/**
 * Main App Component
 */
const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  
  return (
    <AntdApp>
      <Router>
        {/* 开发模式自动登录 */}
        {isDevelopment && SKIP_LOGIN_IN_DEV && <DevAutoLogin />}
        
        {/* 根据认证状态显示不同内容 */}
        {isAuthenticated ? (
          <Layout>
            <AppRouter />
          </Layout>
        ) : (
          <AppRouter />
        )}
      </Router>
    </AntdApp>
  );
};

export default App;