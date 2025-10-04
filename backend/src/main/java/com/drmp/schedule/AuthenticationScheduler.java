package com.drmp.schedule;

import com.drmp.auth.UnifiedAuthenticationManager;
import com.drmp.repository.LoginActivityLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 认证相关定时任务
 * - 清理过期会话
 * - 清理过期登录日志
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuthenticationScheduler {

    private final UnifiedAuthenticationManager authManager;
    private final LoginActivityLogRepository loginActivityLogRepository;

    /**
     * 每30分钟清理一次过期会话
     */
    @Scheduled(cron = "0 */30 * * * *")
    public void cleanupExpiredSessions() {
        try {
            log.info("Starting expired sessions cleanup...");
            authManager.cleanupExpiredSessions();
            log.info("Expired sessions cleanup completed");
        } catch (Exception e) {
            log.error("Failed to cleanup expired sessions", e);
        }
    }

    /**
     * 每天凌晨2点清理90天前的登录日志
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void cleanupOldLoginActivityLogs() {
        try {
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(90);
            log.info("Starting old login activity logs cleanup (before {})...", cutoffDate);

            loginActivityLogRepository.deleteByCreatedAtBefore(cutoffDate);

            log.info("Old login activity logs cleanup completed");
        } catch (Exception e) {
            log.error("Failed to cleanup old login activity logs", e);
        }
    }

    /**
     * 每小时统计认证信息
     */
    @Scheduled(cron = "0 0 * * * *")
    public void logAuthenticationStats() {
        try {
            UnifiedAuthenticationManager.AuthenticationStats stats = authManager.getStats();
            log.info("Authentication Stats - Active Sessions: {}, Blacklisted Tokens: {}",
                stats.activeSessionCount, stats.blacklistedTokenCount);
        } catch (Exception e) {
            log.error("Failed to log authentication stats", e);
        }
    }
}
