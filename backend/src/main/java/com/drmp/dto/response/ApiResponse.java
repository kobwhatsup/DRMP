package com.drmp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 统一API响应结果
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    private int code;
    private String message;
    private T data;
    private long timestamp;

    public ApiResponse(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.timestamp = System.currentTimeMillis();
    }

    /**
     * 成功响应
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(200, "操作成功", data);
    }

    /**
     * 成功响应带消息
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(200, message, data);
    }

    /**
     * 成功响应无数据
     */
    public static ApiResponse<Void> successWithMessage(String message) {
        return new ApiResponse<>(200, message, null);
    }

    /**
     * 成功响应无数据无消息
     */
    public static ApiResponse<Void> success() {
        return new ApiResponse<>(200, "操作成功", null);
    }

    /**
     * 错误响应
     */
    public static <T> ApiResponse<T> error(int code, String message) {
        return new ApiResponse<>(code, message, null);
    }

    /**
     * 错误响应
     */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(500, message, null);
    }
    
    /**
     * 错误响应带数据
     */
    public static <T> ApiResponse<T> error(String message, T data) {
        return new ApiResponse<>(400, message, data);
    }
    
    /**
     * 错误响应带代码、消息和数据
     */
    public static <T> ApiResponse<T> error(int code, String message, T data) {
        return new ApiResponse<>(code, message, data);
    }
}