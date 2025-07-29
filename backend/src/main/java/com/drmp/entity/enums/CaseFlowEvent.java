package com.drmp.entity.enums;

/**
 * 案件流转事件枚举
 * 定义案件生命周期中的各种事件
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public enum CaseFlowEvent {
    
    // 案件包级别事件
    PACKAGE_CREATED("包创建", "案件包被创建"),
    PACKAGE_PUBLISHED("包发布", "案件包发布到市场"),
    PACKAGE_WITHDRAWN("包撤回", "案件包从市场撤回"),
    PACKAGE_ASSIGNED("包分配", "案件包分配给处置机构"),
    PACKAGE_ACCEPTED("包接受", "处置机构接受案件包"),
    PACKAGE_REJECTED("包拒绝", "处置机构拒绝案件包"),
    PACKAGE_STARTED("包开始", "开始处置案件包"),
    PACKAGE_COMPLETED("包完成", "案件包处置完成"),
    PACKAGE_CANCELLED("包取消", "案件包被取消"),
    
    // 个案级别事件
    CASE_ASSIGNED("案件分配", "个案分配给具体处理人"),
    CASE_CONTACTED("首次联系", "首次联系债务人"),
    CASE_NEGOTIATING("协商中", "与债务人协商还款"),
    CASE_AGREEMENT_REACHED("达成协议", "与债务人达成还款协议"),
    CASE_PAYMENT_RECEIVED("收到还款", "收到债务人还款"),
    CASE_LITIGATION_FILED("提起诉讼", "向法院提起诉讼"),
    CASE_JUDGMENT_OBTAINED("获得判决", "法院判决胜诉"),
    CASE_ENFORCEMENT_STARTED("强制执行", "申请强制执行"),
    CASE_CLOSED_SETTLED("结案-和解", "通过和解方式结案"),
    CASE_CLOSED_PAID("结案-还款", "债务人全额还款结案"),
    CASE_CLOSED_UNCOLLECTIBLE("结案-呆账", "确认为呆账结案"),
    
    // 协议和合同事件
    CONTRACT_SIGNED("合同签署", "委托处置合同签署"),
    CONTRACT_TERMINATED("合同终止", "委托处置合同终止"),
    AGREEMENT_SIGNED("协议签署", "还款协议签署"),
    AGREEMENT_BREACHED("协议违约", "债务人违反还款协议"),
    
    // 财务事件
    PAYMENT_MADE("款项支付", "向案源机构支付回款"),
    FEE_CALCULATED("费用计算", "计算处置费用"),
    COMMISSION_PAID("佣金支付", "支付处置佣金"),
    
    // 系统事件
    DEADLINE_APPROACHING("期限临近", "处置期限即将到期"),
    DEADLINE_EXCEEDED("超期", "超过处置期限"),
    DATA_UPDATED("数据更新", "案件数据更新"),
    NOTE_ADDED("添加备注", "添加处置备注"),
    FILE_UPLOADED("文件上传", "上传相关文件");
    
    private final String displayName;
    private final String description;
    
    CaseFlowEvent(String displayName, String description) {
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
     * 判断是否为案件包级别事件
     */
    public boolean isPackageEvent() {
        return this.name().startsWith("PACKAGE_");
    }
    
    /**
     * 判断是否为个案级别事件
     */
    public boolean isCaseEvent() {
        return this.name().startsWith("CASE_");
    }
    
    /**
     * 判断是否为合同协议事件
     */
    public boolean isContractEvent() {
        return this.name().startsWith("CONTRACT_") || this.name().startsWith("AGREEMENT_");
    }
    
    /**
     * 判断是否为财务事件
     */
    public boolean isFinancialEvent() {
        return this.name().contains("PAYMENT") || this.name().contains("FEE") || this.name().contains("COMMISSION");
    }
    
    /**
     * 判断是否为系统事件
     */
    public boolean isSystemEvent() {
        return this.name().startsWith("DEADLINE_") || this.name().contains("DATA_") || 
               this.name().contains("NOTE_") || this.name().contains("FILE_");
    }
}