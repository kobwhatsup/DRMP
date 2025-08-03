package com.drmp.entity.enums;

/**
 * 导入状态枚举
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public enum ImportStatus {
    /**
     * 上传中
     */
    UPLOADING("上传中"),
    
    /**
     * 验证中
     */
    VALIDATING("验证中"),
    
    /**
     * 导入中
     */
    IMPORTING("导入中"),
    
    /**
     * 导入成功
     */
    SUCCESS("导入成功"),
    
    /**
     * 导入失败
     */
    FAILED("导入失败"),
    
    /**
     * 部分成功
     */
    PARTIAL_SUCCESS("部分成功");

    private final String description;

    ImportStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}