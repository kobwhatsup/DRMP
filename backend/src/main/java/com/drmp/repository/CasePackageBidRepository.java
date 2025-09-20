package com.drmp.repository;

import com.drmp.entity.CasePackageBid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import com.drmp.entity.CasePackage;
import com.drmp.entity.Organization;

/**
 * Case Package Bid Repository
 * 案件包竞标数据访问层
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@Repository
public interface CasePackageBidRepository extends JpaRepository<CasePackageBid, Long> {

    /**
     * Check if bid exists for package and organization
     */
    @Query("SELECT COUNT(b) > 0 FROM CasePackageBid b WHERE b.casePackage.id = :casePackageId AND b.disposalOrganization.id = :disposalOrgId")
    boolean existsByCasePackageIdAndDisposalOrgId(@Param("casePackageId") Long casePackageId, @Param("disposalOrgId") Long disposalOrgId);

    /**
     * Find all bids for a case package
     */
    @Query("SELECT b FROM CasePackageBid b WHERE b.casePackage.id = :casePackageId")
    List<CasePackageBid> findByCasePackageId(@Param("casePackageId") Long casePackageId);

    /**
     * Find bids by disposal organization
     */
    Page<CasePackageBid> findByDisposalOrganizationId(Long disposalOrganizationId, Pageable pageable);

    /**
     * Update other bids as lost
     */
    @Modifying
    @Query("UPDATE CasePackageBid b SET b.status = 'LOST', b.isWinner = false " +
           "WHERE b.casePackage.id = :packageId AND b.id != :winnerId")
    void updateOtherBidsAsLost(@Param("packageId") Long packageId, @Param("winnerId") Long winnerId);

    /**
     * Count bids for a case package
     */
    @Query("SELECT COUNT(b) FROM CasePackageBid b WHERE b.casePackage.id = :casePackageId")
    long countByCasePackageId(@Param("casePackageId") Long casePackageId);

    /**
     * Find winning bid for a case package
     */
    @Query("SELECT b FROM CasePackageBid b WHERE b.casePackage.id = :packageId AND b.isWinner = true")
    CasePackageBid findWinningBid(@Param("packageId") Long packageId);

    /**
     * Find bid by case package and disposal organization
     */
    Optional<CasePackageBid> findByCasePackageAndDisposalOrganization(CasePackage casePackage, Organization disposalOrganization);
}