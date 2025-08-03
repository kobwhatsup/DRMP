package com.drmp.repository.system;

import com.drmp.entity.system.SysPermission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SysPermissionRepository extends JpaRepository<SysPermission, Long> {
    
    Optional<SysPermission> findByPermissionCode(String permissionCode);
    
    List<SysPermission> findByParentIdOrderBySortOrder(Long parentId);
    
    List<SysPermission> findByResourceType(SysPermission.ResourceType resourceType);
    
    @Query("SELECT p FROM SysPermission p WHERE p.permissionName LIKE %:keyword% OR p.permissionCode LIKE %:keyword%")
    Page<SysPermission> searchPermissions(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT COUNT(p) > 0 FROM SysPermission p WHERE p.parentId = :permissionId")
    boolean hasChildren(@Param("permissionId") Long permissionId);
    
    @Query("SELECT p FROM SysPermission p WHERE p.resourceType = :resourceType AND p.status = :status ORDER BY p.sortOrder")
    List<SysPermission> findByResourceTypeAndStatus(@Param("resourceType") SysPermission.ResourceType resourceType, 
                                                   @Param("status") SysPermission.Status status);
    
    @Query("SELECT DISTINCT p FROM SysPermission p " +
           "JOIN SysRolePermission rp ON p.id = rp.permissionId " +
           "JOIN SysUserRole ur ON rp.roleId = ur.roleId " +
           "WHERE ur.userId = :userId AND p.status = 'ACTIVE'")
    List<SysPermission> findUserPermissions(@Param("userId") Long userId);
    
    @Query("SELECT p.permissionCode FROM SysPermission p " +
           "JOIN SysRolePermission rp ON p.id = rp.permissionId " +
           "JOIN SysUserRole ur ON rp.roleId = ur.roleId " +
           "WHERE ur.userId = :userId AND p.status = 'ACTIVE'")
    List<String> findUserPermissionCodes(@Param("userId") Long userId);
}