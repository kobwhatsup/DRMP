package com.drmp.dto.request;

import com.drmp.entity.BatchOperation;
import lombok.Data;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;
import java.util.Map;

/**
 * 批量操作请求DTO
 */
@Data
public class BatchOperationRequest {

    @NotNull(message = "操作类型不能为空")
    private BatchOperation.OperationType operationType;

    @NotNull(message = "操作名称不能为空")
    @Size(max = 100, message = "操作名称长度不能超过100字符")
    private String operationName;

    @NotEmpty(message = "目标ID列表不能为空")
    private List<Long> targetIds;

    @NotNull(message = "目标类型不能为空")
    @Size(max = 30, message = "目标类型长度不能超过30字符")
    private String targetType;

    private Map<String, Object> parameters;

    @Size(max = 500, message = "备注长度不能超过500字符")
    private String remarks;

    private Boolean asyncExecution = true;
}