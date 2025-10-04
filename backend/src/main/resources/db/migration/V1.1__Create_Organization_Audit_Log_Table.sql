-- Create organization audit log table
-- This table tracks all operations performed on organizations including approval, rejection, suspension, etc.
-- Database: PostgreSQL

CREATE TABLE organization_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    org_code VARCHAR(50),
    org_name VARCHAR(255),
    operation_type VARCHAR(20) NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    remark TEXT,
    operator_id BIGINT,
    operator_name VARCHAR(100),
    operation_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    extra_data TEXT,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Comments for columns (PostgreSQL style)
COMMENT ON COLUMN organization_audit_logs.id IS '主键ID';
COMMENT ON COLUMN organization_audit_logs.organization_id IS '机构ID';
COMMENT ON COLUMN organization_audit_logs.org_code IS '机构代码';
COMMENT ON COLUMN organization_audit_logs.org_name IS '机构名称';
COMMENT ON COLUMN organization_audit_logs.operation_type IS '操作类型：CREATE, UPDATE, APPROVE, REJECT, SUSPEND, ACTIVATE';
COMMENT ON COLUMN organization_audit_logs.old_status IS '操作前状态';
COMMENT ON COLUMN organization_audit_logs.new_status IS '操作后状态';
COMMENT ON COLUMN organization_audit_logs.remark IS '操作说明/备注';
COMMENT ON COLUMN organization_audit_logs.operator_id IS '操作人ID';
COMMENT ON COLUMN organization_audit_logs.operator_name IS '操作人姓名';
COMMENT ON COLUMN organization_audit_logs.operation_time IS '操作时间';
COMMENT ON COLUMN organization_audit_logs.extra_data IS '额外数据（JSON格式）';
COMMENT ON COLUMN organization_audit_logs.ip_address IS 'IP地址';
COMMENT ON COLUMN organization_audit_logs.user_agent IS '用户代理';
COMMENT ON COLUMN organization_audit_logs.created_at IS '创建时间';
COMMENT ON TABLE organization_audit_logs IS '机构审核日志表';

-- Create indexes
CREATE INDEX idx_organization_id ON organization_audit_logs(organization_id);
CREATE INDEX idx_operation_type ON organization_audit_logs(operation_type);
CREATE INDEX idx_operator_id ON organization_audit_logs(operator_id);
CREATE INDEX idx_operation_time ON organization_audit_logs(operation_time);
CREATE INDEX idx_created_at ON organization_audit_logs(created_at);

-- Add foreign key constraint to organizations table
-- Note: Uncomment this if you need the foreign key constraint
-- ALTER TABLE organization_audit_logs
-- ADD CONSTRAINT fk_audit_organization_id
-- FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;