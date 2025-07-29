import { request } from '../utils/request';
import type { CasePackage, CasePackageCreateRequest, CasePackageUpdateRequest, CasePackageQueryParams } from '../types/casePackage';
import type { PageResponse } from '../types/common';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

/**
 * 案件包服务
 */
export const casePackageService = {
  /**
   * 获取案件包列表
   */
  getCasePackageList: async (params: CasePackageQueryParams): Promise<PageResponse<CasePackage>> => {
    const response = await request.get(`${API_BASE_URL}/case-packages`, { params });
    return response.data;
  },

  /**
   * 获取案件包详情
   */
  getCasePackageDetail: async (id: number): Promise<CasePackage> => {
    const response = await request.get(`${API_BASE_URL}/case-packages/${id}`);
    return response.data;
  },

  /**
   * 创建案件包
   */
  createCasePackage: async (data: CasePackageCreateRequest): Promise<CasePackage> => {
    const response = await request.post(`${API_BASE_URL}/case-packages`, data);
    return response.data;
  },

  /**
   * 更新案件包
   */
  updateCasePackage: async (id: number, data: CasePackageUpdateRequest): Promise<CasePackage> => {
    const response = await request.put(`${API_BASE_URL}/case-packages/${id}`, data);
    return response.data;
  },

  /**
   * 删除案件包
   */
  deleteCasePackage: async (id: number): Promise<void> => {
    await request.delete(`${API_BASE_URL}/case-packages/${id}`);
  },

  /**
   * 发布案件包
   */
  publishCasePackage: async (id: number): Promise<CasePackage> => {
    const response = await request.post(`${API_BASE_URL}/case-packages/${id}/publish`);
    return response.data;
  },

  /**
   * 撤回案件包
   */
  withdrawCasePackage: async (id: number): Promise<CasePackage> => {
    const response = await request.post(`${API_BASE_URL}/case-packages/${id}/withdraw`);
    return response.data;
  },

  /**
   * 分配案件包
   */
  assignCasePackage: async (id: number, disposalOrgId: number): Promise<CasePackage> => {
    const response = await request.post(`${API_BASE_URL}/case-packages/${id}/assign`, null, {
      params: { disposalOrgId }
    });
    return response.data;
  },

  /**
   * 接受案件包
   */
  acceptCasePackage: async (id: number): Promise<CasePackage> => {
    const response = await request.post(`${API_BASE_URL}/case-packages/${id}/accept`);
    return response.data;
  },

  /**
   * 拒绝案件包
   */
  rejectCasePackage: async (id: number, reason: string): Promise<CasePackage> => {
    const response = await request.post(`${API_BASE_URL}/case-packages/${id}/reject`, null, {
      params: { reason }
    });
    return response.data;
  },

  /**
   * 完成案件包
   */
  completeCasePackage: async (id: number): Promise<CasePackage> => {
    const response = await request.post(`${API_BASE_URL}/case-packages/${id}/complete`);
    return response.data;
  },

  /**
   * 批量导入案件
   */
  batchImportCases: async (id: number, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await request.post(`${API_BASE_URL}/case-packages/${id}/import-cases`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * 获取案件包统计
   */
  getCasePackageStatistics: async (organizationId?: number) => {
    const response = await request.get(`${API_BASE_URL}/case-packages/statistics`, {
      params: { organizationId }
    });
    return response.data;
  },

  /**
   * 获取案件市场列表
   */
  getMarketCasePackages: async (params: CasePackageQueryParams): Promise<PageResponse<CasePackage>> => {
    const response = await request.get(`${API_BASE_URL}/case-packages/market`, { params });
    return response.data;
  },

  /**
   * 申请案件包
   */
  applyCasePackage: async (id: number, proposal: string): Promise<string> => {
    const response = await request.post(`${API_BASE_URL}/case-packages/${id}/apply`, null, {
      params: { proposal }
    });
    return response.data;
  },

  /**
   * 获取机构案件包历史
   */
  getOrganizationCasePackageHistory: async (
    organizationId: number, 
    params: CasePackageQueryParams
  ): Promise<PageResponse<CasePackage>> => {
    const response = await request.get(
      `${API_BASE_URL}/case-packages/organization/${organizationId}/history`, 
      { params }
    );
    return response.data;
  },

  /**
   * 智能分案
   */
  smartAssignCasePackage: async (id: number): Promise<string[]> => {
    const response = await request.post(`${API_BASE_URL}/case-packages/${id}/smart-assign`);
    return response.data;
  },

  /**
   * 批量操作案件包
   */
  batchOperateCasePackages: async (ids: number[], action: string) => {
    const response = await request.post(`${API_BASE_URL}/case-packages/batch-operation`, null, {
      params: { ids: ids.join(','), action }
    });
    return response.data;
  }
};