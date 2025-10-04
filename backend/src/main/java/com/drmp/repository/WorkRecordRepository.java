package com.drmp.repository;

import com.drmp.entity.WorkRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 作业记录数据访问层
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@Repository
public interface WorkRecordRepository extends JpaRepository<WorkRecord, Long>, JpaSpecificationExecutor<WorkRecord> {

    /**
     * 根据案件ID查询作业记录
     */
    List<WorkRecord> findByCaseDetail_IdAndIsDeletedFalseOrderByCreatedAtDesc(Long caseId);

    /**
     * 根据处理人ID查询作业记录
     */
    Page<WorkRecord> findByHandlerIdAndIsDeletedFalse(Long handlerId, Pageable pageable);

    /**
     * 查询需要跟进的记录
     */
    @Query("SELECT wr FROM WorkRecord wr WHERE wr.followUpRequired = true " +
           "AND wr.nextContactDate <= :now AND wr.isDeleted = false " +
           "AND wr.handlerId = :handlerId ORDER BY wr.nextContactDate ASC")
    List<WorkRecord> findFollowUpRecords(@Param("handlerId") Long handlerId, 
                                        @Param("now") LocalDateTime now);

    /**
     * 根据记录类型统计数量
     */
    @Query("SELECT wr.recordType, COUNT(wr) FROM WorkRecord wr " +
           "WHERE wr.caseDetail.id = :caseId AND wr.isDeleted = false " +
           "GROUP BY wr.recordType")
    List<Object[]> countByRecordTypeAndCaseId(@Param("caseId") Long caseId);

    /**
     * 根据处理人统计数量
     */
    @Query("SELECT COUNT(wr) FROM WorkRecord wr " +
           "WHERE wr.handlerId = :handlerId AND wr.isDeleted = false " +
           "AND wr.createdAt BETWEEN :startDate AND :endDate")
    Long countByHandlerIdAndDateRange(@Param("handlerId") Long handlerId,
                                     @Param("startDate") LocalDateTime startDate,
                                     @Param("endDate") LocalDateTime endDate);

    /**
     * 查询重要记录
     */
    List<WorkRecord> findByIsImportantTrueAndIsDeletedFalseOrderByCreatedAtDesc();

    /**
     * 根据模板ID查询记录
     */
    List<WorkRecord> findByTemplateIdAndIsDeletedFalse(Long templateId);

    /**
     * 查询指定时间范围内的记录
     */
    @Query("SELECT wr FROM WorkRecord wr WHERE wr.isDeleted = false " +
           "AND wr.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY wr.createdAt DESC")
    List<WorkRecord> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                   @Param("endDate") LocalDateTime endDate);
}