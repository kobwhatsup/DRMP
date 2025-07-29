package com.drmp.service.impl;

import com.drmp.dto.request.OrganizationApprovalRequest;
import com.drmp.dto.request.OrganizationCreateRequest;
import com.drmp.dto.request.OrganizationUpdateRequest;
import com.drmp.dto.response.OrganizationDetailResponse;
import com.drmp.dto.response.OrganizationListResponse;
import com.drmp.dto.response.PageResponse;
import com.drmp.entity.Organization;
import com.drmp.entity.User;
import com.drmp.entity.enums.OrganizationStatus;
import com.drmp.entity.enums.OrganizationType;
import com.drmp.exception.BusinessException;
import com.drmp.repository.OrganizationRepository;
import com.drmp.repository.UserRepository;
import com.drmp.service.OrganizationAuditService;
import com.drmp.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Organization Service Implementation
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final OrganizationAuditService auditService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrganizationListResponse> getOrganizations(
            Pageable pageable, String keyword, OrganizationType type, OrganizationStatus status) {
        
        Specification<Organization> spec = buildSpecification(keyword, type, status);
        Page<Organization> page = organizationRepository.findAll(spec, pageable);
        
        List<OrganizationListResponse> content = page.getContent().stream()
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
        
        return PageResponse.of(content, page.getNumber(), page.getSize(), page.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public OrganizationDetailResponse getOrganizationDetail(Long id) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new BusinessException("机构不存在"));
        
        return convertToDetailResponse(organization);
    }

    @Override
    public OrganizationDetailResponse createOrganization(OrganizationCreateRequest request) {
        // Check if organization code already exists
        if (organizationRepository.existsByOrgCode(request.getOrgCode())) {
            throw new BusinessException("机构代码已存在");
        }
        
        Organization organization = new Organization();
        BeanUtils.copyProperties(request, organization);
        organization.setStatus(OrganizationStatus.PENDING);
        organization.setApprovalStatus("PENDING");
        organization.setCurrentLoadPercentage(0);
        organization.setMembershipPaid(false);
        
        organization = organizationRepository.save(organization);
        log.info("Created organization: {}", organization.getOrgName());
        
        return convertToDetailResponse(organization);
    }

    @Override
    public OrganizationDetailResponse updateOrganization(Long id, OrganizationUpdateRequest request) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new BusinessException("机构不存在"));
        
        // Update fields
        if (StringUtils.hasText(request.getOrgName())) {
            organization.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getContactPerson())) {
            organization.setContactPerson(request.getContactPerson());
        }
        if (StringUtils.hasText(request.getContactPhone())) {
            organization.setContactPhone(request.getContactPhone());
        }
        if (StringUtils.hasText(request.getEmail())) {
            organization.setEmail(request.getEmail());
        }
        if (StringUtils.hasText(request.getAddress())) {
            organization.setAddress(request.getAddress());
        }
        if (StringUtils.hasText(request.getBusinessLicense())) {
            organization.setBusinessLicense(request.getBusinessLicense());
        }
        if (request.getTeamSize() != null) {
            organization.setTeamSize(request.getTeamSize());
        }
        if (request.getMonthlyCaseCapacity() != null) {
            organization.setMonthlyCaseCapacity(request.getMonthlyCaseCapacity());
        }
        if (request.getServiceRegions() != null) {
            organization.setServiceRegions(request.getServiceRegions());
        }
        if (request.getBusinessScopes() != null) {
            organization.setBusinessScopes(request.getBusinessScopes());
        }
        if (request.getDisposalTypes() != null) {
            organization.setDisposalTypes(request.getDisposalTypes());
        }
        if (request.getSettlementMethods() != null) {
            organization.setSettlementMethods(request.getSettlementMethods());
        }
        if (StringUtils.hasText(request.getCooperationCases())) {
            organization.setCooperationCases(request.getCooperationCases());
        }
        if (StringUtils.hasText(request.getDescription())) {
            organization.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getLegalRepresentative())) {
            organization.setLegalRepresentative(request.getLegalRepresentative());
        }
        if (request.getRegisteredCapital() != null) {
            organization.setRegisteredCapital(request.getRegisteredCapital());
        }
        if (request.getRegistrationDate() != null) {
            organization.setRegistrationDate(request.getRegistrationDate());
        }
        if (StringUtils.hasText(request.getQualificationDocuments())) {
            organization.setQualificationDocuments(request.getQualificationDocuments());
        }
        if (StringUtils.hasText(request.getBankAccount())) {
            organization.setBankAccount(request.getBankAccount());
        }
        if (StringUtils.hasText(request.getBankName())) {
            organization.setBankName(request.getBankName());
        }
        
        organization = organizationRepository.save(organization);
        log.info("Updated organization: {}", organization.getOrgName());
        
        return convertToDetailResponse(organization);
    }

    @Override
    public void deleteOrganization(Long id) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new BusinessException("机构不存在"));
        
        // Check if organization has users
        long userCount = userRepository.countByOrganizationId(id);
        if (userCount > 0) {
            throw new BusinessException("该机构下还有用户，无法删除");
        }
        
        organizationRepository.delete(organization);
        log.info("Deleted organization: {}", organization.getOrgName());
    }

    @Override
    public OrganizationDetailResponse approveOrganization(Long id, OrganizationApprovalRequest request) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new BusinessException("机构不存在"));
        
        if (organization.getStatus() != OrganizationStatus.PENDING) {
            throw new BusinessException("只能审核状态为'准入中'的机构");
        }
        
        OrganizationStatus oldStatus = organization.getStatus();
        
        organization.setStatus(OrganizationStatus.ACTIVE);
        organization.setApprovalStatus("APPROVED");
        organization.setApprovalBy(getCurrentUserId());
        organization.setApprovalAt(LocalDateTime.now());
        organization.setApprovalRemark(request.getRemark());
        
        // Set membership fee for disposal organizations
        if (organization.getType().name().contains("DISPOSAL") && request.getMembershipFee() != null) {
            organization.setMembershipFee(BigDecimal.valueOf(request.getMembershipFee()));
        }
        
        organization = organizationRepository.save(organization);
        
        // Record audit log
        auditService.logOrganizationApproval(organization, oldStatus, request.getRemark());
        
        log.info("Approved organization: {}", organization.getOrgName());
        
        return convertToDetailResponse(organization);
    }

    @Override
    public OrganizationDetailResponse rejectOrganization(Long id, OrganizationApprovalRequest request) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new BusinessException("机构不存在"));
        
        if (organization.getStatus() != OrganizationStatus.PENDING) {
            throw new BusinessException("只能审核状态为'准入中'的机构");
        }
        
        OrganizationStatus oldStatus = organization.getStatus();
        
        organization.setStatus(OrganizationStatus.REJECTED);
        organization.setApprovalStatus("REJECTED");
        organization.setApprovalBy(getCurrentUserId());
        organization.setApprovalAt(LocalDateTime.now());
        organization.setApprovalRemark(request.getRemark());
        
        organization = organizationRepository.save(organization);
        
        // Record audit log
        auditService.logOrganizationRejection(organization, oldStatus, request.getRemark());
        
        log.info("Rejected organization: {}", organization.getOrgName());
        
        return convertToDetailResponse(organization);
    }

    @Override
    public OrganizationDetailResponse suspendOrganization(Long id, String reason) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new BusinessException("机构不存在"));
        
        OrganizationStatus oldStatus = organization.getStatus();
        
        organization.setStatus(OrganizationStatus.SUSPENDED);
        organization.setApprovalRemark(reason);
        
        organization = organizationRepository.save(organization);
        
        // Record audit log
        auditService.logOrganizationSuspension(organization, oldStatus, reason);
        
        log.info("Suspended organization: {}", organization.getOrgName());
        
        return convertToDetailResponse(organization);
    }

    @Override
    public OrganizationDetailResponse activateOrganization(Long id) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new BusinessException("机构不存在"));
        
        OrganizationStatus oldStatus = organization.getStatus();
        
        organization.setStatus(OrganizationStatus.ACTIVE);
        
        organization = organizationRepository.save(organization);
        
        // Record audit log
        auditService.logOrganizationActivation(organization, oldStatus);
        
        log.info("Activated organization: {}", organization.getOrgName());
        
        return convertToDetailResponse(organization);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getOrganizationStatistics() {
        Map<String, Object> statistics = new HashMap<>();
        
        try {
            // Get basic organization counts by status
            long totalCount = organizationRepository.count();
            long pendingCount = organizationRepository.countByStatus(OrganizationStatus.PENDING);
            long activeCount = organizationRepository.countByStatus(OrganizationStatus.ACTIVE);
            long suspendedCount = organizationRepository.countByStatus(OrganizationStatus.SUSPENDED);
            long rejectedCount = organizationRepository.countByStatus(OrganizationStatus.REJECTED);
            
            statistics.put("total", totalCount);
            statistics.put("pending", pendingCount);
            statistics.put("approved", activeCount);  // For frontend compatibility
            statistics.put("active", activeCount);
            statistics.put("suspended", suspendedCount);
            statistics.put("rejected", rejectedCount);
            
            // Get audit statistics
            Map<String, Object> auditStats = auditService.getAuditStatistics();
            statistics.putAll(auditStats);
            
        } catch (Exception e) {
            log.error("Failed to get organization statistics", e);
            // Return default values on error
            statistics.put("total", 0L);
            statistics.put("pending", 0L);
            statistics.put("approved", 0L);
            statistics.put("active", 0L);
            statistics.put("suspended", 0L);
            statistics.put("rejected", 0L);
            statistics.put("todayPending", 0L);
            statistics.put("weekApproved", 0L);
        }
        
        return statistics;
    }

    private Specification<Organization> buildSpecification(String keyword, OrganizationType type, OrganizationStatus status) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (StringUtils.hasText(keyword)) {
                Predicate namePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("orgName")), 
                        "%" + keyword.toLowerCase() + "%");
                Predicate codePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("orgCode")), 
                        "%" + keyword.toLowerCase() + "%");
                predicates.add(criteriaBuilder.or(namePredicate, codePredicate));
            }
            
            if (type != null) {
                predicates.add(criteriaBuilder.equal(root.get("type"), type));
            }
            
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private OrganizationListResponse convertToListResponse(Organization organization) {
        OrganizationListResponse response = new OrganizationListResponse();
        BeanUtils.copyProperties(organization, response);
        response.setTypeName(organization.getType().getName());
        response.setStatusName(organization.getStatus().getName());
        return response;
    }

    private OrganizationDetailResponse convertToDetailResponse(Organization organization) {
        OrganizationDetailResponse response = new OrganizationDetailResponse();
        BeanUtils.copyProperties(organization, response);
        response.setTypeName(organization.getType().getName());
        response.setStatusName(organization.getStatus().getName());
        
        // Get approval user name if exists
        if (organization.getApprovalBy() != null) {
            userRepository.findById(organization.getApprovalBy())
                    .ifPresent(user -> response.setApprovalByName(user.getRealName()));
        }
        
        return response;
    }

    @Override
    public OrganizationDetailResponse updateMembershipPayment(Long id, String paymentMethod, 
                                                             String paymentReference, String remark) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new BusinessException("机构不存在"));
        
        if (!organization.getType().isDisposalOrg()) {
            throw new BusinessException("只有处置机构需要缴纳会员费");
        }
        
        organization.setPaymentMethod(paymentMethod);
        organization.setPaymentReference(paymentReference);
        organization.setPaymentDate(LocalDate.now());
        organization.setMembershipStatus("PAID");
        organization.setMembershipPaid(true);
        organization.setMembershipStartDate(LocalDate.now());
        organization.setMembershipEndDate(LocalDate.now().plusYears(1));
        
        organization = organizationRepository.save(organization);
        
        log.info("Updated membership payment for organization: {}", organization.getOrgName());
        
        return convertToDetailResponse(organization);
    }

    @Override
    public PageResponse<OrganizationListResponse> getPendingMembershipPayments(Pageable pageable) {
        // Get mediation centers with unpaid membership status as an example
        // In production, you might want a custom query for all disposal organizations
        Page<Organization> organizationPage = organizationRepository.findByTypeAndMembershipStatus(
                OrganizationType.MEDIATION_CENTER, "UNPAID", pageable);
        
        List<OrganizationListResponse> responses = organizationPage.getContent().stream()
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
        
        return PageResponse.of(
                responses,
                pageable.getPageNumber(),
                pageable.getPageSize(),
                organizationPage.getTotalElements()
        );
    }

    private Long getCurrentUserId() {
        // In development mode, return a default user ID
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if ("admin".equals(username)) {
            return 1L; // Default admin user ID
        }
        
        // In production, get actual user ID from security context
        return userRepository.findByUsername(username)
                .map(User::getId)
                .orElse(1L);
    }
}