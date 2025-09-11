import { request } from '../utils/request';
import type { CasePackage, CasePackageCreateRequest, CasePackageUpdateRequest, CasePackageQueryParams } from '../types/casePackage';
import type { PageResponse } from '../types/common';

/**
 * 案件包服务
 * Note: request already has baseURL configured, so we use relative paths
 */
export const casePackageService = {
  /**
   * 获取案件包列表
   */
  getCasePackageList: async (params: CasePackageQueryParams): Promise<PageResponse<CasePackage>> => {
    const response = await request.get('/case-packages', { params });
    return response;
  },

  /**
   * 获取案件包详情
   */
  getCasePackageDetail: async (id: number): Promise<CasePackage> => {
    const response = await request.get(`/case-packages/${id}`);
    return response;
  },

  /**
   * 获取案件包详情（别名）
   */
  getDetail: async (id: number): Promise<any> => {
    const response = await request.get(`/case-packages/${id}`);
    return response;
  },

  /**
   * 创建案件包
   */
  createCasePackage: async (data: CasePackageCreateRequest): Promise<CasePackage> => {
    console.log('Creating case package with data:', data);
    const response = await request.post('/case-packages', data);
    console.log('Create case package response:', response);
    return response;
  },

  /**
   * 更新案件包
   */
  updateCasePackage: async (id: number, data: CasePackageUpdateRequest): Promise<CasePackage> => {
    const response = await request.put(`/case-packages/${id}`, data);
    return response;
  },

  /**
   * 删除案件包
   */
  deleteCasePackage: async (id: number): Promise<void> => {
    await request.delete(`/case-packages/${id}`);
  },

  /**
   * 发布案件包
   */
  publishCasePackage: async (id: number): Promise<CasePackage> => {
    const response = await request.post(`/case-packages/${id}/publish`);
    return response;
  },

  /**
   * 撤回案件包
   */
  withdrawCasePackage: async (id: number): Promise<CasePackage> => {
    const response = await request.post(`/case-packages/${id}/withdraw`);
    return response;
  },

  /**
   * 分配案件包
   */
  assignCasePackage: async (id: number, disposalOrgId: number): Promise<CasePackage> => {
    const response = await request.post(`/case-packages/${id}/assign`, null, {
      params: { disposalOrgId }
    });
    return response;
  },

  /**
   * 接受案件包
   */
  acceptCasePackage: async (id: number): Promise<CasePackage> => {
    const response = await request.post(`/case-packages/${id}/accept`);
    return response;
  },

  /**
   * 拒绝案件包
   */
  rejectCasePackage: async (id: number, reason: string): Promise<CasePackage> => {
    const response = await request.post(`/case-packages/${id}/reject`, null, {
      params: { reason }
    });
    return response;
  },

  /**
   * 完成案件包
   */
  completeCasePackage: async (id: number): Promise<CasePackage> => {
    const response = await request.post(`/case-packages/${id}/complete`);
    return response;
  },

  /**
   * 批量导入案件
   */
  batchImportCases: async (id: number, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await request.post(`/case-packages/${id}/import-cases`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  },

  /**
   * 获取案件包统计
   */
  getCasePackageStatistics: async (organizationId?: number) => {
    const response = await request.get(`/case-packages/statistics`, {
      params: { organizationId }
    });
    return response;
  },

  /**
   * 获取案件市场列表
   */
  getMarketCasePackages: async (params: CasePackageQueryParams): Promise<PageResponse<CasePackage>> => {
    const response = await request.get(`/case-packages/market`, { params });
    return response;
  },

  /**
   * 申请案件包
   */
  applyCasePackage: async (id: number, proposal: string): Promise<string> => {
    const response = await request.post(`/case-packages/${id}/apply`, null, {
      params: { proposal }
    });
    return response;
  },

  /**
   * 获取机构案件包历史
   */
  getOrganizationCasePackageHistory: async (
    organizationId: number, 
    params: CasePackageQueryParams
  ): Promise<PageResponse<CasePackage>> => {
    const response = await request.get(
      `/case-packages/organization/${organizationId}/history`, 
      { params }
    );
    return response;
  },

  /**
   * 智能分案
   */
  smartAssignCasePackage: async (id: number): Promise<string[]> => {
    const response = await request.post(`/case-packages/${id}/smart-assign`);
    return response;
  },

  /**
   * 批量操作案件包
   */
  batchOperateCasePackages: async (ids: number[], action: string) => {
    const response = await request.post(`/case-packages/batch-operation`, null, {
      params: { ids: ids.join(','), action }
    });
    return response;
  }
};