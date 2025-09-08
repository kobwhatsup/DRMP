import { api } from '../utils/api';

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface AccessKey {
  id: number;
  keyId: string;
  keySecret?: string;
  name: string;
  description: string;
  keyTypeCode: string;
  keyTypeName: string;
  ownerType: string;
  ownerId: number;
  status: string;
  permissions: string;
  ipWhitelist: string;
  rateLimitPerMinute: number;
  expiresAt: string;
  lastUsedAt: string;
  createdAt: string;
  updatedAt: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
}

export interface AccessKeyCreateRequest {
  name: string;
  description?: string;
  keyTypeCode: string;
  ownerType: string;
  ownerId: number;
  permissions?: string;
  ipWhitelist?: string;
  rateLimitPerMinute?: number;
  expiresAt?: string;
}

export interface AccessKeyUpdateRequest {
  name?: string;
  description?: string;
  permissions?: string;
  ipWhitelist?: string;
  rateLimitPerMinute?: number;
  expiresAt?: string;
}

export interface AccessKeyListParams {
  ownerType?: string;
  ownerId?: string;
  status?: string;
  keyTypeCode?: string;
  page?: number;
  size?: number;
}

export interface KeyUsageStats {
  keyId: string;
  keyName: string;
  statsPeriodStart: string;
  statsPeriodEnd: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  avgResponseTime: number;
  totalDataTransfer: number;
  hourlyStats: HourlyStats[];
  dailyStats: DailyStats[];
  topEndpoints: EndpointStats[];
  topIpAddresses: IpStats[];
  errorCounts: Record<string, number>;
}

export interface HourlyStats {
  hour: string;
  requests: number;
  errors: number;
  avgResponseTime: number;
}

export interface DailyStats {
  date: string;
  requests: number;
  errors: number;
  avgResponseTime: number;
  dataTransfer: number;
}

export interface EndpointStats {
  endpoint: string;
  method: string;
  requests: number;
  avgResponseTime: number;
  errors: number;
}

export interface IpStats {
  ipAddress: string;
  requests: number;
  errors: number;
  lastAccess: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export const accessKeyService = {
  // 创建访问密钥
  createAccessKey: async (data: AccessKeyCreateRequest): Promise<ApiResponse<AccessKey>> => {
    const response = await api.post<ApiResponse<AccessKey>>('/access-keys', data);
    return response.data;
  },

  // 更新访问密钥
  updateAccessKey: async (id: number, data: AccessKeyUpdateRequest): Promise<ApiResponse<AccessKey>> => {
    const response = await api.put<ApiResponse<AccessKey>>(`/access-keys/${id}`, data);
    return response.data;
  },

  // 获取访问密钥详情
  getAccessKey: async (id: number): Promise<ApiResponse<AccessKey>> => {
    const response = await api.get<ApiResponse<AccessKey>>(`/access-keys/${id}`);
    return response.data;
  },

  // 分页查询访问密钥列表
  getAccessKeys: async (params: AccessKeyListParams): Promise<ApiResponse<PageResponse<AccessKey>>> => {
    const response = await api.get<ApiResponse<PageResponse<AccessKey>>>('/access-keys', { params });
    return response.data;
  },

  // 吊销访问密钥
  revokeAccessKey: async (id: number, reason: string): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>(`/access-keys/${id}/revoke`, null, {
      params: { reason }
    });
    return response.data;
  },

  // 暂停访问密钥
  suspendAccessKey: async (id: number, reason: string): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>(`/access-keys/${id}/suspend`, null, {
      params: { reason }
    });
    return response.data;
  },

  // 激活访问密钥
  activateAccessKey: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>(`/access-keys/${id}/activate`);
    return response.data;
  },

  // 重新生成密钥秘钥
  regenerateKeySecret: async (id: number, reason: string): Promise<ApiResponse<string>> => {
    const response = await api.post<ApiResponse<string>>(`/access-keys/${id}/regenerate`, null, {
      params: { reason }
    });
    return response.data;
  },

  // 获取密钥使用统计
  getKeyUsageStats: async (keyId: string, startDate?: string, endDate?: string): Promise<ApiResponse<KeyUsageStats>> => {
    const response = await api.get<ApiResponse<KeyUsageStats>>(`/access-keys/${keyId}/usage-stats`, {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // 获取即将过期的密钥
  getExpiringKeys: async (days: number = 30): Promise<ApiResponse<AccessKey[]>> => {
    const response = await api.get<ApiResponse<AccessKey[]>>('/access-keys/expiring', {
      params: { days }
    });
    return response.data;
  },

  // 清理过期密钥
  cleanupExpiredKeys: async (): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>('/access-keys/cleanup-expired');
    return response.data;
  },

  // 导出访问密钥列表
  exportAccessKeys: async (params: AccessKeyListParams, format: string = 'excel'): Promise<Blob> => {
    const response = await api.get('/access-keys/export', {
      params: { ...params, format },
      responseType: 'blob'
    });
    return response.data;
  },

  // 验证访问密钥
  validateAccessKey: async (keyId: string, keySecret: string, clientIp: string, endpoint: string): Promise<ApiResponse<boolean>> => {
    const response = await api.post<ApiResponse<boolean>>('/access-keys/validate', null, {
      params: { keyId, keySecret, clientIp, endpoint }
    });
    return response.data;
  },

  // 获取密钥类型列表
  getKeyTypes: async (): Promise<ApiResponse<{ code: string; name: string; description: string }[]>> => {
    const response = await api.get<ApiResponse<{ code: string; name: string; description: string }[]>>('/key-types');
    return response.data;
  },

  // 获取权限模板列表
  getPermissionTemplates: async (keyTypeCode?: string): Promise<ApiResponse<{ id: number; name: string; permissions: string; description: string }[]>> => {
    const response = await api.get<ApiResponse<{ id: number; name: string; permissions: string; description: string }[]>>('/key-permission-templates', {
      params: { keyTypeCode }
    });
    return response.data;
  },
};