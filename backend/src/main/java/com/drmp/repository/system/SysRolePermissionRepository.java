package com.drmp.repository.system;

import com.drmp.entity.system.SysRolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SysRolePermissionRepository extends JpaRepository<SysRolePermission, Long> {
    
    @Modifying
    @Query("DELETE FROM SysRolePermission rp WHERE rp.roleId = :roleId")
    void deleteByRoleId(@Param("roleId") Long roleId);
    
    @Modifying
    @Query("DELETE FROM SysRolePermission rp WHERE rp.permissionId = :permissionId")
    void deleteByPermissionId(@Param("permissionId") Long permissionId);
    
    @Query("SELECT rp.permissionId FROM SysRolePermission rp WHERE rp.roleId = :roleId")
    List<Long> findPermissionIdsByRoleId(@Param("roleId") Long roleId);
    
    List<SysRolePermission> findByRoleId(Long roleId);
    
    @Query("SELECT COUNT(rp) > 0 FROM SysRolePermission rp WHERE rp.permissionId = :permissionId")
    boolean isPermissionInUse(@Param("permissionId") Long permissionId);
}