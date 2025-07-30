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
}