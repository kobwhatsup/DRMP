import {
  DashboardOutlined, BankOutlined, TeamOutlined, FileTextOutlined,
  SettingOutlined, AuditOutlined, BarChartOutlined, EnvironmentOutlined,
  UserOutlined, SafetyCertificateOutlined, TrophyOutlined, DollarOutlined,
  ApiOutlined, LineChartOutlined, SearchOutlined, ThunderboltOutlined,
  ExperimentOutlined, FileProtectOutlined, AlertOutlined, MoneyCollectOutlined
} from '@ant-design/icons';

export interface MenuItem {
  key: string;
  path: string;
  name: string;
  icon?: any;
  children?: MenuItem[];
  hidden?: boolean;
  roles?: string[];
}

// 主菜单配置
export const mainMenuConfig: MenuItem[] = [
  {
    key: 'dashboard',
    path: '/dashboard',
    name: '工作台',
    icon: DashboardOutlined,
  },
  {
    key: 'source-orgs',
    path: '/source-orgs',
    name: '案源机构管理',
    icon: BankOutlined,
    children: [
      {
        key: 'source-orgs-list',
        path: '/source-orgs',
        name: '机构列表',
        icon: BankOutlined,
      },
      {
        key: 'source-orgs-map',
        path: '/source-orgs/map',
        name: '地理分布',
        icon: EnvironmentOutlined,
      },
      {
        key: 'source-orgs-stats',
        path: '/source-orgs/stats',
        name: '案件统计',
        icon: LineChartOutlined,
      },
      {
        key: 'source-orgs-cooperation',
        path: '/source-orgs/cooperation',
        name: '合作管理',
        icon: MoneyCollectOutlined,
      },
      {
        key: 'source-orgs-api',
        path: '/source-orgs/api',
        name: 'API管理',
        icon: ApiOutlined,
      },
      {
        key: 'source-orgs-quality',
        path: '/source-orgs/quality',
        name: '质量分析',
        icon: TrophyOutlined,
      }
    ]
  },
  {
    key: 'disposal-orgs',
    path: '/disposal-orgs',
    name: '处置机构管理',
    icon: TeamOutlined,
    children: [
      {
        key: 'disposal-orgs-list',
        path: '/disposal-orgs',
        name: '机构列表',
        icon: TeamOutlined,
      },
      {
        key: 'disposal-orgs-map',
        path: '/disposal-orgs/map',
        name: '地理分布',
        icon: EnvironmentOutlined,
      },
      {
        key: 'disposal-orgs-performance',
        path: '/disposal-orgs/performance',
        name: '业绩统计',
        icon: BarChartOutlined,
      },
      {
        key: 'disposal-orgs-capacity',
        path: '/disposal-orgs/capacity',
        name: '产能管理',
        icon: ThunderboltOutlined,
      },
      {
        key: 'disposal-orgs-resource',
        path: '/disposal-orgs/resource',
        name: '资源管理',
        icon: UserOutlined,
      },
      {
        key: 'disposal-orgs-membership',
        path: '/disposal-orgs/membership',
        name: '会员管理',
        icon: SafetyCertificateOutlined,
      }
    ]
  },
  {
    key: 'audit-center',
    path: '/audit-center',
    name: '机构审核中心',
    icon: AuditOutlined,
    children: [
      {
        key: 'audit-dashboard',
        path: '/audit-center/dashboard',
        name: '审核仪表板',
        icon: DashboardOutlined,
      },
      {
        key: 'audit-applications',
        path: '/audit-center',
        name: '申请审核',
        icon: AuditOutlined,
      },
      {
        key: 'audit-documents',
        path: '/audit-center/documents',
        name: '文件审核',
        icon: FileProtectOutlined,
      },
      {
        key: 'audit-risk',
        path: '/audit-center/risk',
        name: '风险评估',
        icon: AlertOutlined,
      }
    ]
  },
  {
    key: 'case-management',
    path: '/cases',
    name: '案件管理',
    icon: FileTextOutlined,
    children: [
      {
        key: 'case-packages',
        path: '/cases/packages',
        name: '案件包管理',
        icon: FileTextOutlined,
      },
      {
        key: 'case-market',
        path: '/cases/market',
        name: '案件市场',
        icon: SearchOutlined,
      },
      {
        key: 'case-assignment',
        path: '/assignment',
        name: '智能分案',
        icon: ExperimentOutlined,
      }
    ]
  },
  {
    key: 'contract-management',
    path: '/contracts',
    name: '合同管理',
    icon: FileProtectOutlined,
  },
  {
    key: 'reports',
    path: '/reports',
    name: '报表分析',
    icon: BarChartOutlined,
  },
  {
    key: 'system',
    path: '/system',
    name: '系统管理',
    icon: SettingOutlined,
    roles: ['admin'],
    children: [
      {
        key: 'system-users',
        path: '/system/users',
        name: '用户管理',
        icon: UserOutlined,
      },
      {
        key: 'system-roles',
        path: '/system/roles',
        name: '角色管理',
        icon: SafetyCertificateOutlined,
      },
      {
        key: 'system-settings',
        path: '/system/settings',
        name: '系统设置',
        icon: SettingOutlined,
      }
    ]
  }
];

// 案源机构专属菜单（机构用户登录后看到的菜单）
export const sourceOrgMenuConfig: MenuItem[] = [
  {
    key: 'dashboard',
    path: '/dashboard',
    name: '工作台',
    icon: DashboardOutlined,
  },
  {
    key: 'my-org',
    path: '/my-org',
    name: '我的机构',
    icon: BankOutlined,
    children: [
      {
        key: 'my-org-profile',
        path: '/my-org/profile',
        name: '机构信息',
        icon: BankOutlined,
      },
      {
        key: 'my-org-api',
        path: '/my-org/api',
        name: 'API配置',
        icon: ApiOutlined,
      },
      {
        key: 'my-org-cooperation',
        path: '/my-org/cooperation',
        name: '合作状态',
        icon: MoneyCollectOutlined,
      }
    ]
  },
  {
    key: 'case-publish',
    path: '/case-publish',
    name: '案件发布',
    icon: FileTextOutlined,
    children: [
      {
        key: 'case-packages',
        path: '/case-packages',
        name: '案件包管理',
        icon: FileTextOutlined,
      },
      {
        key: 'case-templates',
        path: '/case-templates',
        name: '发布模板',
        icon: FileProtectOutlined,
      },
      {
        key: 'case-quality',
        path: '/case-quality',
        name: '质量检查',
        icon: TrophyOutlined,
      }
    ]
  },
  {
    key: 'disposal-partners',
    path: '/disposal-partners',
    name: '处置伙伴',
    icon: TeamOutlined,
    children: [
      {
        key: 'partner-selection',
        path: '/disposal-partners/selection',
        name: '机构选择',
        icon: SearchOutlined,
      },
      {
        key: 'partner-performance',
        path: '/disposal-partners/performance',
        name: '合作业绩',
        icon: BarChartOutlined,
      }
    ]
  },
  {
    key: 'financial',
    path: '/financial',
    name: '财务管理',
    icon: DollarOutlined,
    children: [
      {
        key: 'financial-billing',
        path: '/financial/billing',
        name: '账单管理',
        icon: MoneyCollectOutlined,
      },
      {
        key: 'financial-reports',
        path: '/financial/reports',
        name: '财务报表',
        icon: BarChartOutlined,
      }
    ]
  },
  {
    key: 'reports',
    path: '/reports',
    name: '数据报表',
    icon: BarChartOutlined,
  }
];

// 处置机构专属菜单（机构用户登录后看到的菜单）
export const disposalOrgMenuConfig: MenuItem[] = [
  {
    key: 'dashboard',
    path: '/dashboard',
    name: '工作台',
    icon: DashboardOutlined,
  },
  {
    key: 'my-org',
    path: '/my-org',
    name: '我的机构',
    icon: TeamOutlined,
    children: [
      {
        key: 'my-org-profile',
        path: '/my-org/profile',
        name: '机构信息',
        icon: TeamOutlined,
      },
      {
        key: 'my-org-capacity',
        path: '/my-org/capacity',
        name: '产能管理',
        icon: ThunderboltOutlined,
      },
      {
        key: 'my-org-team',
        path: '/my-org/team',
        name: '团队管理',
        icon: UserOutlined,
      },
      {
        key: 'my-org-membership',
        path: '/my-org/membership',
        name: '会员中心',
        icon: SafetyCertificateOutlined,
      }
    ]
  },
  {
    key: 'case-market',
    path: '/case-market',
    name: '案件市场',
    icon: SearchOutlined,
    children: [
      {
        key: 'case-browse',
        path: '/case-market/browse',
        name: '浏览案件',
        icon: SearchOutlined,
      },
      {
        key: 'case-bidding',
        path: '/case-market/bidding',
        name: '竞标管理',
        icon: ExperimentOutlined,
      },
      {
        key: 'case-received',
        path: '/case-market/received',
        name: '承接案件',
        icon: FileTextOutlined,
      }
    ]
  },
  {
    key: 'case-disposal',
    path: '/case-disposal',
    name: '案件处置',
    icon: FileTextOutlined,
    children: [
      {
        key: 'case-processing',
        path: '/case-disposal/processing',
        name: '处理中案件',
        icon: FileTextOutlined,
      },
      {
        key: 'case-completed',
        path: '/case-disposal/completed',
        name: '已完成案件',
        icon: TrophyOutlined,
      },
      {
        key: 'case-timeline',
        path: '/case-disposal/timeline',
        name: '处置时间线',
        icon: LineChartOutlined,
      }
    ]
  },
  {
    key: 'source-partners',
    path: '/source-partners',
    name: '案源伙伴',
    icon: BankOutlined,
    children: [
      {
        key: 'partner-cooperation',
        path: '/source-partners/cooperation',
        name: '合作状态',
        icon: MoneyCollectOutlined,
      },
      {
        key: 'partner-evaluation',
        path: '/source-partners/evaluation',
        name: '合作评价',
        icon: TrophyOutlined,
      }
    ]
  },
  {
    key: 'performance',
    path: '/performance',
    name: '业绩管理',
    icon: BarChartOutlined,
    children: [
      {
        key: 'performance-stats',
        path: '/performance/stats',
        name: '业绩统计',
        icon: BarChartOutlined,
      },
      {
        key: 'performance-analysis',
        path: '/performance/analysis',
        name: '业绩分析',
        icon: LineChartOutlined,
      }
    ]
  },
  {
    key: 'financial',
    path: '/financial',
    name: '财务管理',
    icon: DollarOutlined,
    children: [
      {
        key: 'financial-income',
        path: '/financial/income',
        name: '收入管理',
        icon: MoneyCollectOutlined,
      },
      {
        key: 'financial-settlement',
        path: '/financial/settlement',
        name: '结算管理',
        icon: DollarOutlined,
      },
      {
        key: 'financial-reports',
        path: '/financial/reports',
        name: '财务报表',
        icon: BarChartOutlined,
      }
    ]
  }
];

// 根据用户角色获取对应的菜单配置
export const getMenuConfigByUserType = (userType: 'admin' | 'source_org' | 'disposal_org'): MenuItem[] => {
  switch (userType) {
    case 'admin':
      return mainMenuConfig;
    case 'source_org':
      return sourceOrgMenuConfig;
    case 'disposal_org':
      return disposalOrgMenuConfig;
    default:
      return mainMenuConfig;
  }
};

// 获取面包屑导航
export const getBreadcrumb = (pathname: string, menuConfig: MenuItem[]): Array<{name: string, path?: string}> => {
  const breadcrumb: Array<{name: string, path?: string}> = [];
  
  const findBreadcrumb = (items: MenuItem[], currentPath: string, parents: Array<{name: string, path?: string}> = []) => {
    for (const item of items) {
      const newParents = [...parents, { name: item.name, path: item.path }];
      
      if (item.path === currentPath) {
        breadcrumb.push(...newParents);
        return true;
      }
      
      if (item.children) {
        if (findBreadcrumb(item.children, currentPath, newParents)) {
          return true;
        }
      }
    }
    return false;
  };
  
  findBreadcrumb(menuConfig, pathname);
  return breadcrumb;
};