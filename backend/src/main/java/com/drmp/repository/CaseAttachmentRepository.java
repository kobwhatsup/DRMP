package com.drmp.repository;

import com.drmp.entity.CaseAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 案件附件仓库接口
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Repository
public interface CaseAttachmentRepository extends JpaRepository<CaseAttachment, Long> {

    /**
     * 根据业务类型和业务ID查询附件列表
     */
    List<CaseAttachment> findByBusinessTypeAndBusinessIdOrderByUploadedAtDesc(
        String businessType, Long businessId);

    /**
     * 根据业务类型、业务ID和分类查询附件列表
     */
    List<CaseAttachment> findByBusinessTypeAndBusinessIdAndCategoryOrderByUploadedAtDesc(
        String businessType, Long businessId, String category);

    /**
     * 根据上传用户查询附件列表
     */
    List<CaseAttachment> findByUploadedByOrderByUploadedAtDesc(Long uploadedBy);

    /**
     * 根据文件MD5查询附件（用于去重）
     */
    Optional<CaseAttachment> findByFileMd5(String fileMd5);

    /**
     * 查询所有已加密的文件
     */
    List<CaseAttachment> findByIsEncryptedTrue();

    /**
     * 根据病毒扫描状态查询文件
     */
    List<CaseAttachment> findByVirusScanStatus(CaseAttachment.VirusScanStatus status);

    /**
     * 查询指定时间范围内上传的文件
     */
    List<CaseAttachment> findByUploadedAtBetween(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 查询大于指定大小的文件
     */
    List<CaseAttachment> findByFileSizeGreaterThan(Long fileSize);

    /**
     * 统计指定业务类型的文件数量
     */
    long countByBusinessType(String businessType);

    /**
     * 统计指定用户上传的文件数量
     */
    long countByUploadedBy(Long uploadedBy);

    /**
     * 查询指定用户在指定时间范围内上传的文件总大小
     */
    @Query("SELECT COALESCE(SUM(ca.fileSize), 0) FROM CaseAttachment ca " +
           "WHERE ca.uploadedBy = :userId " +
           "AND ca.uploadedAt BETWEEN :startTime AND :endTime")
    Long sumFileSizeByUserAndTimeRange(@Param("userId") Long userId, 
                                      @Param("startTime") LocalDateTime startTime, 
                                      @Param("endTime") LocalDateTime endTime);

    /**
     * 查询指定业务类型的文件总大小
     */
    @Query("SELECT COALESCE(SUM(ca.fileSize), 0) FROM CaseAttachment ca " +
           "WHERE ca.businessType = :businessType")
    Long sumFileSizeByBusinessType(@Param("businessType") String businessType);

    /**
     * 查询超过指定时间未访问的文件
     */
    @Query("SELECT ca FROM CaseAttachment ca " +
           "WHERE ca.lastAccessedAt IS NULL OR ca.lastAccessedAt < :cutoffTime")
    List<CaseAttachment> findUnusedFilesBefore(@Param("cutoffTime") LocalDateTime cutoffTime);

    /**
     * 批量更新下载次数
     */
    @Query("UPDATE CaseAttachment ca SET ca.downloadCount = ca.downloadCount + 1, " +
           "ca.lastAccessedAt = :accessTime WHERE ca.id = :id")
    void incrementDownloadCount(@Param("id") Long id, @Param("accessTime") LocalDateTime accessTime);

    /**
     * 查询重复文件（基于MD5）
     */
    @Query("SELECT ca.fileMd5, COUNT(ca) FROM CaseAttachment ca " +
           "WHERE ca.fileMd5 IS NOT NULL " +
           "GROUP BY ca.fileMd5 HAVING COUNT(ca) > 1")
    List<Object[]> findDuplicateFilesByMd5();

    /**
     * 根据文件扩展名查询文件
     */
    @Query("SELECT ca FROM CaseAttachment ca " +
           "WHERE LOWER(ca.originalFileName) LIKE CONCAT('%', LOWER(:extension))")
    List<CaseAttachment> findByFileExtension(@Param("extension") String extension);

    /**
     * 查询存储路径下的所有文件
     */
    List<CaseAttachment> findByFilePathStartingWith(String pathPrefix);

    /**
     * 删除指定时间之前的临时文件
     */
    @Query("DELETE FROM CaseAttachment ca " +
           "WHERE ca.uploadStatus = 'UPLOADING' " +
           "AND ca.uploadedAt < :cutoffTime")
    int deleteExpiredTempFiles(@Param("cutoffTime") LocalDateTime cutoffTime);

    /**
     * 查询需要病毒扫描的文件
     */
    @Query("SELECT ca FROM CaseAttachment ca " +
           "WHERE ca.virusScanStatus IN ('PENDING', 'ERROR') " +
           "AND ca.uploadedAt > :sinceTime " +
           "ORDER BY ca.uploadedAt ASC")
    List<CaseAttachment> findFilesForVirusScan(@Param("sinceTime") LocalDateTime sinceTime);

    /**
     * 统计文件存储使用情况
     */
    @Query("SELECT " +
           "ca.businessType as businessType, " +
           "COUNT(ca) as fileCount, " +
           "COALESCE(SUM(ca.fileSize), 0) as totalSize " +
           "FROM CaseAttachment ca " +
           "GROUP BY ca.businessType")
    List<Object[]> getStorageStatsByBusinessType();

    /**
     * 查询最近上传的文件
     */
    List<CaseAttachment> findTop10ByOrderByUploadedAtDesc();

    /**
     * 查询下载次数最多的文件
     */
    List<CaseAttachment> findTop10ByOrderByDownloadCountDesc();
}