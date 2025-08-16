package com.drmp.validation;

import com.drmp.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 全局验证处理器
 * 统一处理所有输入验证错误和类型转换错误
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@RestControllerAdvice
public class GlobalValidationHandler {

    /**
     * 处理请求体验证错误 (@Valid/@Validated)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        
        log.warn("Validation failed for request: {}", ex.getParameter().getMethod().getName());
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        return ResponseEntity.badRequest()
            .body(ApiResponse.error("输入验证失败", errors));
    }

    /**
     * 处理方法参数验证错误 (路径参数、查询参数等)
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleConstraintViolation(
            ConstraintViolationException ex) {
        
        log.warn("Constraint violation: {}", ex.getMessage());
        
        Map<String, String> errors = ex.getConstraintViolations()
            .stream()
            .collect(Collectors.toMap(
                violation -> extractFieldName(violation.getPropertyPath().toString()),
                ConstraintViolation::getMessage,
                (existing, replacement) -> existing
            ));

        return ResponseEntity.badRequest()
            .body(ApiResponse.error("参数验证失败", errors));
    }

    /**
     * 处理参数类型转换错误
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex) {
        
        log.warn("Type mismatch for parameter '{}': {} cannot be converted to {}", 
            ex.getName(), ex.getValue(), ex.getRequiredType().getSimpleName());
        
        Map<String, String> errors = Map.of(
            ex.getName(), 
            String.format("参数值 '%s' 无法转换为 %s 类型", 
                ex.getValue(), 
                getChineseTypeName(ex.getRequiredType().getSimpleName()))
        );

        return ResponseEntity.badRequest()
            .body(ApiResponse.error("参数类型错误", errors));
    }

    /**
     * 处理数字格式错误
     */
    @ExceptionHandler(NumberFormatException.class)
    public ResponseEntity<ApiResponse<String>> handleNumberFormatException(
            NumberFormatException ex) {
        
        log.warn("Number format error: {}", ex.getMessage());
        
        return ResponseEntity.badRequest()
            .body(ApiResponse.error("数字格式错误：请输入有效的数字"));
    }

    /**
     * 处理非法参数异常
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<String>> handleIllegalArgument(
            IllegalArgumentException ex) {
        
        log.warn("Illegal argument: {}", ex.getMessage());
        
        return ResponseEntity.badRequest()
            .body(ApiResponse.error("参数错误：" + ex.getMessage()));
    }

    /**
     * 从属性路径中提取字段名
     */
    private String extractFieldName(String propertyPath) {
        // 处理类似 "methodName.parameterName" 的路径
        String[] parts = propertyPath.split("\\.");
        return parts[parts.length - 1];
    }

    /**
     * 获取中文类型名称
     */
    private String getChineseTypeName(String javaTypeName) {
        switch (javaTypeName.toLowerCase()) {
            case "long":
                return "整数";
            case "integer":
            case "int":
                return "整数";
            case "double":
                return "小数";
            case "float":
                return "小数";
            case "boolean":
                return "布尔值";
            case "string":
                return "字符串";
            case "date":
                return "日期";
            case "localdatetime":
                return "日期时间";
            case "localdate":
                return "日期";
            case "bigdecimal":
                return "数值";
            default:
                return javaTypeName;
        }
    }
}