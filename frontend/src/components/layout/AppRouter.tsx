import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { getRoutesByUserType, publicRoutes } from '@/config/routeConfig';
import { useAuthStore } from '@/store/authStore';

// 路由守卫组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// 加载中组件
const LoadingFallback: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '50vh' 
  }}>
    <Spin size="large" />
  </div>
);

// 递归渲染路由
const renderRoutes = (routes: any[]) => {
  return routes.map((route, index) => {
    if (route.children) {
      return (
        <Route key={route.path || index} path={route.path}>
          {route.element && <Route index element={route.element} />}
          {renderRoutes(route.children)}
        </Route>
      );
    }
    
    if (route.index) {
      return <Route key={index} index element={route.element} />;
    }
    
    return <Route key={route.path || index} path={route.path} element={route.element} />;
  });
};

const AppRouter: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  
  // 获取用户类型对应的路由配置
  const userType = user?.type || 'admin';
  const protectedRoutes = getRoutesByUserType(userType as 'admin' | 'source_org' | 'disposal_org');

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* 公共路由（不需要认证） */}
        {publicRoutes.map((route, index) => (
          <Route key={route.path || index} path={route.path} element={route.element} />
        ))}
        
        {/* 受保护的路由 */}
        {isAuthenticated ? (
          <>
            {renderRoutes(protectedRoutes)}
            {/* 默认重定向到首页 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          /* 未登录时重定向到登录页 */
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Suspense>
  );
};

export default AppRouter;