package com.drmp.controller;

import com.drmp.dto.ApiResponse;
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
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Development Controller - Bypasses authentication for testing
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/v1/dev")
@RequiredArgsConstructor
public class DevController {

    private final OrganizationService organizationService;

    /**
     * Get organization list without authentication (for development)
     */
    @GetMapping("/organizations")
    public ResponseEntity<ApiResponse<PageResponse<OrganizationListResponse>>> getOrganizations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) OrganizationType type,
            @RequestParam(required = false) OrganizationStatus status) {
        
        log.info("DEV: Getting organizations with page={}, size={}, keyword={}, type={}, status={}", 
                page, size, keyword, type, status);
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        PageResponse<OrganizationListResponse> result = organizationService.getOrganizations(
                pageable, keyword, type, status);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * Get organization statistics without authentication (for development)
     */
    @GetMapping("/organizations/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOrganizationStatistics() {
        log.info("DEV: Getting organization statistics");
        
        Map<String, Object> statistics = organizationService.getOrganizationStatistics();
        return ResponseEntity.ok(ApiResponse.success(statistics));
    }
}