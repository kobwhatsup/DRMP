package com.drmp.repository;

import com.drmp.entity.CaseTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 案件标签数据访问层
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@Repository
public interface CaseTagRepository extends JpaRepository<CaseTag, Long> {

    /**
     * 根据案件ID查询标签
     */
    List<CaseTag> findByCaseDetail_IdOrderByCreatedAtDesc(Long caseId);

    /**
     * 根据标签分类查询
     */
    List<CaseTag> findByTagCategoryOrderByUsageCountDesc(CaseTag.TagCategory tagCategory);

    /**
     * 根据机构ID查询标签
     */
    List<CaseTag> findByOrganizationIdOrderByUsageCountDesc(Long organizationId);

    /**
     * 根据创建人查询标签
     */
    List<CaseTag> findByCreatedByOrderByCreatedAtDesc(Long createdBy);

    /**
     * 查询系统标签
     */
    List<CaseTag> findByIsSystemTagTrueOrderByTagCategoryAscTagNameAsc();

    /**
     * 查询自定义标签
     */
    List<CaseTag> findByIsSystemTagFalseAndOrganizationIdOrderByUsageCountDesc(Long organizationId);

    /**
     * 根据标签名称和分类查询
     */
    Optional<CaseTag> findByTagNameAndTagCategoryAndOrganizationId(
            String tagName, CaseTag.TagCategory tagCategory, Long organizationId);

    /**
     * 查询热门标签
     */
    @Query("SELECT ct FROM CaseTag ct WHERE ct.organizationId = :organizationId " +
           "ORDER BY ct.usageCount DESC, ct.lastUsedAt DESC")
    List<CaseTag> findPopularTags(@Param("organizationId") Long organizationId);

    /**
     * 根据标签名称模糊查询
     */
    @Query("SELECT ct FROM CaseTag ct WHERE ct.tagName LIKE %:keyword% " +
           "AND (ct.organizationId = :organizationId OR ct.isSystemTag = true) " +
           "ORDER BY ct.usageCount DESC")
    List<CaseTag> searchByTagName(@Param("keyword") String keyword, 
                                 @Param("organizationId") Long organizationId);

    /**
     * 统计各分类下的标签数量
     */
    @Query("SELECT ct.tagCategory, COUNT(ct) FROM CaseTag ct " +
           "WHERE ct.organizationId = :organizationId OR ct.isSystemTag = true " +
           "GROUP BY ct.tagCategory")
    List<Object[]> countByTagCategory(@Param("organizationId") Long organizationId);
}