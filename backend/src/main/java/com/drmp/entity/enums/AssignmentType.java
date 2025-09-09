package com.drmp.entity.enums;

/**
 * 分案类型枚举
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public enum AssignmentType {
    /**
     * 手动分配
     */
    MANUAL("手动分配"),
    
    /**
     * 竞标模式
     */
    BIDDING("竞标模式"),
    
    /**
     * 智能分案
     */
    SMART("智能分案"),
    
    /**
     * 指定分配
     */
    DESIGNATED("指定分配");
    
    private final String description;
    
    AssignmentType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}