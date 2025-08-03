package com.drmp.dto.request;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.Pattern;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 报表查询请求DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ReportQueryRequest extends BasePageRequest {

    private Long organizationId;
    
    private String organizationType;
    
    private LocalDateTime startDate;
    
    private LocalDateTime endDate;
    
    @Pattern(regexp = "^(day|week|month|quarter|year)$", message = "时间维度必须是day、week、month、quarter或year")
    private String timeDimension = "day";
    
    private List<String> metrics;
    
    private List<String> dimensions;
    
    private String region;
    
    private List<String> caseTypes;
    
    private List<String> disposalMethods;
    
    private Double minAmount;
    
    private Double maxAmount;
    
    private Integer minOverdueDays;
    
    private Integer maxOverdueDays;
    
    private List<String> caseStatuses;
    
    private List<String> packageStatuses;
    
    private String groupBy;
    
    private String aggregateBy;
    
    private Boolean includeSubOrgs;
    
    private Boolean realTimeData;
    
    private String chartType;
    
    private String exportFormat;
    
    private Boolean enableCache;
    
    private Integer cacheTimeout;
}