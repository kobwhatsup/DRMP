package com.drmp.dto.response;

import com.drmp.entity.enums.OrganizationStatus;
import com.drmp.entity.enums.OrganizationType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * Organization List Response DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
public class OrganizationListResponse {

    private Long id;
    private String orgCode;
    private String orgName;
    private OrganizationType type;
    private String typeName;
    private OrganizationStatus status;
    private String statusName;
    private String contactPerson;
    private String contactPhone;
    private String email;
    private String address;
    private Integer teamSize;
    private Integer monthlyCaseCapacity;
    private Integer currentLoadPercentage;
    private String registrationType;
    private Set<String> serviceRegions;
    private Set<String> businessScopes;
    private Set<String> disposalTypes;
    private Set<String> settlementMethods;
    private LocalDateTime createdAt;
    private LocalDateTime approvalAt;
    private String approvalBy;
    private Boolean membershipPaid;
}