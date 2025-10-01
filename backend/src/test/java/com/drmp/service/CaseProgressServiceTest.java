package com.drmp.service;

import com.drmp.config.BaseServiceTest;
import com.drmp.dto.request.CaseProgressCreateRequest;
import com.drmp.dto.request.CaseProgressQueryRequest;
import com.drmp.dto.response.CaseProgressResponse;
import com.drmp.dto.response.ProgressSyncResponse;
import com.drmp.service.impl.CaseProgressServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.springframework.data.domain.Page;
import org.springframework.mock.web.MockMultipartFile;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * CaseProgressService 单元测试
 * 测试案件进度协同服务的业务逻辑
 */
@DisplayName("CaseProgressService 测试")
class CaseProgressServiceTest extends BaseServiceTest {

    @InjectMocks
    private CaseProgressServiceImpl caseProgressService;

    @Test
    @DisplayName("分页查询案件进度列表 - 返回空列表")
    void getCaseProgressList_ShouldReturnEmptyList() {
        // Arrange
        CaseProgressQueryRequest request = new CaseProgressQueryRequest();
        request.setCaseId(1L);

        // Act
        Page<CaseProgressResponse> result = caseProgressService.getCaseProgressList(request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEmpty();
    }

    @Test
    @DisplayName("获取指定案件的进度记录 - 返回空列表")
    void getCaseProgressByCaseId_ShouldReturnEmptyList() {
        // Arrange
        Long caseId = 1L;

        // Act
        List<CaseProgressResponse> result = caseProgressService.getCaseProgressByCaseId(caseId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("创建案件进度记录 - 成功创建")
    void createCaseProgress_ShouldCreateProgress() {
        // Arrange
        CaseProgressCreateRequest request = new CaseProgressCreateRequest();
        request.setCaseId(1L);
        request.setProgressType("CONTACTED");
        request.setProgressContent("首次联系债务人");

        // Act
        CaseProgressResponse result = caseProgressService.createCaseProgress(request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getProgressType()).isNotNull();
        assertThat(result.getProgressContent()).isNotNull();
    }

    @Test
    @DisplayName("批量创建案件进度记录 - 返回成功结果")
    void batchCreateCaseProgress_ShouldReturnSuccessResult() {
        // Arrange
        CaseProgressCreateRequest request1 = new CaseProgressCreateRequest();
        request1.setCaseId(1L);
        request1.setProgressType("CONTACTED");

        CaseProgressCreateRequest request2 = new CaseProgressCreateRequest();
        request2.setCaseId(2L);
        request2.setProgressType("NEGOTIATING");

        List<CaseProgressCreateRequest> requests = Arrays.asList(request1, request2);

        // Act
        Map<String, Object> result = caseProgressService.batchCreateCaseProgress(requests);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.get("success")).isEqualTo(true);
        assertThat(result.get("count")).isEqualTo(2);
    }

    @Test
    @DisplayName("上传进度附件 - 返回文件路径")
    void uploadProgressAttachment_ShouldReturnFilePath() {
        // Arrange
        Long progressId = 1L;
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.pdf",
            "application/pdf",
            "test content".getBytes()
        );
        String attachmentType = "EVIDENCE";

        // Act
        String result = caseProgressService.uploadProgressAttachment(progressId, file, attachmentType);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).contains("attachment_" + progressId);
    }

    @Test
    @DisplayName("从IDS系统同步进度 - 返回同步结果")
    void syncProgressFromIDS_ShouldReturnSyncResponse() {
        // Arrange
        Long casePackageId = 1L;
        Boolean force = true;

        // Act
        ProgressSyncResponse result = caseProgressService.syncProgressFromIDS(casePackageId, force);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getSuccess()).isTrue();
        assertThat(result.getSyncedCases()).isNotNull();
    }

    @Test
    @DisplayName("获取进度统计信息 - 返回统计数据")
    void getProgressStatistics_ShouldReturnStatistics() {
        // Arrange
        Long organizationId = 5L;
        String startDate = "2025-01-01";
        String endDate = "2025-01-31";

        // Act
        Map<String, Object> result = caseProgressService.getProgressStatistics(
            organizationId, startDate, endDate);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).containsKeys("total", "completed", "pending");
        assertThat(result.get("total")).isEqualTo(0);
    }

    @Test
    @DisplayName("获取实时进度更新 - 返回更新列表")
    void getProgressUpdates_ShouldReturnUpdates() {
        // Arrange
        Long lastUpdateTime = System.currentTimeMillis() - 3600000; // 1小时前
        Long organizationId = 5L;

        // Act
        List<CaseProgressResponse> result = caseProgressService.getProgressUpdates(
            lastUpdateTime, organizationId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("标记进度为已读 - 成功标记")
    void markProgressAsRead_ShouldMarkSuccessfully() {
        // Arrange
        List<Long> progressIds = Arrays.asList(1L, 2L, 3L);
        Long userId = 10L;

        // Act & Assert - 不应抛出异常
        caseProgressService.markProgressAsRead(progressIds, userId);
    }

    @Test
    @DisplayName("设置进度提醒 - 成功设置")
    void setProgressReminder_ShouldSetSuccessfully() {
        // Arrange
        Long caseId = 1L;
        String reminderTime = "2025-02-01 10:00:00";
        String reminderContent = "请跟进案件进度";
        Long userId = 10L;

        // Act & Assert - 不应抛出异常
        caseProgressService.setProgressReminder(caseId, reminderTime, reminderContent, userId);
    }

    @Test
    @DisplayName("导出进度报告 - 返回字节数组")
    void exportProgressReport_ShouldReturnByteArray() {
        // Arrange
        CaseProgressQueryRequest request = new CaseProgressQueryRequest();
        request.setCaseId(1L);
        String format = "PDF";

        // Act
        byte[] result = caseProgressService.exportProgressReport(request, format);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty(); // 当前实现返回空数组
    }

    @Test
    @DisplayName("推送进度更新 - 成功推送")
    void pushProgressUpdate_ShouldPushSuccessfully() {
        // Arrange
        Long caseId = 1L;
        String progressType = "CONTACTED";
        String content = "已联系债务人";

        // Act & Assert - 不应抛出异常
        caseProgressService.pushProgressUpdate(caseId, progressType, content);
    }

    @Test
    @DisplayName("获取案件协同状态 - 返回状态信息")
    void getCaseCollaborationStatus_ShouldReturnStatus() {
        // Arrange
        Long caseId = 1L;

        // Act
        Map<String, Object> result = caseProgressService.getCaseCollaborationStatus(caseId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.get("caseId")).isEqualTo(caseId);
        assertThat(result.get("collaborating")).isEqualTo(false);
    }
}
