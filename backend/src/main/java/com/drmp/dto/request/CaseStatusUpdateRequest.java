package com.drmp.dto.request;

import lombok.Data;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 * 案件状态更新请求DTO
 */
@Data
public class CaseStatusUpdateRequest {

    @NotNull(message = "状态不能为空")
    @Size(max = 50, message = "状态长度不能超过50字符")
    private String status;

    @Size(max = 500, message = "状态变更原因长度不能超过500字符")
    private String reason;

    @Size(max = 1000, message = "备注长度不能超过1000字符")
    private String remark;
}