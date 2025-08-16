package com.drmp.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 批量导入响应DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchImportResponse {

    private Boolean success;
    
    private String message;
    
    private String importId;
    
    private Integer totalCount;
    
    private Integer successCount;
    
    private Integer failureCount;
    
    private Integer skipCount;
    
    private List<ImportError> errors;
    
    private Map<String, Object> statistics;
    
    private LocalDateTime startTime;
    
    private LocalDateTime endTime;
    
    private Long processingTimeMs;
    
    private String status;
    
    private String downloadUrl;
    
    private String errorReportUrl;
    
    // Additional fields for CaseBatchImportService compatibility
    private Long casePackageId;
    
    private String casePackageName;
    
    private Integer totalRows;
    
    private Integer validRows;
    
    private Integer invalidRows;
    
    private Integer duplicateRows;
    
    private Integer importedRows;
    
    private Map<Integer, List<String>> validationErrors;
    
    private Map<Integer, List<String>> validationWarnings;
    
    private Long durationMs;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportError {
        private Integer rowNumber;
        private String field;
        private String value;
        private String errorCode;
        private String errorMessage;
        private String suggestion;
    }
}