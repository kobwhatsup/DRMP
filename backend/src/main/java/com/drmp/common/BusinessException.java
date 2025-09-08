package com.drmp.common;

/**
 * 业务异常
 * 用于处理业务逻辑中的异常情况
 *
 * @author DRMP Team
 */
public class BusinessException extends RuntimeException {

    private final int code;
    private final String message;
    private final Object data;

    /**
     * 构造函数
     *
     * @param code    错误码
     * @param message 错误消息
     */
    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
        this.message = message;
        this.data = null;
    }

    /**
     * 构造函数
     *
     * @param code    错误码
     * @param message 错误消息
     * @param data    附加数据
     */
    public BusinessException(int code, String message, Object data) {
        super(message);
        this.code = code;
        this.message = message;
        this.data = data;
    }

    /**
     * 构造函数
     *
     * @param code    错误码
     * @param message 错误消息
     * @param cause   原因异常
     */
    public BusinessException(int code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
        this.message = message;
        this.data = null;
    }

    /**
     * 构造函数
     *
     * @param errorCode 错误枚举
     */
    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.code = errorCode.getCode();
        this.message = errorCode.getMessage();
        this.data = null;
    }

    /**
     * 构造函数
     *
     * @param errorCode 错误枚举
     * @param data      附加数据
     */
    public BusinessException(ErrorCode errorCode, Object data) {
        super(errorCode.getMessage());
        this.code = errorCode.getCode();
        this.message = errorCode.getMessage();
        this.data = data;
    }

    /**
     * 构造函数
     *
     * @param errorCode 错误枚举
     * @param cause     原因异常
     */
    public BusinessException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.code = errorCode.getCode();
        this.message = errorCode.getMessage();
        this.data = null;
    }

    public int getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }

    public Object getData() {
        return data;
    }

    // ==================== 静态工厂方法 ====================

    /**
     * 创建业务异常
     */
    public static BusinessException of(int code, String message) {
        return new BusinessException(code, message);
    }

    /**
     * 创建业务异常
     */
    public static BusinessException of(ErrorCode errorCode) {
        return new BusinessException(errorCode);
    }

    /**
     * 创建业务异常
     */
    public static BusinessException of(ErrorCode errorCode, Object data) {
        return new BusinessException(errorCode, data);
    }

    // ==================== 常用业务异常 ====================

    /**
     * 参数错误
     */
    public static BusinessException badRequest(String message) {
        return new BusinessException(400, message);
    }

    /**
     * 未认证
     */
    public static BusinessException unauthorized(String message) {
        return new BusinessException(401, message);
    }

    /**
     * 权限不足
     */
    public static BusinessException forbidden(String message) {
        return new BusinessException(403, message);
    }

    /**
     * 资源不存在
     */
    public static BusinessException notFound(String message) {
        return new BusinessException(404, message);
    }

    /**
     * 方法不允许
     */
    public static BusinessException methodNotAllowed(String message) {
        return new BusinessException(405, message);
    }

    /**
     * 冲突
     */
    public static BusinessException conflict(String message) {
        return new BusinessException(409, message);
    }

    /**
     * 服务器内部错误
     */
    public static BusinessException internalError(String message) {
        return new BusinessException(500, message);
    }

    /**
     * 服务不可用
     */
    public static BusinessException serviceUnavailable(String message) {
        return new BusinessException(503, message);
    }

    @Override
    public String toString() {
        return String.format("BusinessException{code=%d, message='%s', data=%s}", code, message, data);
    }
}