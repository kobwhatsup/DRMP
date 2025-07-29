package com.drmp.repository;

import com.drmp.entity.OrganizationAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Organization Audit Log Repository
 * 机构审核日志数据访问层
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Repository
public interface OrganizationAuditLogRepository extends JpaRepository<OrganizationAuditLog, Long> {

    /**
     * 根据机构ID查询审核日志
     */
    Page<OrganizationAuditLog> findByOrganizationIdOrderByOperationTimeDesc(Long organizationId, Pageable pageable);

    /**
     * 查询指定机构的审核日志
     */
    List<OrganizationAuditLog> findByOrganizationIdOrderByOperationTimeDesc(Long organizationId);

    /**
     * 根据操作类型查询日志
     */
    Page<OrganizationAuditLog> findByOperationTypeOrderByOperationTimeDesc(String operationType, Pageable pageable);

    /**
     * 根据操作人查询日志
     */
    Page<OrganizationAuditLog> findByOperatorIdOrderByOperationTimeDesc(Long operatorId, Pageable pageable);

    /**
     * 查询指定时间范围内的审核日志
     */
    @Query("SELECT log FROM OrganizationAuditLog log WHERE log.operationTime BETWEEN :startTime AND :endTime ORDER BY log.operationTime DESC")
    Page<OrganizationAuditLog> findByOperationTimeBetween(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            Pageable pageable
    );

    /**
     * 统计今日新增的审核日志数量
     */
    @Query("SELECT COUNT(log) FROM OrganizationAuditLog log WHERE log.operationType = :operationType AND DATE(log.operationTime) = CURRENT_DATE")
    long countTodayLogsByOperationType(@Param("operationType") String operationType);

    /**
     * 统计本周的审核日志数量
     */
    @Query("SELECT COUNT(log) FROM OrganizationAuditLog log WHERE log.operationType = :operationType AND log.operationTime >= :weekStart")
    long countWeekLogsByOperationType(@Param("operationType") String operationType, @Param("weekStart") LocalDateTime weekStart);

    /**
     * 获取最近的审核记录（用于统计审核时长）
     */
    @Query("SELECT log FROM OrganizationAuditLog log WHERE log.organizationId = :organizationId AND log.operationType IN ('APPROVE', 'REJECT') ORDER BY log.operationTime DESC")
    List<OrganizationAuditLog> findRecentApprovalLogs(@Param("organizationId") Long organizationId, Pageable pageable);

    /**
     * 获取审核统计数据
     */
    @Query("SELECT log.operationType, COUNT(log) FROM OrganizationAuditLog log WHERE log.operationType IN ('APPROVE', 'REJECT') GROUP BY log.operationType")
    List<Object[]> getApprovalStatistics();
}