package com.drmp.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * 文件上传响应DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadResponse {

    private Long id;
    
    private String fileName;
    
    private String originalFileName;
    
    private String filePath;
    
    private String fileUrl;
    
    private String downloadUrl;
    
    private Long fileSize;
    
    private String fileType;
    
    private String mimeType;
    
    private String extension;
    
    private String md5Hash;
    
    private String businessType;
    
    private Long businessId;
    
    private String category;
    
    private String status;
    
    private String storageType;
    
    private String bucketName;
    
    private String objectKey;
    
    private Boolean isChunked;
    
    private Integer chunkCount;
    
    private Long uploadedBy;
    
    private String uploadedByName;
    
    private LocalDateTime uploadTime;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    // CDN相关
    private String cdnUrl;
    
    private Boolean cdnEnabled;
    
    // 安全相关
    private Boolean isEncrypted;
    
    private String encryptionKey;
    
    // 预览相关
    private Boolean previewable;
    
    private String previewUrl;
    
    private String thumbnailUrl;
    
    // 访问控制
    private String accessLevel;
    
    private LocalDateTime expireTime;
    
    // 统计信息
    private Long downloadCount;
    
    private LocalDateTime lastAccessTime;
    
    // 附加字段
    private String storedFileName;
    
    private LocalDateTime uploadedAt;
    
    private String fileMd5;
    
    private String formattedSize;
}