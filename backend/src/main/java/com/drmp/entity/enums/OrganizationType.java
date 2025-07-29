package com.drmp.entity.enums;

import lombok.Getter;

/**
 * Organization Type Enum
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Getter
public enum OrganizationType {
    // 案源机构类型
    BANK("BANK", "银行"),
    CONSUMER_FINANCE("CONSUMER_FINANCE", "消费金融公司"),
    ONLINE_LOAN("ONLINE_LOAN", "网络贷款公司"),
    MICRO_LOAN("MICRO_LOAN", "小额贷款公司"),
    ASSIST_LOAN("ASSIST_LOAN", "助贷公司"),
    AMC("AMC", "资产管理公司"),
    
    // 处置机构类型
    MEDIATION_CENTER("MEDIATION_CENTER", "调解中心"),
    LAW_FIRM("LAW_FIRM", "律师事务所"),
    DISPOSAL_COMPANY("DISPOSAL_COMPANY", "处置公司"),
    
    // 其他
    SYSTEM("SYSTEM", "系统管理"),
    OTHER("OTHER", "其他");

    private final String code;
    private final String name;
    
    OrganizationType(String code, String name) {
        this.code = code;
        this.name = name;
    }

    public boolean isSourceOrg() {
        return this == BANK || this == CONSUMER_FINANCE || this == ONLINE_LOAN || 
               this == MICRO_LOAN || this == ASSIST_LOAN || this == AMC;
    }

    public boolean isDisposalOrg() {
        return this == MEDIATION_CENTER || this == LAW_FIRM || this == DISPOSAL_COMPANY;
    }

    public boolean isSystemOrg() {
        return this == SYSTEM;
    }
}