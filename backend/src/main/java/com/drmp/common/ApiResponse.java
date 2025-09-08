package com.drmp.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

/**
 * API统一响应格式
 * 
 * @param <T> 响应数据类型
 * @author DRMP Team
 */
@Schema(description = "API统一响应格式")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    @Schema(description = "是否成功", example = "true")
    private boolean success;

    @Schema(description = "响应码", example = "200")
    private int code;

    @Schema(description = "响应消息", example = "操作成功")
    private String message;

    @Schema(description = "响应数据")
    private T data;

    @Schema(description = "响应时间戳", example = "1638360000000")
    private long timestamp;

    // ==================== 构造函数 ====================

    public ApiResponse() {
        this.timestamp = System.currentTimeMillis();
    }

    public ApiResponse(boolean success, int code, String message) {
        this();
        this.success = success;
        this.code = code;
        this.message = message;
    }

    public ApiResponse(boolean success, int code, String message, T data) {
        this();
        this.success = success;
        this.code = code;
        this.message = message;
        this.data = data;
    }

    // ==================== 静态工厂方法 ====================

    /**
     * 成功响应
     *
     * @return 成功响应
     */
    public static <T> ApiResponse<T> success() {
        return new ApiResponse<>(true, 200, "操作成功");
    }

    /**
     * 成功响应
     *
     * @param data 响应数据
     * @return 成功响应
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, 200, "操作成功", data);
    }

    /**
     * 成功响应
     *
     * @param data    响应数据
     * @param message 响应消息
     * @return 成功响应
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, 200, message, data);
    }

    /**
     * 成功响应
     *
     * @param message 响应消息
     * @return 成功响应
     */
    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(true, 200, message);
    }

    /**
     * 错误响应
     *
     * @param code    错误码
     * @param message 错误消息
     * @return 错误响应
     */
    public static <T> ApiResponse<T> error(int code, String message) {
        return new ApiResponse<>(false, code, message);
    }

    /**
     * 错误响应
     *
     * @param code    错误码
     * @param message 错误消息
     * @param data    错误数据
     * @return 错误响应
     */
    public static <T> ApiResponse<T> error(int code, String message, T data) {
        return new ApiResponse<>(false, code, message, data);
    }

    /**
     * 错误响应
     *
     * @param errorCode 错误枚举
     * @return 错误响应
     */
    public static <T> ApiResponse<T> error(ErrorCode errorCode) {
        return new ApiResponse<>(false, errorCode.getCode(), errorCode.getMessage());
    }

    /**
     * 错误响应
     *
     * @param errorCode 错误枚举
     * @param data      错误数据
     * @return 错误响应
     */
    public static <T> ApiResponse<T> error(ErrorCode errorCode, T data) {
        return new ApiResponse<>(false, errorCode.getCode(), errorCode.getMessage(), data);
    }

    /**
     * 系统错误响应
     *
     * @return 系统错误响应
     */
    public static <T> ApiResponse<T> systemError() {
        return error(500, "系统内部错误");
    }

    /**
     * 系统错误响应
     *
     * @param message 错误消息
     * @return 系统错误响应
     */
    public static <T> ApiResponse<T> systemError(String message) {
        return error(500, message);
    }

    /**
     * 参数错误响应
     *
     * @param message 错误消息
     * @return 参数错误响应
     */
    public static <T> ApiResponse<T> badRequest(String message) {
        return error(400, message);
    }

    /**
     * 未授权响应
     *
     * @return 未授权响应
     */
    public static <T> ApiResponse<T> unauthorized() {
        return error(401, "未授权访问");
    }

    /**
     * 未授权响应
     *
     * @param message 错误消息
     * @return 未授权响应
     */
    public static <T> ApiResponse<T> unauthorized(String message) {
        return error(401, message);
    }

    /**
     * 权限不足响应
     *
     * @return 权限不足响应
     */
    public static <T> ApiResponse<T> forbidden() {
        return error(403, "权限不足");
    }

    /**
     * 权限不足响应
     *
     * @param message 错误消息
     * @return 权限不足响应
     */
    public static <T> ApiResponse<T> forbidden(String message) {
        return error(403, message);
    }

    /**
     * 资源不存在响应
     *
     * @return 资源不存在响应
     */
    public static <T> ApiResponse<T> notFound() {
        return error(404, "资源不存在");
    }

    /**
     * 资源不存在响应
     *
     * @param message 错误消息
     * @return 资源不存在响应
     */
    public static <T> ApiResponse<T> notFound(String message) {
        return error(404, message);
    }

    // ==================== Getter 和 Setter ====================

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    // ==================== 辅助方法 ====================

    /**
     * 判断是否为成功响应
     *
     * @return 是否成功
     */
    public boolean ok() {
        return success && code == 200;
    }

    /**
     * 判断是否为错误响应
     *
     * @return 是否错误
     */
    public boolean hasError() {
        return !success;
    }

    /**
     * 获取格式化的时间戳
     *
     * @return 格式化时间
     */
    public LocalDateTime getFormattedTimestamp() {
        return LocalDateTime.ofEpochSecond(timestamp / 1000, 0, java.time.ZoneOffset.UTC);
    }

    @Override
    public String toString() {
        return String.format("ApiResponse{success=%s, code=%d, message='%s', data=%s, timestamp=%d}",
                success, code, message, data, timestamp);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        ApiResponse<?> that = (ApiResponse<?>) o;

        if (success != that.success) return false;
        if (code != that.code) return false;
        if (timestamp != that.timestamp) return false;
        if (!message.equals(that.message)) return false;
        return data != null ? data.equals(that.data) : that.data == null;
    }

    @Override
    public int hashCode() {
        int result = (success ? 1 : 0);
        result = 31 * result + code;
        result = 31 * result + message.hashCode();
        result = 31 * result + (data != null ? data.hashCode() : 0);
        result = 31 * result + (int) (timestamp ^ (timestamp >>> 32));
        return result;
    }
}