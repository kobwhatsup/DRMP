package com.drmp.repository.system;

import com.drmp.entity.system.SysRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 系统角色Repository
 */
@Repository
public interface SysRoleRepository extends JpaRepository<SysRole, Long> {

    /**
     * 根据角色编码查找角色
     */
    Optional<SysRole> findByRoleCode(String roleCode);

    /**
     * 检查角色编码是否存在（排除指定ID）
     */
    boolean existsByRoleCodeAndIdNot(String roleCode, Long id);

    /**
     * 根据角色类型查找角色
     */
    List<SysRole> findByRoleTypeAndStatus(SysRole.RoleType roleType, SysRole.Status status);

    /**
     * 根据状态查找角色
     */
    Page<SysRole> findByStatus(SysRole.Status status, Pageable pageable);

    /**
     * 查找用户的角色
     */
    @Query("SELECT r FROM SysRole r INNER JOIN SysUserRole ur ON r.id = ur.roleId WHERE ur.userId = :userId")
    List<SysRole> findRolesByUserId(@Param("userId") Long userId);

    /**
     * 查找启用状态的所有角色
     */
    List<SysRole> findByStatusOrderBySortOrder(SysRole.Status status);

    /**
     * 根据角色名模糊查询
     */
    @Query("SELECT r FROM SysRole r WHERE r.roleName LIKE %:roleName% AND r.status = :status")
    Page<SysRole> findByRoleNameContainingAndStatus(@Param("roleName") String roleName, 
                                                   @Param("status") SysRole.Status status, 
                                                   Pageable pageable);
}