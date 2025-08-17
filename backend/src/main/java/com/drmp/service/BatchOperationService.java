package com.drmp.service;

import com.drmp.dto.request.BatchOperationRequest;
import com.drmp.dto.response.BatchOperationResponse;
import com.drmp.dto.response.PageResponse;
import com.drmp.entity.BatchOperation;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * 批量操作服务接口
 *
 * @author DRMP Team
 * @since 1.0.0
 */
public interface BatchOperationService {

    /**
     * 创建批量操作
     */
    BatchOperationResponse createBatchOperation(BatchOperationRequest request);

    /**
     * 执行批量操作
     */
    BatchOperationResponse executeBatchOperation(Long operationId);

    /**
     * 异步执行批量操作
     */
    void executeBatchOperationAsync(Long operationId);

    /**
     * 取消批量操作
     */
    void cancelBatchOperation(Long operationId);

    /**
     * 获取批量操作详情
     */
    BatchOperationResponse getBatchOperation(Long operationId);

    /**
     * 分页查询批量操作
     */
    PageResponse<BatchOperationResponse> queryBatchOperations(Long organizationId, 
                                                            BatchOperation.OperationType operationType,
                                                            BatchOperation.BatchStatus status,
                                                            Pageable pageable);

    /**
     * 获取用户的批量操作
     */
    List<BatchOperationResponse> getUserBatchOperations(Long userId);

    /**
     * 获取批量操作统计
     */
    Object getBatchOperationStatistics(Long organizationId);

    /**
     * 清理过期的批量操作记录
     */
    void cleanupExpiredOperations();

    /**
     * 重试失败的批量操作
     */
    BatchOperationResponse retryBatchOperation(Long operationId);

    /**
     * 批量状态更新案件
     */
    BatchOperationResponse batchUpdateCaseStatus(List<Long> caseIds, String newStatus, String reason);

    /**
     * 批量分配案件
     */
    BatchOperationResponse batchAssignCases(List<Long> caseIds, Long assigneeId, String reason);

    /**
     * 批量退案
     */
    BatchOperationResponse batchReturnCases(List<Long> caseIds, String reason);

    /**
     * 批量留案
     */
    BatchOperationResponse batchRetainCases(List<Long> caseIds, String reason);

    /**
     * 批量结案
     */
    BatchOperationResponse batchCloseCases(List<Long> caseIds, String result, String reason);

    /**
     * 批量添加标签
     */
    BatchOperationResponse batchAddTags(List<Long> caseIds, List<String> tags);

    /**
     * 批量移除标签
     */
    BatchOperationResponse batchRemoveTags(List<Long> caseIds, List<String> tags);
}