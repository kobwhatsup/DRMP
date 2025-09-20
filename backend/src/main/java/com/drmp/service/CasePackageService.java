package com.drmp.service;

import com.drmp.dto.request.*;
import com.drmp.dto.response.*;
import com.drmp.entity.CasePackage;
import com.drmp.entity.enums.CasePackageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 案件包服务接口
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public interface CasePackageService {
    
    /**
     * 创建案件包
     */
    CasePackage createCasePackage(CasePackageCreateRequest request);
    
    /**
     * 更新案件包
     */
    CasePackage updateCasePackage(Long id, CasePackageUpdateRequest request);
    
    /**
     * 获取案件包详情
     */
    CasePackageDetailResponse getCasePackageDetail(Long id);
    
    /**
     * 查询案件包列表
     */
    Page<CasePackageListResponse> getCasePackageList(CasePackageQueryRequest request, Pageable pageable);
    
    /**
     * 删除案件包
     */
    void deleteCasePackage(Long id);
    
    /**
     * 发布案件包
     */
    CasePackage publishCasePackage(Long id);
    
    /**
     * 撤回案件包
     */
    CasePackage withdrawCasePackage(Long id);
    
    /**
     * 批量导入案件
     */
    BatchImportResult importCases(Long packageId, MultipartFile file);
    
    /**
     * 导出案件数据
     */
    byte[] exportCases(Long packageId, String format);
    
    /**
     * 获取案件包统计信息
     */
    CasePackageStatisticsResponse getStatistics(Long orgId);
    
    // ========== 竞标相关 ==========
    
    /**
     * 提交竞标
     */
    CasePackageBidResponse submitBid(CasePackageBidRequest request);
    
    /**
     * 获取竞标列表
     */
    List<CasePackageBidResponse> getBidList(Long packageId);
    
    /**
     * 获取我的竞标
     */
    Page<CasePackageBidResponse> getMyBids(Long orgId, Pageable pageable);
    
    /**
     * 选择中标方
     */
    CasePackage selectWinner(Long packageId, Long bidId);
    
    /**
     * 撤回竞标
     */
    void withdrawBid(Long bidId);
    
    /**
     * 获取案件市场列表
     */
    Page<CasePackageListResponse> getMarketPackages(MarketQueryRequest request, Pageable pageable);

    /**
     * 获取案件市场列表（带查询条件）
     */
    Page<CasePackageListResponse> getMarketCasePackages(CasePackageQueryRequest request, Pageable pageable);

    /**
     * 申请案件包
     */
    String applyCasePackage(Long packageId, String proposal);
    
    // ========== 智能分案相关 ==========
    
    /**
     * 执行智能分案
     */
    SmartAssignResultResponse executeSmartAssignment(SmartAssignRequest request);
    
    /**
     * 预览智能分案结果
     */
    SmartAssignResultResponse previewSmartAssignment(SmartAssignRequest request);
    
    /**
     * 确认分案结果
     */
    void confirmAssignment(String assignmentId);
    
    /**
     * 获取分案规则列表
     */
    List<AssignmentRuleResponse> getAssignmentRules();
    
    /**
     * 创建分案规则
     */
    AssignmentRuleResponse createAssignmentRule(AssignmentRuleRequest request);
    
    /**
     * 更新分案规则
     */
    AssignmentRuleResponse updateAssignmentRule(Long id, AssignmentRuleRequest request);
    
    /**
     * 删除分案规则
     */
    void deleteAssignmentRule(Long id);
    
    /**
     * 获取推荐的处置机构
     */
    List<RecommendedOrgResponse> getRecommendedOrgs(Long packageId);
    
    // ========== 状态管理 ==========
    
    /**
     * 更新案件包状态
     */
    CasePackage updateStatus(Long id, CasePackageStatus status);
    
    /**
     * 批量更新状态
     */
    BatchOperationResult batchUpdateStatus(List<Long> ids, CasePackageStatus status);
    
    /**
     * 检查状态转换是否合法
     */
    boolean canTransitionTo(Long packageId, CasePackageStatus targetStatus);
    
    // ========== 案件操作 ==========
    
    /**
     * 添加案件到案件包
     */
    void addCases(Long packageId, List<Long> caseIds);
    
    /**
     * 从案件包移除案件
     */
    void removeCases(Long packageId, List<Long> caseIds);
    
    /**
     * 转移案件到其他案件包
     */
    void transferCases(Long sourcePackageId, Long targetPackageId, List<Long> caseIds);
    
    /**
     * 获取案件包中的案件列表
     */
    Page<CaseResponse> getCasesInPackage(Long packageId, Pageable pageable);
    
    // ========== 其他功能 ==========
    
    /**
     * 下载导入模板
     */
    byte[] downloadImportTemplate();
    
    /**
     * 检查案件包名称是否可用
     */
    boolean checkPackageName(String packageName);
    
    /**
     * 切换收藏状态
     */
    boolean toggleFavorite(Long packageId, Long userId);
    
    /**
     * 获取收藏的案件包
     */
    Page<CasePackageListResponse> getFavoritePackages(Long userId);
}