package com.drmp.service.impl;

import com.drmp.entity.Organization;
import com.drmp.entity.OrganizationAuditLog;
import com.drmp.entity.User;
import com.drmp.entity.enums.OrganizationStatus;
import com.drmp.repository.OrganizationAuditLogRepository;
import com.drmp.repository.UserRepository;
import com.drmp.service.OrganizationAuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Organization Audit Service Implementation
 * 机构审核日志服务实现
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrganizationAuditServiceImpl implements OrganizationAuditService {

    private final OrganizationAuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Override
    public void logOrganizationOperation(
            Organization organization,
            String operationType,
            OrganizationStatus oldStatus,
            OrganizationStatus newStatus,
            String remark,
            String extraData) {

        try {
            // 获取当前用户信息
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication != null ? authentication.getName() : "system";
            
            User currentUser = null;
            if (!"system".equals(username) && !"anonymousUser".equals(username)) {
                currentUser = userRepository.findByUsername(username).orElse(null);
            }

            // 获取请求信息
            String ipAddress = getClientIpAddress();
            String userAgent = getUserAgent();

            // 创建审核日志
            OrganizationAuditLog auditLog = OrganizationAuditLog.builder()
                    .organizationId(organization.getId())
                    .orgCode(organization.getOrgCode())
                    .orgName(organization.getName())
                    .operationType(operationType)
                    .oldStatus(oldStatus)
                    .newStatus(newStatus)
                    .remark(remark)
                    .operatorId(currentUser != null ? currentUser.getId() : null)
                    .operatorName(currentUser != null ? currentUser.getRealName() : username)
                    .operationTime(LocalDateTime.now())
                    .extraData(extraData)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .build();

            auditLogRepository.save(auditLog);
            
            log.info("Audit log created: organization={}, operation={}, operator={}", 
                    organization.getOrgCode(), operationType, username);
                    
        } catch (Exception e) {
            log.error("Failed to create audit log for organization: " + organization.getOrgCode(), e);
            // 不抛出异常，避免影响主业务流程
        }
    }

    @Override
    public void logOrganizationCreation(Organization organization, String remark) {
        logOrganizationOperation(organization, "CREATE", null, organization.getStatus(), remark, null);
    }

    @Override
    public void logOrganizationUpdate(Organization organization, String remark) {
        logOrganizationOperation(organization, "UPDATE", organization.getStatus(), organization.getStatus(), remark, null);
    }

    @Override
    public void logOrganizationApproval(Organization organization, OrganizationStatus oldStatus, String remark) {
        logOrganizationOperation(organization, "APPROVE", oldStatus, OrganizationStatus.ACTIVE, remark, null);
    }

    @Override
    public void logOrganizationRejection(Organization organization, OrganizationStatus oldStatus, String remark) {
        logOrganizationOperation(organization, "REJECT", oldStatus, OrganizationStatus.REJECTED, remark, null);
    }

    @Override
    public void logOrganizationSuspension(Organization organization, OrganizationStatus oldStatus, String reason) {
        logOrganizationOperation(organization, "SUSPEND", oldStatus, OrganizationStatus.SUSPENDED, reason, null);
    }

    @Override
    public void logOrganizationActivation(Organization organization, OrganizationStatus oldStatus) {
        logOrganizationOperation(organization, "ACTIVATE", oldStatus, OrganizationStatus.ACTIVE, "机构重新激活", null);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrganizationAuditLog> getOrganizationAuditHistory(Long organizationId, Pageable pageable) {
        return auditLogRepository.findByOrganizationIdOrderByOperationTimeDesc(organizationId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrganizationAuditLog> getOrganizationAuditHistory(Long organizationId) {
        return auditLogRepository.findByOrganizationIdOrderByOperationTimeDesc(organizationId);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getAuditStatistics() {
        Map<String, Object> statistics = new HashMap<>();
        
        try {
            // 获取审核统计数据
            List<Object[]> approvalStats = auditLogRepository.getApprovalStatistics();
            long totalApprovals = 0;
            long totalRejections = 0;
            
            for (Object[] stat : approvalStats) {
                String operationType = (String) stat[0];
                Long count = (Long) stat[1];
                if ("APPROVE".equals(operationType)) {
                    totalApprovals = count;
                } else if ("REJECT".equals(operationType)) {
                    totalRejections = count;
                }
            }
            
            statistics.put("totalApprovals", totalApprovals);
            statistics.put("totalRejections", totalRejections);
            statistics.put("totalOperations", totalApprovals + totalRejections);
            
            // 今日新增的待审核数量
            long todayPending = auditLogRepository.countTodayLogsByOperationType("CREATE");
            statistics.put("todayPending", todayPending);
            
            // 本周审核通过数量
            LocalDateTime weekStart = LocalDateTime.now().with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY)).withHour(0).withMinute(0).withSecond(0);
            long weekApproved = auditLogRepository.countWeekLogsByOperationType("APPROVE", weekStart);
            statistics.put("weekApproved", weekApproved);
            
            // 计算通过率
            if (totalApprovals + totalRejections > 0) {
                double approvalRate = (double) totalApprovals / (totalApprovals + totalRejections) * 100;
                statistics.put("approvalRate", Math.round(approvalRate * 100.0) / 100.0);
            } else {
                statistics.put("approvalRate", 0.0);
            }
            
        } catch (Exception e) {
            log.error("Failed to get audit statistics", e);
            // 返回默认值
            statistics.put("totalApprovals", 0L);
            statistics.put("totalRejections", 0L);
            statistics.put("totalOperations", 0L);
            statistics.put("todayPending", 0L);
            statistics.put("weekApproved", 0L);
            statistics.put("approvalRate", 0.0);
        }
        
        return statistics;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrganizationAuditLog> getAuditLogsByOperationType(String operationType, Pageable pageable) {
        return auditLogRepository.findByOperationTypeOrderByOperationTimeDesc(operationType, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrganizationAuditLog> getAuditLogsByOperator(Long operatorId, Pageable pageable) {
        return auditLogRepository.findByOperatorIdOrderByOperationTimeDesc(operatorId, pageable);
    }

    /**
     * 获取客户端IP地址
     */
    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes == null) {
                return "unknown";
            }
            
            HttpServletRequest request = attributes.getRequest();
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
                return xForwardedFor.split(",")[0].trim();
            }
            
            String xRealIp = request.getHeader("X-Real-IP");
            if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
                return xRealIp;
            }
            
            return request.getRemoteAddr();
        } catch (Exception e) {
            log.warn("Failed to get client IP address", e);
            return "unknown";
        }
    }

    /**
     * 获取用户代理
     */
    private String getUserAgent() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes == null) {
                return "unknown";
            }
            
            HttpServletRequest request = attributes.getRequest();
            String userAgent = request.getHeader("User-Agent");
            return userAgent != null ? userAgent : "unknown";
        } catch (Exception e) {
            log.warn("Failed to get user agent", e);
            return "unknown";
        }
    }
}