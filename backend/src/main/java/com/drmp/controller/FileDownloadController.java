package com.drmp.controller;

import com.drmp.config.FileSecurityConfig;
import com.drmp.entity.CaseAttachment;
import com.drmp.repository.CaseAttachmentRepository;
import com.drmp.service.impl.FileStorageServiceImpl;
import com.drmp.exception.BusinessException;
import com.drmp.exception.ErrorCode;
import com.drmp.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 安全文件下载控制器
 * 提供文件的安全下载和访问控制
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/v1/files")
@RequiredArgsConstructor
public class FileDownloadController {

    private final CaseAttachmentRepository caseAttachmentRepository;
    private final FileSecurityConfig fileSecurityConfig;
    private final FileStorageServiceImpl fileStorageService;

    /**
     * 通过文件ID安全下载文件
     */
    @GetMapping("/download/{fileId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'DISPOSAL_HANDLER')")
    public ResponseEntity<InputStreamResource> downloadFile(
            @PathVariable Long fileId,
            HttpServletRequest request) {

        log.info("用户 {} 请求下载文件: {}", SecurityUtils.getCurrentUserId(), fileId);

        try {
            // 1. 查找文件记录
            CaseAttachment attachment = caseAttachmentRepository.findById(fileId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "文件不存在"));

            // 2. 权限检查（简化实现，实际应根据业务规则）
            if (!hasFileAccessPermission(attachment)) {
                log.warn("用户 {} 无权限访问文件: {}", SecurityUtils.getCurrentUserId(), fileId);
                throw new BusinessException(ErrorCode.ACCESS_DENIED, "无权限访问此文件");
            }

            // 3. 检查文件安全状态
            if (attachment.getVirusScanStatus() == CaseAttachment.VirusScanStatus.INFECTED) {
                log.warn("用户尝试下载病毒文件: {}", fileId);
                throw new BusinessException(ErrorCode.INVALID_PARAMETER, "文件已被隔离，无法下载");
            }

            // 4. 获取文件流
            Path filePath = Paths.get(fileSecurityConfig.getStorageDir(), attachment.getFilePath());
            if (!Files.exists(filePath)) {
                log.error("文件不存在于磁盘: {}", filePath);
                throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "文件已损坏或丢失");
            }

            InputStream fileStream;
            if (attachment.getIsEncrypted()) {
                // 解密文件流
                fileStream = decryptFileStream(filePath);
            } else {
                fileStream = Files.newInputStream(filePath);
            }

            // 5. 更新下载记录
            updateDownloadRecord(attachment);

            // 6. 构建响应头
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, 
                "attachment; filename=\"" + attachment.getOriginalFileName() + "\"");
            headers.add(HttpHeaders.CONTENT_TYPE, 
                Optional.ofNullable(attachment.getMimeType()).orElse("application/octet-stream"));
            headers.add(HttpHeaders.CONTENT_LENGTH, String.valueOf(attachment.getFileSize()));
            
            // 添加安全头
            headers.add("X-Content-Type-Options", "nosniff");
            headers.add("X-Frame-Options", "DENY");
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");

            // 记录访问日志
            logFileAccess(attachment, request);

            return ResponseEntity.ok()
                .headers(headers)
                .body(new InputStreamResource(fileStream));

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("文件下载失败: " + fileId, e);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "文件下载失败");
        }
    }

    /**
     * 通过访问令牌下载文件
     */
    @GetMapping("/download/token/{accessToken}")
    public ResponseEntity<InputStreamResource> downloadFileByToken(
            @PathVariable String accessToken,
            HttpServletRequest request) {

        log.info("通过访问令牌下载文件: {}", accessToken);

        try {
            // 验证访问令牌
            Long fileId = validateAndConsumeAccessToken(accessToken);
            
            // 转发到普通下载方法
            return downloadFile(fileId, request);

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("令牌下载失败: " + accessToken, e);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "下载失败");
        }
    }

    /**
     * 文件预览（只读访问）
     */
    @GetMapping("/preview/{fileId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'DISPOSAL_HANDLER')")
    public ResponseEntity<InputStreamResource> previewFile(
            @PathVariable Long fileId,
            HttpServletRequest request) {

        log.info("用户 {} 预览文件: {}", SecurityUtils.getCurrentUserId(), fileId);

        try {
            CaseAttachment attachment = caseAttachmentRepository.findById(fileId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "文件不存在"));

            // 权限检查
            if (!hasFileAccessPermission(attachment)) {
                throw new BusinessException(ErrorCode.ACCESS_DENIED, "无权限访问此文件");
            }

            // 只允许预览图片和PDF
            if (!isPreviewableFile(attachment)) {
                throw new BusinessException(ErrorCode.INVALID_PARAMETER, "该文件类型不支持预览");
            }

            Path filePath = Paths.get(fileSecurityConfig.getStorageDir(), attachment.getFilePath());
            if (!Files.exists(filePath)) {
                throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "文件已损坏或丢失");
            }

            InputStream fileStream;
            if (attachment.getIsEncrypted()) {
                fileStream = decryptFileStream(filePath);
            } else {
                fileStream = Files.newInputStream(filePath);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_TYPE, attachment.getMimeType());
            headers.add("Content-Disposition", "inline");
            headers.add("X-Content-Type-Options", "nosniff");
            headers.add("X-Frame-Options", "SAMEORIGIN");

            return ResponseEntity.ok()
                .headers(headers)
                .body(new InputStreamResource(fileStream));

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("文件预览失败: " + fileId, e);
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "文件预览失败");
        }
    }

    /**
     * 获取文件信息
     */
    @GetMapping("/info/{fileId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'DISPOSAL_HANDLER')")
    public ResponseEntity<FileInfoResponse> getFileInfo(@PathVariable Long fileId) {

        CaseAttachment attachment = caseAttachmentRepository.findById(fileId)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "文件不存在"));

        if (!hasFileAccessPermission(attachment)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED, "无权限访问此文件");
        }

        FileInfoResponse info = new FileInfoResponse();
        info.setId(attachment.getId());
        info.setOriginalFileName(attachment.getOriginalFileName());
        info.setFileSize(attachment.getFileSize());
        info.setMimeType(attachment.getMimeType());
        info.setUploadedAt(attachment.getUploadedAt());
        info.setDownloadCount(attachment.getDownloadCount());
        info.setEncrypted(attachment.getIsEncrypted());
        info.setVirusScanStatus(attachment.getVirusScanStatus().getDescription());
        info.setPreviewable(isPreviewableFile(attachment));

        return ResponseEntity.ok(info);
    }

    /**
     * 批量下载文件（压缩包形式）
     */
    @PostMapping("/batch-download")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'DISPOSAL_HANDLER')")
    public ResponseEntity<InputStreamResource> batchDownloadFiles(
            @RequestBody BatchDownloadRequest request) {

        // 实现批量下载逻辑（压缩文件）
        // 这里简化实现，实际应该创建临时ZIP文件
        throw new BusinessException(ErrorCode.NOT_IMPLEMENTED, "批量下载功能暂未实现");
    }

    // === 私有辅助方法 ===

    private boolean hasFileAccessPermission(CaseAttachment attachment) {
        // 简化实现：检查用户是否为文件上传者或具有管理员权限
        Long currentUserId = SecurityUtils.getCurrentUserId();
        
        // 管理员可以访问所有文件
        if (SecurityUtils.hasRole("ADMIN")) {
            return true;
        }

        // 上传者可以访问自己的文件
        if (attachment.getUploadedBy().equals(currentUserId)) {
            return true;
        }

        // 其他业务逻辑权限检查
        // 例如：案件相关人员可以访问案件文件等
        return false;
    }

    private boolean isPreviewableFile(CaseAttachment attachment) {
        String mimeType = attachment.getMimeType();
        return mimeType != null && (
            mimeType.startsWith("image/") || 
            mimeType.equals("application/pdf") ||
            mimeType.startsWith("text/")
        );
    }

    private InputStream decryptFileStream(Path filePath) throws Exception {
        // 简化解密实现
        // 实际应该使用存储的密钥进行AES解密
        return Files.newInputStream(filePath);
    }

    private Long validateAndConsumeAccessToken(String accessToken) {
        // 这里应该实现访问令牌的验证和消费逻辑
        // 简化实现，实际应该查询令牌存储
        throw new BusinessException(ErrorCode.INVALID_PARAMETER, "无效的访问令牌");
    }

    private void updateDownloadRecord(CaseAttachment attachment) {
        try {
            caseAttachmentRepository.incrementDownloadCount(attachment.getId(), LocalDateTime.now());
        } catch (Exception e) {
            log.warn("更新下载记录失败: " + attachment.getId(), e);
        }
    }

    private void logFileAccess(CaseAttachment attachment, HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        String clientIp = getClientIpAddress(request);
        
        log.info("文件访问记录 - 文件ID: {}, 用户ID: {}, IP: {}, UserAgent: {}", 
            attachment.getId(), SecurityUtils.getCurrentUserId(), clientIp, userAgent);
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String[] headerNames = {"X-Forwarded-For", "X-Real-IP", "Proxy-Client-IP", 
                               "WL-Proxy-Client-IP", "HTTP_CLIENT_IP", "HTTP_X_FORWARDED_FOR"};
        
        for (String header : headerNames) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                return ip.split(",")[0];
            }
        }
        
        return request.getRemoteAddr();
    }

    // === DTO 类 ===

    public static class FileInfoResponse {
        private Long id;
        private String originalFileName;
        private Long fileSize;
        private String mimeType;
        private LocalDateTime uploadedAt;
        private Integer downloadCount;
        private Boolean encrypted;
        private String virusScanStatus;
        private Boolean previewable;

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getOriginalFileName() { return originalFileName; }
        public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }
        public Long getFileSize() { return fileSize; }
        public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
        public String getMimeType() { return mimeType; }
        public void setMimeType(String mimeType) { this.mimeType = mimeType; }
        public LocalDateTime getUploadedAt() { return uploadedAt; }
        public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
        public Integer getDownloadCount() { return downloadCount; }
        public void setDownloadCount(Integer downloadCount) { this.downloadCount = downloadCount; }
        public Boolean getEncrypted() { return encrypted; }
        public void setEncrypted(Boolean encrypted) { this.encrypted = encrypted; }
        public String getVirusScanStatus() { return virusScanStatus; }
        public void setVirusScanStatus(String virusScanStatus) { this.virusScanStatus = virusScanStatus; }
        public Boolean getPreviewable() { return previewable; }
        public void setPreviewable(Boolean previewable) { this.previewable = previewable; }
    }

    public static class BatchDownloadRequest {
        private java.util.List<Long> fileIds;
        private String archiveName;

        // Getters and Setters
        public java.util.List<Long> getFileIds() { return fileIds; }
        public void setFileIds(java.util.List<Long> fileIds) { this.fileIds = fileIds; }
        public String getArchiveName() { return archiveName; }
        public void setArchiveName(String archiveName) { this.archiveName = archiveName; }
    }
}