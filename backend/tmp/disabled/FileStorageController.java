package com.drmp.controller;

import com.drmp.dto.response.ApiResponse;
import com.drmp.dto.response.FileUploadResponse;
import com.drmp.service.FileStorageService;
import com.drmp.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * 文件存储控制器
 * 处理大文件上传、分片上传、断点续传等功能
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/v1/files")
@RequiredArgsConstructor
@Tag(name = "文件存储", description = "文件上传、下载、管理功能")
public class FileStorageController {

    private final FileStorageService fileStorageService;

    @Operation(summary = "初始化分片上传", description = "为大文件初始化分片上传会话")
    @PostMapping("/chunk/init")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'DISPOSAL_HANDLER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> initChunkUpload(
            @Parameter(description = "文件名") @RequestParam String fileName,
            @Parameter(description = "文件大小") @RequestParam Long fileSize,
            @Parameter(description = "文件类型") @RequestParam String fileType,
            @Parameter(description = "业务类型") @RequestParam String businessType,
            @Parameter(description = "业务ID") @RequestParam Long businessId) {
        
        log.info("Initializing chunk upload for file: {}, size: {}, type: {}", fileName, fileSize, fileType);
        
        Map<String, Object> result = fileStorageService.initChunkUpload(
            fileName, fileSize, fileType, businessType, businessId, SecurityUtils.getCurrentUserId());
        
        return ResponseEntity.ok(ApiResponse.success(result, "分片上传初始化成功"));
    }

    @Operation(summary = "上传文件分片", description = "上传文件的单个分片")
    @PostMapping("/chunk/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'DISPOSAL_HANDLER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadChunk(
            @Parameter(description = "上传会话ID") @RequestParam String uploadId,
            @Parameter(description = "分片序号") @RequestParam Integer chunkNumber,
            @Parameter(description = "分片数据") @RequestParam("file") MultipartFile chunk) {
        
        log.info("Uploading chunk {} for upload session: {}", chunkNumber, uploadId);
        
        Map<String, Object> result = fileStorageService.uploadChunk(uploadId, chunkNumber, chunk);
        
        return ResponseEntity.ok(ApiResponse.success(result, "分片上传成功"));
    }

    @Operation(summary = "完成分片上传", description = "合并所有分片完成文件上传")
    @PostMapping("/chunk/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'DISPOSAL_HANDLER')")
    public ResponseEntity<ApiResponse<FileUploadResponse>> completeChunkUpload(
            @Parameter(description = "上传会话ID") @RequestParam String uploadId,
            @Parameter(description = "分片MD5列表") @RequestBody List<String> chunkMd5List) {
        
        log.info("Completing chunk upload for session: {}", uploadId);
        
        FileUploadResponse result = fileStorageService.completeChunkUpload(uploadId, chunkMd5List);
        
        return ResponseEntity.ok(ApiResponse.success(result, "文件上传完成"));
    }

    @Operation(summary = "普通文件上传", description = "上传小文件(小于100MB)")
    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'DISPOSAL_HANDLER')")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadFile(
            @Parameter(description = "文件") @RequestParam("file") MultipartFile file,
            @Parameter(description = "业务类型") @RequestParam String businessType,
            @Parameter(description = "业务ID") @RequestParam Long businessId,
            @Parameter(description = "文件分类") @RequestParam(required = false) String category) {
        
        log.info("Uploading file: {}, size: {}, businessType: {}", 
            file.getOriginalFilename(), file.getSize(), businessType);
        
        FileUploadResponse result = fileStorageService.uploadFile(file, businessType, businessId, category, SecurityUtils.getCurrentUserId());
        
        return ResponseEntity.ok(ApiResponse.success(result, "文件上传成功"));
    }

    @Operation(summary = "批量文件上传", description = "批量上传多个文件")
    @PostMapping("/batch-upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'DISPOSAL_HANDLER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> batchUploadFiles(
            @Parameter(description = "文件列表") @RequestParam("files") MultipartFile[] files,
            @Parameter(description = "业务类型") @RequestParam String businessType,
            @Parameter(description = "业务ID") @RequestParam Long businessId,
            @Parameter(description = "文件分类") @RequestParam(required = false) String category) {
        
        log.info("Batch uploading {} files for businessType: {}, businessId: {}", files.length, businessType, businessId);
        
        Map<String, Object> result = fileStorageService.batchUploadFiles(files, businessType, businessId, category, SecurityUtils.getCurrentUserId());
        
        return ResponseEntity.ok(ApiResponse.success(result, "批量上传完成"));
    }

    @Operation(summary = "获取上传进度", description = "查询分片上传进度")
    @GetMapping("/chunk/progress/{uploadId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'DISPOSAL_HANDLER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUploadProgress(
            @Parameter(description = "上传会话ID") @PathVariable String uploadId) {
        
        Map<String, Object> result = fileStorageService.getUploadProgress(uploadId);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "取消上传", description = "取消分片上传并清理临时文件")
    @DeleteMapping("/chunk/cancel/{uploadId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'DISPOSAL_HANDLER')")
    public ResponseEntity<ApiResponse<Void>> cancelUpload(
            @Parameter(description = "上传会话ID") @PathVariable String uploadId) {
        
        log.info("Cancelling upload session: {}", uploadId);
        fileStorageService.cancelUpload(uploadId);
        
        return ResponseEntity.ok(ApiResponse.successWithMessage("上传已取消"));
    }

    @Operation(summary = "删除文件", description = "删除已上传的文件")
    @DeleteMapping("/{fileId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'DISPOSAL_HANDLER')")
    public ResponseEntity<ApiResponse<Void>> deleteFile(
            @Parameter(description = "文件ID") @PathVariable Long fileId) {
        
        log.info("Deleting file: {}", fileId);
        fileStorageService.deleteFile(fileId, SecurityUtils.getCurrentUserId());
        
        return ResponseEntity.ok(ApiResponse.successWithMessage("文件删除成功"));
    }

    @Operation(summary = "获取文件下载链接", description = "获取文件的临时下载链接")
    @GetMapping("/{fileId}/download-url")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'DISPOSAL_HANDLER')")
    public ResponseEntity<ApiResponse<String>> getDownloadUrl(
            @Parameter(description = "文件ID") @PathVariable Long fileId,
            @Parameter(description = "链接有效期(秒)") @RequestParam(defaultValue = "3600") Integer expireSeconds) {
        
        log.info("Getting download URL for file: {}, expireSeconds: {}", fileId, expireSeconds);
        String downloadUrl = fileStorageService.getDownloadUrl(fileId, expireSeconds);
        
        return ResponseEntity.ok(ApiResponse.success(downloadUrl));
    }

    @Operation(summary = "获取文件列表", description = "获取指定业务的文件列表")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'DISPOSAL_HANDLER')")
    public ResponseEntity<ApiResponse<List<FileUploadResponse>>> getFileList(
            @Parameter(description = "业务类型") @RequestParam String businessType,
            @Parameter(description = "业务ID") @RequestParam Long businessId,
            @Parameter(description = "文件分类") @RequestParam(required = false) String category) {
        
        List<FileUploadResponse> result = fileStorageService.getFileList(businessType, businessId, category);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "获取存储统计", description = "获取文件存储使用统计")
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStorageStatistics(
            @Parameter(description = "机构ID") @RequestParam(required = false) Long organizationId,
            @Parameter(description = "开始日期") @RequestParam(required = false) String startDate,
            @Parameter(description = "结束日期") @RequestParam(required = false) String endDate) {
        
        Map<String, Object> result = fileStorageService.getStorageStatistics(organizationId, startDate, endDate);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}