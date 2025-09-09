package com.drmp.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

/**
 * 预警处理请求DTO
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertActionRequest {
    
    /**
     * 预警ID
     */
    @NotBlank(message = "预警ID不能为空")
    private String alertId;
    
    /**
     * 处理动作
     * ACKNOWLEDGE - 确认
     * RESOLVE - 解决
     * CLOSE - 关闭
     * ESCALATE - 升级
     * REOPEN - 重新打开
     */
    @NotNull(message = "处理动作不能为空")
    private String action;
    
    /**
     * 处理备注
     */
    private String comment;
    
    /**
     * 解决方案（当action为RESOLVE时）
     */
    private String resolution;
    
    /**
     * 升级目标（当action为ESCALATE时）
     */
    private String escalateTo;
}