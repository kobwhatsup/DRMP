package com.drmp.service;

import com.drmp.entity.Organization;
import com.drmp.entity.OrganizationAuditLog;
import com.drmp.entity.enums.OrganizationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

/**
 * Organization Audit Service
 * 机构审核日志服务接口
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public interface OrganizationAuditService {

    /**
     * 记录机构操作日志
     */
    void logOrganizationOperation(
            Organization organization,
            String operationType,
            OrganizationStatus oldStatus,
            OrganizationStatus newStatus,
            String remark,
            String extraData
    );

    /**
     * 记录机构创建日志
     */
    void logOrganizationCreation(Organization organization, String remark);

    /**
     * 记录机构更新日志
     */
    void logOrganizationUpdate(Organization organization, String remark);

    /**
     * 记录机构审核通过日志
     */
    void logOrganizationApproval(Organization organization, OrganizationStatus oldStatus, String remark);

    /**
     * 记录机构审核拒绝日志
     */
    void logOrganizationRejection(Organization organization, OrganizationStatus oldStatus, String remark);

    /**
     * 记录机构停用日志
     */
    void logOrganizationSuspension(Organization organization, OrganizationStatus oldStatus, String reason);

    /**
     * 记录机构激活日志
     */
    void logOrganizationActivation(Organization organization, OrganizationStatus oldStatus);

    /**
     * 获取机构的审核历史
     */
    Page<OrganizationAuditLog> getOrganizationAuditHistory(Long organizationId, Pageable pageable);

    /**
     * 获取机构的审核历史列表
     */
    List<OrganizationAuditLog> getOrganizationAuditHistory(Long organizationId);

    /**
     * 获取审核统计数据
     */
    Map<String, Object> getAuditStatistics();

    /**
     * 获取操作类型的审核记录
     */
    Page<OrganizationAuditLog> getAuditLogsByOperationType(String operationType, Pageable pageable);

    /**
     * 获取操作人的审核记录
     */
    Page<OrganizationAuditLog> getAuditLogsByOperator(Long operatorId, Pageable pageable);
}