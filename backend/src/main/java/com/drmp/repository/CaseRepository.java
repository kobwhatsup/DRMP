package com.drmp.repository;

import com.drmp.entity.Case;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 案件数据访问层
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Repository
public interface CaseRepository extends JpaRepository<Case, Long> {

    /**
     * 根据案件包ID查找案件
     */
    List<Case> findByCasePackageId(Long casePackageId);

    /**
     * 根据债务人身份证号查找案件
     */
    Optional<Case> findByDebtorIdCard(String debtorIdCard);

    /**
     * 根据案件编号查找案件
     */
    Optional<Case> findByCaseNo(String caseNo);

    /**
     * 统计案件包中的案件数量
     */
    @Query("SELECT COUNT(c) FROM Case c WHERE c.casePackageId = :casePackageId")
    Long countByCasePackageId(@Param("casePackageId") Long casePackageId);

    /**
     * 查找重复的身份证号
     */
    @Query("SELECT c.debtorIdCard FROM Case c WHERE c.debtorIdCard IN :idCards GROUP BY c.debtorIdCard HAVING COUNT(c) > 1")
    List<String> findDuplicateIdCards(@Param("idCards") List<String> idCards);
    
    /**
     * 根据案件包ID分页查找案件
     */
    Page<Case> findByCasePackageId(Long casePackageId, Pageable pageable);
    
    /**
     * 更新案件的案件包ID
     */
    @Modifying
    @Transactional
    @Query("UPDATE Case c SET c.casePackageId = :packageId WHERE c.id IN :caseIds")
    void updateCasePackageId(@Param("caseIds") List<Long> caseIds, @Param("packageId") Long packageId);
    
    /**
     * 清除案件的案件包ID
     */
    @Modifying
    @Transactional
    @Query("UPDATE Case c SET c.casePackageId = NULL WHERE c.id IN :caseIds")
    void clearCasePackageId(@Param("caseIds") List<Long> caseIds);
    
    /**
     * 将案件包ID设置为NULL
     */
    @Modifying
    @Transactional
    @Query("UPDATE Case c SET c.casePackageId = NULL WHERE c.casePackageId = :packageId")
    void updateCasePackageIdToNull(@Param("packageId") Long packageId);
}