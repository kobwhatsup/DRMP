import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { App as AntdApp, Spin } from 'antd';
import { useAuthStore } from '@/store/authStore';
import Layout from '@/components/layout/Layout';

// 懒加载组件以提升性能
import Login from '@/pages/auth/Login';
import Dashboard from '@/pages/Dashboard';

// Organization pages lazy loading
const OrganizationList = lazy(() => import('@/pages/organization/OrganizationList'));
const OrganizationDetailPage = lazy(() => import('@/pages/organization/OrganizationDetail'));
const OrganizationForm = lazy(() => import('@/pages/organization/OrganizationForm'));
const OrganizationApplications = lazy(() => import('@/pages/organization/OrganizationApplications'));
const OrganizationApproval = lazy(() => import('@/pages/organization/OrganizationApproval'));
const OrganizationPermissions = lazy(() => import('@/pages/organization/OrganizationPermissions'));
const OrganizationStatistics = lazy(() => import('@/pages/organization/OrganizationStatistics'));

// Case pages lazy loading
const CasePackageList = lazy(() => import('@/pages/case/CasePackageList'));
const CasePackageDetail = lazy(() => import('@/pages/case/CasePackageDetail'));
const CaseList = lazy(() => import('@/pages/case/CaseList'));
const CaseTimeline = lazy(() => import('@/pages/case/CaseTimeline'));

// Phase 3 features lazy loading
const AssignmentConfig = lazy(() => import('@/pages/assignment/AssignmentConfig'));
const ContractList = lazy(() => import('@/pages/contract/ContractList'));

// Report pages lazy loading
const ReportDashboard = lazy(() => import('@/pages/report/ReportDashboard'));

// 开发模式配置
const isDevelopment = process.env.NODE_ENV === 'development';
const SKIP_LOGIN_IN_DEV = true; // 设置为 false 可以恢复正常登录流程

/**
 * Protected Route Component
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, login } = useAuthStore();
  
  // 开发模式自动登录
  useEffect(() => {
    const performDevLogin = async () => {
      if (isDevelopment && SKIP_LOGIN_IN_DEV) {
        try {
          // 总是重新获取新的token，确保有效性
          const response = await fetch('http://localhost:8080/api/v1/dev/auth/token', {
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
              realName: '系统管理员',
              phone: '13800000000',
              avatar: '',
              organizationId: 1,
              organizationName: 'DRMP系统管理',
              organizationType: 'SYSTEM',
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
  }, [login]); // 移除isAuthenticated依赖，确保每次都重新获取token
  
  if (!isAuthenticated && !(isDevelopment && SKIP_LOGIN_IN_DEV)) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

/**
 * Public Route Component (redirect to dashboard if authenticated)
 */
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  // 开发模式直接跳转到dashboard
  if (isDevelopment && SKIP_LOGIN_IN_DEV) {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

/**
 * Main App Component
 */
const App: React.FC = () => {
  return (
    <AntdApp>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          
          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      height: '200px' 
                    }}>
                      <Spin size="large" tip="加载中..." />
                    </div>
                  }>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      
                      {/* Organization Routes */}
                      <Route path="/organizations" element={<OrganizationList />} />
                      <Route path="/organizations/create" element={<OrganizationForm mode="create" />} />
                      <Route path="/organizations/:id" element={<OrganizationDetailPage />} />
                      <Route path="/organizations/:id/edit" element={<OrganizationForm mode="edit" />} />
                      <Route path="/organizations/applications" element={<OrganizationApplications />} />
                      <Route path="/organizations/approval" element={<OrganizationApproval />} />
                      <Route path="/organizations/permissions" element={<OrganizationPermissions />} />
                      <Route path="/organizations/statistics" element={<OrganizationStatistics />} />
                      
                      {/* Case Package Routes */}
                      <Route path="/case-packages" element={<CasePackageList />} />
                      <Route path="/case-packages/:id" element={<CasePackageDetail />} />
                      
                      {/* Case Routes */}
                      <Route path="/cases" element={<CaseList />} />
                      <Route path="/cases/timeline/:casePackageId" element={<CaseTimeline />} />
                      
                      {/* Assignment Routes */}
                      <Route path="/assignment/config" element={<AssignmentConfig />} />
                      
                      {/* Contract Routes */}
                      <Route path="/contracts" element={<ContractList />} />
                      
                      {/* Report Routes */}
                      <Route path="/reports" element={<ReportDashboard />} />
                      
                      {/* Fallback route */}
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AntdApp>
  );
};

export default App;