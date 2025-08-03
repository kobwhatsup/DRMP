package com.drmp.repository;

import com.drmp.entity.CaseImportRecord;
import com.drmp.entity.enums.ImportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 案件导入记录Repository
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Repository
public interface CaseImportRecordRepository extends JpaRepository<CaseImportRecord, Long> {

    /**
     * 根据导入批次ID查找记录
     */
    Optional<CaseImportRecord> findByImportBatchId(String importBatchId);

    /**
     * 根据导入状态查找记录
     */
    Page<CaseImportRecord> findByImportStatusOrderByStartedAtDesc(ImportStatus importStatus, Pageable pageable);

    /**
     * 根据导入人查找记录
     */
    Page<CaseImportRecord> findByImportedByOrderByStartedAtDesc(Long importedBy, Pageable pageable);

    /**
     * 根据案件包查找记录
     */
    List<CaseImportRecord> findByCasePackageIdOrderByStartedAtDesc(Long casePackageId);

    /**
     * 根据时间范围查询记录
     */
    Page<CaseImportRecord> findByStartedAtBetweenOrderByStartedAtDesc(
            LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);

    /**
     * 复合查询
     */
    @Query("SELECT r FROM CaseImportRecord r WHERE " +
           "(:importBatchId IS NULL OR r.importBatchId LIKE %:importBatchId%) AND " +
           "(:fileName IS NULL OR r.fileName LIKE %:fileName%) AND " +
           "(:importStatus IS NULL OR r.importStatus = :importStatus) AND " +
           "(:importedBy IS NULL OR r.importedBy = :importedBy) AND " +
           "(:startTime IS NULL OR r.startedAt >= :startTime) AND " +
           "(:endTime IS NULL OR r.startedAt <= :endTime) " +
           "ORDER BY r.startedAt DESC")
    Page<CaseImportRecord> findByConditions(
            @Param("importBatchId") String importBatchId,
            @Param("fileName") String fileName,
            @Param("importStatus") ImportStatus importStatus,
            @Param("importedBy") Long importedBy,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            Pageable pageable
    );

    /**
     * 统计导入记录数量
     */
    Long countByImportStatus(ImportStatus importStatus);

    /**
     * 统计指定用户的导入记录数量
     */
    Long countByImportedBy(Long importedBy);

    /**
     * 统计指定时间范围内的导入记录数量
     */
    Long countByStartedAtBetween(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 获取最近的导入记录
     */
    List<CaseImportRecord> findTop10ByOrderByStartedAtDesc();

    /**
     * 获取正在进行的导入任务
     */
    @Query("SELECT r FROM CaseImportRecord r WHERE r.importStatus IN ('UPLOADING', 'VALIDATING', 'IMPORTING') ORDER BY r.startedAt ASC")
    List<CaseImportRecord> findActiveImportTasks();

    /**
     * 获取导入统计数据
     */
    @Query("SELECT r.importStatus, COUNT(r), SUM(r.totalRows), SUM(r.successRows), SUM(r.failedRows) " +
           "FROM CaseImportRecord r " +
           "WHERE r.startedAt BETWEEN :startTime AND :endTime " +
           "GROUP BY r.importStatus")
    List<Object[]> getImportStatistics(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 获取用户导入统计
     */
    @Query("SELECT r.importedBy, COUNT(r), SUM(r.totalRows), SUM(r.successRows) " +
           "FROM CaseImportRecord r " +
           "WHERE r.startedAt BETWEEN :startTime AND :endTime " +
           "GROUP BY r.importedBy " +
           "ORDER BY COUNT(r) DESC")
    List<Object[]> getUserImportStatistics(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 获取每日导入趋势
     */
    @Query("SELECT DATE(r.startedAt) as importDate, COUNT(r) as importCount, SUM(r.totalRows) as totalRows " +
           "FROM CaseImportRecord r " +
           "WHERE r.startedAt BETWEEN :startTime AND :endTime " +
           "GROUP BY DATE(r.startedAt) " +
           "ORDER BY DATE(r.startedAt)")
    List<Object[]> getDailyImportTrend(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 检查是否存在同名文件的导入记录
     */
    boolean existsByFileNameAndImportedBy(String fileName, Long importedBy);
}