package com.drmp.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;

/**
 * 密钥权限模板实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "key_permission_templates")
public class KeyPermissionTemplate extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "key_type_id", nullable = false)
    private KeyType keyType;

    @Column(name = "permissions", nullable = false, columnDefinition = "JSON")
    private String permissions;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_default")
    private Boolean isDefault = false;
}