package com.drmp.repository;

import com.drmp.entity.BatchOperation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 批量操作数据访问层
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@Repository
public interface BatchOperationRepository extends JpaRepository<BatchOperation, Long> {

    /**
     * 根据创建人查询批量操作
     */
    Page<BatchOperation> findByCreatedByOrderByCreatedAtDesc(Long createdBy, Pageable pageable);

    /**
     * 根据机构ID查询批量操作
     */
    Page<BatchOperation> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId, Pageable pageable);

    /**
     * 根据操作类型查询
     */
    List<BatchOperation> findByOperationTypeOrderByCreatedAtDesc(BatchOperation.OperationType operationType);

    /**
     * 根据状态查询
     */
    List<BatchOperation> findByStatusOrderByCreatedAtDesc(BatchOperation.BatchStatus status);

    /**
     * 查询进行中的操作
     */
    List<BatchOperation> findByStatusInOrderByCreatedAtDesc(List<BatchOperation.BatchStatus> statuses);

    /**
     * 查询指定时间范围内的操作
     */
    @Query("SELECT bo FROM BatchOperation bo WHERE bo.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY bo.createdAt DESC")
    List<BatchOperation> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate);

    /**
     * 统计各种操作类型的数量
     */
    @Query("SELECT bo.operationType, COUNT(bo) FROM BatchOperation bo " +
           "WHERE bo.organizationId = :organizationId " +
           "AND bo.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY bo.operationType")
    List<Object[]> countByOperationTypeAndDateRange(@Param("organizationId") Long organizationId,
                                                   @Param("startDate") LocalDateTime startDate,
                                                   @Param("endDate") LocalDateTime endDate);

    /**
     * 统计各种状态的数量
     */
    @Query("SELECT bo.status, COUNT(bo) FROM BatchOperation bo " +
           "WHERE bo.organizationId = :organizationId " +
           "GROUP BY bo.status")
    List<Object[]> countByStatusAndOrganization(@Param("organizationId") Long organizationId);

    /**
     * 查询需要清理的过期操作
     */
    @Query("SELECT bo FROM BatchOperation bo WHERE bo.status IN :completedStatuses " +
           "AND bo.completedAt < :cutoffDate")
    List<BatchOperation> findExpiredOperations(@Param("completedStatuses") List<BatchOperation.BatchStatus> completedStatuses,
                                             @Param("cutoffDate") LocalDateTime cutoffDate);

    /**
     * 查询用户最近的操作
     */
    @Query("SELECT bo FROM BatchOperation bo WHERE bo.createdBy = :userId " +
           "ORDER BY bo.createdAt DESC")
    List<BatchOperation> findRecentOperationsByUser(@Param("userId") Long userId, Pageable pageable);
}