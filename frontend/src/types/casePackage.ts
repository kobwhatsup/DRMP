/**
 * 案件包状态枚举
 */
export type CasePackageStatus = 
  | 'DRAFT'         // 草稿
  | 'PUBLISHED'     // 已发布
  | 'WITHDRAWN'     // 已撤回
  | 'ASSIGNED'      // 已分配
  | 'IN_PROGRESS'   // 处置中
  | 'COMPLETED'     // 已完成
  | 'CANCELLED';    // 已取消

/**
 * 案件包实体
 */
export interface CasePackage {
  id: number;
  packageCode: string;
  packageName: string;
  status: CasePackageStatus;
  caseCount: number;
  totalAmount: number;
  remainingAmount: number;
  expectedRecoveryRate?: number;
  expectedDisposalDays?: number;
  preferredDisposalMethods?: string;
  assignmentStrategy?: string;
  assignmentRules?: string;
  publishedAt?: string;
  assignedAt?: string;
  acceptedAt?: string;
  closedAt?: string;
  entrustStartDate: string;
  entrustEndDate: string;
  description?: string;
  sourceOrgId: number;
  sourceOrgName: string;
  disposalOrgId?: number;
  disposalOrgName?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 案件包创建请求
 */
export interface CasePackageCreateRequest {
  packageCode: string;
  packageName: string;
  caseCount: number;
  totalAmount: number;
  expectedRecoveryRate?: number;
  expectedDisposalDays?: number;
  preferredDisposalMethods?: string;
  assignmentStrategy?: string;
  assignmentRules?: string;
  entrustStartDate: string;
  entrustEndDate: string;
  description?: string;
}

/**
 * 案件包更新请求
 */
export interface CasePackageUpdateRequest {
  packageName?: string;
  expectedRecoveryRate?: number;
  expectedDisposalDays?: number;
  preferredDisposalMethods?: string;
  assignmentStrategy?: string;
  assignmentRules?: string;
  description?: string;
}

/**
 * 案件包查询参数
 */
export interface CasePackageQueryParams {
  keyword?: string;
  status?: CasePackageStatus;
  sourceOrgId?: number;
  disposalOrgId?: number;
  minAmount?: number;
  maxAmount?: number;
  minOverdueDays?: number;
  maxOverdueDays?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

/**
 * 案件包统计信息
 */
export interface CasePackageStatistics {
  totalPackages: number;
  draftPackages: number;
  publishedPackages: number;
  assignedPackages: number;
  inProgressPackages: number;
  completedPackages: number;
  totalAmount: number;
  assignedAmount: number;
  completedAmount: number;
  recoveryAmount: number;
  avgRecoveryRate: number;
  avgDisposalDays: number;
}

/**
 * 批量导入结果
 */
export interface BatchImportResult {
  success: boolean;
  totalCount: number;
  successCount: number;
  failedCount: number;
  errors: string[];
  taskId: string;
}

/**
 * 批量操作结果
 */
export interface BatchOperationResult {
  success: boolean;
  totalCount: number;
  successCount: number;
  failedCount: number;
  errors: string[];
}