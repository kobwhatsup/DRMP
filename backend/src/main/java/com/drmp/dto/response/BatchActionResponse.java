package com.drmp.dto.response;

import lombok.Data;

import java.util.List;

/**
 * 批量操作响应DTO
 */
@Data
public class BatchActionResponse {

    private Integer total;
    private Integer successful;
    private Integer failed;
    private List<Long> successfulCaseIds;
    private List<FailedAction> failedActions;

    @Data
    public static class FailedAction {
        private Long caseId;
        private String reason;
        private String errorMessage;
    }
}