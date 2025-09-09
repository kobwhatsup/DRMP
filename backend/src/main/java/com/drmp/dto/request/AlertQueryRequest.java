package com.drmp.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 预警查询请求DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertQueryRequest {
    
    /**
     * 开始时间
     */
    private LocalDateTime startTime;
    
    /**
     * 结束时间
     */
    private LocalDateTime endTime;
    
    /**
     * 预警类型列表
     */
    private List<String> types;
    
    /**
     * 预警级别列表
     */
    private List<String> levels;
    
    /**
     * 预警状态列表
     */
    private List<String> statuses;
    
    /**
     * 规则ID列表
     */
    private List<String> ruleIds;
    
    /**
     * 机构ID列表
     */
    private List<Long> orgIds;
    
    /**
     * 关键词
     */
    private String keyword;
    
    /**
     * 页码
     */
    private Integer page = 1;
    
    /**
     * 每页大小
     */
    private Integer size = 20;
    
    /**
     * 排序字段
     */
    private String sortBy = "triggeredAt";
    
    /**
     * 排序方向
     */
    private String sortOrder = "DESC";
    
    /**
     * 是否包含已解决的预警
     */
    private Boolean includeResolved = false;
}