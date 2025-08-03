package com.drmp.dto.request.system;

import com.drmp.dto.request.BasePageRequest;
import com.drmp.entity.system.SysOperationLog;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 操作日志查询请求
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Schema(description = "操作日志查询请求")
public class OperationLogQueryRequest extends BasePageRequest {

    @Schema(description = "用户ID")
    private Long userId;

    @Schema(description = "用户名")
    private String username;

    @Schema(description = "操作类型")
    private SysOperationLog.OperationType operationType;

    
    private String moduleName;

    
    private String businessType;

    
    private SysOperationLog.OperationStatus operationStatus;

    
    private String operationIp;

    
    private LocalDateTime startTime;

    
    private LocalDateTime endTime;

    
    private String requestUrl;

    
    private String requestMethod;
}