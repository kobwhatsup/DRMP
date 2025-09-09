package com.drmp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 批量操作结果DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchOperationResult {
    
    /**
     * 是否全部成功
     */
    private Boolean success;
    
    /**
     * 总操作数量
     */
    private Integer totalCount;
    
    /**
     * 成功数量
     */
    private Integer successCount;
    
    /**
     * 失败数量
     */
    private Integer failedCount;
    
    /**
     * 成功的ID列表
     */
    private List<Long> successIds;
    
    /**
     * 失败的项目列表
     */
    private List<FailedItem> failedItems;
    
    /**
     * 操作描述
     */
    private String operation;
    
    /**
     * 执行时间（毫秒）
     */
    private Long executionTime;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FailedItem {
        /**
         * 项目ID
         */
        private Long id;
        
        /**
         * 项目名称或编号
         */
        private String identifier;
        
        /**
         * 失败原因
         */
        private String reason;
        
        /**
         * 错误代码
         */
        private String errorCode;
    }
}