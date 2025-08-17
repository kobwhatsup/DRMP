package com.drmp.dto.request;

import lombok.Data;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;

/**
 * 批量案件操作请求DTO
 */
@Data
public class BatchCaseActionRequest {

    @NotEmpty(message = "案件ID列表不能为空")
    private List<Long> caseIds;

    @NotNull(message = "操作类型不能为空")
    private ActionType actionType;

    @Size(max = 500, message = "操作原因长度不能超过500字符")
    private String reason;

    @Size(max = 1000, message = "备注长度不能超过1000字符")
    private String remark;

    private String newStatus;

    private String newAssignee;

    /**
     * 批量操作类型
     */
    public enum ActionType {
        RETURN("退案"),
        RETAIN("留案"),
        STATUS_UPDATE("状态更新"),
        ASSIGN("分配"),
        CLOSE("结案");

        private final String description;

        ActionType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}