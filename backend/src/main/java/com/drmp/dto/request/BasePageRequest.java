package com.drmp.dto.request;

import lombok.Data;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;

/**
 * 基础分页请求DTO
 */
@Data
public class BasePageRequest {

    @Min(value = 1, message = "页码必须大于0")
    private Integer page = 1;

    @Min(value = 1, message = "每页大小必须大于0")
    @Max(value = 100, message = "每页大小不能超过100")
    private Integer size = 20;

    private String sortBy;

    private String sortDirection = "ASC";

    /**
     * 获取偏移量
     */
    public long getOffset() {
        return (long) (page - 1) * size;
    }
}