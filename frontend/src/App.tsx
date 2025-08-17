import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { App as AntdApp, message, notification } from 'antd';
import { useAuthStore } from '@/store/authStore';
import Layout from '@/components/layout/Layout';
import AppRouter from '@/components/layout/AppRouter';


// 配置全局消息设置
message.config({
  duration: 3, // 3秒后自动关闭
  maxCount: 3, // 最多同时显示3条消息
  top: 80, // 距离顶部80px
});

// 配置全局通知设置
notification.config({
  duration: 4.5, // 4.5秒后自动关闭
  maxCount: 3, // 最多同时显示3条通知
  top: 80, // 距离顶部80px
});

// 全局清理函数 - 清除所有消息和通知
const clearAllMessages = () => {
  try {
    message.destroy();
    notification.destroy();
    
    // 额外的DOM清理 - 直接移除可能残留的通知元素
    const notificationContainers = document.querySelectorAll('.ant-notification, .ant-message');
    notificationContainers.forEach(container => {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    });
    
    // 清理可能的固定定位元素
    const fixedElements = document.querySelectorAll('[class*="ant-notification"], [class*="ant-message"]');
    fixedElements.forEach(element => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
  } catch (error) {
    console.warn('清理消息时出错:', error);
  }
};

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
          // 直接使用模拟用户信息，不调用后端API
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
            roles: ['ADMIN', 'CASE_MANAGER', 'CASE_VIEWER'],
            permissions: [
              'user:read', 'user:create', 'user:update', 'user:delete',
              'organization:read', 'organization:create', 'organization:update', 'organization:delete', 'organization:approve',
              'case_package:read', 'case_package:create', 'case_package:update', 'case_package:delete', 'case_package:assign',
              'case:read', 'case:update',
              'report:read', 'report:export',
              'system:config', 'system:log'
            ]
          };
          
          // 生成一个简单的mock JWT token
          const mockToken = btoa(JSON.stringify({
            sub: mockUserInfo.username,
            userId: mockUserInfo.id,
            exp: Date.now() + 24 * 60 * 60 * 1000, // 24小时后过期
            iat: Date.now()
          }));
          
          login(`mock.${mockToken}.signature`, 'dev-refresh-token', mockUserInfo);
          console.log('🚀 开发模式: 使用模拟token自动登录为系统管理员');
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
  
  // 组件挂载时清理所有悬浮消息
  useEffect(() => {
    // 立即清理
    clearAllMessages();
    
    // 延迟清理，确保所有组件加载完成后再次清理
    const delayedCleanup = setTimeout(() => {
      clearAllMessages();
    }, 1000);
    
    // 周期性清理机制 - 每30秒清理一次持久消息
    const periodicCleanup = setInterval(() => {
      clearAllMessages();
    }, 30000);
    
    // 添加全局键盘事件监听器，ESC键清理所有消息
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearAllMessages();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      clearTimeout(delayedCleanup);
      clearInterval(periodicCleanup);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
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