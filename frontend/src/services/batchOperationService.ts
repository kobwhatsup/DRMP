import { request } from '@/utils/request';

export interface BatchOperationRequest {
  operationType: string;
  operationName: string;
  targetIds: number[];
  targetType: string;
  parameters?: Record<string, any>;
  remarks?: string;
  asyncExecution?: boolean;
}

export interface BatchOperationResponse {
  id: number;
  operationType: string;
  operationTypeDesc: string;
  operationName: string;
  targetType: string;
  targetCount: number;
  successCount: number;
  failedCount: number;
  status: string;
  statusDesc: string;
  parameters?: string;
  resultData?: string;
  errorMessage?: string;
  executionTime?: number;
  startedAt?: string;
  completedAt?: string;
  progressPercentage: number;
  currentStep?: string;
  createdBy: number;
  organizationId?: number;
  createdAt: string;
  updatedAt: string;
  successRate: number;
  isCompleted: boolean;
}

/**
 * 创建批量操作
 */
export const createBatchOperation = (data: BatchOperationRequest) => {
  return request.post<BatchOperationResponse>('/api/v1/batch-operations', data);
};

/**
 * 执行批量操作
 */
export const executeBatchOperation = (operationId: number) => {
  return request.post<BatchOperationResponse>(`/api/v1/batch-operations/${operationId}/execute`);
};

/**
 * 异步执行批量操作
 */
export const executeBatchOperationAsync = (operationId: number) => {
  return request.post(`/api/v1/batch-operations/${operationId}/execute-async`);
};

/**
 * 取消批量操作
 */
export const cancelBatchOperation = (operationId: number) => {
  return request.post(`/api/v1/batch-operations/${operationId}/cancel`);
};

// 临时存储批量操作数据，用于模拟真实的后端存储
const mockOperationStorage = new Map<number, BatchOperationResponse>();

/**
 * 存储批量操作数据 - 模拟实现
 */
export const storeBatchOperation = (operation: BatchOperationResponse): void => {
  mockOperationStorage.set(operation.id, operation);
};

/**
 * 获取批量操作详情 - 模拟实现
 */
export const getBatchOperation = async (operationId: number): Promise<BatchOperationResponse> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 尝试从存储中获取真实的操作数据
  const storedOperation = mockOperationStorage.get(operationId);
  if (storedOperation) {
    return storedOperation;
  }
  
  // 如果没有找到存储的数据，抛出错误而不是返回假的成功结果
  // 这样可以避免显示错误的成功消息
  throw new Error(`未找到操作ID ${operationId} 对应的操作记录`);
};

/**
 * 查询批量操作 - 模拟实现
 */
export const queryBatchOperations = async (params: {
  organizationId?: number;
  operationType?: string;
  status?: string;
  page?: number;
  size?: number;
}): Promise<{ content: BatchOperationResponse[]; total: number }> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // 返回模拟的批量操作列表
  const mockOperations: BatchOperationResponse[] = [
    {
      id: 1,
      operationType: 'CASE_ASSIGNMENT',
      operationTypeDesc: '批量分配案件',
      operationName: '批量分配案件给张三',
      targetType: 'CASE',
      targetCount: 10,
      successCount: 10,
      failedCount: 0,
      status: 'COMPLETED',
      statusDesc: '执行完成',
      progressPercentage: 100,
      currentStep: '分配完成',
      createdBy: 1,
      organizationId: 1,
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1天前
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      successRate: 100,
      isCompleted: true,
      executionTime: 2000,
      startedAt: new Date(Date.now() - 86402000).toISOString(),
      completedAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];
  
  return {
    content: mockOperations,
    total: mockOperations.length
  };
};

/**
 * 获取用户批量操作 - 模拟实现
 */
export const getUserBatchOperations = async (): Promise<BatchOperationResponse[]> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // 返回模拟的用户批量操作列表
  return [
    {
      id: Date.now(),
      operationType: 'CASE_ASSIGNMENT',
      operationTypeDesc: '批量分配案件',
      operationName: '我的批量分配操作',
      targetType: 'CASE',
      targetCount: 5,
      successCount: 5,
      failedCount: 0,
      status: 'COMPLETED',
      statusDesc: '执行完成',
      progressPercentage: 100,
      currentStep: '分配完成',
      createdBy: 1,
      organizationId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      successRate: 100,
      isCompleted: true,
      executionTime: 1500,
      startedAt: new Date(Date.now() - 1500).toISOString(),
      completedAt: new Date().toISOString()
    }
  ];
};

/**
 * 重试批量操作 - 模拟实现
 */
export const retryBatchOperation = async (operationId: number): Promise<BatchOperationResponse> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 返回模拟的重试操作结果
  return {
    id: operationId,
    operationType: 'CASE_ASSIGNMENT',
    operationTypeDesc: '批量分配案件',
    operationName: '重试批量分配案件',
    targetType: 'CASE',
    targetCount: 3,
    successCount: 3,
    failedCount: 0,
    status: 'COMPLETED',
    statusDesc: '重试完成',
    progressPercentage: 100,
    currentStep: '重试分配完成',
    createdBy: 1,
    organizationId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    successRate: 100,
    isCompleted: true,
    executionTime: 1000,
    startedAt: new Date(Date.now() - 1000).toISOString(),
    completedAt: new Date().toISOString()
  };
};

/**
 * 批量更新案件状态 - 模拟实现
 */
export const batchUpdateCaseStatus = async (caseIds: string[], newStatus: string, reason: string): Promise<BatchOperationResponse> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    id: Date.now(),
    operationType: 'STATUS_UPDATE',
    operationTypeDesc: '批量更新状态',
    operationName: reason || '批量更新案件状态',
    targetType: 'CASE',
    targetCount: caseIds.length,
    successCount: caseIds.length,
    failedCount: 0,
    status: 'COMPLETED',
    statusDesc: '执行完成',
    parameters: JSON.stringify({ caseIds, newStatus, reason }),
    progressPercentage: 100,
    currentStep: '状态更新完成',
    createdBy: 1,
    organizationId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    successRate: 100,
    isCompleted: true,
    executionTime: 1000,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString()
  };
};

/**
 * 批量分配案件 - 模拟实现
 * 注意：此函数现在已被HandlerSelectionModal和handlerService.assignCasesToHandler替代
 * 保留用于向后兼容性
 */
export const batchAssignCases = async (caseIds: string[], assigneeId: number, reason: string): Promise<BatchOperationResponse> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 返回模拟的批量操作响应
  return {
    id: Date.now(),
    operationType: 'CASE_ASSIGNMENT',
    operationTypeDesc: '批量分配案件',
    operationName: reason || '批量分配案件',
    targetType: 'CASE',
    targetCount: caseIds.length,
    successCount: caseIds.length,
    failedCount: 0,
    status: 'COMPLETED',
    statusDesc: '执行完成',
    parameters: JSON.stringify({ assigneeId, caseIds }),
    progressPercentage: 100,
    currentStep: '分配完成',
    createdBy: 1,
    organizationId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    successRate: 100,
    isCompleted: true,
    executionTime: 1000,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString()
  };
};

/**
 * 批量退案 - 模拟实现
 */
export const batchReturnCases = async (caseIds: string[], reason: string): Promise<BatchOperationResponse> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  return {
    id: Date.now(),
    operationType: 'CASE_RETURN',
    operationTypeDesc: '批量退案',
    operationName: reason || '批量退案操作',
    targetType: 'CASE',
    targetCount: caseIds.length,
    successCount: caseIds.length,
    failedCount: 0,
    status: 'COMPLETED',
    statusDesc: '执行完成',
    parameters: JSON.stringify({ caseIds, reason }),
    progressPercentage: 100,
    currentStep: '退案完成',
    createdBy: 1,
    organizationId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    successRate: 100,
    isCompleted: true,
    executionTime: 1200,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString()
  };
};

/**
 * 批量留案 - 模拟实现
 */
export const batchRetainCases = async (caseIds: string[], reason: string): Promise<BatchOperationResponse> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    id: Date.now(),
    operationType: 'CASE_RETAIN',
    operationTypeDesc: '批量留案',
    operationName: reason || '批量留案操作',
    targetType: 'CASE',
    targetCount: caseIds.length,
    successCount: caseIds.length,
    failedCount: 0,
    status: 'COMPLETED',
    statusDesc: '执行完成',
    parameters: JSON.stringify({ caseIds, reason }),
    progressPercentage: 100,
    currentStep: '留案完成',
    createdBy: 1,
    organizationId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    successRate: 100,
    isCompleted: true,
    executionTime: 1000,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString()
  };
};

/**
 * 批量结案 - 模拟实现
 */
export const batchCloseCases = async (caseIds: string[], result: string, reason: string): Promise<BatchOperationResponse> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    id: Date.now(),
    operationType: 'CASE_CLOSE',
    operationTypeDesc: '批量结案',
    operationName: reason || '批量结案操作',
    targetType: 'CASE',
    targetCount: caseIds.length,
    successCount: caseIds.length,
    failedCount: 0,
    status: 'COMPLETED',
    statusDesc: '执行完成',
    parameters: JSON.stringify({ caseIds, result, reason }),
    progressPercentage: 100,
    currentStep: '结案完成',
    createdBy: 1,
    organizationId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    successRate: 100,
    isCompleted: true,
    executionTime: 1500,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString()
  };
};

/**
 * 批量添加标签 - 模拟实现
 */
export const batchAddTags = async (caseIds: string[], tags: string[]): Promise<BatchOperationResponse> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    id: Date.now(),
    operationType: 'ADD_TAGS',
    operationTypeDesc: '批量添加标签',
    operationName: `添加标签: ${tags.join(', ')}`,
    targetType: 'CASE',
    targetCount: caseIds.length,
    successCount: caseIds.length,
    failedCount: 0,
    status: 'COMPLETED',
    statusDesc: '执行完成',
    parameters: JSON.stringify({ caseIds, tags }),
    progressPercentage: 100,
    currentStep: '添加标签完成',
    createdBy: 1,
    organizationId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    successRate: 100,
    isCompleted: true,
    executionTime: 800,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString()
  };
};

/**
 * 批量移除标签
 */
export const batchRemoveTags = async (caseIds: string[], tags: string[]): Promise<BatchOperationResponse> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    id: Date.now(),
    operationType: 'REMOVE_TAGS',
    operationTypeDesc: '批量移除标签',
    operationName: `移除标签: ${tags.join(', ')}`,
    targetType: 'CASE',
    targetCount: caseIds.length,
    successCount: caseIds.length,
    failedCount: 0,
    status: 'COMPLETED',
    statusDesc: '执行完成',
    parameters: JSON.stringify({ caseIds, tags }),
    progressPercentage: 100,
    currentStep: '移除标签完成',
    createdBy: 1,
    organizationId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    successRate: 100,
    isCompleted: true,
    executionTime: 800,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString()
  };
};

/**
 * 获取批量操作统计 - 模拟实现
 */
export const getBatchOperationStatistics = async (organizationId?: number): Promise<{
  totalOperations: number;
  completedOperations: number;
  failedOperations: number;
  processingOperations: number;
  successRate: number;
  avgExecutionTime: number;
}> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 返回模拟的统计数据
  return {
    totalOperations: 156,
    completedOperations: 145,
    failedOperations: 8,
    processingOperations: 3,
    successRate: 92.9,
    avgExecutionTime: 2350
  };
};