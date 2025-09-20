package com.drmp.entity.enums;

/**
 * 批量操作状态枚举
 *
 * @author DRMP Team
 * @since 1.0.0
 */
public enum BatchOperationStatus {
    /**
     * 待执行
     */
    PENDING("待执行"),

    /**
     * 处理中
     */
    PROCESSING("处理中"),

    /**
     * 已完成
     */
    COMPLETED("已完成"),

    /**
     * 部分成功
     */
    PARTIAL_SUCCESS("部分成功"),

    /**
     * 失败
     */
    FAILED("失败"),

    /**
     * 已取消
     */
    CANCELLED("已取消");

    private final String description;

    BatchOperationStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}