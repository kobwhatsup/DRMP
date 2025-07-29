package com.drmp.repository;

import com.drmp.entity.Role;
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
 * Role Repository
 * 角色数据访问层
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long>, JpaSpecificationExecutor<Role> {

    /**
     * 根据角色代码查找角色
     */
    Optional<Role> findByCode(String code);

    /**
     * 根据角色名称查找角色
     */
    Optional<Role> findByName(String name);

    /**
     * 检查角色代码是否存在
     */
    boolean existsByCode(String code);

    /**
     * 检查角色名称是否存在
     */
    boolean existsByName(String name);

    /**
     * 根据角色代码查找角色（排除指定ID）
     */
    boolean existsByCodeAndIdNot(String code, Long id);

    /**
     * 根据角色名称查找角色（排除指定ID）
     */
    boolean existsByNameAndIdNot(String name, Long id);

    /**
     * 查找所有非系统角色
     */
    List<Role> findByIsSystemFalseOrderByCreatedAtDesc();

    /**
     * 查找所有系统角色
     */
    List<Role> findByIsSystemTrueOrderByCreatedAtDesc();

    /**
     * 根据机构类型查找角色
     */
    List<Role> findByOrganizationTypeOrderByCreatedAtDesc(String organizationType);

    /**
     * 根据机构类型和系统标识查找角色
     */
    List<Role> findByOrganizationTypeAndIsSystemOrderByCreatedAtDesc(String organizationType, Boolean isSystem);

    /**
     * 查找启用的角色
     */
    List<Role> findByEnabledTrueOrderByCreatedAtDesc();

    /**
     * 根据启用状态查找角色
     */
    Page<Role> findByEnabledOrderByCreatedAtDesc(Boolean enabled, Pageable pageable);

    /**
     * 查找角色及其权限
     */
    @Query("SELECT r FROM Role r LEFT JOIN FETCH r.permissions WHERE r.id = :id")
    Optional<Role> findByIdWithPermissions(@Param("id") Long id);

    /**
     * 查找角色及其用户
     */
    @Query("SELECT r FROM Role r LEFT JOIN FETCH r.users WHERE r.id = :id")
    Optional<Role> findByIdWithUsers(@Param("id") Long id);

    /**
     * 查找角色及其权限和用户
     */
    @Query("SELECT DISTINCT r FROM Role r " +
           "LEFT JOIN FETCH r.permissions " +
           "LEFT JOIN FETCH r.users " +
           "WHERE r.id = :id")
    Optional<Role> findByIdWithPermissionsAndUsers(@Param("id") Long id);

    /**
     * 根据权限ID查找相关角色
     */
    @Query("SELECT r FROM Role r JOIN r.permissions p WHERE p.id = :permissionId")
    List<Role> findByPermissionId(@Param("permissionId") Long permissionId);

    /**
     * 根据用户ID查找用户角色
     */
    @Query("SELECT r FROM Role r JOIN r.users u WHERE u.id = :userId")
    List<Role> findByUserId(@Param("userId") Long userId);

    /**
     * 统计角色数量
     */
    @Query("SELECT COUNT(r) FROM Role r WHERE r.isSystem = :isSystem")
    long countByIsSystem(@Param("isSystem") Boolean isSystem);

    /**
     * 统计启用的角色数量
     */
    long countByEnabled(Boolean enabled);

    /**
     * 查找包含指定权限代码的角色
     */
    @Query("SELECT DISTINCT r FROM Role r JOIN r.permissions p WHERE p.code = :permissionCode")
    List<Role> findByPermissionCode(@Param("permissionCode") String permissionCode);

    /**
     * 查找不包含指定权限的角色
     */
    @Query("SELECT r FROM Role r WHERE r.id NOT IN " +
           "(SELECT DISTINCT r2.id FROM Role r2 JOIN r2.permissions p WHERE p.id = :permissionId)")
    List<Role> findRolesNotHavingPermission(@Param("permissionId") Long permissionId);

    /**
     * 根据机构类型和关键词搜索角色
     */
    @Query("SELECT r FROM Role r WHERE " +
           "(:organizationType IS NULL OR r.organizationType = :organizationType) AND " +
           "(:keyword IS NULL OR r.name LIKE %:keyword% OR r.code LIKE %:keyword% OR r.description LIKE %:keyword%)")
    Page<Role> findByOrganizationTypeAndKeyword(
            @Param("organizationType") String organizationType,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}