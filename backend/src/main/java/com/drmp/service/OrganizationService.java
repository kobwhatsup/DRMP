package com.drmp.service;

import com.drmp.dto.request.OrganizationApprovalRequest;
import com.drmp.dto.request.OrganizationCreateRequest;
import com.drmp.dto.request.OrganizationUpdateRequest;
import com.drmp.dto.response.OrganizationDetailResponse;
import com.drmp.dto.response.OrganizationListResponse;
import com.drmp.dto.response.PageResponse;
import com.drmp.entity.enums.OrganizationStatus;
import com.drmp.entity.enums.OrganizationType;
import org.springframework.data.domain.Pageable;

import java.util.Map;

/**
 * Organization Service Interface
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public interface OrganizationService {

    /**
     * Get organizations with pagination and filtering
     */
    PageResponse<OrganizationListResponse> getOrganizations(
        Pageable pageable, String keyword, OrganizationType type, OrganizationStatus status);

    /**
     * Get organization detail by ID
     */
    OrganizationDetailResponse getOrganizationDetail(Long id);

    /**
     * Create new organization
     */
    OrganizationDetailResponse createOrganization(OrganizationCreateRequest request);

    /**
     * Update organization
     */
    OrganizationDetailResponse updateOrganization(Long id, OrganizationUpdateRequest request);

    /**
     * Delete organization
     */
    void deleteOrganization(Long id);

    /**
     * Approve organization
     */
    OrganizationDetailResponse approveOrganization(Long id, OrganizationApprovalRequest request);

    /**
     * Reject organization
     */
    OrganizationDetailResponse rejectOrganization(Long id, OrganizationApprovalRequest request);

    /**
     * Suspend organization
     */
    OrganizationDetailResponse suspendOrganization(Long id, String reason);

    /**
     * Activate organization
     */
    OrganizationDetailResponse activateOrganization(Long id);

    /**
     * Get organization statistics
     */
    Map<String, Object> getOrganizationStatistics();

    /**
     * Update membership payment status
     */
    OrganizationDetailResponse updateMembershipPayment(Long id, String paymentMethod, 
                                                      String paymentReference, String remark);

    /**
     * Get organizations pending membership payment
     */
    PageResponse<OrganizationListResponse> getPendingMembershipPayments(Pageable pageable);
}