package com.drmp.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * Assignment Recommendation Response DTO
 * 分案推荐响应
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
public class AssignmentRecommendationResponse {

    private Long organizationId;
    
    private String organizationName;
    
    private String organizationType;
    
    private Double matchScore;
    
    private Integer ranking;
    
    private Double regionMatchScore;
    
    private Double capacityScore;
    
    private Double experienceScore;
    
    private Double performanceScore;
    
    private Integer currentLoad;
    
    private Integer maxCapacity;
    
    private BigDecimal totalHandledAmount;
    
    private Integer totalHandledCases;
    
    private Double averageRecoveryRate;
    
    private Double averageProcessingDays;
    
    private List<String> serviceRegions;
    
    private List<String> businessScopes;
    
    private List<String> strengths;
    
    private List<String> concerns;
    
    private String recommendation;
    
    private String contactPerson;
    
    private String contactPhone;
    
    private String contactEmail;
    
    private String assignmentStrategy;
    
    private Integer rank;
}