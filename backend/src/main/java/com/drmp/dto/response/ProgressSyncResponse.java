package com.drmp.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 进度同步响应DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressSyncResponse {

    private Boolean success;
    
    private String message;
    
    private Long casePackageId;
    
    private String casePackageName;
    
    private Integer totalCases;
    
    private Integer syncedCases;
    
    private Integer failedCases;
    
    private Integer newProgressCount;
    
    private Integer updatedProgressCount;
    
    private LocalDateTime syncStartTime;
    
    private LocalDateTime syncEndTime;
    
    private Long syncDurationMs;
    
    private String syncSource;
    
    private String syncVersion;
    
    // 同步详情
    private List<SyncDetail> syncDetails;
    
    // 错误信息
    private List<SyncError> errors;
    
    // 统计信息
    private Map<String, Object> statistics;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SyncDetail {
        private Long caseId;
        private String caseNo;
        private Boolean success;
        private String message;
        private Integer progressCount;
        private LocalDateTime lastProgressTime;
        private String idsTaskId;
        private String idsStatus;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SyncError {
        private String errorCode;
        private String errorMessage;
        private String errorDetail;
        private Long caseId;
        private String caseNo;
        private LocalDateTime errorTime;
    }
}