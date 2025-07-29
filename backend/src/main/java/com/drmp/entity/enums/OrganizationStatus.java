package com.drmp.entity.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Organization Status Enum
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Getter
@AllArgsConstructor
public enum OrganizationStatus {
    PENDING("PENDING", "准入中"),
    APPROVED("APPROVED", "已审核"),
    ACTIVE("ACTIVE", "正常"),
    SUSPENDED("SUSPENDED", "停用"),
    REJECTED("REJECTED", "已拒绝");

    private final String code;
    private final String name;
}