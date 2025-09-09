import { apiService } from './api';

// 处置转换相关接口定义
export interface ConversionRequest {
  id: string;
  caseId: string;
  caseNumber: string;
  debtorName: string;
  amount: number;
  currentDisposalType: 'mediation' | 'litigation';
  targetDisposalType: 'mediation' | 'litigation';
  currentOrgId: string;
  currentOrgName: string;
  targetOrgId?: string;
  targetOrgName?: string;
  reason: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'cancelled';
  requestTime: string;
  approvalTime?: string;
  approver?: string;
  approverName?: string;
  processingStartTime?: string;
  processingEndTime?: string;
  attachments: ConversionAttachment[];
  createdBy: string;
  createdByName: string;
  updatedAt: string;
}

export interface ConversionAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadTime: string;
  uploadBy: string;
}

export interface ConversionApproval {
  requestId: string;
  action: 'approve' | 'reject';
  comments: string;
  targetOrgId?: string; // 批准时可能需要指定目标机构
}

export interface ConversionStatistics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  completedConversions: number;
  approvalRate: number;
  avgProcessingDays: number;
  monthlyTrend: Array<{
    month: string;
    totalRequests: number;
    approvedRequests: number;
    completedConversions: number;
  }>;
  conversionTypeDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  topReasons: Array<{
    reason: string;
    count: number;
    successRate: number;
  }>;
}

export interface ConversionQueryParams {
  page?: number;
  size?: number;
  keyword?: string;
  status?: string;
  currentDisposalType?: string;
  targetDisposalType?: string;
  currentOrgId?: string;
  targetOrgId?: string;
  priority?: string;
  requestTimeStart?: string;
  requestTimeEnd?: string;
  approver?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateConversionRequestParams {
  caseId: string;
  targetDisposalType: 'mediation' | 'litigation';
  targetOrgId?: string;
  reason: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  attachments?: File[];
}

export interface BatchConversionParams {
  caseIds: string[];
  targetDisposalType: 'mediation' | 'litigation';
  targetOrgId?: string;
  reason: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface ConversionRecommendation {
  caseId: string;
  recommendedType: 'mediation' | 'litigation';
  confidence: number;
  reasons: string[];
  suggestedOrgs: Array<{
    orgId: string;
    orgName: string;
    matchScore: number;
    specialties: string[];
    avgSuccessRate: number;
  }>;
  expectedOutcome: {
    successRate: number;
    avgProcessingDays: number;
    expectedRecoveryRate: number;
  };
}

export interface ConversionRule {
  id: string;
  name: string;
  description: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  actions: Array<{
    type: string;
    parameters: any;
  }>;
  priority: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// 处置转换服务API
export const disposalConversionAPI = {
  // 获取转换申请列表
  getConversionRequests: (params: ConversionQueryParams = {}) =>
    apiService.get<{
      content: ConversionRequest[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
    }>('/v1/disposal-conversion/requests', params),

  // 获取转换申请详情
  getConversionRequest: (id: string) =>
    apiService.get<ConversionRequest>(`/v1/disposal-conversion/requests/${id}`),

  // 创建转换申请
  createConversionRequest: async (params: CreateConversionRequestParams) => {
    const formData = new FormData();
    formData.append('caseId', params.caseId);
    formData.append('targetDisposalType', params.targetDisposalType);
    formData.append('reason', params.reason);
    
    if (params.targetOrgId) formData.append('targetOrgId', params.targetOrgId);
    if (params.notes) formData.append('notes', params.notes);
    if (params.priority) formData.append('priority', params.priority);
    
    if (params.attachments?.length) {
      params.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    return apiService.upload<ConversionRequest>('/v1/disposal-conversion/requests', formData);
  },

  // 批量创建转换申请
  batchCreateConversionRequests: (params: BatchConversionParams) =>
    apiService.post<{
      successCount: number;
      failedCount: number;
      successIds: string[];
      failedItems: Array<{ caseId: string; error: string }>;
    }>('/v1/disposal-conversion/requests/batch', params),

  // 更新转换申请
  updateConversionRequest: (id: string, data: Partial<ConversionRequest>) =>
    apiService.put<ConversionRequest>(`/v1/disposal-conversion/requests/${id}`, data),

  // 审批转换申请
  approveConversionRequest: (id: string, approval: ConversionApproval) =>
    apiService.post<ConversionRequest>(`/v1/disposal-conversion/requests/${id}/approve`, approval),

  // 拒绝转换申请
  rejectConversionRequest: (id: string, approval: ConversionApproval) =>
    apiService.post<ConversionRequest>(`/v1/disposal-conversion/requests/${id}/reject`, approval),

  // 批量审批
  batchApproval: (requestIds: string[], action: 'approve' | 'reject', comments: string) =>
    apiService.post<{
      successCount: number;
      failedCount: number;
      results: Array<{ requestId: string; success: boolean; error?: string }>;
    }>('/v1/disposal-conversion/requests/batch-approval', {
      requestIds,
      action,
      comments
    }),

  // 取消转换申请
  cancelConversionRequest: (id: string, reason: string) =>
    apiService.post<ConversionRequest>(`/v1/disposal-conversion/requests/${id}/cancel`, { reason }),

  // 获取转换统计数据
  getConversionStatistics: (params: {
    startDate?: string;
    endDate?: string;
    orgId?: string;
    disposalType?: string;
  } = {}) =>
    apiService.get<ConversionStatistics>('/v1/disposal-conversion/statistics', params),

  // 获取转换建议
  getConversionRecommendation: (caseId: string) =>
    apiService.get<ConversionRecommendation>(`/v1/disposal-conversion/recommendations/${caseId}`),

  // 批量获取转换建议
  batchGetConversionRecommendations: (caseIds: string[]) =>
    apiService.post<ConversionRecommendation[]>('/v1/disposal-conversion/recommendations/batch', { caseIds }),

  // 导出转换数据
  exportConversionData: (params: ConversionQueryParams & {
    format: 'excel' | 'csv';
    fields?: string[];
  }) =>
    apiService.post<{ downloadUrl: string; fileName: string }>('/v1/disposal-conversion/export', params),

  // 获取可用的目标处置机构
  getAvailableTargetOrgs: (params: {
    disposalType: 'mediation' | 'litigation';
    region?: string;
    specialties?: string[];
    capacity?: number;
  }) =>
    apiService.get<Array<{
      orgId: string;
      orgName: string;
      orgType: string;
      region: string;
      specialties: string[];
      currentCapacity: number;
      maxCapacity: number;
      avgSuccessRate: number;
      avgProcessingDays: number;
      rating: number;
    }>>('/v1/disposal-conversion/target-orgs', params),

  // 获取案件转换历史
  getCaseConversionHistory: (caseId: string) =>
    apiService.get<ConversionRequest[]>(`/v1/disposal-conversion/case-history/${caseId}`),

  // 获取机构转换历史
  getOrgConversionHistory: (orgId: string, params: {
    type: 'source' | 'target';
    page?: number;
    size?: number;
    startDate?: string;
    endDate?: string;
  }) =>
    apiService.get<{
      content: ConversionRequest[];
      totalElements: number;
      statistics: {
        totalRequests: number;
        successRate: number;
        avgProcessingDays: number;
      };
    }>(`/v1/disposal-conversion/org-history/${orgId}`, params),

  // 转换规则管理
  conversionRules: {
    // 获取转换规则列表
    getRules: (params: { page?: number; size?: number; enabled?: boolean } = {}) =>
      apiService.get<{
        content: ConversionRule[];
        totalElements: number;
      }>('/v1/disposal-conversion/rules', params),

    // 创建转换规则
    createRule: (rule: Omit<ConversionRule, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiService.post<ConversionRule>('/v1/disposal-conversion/rules', rule),

    // 更新转换规则
    updateRule: (id: string, rule: Partial<ConversionRule>) =>
      apiService.put<ConversionRule>(`/v1/disposal-conversion/rules/${id}`, rule),

    // 删除转换规则
    deleteRule: (id: string) =>
      apiService.delete(`/v1/disposal-conversion/rules/${id}`),

    // 测试转换规则
    testRule: (ruleId: string, testData: any) =>
      apiService.post<{
        matched: boolean;
        actions: any[];
        debugInfo: string[];
      }>(`/v1/disposal-conversion/rules/${ruleId}/test`, testData),
  },

  // 消息通知相关
  notifications: {
    // 获取转换相关通知
    getNotifications: (params: { page?: number; size?: number; unreadOnly?: boolean } = {}) =>
      apiService.get<{
        content: Array<{
          id: string;
          type: string;
          title: string;
          content: string;
          read: boolean;
          createdAt: string;
          relatedRequestId?: string;
        }>;
        unreadCount: number;
      }>('/v1/disposal-conversion/notifications', params),

    // 标记通知为已读
    markAsRead: (notificationId: string) =>
      apiService.post(`/v1/disposal-conversion/notifications/${notificationId}/read`),

    // 批量标记已读
    batchMarkAsRead: (notificationIds: string[]) =>
      apiService.post('/v1/disposal-conversion/notifications/batch-read', { notificationIds }),
  }
};

export default disposalConversionAPI;