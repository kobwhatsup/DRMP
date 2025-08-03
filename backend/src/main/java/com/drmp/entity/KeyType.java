package com.drmp.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.persistence.*;
import java.util.List;

/**
 * 密钥类型实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "key_types")
public class KeyType extends BaseEntity {

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "code", unique = true, nullable = false, length = 20)
    private String code;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_system")
    private Boolean isSystem = false;

    @OneToMany(mappedBy = "keyType", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AccessKey> accessKeys;

    @OneToMany(mappedBy = "keyType", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<KeyPermissionTemplate> permissionTemplates;

    /**
     * 预定义的密钥类型代码
     */
    public static class Codes {
        public static final String API_ACCESS = "API_ACCESS";
        public static final String SYSTEM_INTEGRATION = "SYSTEM_INTEGRATION";
        public static final String USER_ACCESS = "USER_ACCESS";
        public static final String DATA_EXPORT = "DATA_EXPORT";
        public static final String WEBHOOK = "WEBHOOK";
    }
}