package com.drmp.entity.enums;

import lombok.Getter;

/**
 * User Status Enum
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Getter
public enum UserStatus {
    ACTIVE("ACTIVE", "正常"),
    INACTIVE("INACTIVE", "禁用"),
    LOCKED("LOCKED", "锁定"),
    EXPIRED("EXPIRED", "过期");

    private final String code;
    private final String name;
    
    UserStatus(String code, String name) {
        this.code = code;
        this.name = name;
    }
}