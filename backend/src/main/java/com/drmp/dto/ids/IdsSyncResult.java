package com.drmp.dto.ids;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * IDS同步结果
 *
 * @author DRMP Team
 */
@Data
public class IdsSyncResult {
    
    /**
     * 同步是否成功
     */
    private boolean success;
    
    /**
     * 结果消息
     */
    private String message;
    
    /**
     * 总记录数
     */
    private int totalCount;
    
    /**
     * 成功数量
     */
    private int successCount;
    
    /**
     * 错误数量
     */
    private int errorCount;
    
    /**
     * 错误列表
     */
    private List<String> errors = new ArrayList<>();
    
    /**
     * 开始时间
     */
    private LocalDateTime startTime = LocalDateTime.now();
    
    /**
     * 结束时间
     */
    private LocalDateTime endTime;
    
    /**
     * 耗时（毫秒）
     */
    private Long duration;
    
    /**
     * 批次ID
     */
    private String batchId;
    
    /**
     * 扩展信息
     */
    private String extraInfo;
    
    /**
     * 创建成功结果
     */
    public static IdsSyncResult success(String message, int totalCount, int successCount) {
        IdsSyncResult result = new IdsSyncResult();
        result.success = true;
        result.message = message;
        result.totalCount = totalCount;
        result.successCount = successCount;
        result.errorCount = totalCount - successCount;
        result.endTime = LocalDateTime.now();
        return result;
    }
    
    /**
     * 创建失败结果
     */
    public static IdsSyncResult failure(String message) {
        IdsSyncResult result = new IdsSyncResult();
        result.success = false;
        result.message = message;
        result.endTime = LocalDateTime.now();
        return result;
    }
    
    /**
     * 添加成功数量
     */
    public void addSuccessCount(int count) {
        this.successCount += count;
    }
    
    /**
     * 添加错误数量
     */
    public void addErrorCount(int count) {
        this.errorCount += count;
    }
    
    /**
     * 添加错误信息
     */
    public void addError(String error) {
        this.errors.add(error);
    }
    
    /**
     * 计算成功率
     */
    public double getSuccessRate() {
        return totalCount > 0 ? (double) successCount / totalCount * 100 : 0;
    }
    
    /**
     * 设置完成时间并计算耗时
     */
    public void setCompleted() {
        this.endTime = LocalDateTime.now();
        if (this.startTime != null) {
            this.duration = java.time.Duration.between(this.startTime, this.endTime).toMillis();
        }
    }
}