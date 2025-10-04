package com.drmp.repository;

import com.drmp.entity.LoginActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 登录活动日志Repository
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@Repository
public interface LoginActivityLogRepository extends JpaRepository<LoginActivityLog, Long> {

    /**
     * 根据用户ID分页查询登录活动
     */
    Page<LoginActivityLog> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * 根据用户ID和活动类型查询
     */
    List<LoginActivityLog> findByUserIdAndActivityTypeOrderByCreatedAtDesc(
        Long userId,
        LoginActivityLog.ActivityType activityType
    );

    /**
     * 统计指定时间范围内的失败登录次数
     */
    @Query("SELECT COUNT(l) FROM LoginActivityLog l WHERE l.userId = :userId " +
           "AND l.activityType = 'LOGIN_FAILED' AND l.createdAt >= :since")
    long countFailedLoginAttempts(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    /**
     * 查询指定IP的最近登录活动
     */
    List<LoginActivityLog> findTop10ByClientIpOrderByCreatedAtDesc(String clientIp);

    /**
     * 删除指定时间之前的日志（定期清理）
     */
    void deleteByCreatedAtBefore(LocalDateTime before);

    /**
     * 统计用户的登录次数
     */
    @Query("SELECT COUNT(l) FROM LoginActivityLog l WHERE l.userId = :userId " +
           "AND l.activityType = 'LOGIN_SUCCESS' AND l.createdAt >= :since")
    long countSuccessfulLogins(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    /**
     * 查询异常登录（不同IP频繁登录）
     */
    @Query("SELECT l FROM LoginActivityLog l WHERE l.userId = :userId " +
           "AND l.activityType = 'LOGIN_SUCCESS' " +
           "AND l.createdAt >= :since " +
           "GROUP BY l.clientIp HAVING COUNT(l.clientIp) > :threshold")
    List<LoginActivityLog> findSuspiciousLogins(
        @Param("userId") Long userId,
        @Param("since") LocalDateTime since,
        @Param("threshold") long threshold
    );
}
