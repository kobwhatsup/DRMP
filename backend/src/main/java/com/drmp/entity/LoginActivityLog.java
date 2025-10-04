package com.drmp.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * 登录活动日志实体
 * 记录用户的登录、登出、失败尝试等活动
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "login_activity_logs", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_activity_type", columnList = "activity_type"),
    @Index(name = "idx_created_at", columnList = "created_at"),
    @Index(name = "idx_client_ip", columnList = "client_ip")
})
public class LoginActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 用户ID
     */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /**
     * 用户名
     */
    @Column(name = "username", length = 50)
    private String username;

    /**
     * 活动类型：LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT, TOKEN_REFRESH, SESSION_EXPIRED
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false, length = 30)
    private ActivityType activityType;

    /**
     * 客户端IP地址
     */
    @Column(name = "client_ip", length = 45)
    private String clientIp;

    /**
     * User Agent
     */
    @Column(name = "user_agent", length = 500)
    private String userAgent;

    /**
     * 会话ID
     */
    @Column(name = "session_id", length = 100)
    private String sessionId;

    /**
     * 失败原因（仅登录失败时有值）
     */
    @Column(name = "failure_reason", length = 200)
    private String failureReason;

    /**
     * 额外信息（JSON格式）
     */
    @Column(name = "extra_info", columnDefinition = "TEXT")
    private String extraInfo;

    /**
     * 创建时间
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 活动类型枚举
     */
    public enum ActivityType {
        /**
         * 登录成功
         */
        LOGIN_SUCCESS,

        /**
         * 登录失败
         */
        LOGIN_FAILED,

        /**
         * 登出
         */
        LOGOUT,

        /**
         * Token刷新
         */
        TOKEN_REFRESH,

        /**
         * 会话过期
         */
        SESSION_EXPIRED,

        /**
         * 账户锁定
         */
        ACCOUNT_LOCKED,

        /**
         * 强制登出所有会话
         */
        LOGOUT_ALL_SESSIONS
    }
}
