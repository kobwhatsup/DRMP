import { apiService } from './api';

/**
 * 预警规则配置
 */
export interface AlertRule {
  id: string;
  name: string;
  description: string;
  type: AlertType;
  level: AlertLevel;
  enabled: boolean;
  conditions: AlertCondition[];
  actions: AlertAction[];
  schedule?: string; // cron表达式
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/**
 * 预警类型
 */
export enum AlertType {
  // 业务预警
  CASE_BACKLOG = 'CASE_BACKLOG', // 案件积压
  PROCESSING_TIMEOUT = 'PROCESSING_TIMEOUT', // 处理超时
  LOW_RECOVERY_RATE = 'LOW_RECOVERY_RATE', // 回款率低
  HIGH_FAILURE_RATE = 'HIGH_FAILURE_RATE', // 失败率高
  
  // 性能预警
  EFFICIENCY_DECLINE = 'EFFICIENCY_DECLINE', // 效率下降
  COST_OVERRUN = 'COST_OVERRUN', // 成本超支
  RESOURCE_SHORTAGE = 'RESOURCE_SHORTAGE', // 资源不足
  
  // 机构预警
  ORG_PERFORMANCE_LOW = 'ORG_PERFORMANCE_LOW', // 机构绩效低
  ORG_CAPACITY_FULL = 'ORG_CAPACITY_FULL', // 机构容量满
  ORG_INACTIVE = 'ORG_INACTIVE', // 机构不活跃
  
  // 合规预警
  DOCUMENT_MISSING = 'DOCUMENT_MISSING', // 文档缺失
  PROCESS_VIOLATION = 'PROCESS_VIOLATION', // 流程违规
  COMPLIANCE_RISK = 'COMPLIANCE_RISK', // 合规风险
  
  // 系统预警
  API_SLOW = 'API_SLOW', // API响应慢
  HIGH_ERROR_RATE = 'HIGH_ERROR_RATE', // 错误率高
  SYSTEM_RESOURCE_LOW = 'SYSTEM_RESOURCE_LOW' // 系统资源低
}

/**
 * 预警级别
 */
export enum AlertLevel {
  CRITICAL = 'CRITICAL', // 严重
  HIGH = 'HIGH', // 高危
  MEDIUM = 'MEDIUM', // 中等
  LOW = 'LOW', // 低危
  INFO = 'INFO' // 信息
}

/**
 * 预警状态
 */
export enum AlertStatus {
  NEW = 'NEW', // 新预警
  ACKNOWLEDGED = 'ACKNOWLEDGED', // 已确认
  IN_PROGRESS = 'IN_PROGRESS', // 处理中
  RESOLVED = 'RESOLVED', // 已解决
  CLOSED = 'CLOSED', // 已关闭
  ESCALATED = 'ESCALATED' // 已升级
}

/**
 * 预警条件
 */
export interface AlertCondition {
  field: string;
  operator: 'GT' | 'LT' | 'EQ' | 'NEQ' | 'GTE' | 'LTE' | 'CONTAINS' | 'NOT_CONTAINS';
  value: any;
  unit?: string;
}

/**
 * 预警动作
 */
export interface AlertAction {
  type: 'NOTIFICATION' | 'EMAIL' | 'SMS' | 'WEBHOOK' | 'ESCALATE';
  config: Record<string, any>;
}

/**
 * 预警实例
 */
export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  type: AlertType;
  level: AlertLevel;
  status: AlertStatus;
  title: string;
  message: string;
  details: Record<string, any>;
  suggestedActions: string[];
  triggeredAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  escalatedTo?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  tags?: string[];
}

/**
 * 预警统计
 */
export interface AlertStatistics {
  total: number;
  byLevel: Record<AlertLevel, number>;
  byType: Record<AlertType, number>;
  byStatus: Record<AlertStatus, number>;
  unresolved: number;
  todayCount: number;
  weekCount: number;
  monthCount: number;
  avgResponseTime: number; // 平均响应时间（分钟）
  avgResolutionTime: number; // 平均解决时间（分钟）
}

/**
 * 预警趋势数据
 */
export interface AlertTrend {
  date: string;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  resolved: number;
  escalated: number;
}

/**
 * 预警查询参数
 */
export interface AlertQueryParams {
  startTime?: string;
  endTime?: string;
  types?: AlertType[];
  levels?: AlertLevel[];
  statuses?: AlertStatus[];
  ruleIds?: string[];
  orgIds?: number[];
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * 预警处理请求
 */
export interface AlertActionRequest {
  alertId: string;
  action: 'ACKNOWLEDGE' | 'RESOLVE' | 'CLOSE' | 'ESCALATE' | 'REOPEN';
  comment?: string;
  resolution?: string;
  escalateTo?: string;
}

/**
 * 预警订阅配置
 */
export interface AlertSubscription {
  id: string;
  userId: string;
  ruleIds?: string[]; // 订阅的规则ID，空表示全部
  types?: AlertType[]; // 订阅的类型
  levels?: AlertLevel[]; // 订阅的级别
  channels: AlertChannel[]; // 通知渠道
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 通知渠道配置
 */
export interface AlertChannel {
  type: 'IN_APP' | 'EMAIL' | 'SMS' | 'WEBHOOK';
  config: {
    email?: string;
    phone?: string;
    webhookUrl?: string;
    webhookHeaders?: Record<string, string>;
  };
  minLevel?: AlertLevel; // 最低级别
  schedule?: string; // 发送时间配置
}

/**
 * 预警服务API
 */
export const alertService = {
  
  // ========== 预警规则管理 ==========
  
  /**
   * 获取预警规则列表
   */
  getRules: (params?: { type?: AlertType; enabled?: boolean }) =>
    apiService.get<AlertRule[]>('/v1/alerts/rules', { params }),
  
  /**
   * 获取预警规则详情
   */
  getRule: (ruleId: string) =>
    apiService.get<AlertRule>(`/v1/alerts/rules/${ruleId}`),
  
  /**
   * 创建预警规则
   */
  createRule: (rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) =>
    apiService.post<AlertRule>('/v1/alerts/rules', rule),
  
  /**
   * 更新预警规则
   */
  updateRule: (ruleId: string, rule: Partial<AlertRule>) =>
    apiService.put<AlertRule>(`/v1/alerts/rules/${ruleId}`, rule),
  
  /**
   * 删除预警规则
   */
  deleteRule: (ruleId: string) =>
    apiService.delete(`/v1/alerts/rules/${ruleId}`),
  
  /**
   * 启用/禁用预警规则
   */
  toggleRule: (ruleId: string, enabled: boolean) =>
    apiService.put(`/v1/alerts/rules/${ruleId}/toggle`, { enabled }),
  
  // ========== 预警实例管理 ==========
  
  /**
   * 查询预警列表
   */
  getAlerts: (params: AlertQueryParams) =>
    apiService.post<Alert[]>('/v1/alerts/search', params),
  
  /**
   * 获取预警详情
   */
  getAlert: (alertId: string) =>
    apiService.get<Alert>(`/v1/alerts/${alertId}`),
  
  /**
   * 处理预警
   */
  processAlert: (request: AlertActionRequest) =>
    apiService.post<Alert>('/v1/alerts/process', request),
  
  /**
   * 批量确认预警
   */
  batchAcknowledge: (alertIds: string[], comment?: string) =>
    apiService.post('/v1/alerts/batch-acknowledge', { alertIds, comment }),
  
  /**
   * 批量关闭预警
   */
  batchClose: (alertIds: string[], resolution?: string) =>
    apiService.post('/v1/alerts/batch-close', { alertIds, resolution }),
  
  // ========== 预警统计分析 ==========
  
  /**
   * 获取预警统计
   */
  getStatistics: (params?: AlertQueryParams) =>
    apiService.post<AlertStatistics>('/v1/alerts/statistics', params || {}),
  
  /**
   * 获取预警趋势
   */
  getTrends: (params: { startTime: string; endTime: string; groupBy: 'day' | 'week' | 'month' }) =>
    apiService.post<AlertTrend[]>('/v1/alerts/trends', params),
  
  /**
   * 获取热点预警
   */
  getHotAlerts: (params?: { limit?: number; timeRange?: string }) =>
    apiService.get<Alert[]>('/v1/alerts/hot', { params }),
  
  /**
   * 获取预警分布
   */
  getDistribution: (params: { dimension: 'type' | 'level' | 'org' | 'time' }) =>
    apiService.post<Record<string, number>>('/v1/alerts/distribution', params),
  
  // ========== 预警订阅管理 ==========
  
  /**
   * 获取用户订阅配置
   */
  getSubscriptions: (userId: string) =>
    apiService.get<AlertSubscription[]>(`/v1/alerts/subscriptions/users/${userId}`),
  
  /**
   * 创建订阅
   */
  createSubscription: (subscription: Omit<AlertSubscription, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiService.post<AlertSubscription>('/v1/alerts/subscriptions', subscription),
  
  /**
   * 更新订阅
   */
  updateSubscription: (subscriptionId: string, subscription: Partial<AlertSubscription>) =>
    apiService.put<AlertSubscription>(`/v1/alerts/subscriptions/${subscriptionId}`, subscription),
  
  /**
   * 删除订阅
   */
  deleteSubscription: (subscriptionId: string) =>
    apiService.delete(`/v1/alerts/subscriptions/${subscriptionId}`),
  
  // ========== 实时预警 ==========
  
  /**
   * 获取实时预警流
   */
  getRealtimeAlerts: () =>
    apiService.get<Alert[]>('/v1/alerts/realtime'),
  
  /**
   * 手动触发预警检查
   */
  triggerCheck: (ruleId?: string) =>
    apiService.post('/v1/alerts/trigger', { ruleId }),
  
  // ========== 预警历史 ==========
  
  /**
   * 获取预警历史
   */
  getHistory: (params: AlertQueryParams & { includeResolved?: boolean }) =>
    apiService.post<Alert[]>('/v1/alerts/history', params),
  
  /**
   * 导出预警报告
   */
  exportReport: (params: AlertQueryParams & { format: 'excel' | 'pdf' }) =>
    apiService.post('/v1/alerts/export', params),
  
  // ========== 预警配置 ==========
  
  /**
   * 获取预警配置
   */
  getConfig: () =>
    apiService.get<Record<string, any>>('/v1/alerts/config'),
  
  /**
   * 更新预警配置
   */
  updateConfig: (config: Record<string, any>) =>
    apiService.put('/v1/alerts/config', config),
  
  /**
   * 测试预警规则
   */
  testRule: (rule: Partial<AlertRule>) =>
    apiService.post<{ success: boolean; result: any }>('/v1/alerts/test', rule),
  
  /**
   * 获取预警模板
   */
  getTemplates: () =>
    apiService.get<AlertRule[]>('/v1/alerts/templates'),
  
  /**
   * 从模板创建规则
   */
  createFromTemplate: (templateId: string, customization: Partial<AlertRule>) =>
    apiService.post<AlertRule>(`/v1/alerts/templates/${templateId}/create`, customization)
};

/**
 * 预警级别配置
 */
export const ALERT_LEVEL_CONFIG = {
  [AlertLevel.CRITICAL]: {
    color: '#f5222d',
    label: '严重',
    priority: 1,
    autoEscalate: true,
    responseTime: 5 // 分钟
  },
  [AlertLevel.HIGH]: {
    color: '#fa8c16',
    label: '高危',
    priority: 2,
    autoEscalate: true,
    responseTime: 15
  },
  [AlertLevel.MEDIUM]: {
    color: '#faad14',
    label: '中等',
    priority: 3,
    autoEscalate: false,
    responseTime: 60
  },
  [AlertLevel.LOW]: {
    color: '#52c41a',
    label: '低危',
    priority: 4,
    autoEscalate: false,
    responseTime: 240
  },
  [AlertLevel.INFO]: {
    color: '#1890ff',
    label: '信息',
    priority: 5,
    autoEscalate: false,
    responseTime: null
  }
};

/**
 * 预警类型配置
 */
export const ALERT_TYPE_CONFIG = {
  [AlertType.CASE_BACKLOG]: { label: '案件积压', icon: 'FileExclamationOutlined', category: '业务' },
  [AlertType.PROCESSING_TIMEOUT]: { label: '处理超时', icon: 'ClockCircleOutlined', category: '业务' },
  [AlertType.LOW_RECOVERY_RATE]: { label: '回款率低', icon: 'FallOutlined', category: '业务' },
  [AlertType.HIGH_FAILURE_RATE]: { label: '失败率高', icon: 'CloseCircleOutlined', category: '业务' },
  [AlertType.EFFICIENCY_DECLINE]: { label: '效率下降', icon: 'ArrowDownOutlined', category: '性能' },
  [AlertType.COST_OVERRUN]: { label: '成本超支', icon: 'DollarCircleOutlined', category: '性能' },
  [AlertType.RESOURCE_SHORTAGE]: { label: '资源不足', icon: 'TeamOutlined', category: '性能' },
  [AlertType.ORG_PERFORMANCE_LOW]: { label: '机构绩效低', icon: 'BarChartOutlined', category: '机构' },
  [AlertType.ORG_CAPACITY_FULL]: { label: '机构容量满', icon: 'DatabaseOutlined', category: '机构' },
  [AlertType.ORG_INACTIVE]: { label: '机构不活跃', icon: 'StopOutlined', category: '机构' },
  [AlertType.DOCUMENT_MISSING]: { label: '文档缺失', icon: 'FileSearchOutlined', category: '合规' },
  [AlertType.PROCESS_VIOLATION]: { label: '流程违规', icon: 'ExceptionOutlined', category: '合规' },
  [AlertType.COMPLIANCE_RISK]: { label: '合规风险', icon: 'SafetyCertificateOutlined', category: '合规' },
  [AlertType.API_SLOW]: { label: 'API响应慢', icon: 'ApiOutlined', category: '系统' },
  [AlertType.HIGH_ERROR_RATE]: { label: '错误率高', icon: 'BugOutlined', category: '系统' },
  [AlertType.SYSTEM_RESOURCE_LOW]: { label: '系统资源低', icon: 'CloudServerOutlined', category: '系统' }
};