package com.drmp.service;

import com.drmp.dto.request.CaseMarketQueryRequest;
import com.drmp.dto.request.BiddingCreateRequest;
import com.drmp.dto.request.BiddingQueryRequest;
import com.drmp.dto.response.CaseMarketResponse;
import com.drmp.dto.response.BiddingResponse;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

/**
 * 案件市场服务接口
 * 处理案件市场展示、竞标、匹配等功能
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public interface CaseMarketService {

    /**
     * 获取案件市场列表
     * 
     * @param request 查询请求
     * @return 案件市场列表
     */
    Page<CaseMarketResponse> getCaseMarketList(CaseMarketQueryRequest request);

    /**
     * 获取案件包详情
     * 
     * @param casePackageId 案件包ID
     * @param currentOrgId 当前机构ID
     * @return 案件包详情
     */
    CaseMarketResponse getCasePackageDetail(Long casePackageId, Long currentOrgId);

    /**
     * 提交竞标
     * 
     * @param request 竞标请求
     * @return 竞标响应
     */
    BiddingResponse submitBidding(BiddingCreateRequest request);

    /**
     * 撤回竞标
     * 
     * @param biddingId 竞标ID
     * @param userId 用户ID
     * @param reason 撤回原因
     */
    void withdrawBidding(Long biddingId, Long userId, String reason);

    /**
     * 获取竞标列表
     * 
     * @param request 查询请求
     * @return 竞标列表
     */
    Page<BiddingResponse> getBiddingList(BiddingQueryRequest request);

    /**
     * 获取竞标详情
     * 
     * @param biddingId 竞标ID
     * @return 竞标详情
     */
    BiddingResponse getBiddingDetail(Long biddingId);

    /**
     * 更新竞标
     * 
     * @param biddingId 竞标ID
     * @param request 更新请求
     * @param userId 用户ID
     * @return 更新后的竞标
     */
    BiddingResponse updateBidding(Long biddingId, BiddingCreateRequest request, Long userId);

    /**
     * 获取竞标统计
     * 
     * @param orgId 机构ID
     * @param days 统计天数
     * @return 统计数据
     */
    Map<String, Object> getBiddingStatistics(Long orgId, Integer days);

    /**
     * 获取推荐案件包
     * 
     * @param orgId 机构ID
     * @param limit 限制数量
     * @return 推荐案件包列表
     */
    List<CaseMarketResponse> getRecommendedCasePackages(Long orgId, Integer limit);

    /**
     * 获取市场趋势
     * 
     * @param days 分析天数
     * @param regionCode 地区代码
     * @param caseType 案件类型
     * @return 趋势数据
     */
    Map<String, Object> getMarketTrends(Integer days, String regionCode, String caseType);

    /**
     * 获取竞争对手分析
     * 
     * @param orgId 机构ID
     * @param dimension 分析维度
     * @param days 分析天数
     * @return 分析数据
     */
    Map<String, Object> getCompetitorAnalysis(Long orgId, String dimension, Integer days);

    /**
     * 收藏案件包
     * 
     * @param casePackageId 案件包ID
     * @param userId 用户ID
     */
    void favoriteCasePackage(Long casePackageId, Long userId);

    /**
     * 取消收藏案件包
     * 
     * @param casePackageId 案件包ID
     * @param userId 用户ID
     */
    void unfavoriteCasePackage(Long casePackageId, Long userId);

    /**
     * 获取收藏的案件包
     * 
     * @param userId 用户ID
     * @param page 页码
     * @param size 页大小
     * @return 收藏的案件包列表
     */
    Page<CaseMarketResponse> getFavoriteCasePackages(Long userId, Integer page, Integer size);

    /**
     * 获取匹配评分
     * 
     * @param orgId 机构ID
     * @param casePackageId 案件包ID
     * @return 匹配评分和分析
     */
    Map<String, Object> getMatchScore(Long orgId, Long casePackageId);
}