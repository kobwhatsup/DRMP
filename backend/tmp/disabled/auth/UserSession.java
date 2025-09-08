package com.drmp.auth;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户会话信息
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
public class UserSession {
    
    private String sessionId;
    private Long userId;
    private String username;
    private String accessToken;
    private String refreshToken;
    private String clientIp;
    private String userAgent;
    private LocalDateTime createdAt;
    private LocalDateTime lastActivity;
    
    /**
     * 更新最后活动时间
     */
    public void updateLastActivity() {
        this.lastActivity = LocalDateTime.now();
    }
    
    /**
     * 获取会话持续时间（分钟）
     */
    public long getSessionDurationMinutes() {
        return java.time.Duration.between(createdAt, LocalDateTime.now()).toMinutes();
    }
    
    /**
     * 获取空闲时间（分钟）
     */
    public long getIdleTimeMinutes() {
        return java.time.Duration.between(lastActivity, LocalDateTime.now()).toMinutes();
    }
    
    /**
     * 判断会话是否已过期
     */
    public boolean isExpired(long timeoutSeconds) {
        return getIdleTimeMinutes() * 60 > timeoutSeconds;
    }
}