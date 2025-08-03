package com.drmp.repository.system;

import com.drmp.entity.system.SysConfig;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 系统配置Repository
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Repository
public interface SysConfigRepository extends JpaRepository<SysConfig, Long> {

    /**
     * 根据配置键查找配置
     */
    Optional<SysConfig> findByConfigKey(String configKey);

    /**
     * 根据配置组查找配置列表
     */
    List<SysConfig> findByConfigGroupOrderBySortOrderAsc(String configGroup);

    /**
     * 根据配置组分页查询
     */
    Page<SysConfig> findByConfigGroupOrderBySortOrderAsc(String configGroup, Pageable pageable);

    /**
     * 查找系统配置
     */
    List<SysConfig> findByIsSystemTrueOrderByConfigGroupAscSortOrderAsc();

    /**
     * 查找非系统配置
     */
    List<SysConfig> findByIsSystemFalseOrderByConfigGroupAscSortOrderAsc();

    /**
     * 根据配置组和配置键查找
     */
    Optional<SysConfig> findByConfigGroupAndConfigKey(String configGroup, String configKey);

    /**
     * 根据配置名称模糊查询
     */
    Page<SysConfig> findByConfigNameContainingIgnoreCaseOrderBySortOrderAsc(String configName, Pageable pageable);

    /**
     * 根据配置键模糊查询
     */
    Page<SysConfig> findByConfigKeyContainingIgnoreCaseOrderBySortOrderAsc(String configKey, Pageable pageable);

    /**
     * 复合查询
     */
    @Query("SELECT c FROM SysConfig c WHERE " +
           "(:configGroup IS NULL OR c.configGroup = :configGroup) AND " +
           "(:configKey IS NULL OR c.configKey LIKE %:configKey%) AND " +
           "(:configName IS NULL OR c.configName LIKE %:configName%) AND " +
           "(:isSystem IS NULL OR c.isSystem = :isSystem) AND " +
           "(:editable IS NULL OR c.editable = :editable) " +
           "ORDER BY c.configGroup ASC, c.sortOrder ASC")
    Page<SysConfig> findByConditions(
            @Param("configGroup") String configGroup,
            @Param("configKey") String configKey,
            @Param("configName") String configName,
            @Param("isSystem") Boolean isSystem,
            @Param("editable") Boolean editable,
            Pageable pageable
    );

    /**
     * 获取所有配置组
     */
    @Query("SELECT DISTINCT c.configGroup FROM SysConfig c WHERE c.configGroup IS NOT NULL ORDER BY c.configGroup")
    List<String> findAllConfigGroups();

    /**
     * 统计配置数量
     */
    Long countByConfigGroup(String configGroup);

    /**
     * 检查配置键是否存在
     */
    Boolean existsByConfigKey(String configKey);

    /**
     * 检查配置键是否存在（排除指定ID）
     */
    @Query("SELECT COUNT(c) > 0 FROM SysConfig c WHERE c.configKey = :configKey AND c.id != :id")
    Boolean existsByConfigKeyAndIdNot(@Param("configKey") String configKey, @Param("id") Long id);

    /**
     * 根据配置组删除配置
     */
    @Modifying
    @Query("DELETE FROM SysConfig c WHERE c.configGroup = :configGroup")
    void deleteByConfigGroup(@Param("configGroup") String configGroup);

    /**
     * 更新配置值
     */
    @Modifying
    @Query("UPDATE SysConfig c SET c.configValue = :configValue, c.updatedBy = :updatedBy, c.updatedAt = CURRENT_TIMESTAMP WHERE c.configKey = :configKey")
    int updateConfigValueByKey(@Param("configKey") String configKey, @Param("configValue") String configValue, @Param("updatedBy") Long updatedBy);

    /**
     * 批量更新配置值
     */
    @Modifying
    @Query("UPDATE SysConfig c SET c.configValue = :configValue, c.updatedBy = :updatedBy, c.updatedAt = CURRENT_TIMESTAMP WHERE c.id IN :ids")
    int updateConfigValuesByIds(@Param("ids") List<Long> ids, @Param("configValue") String configValue, @Param("updatedBy") Long updatedBy);

    /**
     * 获取加密配置列表
     */
    List<SysConfig> findByIsEncryptedTrueOrderByConfigGroupAscSortOrderAsc();

    /**
     * 获取可编辑配置列表
     */
    List<SysConfig> findByEditableTrueOrderByConfigGroupAscSortOrderAsc();

    /**
     * 根据值类型查询配置
     */
    List<SysConfig> findByValueTypeOrderByConfigGroupAscSortOrderAsc(SysConfig.ValueType valueType);

    /**
     * 获取配置组统计
     */
    @Query("SELECT c.configGroup, COUNT(c) FROM SysConfig c WHERE c.configGroup IS NOT NULL GROUP BY c.configGroup ORDER BY c.configGroup")
    List<Object[]> getConfigGroupStatistics();
}