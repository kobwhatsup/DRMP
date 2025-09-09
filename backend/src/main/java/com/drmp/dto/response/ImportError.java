package com.drmp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Import Error DTO
 * 导入错误信息
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportError {
    
    /**
     * Row number in the Excel file
     * Excel文件中的行号
     */
    private Integer rowNumber;
    
    /**
     * Column name where error occurred
     * 发生错误的列名
     */
    private String columnName;
    
    /**
     * The value that caused the error
     * 导致错误的值
     */
    private String errorValue;
    
    /**
     * Error message
     * 错误信息
     */
    private String errorMessage;
    
    /**
     * Error type (VALIDATION, FORMAT, DUPLICATE, etc.)
     * 错误类型
     */
    private String errorType;
}