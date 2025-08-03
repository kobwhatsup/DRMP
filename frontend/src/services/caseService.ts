import api from '@/utils/api';

// 案件包相关接口
export interface CasePackage {
  id: number;
  packageName: string;
  packageCode: string;
  sourceOrgId: number;
  sourceOrgName: string;
  description?: string;
  totalCases: number;
  totalAmount: number;
  avgAmount: number;
  minAmount: number;
  maxAmount: number;
  expectedRecoveryRate: number;
  disposalPeriod: number;
  disposalMethods: string[];
  assignmentStrategy: string;
  assignmentConfig: any;
  status: 'DRAFT' | 'PENDING_ASSIGNMENT' | 'PUBLISHED' | 'ASSIGNED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  publishTime: string;
  assignmentDeadline: string;
  assignedCases: number;
  processingCases: number;
  completedCases: number;
  recoveredAmount: number;
  recoveryRate: number;
  createdAt: string;
  updatedAt: string;
}

// 案件信息接口
export interface Case {
  id: number;
  casePackageId: number;
  sourceOrgId: number;
  disposalOrgId?: number;
  
  // 债务人信息
  debtorName: string;
  debtorIdCard: string;
  debtorPhone?: string;
  debtorGender?: string;
  debtorAge?: number;
  debtorProvince?: string;
  debtorCity?: string;
  debtorAddress?: string;
  
  // 债务信息
  loanContractNo: string;
  productLine?: string;
  loanAmount: number;
  remainingAmount: number;
  overdueDays: number;
  loanDate?: string;
  dueDate?: string;
  
  // 委托信息
  entrustStartDate?: string;
  entrustEndDate?: string;
  fundingParty?: string;
  
  // 联系人信息
  contact1Name?: string;
  contact1Phone?: string;
  contact1Relation?: string;
  contact2Name?: string;
  contact2Phone?: string;
  contact2Relation?: string;
  
  // 状态信息
  status: 'PENDING' | 'ASSIGNED' | 'PROCESSING' | 'MEDIATION' | 'LITIGATION' | 'SETTLED' | 'COMPLETED' | 'SUSPENDED';
  disposalType?: string;
  priorityLevel?: string;
  difficultyLevel?: string;
  
  // 处置信息
  assignedAt?: string;
  handlerId?: number;
  latestProgress?: string;
  progressUpdatedAt?: string;
  communicationCount: number;
  lastCommunicationAt?: string;
  
  // 回款信息
  recoveredAmount: number;
  recoveryRate: number;
  lastPaymentAt?: string;
  paymentCount: number;
  
  // 时间信息
  processingStartTime?: string;
  processingEndTime?: string;
  processingDays: number;
  createdAt: string;
  updatedAt: string;
}

// 案件分配记录接口
export interface CaseAssignment {
  id: number;
  casePackageId: number;
  sourceOrgId: number;
  disposalOrgId: number;
  assignmentStrategy: string;
  assignmentReason: string;
  matchScore: number;
  caseCount: number;
  totalAmount: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
  assignedAt: string;
  responseDeadline: string;
  respondedAt?: string;
  responseNote?: string;
  acceptedCaseCount: number;
  rejectedCaseCount: number;
}

// 案件包导入数据接口
export interface CaseImportData {
  debtorName: string;
  debtorIdCard: string;
  debtorPhone?: string;
  debtorGender?: string;
  debtorAge?: number;
  debtorProvince?: string;
  debtorCity?: string;
  debtorAddress?: string;
  loanContractNo: string;
  productLine?: string;
  loanAmount: number;
  remainingAmount: number;
  overdueDays: number;
  loanDate?: string;
  dueDate?: string;
  entrustStartDate?: string;
  entrustEndDate?: string;
  fundingParty?: string;
  contact1Name?: string;
  contact1Phone?: string;
  contact1Relation?: string;
  contact2Name?: string;
  contact2Phone?: string;
  contact2Relation?: string;
}

// 案件包创建参数接口
export interface CreateCasePackageParams {
  packageName: string;
  description?: string;
  assignmentStrategy: string;
  expectedRecoveryRate: number;
  disposalPeriod: number;
  disposalMethods: string[];
  cases: CaseImportData[];
}

// 查询参数接口
export interface CasePackageQueryParams {
  page?: number;
  size?: number;
  keyword?: string;
  status?: string;
  sourceOrgId?: number;
  disposalOrgId?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface CaseQueryParams {
  page?: number;
  size?: number;
  casePackageId?: number;
  sourceOrgId?: number;
  disposalOrgId?: number;
  debtorName?: string;
  loanContractNo?: string;
  status?: string;
  debtorProvince?: string;
  debtorCity?: string;
  overdueDaysMin?: number;
  overdueDaysMax?: number;
  remainingAmountMin?: number;
  remainingAmountMax?: number;
  assignedAtStart?: string;
  assignedAtEnd?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 案件包服务
export const casePackageService = {
  // 获取案件包列表
  getCasePackages: (params: CasePackageQueryParams = {}) =>
    api.get<{ content: CasePackage[]; totalElements: number; totalPages: number; size: number; number: number }>('/api/case-packages', { params }),

  // 获取案件包详情
  getCasePackage: (id: number) =>
    api.get<CasePackage>(`/api/case-packages/${id}`),

  // 创建案件包
  createCasePackage: (data: CreateCasePackageParams) =>
    api.post<CasePackage>('/api/case-packages', data),

  // 更新案件包
  updateCasePackage: (id: number, data: Partial<CasePackage>) =>
    api.put<CasePackage>(`/api/case-packages/${id}`, data),

  // 发布案件包
  publishCasePackage: (id: number) =>
    api.post<CasePackage>(`/api/case-packages/${id}/publish`),

  // 撤回案件包
  withdrawCasePackage: (id: number) =>
    api.post<CasePackage>(`/api/case-packages/${id}/withdraw`),

  // 删除案件包
  deleteCasePackage: (id: number) =>
    api.delete(`/api/case-packages/${id}`),

  // 分配案件包
  assignCasePackage: (id: number, disposalOrgId: number) =>
    api.post<CasePackage>(`/api/case-packages/${id}/assign?disposalOrgId=${disposalOrgId}`),

  // 接受案件包
  acceptCasePackage: (id: number) =>
    api.post<CasePackage>(`/api/case-packages/${id}/accept`),

  // 拒绝案件包
  rejectCasePackage: (id: number, reason: string) =>
    api.post<CasePackage>(`/api/case-packages/${id}/reject?reason=${encodeURIComponent(reason)}`),

  // 完成案件包
  completeCasePackage: (id: number) =>
    api.post<CasePackage>(`/api/case-packages/${id}/complete`),

  // 批量导入案件
  batchImportCases: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/case-packages/${id}/import-cases`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // 获取案件包统计
  getCasePackageStatistics: (organizationId?: number) =>
    api.get<{
      totalPackages: number;
      draftPackages: number;
      publishedPackages: number;
      processingPackages: number;
      completedPackages: number;
      totalAmount: number;
      recoveredAmount: number;
      avgRecoveryRate: number;
    }>('/api/case-packages/statistics', { params: { organizationId } }),

  // 获取案件市场列表
  getMarketCasePackages: (params: {
    minAmount?: number;
    maxAmount?: number;
    minOverdueDays?: number;
    maxOverdueDays?: number;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  } = {}) =>
    api.get<{ content: CasePackage[]; totalElements: number; totalPages: number; size: number; number: number }>('/api/case-packages/market', { params }),

  // 申请案件包
  applyCasePackage: (id: number, proposal: string) =>
    api.post<string>(`/api/case-packages/${id}/apply?proposal=${encodeURIComponent(proposal)}`),

  // 获取机构案件包历史
  getOrganizationCasePackageHistory: (organizationId: number, status?: string, page?: number, size?: number, sortBy?: string, sortDir?: string) =>
    api.get<{ content: CasePackage[]; totalElements: number; totalPages: number; size: number; number: number }>(`/api/case-packages/organization/${organizationId}/history`, { 
      params: { status, page, size, sortBy, sortDir } 
    }),

  // 智能分案
  smartAssignCasePackage: (id: number) =>
    api.post<string[]>(`/api/case-packages/${id}/smart-assign`),

  // 批量操作案件包
  batchOperateCasePackages: (ids: number[], action: string) =>
    api.post<{
      success: boolean;
      totalCount: number;
      successCount: number;
      failedCount: number;
      errors: string[];
    }>('/api/case-packages/batch-operation', null, { params: { ids: ids.join(','), action } }),

  // 批量导入案件验证
  validateCaseImport: (data: CaseImportData[]) =>
    api.post<{
      validCases: CaseImportData[];
      invalidCases: Array<CaseImportData & { errors: string[] }>;
      statistics: {
        totalRows: number;
        validRows: number;
        invalidRows: number;
        duplicateRows: number;
        totalAmount: number;
        avgAmount: number;
      };
    }>('/api/case-packages/validate-import', { cases: data })
};

// 案件服务
export const caseService = {
  // 获取案件列表
  getCases: (params: CaseQueryParams = {}) =>
    api.get<{ items: Case[]; total: number }>('/cases', { params }),

  // 获取案件详情
  getCase: (id: number) =>
    api.get<Case>(`/cases/${id}`),

  // 更新案件
  updateCase: (id: number, data: Partial<Case>) =>
    api.put<Case>(`/cases/${id}`, data),

  // 批量更新案件状态
  batchUpdateCaseStatus: (caseIds: number[], status: string) =>
    api.post('/cases/batch-update-status', { caseIds, status }),

  // 分配案件
  assignCase: (caseId: number, disposalOrgId: number, handlerId?: number) =>
    api.post<Case>(`/cases/${caseId}/assign`, { disposalOrgId, handlerId }),

  // 批量分配案件
  batchAssignCases: (caseIds: number[], disposalOrgId: number) =>
    api.post('/cases/batch-assign', { caseIds, disposalOrgId }),

  // 获取案件处置进展
  getCaseProgress: (caseId: number) =>
    api.get<Array<{
      id: number;
      progressType: string;
      progressContent: string;
      contactMethod?: string;
      contactResult?: string;
      nextAction?: string;
      nextContactTime?: string;
      createdAt: string;
      createdBy: number;
      handlerName: string;
    }>>(`/cases/${caseId}/progress`),

  // 添加案件进展
  addCaseProgress: (caseId: number, data: {
    progressType: string;
    progressContent: string;
    contactMethod?: string;
    contactResult?: string;
    nextAction?: string;
    nextContactTime?: string;
  }) =>
    api.post(`/cases/${caseId}/progress`, data),

  // 获取案件回款记录
  getCasePayments: (caseId: number) =>
    api.get<Array<{
      id: number;
      paymentAmount: number;
      paymentDate: string;
      paymentMethod?: string;
      paymentProofUrl?: string;
      paymentNote?: string;
      verified: boolean;
      createdAt: string;
      createdBy: number;
    }>>(`/cases/${caseId}/payments`),

  // 添加回款记录
  addCasePayment: (caseId: number, data: {
    paymentAmount: number;
    paymentDate: string;
    paymentMethod?: string;
    paymentProofUrl?: string;
    paymentNote?: string;
  }) =>
    api.post(`/cases/${caseId}/payments`, data),

  // 验证回款记录
  verifyCasePayment: (paymentId: number) =>
    api.post(`/cases/payments/${paymentId}/verify`),

  // 获取案件附件
  getCaseAttachments: (caseId: number) =>
    api.get<Array<{
      id: number;
      fileName: string;
      filePath: string;
      fileSize: number;
      fileType: string;
      fileCategory: string;
      uploadTime: string;
      uploadedBy: number;
    }>>(`/cases/${caseId}/attachments`),

  // 上传案件附件
  uploadCaseAttachment: (caseId: number, file: File, category: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    return api.post(`/cases/${caseId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // 删除案件附件
  deleteCaseAttachment: (attachmentId: number) =>
    api.delete(`/cases/attachments/${attachmentId}`)
};

// 案件分配服务
export const caseAssignmentService = {
  // 获取分配记录列表
  getAssignments: (params: {
    page?: number;
    size?: number;
    casePackageId?: number;
    sourceOrgId?: number;
    disposalOrgId?: number;
    status?: string;
    assignedAtStart?: string;
    assignedAtEnd?: string;
  } = {}) =>
    api.get<{ items: CaseAssignment[]; total: number }>('/case-assignments', { params }),

  // 获取分配记录详情
  getAssignment: (id: number) =>
    api.get<CaseAssignment>(`/case-assignments/${id}`),

  // 智能分案
  intelligentAssignment: (casePackageId: number, config?: any) =>
    api.post<CaseAssignment[]>(`/case-packages/${casePackageId}/intelligent-assignment`, config),

  // 手动分案
  manualAssignment: (casePackageId: number, assignments: Array<{
    disposalOrgId: number;
    caseIds: number[];
    assignmentReason?: string;
  }>) =>
    api.post<CaseAssignment[]>(`/case-packages/${casePackageId}/manual-assignment`, { assignments }),

  // 测试分案规则
  testAssignmentRule: (ruleId: string) =>
    api.post<any>(`/assignment-rules/${ruleId}/test`),

  // 确认分案结果
  confirmAssignment: (packageId: number, results: any[]) =>
    api.post(`/case-packages/${packageId}/confirm-assignment`, { results }),


  // 响应分配请求
  respondToAssignment: (assignmentId: number, action: 'ACCEPT' | 'REJECT', note?: string, caseIds?: number[]) =>
    api.post<CaseAssignment>(`/case-assignments/${assignmentId}/respond`, { action, note, caseIds }),

  // 取消分配
  cancelAssignment: (assignmentId: number, reason?: string) =>
    api.post<CaseAssignment>(`/case-assignments/${assignmentId}/cancel`, { reason }),

  // 获取分配统计
  getAssignmentStats: (params: {
    sourceOrgId?: number;
    disposalOrgId?: number;
    dateStart?: string;
    dateEnd?: string;
  } = {}) =>
    api.get<{
      totalAssignments: number;
      pendingAssignments: number;
      acceptedAssignments: number;
      rejectedAssignments: number;
      avgResponseTime: number;
      acceptanceRate: number;
      topDisposalOrgs: Array<{
        orgId: number;
        orgName: string;
        assignmentCount: number;
        acceptanceRate: number;
      }>;
    }>('/case-assignments/stats', { params })
};

// 案件市场服务
export const caseMarketService = {
  // 获取案件市场列表
  getMarketCases: (params: {
    page?: number;
    size?: number;
    sourceOrgId?: number;
    marketStatus?: string;
    totalAmountMin?: number;
    totalAmountMax?: number;
    caseCountMin?: number;
    caseCountMax?: number;
    publishTimeStart?: string;
    publishTimeEnd?: string;
    keyword?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) =>
    api.get<{ items: Array<CasePackage & {
      marketStatus: string;
      publishTime: string;
      biddingDeadline: string;
      currentBidCount: number;
      viewCount: number;
      favoriteCount: number;
    }>; total: number }>('/case-market', { params }),

  // 获取案件市场详情
  getMarketCase: (casePackageId: number) =>
    api.get<CasePackage & {
      marketStatus: string;
      publishTime: string;
      biddingDeadline: string;
      currentBidCount: number;
      viewCount: number;
      favoriteCount: number;
      bids: Array<{
        id: number;
        disposalOrgId: number;
        disposalOrgName: string;
        bidAmount: number;
        bidNote: string;
        expectedRecoveryRate: number;
        processingPeriod: number;
        bidTime: string;
        status: string;
      }>;
    }>(`/case-market/${casePackageId}`),

  // 发布到案件市场
  publishToMarket: (casePackageId: number, data: {
    biddingDeadline: string;
    minBidAmount?: number;
  }) =>
    api.post(`/case-market/${casePackageId}/publish`, data),

  // 从市场撤回
  withdrawFromMarket: (casePackageId: number, reason?: string) =>
    api.post(`/case-market/${casePackageId}/withdraw`, { reason }),

  // 竞标案件包
  bidForCasePackage: (casePackageId: number, data: {
    bidAmount?: number;
    bidNote: string;
    expectedRecoveryRate: number;
    processingPeriod: number;
  }) =>
    api.post(`/case-market/${casePackageId}/bid`, data),

  // 撤回竞标
  withdrawBid: (bidId: number) =>
    api.post(`/case-market/bids/${bidId}/withdraw`),

  // 选择竞标方
  selectBidder: (casePackageId: number, bidId: number) =>
    api.post(`/case-market/${casePackageId}/select-bid`, { bidId }),

  // 收藏案件包
  favoriteCasePackage: (casePackageId: number) =>
    api.post(`/case-market/${casePackageId}/favorite`),

  // 取消收藏
  unfavoriteCasePackage: (casePackageId: number) =>
    api.delete(`/case-market/${casePackageId}/favorite`),

  // 增加浏览量
  incrementViewCount: (casePackageId: number) =>
    api.post(`/case-market/${casePackageId}/view`)
};

export default {
  casePackageService,
  caseService,
  caseAssignmentService,
  caseMarketService
};