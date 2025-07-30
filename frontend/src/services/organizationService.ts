import { message } from 'antd';

// API基础配置
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// 请求配置
const getRequestConfig = () => {
  // 从Zustand persist store获取token
  const authStorage = localStorage.getItem('drmp-auth-storage');
  let token = null;
  
  if (authStorage) {
    try {
      const authData = JSON.parse(authStorage);
      token = authData.state?.accessToken;
    } catch (error) {
      console.error('Failed to parse auth storage:', error);
    }
  }
  
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
  };
};

// 通用请求函数
const request = async (url: string, options: RequestInit = {}) => {
  try {
    const config = getRequestConfig();
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...config.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// 机构数据接口
export interface Organization {
  id: number;
  orgCode: string;
  orgName: string;
  type: string;
  typeName: string;
  category: 'SOURCE' | 'DISPOSAL';
  status: string;
  statusName: string;
  contactPerson: string;
  contactPhone: string;
  email: string;
  address: string;
  teamSize: number;
  monthlyCaseCapacity: number;
  currentLoadPercentage: number;
  serviceRegions: string[];
  businessScopes: string[];
  disposalTypes?: string[];
  settlementMethods?: string[];
  cooperationCases?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
  approvalAt?: string;
  approvalBy?: string;
  approvalRemark?: string;
  membershipFee?: number;
  membershipPaid?: boolean;
  membershipPaidAt?: string;
  registrationType?: string;
  legalRepresentative?: string;
  registeredCapital?: number;
  registrationDate?: string;
  qualificationDocuments?: string;
  bankAccount?: string;
  bankName?: string;
}

// 机构详情接口（继承基本接口）
export interface OrganizationDetail extends Organization {
  approvalByName?: string;
  paymentMethod?: string;
  paymentReference?: string;
  paymentDate?: string;
  membershipStartDate?: string;
  membershipEndDate?: string;
  membershipStatus?: string;
  businessLicense?: string;
}

// 分页响应接口
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

// API响应接口
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// 查询参数接口
export interface OrganizationQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  keyword?: string;
  type?: string;
  status?: string;
  category?: string;
  region?: string;
  startDate?: string;
  endDate?: string;
}

// 机构创建请求接口
export interface OrganizationCreateRequest {
  orgCode: string;
  orgName: string;
  type: string;
  contactPerson: string;
  contactPhone: string;
  email?: string;
  address?: string;
  businessLicense?: string;
  teamSize?: number;
  monthlyCaseCapacity?: number;
  serviceRegions?: string[];
  businessScopes?: string[];
  disposalTypes?: string[];
  settlementMethods?: string[];
  cooperationCases?: string;
  description?: string;
  registrationType?: string;
  legalRepresentative?: string;
  registeredCapital?: number;
  registrationDate?: string;
  qualificationDocuments?: string;
  bankAccount?: string;
  bankName?: string;
}

// 机构更新请求接口
export interface OrganizationUpdateRequest {
  orgName?: string;
  contactPerson?: string;
  contactPhone?: string;
  email?: string;
  address?: string;
  businessLicense?: string;
  teamSize?: number;
  monthlyCaseCapacity?: number;
  serviceRegions?: string[];
  businessScopes?: string[];
  disposalTypes?: string[];
  settlementMethods?: string[];
  cooperationCases?: string;
  description?: string;
  legalRepresentative?: string;
  registeredCapital?: number;
  registrationDate?: string;
  qualificationDocuments?: string;
  bankAccount?: string;
  bankName?: string;
}

// 机构审核请求接口
export interface OrganizationApprovalRequest {
  remark?: string;
  membershipFee?: number;
}

// 会员费支付请求接口
export interface MembershipPaymentRequest {
  paymentMethod: string;
  paymentReference: string;
  remark?: string;
}

// 统计数据接口
export interface OrganizationStatistics {
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  activeCount: number;
  suspendedCount: number;
  rejectedCount: number;
  [key: string]: number;
}

// 机构服务类
class OrganizationService {
  
  /**
   * 获取机构列表
   */
  async getOrganizations(params: OrganizationQueryParams = {}): Promise<PageResponse<Organization>> {
    const queryString = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryString.append(key, String(value));
      }
    });
    
    const url = `/v1/dev/organizations?${queryString.toString()}`;
    const response: ApiResponse<PageResponse<Organization>> = await request(url);
    return response.data;
  }

  /**
   * 获取机构详情
   */
  async getOrganizationDetail(id: number): Promise<OrganizationDetail> {
    const response: ApiResponse<OrganizationDetail> = await request(`/v1/dev/organizations/${id}`);
    return response.data;
  }

  /**
   * 创建机构
   */
  async createOrganization(data: OrganizationCreateRequest): Promise<Organization> {
    const response: ApiResponse<Organization> = await request('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    message.success('机构创建成功');
    return response.data;
  }

  /**
   * 更新机构
   */
  async updateOrganization(id: number, data: OrganizationUpdateRequest): Promise<Organization> {
    const response: ApiResponse<Organization> = await request(`/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    message.success('机构更新成功');
    return response.data;
  }

  /**
   * 删除机构
   */
  async deleteOrganization(id: number): Promise<void> {
    await request(`/organizations/${id}`, {
      method: 'DELETE',
    });
    message.success('机构删除成功');
  }

  /**
   * 审核通过机构
   */
  async approveOrganization(id: number, data: OrganizationApprovalRequest): Promise<OrganizationDetail> {
    const response: ApiResponse<OrganizationDetail> = await request(`/v1/dev/organizations/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    message.success('机构审核通过');
    return response.data;
  }

  /**
   * 审核拒绝机构
   */
  async rejectOrganization(id: number, data: OrganizationApprovalRequest): Promise<OrganizationDetail> {
    const response: ApiResponse<OrganizationDetail> = await request(`/v1/dev/organizations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    message.success('机构审核拒绝');
    return response.data;
  }

  /**
   * 停用机构
   */
  async suspendOrganization(id: number, reason?: string): Promise<OrganizationDetail> {
    const queryString = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    const response: ApiResponse<OrganizationDetail> = await request(`/v1/dev/organizations/${id}/suspend${queryString}`, {
      method: 'POST',
    });
    message.success('机构已停用');
    return response.data;
  }

  /**
   * 激活机构
   */
  async activateOrganization(id: number): Promise<OrganizationDetail> {
    const response: ApiResponse<OrganizationDetail> = await request(`/v1/dev/organizations/${id}/activate`, {
      method: 'POST',
    });
    message.success('机构已激活');
    return response.data;
  }

  /**
   * 更新会员费支付信息
   */
  async updateMembershipPayment(id: number, data: MembershipPaymentRequest): Promise<OrganizationDetail> {
    const response: ApiResponse<OrganizationDetail> = await request(`/organizations/${id}/membership-payment`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    message.success('会员费支付信息已更新');
    return response.data;
  }

  /**
   * 获取机构统计数据
   */
  async getOrganizationStatistics(): Promise<OrganizationStatistics> {
    const response: ApiResponse<OrganizationStatistics> = await request('/v1/dev/organizations/statistics');
    return response.data;
  }

  /**
   * 批量操作
   */
  async batchOperation(operation: string, ids: number[], params?: any): Promise<void> {
    await request(`/organizations/batch/${operation}`, {
      method: 'POST',
      body: JSON.stringify({ ids, ...params }),
    });
    message.success(`批量${operation}操作成功`);
  }

  /**
   * 导出机构数据
   */
  async exportOrganizations(params: OrganizationQueryParams = {}): Promise<Blob> {
    const queryString = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryString.append(key, String(value));
      }
    });
    
    const url = `/organizations/export?${queryString.toString()}`;
    const response = await request(url, {
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
    
    if (response instanceof Response) {
      const blob = await response.blob();
      message.success('数据导出成功');
      return blob;
    }
    
    throw new Error('Export failed');
  }

  /**
   * 下载导出文件
   */
  downloadFile(blob: Blob, filename: string = 'organizations.xlsx') {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Aliases for approval methods to match the frontend usage
   */
  async getList(params: OrganizationQueryParams = {}): Promise<ApiResponse<PageResponse<Organization>>> {
    const queryString = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryString.append(key, String(value));
      }
    });
    
    const url = `/v1/dev/organizations?${queryString.toString()}`;
    return await request(url);
  }

  async approve(id: number, data: OrganizationApprovalRequest): Promise<Organization> {
    return this.approveOrganization(id, data);
  }

  async reject(id: number, data: OrganizationApprovalRequest): Promise<Organization> {
    return this.rejectOrganization(id, data);
  }

  async getStatistics(): Promise<ApiResponse<any>> {
    return await request('/v1/dev/organizations/statistics');
  }
}

// 创建服务实例
export const organizationService = new OrganizationService();

export default organizationService;