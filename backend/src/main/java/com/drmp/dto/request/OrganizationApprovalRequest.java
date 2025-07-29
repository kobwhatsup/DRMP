package com.drmp.dto.request;

import lombok.Data;

import javax.validation.constraints.Size;

/**
 * Organization Approval Request DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
public class OrganizationApprovalRequest {

    @Size(max = 500, message = "审核备注长度不能超过500字符")
    private String remark;

    private Double membershipFee; // 会员费用（仅处置机构需要）
}