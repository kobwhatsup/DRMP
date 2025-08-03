package com.drmp.dto.request;

import lombok.Data;
import lombok.EqualsAndHashCode;

import javax.validation.constraints.Min;
import java.time.LocalDateTime;

/**
 * 案件进度查询请求DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class CaseProgressQueryRequest extends BasePageRequest {

    private Long caseId;
    
    private Long casePackageId;
    
    private Long organizationId;
    
    private String progressType;
    
    private String keyword;
    
    private LocalDateTime startDate;
    
    private LocalDateTime endDate;
    
    private Boolean isKeyMilestone;
    
    private String handlerName;
    
    private String syncSource;
    
    private String status;
    
    private Boolean unreadOnly;
    
    @Min(value = 0, message = "最小进度百分比不能小于0")
    private Double minProgressPercentage;
    
    @Min(value = 0, message = "最大进度百分比不能小于0")
    private Double maxProgressPercentage;
}