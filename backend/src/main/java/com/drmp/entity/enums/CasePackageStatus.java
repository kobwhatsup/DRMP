package com.drmp.entity.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Case Package Status Enum
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Getter
@AllArgsConstructor
public enum CasePackageStatus {
    DRAFT("DRAFT", "草稿"),
    PUBLISHED("PUBLISHED", "已发布"),
    BIDDING("BIDDING", "竞标中"),
    ASSIGNING("ASSIGNING", "分配中"),
    WITHDRAWN("WITHDRAWN", "已撤回"),
    ASSIGNED("ASSIGNED", "已分配"),
    IN_PROGRESS("IN_PROGRESS", "处置中"),
    COMPLETED("COMPLETED", "已完成"),
    CANCELLED("CANCELLED", "已取消");

    private final String code;
    private final String name;
}