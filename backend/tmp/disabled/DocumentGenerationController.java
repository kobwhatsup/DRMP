package com.drmp.controller;

import com.drmp.dto.request.DocumentGenerationRequest;
import com.drmp.dto.request.DocumentTemplateCreateRequest;
import com.drmp.dto.response.ApiResponse;
import com.drmp.dto.response.DocumentGenerationResponse;
import com.drmp.dto.response.DocumentTemplateResponse;
import com.drmp.dto.response.PageResponse;
import com.drmp.entity.DocumentGeneration;
import com.drmp.entity.DocumentTemplate;
import com.drmp.service.DocumentGenerationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * 文档生成控制器
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@Tag(name = "文档生成管理", description = "法律文书模板和文档生成功能")
@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentGenerationController {

    private final DocumentGenerationService documentGenerationService;

    // 模板管理相关接口
    @Operation(summary = "创建文书模板", description = "创建新的法律文书模板")
    @PostMapping("/templates")
    @PreAuthorize("hasRole('DISPOSAL_MANAGER') or hasRole('ADMIN')")
    public ApiResponse<DocumentTemplateResponse> createTemplate(@Valid @RequestBody DocumentTemplateCreateRequest request) {
        DocumentTemplateResponse response = documentGenerationService.createTemplate(request);
        return ApiResponse.success(response);
    }

    @Operation(summary = "更新文书模板", description = "更新指定的文书模板")
    @PutMapping("/templates/{templateId}")
    @PreAuthorize("hasRole('DISPOSAL_MANAGER') or hasRole('ADMIN')")
    public ApiResponse<DocumentTemplateResponse> updateTemplate(
            @PathVariable Long templateId,
            @Valid @RequestBody DocumentTemplateCreateRequest request) {
        DocumentTemplateResponse response = documentGenerationService.updateTemplate(templateId, request);
        return ApiResponse.success(response);
    }

    @Operation(summary = "删除文书模板", description = "删除指定的文书模板")
    @DeleteMapping("/templates/{templateId}")
    @PreAuthorize("hasRole('DISPOSAL_MANAGER') or hasRole('ADMIN')")
    public ApiResponse<Void> deleteTemplate(@PathVariable Long templateId) {
        documentGenerationService.deleteTemplate(templateId);
        return ApiResponse.success();
    }

    @Operation(summary = "获取模板详情", description = "获取文书模板的详细信息")
    @GetMapping("/templates/{templateId}")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<DocumentTemplateResponse> getTemplate(@PathVariable Long templateId) {
        DocumentTemplateResponse response = documentGenerationService.getTemplate(templateId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "查询文书模板", description = "分页查询文书模板")
    @GetMapping("/templates")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<PageResponse<DocumentTemplateResponse>> queryTemplates(
            @RequestParam(required = false) DocumentTemplate.TemplateType templateType,
            @RequestParam(required = false) DocumentTemplate.DocumentCategory category,
            @RequestParam(required = false) Long organizationId,
            @RequestParam(required = false) Boolean isActive,
            Pageable pageable) {
        PageResponse<DocumentTemplateResponse> response = documentGenerationService.queryTemplates(
                templateType, category, organizationId, isActive, pageable);
        return ApiResponse.success(response);
    }

    @Operation(summary = "搜索模板", description = "根据关键词搜索文书模板")
    @GetMapping("/templates/search")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<List<DocumentTemplateResponse>> searchTemplates(
            @RequestParam String keyword,
            @RequestParam(required = false) Long organizationId) {
        List<DocumentTemplateResponse> response = documentGenerationService.searchTemplates(keyword, organizationId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "获取热门模板", description = "获取使用频率最高的模板")
    @GetMapping("/templates/popular")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<List<DocumentTemplateResponse>> getPopularTemplates(
            @RequestParam(required = false) Long organizationId) {
        List<DocumentTemplateResponse> response = documentGenerationService.getPopularTemplates(organizationId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "审批模板", description = "审批文书模板")
    @PostMapping("/templates/{templateId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> approveTemplate(
            @PathVariable Long templateId,
            @RequestParam String approvalStatus) {
        documentGenerationService.approveTemplate(templateId, approvalStatus);
        return ApiResponse.success();
    }

    @Operation(summary = "导入模板", description = "从文件导入文书模板")
    @PostMapping("/templates/import")
    @PreAuthorize("hasRole('DISPOSAL_MANAGER') or hasRole('ADMIN')")
    public ApiResponse<DocumentTemplateResponse> importTemplate(@RequestParam("file") MultipartFile file) {
        DocumentTemplateResponse response = documentGenerationService.importTemplate(file);
        return ApiResponse.success(response);
    }

    @Operation(summary = "导出模板", description = "导出文书模板为文件")
    @GetMapping("/templates/{templateId}/export")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ResponseEntity<byte[]> exportTemplate(@PathVariable Long templateId) {
        byte[] content = documentGenerationService.exportTemplate(templateId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=template_" + templateId + ".json")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(content);
    }

    @Operation(summary = "预览模板", description = "预览模板生成效果")
    @PostMapping("/templates/{templateId}/preview")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<String> previewTemplate(
            @PathVariable Long templateId,
            @RequestBody Map<String, Object> sampleData) {
        String response = documentGenerationService.previewTemplate(templateId, sampleData);
        return ApiResponse.success(response);
    }

    @Operation(summary = "验证模板语法", description = "验证模板语法是否正确")
    @PostMapping("/templates/validate")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<Map<String, Object>> validateTemplate(@RequestBody String templateContent) {
        Map<String, Object> response = documentGenerationService.validateTemplate(templateContent);
        return ApiResponse.success(response);
    }

    // 文档生成相关接口
    @Operation(summary = "生成单个文档", description = "为单个案件生成文档")
    @PostMapping("/generate/single")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<DocumentGenerationResponse> generateDocument(
            @RequestParam Long templateId,
            @RequestParam Long caseId,
            @RequestBody(required = false) Map<String, Object> data) {
        DocumentGenerationResponse response = documentGenerationService.generateDocument(templateId, caseId, data);
        return ApiResponse.success(response);
    }

    @Operation(summary = "批量生成文档", description = "批量为多个案件生成文档")
    @PostMapping("/generate/batch")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<List<DocumentGenerationResponse>> batchGenerateDocuments(
            @Valid @RequestBody DocumentGenerationRequest request) {
        List<DocumentGenerationResponse> response = documentGenerationService.batchGenerateDocuments(request);
        return ApiResponse.success(response);
    }

    @Operation(summary = "异步批量生成文档", description = "异步批量生成文档，适用于大量数据")
    @PostMapping("/generate/batch-async")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<Void> batchGenerateDocumentsAsync(@Valid @RequestBody DocumentGenerationRequest request) {
        documentGenerationService.batchGenerateDocumentsAsync(request);
        return ApiResponse.success();
    }

    @Operation(summary = "获取生成状态", description = "获取文档生成的状态")
    @GetMapping("/generations/{generationId}/status")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<DocumentGenerationResponse> getGenerationStatus(@PathVariable Long generationId) {
        DocumentGenerationResponse response = documentGenerationService.getGenerationStatus(generationId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "下载文档", description = "下载生成的文档文件")
    @GetMapping("/generations/{generationId}/download")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long generationId) {
        byte[] content = documentGenerationService.downloadDocument(generationId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=document_" + generationId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(content);
    }

    @Operation(summary = "获取下载链接", description = "获取文档的下载链接")
    @GetMapping("/generations/{generationId}/download-url")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<String> getDocumentDownloadUrl(@PathVariable Long generationId) {
        String response = documentGenerationService.getDocumentDownloadUrl(generationId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "查询文档生成记录", description = "分页查询文档生成记录")
    @GetMapping("/generations")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<PageResponse<DocumentGenerationResponse>> queryGenerations(
            @RequestParam(required = false) Long caseId,
            @RequestParam(required = false) Long templateId,
            @RequestParam(required = false) DocumentGeneration.GenerationStatus status,
            @RequestParam(required = false) Long generatedBy,
            Pageable pageable) {
        PageResponse<DocumentGenerationResponse> response = documentGenerationService.queryGenerations(
                caseId, templateId, status, generatedBy, pageable);
        return ApiResponse.success(response);
    }

    @Operation(summary = "获取案件文档", description = "获取指定案件的所有文档")
    @GetMapping("/case/{caseId}")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<List<DocumentGenerationResponse>> getCaseDocuments(@PathVariable Long caseId) {
        List<DocumentGenerationResponse> response = documentGenerationService.getCaseDocuments(caseId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "重新生成文档", description = "重新生成指定的文档")
    @PostMapping("/generations/{generationId}/regenerate")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<DocumentGenerationResponse> regenerateDocument(@PathVariable Long generationId) {
        DocumentGenerationResponse response = documentGenerationService.regenerateDocument(generationId);
        return ApiResponse.success(response);
    }

    @Operation(summary = "删除文档", description = "删除生成的文档记录")
    @DeleteMapping("/generations/{generationId}")
    @PreAuthorize("hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<Void> deleteGeneration(@PathVariable Long generationId) {
        documentGenerationService.deleteGeneration(generationId);
        return ApiResponse.success();
    }

    @Operation(summary = "签署文档", description = "为文档添加电子签名")
    @PostMapping("/generations/{generationId}/sign")
    @PreAuthorize("hasRole('DISPOSAL_STAFF') or hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<Void> signDocument(
            @PathVariable Long generationId,
            @RequestParam String signatureData) {
        documentGenerationService.signDocument(generationId, signatureData);
        return ApiResponse.success();
    }

    @Operation(summary = "归档文档", description = "将文档归档")
    @PostMapping("/generations/{generationId}/archive")
    @PreAuthorize("hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<Void> archiveDocument(@PathVariable Long generationId) {
        documentGenerationService.archiveDocument(generationId);
        return ApiResponse.success();
    }

    @Operation(summary = "批量归档文档", description = "批量归档多个文档")
    @PostMapping("/generations/batch-archive")
    @PreAuthorize("hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<Void> batchArchiveDocuments(@RequestBody List<Long> generationIds) {
        documentGenerationService.batchArchiveDocuments(generationIds);
        return ApiResponse.success();
    }

    @Operation(summary = "获取文档统计", description = "获取文档生成和使用统计")
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('DISPOSAL_MANAGER')")
    public ApiResponse<Object> getDocumentStatistics(@RequestParam(required = false) Long organizationId) {
        Object response = documentGenerationService.getDocumentStatistics(organizationId);
        return ApiResponse.success(response);
    }
}