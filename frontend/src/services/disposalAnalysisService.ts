import { apiService } from './api';

// 处置分析相关接口定义

/**
 * 查询请求参数
 */
export interface DisposalAnalysisQueryRequest {
  startTime: string;
  endTime: string;
  orgIds?: number[];
  disposalTypes?: string[];
  caseStatuses?: string[];
  regionCodes?: string[];
  minAmount?: number;
  maxAmount?: number;
  analysisDimension?: string;
  aggregatePeriod?: string;
  includePrediction?: boolean;
  comparisonType?: string;
  page?: number;
  size?: number;
}

/**
 * 查询时间范围
 */
export interface QueryTimeRange {
  startTime: string;
  endTime: string;
  aggregatePeriod: string;
}

/**
 * 总体统计数据
 */
export interface OverviewStatistics {
  totalCases: number;
  mediationCases: number;
  litigationCases: number;
  completedCases: number;
  pendingCases: number;
  successRate: number;
  averageProcessingDays: number;
  totalAmount: number;
  recoveredAmount: number;
  recoveryRate: number;
  averageCost: number;
  yearOverYear?: ComparisonData;
  monthOverMonth?: ComparisonData;
}

/**
 * 趋势数据点
 */
export interface TrendDataPoint {
  period: string;
  periodStart: string;
  periodEnd: string;
  mediationCases: number;
  litigationCases: number;
  completedCases: number;
  successRate: number;
  averageProcessingDays: number;
  recoveryRate: number;
  totalAmount: number;
  recoveredAmount: number;
}

/**
 * 机构绩效数据
 */
export interface OrganizationPerformance {
  orgId: number;
  orgName: string;
  orgType: string;
  totalCases: number;
  completedCases: number;
  successRate: number;
  averageProcessingDays: number;
  totalAmount: number;
  recoveredAmount: number;
  recoveryRate: number;
  averageCost: number;
  performanceScore: number;
  performanceRank: string;
}

/**
 * 类型分布数据
 */
export interface TypeDistribution {
  type: string;
  typeName: string;
  caseCount: number;
  percentage: number;
  totalAmount: number;
  averageAmount: number;
  color: string;
}

/**
 * 效率分析数据
 */
export interface EfficiencyAnalysis {
  overallEfficiency: number;
  mediationEfficiency: number;
  litigationEfficiency: number;
  efficiencyTrends: EfficiencyTrend[];
  bottlenecks: BottleneckAnalysis[];
}

/**
 * 效率趋势
 */
export interface EfficiencyTrend {
  period: string;
  efficiency: number;
  trendDirection: 'UP' | 'DOWN' | 'STABLE';
}

/**
 * 瓶颈分析
 */
export interface BottleneckAnalysis {
  processStage: string;
  averageDays: number;
  impactScore: number;
  suggestion: string;
}

/**
 * 地域分析数据
 */
export interface RegionAnalysis {
  regionCode: string;
  regionName: string;
  caseCount: number;
  successRate: number;
  averageProcessingDays: number;
  totalAmount: number;
  recoveryRate: number;
}

/**
 * 预警数据
 */
export interface AlertData {
  alertType: string;
  alertLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  alertMessage: string;
  alertDetails: Record<string, any>;
  alertTime: string;
  suggestedAction: string;
}

/**
 * 预测数据
 */
export interface PredictionData {
  period: string;
  periodStart: string;
  periodEnd: string;
  predictedCases: number;
  predictedSuccessRate: number;
  predictedRecoveryRate: number;
  confidenceLevel: number;
  predictionModel: string;
}

/**
 * 对比数据
 */
export interface ComparisonData {
  changeRate: number;
  changeDirection: 'UP' | 'DOWN' | 'STABLE';
  changeDescription: string;
  detailedChanges: Record<string, number>;
}

/**
 * 综合分析响应
 */
export interface DisposalAnalysisResponse {
  queryTimeRange: QueryTimeRange;
  overviewStatistics: OverviewStatistics;
  trendData: TrendDataPoint[];
  orgPerformanceData: OrganizationPerformance[];
  typeDistributionData: TypeDistribution[];
  efficiencyAnalysis: EfficiencyAnalysis;
  regionAnalysisData: RegionAnalysis[];
  alertData: AlertData[];
  predictionData?: PredictionData[];
}

/**
 * 关键指标数据
 */
export interface KeyIndicator {
  title: string;
  icon: string;
  color: string;
  description: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
  trendValue: string;
}

/**
 * 实时数据
 */
export interface RealtimeData {
  timestamp: string;
  totalActiveCases: number;
  todayCompletedCases: number;
  todayNewCases: number;
  currentSuccessRate: number;
  activeOrganizations: number;
  avgProcessingTime: number;
  hourlyTrends: Array<{
    hour: number;
    completedCases: number;
    newCases: number;
  }>;
}

/**
 * 导出结果
 */
export interface ExportResult {
  downloadUrl: string;
  fileName: string;
  fileSize: string;
  generatedAt: string;
  status: string;
}

// 处置分析服务API
export const disposalAnalysisAPI = {
  
  /**
   * 获取综合分析数据
   */
  getComprehensiveAnalysis: (params: DisposalAnalysisQueryRequest) =>
    apiService.post<DisposalAnalysisResponse>('/v1/disposal-analysis/comprehensive', params),

  /**
   * 获取概览统计
   */
  getOverviewStatistics: (params: DisposalAnalysisQueryRequest) =>
    apiService.post<OverviewStatistics>('/v1/disposal-analysis/overview', params),

  /**
   * 获取趋势分析
   */
  getTrendAnalysis: (params: DisposalAnalysisQueryRequest) =>
    apiService.post<TrendDataPoint[]>('/v1/disposal-analysis/trends', params),

  /**
   * 获取机构绩效分析
   */
  getOrganizationPerformance: (params: DisposalAnalysisQueryRequest) =>
    apiService.post<OrganizationPerformance[]>('/v1/disposal-analysis/organization-performance', params),

  /**
   * 获取类型分布分析
   */
  getTypeDistribution: (params: DisposalAnalysisQueryRequest) =>
    apiService.post<TypeDistribution[]>('/v1/disposal-analysis/type-distribution', params),

  /**
   * 获取效率分析
   */
  getEfficiencyAnalysis: (params: DisposalAnalysisQueryRequest) =>
    apiService.post<EfficiencyAnalysis>('/v1/disposal-analysis/efficiency', params),

  /**
   * 获取地域分析
   */
  getRegionAnalysis: (params: DisposalAnalysisQueryRequest) =>
    apiService.post<RegionAnalysis[]>('/v1/disposal-analysis/region-analysis', params),

  /**
   * 获取预警数据
   */
  getAlerts: (params: DisposalAnalysisQueryRequest) =>
    apiService.post<AlertData[]>('/v1/disposal-analysis/alerts', params),

  /**
   * 获取预测分析
   */
  getPredictions: (params: DisposalAnalysisQueryRequest) =>
    apiService.post<PredictionData[]>('/v1/disposal-analysis/predictions', params),

  /**
   * 获取关键指标
   */
  getKeyIndicators: (params: DisposalAnalysisQueryRequest) =>
    apiService.post<KeyIndicator[]>('/v1/disposal-analysis/key-indicators', params),

  /**
   * 获取实时数据
   */
  getRealtimeData: (orgIds?: number[]) =>
    apiService.get<RealtimeData>('/v1/disposal-analysis/realtime', {
      params: { orgIds: orgIds?.join(',') }
    }),

  /**
   * 导出分析报告
   */
  exportAnalysisReport: (params: DisposalAnalysisQueryRequest, format: 'excel' | 'csv' | 'pdf' = 'excel') =>
    apiService.post<ExportResult>(`/v1/disposal-analysis/export?format=${format}`, params),

  /**
   * 获取支持的分析维度
   */
  getAnalysisDimensions: () => [
    { value: 'OVERVIEW', label: '概览分析' },
    { value: 'TREND', label: '趋势分析' },
    { value: 'PERFORMANCE', label: '绩效分析' },
    { value: 'DISTRIBUTION', label: '分布分析' },
    { value: 'EFFICIENCY', label: '效率分析' },
    { value: 'REGION', label: '地域分析' }
  ],

  /**
   * 获取聚合周期选项
   */
  getAggregatePeriods: () => [
    { value: 'DAY', label: '按天' },
    { value: 'WEEK', label: '按周' },
    { value: 'MONTH', label: '按月' },
    { value: 'QUARTER', label: '按季度' },
    { value: 'YEAR', label: '按年' }
  ],

  /**
   * 获取对比类型选项
   */
  getComparisonTypes: () => [
    { value: 'NONE', label: '无对比' },
    { value: 'YEAR_OVER_YEAR', label: '同比' },
    { value: 'MONTH_OVER_MONTH', label: '环比' }
  ],

  /**
   * 获取处置类型选项
   */
  getDisposalTypes: () => [
    { value: 'MEDIATION', label: '调解' },
    { value: 'LITIGATION', label: '诉讼' }
  ],

  /**
   * 获取预警级别颜色
   */
  getAlertLevelColor: (level: string): string => {
    const colorMap: Record<string, string> = {
      'LOW': '#52c41a',
      'MEDIUM': '#faad14', 
      'HIGH': '#fa8c16',
      'CRITICAL': '#f5222d'
    };
    return colorMap[level] || '#d9d9d9';
  },

  /**
   * 格式化金额显示
   */
  formatAmount: (amount: number): string => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}亿`;
    } else if (amount >= 10000) {
      return `${(amount / 10000).toFixed(1)}万`;
    } else {
      return amount.toLocaleString();
    }
  },

  /**
   * 格式化百分比显示
   */
  formatPercentage: (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
  },

  /**
   * 获取趋势方向图标
   */
  getTrendIcon: (direction: string): string => {
    const iconMap: Record<string, string> = {
      'UP': '↗',
      'DOWN': '↘',
      'STABLE': '→'
    };
    return iconMap[direction] || '→';
  },

  /**
   * 获取趋势方向颜色
   */
  getTrendColor: (direction: string): string => {
    const colorMap: Record<string, string> = {
      'UP': '#52c41a',
      'DOWN': '#f5222d',
      'STABLE': '#faad14'
    };
    return colorMap[direction] || '#d9d9d9';
  }
};

export default disposalAnalysisAPI;