package com.drmp.entity;

import com.drmp.entity.enums.OrganizationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * Organization Audit Log Entity
 * 机构审核日志实体
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Entity
@Table(name = "organization_audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 机构ID
     */
    @Column(name = "organization_id", nullable = false)
    private Long organizationId;

    /**
     * 机构代码
     */
    @Column(name = "org_code", length = 50)
    private String orgCode;

    /**
     * 机构名称（冗余字段，方便查询）
     */
    @Column(name = "org_name", length = 255)
    private String orgName;

    /**
     * 操作类型：CREATE, UPDATE, APPROVE, REJECT, SUSPEND, ACTIVATE
     */
    @Column(name = "operation_type", length = 20, nullable = false)
    private String operationType;

    /**
     * 操作前状态
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "old_status", length = 20)
    private OrganizationStatus oldStatus;

    /**
     * 操作后状态
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", length = 20)
    private OrganizationStatus newStatus;

    /**
     * 操作说明/备注
     */
    @Column(name = "remark", columnDefinition = "TEXT")
    private String remark;

    /**
     * 操作人ID
     */
    @Column(name = "operator_id")
    private Long operatorId;

    /**
     * 操作人姓名
     */
    @Column(name = "operator_name", length = 100)
    private String operatorName;

    /**
     * 操作时间
     */
    @Column(name = "operation_time", nullable = false)
    private LocalDateTime operationTime;

    /**
     * 额外数据（JSON格式）
     */
    @Column(name = "extra_data", columnDefinition = "TEXT")
    private String extraData;

    /**
     * IP地址
     */
    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    /**
     * 用户代理
     */
    @Column(name = "user_agent", length = 500)
    private String userAgent;

    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (operationTime == null) {
            operationTime = LocalDateTime.now();
        }
    }
}