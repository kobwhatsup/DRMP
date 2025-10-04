-- PostgreSQL Database Migration
-- 插入基础权限数据
INSERT INTO permissions (id, code, name, description, resource, action, created_at, updated_at) VALUES
-- 用户管理权限
(1, 'user:read', '查看用户', '查看用户信息', 'user', 'read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'user:create', '创建用户', '创建新用户', 'user', 'create', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'user:update', '更新用户', '更新用户信息', 'user', 'update', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'user:delete', '删除用户', '删除用户', 'user', 'delete', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- 机构管理权限
(5, 'organization:read', '查看机构', '查看机构信息', 'organization', 'read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'organization:create', '创建机构', '创建新机构', 'organization', 'create', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 'organization:update', '更新机构', '更新机构信息', 'organization', 'update', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 'organization:delete', '删除机构', '删除机构', 'organization', 'delete', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 'organization:approve', '审核机构', '审核机构入驻', 'organization', 'approve', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- 案件包管理权限
(10, 'case_package:read', '查看案件包', '查看案件包信息', 'case_package', 'read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(11, 'case_package:create', '创建案件包', '创建新案件包', 'case_package', 'create', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(12, 'case_package:update', '更新案件包', '更新案件包信息', 'case_package', 'update', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(13, 'case_package:delete', '删除案件包', '删除案件包', 'case_package', 'delete', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(14, 'case_package:assign', '分配案件包', '分配案件包给处置机构', 'case_package', 'assign', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- 案件管理权限
(15, 'case:read', '查看案件', '查看案件详情', 'case', 'read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(16, 'case:update', '更新案件', '更新案件状态', 'case', 'update', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- 报表权限
(17, 'report:read', '查看报表', '查看统计报表', 'report', 'read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(18, 'report:export', '导出报表', '导出报表数据', 'report', 'export', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- 系统管理权限
(19, 'system:config', '系统配置', '管理系统配置', 'system', 'config', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(20, 'system:log', '查看日志', '查看系统日志', 'system', 'log', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 插入基础角色数据
INSERT INTO roles (id, code, name, description, created_at, updated_at) VALUES
(1, 'ADMIN', '系统管理员', '系统最高权限管理员', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'SOURCE_ORG_ADMIN', '案源机构管理员', '案源机构管理员', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'SOURCE_ORG_USER', '案源机构用户', '案源机构普通用户', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'DISPOSAL_ORG_ADMIN', '处置机构管理员', '处置机构管理员', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'DISPOSAL_ORG_USER', '处置机构用户', '处置机构普通用户', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 为系统管理员角色分配所有权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 为案源机构管理员分配权限
INSERT INTO role_permissions (role_id, permission_id) VALUES
-- 用户管理权限（本机构）
(2, 1), (2, 2), (2, 3),
-- 案件包管理权限
(2, 10), (2, 11), (2, 12), (2, 13),
-- 案件查看权限
(2, 15),
-- 报表权限
(2, 17), (2, 18)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 为案源机构用户分配权限
INSERT INTO role_permissions (role_id, permission_id) VALUES
-- 案件包查看权限
(3, 10),
-- 案件查看权限
(3, 15),
-- 报表查看权限
(3, 17)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 为处置机构管理员分配权限
INSERT INTO role_permissions (role_id, permission_id) VALUES
-- 用户管理权限（本机构）
(4, 1), (4, 2), (4, 3),
-- 案件包查看权限
(4, 10),
-- 案件管理权限
(4, 15), (4, 16),
-- 报表权限
(4, 17), (4, 18)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 为处置机构用户分配权限
INSERT INTO role_permissions (role_id, permission_id) VALUES
-- 案件包查看权限
(5, 10),
-- 案件管理权限
(5, 15), (5, 16),
-- 报表查看权限
(5, 17)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 创建系统管理员组织 (matching V1 schema columns)
INSERT INTO organizations (id, org_code, org_name, org_type, contact_person, contact_phone, email, address, business_license, status, created_at, updated_at) VALUES
(1, 'SYS001', 'DRMP系统管理', 'SYSTEM', '系统管理员', '400-000-0000', 'admin@drmp.com', '北京市朝阳区建国门外大街1号', '', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 创建系统管理员用户
INSERT INTO users (id, username, password, real_name, email, phone, avatar, organization_id, status, created_at, updated_at) VALUES
(1, 'admin', '$2a$10$kKmZdZXu.Ti1AvyQr6IvEOYHnQ5Xz0/q/4M6kOzE4FHqzCFcE7vZ6', '系统管理员', 'admin@drmp.com', '13800000000', NULL, 1, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 为系统管理员分配角色
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1)
ON CONFLICT (user_id, role_id) DO NOTHING;

-- 插入业务范围基础数据 (matching V1 schema columns)
INSERT INTO org_business_scopes (org_id, scope) VALUES
(1, '系统管理')
ON CONFLICT (org_id, scope) DO NOTHING;

-- 插入服务区域基础数据 (matching V1 schema columns)
INSERT INTO org_service_regions (org_id, region) VALUES
(1, '全国')
ON CONFLICT (org_id, region) DO NOTHING;

-- Reset sequence for BIGSERIAL columns to avoid conflicts
SELECT setval('permissions_id_seq', (SELECT MAX(id) FROM permissions));
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));
SELECT setval('organizations_id_seq', (SELECT MAX(id) FROM organizations));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));