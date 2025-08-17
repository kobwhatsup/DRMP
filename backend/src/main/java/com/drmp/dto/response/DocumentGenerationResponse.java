package com.drmp.dto.response;

import com.drmp.entity.DocumentGeneration;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 文档生成响应DTO
 */
@Data
public class DocumentGenerationResponse {

    private Long id;
    private Long caseId;
    private String caseNumber;
    private Long templateId;
    private String templateName;
    private Long batchOperationId;
    private String documentName;
    private String filePath;
    private String fileUrl;
    private Long fileSize;
    private String formattedFileSize;
    private String fileMd5;
    private DocumentGeneration.GenerationStatus status;
    private String statusDesc;
    private String generationData;
    private String errorMessage;
    private Integer generationTime;
    private Long generatedBy;
    private String generatedByName;
    private LocalDateTime generatedAt;
    private Integer downloadedCount;
    private LocalDateTime lastDownloadedAt;
    private Boolean isSigned;
    private Long signedBy;
    private LocalDateTime signedAt;
    private String signatureInfo;
    private LocalDateTime expiresAt;
    private Boolean isArchived;
    private String archivePath;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isDownloadable;
    private Boolean isExpired;

    public void setStatus(DocumentGeneration.GenerationStatus status) {
        this.status = status;
        this.statusDesc = status != null ? status.getDescription() : null;
    }
}