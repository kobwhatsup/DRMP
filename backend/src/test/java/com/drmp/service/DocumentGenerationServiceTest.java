package com.drmp.service;

import com.drmp.config.BaseServiceTest;
import com.drmp.dto.request.DocumentGenerationRequest;
import com.drmp.dto.request.DocumentTemplateCreateRequest;
import com.drmp.dto.response.DocumentGenerationResponse;
import com.drmp.dto.response.DocumentTemplateResponse;
import com.drmp.dto.response.PageResponse;
import com.drmp.entity.DocumentGeneration;
import com.drmp.entity.DocumentTemplate;
import com.drmp.service.impl.DocumentGenerationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockMultipartFile;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * DocumentGenerationService 单元测试
 */
@DisplayName("DocumentGenerationService 测试")
class DocumentGenerationServiceTest extends BaseServiceTest {

    @InjectMocks
    private DocumentGenerationServiceImpl documentGenerationService;

    private DocumentTemplateCreateRequest templateRequest;

    @BeforeEach
    void setUp() {
        templateRequest = new DocumentTemplateCreateRequest();
        templateRequest.setTemplateName("催款通知书");
        templateRequest.setTemplateType(DocumentTemplate.TemplateType.PAYMENT_NOTICE);
        templateRequest.setCategory(DocumentTemplate.DocumentCategory.PRE_LITIGATION);
        templateRequest.setTemplateContent("尊敬的${debtorName}...");
        templateRequest.setOutputFormat("PDF");
        templateRequest.setPageSize("A4");
        templateRequest.setPageOrientation("PORTRAIT");
        templateRequest.setFontFamily("SimSun");
        templateRequest.setFontSize(12);
        templateRequest.setIsSystemTemplate(false);
        templateRequest.setIsActive(true);
        templateRequest.setDescription("标准催款通知书");
        templateRequest.setTags("催款,通知");
    }

    @Test
    @DisplayName("创建模板 - 成功")
    void createTemplate_ShouldCreateSuccessfully() {
        DocumentTemplateResponse result = documentGenerationService.createTemplate(templateRequest);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isNotNull();
        assertThat(result.getTemplateName()).isEqualTo("催款通知书");
        assertThat(result.getApprovalStatus()).isEqualTo("DRAFT");
        assertThat(result.getVersion()).isEqualTo(1);
        assertThat(result.getUsageCount()).isEqualTo(0);
    }

    @Test
    @DisplayName("更新模板 - 成功")
    void updateTemplate_ShouldUpdateSuccessfully() {
        Long templateId = 1L;

        DocumentTemplateResponse result = documentGenerationService.updateTemplate(templateId, templateRequest);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(templateId);
        assertThat(result.getApprovalStatus()).isEqualTo("APPROVED");
        assertThat(result.getVersion()).isEqualTo(2);
        assertThat(result.getUsageCount()).isEqualTo(5);
    }

    @Test
    @DisplayName("删除模板 - 成功")
    void deleteTemplate_ShouldDeleteSuccessfully() {
        Long templateId = 1L;

        // 应该不抛出异常
        documentGenerationService.deleteTemplate(templateId);
    }

    @Test
    @DisplayName("获取模板详情")
    void getTemplate_ShouldReturnTemplateDetails() {
        Long templateId = 1L;

        DocumentTemplateResponse result = documentGenerationService.getTemplate(templateId);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(templateId);
        assertThat(result.getTemplateName()).isEqualTo("标准催款通知书");
        assertThat(result.getIsActive()).isTrue();
        assertThat(result.getUsageCount()).isEqualTo(100);
    }

    @Test
    @DisplayName("分页查询模板")
    void queryTemplates_ShouldReturnPagedTemplates() {
        Pageable pageable = PageRequest.of(0, 10);

        PageResponse<DocumentTemplateResponse> result = documentGenerationService.queryTemplates(
            DocumentTemplate.TemplateType.PAYMENT_NOTICE,
            DocumentTemplate.DocumentCategory.PRE_LITIGATION,
            1L,
            true,
            pageable
        );

        assertThat(result).isNotNull();
        assertThat(result.getContent()).isNotEmpty();
        assertThat(result.getTotalElements()).isGreaterThan(0);
    }

    @Test
    @DisplayName("搜索模板")
    void searchTemplates_ShouldReturnMatchingTemplates() {
        String keyword = "催款";

        List<DocumentTemplateResponse> result = documentGenerationService.searchTemplates(keyword, 1L);

        assertThat(result).isNotEmpty();
        assertThat(result).allMatch(t -> t.getTemplateName().contains(keyword));
    }

    @Test
    @DisplayName("获取热门模板")
    void getPopularTemplates_ShouldReturnPopularTemplates() {
        List<DocumentTemplateResponse> result = documentGenerationService.getPopularTemplates(1L);

        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(5);
        // 热门模板应该按使用次数降序排列
        assertThat(result.get(0).getUsageCount()).isGreaterThan(result.get(1).getUsageCount());
    }

    @Test
    @DisplayName("审批模板")
    void approveTemplate_ShouldApproveSuccessfully() {
        Long templateId = 1L;

        // 应该不抛出异常
        documentGenerationService.approveTemplate(templateId, "APPROVED");
    }

    @Test
    @DisplayName("导入模板")
    void importTemplate_ShouldImportSuccessfully() {
        MockMultipartFile file = new MockMultipartFile(
            "template",
            "template.docx",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "mock content".getBytes()
        );

        DocumentTemplateResponse result = documentGenerationService.importTemplate(file);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isNotNull();
        assertThat(result.getTemplateName()).contains("template.docx");
        assertThat(result.getApprovalStatus()).isEqualTo("DRAFT");
    }

    @Test
    @DisplayName("导出模板")
    void exportTemplate_ShouldExportSuccessfully() {
        Long templateId = 1L;

        byte[] result = documentGenerationService.exportTemplate(templateId);

        assertThat(result).isNotNull();
        assertThat(result.length).isGreaterThan(0);
    }

    @Test
    @DisplayName("预览模板")
    void previewTemplate_ShouldReturnPreviewHtml() {
        Long templateId = 1L;
        Map<String, Object> sampleData = new HashMap<>();
        sampleData.put("debtorName", "张三");
        sampleData.put("loanAmount", 10000);

        String result = documentGenerationService.previewTemplate(templateId, sampleData);

        assertThat(result).isNotNull();
        assertThat(result).contains("<html>");
        assertThat(result).contains("张三");
        assertThat(result).contains("10000");
    }

    @Test
    @DisplayName("验证模板语法")
    void validateTemplate_ShouldReturnValidationResult() {
        String templateContent = "尊敬的${debtorName}...";

        Map<String, Object> result = documentGenerationService.validateTemplate(templateContent);

        assertThat(result).isNotNull();
        assertThat(result).containsKey("isValid");
        assertThat(result).containsKey("variables");
        assertThat(result.get("isValid")).isEqualTo(true);
    }

    @Test
    @DisplayName("生成单个文档")
    void generateDocument_ShouldGenerateSuccessfully() {
        Long templateId = 1L;
        Long caseId = 100L;
        Map<String, Object> data = new HashMap<>();
        data.put("debtorName", "张三");

        DocumentGenerationResponse result = documentGenerationService.generateDocument(templateId, caseId, data);

        assertThat(result).isNotNull();
        assertThat(result.getCaseId()).isEqualTo(caseId);
        assertThat(result.getTemplateId()).isEqualTo(templateId);
        assertThat(result.getStatus()).isEqualTo(DocumentGeneration.GenerationStatus.COMPLETED);
        assertThat(result.getIsDownloadable()).isTrue();
    }

    @Test
    @DisplayName("批量生成文档")
    void batchGenerateDocuments_ShouldGenerateBatch() {
        DocumentGenerationRequest request = new DocumentGenerationRequest();
        request.setTemplateId(1L);
        request.setCaseIds(Arrays.asList(1L, 2L, 3L));
        request.setDocumentName("催款通知书");
        request.setCustomData(new HashMap<>());

        List<DocumentGenerationResponse> result = documentGenerationService.batchGenerateDocuments(request);

        assertThat(result).hasSize(3);
        assertThat(result).allMatch(r -> r.getStatus() == DocumentGeneration.GenerationStatus.COMPLETED);
    }

    @Test
    @DisplayName("获取生成状态")
    void getGenerationStatus_ShouldReturnStatus() {
        Long generationId = 1L;

        DocumentGenerationResponse result = documentGenerationService.getGenerationStatus(generationId);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(generationId);
        assertThat(result.getStatus()).isEqualTo(DocumentGeneration.GenerationStatus.COMPLETED);
    }

    @Test
    @DisplayName("下载文档")
    void downloadDocument_ShouldReturnDocumentBytes() {
        Long generationId = 1L;

        byte[] result = documentGenerationService.downloadDocument(generationId);

        assertThat(result).isNotNull();
        assertThat(result.length).isGreaterThan(0);
        assertThat(new String(result)).contains("PDF");
    }

    @Test
    @DisplayName("获取下载链接")
    void getDocumentDownloadUrl_ShouldReturnUrl() {
        Long generationId = 1L;

        String result = documentGenerationService.getDocumentDownloadUrl(generationId);

        assertThat(result).isNotNull();
        assertThat(result).contains("https://");
        assertThat(result).contains("download");
        assertThat(result).contains("token=");
    }

    @Test
    @DisplayName("分页查询生成记录")
    void queryGenerations_ShouldReturnPagedGenerations() {
        Pageable pageable = PageRequest.of(0, 10);

        PageResponse<DocumentGenerationResponse> result = documentGenerationService.queryGenerations(
            100L,
            1L,
            DocumentGeneration.GenerationStatus.COMPLETED,
            1L,
            pageable
        );

        assertThat(result).isNotNull();
        assertThat(result.getContent()).isNotEmpty();
    }

    @Test
    @DisplayName("获取案件文档")
    void getCaseDocuments_ShouldReturnCaseDocuments() {
        Long caseId = 100L;

        List<DocumentGenerationResponse> result = documentGenerationService.getCaseDocuments(caseId);

        assertThat(result).isNotEmpty();
        assertThat(result).allMatch(d -> d.getCaseId().equals(caseId));
    }

    @Test
    @DisplayName("重新生成文档")
    void regenerateDocument_ShouldRegenerateSuccessfully() {
        Long generationId = 1L;

        DocumentGenerationResponse result = documentGenerationService.regenerateDocument(generationId);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(DocumentGeneration.GenerationStatus.COMPLETED);
        assertThat(result.getRemarks()).contains("重新生成");
    }

    @Test
    @DisplayName("删除生成记录")
    void deleteGeneration_ShouldDeleteSuccessfully() {
        Long generationId = 1L;

        // 应该不抛出异常
        documentGenerationService.deleteGeneration(generationId);
    }

    @Test
    @DisplayName("签署文档")
    void signDocument_ShouldSignSuccessfully() {
        Long generationId = 1L;
        String signatureData = "signature_base64_data";

        // 应该不抛出异常
        documentGenerationService.signDocument(generationId, signatureData);
    }

    @Test
    @DisplayName("归档文档")
    void archiveDocument_ShouldArchiveSuccessfully() {
        Long generationId = 1L;

        // 应该不抛出异常
        documentGenerationService.archiveDocument(generationId);
    }

    @Test
    @DisplayName("批量归档文档")
    void batchArchiveDocuments_ShouldArchiveBatch() {
        List<Long> generationIds = Arrays.asList(1L, 2L, 3L);

        // 应该不抛出异常
        documentGenerationService.batchArchiveDocuments(generationIds);
    }

    @Test
    @DisplayName("清理过期文档")
    void cleanupExpiredDocuments_ShouldCleanupSuccessfully() {
        // 应该不抛出异常
        documentGenerationService.cleanupExpiredDocuments();
    }

    @Test
    @DisplayName("获取文档统计")
    void getDocumentStatistics_ShouldReturnStatistics() {
        Long organizationId = 1L;

        Object result = documentGenerationService.getDocumentStatistics(organizationId);

        assertThat(result).isNotNull();
        assertThat(result).isInstanceOf(Map.class);
        @SuppressWarnings("unchecked")
        Map<String, Object> stats = (Map<String, Object>) result;
        assertThat(stats).containsKeys("totalTemplates", "totalGenerations", "successfulGenerations");
    }
}
