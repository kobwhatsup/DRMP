package com.drmp.common;

/**
 * 错误码枚举
 * 定义系统中所有的错误码和错误消息
 *
 * @author DRMP Team
 */
public enum ErrorCode {

    // ==================== 通用错误码 (0-99) ====================
    SUCCESS(200, "操作成功"),
    SYSTEM_ERROR(500, "系统内部错误"),
    PARAMETER_ERROR(400, "参数错误"),
    DATA_NOT_FOUND(404, "数据不存在"),
    OPERATION_FAILED(400, "操作失败"),
    
    // ==================== 认证授权错误 (1000-1099) ====================
    UNAUTHORIZED(401, "未授权访问"),
    TOKEN_EXPIRED(401, "Token已过期"),
    TOKEN_INVALID(401, "Token无效"),
    LOGIN_FAILED(401, "登录失败"),
    PASSWORD_ERROR(401, "密码错误"),
    ACCOUNT_LOCKED(401, "账号已锁定"),
    ACCOUNT_DISABLED(401, "账号已禁用"),
    PERMISSION_DENIED(403, "权限不足"),
    
    // ==================== 用户管理错误 (1100-1199) ====================
    USER_NOT_FOUND(1101, "用户不存在"),
    USER_ALREADY_EXISTS(1102, "用户已存在"),
    USERNAME_TAKEN(1103, "用户名已被占用"),
    EMAIL_TAKEN(1104, "邮箱已被注册"),
    PHONE_TAKEN(1105, "手机号已被注册"),
    USER_STATUS_INVALID(1106, "用户状态无效"),
    PASSWORD_TOO_WEAK(1107, "密码强度不足"),
    
    // ==================== 机构管理错误 (1200-1299) ====================
    ORGANIZATION_NOT_FOUND(1201, "机构不存在"),
    ORGANIZATION_ALREADY_EXISTS(1202, "机构已存在"),
    ORGANIZATION_TYPE_INVALID(1203, "机构类型无效"),
    ORGANIZATION_STATUS_INVALID(1204, "机构状态无效"),
    ORGANIZATION_PERMISSION_DENIED(1205, "机构权限不足"),
    
    // ==================== 案件管理错误 (1300-1399) ====================
    CASE_NOT_FOUND(1301, "案件不存在"),
    CASE_PACKAGE_NOT_FOUND(1302, "案件包不存在"),
    CASE_STATUS_INVALID(1303, "案件状态无效"),
    CASE_ASSIGNMENT_FAILED(1304, "案件分配失败"),
    CASE_ALREADY_ASSIGNED(1305, "案件已被分配"),
    CASE_IMPORT_FAILED(1306, "案件导入失败"),
    CASE_EXPORT_FAILED(1307, "案件导出失败"),
    CASE_DUPLICATE_DETECTED(1308, "检测到重复案件"),
    
    // ==================== 分案管理错误 (1400-1499) ====================
    ASSIGNMENT_STRATEGY_NOT_FOUND(1401, "分案策略不存在"),
    ASSIGNMENT_RULE_INVALID(1402, "分案规则无效"),
    NO_AVAILABLE_DISPOSAL_ORG(1403, "没有可用的处置机构"),
    ASSIGNMENT_QUOTA_EXCEEDED(1404, "分案配额已超限"),
    ASSIGNMENT_CONDITIONS_NOT_MET(1405, "分案条件不满足"),
    
    // ==================== 合同管理错误 (1500-1599) ====================
    CONTRACT_NOT_FOUND(1501, "合同不存在"),
    CONTRACT_TEMPLATE_NOT_FOUND(1502, "合同模板不存在"),
    CONTRACT_STATUS_INVALID(1503, "合同状态无效"),
    CONTRACT_SIGNATURE_FAILED(1504, "合同签署失败"),
    CONTRACT_ALREADY_SIGNED(1505, "合同已签署"),
    SIGNATURE_INVALID(1506, "签名无效"),
    SIGNATURE_EXPIRED(1507, "签名已过期"),
    
    // ==================== IDS集成错误 (1600-1699) ====================
    IDS_CONFIG_NOT_FOUND(1601, "IDS配置不存在"),
    IDS_CONNECTION_FAILED(1602, "IDS连接失败"),
    IDS_API_ERROR(1603, "IDS接口调用错误"),
    IDS_SYNC_FAILED(1604, "IDS同步失败"),
    IDS_DATA_FORMAT_ERROR(1605, "IDS数据格式错误"),
    IDS_AUTHENTICATION_FAILED(1606, "IDS认证失败"),
    
    // ==================== 通知系统错误 (1700-1799) ====================
    NOTIFICATION_SEND_FAILED(1701, "通知发送失败"),
    NOTIFICATION_TEMPLATE_NOT_FOUND(1702, "通知模板不存在"),
    NOTIFICATION_CHANNEL_UNAVAILABLE(1703, "通知渠道不可用"),
    EMAIL_SEND_FAILED(1704, "邮件发送失败"),
    SMS_SEND_FAILED(1705, "短信发送失败"),
    WEBSOCKET_CONNECTION_FAILED(1706, "WebSocket连接失败"),
    
    // ==================== 文件处理错误 (1800-1899) ====================
    FILE_UPLOAD_FAILED(1801, "文件上传失败"),
    FILE_NOT_FOUND(1802, "文件不存在"),
    FILE_FORMAT_INVALID(1803, "文件格式无效"),
    FILE_SIZE_EXCEEDED(1804, "文件大小超限"),
    FILE_PROCESSING_FAILED(1805, "文件处理失败"),
    EXCEL_PARSE_FAILED(1806, "Excel解析失败"),
    
    // ==================== 数据统计错误 (1900-1999) ====================
    REPORT_GENERATION_FAILED(1901, "报表生成失败"),
    DATA_EXPORT_FAILED(1902, "数据导出失败"),
    STATISTICS_CALCULATION_FAILED(1903, "统计计算失败"),
    DASHBOARD_DATA_LOAD_FAILED(1904, "看板数据加载失败"),
    
    // ==================== 系统配置错误 (2000-2099) ====================
    CONFIG_NOT_FOUND(2001, "配置不存在"),
    CONFIG_FORMAT_INVALID(2002, "配置格式无效"),
    SYSTEM_MAINTENANCE(2003, "系统维护中"),
    SERVICE_UNAVAILABLE(2004, "服务不可用"),
    DATABASE_CONNECTION_FAILED(2005, "数据库连接失败"),
    REDIS_CONNECTION_FAILED(2006, "Redis连接失败"),
    
    // ==================== 外部服务错误 (2100-2199) ====================
    EXTERNAL_API_ERROR(2101, "外部API调用失败"),
    THIRD_PARTY_SERVICE_UNAVAILABLE(2102, "第三方服务不可用"),
    API_RATE_LIMIT_EXCEEDED(2103, "API调用频率超限"),
    NETWORK_TIMEOUT(2104, "网络超时"),
    
    // ==================== 业务规则错误 (2200-2299) ====================
    BUSINESS_RULE_VIOLATION(2201, "违反业务规则"),
    WORKFLOW_STATE_INVALID(2202, "工作流状态无效"),
    OPERATION_NOT_ALLOWED(2203, "操作不被允许"),
    TIME_WINDOW_EXPIRED(2204, "时间窗口已过期"),
    QUOTA_EXCEEDED(2205, "配额已超限"),
    DUPLICATE_OPERATION(2206, "重复操作");

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

    /**
     * 根据错误码获取枚举
     *
     * @param code 错误码
     * @return 错误枚举
     */
    public static ErrorCode getByCode(int code) {
        for (ErrorCode errorCode : values()) {
            if (errorCode.getCode() == code) {
                return errorCode;
            }
        }
        return SYSTEM_ERROR;
    }

    /**
     * 是否为成功码
     *
     * @return 是否成功
     */
    public boolean isSuccess() {
        return code == SUCCESS.code;
    }

    /**
     * 是否为客户端错误
     *
     * @return 是否为客户端错误
     */
    public boolean isClientError() {
        return code >= 400 && code < 500;
    }

    /**
     * 是否为服务端错误
     *
     * @return 是否为服务端错误
     */
    public boolean isServerError() {
        return code >= 500;
    }

    @Override
    public String toString() {
        return String.format("%s(%d): %s", name(), code, message);
    }
}