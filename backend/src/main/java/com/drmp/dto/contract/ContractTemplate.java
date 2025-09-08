package com.drmp.dto.contract;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 合同模板
 *
 * @author DRMP Team
 */
@Data
public class ContractTemplate {
    
    /**
     * 模板ID
     */
    private Long id;
    
    /**
     * 模板名称
     */
    private String name;
    
    /**
     * 业务类型
     */
    private String businessType; // CASE_DISPOSAL, CONFIDENTIALITY, SERVICE
    
    /**
     * 模板描述
     */
    private String description;
    
    /**
     * 模板内容
     */
    private String content;
    
    /**
     * 模板状态
     */
    private String status = "ACTIVE"; // ACTIVE, INACTIVE, DRAFT
    
    /**
     * 模板版本
     */
    private String version = "1.0";
    
    /**
     * 支持的签署方类型
     */
    private List<String> supportedSignatoryTypes; // ORGANIZATION, USER
    
    /**
     * 模板变量定义
     */
    private List<TemplateVariable> variables;
    
    /**
     * 模板标签
     */
    private List<String> tags;
    
    /**
     * 创建人ID
     */
    private Long createdBy;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
    
    /**
     * 使用次数统计
     */
    private Integer usageCount = 0;
    
    /**
     * 是否为系统内置模板
     */
    private boolean isSystemTemplate = false;
    
    /**
     * 扩展属性
     */
    private Map<String, Object> extraProperties;
    
    /**
     * 模板变量定义
     */
    @Data
    public static class TemplateVariable {
        /**
         * 变量名
         */
        private String name;
        
        /**
         * 变量类型
         */
        private String type; // STRING, NUMBER, DATE, BOOLEAN
        
        /**
         * 变量描述
         */
        private String description;
        
        /**
         * 是否必填
         */
        private boolean required = false;
        
        /**
         * 默认值
         */
        private String defaultValue;
        
        /**
         * 验证规则
         */
        private String validationRule;
        
        /**
         * 可选值列表（枚举类型使用）
         */
        private List<String> options;
    }
}