package com.drmp.repository;

import com.drmp.entity.Contract;
import com.drmp.entity.enums.ContractStatus;
import com.drmp.entity.enums.ContractType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 合同仓库接口
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {
    
    /**
     * 根据合同编号查找合同
     */
    Optional<Contract> findByContractNumber(String contractNumber);
    
    /**
     * 检查合同编号是否存在
     */
    boolean existsByContractNumber(String contractNumber);
    
    /**
     * 根据案件包ID查找合同
     */
    List<Contract> findByCasePackageId(Long casePackageId);
    
    /**
     * 根据案件包ID和合同类型查找合同
     */
    List<Contract> findByCasePackageIdAndContractType(Long casePackageId, ContractType contractType);
    
    /**
     * 根据个案ID查找合同
     */
    List<Contract> findByCaseId(Long caseId);
    
    /**
     * 根据甲方ID查找合同
     */
    Page<Contract> findByPartyAId(Long partyAId, Pageable pageable);
    
    /**
     * 根据乙方ID查找合同
     */
    Page<Contract> findByPartyBId(Long partyBId, Pageable pageable);
    
    /**
     * 根据合同状态查找合同
     */
    Page<Contract> findByStatus(ContractStatus status, Pageable pageable);
    
    /**
     * 根据合同类型查找合同
     */
    Page<Contract> findByContractType(ContractType contractType, Pageable pageable);
    
    /**
     * 查找即将到期的合同
     */
    @Query("SELECT c FROM Contract c WHERE c.expiryDate BETWEEN :startDate AND :endDate AND c.status IN :statuses")
    List<Contract> findExpiringContracts(@Param("startDate") LocalDate startDate, 
                                       @Param("endDate") LocalDate endDate,
                                       @Param("statuses") List<ContractStatus> statuses);
    
    /**
     * 查找已过期的合同
     */
    @Query("SELECT c FROM Contract c WHERE c.expiryDate < :currentDate AND c.status IN :statuses")
    List<Contract> findExpiredContracts(@Param("currentDate") LocalDate currentDate,
                                      @Param("statuses") List<ContractStatus> statuses);
    
    /**
     * 查找待签署的合同
     */
    @Query("SELECT c FROM Contract c WHERE c.status IN ('PENDING_SIGNATURE', 'PARTIALLY_SIGNED')")
    List<Contract> findPendingSignatureContracts();
    
    /**
     * 查找需要审核的合同
     */
    @Query("SELECT c FROM Contract c WHERE c.requiresLegalReview = true AND c.status = 'PENDING_REVIEW'")
    List<Contract> findContractsRequiringReview();
    
    /**
     * 根据模板ID查找合同
     */
    List<Contract> findByTemplateId(Long templateId);
    
    /**
     * 根据父合同ID查找子合同
     */
    List<Contract> findByParentContractId(Long parentContractId);
    
    /**
     * 查找特定机构的合同
     */
    @Query("SELECT c FROM Contract c WHERE c.partyAId = :organizationId OR c.partyBId = :organizationId OR c.partyCId = :organizationId")
    Page<Contract> findByOrganizationId(@Param("organizationId") Long organizationId, Pageable pageable);
    
    /**
     * 根据生效日期范围查找合同
     */
    @Query("SELECT c FROM Contract c WHERE c.effectiveDate BETWEEN :startDate AND :endDate")
    Page<Contract> findByEffectiveDateBetween(@Param("startDate") LocalDate startDate, 
                                            @Param("endDate") LocalDate endDate, 
                                            Pageable pageable);
    
    /**
     * 统计各状态合同数量
     */
    @Query("SELECT c.status, COUNT(c) FROM Contract c GROUP BY c.status")
    List<Object[]> countByStatus();
    
    /**
     * 统计各类型合同数量
     */
    @Query("SELECT c.contractType, COUNT(c) FROM Contract c GROUP BY c.contractType")
    List<Object[]> countByContractType();
    
    /**
     * 统计机构合同数量
     */
    @Query("SELECT COUNT(c) FROM Contract c WHERE c.partyAId = :organizationId OR c.partyBId = :organizationId OR c.partyCId = :organizationId")
    Long countByOrganizationId(@Param("organizationId") Long organizationId);
    
    /**
     * 查找高风险合同
     */
    @Query("SELECT c FROM Contract c WHERE c.riskLevel IN ('HIGH', 'MEDIUM') AND c.status NOT IN ('TERMINATED', 'EXPIRED', 'CANCELLED')")
    List<Contract> findHighRiskContracts();
    
    /**
     * 复合条件查询合同
     */
    @Query("SELECT c FROM Contract c WHERE " +
           "(:contractType IS NULL OR c.contractType = :contractType) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:partyAId IS NULL OR c.partyAId = :partyAId) AND " +
           "(:partyBId IS NULL OR c.partyBId = :partyBId) AND " +
           "(:startDate IS NULL OR c.effectiveDate >= :startDate) AND " +
           "(:endDate IS NULL OR c.effectiveDate <= :endDate)")
    Page<Contract> findByConditions(@Param("contractType") ContractType contractType,
                                  @Param("status") ContractStatus status,
                                  @Param("partyAId") Long partyAId,
                                  @Param("partyBId") Long partyBId,
                                  @Param("startDate") LocalDate startDate,
                                  @Param("endDate") LocalDate endDate,
                                  Pageable pageable);
    
    /**
     * 根据关键词搜索合同
     */
    @Query("SELECT c FROM Contract c WHERE " +
           "c.title LIKE %:keyword% OR " +
           "c.contractNumber LIKE %:keyword% OR " +
           "c.partyAName LIKE %:keyword% OR " +
           "c.partyBName LIKE %:keyword% OR " +
           "c.contentSummary LIKE %:keyword%")
    Page<Contract> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}