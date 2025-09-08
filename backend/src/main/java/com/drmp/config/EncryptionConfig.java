package com.drmp.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * 加密相关配置
 *
 * @author DRMP Team
 */
@Configuration
@ConfigurationProperties(prefix = "app.security.encryption")
public class EncryptionConfig {
    
    /**
     * 加密密钥
     */
    private String secretKey = "drmp2024EncryptionSecretKeyForSensitiveDataProtection";
    
    /**
     * 是否启用加密
     */
    private boolean enabled = true;
    
    /**
     * 密钥轮换间隔（天）
     */
    private int keyRotationDays = 90;
    
    public String getSecretKey() {
        return secretKey;
    }
    
    public void setSecretKey(String secretKey) {
        this.secretKey = secretKey;
    }
    
    public boolean isEnabled() {
        return enabled;
    }
    
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
    
    public int getKeyRotationDays() {
        return keyRotationDays;
    }
    
    public void setKeyRotationDays(int keyRotationDays) {
        this.keyRotationDays = keyRotationDays;
    }
}