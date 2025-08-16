package com.drmp.entity.enums;

import lombok.Getter;

/**
 * Case Status Enum
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Getter
public enum CaseStatus {
    PENDING("PENDING", "待处理"),
    IN_PROGRESS("IN_PROGRESS", "处理中"),
    MEDIATION("MEDIATION", "调解中"),
    LITIGATION("LITIGATION", "诉讼中"),
    SETTLED("SETTLED", "已和解"),
    COMPLETED("COMPLETED", "已完成"),
    CLOSED("CLOSED", "已结案"),
    SUSPENDED("SUSPENDED", "已暂停"),
    CANCELLED("CANCELLED", "已取消");

    private final String code;
    private final String name;
    
    CaseStatus(String code, String name) {
        this.code = code;
        this.name = name;
    }

    public boolean isActive() {
        return this == PENDING || this == IN_PROGRESS || this == MEDIATION || this == LITIGATION;
    }

    public boolean isClosed() {
        return this == COMPLETED || this == CLOSED || this == CANCELLED;
    }
}