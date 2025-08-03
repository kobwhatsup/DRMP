package com.drmp.dto.request.system;

import com.drmp.dto.request.BasePageRequest;
import com.drmp.entity.system.SysOperationLog;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
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
@ApiModel(description = "操作日志查询请求")
public class OperationLogQueryRequest extends BasePageRequest {

    @ApiModelProperty(value = "用户ID")
    private Long userId;

    @ApiModelProperty(value = "用户名")
    private String username;

    @ApiModelProperty(value = "操作类型")
    private SysOperationLog.OperationType operationType;

    @ApiModelProperty(value = "模块名称")
    private String moduleName;

    @ApiModelProperty(value = "业务类型")
    private String businessType;

    @ApiModelProperty(value = "操作状态")
    private SysOperationLog.OperationStatus operationStatus;

    @ApiModelProperty(value = "操作IP")
    private String operationIp;

    @ApiModelProperty(value = "开始时间")
    private LocalDateTime startTime;

    @ApiModelProperty(value = "结束时间")
    private LocalDateTime endTime;

    @ApiModelProperty(value = "请求URL")
    private String requestUrl;

    @ApiModelProperty(value = "请求方法")
    private String requestMethod;
}