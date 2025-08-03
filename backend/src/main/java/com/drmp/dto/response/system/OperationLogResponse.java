package com.drmp.dto.response.system;

import com.drmp.entity.system.SysOperationLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 操作日志响应
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class OperationLogResponse {

    
    private Long id;

    
    private Long userId;

    
    private String username;

    
    private SysOperationLog.OperationType operationType;

    
    private String operationTypeDesc;

    
    private String moduleName;

    
    private String businessType;

    
    private String methodName;

    
    private String requestMethod;

    
    private String requestUrl;

    
    private String requestParams;

    
    private String responseResult;

    
    private String errorMessage;

    
    private String operationIp;

    
    private String operationLocation;

    
    private String userAgent;

    
    private Long executionTime;

    
    private SysOperationLog.OperationStatus operationStatus;

    
    private String operationStatusDesc;

    
    private LocalDateTime operatedAt;

    /**
     * 从实体转换为响应对象
     */
    public static OperationLogResponse fromEntity(SysOperationLog entity) {
        if (entity == null) {
            return null;
        }

        return OperationLogResponse.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .username(entity.getUsername())
                .operationType(entity.getOperationType())
                .operationTypeDesc(entity.getOperationType() != null ? entity.getOperationType().getDescription() : null)
                .moduleName(entity.getModuleName())
                .businessType(entity.getBusinessType())
                .methodName(entity.getMethodName())
                .requestMethod(entity.getRequestMethod())
                .requestUrl(entity.getRequestUrl())
                .requestParams(entity.getRequestParams())
                .responseResult(entity.getResponseResult())
                .errorMessage(entity.getErrorMessage())
                .operationIp(entity.getOperationIp())
                .operationLocation(entity.getOperationLocation())
                .userAgent(entity.getUserAgent())
                .executionTime(entity.getExecutionTime())
                .operationStatus(entity.getOperationStatus())
                .operationStatusDesc(entity.getOperationStatus() != null ? entity.getOperationStatus().getDescription() : null)
                .operatedAt(entity.getOperatedAt())
                .build();
    }
}