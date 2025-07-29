package com.drmp.entity.enums;

/**
 * 合同状态枚举
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public enum ContractStatus {
    
    DRAFT("草稿", "合同草稿状态"),
    PENDING_REVIEW("待审核", "等待审核"),
    REVIEWING("审核中", "正在审核"),
    APPROVED("已批准", "已通过审核"),
    REJECTED("已拒绝", "审核被拒绝"),
    PENDING_SIGNATURE("待签署", "等待签署"),
    PARTIALLY_SIGNED("部分签署", "部分当事人已签署"),
    FULLY_SIGNED("已签署", "所有当事人已签署"),
    EFFECTIVE("生效", "合同生效"),
    SUSPENDED("暂停", "合同暂停执行"),
    TERMINATED("终止", "合同终止"),
    EXPIRED("已过期", "合同已过期"),
    CANCELLED("已取消", "合同已取消");
    
    private final String displayName;
    private final String description;
    
    ContractStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    /**
     * 判断是否为终态状态
     */
    public boolean isFinalStatus() {
        return this == TERMINATED || this == EXPIRED || this == CANCELLED;
    }
    
    /**
     * 判断是否为有效状态
     */
    public boolean isActiveStatus() {
        return this == EFFECTIVE || this == SUSPENDED;
    }
    
    /**
     * 判断是否需要签署
     */
    public boolean needsSignature() {
        return this == PENDING_SIGNATURE || this == PARTIALLY_SIGNED;
    }
}