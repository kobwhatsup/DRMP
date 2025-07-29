import { request } from '../utils/request';
import type { CasePackage, CasePackageQueryParams } from '../types/casePackage';
import type { PageResponse } from '../types/common';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

/**
 * 案件市场服务
 */
export const caseMarketService = {
  /**
   * 获取案件市场列表
   */
  getMarketCasePackages: async (params: CasePackageQueryParams): Promise<PageResponse<CasePackage>> => {
    const response = await request.get(`${API_BASE_URL}/case-market`, { params });
    return response.data;
  },

  /**
   * 申请案件包
   */
  applyCasePackage: async (id: number, proposal: string): Promise<string> => {
    const response = await request.post(`${API_BASE_URL}/case-market/${id}/apply`, null, {
      params: { proposal }
    });
    return response.data;
  },

  /**
   * 获取热门案件包
   */
  getHotCasePackages: async (limit: number = 10): Promise<CasePackage[]> => {
    const response = await request.get(`${API_BASE_URL}/case-market/hot`, {
      params: { limit }
    });
    return response.data;
  },

  /**
   * 获取推荐案件包
   */
  getRecommendedCasePackages: async (limit: number = 10): Promise<CasePackage[]> => {
    const response = await request.get(`${API_BASE_URL}/case-market/recommendations`, {
      params: { limit }
    });
    return response.data;
  },

  /**
   * 获取案件包竞标统计
   */
  getCasePackageBiddingStats: async (id: number) => {
    const response = await request.get(`${API_BASE_URL}/case-market/${id}/bidding-stats`);
    return response.data;
  },

  /**
   * 获取市场统计数据
   */
  getMarketStatistics: async () => {
    const response = await request.get(`${API_BASE_URL}/case-market/statistics`);
    return response.data;
  },

  /**
   * 获取按地区分布的案件包
   */
  getCasePackageDistributionByRegion: async () => {
    const response = await request.get(`${API_BASE_URL}/case-market/distribution/by-region`);
    return response.data;
  }
};