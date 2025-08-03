package com.drmp.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * 报表导出响应DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportExportResponse {

    private String taskId;
    
    private String status;
    
    private String message;
    
    private String reportType;
    
    private String format;
    
    private Boolean async;
    
    private String downloadUrl;
    
    private Long fileSize;
    
    private Integer recordCount;
    
    private Integer progress;
    
    private Long userId;
    
    private String fileName;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime completedAt;
    
    private LocalDateTime expiresAt;
    
    private String errorMessage;
    
    // 导出配置
    private ExportConfig config;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExportConfig {
        private Boolean includeHeaders;
        private String dateFormat;
        private String numberFormat;
        private String encoding;
        private Integer maxRows;
    }
}