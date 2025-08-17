package com.drmp.service;

import com.drmp.dto.request.DocumentGenerationRequest;
import com.drmp.dto.request.DocumentTemplateCreateRequest;
import com.drmp.dto.response.DocumentGenerationResponse;
import com.drmp.dto.response.DocumentTemplateResponse;
import com.drmp.dto.response.PageResponse;
import com.drmp.entity.DocumentGeneration;
import com.drmp.entity.DocumentTemplate;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * 文档生成服务接口
 *
 * @author DRMP Team
 * @since 1.0.0
 */
public interface DocumentGenerationService {

    // 模板管理
    /**
     * 创建文书模板
     */
    DocumentTemplateResponse createTemplate(DocumentTemplateCreateRequest request);

    /**
     * 更新文书模板
     */
    DocumentTemplateResponse updateTemplate(Long templateId, DocumentTemplateCreateRequest request);

    /**
     * 删除文书模板
     */
    void deleteTemplate(Long templateId);

    /**
     * 获取模板详情
     */
    DocumentTemplateResponse getTemplate(Long templateId);

    /**
     * 分页查询模板
     */
    PageResponse<DocumentTemplateResponse> queryTemplates(DocumentTemplate.TemplateType templateType,
                                                        DocumentTemplate.DocumentCategory category,
                                                        Long organizationId,
                                                        Boolean isActive,
                                                        Pageable pageable);

    /**
     * 搜索模板
     */
    List<DocumentTemplateResponse> searchTemplates(String keyword, Long organizationId);

    /**
     * 获取热门模板
     */
    List<DocumentTemplateResponse> getPopularTemplates(Long organizationId);

    /**
     * 审批模板
     */
    void approveTemplate(Long templateId, String approvalStatus);

    // 文档生成
    /**
     * 生成单个文档
     */
    DocumentGenerationResponse generateDocument(Long templateId, Long caseId, Map<String, Object> data);

    /**
     * 批量生成文档
     */
    List<DocumentGenerationResponse> batchGenerateDocuments(DocumentGenerationRequest request);

    /**
     * 异步批量生成文档
     */
    void batchGenerateDocumentsAsync(DocumentGenerationRequest request);

    /**
     * 获取文档生成状态
     */
    DocumentGenerationResponse getGenerationStatus(Long generationId);

    /**
     * 下载生成的文档
     */
    byte[] downloadDocument(Long generationId);

    /**
     * 获取文档下载URL
     */
    String getDocumentDownloadUrl(Long generationId);

    /**
     * 分页查询文档生成记录
     */
    PageResponse<DocumentGenerationResponse> queryGenerations(Long caseId,
                                                            Long templateId,
                                                            DocumentGeneration.GenerationStatus status,
                                                            Long generatedBy,
                                                            Pageable pageable);

    /**
     * 获取案件的所有文档
     */
    List<DocumentGenerationResponse> getCaseDocuments(Long caseId);

    /**
     * 重新生成文档
     */
    DocumentGenerationResponse regenerateDocument(Long generationId);

    /**
     * 删除生成的文档
     */
    void deleteGeneration(Long generationId);

    /**
     * 签署文档
     */
    void signDocument(Long generationId, String signatureData);

    /**
     * 归档文档
     */
    void archiveDocument(Long generationId);

    /**
     * 批量归档文档
     */
    void batchArchiveDocuments(List<Long> generationIds);

    /**
     * 清理过期文档
     */
    void cleanupExpiredDocuments();

    /**
     * 获取文档统计信息
     */
    Object getDocumentStatistics(Long organizationId);

    /**
     * 导入模板
     */
    DocumentTemplateResponse importTemplate(MultipartFile file);

    /**
     * 导出模板
     */
    byte[] exportTemplate(Long templateId);

    /**
     * 预览模板效果
     */
    String previewTemplate(Long templateId, Map<String, Object> sampleData);

    /**
     * 验证模板语法
     */
    Map<String, Object> validateTemplate(String templateContent);
}