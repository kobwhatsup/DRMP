package com.drmp.service;

import com.drmp.dto.request.CasePackageCreateRequest;
import com.drmp.dto.request.CasePackageQueryRequest;
import com.drmp.dto.request.CasePackageUpdateRequest;
import com.drmp.dto.response.CasePackageDetailResponse;
import com.drmp.dto.response.CasePackageListResponse;
import com.drmp.dto.response.CasePackageStatisticsResponse;
import com.drmp.entity.CasePackage;
import com.drmp.entity.enums.CasePackageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Case Package Service Interface
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public interface CasePackageService {

    /**
     * 创建案件包
     * 
     * @param request 创建请求
     * @return 案件包详情
     */
    CasePackageDetailResponse createCasePackage(CasePackageCreateRequest request);

    /**
     * 更新案件包
     * 
     * @param id 案件包ID
     * @param request 更新请求
     * @return 案件包详情
     */
    CasePackageDetailResponse updateCasePackage(Long id, CasePackageUpdateRequest request);

    /**
     * 删除案件包
     * 
     * @param id 案件包ID
     */
    void deleteCasePackage(Long id);

    /**
     * 获取案件包详情
     * 
     * @param id 案件包ID
     * @return 案件包详情
     */
    CasePackageDetailResponse getCasePackageDetail(Long id);

    /**
     * 分页查询案件包列表
     * 
     * @param request 查询请求
     * @param pageable 分页参数
     * @return 案件包列表
     */
    Page<CasePackageListResponse> getCasePackageList(CasePackageQueryRequest request, Pageable pageable);

    /**
     * 发布案件包到市场
     * 
     * @param id 案件包ID
     * @return 案件包详情
     */
    CasePackageDetailResponse publishCasePackage(Long id);

    /**
     * 撤回案件包
     * 
     * @param id 案件包ID
     * @return 案件包详情
     */
    CasePackageDetailResponse withdrawCasePackage(Long id);

    /**
     * 分配案件包给处置机构
     * 
     * @param id 案件包ID
     * @param disposalOrgId 处置机构ID
     * @return 案件包详情
     */
    CasePackageDetailResponse assignCasePackage(Long id, Long disposalOrgId);

    /**
     * 接受案件包分配
     * 
     * @param id 案件包ID
     * @return 案件包详情
     */
    CasePackageDetailResponse acceptCasePackage(Long id);

    /**
     * 拒绝案件包分配
     * 
     * @param id 案件包ID
     * @param reason 拒绝原因
     * @return 案件包详情
     */
    CasePackageDetailResponse rejectCasePackage(Long id, String reason);

    /**
     * 完成案件包处置
     * 
     * @param id 案件包ID
     * @return 案件包详情
     */
    CasePackageDetailResponse completeCasePackage(Long id);

    /**
     * 批量导入案件
     * 
     * @param casePackageId 案件包ID
     * @param file Excel/CSV文件
     * @return 异步导入结果
     */
    CompletableFuture<BatchImportResult> batchImportCases(Long casePackageId, MultipartFile file);

    /**
     * 获取案件包统计信息
     * 
     * @param organizationId 机构ID（可选）
     * @return 统计信息
     */
    CasePackageStatisticsResponse getCasePackageStatistics(Long organizationId);

    /**
     * 获取案件市场列表（已发布且未分配的案件包）
     * 
     * @param request 查询请求
     * @param pageable 分页参数
     * @return 案件包列表
     */
    Page<CasePackageListResponse> getMarketCasePackages(CasePackageQueryRequest request, Pageable pageable);

    /**
     * 申请案件包（处置机构申请承接案件包）
     * 
     * @param id 案件包ID
     * @param proposal 申请提案
     * @return 申请结果
     */
    String applyCasePackage(Long id, String proposal);

    /**
     * 获取机构的案件包历史
     * 
     * @param organizationId 机构ID
     * @param status 状态筛选（可选）
     * @param pageable 分页参数
     * @return 案件包列表
     */
    Page<CasePackageListResponse> getOrganizationCasePackageHistory(Long organizationId, 
                                                                    CasePackageStatus status, 
                                                                    Pageable pageable);

    /**
     * 智能分案（根据规则自动分配案件包）
     * 
     * @param id 案件包ID
     * @return 分案结果
     */
    List<String> smartAssignCasePackage(Long id);

    /**
     * 批量操作案件包状态
     * 
     * @param ids 案件包ID列表
     * @param action 操作类型（publish, withdraw, delete等）
     * @return 操作结果
     */
    BatchOperationResult batchOperateCasePackages(List<Long> ids, String action);

    /**
     * 批量导入结果
     */
    class BatchImportResult {
        private boolean success;
        private int totalCount;
        private int successCount;
        private int failedCount;
        private List<String> errors;
        private String taskId;

        // Constructors
        public BatchImportResult() {}

        public BatchImportResult(boolean success, int totalCount, int successCount, 
                               int failedCount, List<String> errors, String taskId) {
            this.success = success;
            this.totalCount = totalCount;
            this.successCount = successCount;
            this.failedCount = failedCount;
            this.errors = errors;
            this.taskId = taskId;
        }

        // Getters and Setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public int getTotalCount() { return totalCount; }
        public void setTotalCount(int totalCount) { this.totalCount = totalCount; }

        public int getSuccessCount() { return successCount; }
        public void setSuccessCount(int successCount) { this.successCount = successCount; }

        public int getFailedCount() { return failedCount; }
        public void setFailedCount(int failedCount) { this.failedCount = failedCount; }

        public List<String> getErrors() { return errors; }
        public void setErrors(List<String> errors) { this.errors = errors; }

        public String getTaskId() { return taskId; }
        public void setTaskId(String taskId) { this.taskId = taskId; }
    }

    /**
     * 批量操作结果
     */
    class BatchOperationResult {
        private boolean success;
        private int totalCount;
        private int successCount;
        private int failedCount;
        private List<String> errors;

        // Constructors
        public BatchOperationResult() {}

        public BatchOperationResult(boolean success, int totalCount, int successCount, 
                                  int failedCount, List<String> errors) {
            this.success = success;
            this.totalCount = totalCount;
            this.successCount = successCount;
            this.failedCount = failedCount;
            this.errors = errors;
        }

        // Getters and Setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public int getTotalCount() { return totalCount; }
        public void setTotalCount(int totalCount) { this.totalCount = totalCount; }

        public int getSuccessCount() { return successCount; }
        public void setSuccessCount(int successCount) { this.successCount = successCount; }

        public int getFailedCount() { return failedCount; }
        public void setFailedCount(int failedCount) { this.failedCount = failedCount; }

        public List<String> getErrors() { return errors; }
        public void setErrors(List<String> errors) { this.errors = errors; }
    }
}