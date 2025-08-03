import api from '@/utils/api';

// 仪表盘数据接口
export interface DashboardData {
  overview: OverviewData;
  trends: TrendData[];
  charts: Record<string, any>;
  rankings: RankingData[];
}

export interface OverviewData {
  totalCases: number;
  completedCases: number;
  totalAmount: number;
  recoveredAmount: number;
  recoveryRate: number;
  avgProcessingDays: number;
  
  // 案源方特有
  activePackages?: number;
  partneredOrgs?: number;
  
  // 处置方特有
  staffCount?: number;
  casesPerStaff?: number;
  successRate?: number;
  
  // 平台方特有
  totalOrgs?: number;
  activeOrgs?: number;
  totalCasesLong?: number;
  totalRevenue?: number;
}

export interface TrendData {
  date: string;
  label: string;
  value: number;
  count: number;
  category: string;
}

export interface RankingData {
  id: number;
  name: string;
  value: number;
  rank: number;
  category: string;
  details: Record<string, any>;
}

export interface DistributionData {
  name: string;
  value: number;
  count: number;
  percentage: number;
}

export interface ComparisonData {
  name: string;
  currentValue: number;
  previousValue: number;
  changeRate: number;
  changeDirection: 'UP' | 'DOWN' | 'STABLE';
}

export interface DashboardQueryParams {
  startDate: string;
  endDate: string;
  organizationId?: number;
  organizationType?: string;
  regionCodes?: string[];
  caseTypes?: string[];
  dimension?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  metrics?: string[];
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  limit?: number;
  includeComparison?: boolean;
  comparisonPeriod?: 'PREVIOUS_PERIOD' | 'SAME_PERIOD_LAST_YEAR';
}

// 报表分析服务
export const reportService = {
  // 获取案源方业绩看板
  getSourceOrgDashboard: async (organizationId: number, params: DashboardQueryParams): Promise<DashboardData> => {
    const response = await api.get(`/api/reports/source-dashboard/${organizationId}`, { params });
    return response.data;
  },

  // 获取处置方效能看板
  getDisposalOrgDashboard: async (organizationId: number, params: DashboardQueryParams): Promise<DashboardData> => {
    const response = await api.get(`/api/reports/disposal-dashboard/${organizationId}`, { params });
    return response.data;
  },

  // 获取平台运营看板
  getPlatformOperationDashboard: async (params: DashboardQueryParams): Promise<DashboardData> => {
    const response = await api.get('/api/reports/platform-dashboard', { params });
    return response.data;
  },

  // 获取处置机构业绩对比
  getDisposalOrgPerformanceComparison: async (sourceOrgId: number, params: DashboardQueryParams): Promise<RankingData[]> => {
    const response = await api.get(`/api/reports/disposal-comparison/${sourceOrgId}`, { params });
    return response.data;
  },

  // 获取员工业绩排行
  getStaffPerformanceRanking: async (disposalOrgId: number, params: DashboardQueryParams): Promise<RankingData[]> => {
    const response = await api.get(`/api/reports/staff-ranking/${disposalOrgId}`, { params });
    return response.data;
  },

  // 获取案件类型分析
  getCaseTypeAnalysis: async (organizationId?: number, params?: DashboardQueryParams): Promise<DistributionData[]> => {
    const response = await api.get('/api/reports/case-type-analysis', { 
      params: { organizationId, ...params } 
    });
    return response.data;
  },

  // 获取地域分析
  getRegionalAnalysis: async (organizationId?: number, params?: DashboardQueryParams): Promise<DistributionData[]> => {
    const response = await api.get('/api/reports/regional-analysis', { 
      params: { organizationId, ...params } 
    });
    return response.data;
  },

  // 获取回款趋势分析
  getRecoveryTrendAnalysis: async (organizationId?: number, params?: DashboardQueryParams): Promise<TrendData[]> => {
    const response = await api.get('/api/reports/recovery-trend', { 
      params: { organizationId, ...params } 
    });
    return response.data;
  },

  // 获取案件状态分布
  getCaseStatusDistribution: async (organizationId?: number, params?: DashboardQueryParams): Promise<DistributionData[]> => {
    const response = await api.get('/api/reports/case-status-distribution', { 
      params: { organizationId, ...params } 
    });
    return response.data;
  },

  // 获取实时统计数据
  getRealTimeStatistics: async (organizationId?: number): Promise<Record<string, any>> => {
    const response = await api.get('/api/reports/real-time-stats', { 
      params: { organizationId } 
    });
    return response.data;
  },

  // 生成统计报表
  generateStatisticsReport: async (reportType: string, organizationId?: number, params?: DashboardQueryParams): Promise<string> => {
    const response = await api.post(`/api/reports/generate/${reportType}`, params, {
      params: { organizationId }
    });
    return response.data;
  },

  // 获取机构活跃度趋势
  getOrganizationActivityTrend: async (params: DashboardQueryParams): Promise<TrendData[]> => {
    const response = await api.get('/api/reports/organization-activity-trend', { params });
    return response.data;
  },

  // 获取平台收入分析
  getPlatformRevenueAnalysis: async (params: DashboardQueryParams): Promise<Record<string, any>> => {
    const response = await api.get('/api/reports/platform-revenue-analysis', { params });
    return response.data;
  },

  // 获取处置方式效果对比
  getDisposalMethodEffectiveness: async (organizationId?: number, params?: DashboardQueryParams): Promise<ComparisonData[]> => {
    const response = await api.get('/api/reports/disposal-method-effectiveness', { 
      params: { organizationId, ...params } 
    });
    return response.data;
  },

  // 手动触发统计数据聚合
  aggregateStatistics: async (date: string): Promise<string> => {
    const response = await api.post('/api/reports/aggregate-statistics', null, {
      params: { date }
    });
    return response.data;
  }
};