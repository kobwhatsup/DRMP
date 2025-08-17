package com.drmp.repository;

import com.drmp.entity.DocumentGeneration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 文档生成记录数据访问层
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@Repository
public interface DocumentGenerationRepository extends JpaRepository<DocumentGeneration, Long> {

    /**
     * 根据案件ID查询文档生成记录
     */
    List<DocumentGeneration> findByCaseDetail_IdOrderByGeneratedAtDesc(Long caseId);

    /**
     * 根据模板ID查询文档生成记录
     */
    List<DocumentGeneration> findByDocumentTemplate_IdOrderByGeneratedAtDesc(Long templateId);

    /**
     * 根据批量操作ID查询
     */
    List<DocumentGeneration> findByBatchOperation_IdOrderByGeneratedAtDesc(Long batchOperationId);

    /**
     * 根据生成人查询
     */
    Page<DocumentGeneration> findByGeneratedByOrderByGeneratedAtDesc(Long generatedBy, Pageable pageable);

    /**
     * 根据状态查询
     */
    List<DocumentGeneration> findByStatusOrderByGeneratedAtDesc(DocumentGeneration.GenerationStatus status);

    /**
     * 查询指定时间范围内的文档
     */
    @Query("SELECT dg FROM DocumentGeneration dg WHERE dg.generatedAt BETWEEN :startDate AND :endDate " +
           "ORDER BY dg.generatedAt DESC")
    List<DocumentGeneration> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                           @Param("endDate") LocalDateTime endDate);

    /**
     * 查询已过期的文档
     */
    @Query("SELECT dg FROM DocumentGeneration dg WHERE dg.expiresAt IS NOT NULL " +
           "AND dg.expiresAt < :now AND dg.status = 'COMPLETED'")
    List<DocumentGeneration> findExpiredDocuments(@Param("now") LocalDateTime now);

    /**
     * 查询需要归档的文档
     */
    @Query("SELECT dg FROM DocumentGeneration dg WHERE dg.status = 'COMPLETED' " +
           "AND dg.isArchived = false AND dg.generatedAt < :cutoffDate")
    List<DocumentGeneration> findDocumentsForArchival(@Param("cutoffDate") LocalDateTime cutoffDate);

    /**
     * 统计各状态文档数量
     */
    @Query("SELECT dg.status, COUNT(dg) FROM DocumentGeneration dg " +
           "WHERE dg.generatedBy = :userId " +
           "GROUP BY dg.status")
    List<Object[]> countByStatusAndUser(@Param("userId") Long userId);

    /**
     * 统计各模板使用次数
     */
    @Query("SELECT dt.templateName, COUNT(dg) FROM DocumentGeneration dg " +
           "JOIN dg.documentTemplate dt " +
           "WHERE dg.generatedAt BETWEEN :startDate AND :endDate " +
           "GROUP BY dt.id, dt.templateName " +
           "ORDER BY COUNT(dg) DESC")
    List<Object[]> countByTemplateAndDateRange(@Param("startDate") LocalDateTime startDate,
                                             @Param("endDate") LocalDateTime endDate);

    /**
     * 查询用户最近生成的文档
     */
    @Query("SELECT dg FROM DocumentGeneration dg WHERE dg.generatedBy = :userId " +
           "ORDER BY dg.generatedAt DESC")
    List<DocumentGeneration> findRecentDocumentsByUser(@Param("userId") Long userId, Pageable pageable);

    /**
     * 根据文件MD5查询（去重检查）
     */
    List<DocumentGeneration> findByFileMd5(String fileMd5);

    /**
     * 查询下载次数最多的文档
     */
    @Query("SELECT dg FROM DocumentGeneration dg WHERE dg.status = 'COMPLETED' " +
           "ORDER BY dg.downloadedCount DESC, dg.generatedAt DESC")
    List<DocumentGeneration> findMostDownloadedDocuments(Pageable pageable);

    /**
     * 分页查询文档生成记录
     */
    @Query("SELECT dg FROM DocumentGeneration dg WHERE " +
           "(:caseId IS NULL OR dg.caseDetail.id = :caseId) AND " +
           "(:templateId IS NULL OR dg.documentTemplate.id = :templateId) AND " +
           "(:status IS NULL OR dg.status = :status) AND " +
           "(:generatedBy IS NULL OR dg.generatedBy = :generatedBy) " +
           "ORDER BY dg.generatedAt DESC")
    Page<DocumentGeneration> findDocumentsWithFilters(@Param("caseId") Long caseId,
                                                     @Param("templateId") Long templateId,
                                                     @Param("status") DocumentGeneration.GenerationStatus status,
                                                     @Param("generatedBy") Long generatedBy,
                                                     Pageable pageable);
}