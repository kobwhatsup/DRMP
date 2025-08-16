package com.drmp.repository;

import com.drmp.entity.Organization;
import com.drmp.entity.enums.OrganizationStatus;
import com.drmp.entity.enums.OrganizationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Organization Repository
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long>, JpaSpecificationExecutor<Organization> {

    Optional<Organization> findByOrgCode(String orgCode);

    boolean existsByOrgCode(String orgCode);

    List<Organization> findByTypeAndStatus(OrganizationType type, OrganizationStatus status);

    Page<Organization> findByTypeAndStatus(OrganizationType type, OrganizationStatus status, Pageable pageable);

    @Query("SELECT o FROM Organization o WHERE o.type = :type AND o.status = :status AND " +
           "(:region IS NULL OR :region MEMBER OF o.serviceRegions)")
    List<Organization> findDisposalOrgsByRegion(@Param("type") OrganizationType type, 
                                                @Param("status") OrganizationStatus status,
                                                @Param("region") String region);

    @Query("SELECT COUNT(o) FROM Organization o WHERE o.type = :type AND o.status = :status")
    long countByTypeAndStatus(@Param("type") OrganizationType type, @Param("status") OrganizationStatus status);

    long countByStatus(OrganizationStatus status);

    long countByType(OrganizationType type);

    Page<Organization> findByTypeAndMembershipStatus(OrganizationType type, String membershipStatus, Pageable pageable);

    /**
     * 查找所有机构并预加载集合字段
     */
    @Query("SELECT DISTINCT o FROM Organization o " +
           "LEFT JOIN FETCH o.serviceRegions " +
           "LEFT JOIN FETCH o.businessScopes " +
           "LEFT JOIN FETCH o.disposalTypes " +
           "LEFT JOIN FETCH o.settlementMethods")
    List<Organization> findAllWithCollections();

    /**
     * 高效的分页查询，支持关键字、类型和状态过滤，在数据库层面进行过滤和分页
     */
    @Query("SELECT DISTINCT o FROM Organization o " +
           "LEFT JOIN FETCH o.serviceRegions " +
           "LEFT JOIN FETCH o.businessScopes " +
           "LEFT JOIN FETCH o.disposalTypes " +
           "LEFT JOIN FETCH o.settlementMethods " +
           "WHERE (:keyword IS NULL OR :keyword = '' OR " +
           "       LOWER(o.orgName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "       LOWER(o.orgCode) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "      (:type IS NULL OR o.type = :type) AND " +
           "      (:status IS NULL OR o.status = :status) " +
           "ORDER BY o.createdAt DESC")
    Page<Organization> findWithFiltersAndCollections(@Param("keyword") String keyword,
                                                    @Param("type") OrganizationType type,
                                                    @Param("status") OrganizationStatus status,
                                                    Pageable pageable);

    /**
     * 批量查询机构及其审批用户信息，避免N+1查询
     */
    @Query("SELECT DISTINCT o, u FROM Organization o " +
           "LEFT JOIN FETCH o.serviceRegions " +
           "LEFT JOIN FETCH o.businessScopes " +
           "LEFT JOIN FETCH o.disposalTypes " +
           "LEFT JOIN FETCH o.settlementMethods " +
           "LEFT JOIN User u ON o.approvalBy = u.id " +
           "WHERE o.id IN :ids")
    List<Object[]> findAllWithCollectionsAndApprovalUser(@Param("ids") List<Long> ids);

    /**
     * 统计不同类型的机构数量，避免加载全部数据到内存
     */
    @Query("SELECT COUNT(o) FROM Organization o WHERE o.type IN :types")
    long countByTypes(@Param("types") List<OrganizationType> types);

    /**
     * 根据ID查找机构，并预加载审批用户信息，避免N+1查询
     */
    @Query("SELECT DISTINCT o FROM Organization o " +
           "LEFT JOIN FETCH o.serviceRegions " +
           "LEFT JOIN FETCH o.businessScopes " +
           "LEFT JOIN FETCH o.disposalTypes " +
           "LEFT JOIN FETCH o.settlementMethods " +
           "WHERE o.id = :id")
    Optional<Organization> findByIdWithCollections(@Param("id") Long id);

    /**
     * 批量查询机构详情，预加载审批用户名称，避免N+1查询
     */
    @Query("SELECT o, u.realName FROM Organization o " +
           "LEFT JOIN User u ON o.approvalBy = u.id " +
           "WHERE o.id IN :ids")
    List<Object[]> findOrganizationsWithApprovalUserNames(@Param("ids") List<Long> ids);
}