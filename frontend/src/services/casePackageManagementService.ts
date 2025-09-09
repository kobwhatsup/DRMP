import { apiService } from './api';

// ========== 类型定义 ==========

export enum AssignmentType {
  MANUAL = 'MANUAL',
  BIDDING = 'BIDDING',
  SMART = 'SMART',
  DESIGNATED = 'DESIGNATED'
}

export enum CasePackageStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  BIDDING = 'BIDDING',
  ASSIGNING = 'ASSIGNING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  WITHDRAWN = 'WITHDRAWN'
}

export interface CasePackageDetail {
  id: number;
  packageCode: string;
  packageName: string;
  status: CasePackageStatus;
  assignmentType: AssignmentType;
  caseCount: number;
  totalAmount: number;
  remainingAmount: number;
  expectedRecoveryRate?: number;
  expectedDisposalDays?: number;
  preferredDisposalMethods?: string;
  allowBidding: boolean;
  biddingStartTime?: string;
  biddingEndTime?: string;
  minBidAmount?: number;
  bidBondAmount?: number;
  biddingRequirements?: string;
  evaluationCriteria?: any;
  smartAssignConfig?: any;
  winningBidId?: number;
  sourceOrgId: number;
  sourceOrgName: string;
  disposalOrgId?: number;
  disposalOrgName?: string;
  entrustStartDate: string;
  entrustEndDate: string;
  description?: string;
  publishedAt?: string;
  assignedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CasePackageBid {
  id: number;
  casePackageId: number;
  casePackageName: string;
  disposalOrgId: number;
  disposalOrgName: string;
  bidAmount: number;
  proposedRecoveryRate: number;
  proposedDisposalDays: number;
  proposal: string;
  technicalScore?: number;
  priceScore?: number;
  comprehensiveScore?: number;
  ranking?: number;
  status: string;
  isWinner: boolean;
  submittedAt: string;
  reviewedAt?: string;
  reviewComments?: string;
  attachments?: any[];
  disposalStrategy?: string;
  teamIntroduction?: string;
  pastPerformance?: string;
  commitments?: string;
}

export interface SmartAssignRequest {
  casePackageId: number;
  strategy: 'REGION_BASED' | 'PERFORMANCE_BASED' | 'LOAD_BALANCE' | 'SPECIALTY_MATCH' | 'COMPREHENSIVE';
  ruleWeights?: Record<string, number>;
  regionWeight?: number;
  performanceWeight?: number;
  loadWeight?: number;
  specialtyWeight?: number;
  minMatchScore?: number;
  maxCasesPerOrg?: number;
  excludeOrgIds?: number[];
  includeOrgIds?: number[];
  preview: boolean;
  allowPartialAssignment?: boolean;
  remarks?: string;
}

export interface SmartAssignResult {
  assignmentId: string;
  casePackageId: number;
  casePackageName: string;
  totalCases: number;
  assignedCases: number;
  unassignedCount: number;
  successRate: number;
  strategy: string;
  ruleWeights: Record<string, number>;
  assignmentDetails: AssignmentDetail[];
  unassignedCases: UnassignedCase[];
  executedAt: string;
  executionTime: number;
  isPreview: boolean;
  remarks?: string;
  orgStats: OrgAssignmentStat[];
}

export interface AssignmentDetail {
  caseId: number;
  caseNumber: string;
  caseAmount: number;
  orgId: number;
  orgName: string;
  matchScore: number;
  scoreDetails: Record<string, number>;
  matchReason: string;
}

export interface UnassignedCase {
  caseId: number;
  caseNumber: string;
  caseAmount: number;
  unassignedReason: string;
  maxScore: number;
  suggestedAction: string;
}

export interface OrgAssignmentStat {
  orgId: number;
  orgName: string;
  assignedCount: number;
  totalAmount: number;
  avgMatchScore: number;
  currentLoad: number;
  maxCapacity: number;
  utilizationRate: number;
}

export interface BatchImportResult {
  taskId: string;
  success: boolean;
  totalCount: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  errors: ImportError[];
  startTime: string;
  endTime: string;
  duration: number;
  fileName: string;
  fileSize: number;
  operator: string;
}

export interface ImportError {
  rowNumber: number;
  columnName: string;
  errorValue: string;
  errorMessage: string;
  errorType: string;
}

export interface MarketQueryParams {
  keyword?: string;
  sourceOrgIds?: number[];
  minAmount?: number;
  maxAmount?: number;
  minCaseCount?: number;
  maxCaseCount?: number;
  regions?: string[];
  debtTypes?: string[];
  disposalPreference?: string;
  minExpectedRecoveryRate?: number;
  maxExpectedRecoveryRate?: number;
  biddingEndDateFrom?: string;
  biddingEndDateTo?: string;
  onlyBiddable?: boolean;
  onlyFavorites?: boolean;
  sortBy?: string;
  sortDirection?: string;
  page?: number;
  size?: number;
}

export interface RecommendedOrg {
  orgId: number;
  orgCode: string;
  orgName: string;
  orgType: string;
  matchScore: number;
  recommendReasons: string[];
  scoreDetails: Record<string, number>;
  region: string;
  specialties: string[];
  currentLoad: number;
  maxCapacity: number;
  utilizationRate: number;
  performanceStats: {
    totalCasesHandled: number;
    avgRecoveryRate: number;
    avgDisposalDays: number;
    successRate: number;
    satisfactionScore: number;
    performanceTrend: string;
  };
  hasCooperated: boolean;
  lastCooperationDate?: string;
}

// ========== API 服务 ==========

export const casePackageManagementAPI = {
  // ===== 案件包基础管理 =====
  
  /**
   * 获取案件包列表
   */
  getCasePackageList: (params: any) =>
    apiService.get('/v1/case-packages', params),
  
  /**
   * 获取案件包详情
   */
  getCasePackageDetail: (id: number) =>
    apiService.get<CasePackageDetail>(`/v1/case-packages/${id}`),
  
  /**
   * 创建案件包
   */
  createCasePackage: (data: any) =>
    apiService.post('/v1/case-packages', data),
  
  /**
   * 更新案件包
   */
  updateCasePackage: (id: number, data: any) =>
    apiService.put(`/v1/case-packages/${id}`, data),
  
  /**
   * 删除案件包
   */
  deleteCasePackage: (id: number) =>
    apiService.delete(`/v1/case-packages/${id}`),
  
  /**
   * 发布案件包
   */
  publishCasePackage: (id: number) =>
    apiService.post(`/v1/case-packages/${id}/publish`),
  
  /**
   * 撤回案件包
   */
  withdrawCasePackage: (id: number) =>
    apiService.post(`/v1/case-packages/${id}/withdraw`),
  
  // ===== 案件管理 =====
  
  /**
   * 批量导入案件
   */
  importCases: (packageId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiService.upload<BatchImportResult>(`/v1/case-packages/${packageId}/import`, formData);
  },
  
  /**
   * 导出案件数据
   */
  exportCases: (packageId: number, format: 'excel' | 'csv' = 'excel') =>
    apiService.get(`/v1/case-packages/${packageId}/export?format=${format}`),
  
  /**
   * 获取案件包中的案件列表
   */
  getCasesInPackage: (packageId: number, params: any) =>
    apiService.get(`/v1/case-packages/${packageId}/cases`, params),
  
  /**
   * 添加案件到案件包
   */
  addCases: (packageId: number, caseIds: number[]) =>
    apiService.post(`/v1/case-packages/${packageId}/cases`, { caseIds }),
  
  /**
   * 从案件包移除案件
   */
  removeCases: (packageId: number, caseIds: number[]) =>
    apiService.delete(`/v1/case-packages/${packageId}/cases?caseIds=${caseIds.join(',')}`),
  
  /**
   * 转移案件到其他案件包
   */
  transferCases: (sourcePackageId: number, targetPackageId: number, caseIds: number[]) =>
    apiService.post(`/v1/case-packages/${sourcePackageId}/transfer`, {
      targetPackageId,
      caseIds
    }),
  
  // ===== 竞标管理 =====
  
  /**
   * 提交竞标
   */
  submitBid: (data: any) =>
    apiService.post<CasePackageBid>('/v1/case-packages/bids', data),
  
  /**
   * 获取竞标列表
   */
  getBidList: (packageId: number) =>
    apiService.get<CasePackageBid[]>(`/v1/case-packages/${packageId}/bids`),
  
  /**
   * 获取我的竞标
   */
  getMyBids: (params: any) =>
    apiService.get('/v1/case-packages/my-bids', params),
  
  /**
   * 选择中标方
   */
  selectWinner: (packageId: number, bidId: number) =>
    apiService.post(`/v1/case-packages/${packageId}/select-winner`, { bidId }),
  
  /**
   * 撤回竞标
   */
  withdrawBid: (bidId: number) =>
    apiService.post(`/v1/case-packages/bids/${bidId}/withdraw`),
  
  /**
   * 获取案件市场列表
   */
  getMarketPackages: (params: MarketQueryParams) =>
    apiService.get('/v1/case-packages/market', params),
  
  // ===== 智能分案 =====
  
  /**
   * 执行智能分案
   */
  executeSmartAssignment: (data: SmartAssignRequest) =>
    apiService.post<SmartAssignResult>('/v1/case-packages/smart-assign', data),
  
  /**
   * 预览智能分案结果
   */
  previewSmartAssignment: (data: SmartAssignRequest) =>
    apiService.post<SmartAssignResult>('/v1/case-packages/smart-assign/preview', {
      ...data,
      preview: true
    }),
  
  /**
   * 确认分案结果
   */
  confirmAssignment: (assignmentId: string) =>
    apiService.post(`/v1/case-packages/assignments/${assignmentId}/confirm`),
  
  /**
   * 获取推荐的处置机构
   */
  getRecommendedOrgs: (packageId: number) =>
    apiService.get<RecommendedOrg[]>(`/v1/case-packages/${packageId}/recommended-orgs`),
  
  // ===== 分案规则管理 =====
  
  /**
   * 获取分案规则列表
   */
  getAssignmentRules: () =>
    apiService.get('/v1/assignment-rules'),
  
  /**
   * 创建分案规则
   */
  createAssignmentRule: (data: any) =>
    apiService.post('/v1/assignment-rules', data),
  
  /**
   * 更新分案规则
   */
  updateAssignmentRule: (id: number, data: any) =>
    apiService.put(`/v1/assignment-rules/${id}`, data),
  
  /**
   * 删除分案规则
   */
  deleteAssignmentRule: (id: number) =>
    apiService.delete(`/v1/assignment-rules/${id}`),
  
  // ===== 统计分析 =====
  
  /**
   * 获取案件包统计信息
   */
  getStatistics: (orgId?: number) =>
    apiService.get('/v1/case-packages/statistics', { orgId }),
  
  /**
   * 获取案件包状态分布
   */
  getStatusDistribution: () =>
    apiService.get('/v1/case-packages/status-distribution'),
  
  /**
   * 获取竞标统计
   */
  getBiddingStatistics: () =>
    apiService.get('/v1/case-packages/bidding-statistics'),
  
  /**
   * 获取分案效率统计
   */
  getAssignmentEfficiency: () =>
    apiService.get('/v1/case-packages/assignment-efficiency'),
  
  // ===== 辅助功能 =====
  
  /**
   * 下载导入模板
   */
  downloadImportTemplate: () =>
    apiService.get('/v1/case-packages/import-template'),
  
  /**
   * 检查案件包名称是否重复
   */
  checkPackageName: (name: string) =>
    apiService.get('/v1/case-packages/check-name', { name }),
  
  /**
   * 获取可用的处置机构列表
   */
  getAvailableOrgs: (params?: any) =>
    apiService.get('/v1/organizations/disposal/available', params),
  
  /**
   * 收藏/取消收藏案件包
   */
  toggleFavorite: (packageId: number) =>
    apiService.post(`/v1/case-packages/${packageId}/toggle-favorite`),
  
  /**
   * 获取收藏的案件包
   */
  getFavoritePackages: () =>
    apiService.get('/v1/case-packages/favorites'),
};

export default casePackageManagementAPI;