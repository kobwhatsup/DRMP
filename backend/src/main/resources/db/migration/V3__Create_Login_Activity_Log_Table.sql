-- 创建登录活动日志表
CREATE TABLE IF NOT EXISTS login_activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    username VARCHAR(50),
    activity_type VARCHAR(30) NOT NULL,
    client_ip VARCHAR(45),
    user_agent VARCHAR(500),
    session_id VARCHAR(100),
    failure_reason VARCHAR(200),
    extra_info TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_user_id ON login_activity_logs(user_id);
CREATE INDEX idx_activity_type ON login_activity_logs(activity_type);
CREATE INDEX idx_created_at ON login_activity_logs(created_at);
CREATE INDEX idx_client_ip ON login_activity_logs(client_ip);

-- 添加注释
COMMENT ON TABLE login_activity_logs IS '登录活动日志表';
COMMENT ON COLUMN login_activity_logs.id IS '主键ID';
COMMENT ON COLUMN login_activity_logs.user_id IS '用户ID';
COMMENT ON COLUMN login_activity_logs.username IS '用户名';
COMMENT ON COLUMN login_activity_logs.activity_type IS '活动类型：LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT, TOKEN_REFRESH, SESSION_EXPIRED, ACCOUNT_LOCKED, LOGOUT_ALL_SESSIONS';
COMMENT ON COLUMN login_activity_logs.client_ip IS '客户端IP地址';
COMMENT ON COLUMN login_activity_logs.user_agent IS 'User Agent信息';
COMMENT ON COLUMN login_activity_logs.session_id IS '会话ID';
COMMENT ON COLUMN login_activity_logs.failure_reason IS '失败原因（仅登录失败时有值）';
COMMENT ON COLUMN login_activity_logs.extra_info IS '额外信息（JSON格式）';
COMMENT ON COLUMN login_activity_logs.created_at IS '创建时间';
