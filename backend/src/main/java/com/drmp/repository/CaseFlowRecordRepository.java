package com.drmp.repository;

import com.drmp.entity.CaseFlowRecord;
import com.drmp.entity.enums.CaseFlowEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 案件流转记录Repository
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Repository
public interface CaseFlowRecordRepository extends JpaRepository<CaseFlowRecord, Long> {
    
    /**
     * 根据案件包ID查询流转记录
     */
    Page<CaseFlowRecord> findByCasePackageIdOrderByEventTimeDesc(Long casePackageId, Pageable pageable);
    
    /**
     * 根据个案ID查询流转记录
     */
    Page<CaseFlowRecord> findByCaseIdOrderByEventTimeDesc(Long caseId, Pageable pageable);
    
    /**
     * 根据事件类型查询流转记录
     */
    Page<CaseFlowRecord> findByEventTypeInAndEventTimeBetweenOrderByEventTimeDesc(
            List<CaseFlowEvent> eventTypes, LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);
    
    /**
     * 根据操作人机构ID查询流转记录
     */
    Page<CaseFlowRecord> findByOperatorOrgIdAndEventTimeBetweenOrderByEventTimeDesc(
            Long operatorOrgId, LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);
    
    /**
     * 根据操作人机构ID和事件类型查询流转记录
     */
    Page<CaseFlowRecord> findByOperatorOrgIdAndEventTypeInAndEventTimeBetweenOrderByEventTimeDesc(
            Long operatorOrgId, List<CaseFlowEvent> eventTypes, 
            LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);
    
    /**
     * 查询指定时间范围内的流转记录数量
     */
    @Query("SELECT COUNT(cfr) FROM CaseFlowRecord cfr WHERE cfr.eventTime BETWEEN :startTime AND :endTime")
    Long countByEventTimeBetween(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
    
    /**
     * 查询指定机构在指定时间范围内的流转记录数量
     */
    @Query("SELECT COUNT(cfr) FROM CaseFlowRecord cfr WHERE cfr.operatorOrgId = :orgId " +
           "AND cfr.eventTime BETWEEN :startTime AND :endTime")
    Long countByOrganizationAndEventTimeBetween(@Param("orgId") Long orgId,
                                              @Param("startTime") LocalDateTime startTime, 
                                              @Param("endTime") LocalDateTime endTime);
    
    /**
     * 按事件类型统计记录数量
     */
    @Query("SELECT cfr.eventType, COUNT(cfr) FROM CaseFlowRecord cfr " +
           "WHERE cfr.eventTime BETWEEN :startTime AND :endTime " +
           "GROUP BY cfr.eventType")
    List<Object[]> countByEventTypeGroupedByEventTimeBetween(@Param("startTime") LocalDateTime startTime,
                                                           @Param("endTime") LocalDateTime endTime);
    
    /**
     * 按机构统计指定时间范围内的事件类型分布
     */
    @Query("SELECT cfr.eventType, COUNT(cfr) FROM CaseFlowRecord cfr " +
           "WHERE cfr.operatorOrgId = :orgId AND cfr.eventTime BETWEEN :startTime AND :endTime " +
           "GROUP BY cfr.eventType")
    List<Object[]> countByEventTypeForOrganization(@Param("orgId") Long orgId,
                                                 @Param("startTime") LocalDateTime startTime,
                                                 @Param("endTime") LocalDateTime endTime);
    
    /**
     * 按日期统计流转记录数量
     */
    @Query("SELECT CAST(cfr.eventTime AS date), COUNT(cfr) FROM CaseFlowRecord cfr " +
           "WHERE cfr.eventTime BETWEEN :startTime AND :endTime " +
           "GROUP BY CAST(cfr.eventTime AS date) ORDER BY CAST(cfr.eventTime AS date)")
    List<Object[]> countByDateGroupedByEventTimeBetween(@Param("startTime") LocalDateTime startTime,
                                                      @Param("endTime") LocalDateTime endTime);
    
    /**
     * 按操作人统计流转记录数量
     */
    @Query("SELECT cfr.operatorName, COUNT(cfr) FROM CaseFlowRecord cfr " +
           "WHERE cfr.operatorOrgId = :orgId AND cfr.eventTime BETWEEN :startTime AND :endTime " +
           "AND cfr.operatorName IS NOT NULL " +
           "GROUP BY cfr.operatorName ORDER BY COUNT(cfr) DESC")
    List<Object[]> countByOperatorForOrganization(@Param("orgId") Long orgId,
                                                @Param("startTime") LocalDateTime startTime,
                                                @Param("endTime") LocalDateTime endTime);
    
    /**
     * 查询案件包的最新状态变更记录
     */
    @Query("SELECT cfr FROM CaseFlowRecord cfr WHERE cfr.casePackageId = :casePackageId " +
           "AND cfr.beforeStatus IS NOT NULL AND cfr.afterStatus IS NOT NULL " +
           "ORDER BY cfr.eventTime DESC")
    List<CaseFlowRecord> findLatestStatusChangesByCasePackageId(@Param("casePackageId") Long casePackageId);
    
    /**
     * 查询指定案件包的时间线数据
     */
    @Query("SELECT cfr FROM CaseFlowRecord cfr WHERE cfr.casePackageId = :casePackageId " +
           "ORDER BY cfr.eventTime ASC")
    List<CaseFlowRecord> findTimelineByCasePackageId(@Param("casePackageId") Long casePackageId);
    
    /**
     * 查询系统事件
     */
    Page<CaseFlowRecord> findByIsSystemEventTrueAndEventTimeBetweenOrderByEventTimeDesc(
            LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);
    
    /**
     * 查询指定严重程度的事件
     */
    Page<CaseFlowRecord> findBySeverityAndEventTimeBetweenOrderByEventTimeDesc(
            String severity, LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);
    
    /**
     * 查询包含指定标签的事件
     */
    @Query("SELECT cfr FROM CaseFlowRecord cfr WHERE cfr.tags LIKE %:tag% " +
           "AND cfr.eventTime BETWEEN :startTime AND :endTime " +
           "ORDER BY cfr.eventTime DESC")
    Page<CaseFlowRecord> findByTagsContainingAndEventTimeBetween(@Param("tag") String tag,
                                                               @Param("startTime") LocalDateTime startTime,
                                                               @Param("endTime") LocalDateTime endTime,
                                                               Pageable pageable);
    
    /**
     * 查询指定案件包的财务相关事件
     */
    @Query("SELECT cfr FROM CaseFlowRecord cfr WHERE cfr.casePackageId = :casePackageId " +
           "AND cfr.amount IS NOT NULL AND cfr.amount > 0 " +
           "ORDER BY cfr.eventTime DESC")
    List<CaseFlowRecord> findFinancialEventsByCasePackageId(@Param("casePackageId") Long casePackageId);
    
    /**
     * 计算指定时间范围内的平均处理天数
     */
    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (complete.event_time - create.event_time)) / 86400) " +
           "FROM case_flow_records complete, case_flow_records create " +
           "WHERE complete.case_package_id = create.case_package_id " +
           "AND create.event_type = 'PACKAGE_CREATED' " +
           "AND complete.event_type = 'PACKAGE_COMPLETED' " +
           "AND complete.event_time BETWEEN :startTime AND :endTime",
           nativeQuery = true)
    Double calculateAverageProcessingDays(@Param("startTime") LocalDateTime startTime,
                                        @Param("endTime") LocalDateTime endTime);
    
    /**
     * 查询最近的流转记录（用于监控）
     */
    @Query("SELECT cfr FROM CaseFlowRecord cfr WHERE cfr.eventTime >= :sinceTime " +
           "ORDER BY cfr.eventTime DESC")
    List<CaseFlowRecord> findRecentRecords(@Param("sinceTime") LocalDateTime sinceTime, Pageable pageable);
}