package com.drmp.dto.response;

import com.drmp.entity.enums.OrganizationStatus;
import com.drmp.entity.enums.OrganizationType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * Organization Detail Response DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
public class OrganizationDetailResponse {

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
    private String businessLicense;
    private Integer teamSize;
    private Integer monthlyCaseCapacity;
    private Integer currentLoadPercentage;
    private Set<String> serviceRegions;
    private Set<String> businessScopes;
    private Set<String> disposalTypes;
    private Set<String> settlementMethods;
    private String cooperationCases;
    private String description;
    private String approvalStatus;
    private Long approvalBy;
    private String approvalByName;
    private LocalDateTime approvalAt;
    private String approvalRemark;
    private Double membershipFee;
    private Boolean membershipPaid;
    private LocalDateTime membershipPaidAt;
    private String registrationType;
    private String legalRepresentative;
    private Double registeredCapital;
    private LocalDateTime registrationDate;
    private String qualificationDocuments;
    private String bankAccount;
    private String bankName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}