-- Create organization audit log table
-- This table tracks all operations performed on organizations including approval, rejection, suspension, etc.

CREATE TABLE `organization_audit_logs` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `organization_id` BIGINT NOT NULL COMMENT '机构ID',
    `org_code` VARCHAR(50) COMMENT '机构代码',
    `org_name` VARCHAR(255) COMMENT '机构名称',
    `operation_type` VARCHAR(20) NOT NULL COMMENT '操作类型：CREATE, UPDATE, APPROVE, REJECT, SUSPEND, ACTIVATE',
    `old_status` VARCHAR(20) COMMENT '操作前状态',
    `new_status` VARCHAR(20) COMMENT '操作后状态',
    `remark` TEXT COMMENT '操作说明/备注',
    `operator_id` BIGINT COMMENT '操作人ID',
    `operator_name` VARCHAR(100) COMMENT '操作人姓名',
    `operation_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    `extra_data` TEXT COMMENT '额外数据（JSON格式）',
    `ip_address` VARCHAR(50) COMMENT 'IP地址',
    `user_agent` VARCHAR(500) COMMENT '用户代理',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX `idx_organization_id` (`organization_id`),
    INDEX `idx_operation_type` (`operation_type`),
    INDEX `idx_operator_id` (`operator_id`),
    INDEX `idx_operation_time` (`operation_time`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='机构审核日志表';

-- Add foreign key constraint to organizations table (if organizations table exists)
-- ALTER TABLE `organization_audit_logs` 
-- ADD CONSTRAINT `fk_audit_organization_id` 
-- FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE;