import { request } from '@/utils/request';

// 处理人接口定义
export interface Handler {
  id: number;
  userId: number;
  name: string;
  phone: string;
  email: string;
  department: string;
  departmentId: number;
  position: string;
  level: string; // JUNIOR, SENIOR, EXPERT, SUPERVISOR
  skills: string[]; // 技能标签
  specialties: string[]; // 专长领域
  status: 'ACTIVE' | 'INACTIVE' | 'LEAVE';
  workload: number; // 当前工作量（案件数）
  maxCapacity: number; // 最大容量
  successRate: number; // 成功率
  avgHandleTime: number; // 平均处理时间（天）
  totalCases: number; // 总处理案件数
  activeCases: number; // 当前活跃案件数
  experience: number; // 工作经验（年）
  rating: number; // 评分 (1-5)
  regions: string[]; // 负责区域
  caseTypes: string[]; // 擅长案件类型
  createdAt: string;
  updatedAt: string;
}

// 处理人统计信息
export interface HandlerStatistics {
  totalHandlers: number;
  activeHandlers: number;
  avgWorkload: number;
  avgSuccessRate: number;
  departmentDistribution: Record<string, number>;
  skillDistribution: Record<string, number>;
}

// 分配建议
export interface AssignmentSuggestion {
  handlerId: number;
  handler: Handler;
  score: number; // 匹配分数 (0-100)
  reasons: string[]; // 推荐原因
  workloadAfterAssign: number;
  estimatedCompletionTime: number; // 预计完成时间（天）
}

// 分配请求
export interface AssignmentRequest {
  caseIds: string[];
  handlerId?: number; // 指定处理人
  autoAssign?: boolean; // 自动分配
  assignmentRule?: 'LOAD_BALANCE' | 'SKILL_MATCH' | 'REGION_MATCH' | 'PERFORMANCE'; // 分配规则
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  reason?: string;
  transferFromHandlerId?: number; // 从哪个处理人转移过来
}

/**
 * 获取处理人列表 - 模拟实现
 */
export const getHandlers = async (params?: {
  departmentId?: number;
  status?: string;
  skill?: string;
  region?: string;
  available?: boolean; // 是否只显示可用的（未满载的）
}): Promise<{ content: Handler[]; total: number }> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // 模拟处理人数据
  const mockHandlers: Handler[] = [
    {
      id: 1,
      userId: 101,
      name: '张三',
      phone: '13800138001',
      email: 'zhangsan@example.com',
      department: '催收一部',
      departmentId: 1,
      position: '高级催收专员',
      level: 'SENIOR',
      skills: ['电话催收', '法律程序', '协商谈判'],
      specialties: ['消费贷款', '信用卡'],
      status: 'ACTIVE',
      workload: 15,
      maxCapacity: 25,
      successRate: 85.6,
      avgHandleTime: 15,
      totalCases: 256,
      activeCases: 15,
      experience: 3,
      rating: 4.5,
      regions: ['北京', '天津'],
      caseTypes: ['消费贷款', '信用卡'],
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      userId: 102,
      name: '李四',
      phone: '13800138002',
      email: 'lisi@example.com',
      department: '催收一部',
      departmentId: 1,
      position: '催收专员',
      level: 'JUNIOR',
      skills: ['电话催收', '外访'],
      specialties: ['小额贷款'],
      status: 'ACTIVE',
      workload: 8,
      maxCapacity: 20,
      successRate: 78.2,
      avgHandleTime: 20,
      totalCases: 89,
      activeCases: 8,
      experience: 1,
      rating: 4.0,
      regions: ['北京'],
      caseTypes: ['小额贷款'],
      createdAt: '2023-06-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      userId: 103,
      name: '王五',
      phone: '13800138003',
      email: 'wangwu@example.com',
      department: '法务部',
      departmentId: 2,
      position: '法务专员',
      level: 'EXPERT',
      skills: ['法律程序', '诉讼', '协商谈判'],
      specialties: ['企业贷款', '抵押贷款'],
      status: 'ACTIVE',
      workload: 12,
      maxCapacity: 18,
      successRate: 92.1,
      avgHandleTime: 25,
      totalCases: 178,
      activeCases: 12,
      experience: 5,
      rating: 4.8,
      regions: ['上海', '江苏'],
      caseTypes: ['企业贷款', '抵押贷款'],
      createdAt: '2022-03-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 4,
      userId: 104,
      name: '赵六',
      phone: '13800138004',
      email: 'zhaoliu@example.com',
      department: '催收二部',
      departmentId: 3,
      position: '资深催收专员',
      level: 'SENIOR',
      skills: ['外访', '协商谈判', '客户维护'],
      specialties: ['汽车贷款', '房屋贷款'],
      status: 'ACTIVE',
      workload: 22,
      maxCapacity: 30,
      successRate: 88.9,
      avgHandleTime: 18,
      totalCases: 334,
      activeCases: 22,
      experience: 4,
      rating: 4.6,
      regions: ['广州', '深圳'],
      caseTypes: ['汽车贷款', '房屋贷款'],
      createdAt: '2022-08-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 5,
      userId: 105,
      name: '钱七',
      phone: '13800138005',
      email: 'qianqi@example.com',
      department: '催收二部',
      departmentId: 3,
      position: '主管',
      level: 'SUPERVISOR',
      skills: ['团队管理', '质量控制', '培训指导'],
      specialties: ['复杂案件', '疑难案件'],
      status: 'ACTIVE',
      workload: 5,
      maxCapacity: 10,
      successRate: 95.5,
      avgHandleTime: 30,
      totalCases: 445,
      activeCases: 5,
      experience: 8,
      rating: 4.9,
      regions: ['全国'],
      caseTypes: ['复杂案件', '大额案件'],
      createdAt: '2021-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  // 应用过滤条件
  let filteredHandlers = mockHandlers;
  
  if (params?.departmentId) {
    filteredHandlers = filteredHandlers.filter(h => h.departmentId === params.departmentId);
  }
  
  if (params?.status) {
    filteredHandlers = filteredHandlers.filter(h => h.status === params.status);
  }
  
  if (params?.available) {
    filteredHandlers = filteredHandlers.filter(h => h.workload < h.maxCapacity);
  }
  
  if (params?.skill) {
    filteredHandlers = filteredHandlers.filter(h => 
      h.skills.some(skill => skill.includes(params.skill!))
    );
  }
  
  if (params?.region) {
    filteredHandlers = filteredHandlers.filter(h => 
      h.regions.some(region => region.includes(params.region!))
    );
  }

  return {
    content: filteredHandlers,
    total: filteredHandlers.length
  };
};

/**
 * 获取处理人详情 - 模拟实现
 */
export const getHandlerById = async (handlerId: number): Promise<Handler> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const handlers = await getHandlers();
  const handler = handlers.content.find(h => h.id === handlerId);
  
  if (!handler) {
    throw new Error('处理人不存在');
  }
  
  return handler;
};

/**
 * 获取处理人统计信息 - 模拟实现
 */
export const getHandlerStatistics = async (): Promise<HandlerStatistics> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return {
    totalHandlers: 45,
    activeHandlers: 42,
    avgWorkload: 14.2,
    avgSuccessRate: 86.7,
    departmentDistribution: {
      '催收一部': 15,
      '催收二部': 18,
      '法务部': 8,
      '客服部': 4
    },
    skillDistribution: {
      '电话催收': 35,
      '外访': 28,
      '法律程序': 12,
      '协商谈判': 40,
      '客户维护': 22
    }
  };
};

/**
 * 获取分配建议 - 模拟实现
 */
export const getAssignmentSuggestions = async (
  caseIds: string[],
  options?: {
    rule?: 'LOAD_BALANCE' | 'SKILL_MATCH' | 'REGION_MATCH' | 'PERFORMANCE';
    limit?: number;
  }
): Promise<AssignmentSuggestion[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const handlers = await getHandlers({ available: true });
  
  // 模拟智能分配算法
  const suggestions: AssignmentSuggestion[] = handlers.content.slice(0, options?.limit || 3).map((handler, index) => {
    const baseScore = 70 + Math.random() * 30;
    const workloadScore = (handler.maxCapacity - handler.workload) / handler.maxCapacity * 30;
    const performanceScore = handler.successRate / 100 * 40;
    const experienceScore = Math.min(handler.experience / 5, 1) * 30;
    
    const totalScore = Math.min(baseScore + workloadScore + performanceScore + experienceScore, 100);
    
    const reasons = [];
    if (handler.workload < handler.maxCapacity * 0.7) reasons.push('工作负载适中');
    if (handler.successRate > 85) reasons.push('成功率较高');
    if (handler.experience >= 3) reasons.push('经验丰富');
    if (handler.rating >= 4.5) reasons.push('评分优秀');
    
    return {
      handlerId: handler.id,
      handler,
      score: Math.round(totalScore),
      reasons,
      workloadAfterAssign: handler.workload + caseIds.length,
      estimatedCompletionTime: Math.round(handler.avgHandleTime + Math.random() * 10)
    };
  }).sort((a, b) => b.score - a.score);

  return suggestions;
};

/**
 * 执行案件分配 - 模拟实现
 */
export const assignCasesToHandler = async (request: AssignmentRequest): Promise<{
  success: boolean;
  message: string;
  assignedCases: string[];
  handlerId: number;
  operationId: number;
}> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // 模拟分配逻辑
  const success = Math.random() > 0.05; // 95% 成功率
  
  if (!success) {
    throw new Error('分配失败：处理人当前不可用');
  }
  
  return {
    success: true,
    message: `成功分配 ${request.caseIds.length} 个案件`,
    assignedCases: request.caseIds,
    handlerId: request.handlerId!,
    operationId: Date.now()
  };
};

/**
 * 获取部门列表 - 模拟实现
 */
export const getDepartments = async (): Promise<{ id: number; name: string; handlerCount: number }[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return [
    { id: 1, name: '催收一部', handlerCount: 15 },
    { id: 2, name: '法务部', handlerCount: 8 },
    { id: 3, name: '催收二部', handlerCount: 18 },
    { id: 4, name: '客服部', handlerCount: 4 }
  ];
};

/**
 * 转移案件给其他处理人 - 模拟实现
 */
export const transferCases = async (
  caseIds: string[],
  fromHandlerId: number,
  toHandlerId: number,
  reason: string
): Promise<{ success: boolean; message: string; operationId: number }> => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  return {
    success: true,
    message: `成功转移 ${caseIds.length} 个案件`,
    operationId: Date.now()
  };
};