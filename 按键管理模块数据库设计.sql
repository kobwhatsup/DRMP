-- ============================================
-- DRMP 按键管理模块数据库设计
-- ============================================

-- 密钥类型表
CREATE TABLE key_types (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '密钥类型名称',
    code VARCHAR(20) NOT NULL UNIQUE COMMENT '密钥类型编码',
    description TEXT COMMENT '密钥类型描述',
    is_system BOOLEAN DEFAULT FALSE COMMENT '是否系统内置类型',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '密钥类型配置表';

-- 插入默认密钥类型
INSERT INTO key_types (name, code, description, is_system) VALUES
('API访问密钥', 'API_ACCESS', '用于外部系统访问平台API的密钥', TRUE),
('系统集成密钥', 'SYSTEM_INTEGRATION', '与第三方系统集成使用的密钥', TRUE),
('用户访问密钥', 'USER_ACCESS', '用户临时访问密钥', TRUE),
('数据导出密钥', 'DATA_EXPORT', '数据导出功能的访问密钥', TRUE),
('Webhook密钥', 'WEBHOOK', 'Webhook回调验证密钥', TRUE);

-- 密钥主表
CREATE TABLE access_keys (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    key_id VARCHAR(64) NOT NULL UNIQUE COMMENT '密钥唯一标识',
    key_secret VARCHAR(128) NOT NULL COMMENT '密钥秘钥（加密存储）',
    key_type_id BIGINT NOT NULL COMMENT '密钥类型ID',
    name VARCHAR(100) NOT NULL COMMENT '密钥名称',
    description TEXT COMMENT '密钥描述',
    owner_type ENUM('PLATFORM', 'ORGANIZATION', 'USER') NOT NULL COMMENT '密钥所有者类型',
    owner_id BIGINT NOT NULL COMMENT '所有者ID',
    status ENUM('ACTIVE', 'EXPIRED', 'REVOKED', 'SUSPENDED') DEFAULT 'ACTIVE' COMMENT '密钥状态',
    permissions JSON COMMENT '密钥权限配置（JSON格式）',
    ip_whitelist JSON COMMENT 'IP白名单',
    rate_limit_per_minute INT DEFAULT 1000 COMMENT '每分钟请求限制',
    expires_at TIMESTAMP NULL COMMENT '过期时间',
    last_used_at TIMESTAMP NULL COMMENT '最后使用时间',
    created_by BIGINT NOT NULL COMMENT '创建人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (key_type_id) REFERENCES key_types(id),
    INDEX idx_owner (owner_type, owner_id),
    INDEX idx_status (status),
    INDEX idx_expires_at (expires_at),
    INDEX idx_key_type (key_type_id)
) COMMENT '访问密钥主表';

-- 密钥权限模板表
CREATE TABLE key_permission_templates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '模板名称',
    key_type_id BIGINT NOT NULL COMMENT '适用的密钥类型',
    permissions JSON NOT NULL COMMENT '权限配置模板',
    description TEXT COMMENT '模板描述',
    is_default BOOLEAN DEFAULT FALSE COMMENT '是否默认模板',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (key_type_id) REFERENCES key_types(id)
) COMMENT '密钥权限模板表';

-- 插入默认权限模板
INSERT INTO key_permission_templates (name, key_type_id, permissions, description, is_default) VALUES
('只读API权限', 1, '{"endpoints": ["GET:/api/v1/cases/*", "GET:/api/v1/organizations/*"], "operations": ["read"]}', 'API密钥只读权限模板', TRUE),
('完整API权限', 1, '{"endpoints": ["*"], "operations": ["read", "write", "delete"]}', 'API密钥完整权限模板', FALSE),
('案件管理权限', 1, '{"endpoints": ["*/api/v1/cases/*", "*/api/v1/case-packages/*"], "operations": ["read", "write"]}', '案件管理相关API权限', FALSE);

-- 密钥使用日志表
CREATE TABLE key_usage_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    key_id VARCHAR(64) NOT NULL COMMENT '使用的密钥ID',
    request_id VARCHAR(64) COMMENT '请求ID',
    endpoint VARCHAR(255) NOT NULL COMMENT '访问的API端点',
    method VARCHAR(10) NOT NULL COMMENT 'HTTP方法',
    ip_address VARCHAR(45) NOT NULL COMMENT '请求IP地址',
    user_agent TEXT COMMENT '用户代理',
    response_status INT COMMENT 'HTTP响应状态码',
    response_time_ms INT COMMENT '响应时间（毫秒）',
    request_size BIGINT COMMENT '请求大小（字节）',
    response_size BIGINT COMMENT '响应大小（字节）',
    error_message TEXT COMMENT '错误信息（如果有）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_key_id (key_id),
    INDEX idx_created_at (created_at),
    INDEX idx_endpoint (endpoint),
    INDEX idx_ip_address (ip_address)
) COMMENT '密钥使用日志表';

-- 密钥轮换记录表
CREATE TABLE key_rotation_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    key_id VARCHAR(64) NOT NULL COMMENT '密钥ID',
    old_secret_hash VARCHAR(128) NOT NULL COMMENT '旧密钥秘钥哈希',
    new_secret_hash VARCHAR(128) NOT NULL COMMENT '新密钥秘钥哈希',
    rotation_reason ENUM('SCHEDULED', 'SECURITY_BREACH', 'MANUAL', 'EXPIRED') NOT NULL COMMENT '轮换原因',
    rotation_type ENUM('AUTO', 'MANUAL') NOT NULL COMMENT '轮换类型',
    operated_by BIGINT NOT NULL COMMENT '操作人ID',
    notes TEXT COMMENT '轮换备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_key_id (key_id),
    INDEX idx_created_at (created_at)
) COMMENT '密钥轮换历史记录表';

-- 密钥安全事件表
CREATE TABLE key_security_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    key_id VARCHAR(64) NOT NULL COMMENT '相关密钥ID',
    event_type ENUM('UNAUTHORIZED_ACCESS', 'RATE_LIMIT_EXCEEDED', 'IP_BLOCKED', 'SUSPICIOUS_ACTIVITY', 'KEY_COMPROMISED') NOT NULL COMMENT '事件类型',
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL COMMENT '严重程度',
    source_ip VARCHAR(45) COMMENT '源IP地址',
    details JSON COMMENT '事件详情',
    is_resolved BOOLEAN DEFAULT FALSE COMMENT '是否已解决',
    resolved_by BIGINT COMMENT '解决人ID',
    resolved_at TIMESTAMP NULL COMMENT '解决时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_key_id (key_id),
    INDEX idx_event_type (event_type),
    INDEX idx_severity (severity),
    INDEX idx_created_at (created_at)
) COMMENT '密钥安全事件表';

-- 密钥配额管理表
CREATE TABLE key_quotas (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    key_id VARCHAR(64) NOT NULL COMMENT '密钥ID',
    quota_type ENUM('DAILY_REQUESTS', 'MONTHLY_REQUESTS', 'DATA_EXPORT_MB', 'CONCURRENT_SESSIONS') NOT NULL COMMENT '配额类型',
    quota_limit BIGINT NOT NULL COMMENT '配额限制',
    quota_used BIGINT DEFAULT 0 COMMENT '已使用配额',
    quota_period_start TIMESTAMP NOT NULL COMMENT '配额周期开始时间',
    quota_period_end TIMESTAMP NOT NULL COMMENT '配额周期结束时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_key_quota_period (key_id, quota_type, quota_period_start),
    INDEX idx_quota_period (quota_period_start, quota_period_end)
) COMMENT '密钥配额管理表';

-- 外部系统集成配置表
CREATE TABLE external_system_configs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    system_name VARCHAR(100) NOT NULL COMMENT '外部系统名称',
    system_code VARCHAR(50) NOT NULL UNIQUE COMMENT '系统编码',
    system_type ENUM('IDS', 'PAYMENT', 'COURT', 'SMS', 'EMAIL', 'OTHER') NOT NULL COMMENT '系统类型',
    endpoint_url VARCHAR(500) NOT NULL COMMENT '系统接入点URL',
    auth_type ENUM('API_KEY', 'OAUTH2', 'JWT', 'BASIC_AUTH') NOT NULL COMMENT '认证方式',
    auth_config JSON NOT NULL COMMENT '认证配置信息',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否激活',
    timeout_seconds INT DEFAULT 30 COMMENT '请求超时时间（秒）',
    retry_times INT DEFAULT 3 COMMENT '重试次数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '外部系统集成配置表';

-- 插入默认外部系统配置
INSERT INTO external_system_configs (system_name, system_code, system_type, endpoint_url, auth_type, auth_config) VALUES
('智调系统IDS', 'IDS_MAIN', 'IDS', 'https://ids.example.com/api/v1', 'API_KEY', '{"key_header": "X-API-Key", "key_prefix": "Bearer "}'),
('支付系统', 'PAYMENT_GATEWAY', 'PAYMENT', 'https://pay.example.com/api', 'API_KEY', '{"key_header": "Authorization", "key_prefix": "ApiKey "}'),
('法院系统', 'COURT_SYSTEM', 'COURT', 'https://court.gov.cn/api', 'OAUTH2', '{"client_id": "", "client_secret": "", "token_url": ""}');

-- 创建索引优化查询性能
CREATE INDEX idx_access_keys_owner ON access_keys(owner_type, owner_id, status);
CREATE INDEX idx_usage_logs_time_key ON key_usage_logs(created_at, key_id);
CREATE INDEX idx_security_events_unresolved ON key_security_events(is_resolved, severity, created_at);

-- 创建视图：密钥使用统计
CREATE VIEW v_key_usage_stats AS
SELECT 
    ak.key_id,
    ak.name AS key_name,
    ak.owner_type,
    ak.owner_id,
    COUNT(kul.id) AS total_requests,
    COUNT(CASE WHEN kul.response_status >= 200 AND kul.response_status < 300 THEN 1 END) AS successful_requests,
    COUNT(CASE WHEN kul.response_status >= 400 THEN 1 END) AS failed_requests,
    AVG(kul.response_time_ms) AS avg_response_time,
    MAX(kul.created_at) AS last_request_time
FROM access_keys ak
LEFT JOIN key_usage_logs kul ON ak.key_id = kul.key_id
WHERE ak.status = 'ACTIVE'
GROUP BY ak.key_id, ak.name, ak.owner_type, ak.owner_id;

-- 创建视图：安全事件汇总
CREATE VIEW v_security_events_summary AS
SELECT 
    ak.key_id,
    ak.name AS key_name,
    COUNT(kse.id) AS total_events,
    COUNT(CASE WHEN kse.severity = 'CRITICAL' THEN 1 END) AS critical_events,
    COUNT(CASE WHEN kse.severity = 'HIGH' THEN 1 END) AS high_events,
    COUNT(CASE WHEN kse.is_resolved = FALSE THEN 1 END) AS unresolved_events,
    MAX(kse.created_at) AS last_event_time
FROM access_keys ak
LEFT JOIN key_security_events kse ON ak.key_id = kse.key_id
GROUP BY ak.key_id, ak.name;