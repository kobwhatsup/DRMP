package com.drmp.entity.enums;

/**
 * 合同类型枚举
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public enum ContractType {
    
    DISPOSAL_CONTRACT("委托处置合同", "案源机构与处置机构的委托处置合同"),
    PAYMENT_AGREEMENT("还款协议", "处置机构与债务人的还款协议"),
    SETTLEMENT_AGREEMENT("和解协议", "涉及和解的协议"),
    SERVICE_AGREEMENT("服务协议", "提供服务的相关协议"),
    CONFIDENTIALITY_AGREEMENT("保密协议", "保密条款协议"),
    FRAMEWORK_AGREEMENT("框架协议", "长期合作框架协议"),
    SUPPLEMENTARY_AGREEMENT("补充协议", "对主合同的补充"),
    TERMINATION_AGREEMENT("终止协议", "合同终止协议");
    
    private final String displayName;
    private final String description;
    
    ContractType(String displayName, String description) {
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
     * 判断是否为主要合同类型
     */
    public boolean isPrimaryContract() {
        return this == DISPOSAL_CONTRACT || this == FRAMEWORK_AGREEMENT;
    }
    
    /**
     * 判断是否为协议类型
     */
    public boolean isAgreementType() {
        return this == PAYMENT_AGREEMENT || this == SETTLEMENT_AGREEMENT || 
               this == SERVICE_AGREEMENT || this == CONFIDENTIALITY_AGREEMENT;
    }
}