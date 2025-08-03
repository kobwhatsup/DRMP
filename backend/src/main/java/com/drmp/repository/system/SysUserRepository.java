package com.drmp.repository.system;

import com.drmp.entity.system.SysUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 系统用户Repository
 */
@Repository
public interface SysUserRepository extends JpaRepository<SysUser, Long>, JpaSpecificationExecutor<SysUser> {

    /**
     * 根据用户名查找用户
     */
    Optional<SysUser> findByUsername(String username);

    /**
     * 根据邮箱查找用户
     */
    Optional<SysUser> findByEmail(String email);

    /**
     * 根据手机号查找用户
     */
    Optional<SysUser> findByPhone(String phone);

    /**
     * 检查用户名是否存在（排除指定ID）
     */
    boolean existsByUsernameAndIdNot(String username, Long id);

    /**
     * 检查邮箱是否存在（排除指定ID）
     */
    boolean existsByEmailAndIdNot(String email, Long id);

    /**
     * 检查手机号是否存在（排除指定ID）
     */
    boolean existsByPhoneAndIdNot(String phone, Long id);

    /**
     * 根据机构ID查找用户
     */
    Page<SysUser> findByOrganizationId(Long organizationId, Pageable pageable);

    /**
     * 根据用户类型查找用户
     */
    Page<SysUser> findByUserType(SysUser.UserType userType, Pageable pageable);

    /**
     * 根据状态查找用户
     */
    Page<SysUser> findByStatus(SysUser.Status status, Pageable pageable);

    /**
     * 统计指定状态的用户数量
     */
    long countByStatus(SysUser.Status status);

    /**
     * 统计指定机构的用户数量
     */
    long countByOrganizationId(Long organizationId);

    /**
     * 查找在指定时间范围内创建的用户
     */
    @Query("SELECT u FROM SysUser u WHERE u.createdAt BETWEEN :startDate AND :endDate")
    Page<SysUser> findUsersCreatedBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    /**
     * 查找需要锁定的用户（登录失败次数超过限制）
     */
    @Query("SELECT u FROM SysUser u WHERE u.loginFailureCount >= :maxFailures AND u.status = 'ACTIVE'")
    Page<SysUser> findUsersToLock(@Param("maxFailures") Integer maxFailures, Pageable pageable);

    /**
     * 重置用户登录失败计数
     */
    @Query("UPDATE SysUser u SET u.loginFailureCount = 0 WHERE u.id = :userId")
    void resetLoginFailureCount(@Param("userId") Long userId);

    /**
     * 更新用户最后登录信息
     */
    @Query("UPDATE SysUser u SET u.lastLoginTime = :loginTime, u.lastLoginIp = :loginIp WHERE u.id = :userId")
    void updateLastLoginInfo(@Param("userId") Long userId, 
                            @Param("loginTime") LocalDateTime loginTime, 
                            @Param("loginIp") String loginIp);
}