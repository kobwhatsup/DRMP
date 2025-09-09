package com.drmp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 批量导入结果DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchImportResult {
    
    /**
     * 导入任务ID
     */
    private String taskId;
    
    /**
     * 是否成功
     */
    private Boolean success;
    
    /**
     * 总记录数
     */
    private Integer totalCount;
    
    /**
     * 成功记录数
     */
    private Integer successCount;
    
    /**
     * 失败记录数
     */
    private Integer failedCount;
    
    /**
     * 跳过记录数
     */
    private Integer skippedCount;
    
    /**
     * 错误信息列表
     */
    private List<ImportError> errors;
    
    /**
     * 导入开始时间
     */
    private LocalDateTime startTime;
    
    /**
     * 导入结束时间
     */
    private LocalDateTime endTime;
    
    /**
     * 执行耗时（毫秒）
     */
    private Long duration;
    
    /**
     * 导入文件名
     */
    private String fileName;
    
    /**
     * 文件大小（字节）
     */
    private Long fileSize;
    
    /**
     * 操作人
     */
    private String operator;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportError {
        /**
         * 行号
         */
        private Integer rowNumber;
        
        /**
         * 列名
         */
        private String columnName;
        
        /**
         * 错误值
         */
        private String errorValue;
        
        /**
         * 错误信息
         */
        private String errorMessage;
        
        /**
         * 错误类型
         */
        private String errorType;
    }
}