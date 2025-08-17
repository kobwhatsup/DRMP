package com.drmp.repository;

import com.drmp.entity.DocumentTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 文书模板数据访问层
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@Repository
public interface DocumentTemplateRepository extends JpaRepository<DocumentTemplate, Long> {

    /**
     * 根据模板类型查询
     */
    List<DocumentTemplate> findByTemplateTypeAndIsActiveTrueOrderByUsageCountDesc(DocumentTemplate.TemplateType templateType);

    /**
     * 根据分类查询
     */
    List<DocumentTemplate> findByCategoryAndIsActiveTrueOrderByUsageCountDesc(DocumentTemplate.DocumentCategory category);

    /**
     * 根据机构ID查询
     */
    List<DocumentTemplate> findByOrganizationIdAndIsActiveTrueOrderByUsageCountDesc(Long organizationId);

    /**
     * 查询系统模板
     */
    List<DocumentTemplate> findByIsSystemTemplateTrueAndIsActiveTrueOrderByTemplateTypeAscTemplateNameAsc();

    /**
     * 查询已审批的模板
     */
    List<DocumentTemplate> findByApprovalStatusAndIsActiveTrueOrderByUsageCountDesc(String approvalStatus);

    /**
     * 根据创建人查询
     */
    List<DocumentTemplate> findByCreatedByOrderByCreatedAtDesc(Long createdBy);

    /**
     * 根据模板名称和机构查询
     */
    Optional<DocumentTemplate> findByTemplateNameAndOrganizationId(String templateName, Long organizationId);

    /**
     * 模糊搜索模板
     */
    @Query("SELECT dt FROM DocumentTemplate dt WHERE dt.isActive = true " +
           "AND (dt.templateName LIKE %:keyword% OR dt.description LIKE %:keyword% OR dt.tags LIKE %:keyword%) " +
           "AND (dt.organizationId = :organizationId OR dt.isSystemTemplate = true) " +
           "ORDER BY dt.usageCount DESC")
    List<DocumentTemplate> searchTemplates(@Param("keyword") String keyword, 
                                         @Param("organizationId") Long organizationId);

    /**
     * 查询热门模板
     */
    @Query("SELECT dt FROM DocumentTemplate dt WHERE dt.isActive = true " +
           "AND (dt.organizationId = :organizationId OR dt.isSystemTemplate = true) " +
           "ORDER BY dt.usageCount DESC, dt.lastUsedAt DESC")
    List<DocumentTemplate> findPopularTemplates(@Param("organizationId") Long organizationId, Pageable pageable);

    /**
     * 统计各类型模板数量
     */
    @Query("SELECT dt.templateType, COUNT(dt) FROM DocumentTemplate dt " +
           "WHERE dt.isActive = true AND (dt.organizationId = :organizationId OR dt.isSystemTemplate = true) " +
           "GROUP BY dt.templateType")
    List<Object[]> countByTemplateType(@Param("organizationId") Long organizationId);

    /**
     * 统计各分类模板数量
     */
    @Query("SELECT dt.category, COUNT(dt) FROM DocumentTemplate dt " +
           "WHERE dt.isActive = true AND (dt.organizationId = :organizationId OR dt.isSystemTemplate = true) " +
           "GROUP BY dt.category")
    List<Object[]> countByCategory(@Param("organizationId") Long organizationId);

    /**
     * 查询需要审批的模板
     */
    @Query("SELECT dt FROM DocumentTemplate dt WHERE dt.approvalStatus = 'PENDING' " +
           "ORDER BY dt.createdAt ASC")
    List<DocumentTemplate> findPendingApprovalTemplates();

    /**
     * 分页查询模板
     */
    @Query("SELECT dt FROM DocumentTemplate dt WHERE " +
           "(:templateType IS NULL OR dt.templateType = :templateType) AND " +
           "(:category IS NULL OR dt.category = :category) AND " +
           "(:organizationId IS NULL OR dt.organizationId = :organizationId OR dt.isSystemTemplate = true) AND " +
           "(:isActive IS NULL OR dt.isActive = :isActive) " +
           "ORDER BY dt.usageCount DESC, dt.createdAt DESC")
    Page<DocumentTemplate> findTemplatesWithFilters(@Param("templateType") DocumentTemplate.TemplateType templateType,
                                                   @Param("category") DocumentTemplate.DocumentCategory category,
                                                   @Param("organizationId") Long organizationId,
                                                   @Param("isActive") Boolean isActive,
                                                   Pageable pageable);
}