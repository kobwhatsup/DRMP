package com.drmp.service;

import com.drmp.dto.request.CaseProgressCreateRequest;
import com.drmp.dto.request.CaseProgressQueryRequest;
import com.drmp.dto.response.CaseProgressResponse;
import com.drmp.dto.response.ProgressSyncResponse;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * 案件进度协同服务接口
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public interface CaseProgressService {

    /**
     * 分页查询案件进度列表
     */
    Page<CaseProgressResponse> getCaseProgressList(CaseProgressQueryRequest request);

    /**
     * 获取指定案件的进度记录
     */
    List<CaseProgressResponse> getCaseProgressByCaseId(Long caseId);

    /**
     * 创建案件进度记录
     */
    CaseProgressResponse createCaseProgress(CaseProgressCreateRequest request);

    /**
     * 批量创建案件进度记录
     */
    Map<String, Object> batchCreateCaseProgress(List<CaseProgressCreateRequest> requests);

    /**
     * 上传进度附件
     */
    String uploadProgressAttachment(Long progressId, MultipartFile file, String attachmentType);

    /**
     * 从IDS系统同步进度
     */
    ProgressSyncResponse syncProgressFromIDS(Long casePackageId, Boolean force);

    /**
     * 获取进度统计信息
     */
    Map<String, Object> getProgressStatistics(Long organizationId, String startDate, String endDate);

    /**
     * 获取实时进度更新
     */
    List<CaseProgressResponse> getProgressUpdates(Long lastUpdateTime, Long organizationId);

    /**
     * 标记进度为已读
     */
    void markProgressAsRead(List<Long> progressIds, Long userId);

    /**
     * 设置进度提醒
     */
    void setProgressReminder(Long caseId, String reminderTime, String reminderContent, Long userId);

    /**
     * 导出进度报告
     */
    byte[] exportProgressReport(CaseProgressQueryRequest request, String format);

    /**
     * 实时推送进度更新
     */
    void pushProgressUpdate(Long caseId, String progressType, String content);

    /**
     * 获取案件协同状态
     */
    Map<String, Object> getCaseCollaborationStatus(Long caseId);
}