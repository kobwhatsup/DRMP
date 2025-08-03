package com.drmp.dto.response.system;

import com.drmp.entity.system.SysOperationLog;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
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
@ApiModel(description = "操作日志响应")
public class OperationLogResponse {

    @ApiModelProperty(value = "日志ID")
    private Long id;

    @ApiModelProperty(value = "用户ID")
    private Long userId;

    @ApiModelProperty(value = "用户名")
    private String username;

    @ApiModelProperty(value = "操作类型")
    private SysOperationLog.OperationType operationType;

    @ApiModelProperty(value = "操作类型描述")
    private String operationTypeDesc;

    @ApiModelProperty(value = "模块名称")
    private String moduleName;

    @ApiModelProperty(value = "业务类型")
    private String businessType;

    @ApiModelProperty(value = "方法名称")
    private String methodName;

    @ApiModelProperty(value = "请求方式")
    private String requestMethod;

    @ApiModelProperty(value = "请求URL")
    private String requestUrl;

    @ApiModelProperty(value = "请求参数")
    private String requestParams;

    @ApiModelProperty(value = "响应结果")
    private String responseResult;

    @ApiModelProperty(value = "错误信息")
    private String errorMessage;

    @ApiModelProperty(value = "操作IP")
    private String operationIp;

    @ApiModelProperty(value = "操作地点")
    private String operationLocation;

    @ApiModelProperty(value = "用户代理")
    private String userAgent;

    @ApiModelProperty(value = "执行时间(毫秒)")
    private Long executionTime;

    @ApiModelProperty(value = "操作状态")
    private SysOperationLog.OperationStatus operationStatus;

    @ApiModelProperty(value = "操作状态描述")
    private String operationStatusDesc;

    @ApiModelProperty(value = "操作时间")
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