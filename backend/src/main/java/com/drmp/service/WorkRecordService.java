package com.drmp.service;

import com.drmp.dto.request.WorkRecordCreateRequest;
import com.drmp.dto.request.WorkRecordUpdateRequest;
import com.drmp.dto.request.WorkRecordQueryRequest;
import com.drmp.dto.response.PageResponse;
import com.drmp.dto.response.WorkRecordResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * 作业记录服务接口
 *
 * @author DRMP Team
 * @since 1.0.0
 */
public interface WorkRecordService {

    /**
     * 创建作业记录
     */
    WorkRecordResponse createWorkRecord(WorkRecordCreateRequest request);

    /**
     * 更新作业记录
     */
    WorkRecordResponse updateWorkRecord(Long id, WorkRecordUpdateRequest request);

    /**
     * 删除作业记录（软删除）
     */
    void deleteWorkRecord(Long id);

    /**
     * 获取作业记录详情
     */
    WorkRecordResponse getWorkRecord(Long id);

    /**
     * 分页查询作业记录
     */
    PageResponse<WorkRecordResponse> queryWorkRecords(WorkRecordQueryRequest request, Pageable pageable);

    /**
     * 获取案件的所有作业记录
     */
    List<WorkRecordResponse> getCaseWorkRecords(Long caseId);

    /**
     * 获取需要跟进的记录
     */
    List<WorkRecordResponse> getFollowUpRecords();

    /**
     * 批量创建作业记录
     */
    List<WorkRecordResponse> batchCreateWorkRecords(List<WorkRecordCreateRequest> requests);

    /**
     * 获取作业记录统计
     */
    Object getWorkRecordStatistics(Long caseId, Long handlerId);
}