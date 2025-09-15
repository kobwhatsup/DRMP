import apiService from './api';

export interface AssignmentStrategy {
  strategyName: string;
  description: string;
  priority: number;
  enabled: boolean;
  configuration: Record<string, any>;
}

export interface AssignmentRule {
  id: string;
  name: string;
  description: string;
  strategies: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentRecommendation {
  organizationId: number;
  organizationName: string;
  score: number;
  reason: string;
  rank: number;
  assessmentDetails: Record<string, any>;
}

export interface AssignmentTestRequest {
  casePackageId?: number;
  strategies: string[];
  testParams: {
    caseCount?: number;
    totalAmount?: number;
    region?: string;
  };
}

class AssignmentService {
  // 获取分案策略列表
  async getStrategies(): Promise<AssignmentStrategy[]> {
    return apiService.get('/smart-assignment/strategies');
  }

  // 获取策略配置
  async getStrategyConfig(strategyName: string): Promise<Record<string, any>> {
    return apiService.get(`/smart-assignment/strategies/${strategyName}/config`);
  }

  // 更新策略配置
  async updateStrategyConfig(strategyName: string, config: Record<string, any>): Promise<void> {
    return apiService.put(`/smart-assignment/strategies/${strategyName}/config`, config);
  }

  // 启用/禁用策略
  async toggleStrategy(strategyName: string, enabled: boolean): Promise<void> {
    return apiService.post(`/smart-assignment/strategies/${strategyName}/toggle`, { enabled });
  }

  // 获取分案规则列表
  async getRules(): Promise<AssignmentRule[]> {
    return apiService.get('/smart-assignment/rules');
  }

  // 创建分案规则
  async createRule(rule: Omit<AssignmentRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssignmentRule> {
    return apiService.post('/smart-assignment/rules', rule);
  }

  // 更新分案规则
  async updateRule(ruleId: string, rule: Partial<AssignmentRule>): Promise<AssignmentRule> {
    return apiService.put(`/smart-assignment/rules/${ruleId}`, rule);
  }

  // 删除分案规则
  async deleteRule(ruleId: string): Promise<void> {
    return apiService.delete(`/smart-assignment/rules/${ruleId}`);
  }

  // 获取智能推荐
  async getRecommendations(casePackageId: number, limit?: number): Promise<AssignmentRecommendation[]> {
    return apiService.get(`/smart-assignment/recommendations/${casePackageId}`, {
      limit
    });
  }

  // 执行自动分案
  async executeAutoAssignment(casePackageId: number, strategies?: string[]): Promise<any> {
    return apiService.post('/smart-assignment/auto-assign', {
      casePackageId,
      strategies
    });
  }

  // 测试分案策略
  async testAssignment(testRequest: AssignmentTestRequest): Promise<any> {
    return apiService.post('/smart-assignment/test', testRequest);
  }

  // 批量分案
  async batchAssignment(casePackageIds: number[], strategies?: string[]): Promise<any> {
    return apiService.post('/smart-assignment/batch', {
      casePackageIds,
      strategies
    });
  }

  // 获取分案统计
  async getStatistics(organizationId?: number, startDate?: string, endDate?: string): Promise<any> {
    return apiService.get('/smart-assignment/statistics', {
      organizationId, startDate, endDate
    });
  }

  // 获取案件包的案件列表
  async getCasesByPackageId(packageId: number): Promise<any[]> {
    return apiService.get(`/case-packages/${packageId}/cases`);
  }

  // 获取可用的处置机构列表
  async getAvailableOrganizations(): Promise<any[]> {
    return apiService.get('/organizations/disposal/available');
  }

  // 获取机构推荐（别名方法）
  async getOrgRecommendations(packageId: number, limit?: number): Promise<AssignmentRecommendation[]> {
    return this.getRecommendations(packageId, limit);
  }

  // 执行分案（别名方法）
  async executeAssignment(request: any): Promise<any> {
    return this.executeAutoAssignment(request.casePackageId || request.packageId, request.strategies);
  }

  // 确认分案
  async confirmAssignment(assignmentId: string): Promise<void> {
    return apiService.post(`/smart-assignment/confirm/${assignmentId}`);
  }
}

export default new AssignmentService();