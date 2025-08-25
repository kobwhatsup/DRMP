package com.drmp.repository.system;

import com.drmp.entity.system.SysOperationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 系统操作日志Repository
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Repository
public interface SysOperationLogRepository extends JpaRepository<SysOperationLog, Long> {

    /**
     * 根据用户ID查询操作日志
     */
    Page<SysOperationLog> findByUserIdOrderByOperatedAtDesc(Long userId, Pageable pageable);

    /**
     * 根据操作类型查询日志
     */
    Page<SysOperationLog> findByOperationTypeOrderByOperatedAtDesc(SysOperationLog.OperationType operationType, Pageable pageable);

    /**
     * 根据模块名称查询日志
     */
    Page<SysOperationLog> findByModuleNameOrderByOperatedAtDesc(String moduleName, Pageable pageable);

    /**
     * 根据操作IP查询日志
     */
    Page<SysOperationLog> findByOperationIpOrderByOperatedAtDesc(String operationIp, Pageable pageable);

    /**
     * 根据操作状态查询日志
     */
    Page<SysOperationLog> findByOperationStatusOrderByOperatedAtDesc(SysOperationLog.OperationStatus operationStatus, Pageable pageable);

    /**
     * 根据时间范围查询日志
     */
    Page<SysOperationLog> findByOperatedAtBetweenOrderByOperatedAtDesc(LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);

    /**
     * 根据用户名查询日志
     */
    Page<SysOperationLog> findByUsernameContainingIgnoreCaseOrderByOperatedAtDesc(String username, Pageable pageable);

    /**
     * 复合查询日志
     */
    @Query("SELECT log FROM SysOperationLog log WHERE " +
           "(:userId IS NULL OR log.userId = :userId) AND " +
           "(:username IS NULL OR log.username LIKE %:username%) AND " +
           "(:operationType IS NULL OR log.operationType = :operationType) AND " +
           "(:moduleName IS NULL OR log.moduleName LIKE %:moduleName%) AND " +
           "(:operationStatus IS NULL OR log.operationStatus = :operationStatus) AND " +
           "(:startTime IS NULL OR log.operatedAt >= :startTime) AND " +
           "(:endTime IS NULL OR log.operatedAt <= :endTime) " +
           "ORDER BY log.operatedAt DESC")
    Page<SysOperationLog> findByConditions(
            @Param("userId") Long userId,
            @Param("username") String username,
            @Param("operationType") SysOperationLog.OperationType operationType,
            @Param("moduleName") String moduleName,
            @Param("operationStatus") SysOperationLog.OperationStatus operationStatus,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            Pageable pageable
    );

    /**
     * 统计指定时间范围内的操作次数
     */
    @Query("SELECT COUNT(log) FROM SysOperationLog log WHERE " +
           "log.operatedAt BETWEEN :startTime AND :endTime")
    Long countByTimeRange(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 统计指定用户的操作次数
     */
    Long countByUserId(Long userId);

    /**
     * 统计指定模块的操作次数
     */
    Long countByModuleName(String moduleName);

    /**
     * 统计操作类型分布
     */
    @Query("SELECT log.operationType, COUNT(log) FROM SysOperationLog log " +
           "WHERE log.operatedAt BETWEEN :startTime AND :endTime " +
           "GROUP BY log.operationType")
    List<Object[]> countByOperationTypeAndTimeRange(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 统计模块操作分布
     */
    @Query("SELECT log.moduleName, COUNT(log) FROM SysOperationLog log " +
           "WHERE log.operatedAt BETWEEN :startTime AND :endTime " +
           "GROUP BY log.moduleName " +
           "ORDER BY COUNT(log) DESC")
    List<Object[]> countByModuleAndTimeRange(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 获取活跃用户统计
     */
    @Query("SELECT log.userId, log.username, COUNT(log) as operationCount FROM SysOperationLog log " +
           "WHERE log.operatedAt BETWEEN :startTime AND :endTime " +
           "GROUP BY log.userId, log.username " +
           "ORDER BY COUNT(log) DESC")
    List<Object[]> getActiveUserStats(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 清理过期日志
     */
    @Modifying
    @Query("DELETE FROM SysOperationLog log WHERE log.operatedAt < :expireTime")
    int deleteExpiredLogs(@Param("expireTime") LocalDateTime expireTime);

    /**
     * 获取系统操作趋势数据 (按小时统计)
     */
    @Query("SELECT log.operatedAt, COUNT(log) as operationCount " +
           "FROM SysOperationLog log " +
           "WHERE log.operatedAt BETWEEN :startTime AND :endTime " +
           "GROUP BY log.operatedAt " +
           "ORDER BY log.operatedAt")
    List<Object[]> getOperationTrend(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 获取最近的操作日志
     */
    List<SysOperationLog> findTop10ByOrderByOperatedAtDesc();

    /**
     * 根据业务类型查询日志
     */
    Page<SysOperationLog> findByBusinessTypeOrderByOperatedAtDesc(String businessType, Pageable pageable);
}