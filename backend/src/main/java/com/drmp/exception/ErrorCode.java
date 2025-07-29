package com.drmp.exception;

/**
 * 错误码定义
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public enum ErrorCode {
    
    // 通用错误码 (1000-1999)
    SUCCESS(200, "操作成功"),
    SYSTEM_ERROR(1000, "系统错误"),
    INVALID_PARAMETER(1001, "参数错误"),
    UNAUTHORIZED(1002, "未授权访问"),
    FORBIDDEN(1003, "无权限访问"),
    NOT_FOUND(1004, "资源不存在"),
    METHOD_NOT_ALLOWED(1005, "方法不允许"),
    DUPLICATE_KEY(1006, "数据重复"),
    
    // 用户相关错误码 (2000-2999)
    USER_NOT_FOUND(2000, "用户不存在"),
    USER_ALREADY_EXISTS(2001, "用户已存在"),
    INVALID_USERNAME_OR_PASSWORD(2002, "用户名或密码错误"),
    USER_DISABLED(2003, "用户已禁用"),
    PASSWORD_TOO_WEAK(2004, "密码强度不足"),
    
    // 机构相关错误码 (3000-3999)
    ORGANIZATION_NOT_FOUND(3000, "机构不存在"),
    ORGANIZATION_ALREADY_EXISTS(3001, "机构已存在"),
    ORGANIZATION_DISABLED(3002, "机构已禁用"),
    
    // 案件包相关错误码 (4000-4999)
    CASE_PACKAGE_NOT_FOUND(4000, "案件包不存在"),
    CASE_PACKAGE_ALREADY_PUBLISHED(4001, "案件包已发布"),
    CASE_PACKAGE_CANNOT_BE_MODIFIED(4002, "案件包不能修改"),
    CASE_PACKAGE_CANNOT_BE_DELETED(4003, "案件包不能删除"),
    INVALID_CASE_PACKAGE_STATUS(4004, "案件包状态无效"),
    
    // 案件相关错误码 (5000-5999)
    CASE_NOT_FOUND(5000, "案件不存在"),
    CASE_ALREADY_ASSIGNED(5001, "案件已分配"),
    CASE_CANNOT_BE_ASSIGNED(5002, "案件不能分配"),
    
    // 分案相关错误码 (6000-6999)
    ASSIGNMENT_STRATEGY_NOT_FOUND(6000, "分案策略不存在"),
    NO_SUITABLE_ORGANIZATION(6001, "没有合适的处置机构"),
    ASSIGNMENT_FAILED(6002, "分案失败"),
    
    // 合同相关错误码 (7000-7999)
    CONTRACT_NOT_FOUND(7000, "合同不存在"),
    CONTRACT_NUMBER_EXISTS(7001, "合同编号已存在"),
    CONTRACT_CANNOT_BE_MODIFIED(7002, "合同不能修改"),
    CONTRACT_CANNOT_BE_DELETED(7003, "合同不能删除"),
    CONTRACT_CANNOT_BE_CANCELLED(7004, "合同不能取消"),
    INVALID_CONTRACT_STATUS(7005, "合同状态无效"),
    CONTRACT_NOT_FULLY_SIGNED(7006, "合同未完全签署"),
    CONTRACT_NOT_EFFECTIVE(7007, "合同未生效"),
    INVALID_PARTY_FOR_CONTRACT(7008, "合同当事方无效"),
    INVALID_PARTY_TYPE(7009, "当事方类型无效"),
    
    // 文件相关错误码 (8000-8999)
    FILE_NOT_FOUND(8000, "文件不存在"),
    FILE_UPLOAD_FAILED(8001, "文件上传失败"),
    FILE_FORMAT_ERROR(8002, "文件格式错误"),
    FILE_SIZE_EXCEEDED(8003, "文件大小超限"),
    
    // 权限相关错误码 (9000-9999)
    PERMISSION_DENIED(9000, "权限不足"),
    ROLE_NOT_FOUND(9001, "角色不存在"),
    PERMISSION_NOT_FOUND(9002, "权限不存在"),
    
    // 业务相关错误码 (10000-19999)
    FEATURE_NOT_IMPLEMENTED(10000, "功能未实现"),
    DATA_INTEGRITY_VIOLATION(10001, "数据完整性违反"),
    BUSINESS_RULE_VIOLATION(10002, "业务规则违反"),
    CONCURRENCY_CONFLICT(10003, "并发冲突"),
    
    // 外部服务相关错误码 (20000-29999)
    EXTERNAL_SERVICE_ERROR(20000, "外部服务错误"),
    PAYMENT_SERVICE_ERROR(20001, "支付服务错误"),
    SMS_SERVICE_ERROR(20002, "短信服务错误"),
    EMAIL_SERVICE_ERROR(20003, "邮件服务错误");
    
    private final int code;
    private final String message;
    
    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
    
    public int getCode() {
        return code;
    }
    
    public String getMessage() {
        return message;
    }
    
    @Override
    public String toString() {
        return String.format("[%d] %s", code, message);
    }
}