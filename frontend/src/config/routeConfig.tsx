import React from 'react';
import { RouteObject } from 'react-router-dom';

// 页面组件导入
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/auth/Login';

// 案源机构管理
import SourceOrgList from '@/pages/source-org/SourceOrgList';
import SourceOrgDetail from '@/pages/source-org/SourceOrgDetail';
import SourceOrgForm from '@/pages/source-org/SourceOrgForm';
import SourceOrgCaseStats from '@/pages/source-org/SourceOrgCaseStats';
import SourceOrgCasePublishStats from '@/pages/source-org/SourceOrgCasePublishStats';
import SourceOrgCooperationManagement from '@/pages/source-org/SourceOrgCooperationManagement';
import SourceOrgQualityAnalysis from '@/pages/source-org/SourceOrgQualityAnalysis';
import SourceOrgAPIManagement from '@/pages/source-org/SourceOrgAPIManagement';

// 处置机构管理
import DisposalOrgList from '@/pages/disposal-org/DisposalOrgList';
import DisposalOrgDetail from '@/pages/disposal-org/DisposalOrgDetail';
import DisposalOrgForm from '@/pages/disposal-org/DisposalOrgForm';
import DisposalOrgRegister from '@/pages/disposal-org/DisposalOrgRegister';
import RegisterSuccess from '@/pages/disposal-org/RegisterSuccess';
import DisposalOrgCapabilityMatching from '@/pages/disposal-org/DisposalOrgCapabilityMatching';
import CaseProcessingWorkbench from '@/pages/disposal-org/CaseProcessingWorkbench';
import DisposalPerformanceDashboard from '@/pages/disposal-org/DisposalPerformanceDashboard';
import ReconciliationSettlement from '@/pages/disposal-org/ReconciliationSettlement';
import DisposalOrgPerformanceStats from '@/pages/disposal-org/DisposalOrgPerformanceStats';
import DisposalOrgCapacityManagement from '@/pages/disposal-org/DisposalOrgCapacityManagement';
import DisposalOrgResourceManagement from '@/pages/disposal-org/DisposalOrgResourceManagement';
import DisposalOrgMembershipManagement from '@/pages/disposal-org/DisposalOrgMembershipManagement';

// 处置管理
import DisposalOverview from '@/pages/disposal-management';
import MediationManagement from '@/pages/disposal-management/mediation';
import LitigationManagement from '@/pages/disposal-management/litigation';
import DisposalConversion from '@/pages/disposal-management/conversion';
import DisposalAnalysis from '@/pages/disposal-management/analysis';

// 机构审核中心
import OrgAuditCenter from '@/pages/audit-center/OrgAuditCenter';
import AuditDashboard from '@/pages/audit-center/AuditDashboard';
import DocumentReview from '@/pages/audit-center/DocumentReview';
import RiskAssessment from '@/pages/audit-center/RiskAssessment';

// 案件管理
import CasePackageList from '@/pages/case-packages/CasePackageList';
import CasePackageDetail from '@/pages/case-packages/CasePackageDetail';
import CaseList from '@/pages/case/CaseList';
import CaseDetail from '@/pages/case/CaseDetail';
import CaseTimeline from '@/pages/case/CaseTimeline';
import CaseMarket from '@/pages/cases/CaseMarket';
import CaseReportAnalysis from '@/pages/cases/CaseReportAnalysis';
import IDSSystemIntegration from '@/pages/cases/IDSSystemIntegration';
import CaseManagementTest from '@/pages/cases/CaseManagementTest';

// 案件发布
import CasePublishTemplates from '@/pages/case-publish/CasePublishTemplates';

// 案件包创建
import CreateCasePackage from '@/pages/case-packages/CreateCasePackage';

// 竞标管理
import BiddingManagement from '@/pages/case-market/BiddingManagement';

// 合作评价
import CooperationEvaluation from '@/pages/source-partners/CooperationEvaluation';

// 业绩分析
import PerformanceAnalysis from '@/pages/performance/PerformanceAnalysis';

// 财务管理
import RevenueManagement from '@/pages/financial/RevenueManagement';
import CaseReconciliation from '@/pages/financial/CaseReconciliation';
import SettlementManagement from '@/pages/financial/SettlementManagement';
import MembershipPayment from '@/pages/financial/MembershipPayment';

// 智能分案
import AssignmentConfig from '@/pages/assignment/AssignmentConfig';

// 合同管理
import ContractList from '@/pages/contract/ContractList';

// 报表分析
import ReportDashboard from '@/pages/report/ReportDashboard';
import SourceOrgDashboardWrapper from '@/pages/reports/SourceOrgDashboardWrapper';
import DisposalOrgDashboardWrapper from '@/pages/reports/DisposalOrgDashboardWrapper';
import PlatformOperationDashboard from '@/pages/reports/PlatformOperationDashboard';

// 系统管理
import UserManagement from '@/pages/system/UserManagement';
import RoleManagement from '@/pages/system/RoleManagement';
import SystemSettings from '@/pages/system/SystemSettings';
import MenuManagement from '@/pages/system/MenuManagement';
import PermissionManagement from '@/pages/system/PermissionManagement';
import OperationLogManagement from '@/pages/system/OperationLogManagement';
import ConfigManagement from '@/pages/system/ConfigManagement';

// 地图组件
import CaseDistributionMap from '@/components/map/CaseDistributionMap';
import DisposalOrgMap from '@/components/map/DisposalOrgMap';


// 主路由配置（管理员视角）
export const mainRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Dashboard />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  
  // 案源机构管理路由
  {
    path: '/source-orgs',
    children: [
      {
        index: true,
        element: <SourceOrgList />,
      },
      {
        path: 'create',
        element: <SourceOrgForm />,
      },
      {
        path: ':id',
        element: <SourceOrgDetail />,
      },
      {
        path: ':id/edit',
        element: <SourceOrgForm />,
      },
      {
        path: 'map',
        element: <CaseDistributionMap />,
      },
      {
        path: 'stats',
        element: <SourceOrgCaseStats />,
      },
      {
        path: 'cooperation',
        element: <SourceOrgCooperationManagement />,
      },
      {
        path: 'api',
        element: <SourceOrgAPIManagement />,
      },
      {
        path: 'quality',
        element: <SourceOrgQualityAnalysis />,
      },
    ],
  },
  
  // 处置机构管理路由
  {
    path: '/disposal-orgs',
    children: [
      {
        index: true,
        element: <DisposalOrgList />,
      },
      {
        path: 'create',
        element: <DisposalOrgForm />,
      },
      {
        path: 'register',
        element: <DisposalOrgRegister />,
      },
      {
        path: 'register-success',
        element: <RegisterSuccess />,
      },
      {
        path: ':id',
        element: <DisposalOrgDetail />,
      },
      {
        path: ':id/edit',
        element: <DisposalOrgForm />,
      },
      {
        path: 'map',
        element: <DisposalOrgMap />,
      },
      {
        path: 'performance',
        element: <DisposalOrgPerformanceStats />,
      },
      {
        path: 'dashboard',
        element: <DisposalPerformanceDashboard />,
      },
      {
        path: 'capacity',
        element: <DisposalOrgCapacityManagement />,
      },
      {
        path: 'resource',
        element: <DisposalOrgResourceManagement />,
      },
      {
        path: 'membership',
        element: <DisposalOrgMembershipManagement />,
      },
      {
        path: 'matching',
        element: <DisposalOrgCapabilityMatching />,
      },
      {
        path: 'workbench',
        element: <CaseProcessingWorkbench />,
      },
      {
        path: 'settlement',
        element: <ReconciliationSettlement />,
      },
    ],
  },
  
  // 机构审核中心路由
  {
    path: '/audit-center',
    children: [
      {
        index: true,
        element: <OrgAuditCenter />,
      },
      {
        path: 'dashboard',
        element: <AuditDashboard />,
      },
      {
        path: 'documents',
        element: <DocumentReview />,
      },
      {
        path: 'risk',
        element: <RiskAssessment />,
      },
    ],
  },
  
  // 案件管理路由
  {
    path: '/cases',
    children: [
      {
        path: 'packages',
        children: [
          {
            index: true,
            element: <CasePackageList />,
          },
          {
            path: ':id',
            element: <CasePackageDetail />,
          },
        ],
      },
      {
        path: 'market',
        element: <CaseMarket />,
      },
      {
        path: 'list',
        element: <CaseList />,
      },
      {
        path: 'detail/:id',
        element: <CaseDetail />,
      },
      {
        path: 'timeline',
        element: <CaseTimeline />,
      },
      {
        path: 'reports',
        element: <CaseReportAnalysis />,
      },
      {
        path: 'ids-integration',
        element: <IDSSystemIntegration />,
      },
      {
        path: 'test',
        element: <CaseManagementTest />,
      },
      {
        path: 'document-templates',
        element: React.createElement(React.lazy(() => import('@/pages/documents/DocumentTemplateManagement'))),
      },
    ],
  },
  
  // 智能分案路由
  {
    path: '/assignment',
    element: <AssignmentConfig />,
  },
  
  // 处置管理路由
  {
    path: '/disposal-management',
    children: [
      {
        index: true,
        element: <DisposalOverview />,
      },
      {
        path: 'mediation',
        children: [
          {
            index: true,
            element: <MediationManagement />,
          },
        ],
      },
      {
        path: 'litigation',
        children: [
          {
            index: true,
            element: <LitigationManagement />,
          },
        ],
      },
      {
        path: 'conversion',
        children: [
          {
            index: true,
            element: <DisposalConversion />,
          },
        ],
      },
      {
        path: 'analysis',
        children: [
          {
            index: true,
            element: <DisposalAnalysis />,
          },
        ],
      },
    ],
  },
  
  // 合同管理路由
  {
    path: '/contracts',
    element: <ContractList />,
  },
  
  // 报表分析路由
  {
    path: '/reports',
    children: [
      {
        index: true,
        element: <ReportDashboard />,
      },
      {
        path: 'source-org/:orgId',
        element: <SourceOrgDashboardWrapper />,
      },
      {
        path: 'disposal-org/:orgId',
        element: <DisposalOrgDashboardWrapper />,
      },
      {
        path: 'platform',
        element: <PlatformOperationDashboard />,
      },
    ],
  },
  
  
  
  // 财务管理路由
  {
    path: '/financial',
    children: [
      {
        path: 'revenue',
        element: <RevenueManagement />,
      },
      {
        path: 'reconciliation',
        element: <CaseReconciliation />,
      },
      {
        path: 'settlement',
        element: <SettlementManagement />,
      },
      {
        path: 'membership',
        element: <MembershipPayment />,
      },
    ],
  },
  
  // 系统管理路由
  {
    path: '/system',
    children: [
      {
        path: 'users',
        element: <UserManagement />,
      },
      {
        path: 'roles',
        element: <RoleManagement />,
      },
      {
        path: 'menus',
        element: <MenuManagement />,
      },
      {
        path: 'permissions',
        element: <PermissionManagement />,
      },
      {
        path: 'settings',
        element: <SystemSettings />,
      },
      {
        path: 'logs',
        element: <OperationLogManagement />,
      },
      {
        path: 'configs',
        element: <ConfigManagement />,
      },
      {
        path: 'access-keys',
        children: [
          {
            index: true,
            element: React.createElement(React.lazy(() => import('@/pages/access-keys/AccessKeyList'))),
          },
          {
            path: 'stats',
            element: React.createElement(React.lazy(() => import('@/pages/access-keys/KeyUsageStats'))),
          },
        ],
      },
    ],
  },
];

// 案源机构专属路由配置
export const sourceOrgRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Dashboard />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  
  // 我的机构
  {
    path: '/my-org',
    children: [
      {
        path: 'profile',
        element: <SourceOrgDetail />,
      },
      {
        path: 'api',
        element: <SourceOrgAPIManagement />,
      },
      {
        path: 'cooperation',
        element: <SourceOrgCooperationManagement />,
      },
    ],
  },
  
  // 案件发布
  {
    path: '/case-publish',
    children: [
      {
        path: 'packages',
        element: <CasePackageList />,
      },
      {
        path: 'templates',
        element: <CasePublishTemplates />,
      },
      {
        path: 'quality',
        element: <SourceOrgQualityAnalysis />,
      },
    ],
  },
  
  // 案件包管理
  {
    path: '/case-packages',
    children: [
      {
        index: true,
        element: <CasePackageList />,
      },
      {
        path: 'create',
        element: <CreateCasePackage />,
      },
      {
        path: ':id',
        element: <CasePackageDetail />,
      },
    ],
  },
  
  // 处置伙伴
  {
    path: '/disposal-partners',
    children: [
      {
        path: 'selection',
        element: <DisposalOrgList />,
      },
      {
        path: 'performance',
        element: <DisposalOrgPerformanceStats />,
      },
    ],
  },
  
  // 财务管理
  {
    path: '/financial',
    children: [
      {
        path: 'billing',
        element: <div>账单管理</div>, // TODO: 创建组件
      },
      {
        path: 'reports',
        element: <ReportDashboard />,
      },
    ],
  },
  
  // 数据报表
  {
    path: '/reports',
    children: [
      {
        index: true,
        element: <ReportDashboard />,
      },
      {
        path: 'dashboard',
        element: <SourceOrgDashboardWrapper />,
      },
    ],
  },
];

// 处置机构专属路由配置
export const disposalOrgRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Dashboard />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  
  // 我的机构
  {
    path: '/my-org',
    children: [
      {
        path: 'profile',
        element: <DisposalOrgDetail />,
      },
      {
        path: 'capacity',
        element: <DisposalOrgCapacityManagement />,
      },
      {
        path: 'team',
        element: <DisposalOrgResourceManagement />,
      },
      {
        path: 'membership',
        element: <DisposalOrgMembershipManagement />,
      },
    ],
  },
  
  // 案件市场
  {
    path: '/case-market',
    children: [
      {
        path: 'browse',
        element: <CaseMarket />,
      },
      {
        path: 'bidding',
        element: <BiddingManagement />,
      },
      {
        path: 'received',
        element: <CaseList />,
      },
    ],
  },
  
  // 案件处置
  {
    path: '/case-disposal',
    children: [
      {
        path: 'workbench',
        element: <CaseProcessingWorkbench />,
      },
      {
        path: 'processing',
        element: <CaseList />,
      },
      {
        path: 'completed',
        element: <CaseList />,
      },
      {
        path: 'timeline',
        element: <CaseTimeline />,
      },
    ],
  },
  
  // 案源伙伴
  {
    path: '/source-partners',
    children: [
      {
        path: 'cooperation',
        element: <SourceOrgCooperationManagement />,
      },
      {
        path: 'evaluation',
        element: <CooperationEvaluation />,
      },
    ],
  },
  
  // 业绩管理
  {
    path: '/performance',
    children: [
      {
        path: 'dashboard',
        element: <DisposalPerformanceDashboard />,
      },
      {
        path: 'stats',
        element: <DisposalOrgPerformanceStats />,
      },
      {
        path: 'analysis',
        element: <PerformanceAnalysis />,
      },
    ],
  },
  
  // 财务管理
  {
    path: '/financial',
    children: [
      {
        path: 'income',
        element: <RevenueManagement />,
      },
      {
        path: 'settlement',
        element: <ReconciliationSettlement />,
      },
      {
        path: 'reports',
        element: <ReportDashboard />,
      },
    ],
  },
  
  // 数据报表
  {
    path: '/reports',
    children: [
      {
        index: true,
        element: <ReportDashboard />,
      },
      {
        path: 'dashboard',
        element: <DisposalOrgDashboardWrapper />,
      },
    ],
  },
];

// 公共路由（登录等）
export const publicRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/disposal-org/register',
    element: <DisposalOrgRegister />,
  },
  {
    path: '/disposal-org/register-success',
    element: <RegisterSuccess />,
  },
];

// 根据用户类型获取对应的路由配置
export const getRoutesByUserType = (userType: 'admin' | 'source_org' | 'disposal_org'): RouteObject[] => {
  switch (userType) {
    case 'admin':
      return mainRoutes;
    case 'source_org':
      return sourceOrgRoutes;
    case 'disposal_org':
      return disposalOrgRoutes;
    default:
      return mainRoutes;
  }
};