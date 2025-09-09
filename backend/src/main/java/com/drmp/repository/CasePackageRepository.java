package com.drmp.repository;

import com.drmp.entity.CasePackage;
import com.drmp.entity.enums.CasePackageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Case Package Repository
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Repository
public interface CasePackageRepository extends JpaRepository<CasePackage, Long>, JpaSpecificationExecutor<CasePackage> {

    Optional<CasePackage> findByPackageCode(String packageCode);

    boolean existsByPackageCode(String packageCode);
    
    boolean existsByPackageName(String packageName);

    List<CasePackage> findByStatus(CasePackageStatus status);

    Page<CasePackage> findByStatus(CasePackageStatus status, Pageable pageable);

    List<CasePackage> findBySourceOrganizationId(Long sourceOrgId);

    Page<CasePackage> findBySourceOrganizationId(Long sourceOrgId, Pageable pageable);

    List<CasePackage> findByDisposalOrganizationId(Long disposalOrgId);

    Page<CasePackage> findByDisposalOrganizationId(Long disposalOrgId, Pageable pageable);

    @Query("SELECT cp FROM CasePackage cp WHERE cp.sourceOrganization.id = :sourceOrgId AND cp.status = :status")
    Page<CasePackage> findBySourceOrganizationIdAndStatus(@Param("sourceOrgId") Long sourceOrgId, 
                                                          @Param("status") CasePackageStatus status, 
                                                          Pageable pageable);

    @Query("SELECT cp FROM CasePackage cp WHERE cp.disposalOrganization.id = :disposalOrgId AND cp.status = :status")
    Page<CasePackage> findByDisposalOrganizationIdAndStatus(@Param("disposalOrgId") Long disposalOrgId, 
                                                            @Param("status") CasePackageStatus status, 
                                                            Pageable pageable);

    @Query("SELECT cp FROM CasePackage cp WHERE cp.status = 'PUBLISHED' AND " +
           "(:assignmentStrategy IS NULL OR cp.assignmentStrategy = :assignmentStrategy)")
    Page<CasePackage> findAvailablePackages(@Param("assignmentStrategy") String assignmentStrategy, 
                                           Pageable pageable);

    @Query("SELECT cp FROM CasePackage cp WHERE cp.publishedAt BETWEEN :startDate AND :endDate")
    List<CasePackage> findByPublishedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                              @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(cp) FROM CasePackage cp WHERE cp.status = :status")
    long countByStatus(@Param("status") CasePackageStatus status);

    @Query("SELECT COUNT(cp) FROM CasePackage cp WHERE cp.sourceOrganization.id = :sourceOrgId")
    long countBySourceOrganizationId(@Param("sourceOrgId") Long sourceOrgId);

    @Query("SELECT COUNT(cp) FROM CasePackage cp WHERE cp.disposalOrganization.id = :disposalOrgId")
    long countByDisposalOrganizationId(@Param("disposalOrgId") Long disposalOrgId);

    @Query("SELECT SUM(cp.totalAmount) FROM CasePackage cp WHERE cp.sourceOrganization.id = :sourceOrgId AND cp.status = :status")
    Double sumTotalAmountBySourceOrganizationIdAndStatus(@Param("sourceOrgId") Long sourceOrgId, 
                                                        @Param("status") CasePackageStatus status);

    @Query("SELECT SUM(cp.totalAmount) FROM CasePackage cp WHERE cp.disposalOrganization.id = :disposalOrgId AND cp.status = :status")
    Double sumTotalAmountByDisposalOrganizationIdAndStatus(@Param("disposalOrgId") Long disposalOrgId, 
                                                          @Param("status") CasePackageStatus status);

    @Query("SELECT cp FROM CasePackage cp WHERE " +
           "(:keyword IS NULL OR LOWER(cp.packageName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "                     LOWER(cp.packageCode) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:status IS NULL OR cp.status = :status) AND " +
           "(:sourceOrgId IS NULL OR cp.sourceOrganization.id = :sourceOrgId) AND " +
           "(:disposalOrgId IS NULL OR cp.disposalOrganization.id = :disposalOrgId)")
    Page<CasePackage> findWithFilters(@Param("keyword") String keyword,
                                     @Param("status") CasePackageStatus status,
                                     @Param("sourceOrgId") Long sourceOrgId,
                                     @Param("disposalOrgId") Long disposalOrgId,
                                     Pageable pageable);

    @Query("SELECT cp FROM CasePackage cp WHERE " +
           "cp.status = 'PUBLISHED' AND " +
           "cp.disposalOrganization IS NULL AND " +
           "(:minAmount IS NULL OR cp.totalAmount >= :minAmount) AND " +
           "(:maxAmount IS NULL OR cp.totalAmount <= :maxAmount) AND " +
           "(:minOverdueDays IS NULL OR EXISTS (SELECT c FROM Case c WHERE c.casePackage = cp AND c.overdueDays >= :minOverdueDays)) AND " +
           "(:maxOverdueDays IS NULL OR EXISTS (SELECT c FROM Case c WHERE c.casePackage = cp AND c.overdueDays <= :maxOverdueDays))")
    Page<CasePackage> findMarketPackages(@Param("minAmount") Double minAmount,
                                        @Param("maxAmount") Double maxAmount,
                                        @Param("minOverdueDays") Integer minOverdueDays,
                                        @Param("maxOverdueDays") Integer maxOverdueDays,
                                        Pageable pageable);

    /**
     * 批量查找案件包及其关联机构，预加载以避免N+1查询
     */
    @Query("SELECT DISTINCT cp FROM CasePackage cp " +
           "LEFT JOIN FETCH cp.sourceOrganization " +
           "LEFT JOIN FETCH cp.disposalOrganization " +
           "WHERE cp.id IN :ids")
    List<CasePackage> findAllWithOrganizations(@Param("ids") List<Long> ids);

    /**
     * 批量查找指定状态的案件包
     */
    @Query("SELECT cp FROM CasePackage cp WHERE cp.id IN :ids AND cp.status = :status")
    List<CasePackage> findByIdsAndStatus(@Param("ids") List<Long> ids, @Param("status") CasePackageStatus status);

    /**
     * 批量查找特定机构的案件包
     */
    @Query("SELECT cp FROM CasePackage cp WHERE cp.id IN :ids AND cp.sourceOrganization.id = :orgId")
    List<CasePackage> findByIdsAndSourceOrganization(@Param("ids") List<Long> ids, @Param("orgId") Long orgId);
}