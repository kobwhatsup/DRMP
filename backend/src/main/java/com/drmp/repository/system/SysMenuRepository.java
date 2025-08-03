package com.drmp.repository.system;

import com.drmp.entity.system.SysMenu;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SysMenuRepository extends JpaRepository<SysMenu, Long> {

    Optional<SysMenu> findByMenuCode(String menuCode);

    List<SysMenu> findByParentIdOrderBySortOrder(Long parentId);

    List<SysMenu> findByStatusOrderBySortOrder(SysMenu.Status status);

    @Query("SELECT m FROM SysMenu m WHERE m.status = :status AND m.visible = true ORDER BY m.sortOrder")
    List<SysMenu> findVisibleMenus(@Param("status") SysMenu.Status status);

    @Query("SELECT m FROM SysMenu m WHERE m.parentId = :parentId AND m.status = :status ORDER BY m.sortOrder")
    List<SysMenu> findByParentIdAndStatus(@Param("parentId") Long parentId, @Param("status") SysMenu.Status status);

    @Query("SELECT COUNT(m) > 0 FROM SysMenu m WHERE m.parentId = :menuId")
    boolean hasChildren(@Param("menuId") Long menuId);

    @Query("SELECT m FROM SysMenu m WHERE m.menuName LIKE %:keyword% OR m.menuCode LIKE %:keyword%")
    Page<SysMenu> searchMenus(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT DISTINCT m FROM SysMenu m " +
           "JOIN SysRoleMenu rm ON m.id = rm.menuId " +
           "JOIN SysUserRole ur ON rm.roleId = ur.roleId " +
           "WHERE ur.userId = :userId AND m.status = 'ACTIVE' AND m.visible = true " +
           "ORDER BY m.sortOrder")
    List<SysMenu> findUserMenus(@Param("userId") Long userId);

    @Query("SELECT m.permissionCode FROM SysMenu m " +
           "JOIN SysRoleMenu rm ON m.id = rm.menuId " +
           "JOIN SysUserRole ur ON rm.roleId = ur.roleId " +
           "WHERE ur.userId = :userId AND m.permissionCode IS NOT NULL")
    List<String> findUserPermissions(@Param("userId") Long userId);
}