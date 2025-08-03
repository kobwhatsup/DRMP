package com.drmp.controller;

import com.drmp.dto.request.OrganizationApprovalRequest;
import com.drmp.dto.request.OrganizationCreateRequest;
import com.drmp.dto.request.OrganizationUpdateRequest;
import com.drmp.dto.response.ApiResponse;
import com.drmp.dto.response.OrganizationDetailResponse;
import com.drmp.dto.response.OrganizationListResponse;
import com.drmp.dto.response.PageResponse;
import com.drmp.entity.enums.OrganizationStatus;
import com.drmp.entity.enums.OrganizationType;
import com.drmp.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Map;

/**
 * Organization Management Controller
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/v1/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    /**
     * Get organization list with pagination and filtering
     */
    @GetMapping
    @PreAuthorize("hasAuthority('organization:read')")
    public ResponseEntity<ApiResponse<PageResponse<OrganizationListResponse>>> getOrganizations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) OrganizationType type,
            @RequestParam(required = false) OrganizationStatus status) {
        
        log.info("Getting organizations with page={}, size={}, keyword={}, type={}, status={}", 
                page, size, keyword, type, status);
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        PageResponse<OrganizationListResponse> result = organizationService.getOrganizations(
                pageable, keyword, type, status);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * Get organization detail by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('organization:read')")
    public ResponseEntity<ApiResponse<OrganizationDetailResponse>> getOrganization(@PathVariable Long id) {
        log.info("Getting organization detail for id={}", id);
        
        OrganizationDetailResponse organization = organizationService.getOrganizationDetail(id);
        return ResponseEntity.ok(ApiResponse.success(organization));
    }

    /**
     * Create new organization
     */
    @PostMapping
    @PreAuthorize("hasAuthority('organization:create')")
    public ResponseEntity<ApiResponse<OrganizationDetailResponse>> createOrganization(
            @Valid @RequestBody OrganizationCreateRequest request) {
        log.info("Creating organization with name={}, type={}", request.getOrgName(), request.getType());
        
        OrganizationDetailResponse organization = organizationService.createOrganization(request);
        return ResponseEntity.ok(ApiResponse.success(organization));
    }

    /**
     * Update organization
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('organization:update')")
    public ResponseEntity<ApiResponse<OrganizationDetailResponse>> updateOrganization(
            @PathVariable Long id,
            @Valid @RequestBody OrganizationUpdateRequest request) {
        log.info("Updating organization id={}", id);
        
        OrganizationDetailResponse organization = organizationService.updateOrganization(id, request);
        return ResponseEntity.ok(ApiResponse.success(organization));
    }

    /**
     * Delete organization
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('organization:delete')")
    public ResponseEntity<ApiResponse<Void>> deleteOrganization(@PathVariable Long id) {
        log.info("Deleting organization id={}", id);
        
        organizationService.deleteOrganization(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * Get organization applications (pending approval)
     */
    @GetMapping("/applications")
    @PreAuthorize("hasAuthority('organization:read')")
    public ResponseEntity<ApiResponse<PageResponse<OrganizationListResponse>>> getApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        log.info("Getting organization applications with page={}, size={}", page, size);
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        PageResponse<OrganizationListResponse> result = organizationService.getOrganizations(
                pageable, null, null, OrganizationStatus.PENDING);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * Approve organization
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('organization:approve')")
    public ResponseEntity<ApiResponse<OrganizationDetailResponse>> approveOrganization(
            @PathVariable Long id,
            @Valid @RequestBody OrganizationApprovalRequest request) {
        log.info("Approving organization id={}", id);
        
        OrganizationDetailResponse organization = organizationService.approveOrganization(id, request);
        return ResponseEntity.ok(ApiResponse.success(organization));
    }

    /**
     * Reject organization
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('organization:approve')")
    public ResponseEntity<ApiResponse<OrganizationDetailResponse>> rejectOrganization(
            @PathVariable Long id,
            @Valid @RequestBody OrganizationApprovalRequest request) {
        log.info("Rejecting organization id={}", id);
        
        OrganizationDetailResponse organization = organizationService.rejectOrganization(id, request);
        return ResponseEntity.ok(ApiResponse.success(organization));
    }

    /**
     * Suspend organization
     */
    @PostMapping("/{id}/suspend")
    @PreAuthorize("hasAuthority('organization:update')")
    public ResponseEntity<ApiResponse<OrganizationDetailResponse>> suspendOrganization(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        log.info("Suspending organization id={}", id);
        
        OrganizationDetailResponse organization = organizationService.suspendOrganization(id, reason);
        return ResponseEntity.ok(ApiResponse.success(organization));
    }

    /**
     * Activate organization
     */
    @PostMapping("/{id}/activate")
    @PreAuthorize("hasAuthority('organization:update')")
    public ResponseEntity<ApiResponse<OrganizationDetailResponse>> activateOrganization(@PathVariable Long id) {
        log.info("Activating organization id={}", id);
        
        OrganizationDetailResponse organization = organizationService.activateOrganization(id);
        return ResponseEntity.ok(ApiResponse.success(organization));
    }

    /**
     * Get organization statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAuthority('organization:read')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOrganizationStatistics() {
        log.info("Getting organization statistics");
        
        Map<String, Object> statistics = organizationService.getOrganizationStatistics();
        return ResponseEntity.ok(ApiResponse.success(statistics));
    }

    /**
     * Update membership payment status
     */
    @PostMapping("/{id}/membership/payment")
    @PreAuthorize("hasAuthority('organization:update')")
    public ResponseEntity<ApiResponse<OrganizationDetailResponse>> updateMembershipPayment(
            @PathVariable Long id,
            @RequestParam String paymentMethod,
            @RequestParam String paymentReference,
            @RequestParam(required = false) String remark) {
        log.info("Updating membership payment for organization id={}", id);
        
        OrganizationDetailResponse organization = organizationService.updateMembershipPayment(
                id, paymentMethod, paymentReference, remark);
        return ResponseEntity.ok(ApiResponse.success(organization));
    }

    /**
     * Get organizations pending membership payment
     */
    @GetMapping("/membership/pending")
    @PreAuthorize("hasAuthority('organization:read')")
    public ResponseEntity<ApiResponse<PageResponse<OrganizationListResponse>>> getPendingMembershipPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        log.info("Getting organizations pending membership payment with page={}, size={}", page, size);
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        PageResponse<OrganizationListResponse> result = organizationService.getPendingMembershipPayments(pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}