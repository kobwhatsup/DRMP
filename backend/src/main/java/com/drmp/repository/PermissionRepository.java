package com.drmp.repository;

import com.drmp.entity.Permission;
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
 * Permission Repository
 * 权限数据访问层
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long>, JpaSpecificationExecutor<Permission> {

    /**
     * 根据权限代码查找权限
     */
    Optional<Permission> findByCode(String code);

    /**
     * 根据权限名称查找权限
     */
    Optional<Permission> findByName(String name);

    /**
     * 根据资源和操作查找权限
     */
    Optional<Permission> findByResourceAndAction(String resource, String action);

    /**
     * 检查权限代码是否存在
     */
    boolean existsByCode(String code);

    /**
     * 检查权限名称是否存在
     */
    boolean existsByName(String name);

    /**
     * 检查权限代码是否存在（排除指定ID）
     */
    boolean existsByCodeAndIdNot(String code, Long id);

    /**
     * 检查权限名称是否存在（排除指定ID）
     */
    boolean existsByNameAndIdNot(String name, Long id);

    /**
     * 根据资源查找权限
     */
    List<Permission> findByResourceOrderByActionAsc(String resource);

    /**
     * 根据操作查找权限
     */
    List<Permission> findByActionOrderByResourceAsc(String action);

    /**
     * 查找所有权限并按资源分组
     */
    @Query("SELECT p FROM Permission p ORDER BY p.resource ASC, p.action ASC")
    List<Permission> findAllOrderByResourceAndAction();

    /**
     * 根据角色ID查找权限
     */
    @Query("SELECT p FROM Permission p JOIN p.roles r WHERE r.id = :roleId")
    List<Permission> findByRoleId(@Param("roleId") Long roleId);

    /**
     * 根据用户ID查找用户权限（通过角色关联）
     */
    @Query("SELECT DISTINCT p FROM Permission p " +
           "JOIN p.roles r " +
           "JOIN r.users u " +
           "WHERE u.id = :userId")
    List<Permission> findByUserId(@Param("userId") Long userId);

    /**
     * 查找不被任何角色使用的权限
     */
    @Query("SELECT p FROM Permission p WHERE p.id NOT IN " +
           "(SELECT DISTINCT p2.id FROM Permission p2 JOIN p2.roles)")
    List<Permission> findUnusedPermissions();

    /**
     * 根据资源列表查找权限
     */
    @Query("SELECT p FROM Permission p WHERE p.resource IN :resources ORDER BY p.resource ASC, p.action ASC")
    List<Permission> findByResourceIn(@Param("resources") List<String> resources);

    /**
     * 查找权限及其关联的角色
     */
    @Query("SELECT p FROM Permission p LEFT JOIN FETCH p.roles WHERE p.id = :id")
    Optional<Permission> findByIdWithRoles(@Param("id") Long id);

    /**
     * 根据关键词搜索权限
     */
    @Query("SELECT p FROM Permission p WHERE " +
           "p.name LIKE %:keyword% OR " +
           "p.code LIKE %:keyword% OR " +
           "p.resource LIKE %:keyword% OR " +
           "p.action LIKE %:keyword% OR " +
           "p.description LIKE %:keyword%")
    Page<Permission> findByKeyword(@Param("keyword") String keyword, Pageable pageable);

    /**
     * 根据资源和关键词搜索权限
     */
    @Query("SELECT p FROM Permission p WHERE " +
           "(:resource IS NULL OR p.resource = :resource) AND " +
           "(:keyword IS NULL OR p.name LIKE %:keyword% OR p.code LIKE %:keyword% OR p.description LIKE %:keyword%)")
    Page<Permission> findByResourceAndKeyword(
            @Param("resource") String resource,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    /**
     * 获取所有资源类型
     */
    @Query("SELECT DISTINCT p.resource FROM Permission p ORDER BY p.resource")
    List<String> findDistinctResources();

    /**
     * 获取所有操作类型
     */
    @Query("SELECT DISTINCT p.action FROM Permission p ORDER BY p.action")
    List<String> findDistinctActions();

    /**
     * 统计权限数量按资源分组
     */
    @Query("SELECT p.resource, COUNT(p) FROM Permission p GROUP BY p.resource ORDER BY p.resource")
    List<Object[]> countByResource();

    /**
     * 统计权限数量按操作分组
     */
    @Query("SELECT p.action, COUNT(p) FROM Permission p GROUP BY p.action ORDER BY p.action")
    List<Object[]> countByAction();

    /**
     * 查找指定角色没有的权限
     */
    @Query("SELECT p FROM Permission p WHERE p.id NOT IN " +
           "(SELECT DISTINCT p2.id FROM Permission p2 JOIN p2.roles r WHERE r.id = :roleId)")
    List<Permission> findPermissionsNotInRole(@Param("roleId") Long roleId);

    /**
     * 根据权限代码列表查找权限
     */
    @Query("SELECT p FROM Permission p WHERE p.code IN :codes")
    List<Permission> findByCodes(@Param("codes") List<String> codes);

    /**
     * 查找所有权限按创建时间倒序
     */
    List<Permission> findAllByOrderByCreatedAtDesc();

    /**
     * 根据分组名称查找权限
     */
    List<Permission> findByGroupNameOrderBySortOrderAscCreatedAtDesc(String groupName);

    /**
     * 根据资源查找权限并排序
     */
    List<Permission> findByResourceOrderBySortOrderAscCreatedAtDesc(String resource);

    /**
     * 检查资源和操作是否存在
     */
    boolean existsByResourceAndAction(String resource, String action);

    /**
     * 根据ID列表查找权限及其角色
     */
    @Query("SELECT p FROM Permission p LEFT JOIN FETCH p.roles WHERE p.id IN :ids")
    List<Permission> findAllByIdWithRoles(@Param("ids") List<Long> ids);
}