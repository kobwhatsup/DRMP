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
const DEV_AUTO_LOGIN_ENABLED = process.env.REACT_APP_DEV_AUTO_LOGIN === 'true';

/**
 * 开发模式自动登录组件
 * 注意：使用真实的登录API，不再使用mock token
 */
const DevAutoLogin: React.FC = () => {
  const { login } = useAuthStore();
  const [loginAttempted, setLoginAttempted] = React.useState(false);

  useEffect(() => {
    const performDevLogin = async () => {
      // 只在开发环境 + 配置允许 + 未尝试登录时执行
      if (!isDevelopment || !DEV_AUTO_LOGIN_ENABLED || loginAttempted) {
        return;
      }

      try {
        setLoginAttempted(true);

        const username = process.env.REACT_APP_DEV_USERNAME || 'admin';
        const password = process.env.REACT_APP_DEV_PASSWORD || 'admin123';

        console.log('🔧 开发模式: 尝试自动登录...', { username });

        // 调用真实的登录API
        const authService = (await import('@/services/authService')).default;
        const response = await authService.login({ username, password });

        login(response.accessToken, response.refreshToken, response.userInfo);
        console.log('✅ 开发模式: 自动登录成功', response.userInfo.name);
      } catch (error) {
        console.error('❌ 开发环境自动登录失败:', error);
        // 失败时不做任何处理，让用户手动登录
      }
    };

    performDevLogin();
  }, [login, loginAttempted]);

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
  
  // 生产环境安全检查
  if (process.env.NODE_ENV === 'production' && DEV_AUTO_LOGIN_ENABLED) {
    console.error('❌ 安全错误: 生产环境不允许开启自动登录!');
    throw new Error('SECURITY ERROR: DEV_AUTO_LOGIN cannot be enabled in production!');
  }

  return (
    <AntdApp>
      <Router>
        {/* 开发模式自动登录 - 仅在开发环境且配置允许时启用 */}
        {isDevelopment && DEV_AUTO_LOGIN_ENABLED && <DevAutoLogin />}

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