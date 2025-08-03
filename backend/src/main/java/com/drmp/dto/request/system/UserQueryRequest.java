package com.drmp.dto.request.system;

import lombok.Data;
import lombok.EqualsAndHashCode;
import com.drmp.dto.request.BasePageRequest;

/**
 * 用户查询请求DTO
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class UserQueryRequest extends BasePageRequest {

    private String username;

    private String email;

    private String phone;

    private String realName;

    private Long organizationId;

    private String userType;

    private String status;

    private String startDate;

    private String endDate;

    private String keyword;
}