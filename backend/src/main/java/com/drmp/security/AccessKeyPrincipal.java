package com.drmp.security;

import com.drmp.entity.AccessKey;
import lombok.Data;

import java.security.Principal;

/**
 * 访问密钥主体信息
 */
@Data
public class AccessKeyPrincipal implements Principal {

    private final AccessKey accessKey;
    
    public AccessKeyPrincipal(AccessKey accessKey) {
        this.accessKey = accessKey;
    }

    @Override
    public String getName() {
        return accessKey.getKeyId();
    }

    public String getKeyId() {
        return accessKey.getKeyId();
    }

    public String getKeyName() {
        return accessKey.getName();
    }

    public String getKeyType() {
        return accessKey.getKeyType().getCode();
    }

    public String getOwnerType() {
        return accessKey.getOwnerType().name();
    }

    public Long getOwnerId() {
        return accessKey.getOwnerId();
    }

    public String getPermissions() {
        return accessKey.getPermissions();
    }

    public boolean isSystemKey() {
        return "PLATFORM".equals(accessKey.getOwnerType().name());
    }

    public boolean isOrganizationKey() {
        return "ORGANIZATION".equals(accessKey.getOwnerType().name());
    }

    public boolean isUserKey() {
        return "USER".equals(accessKey.getOwnerType().name());
    }
}