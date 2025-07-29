-- 插入基础权限数据
INSERT IGNORE INTO permissions (id, code, name, description, resource, action, created_at, updated_at) VALUES
-- 用户管理权限
(1, 'user:read', '查看用户', '查看用户信息', 'user', 'read', NOW(), NOW()),
(2, 'user:create', '创建用户', '创建新用户', 'user', 'create', NOW(), NOW()),
(3, 'user:update', '更新用户', '更新用户信息', 'user', 'update', NOW(), NOW()),
(4, 'user:delete', '删除用户', '删除用户', 'user', 'delete', NOW(), NOW()),

-- 机构管理权限
(5, 'organization:read', '查看机构', '查看机构信息', 'organization', 'read', NOW(), NOW()),
(6, 'organization:create', '创建机构', '创建新机构', 'organization', 'create', NOW(), NOW()),
(7, 'organization:update', '更新机构', '更新机构信息', 'organization', 'update', NOW(), NOW()),
(8, 'organization:delete', '删除机构', '删除机构', 'organization', 'delete', NOW(), NOW()),
(9, 'organization:approve', '审核机构', '审核机构入驻', 'organization', 'approve', NOW(), NOW()),

-- 案件包管理权限
(10, 'case_package:read', '查看案件包', '查看案件包信息', 'case_package', 'read', NOW(), NOW()),
(11, 'case_package:create', '创建案件包', '创建新案件包', 'case_package', 'create', NOW(), NOW()),
(12, 'case_package:update', '更新案件包', '更新案件包信息', 'case_package', 'update', NOW(), NOW()),
(13, 'case_package:delete', '删除案件包', '删除案件包', 'case_package', 'delete', NOW(), NOW()),
(14, 'case_package:assign', '分配案件包', '分配案件包给处置机构', 'case_package', 'assign', NOW(), NOW()),

-- 案件管理权限
(15, 'case:read', '查看案件', '查看案件详情', 'case', 'read', NOW(), NOW()),
(16, 'case:update', '更新案件', '更新案件状态', 'case', 'update', NOW(), NOW()),

-- 报表权限
(17, 'report:read', '查看报表', '查看统计报表', 'report', 'read', NOW(), NOW()),
(18, 'report:export', '导出报表', '导出报表数据', 'report', 'export', NOW(), NOW()),

-- 系统管理权限
(19, 'system:config', '系统配置', '管理系统配置', 'system', 'config', NOW(), NOW()),
(20, 'system:log', '查看日志', '查看系统日志', 'system', 'log', NOW(), NOW());

-- 插入基础角色数据
INSERT IGNORE INTO roles (id, code, name, description, created_at, updated_at) VALUES
(1, 'ADMIN', '系统管理员', '系统最高权限管理员', NOW(), NOW()),
(2, 'SOURCE_ORG_ADMIN', '案源机构管理员', '案源机构管理员', NOW(), NOW()),
(3, 'SOURCE_ORG_USER', '案源机构用户', '案源机构普通用户', NOW(), NOW()),
(4, 'DISPOSAL_ORG_ADMIN', '处置机构管理员', '处置机构管理员', NOW(), NOW()),
(5, 'DISPOSAL_ORG_USER', '处置机构用户', '处置机构普通用户', NOW(), NOW());

-- 为系统管理员角色分配所有权限
INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT 1, id FROM permissions;

-- 为案源机构管理员分配权限
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
-- 用户管理权限（本机构）
(2, 1), (2, 2), (2, 3),
-- 案件包管理权限
(2, 10), (2, 11), (2, 12), (2, 13),
-- 案件查看权限
(2, 15),
-- 报表权限
(2, 17), (2, 18);

-- 为案源机构用户分配权限
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
-- 案件包查看权限
(3, 10),
-- 案件查看权限
(3, 15),
-- 报表查看权限
(3, 17);

-- 为处置机构管理员分配权限
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
-- 用户管理权限（本机构）
(4, 1), (4, 2), (4, 3),
-- 案件包查看权限
(4, 10),
-- 案件管理权限
(4, 15), (4, 16),
-- 报表权限
(4, 17), (4, 18);

-- 为处置机构用户分配权限
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
-- 案件包查看权限
(5, 10),
-- 案件管理权限
(5, 15), (5, 16),
-- 报表查看权限
(5, 17);

-- 创建系统管理员组织
INSERT IGNORE INTO organizations (id, org_code, org_name, org_type, contact_name, contact_phone, contact_email, province, city, district, detailed_address, business_license, status, created_at, updated_at) VALUES
(1, 'SYS001', 'DRMP系统管理', 'SYSTEM', '系统管理员', '400-000-0000', 'admin@drmp.com', '北京市', '北京市', '朝阳区', '建国门外大街1号', '', 'ACTIVE', NOW(), NOW());

-- 创建系统管理员用户
INSERT IGNORE INTO users (id, username, password, real_name, email, phone, avatar, organization_id, status, created_at, updated_at) VALUES
(1, 'admin', '$2a$10$kKmZdZXu.Ti1AvyQr6IvEOYHnQ5Xz0/q/4M6kOzE4FHqzCFcE7vZ6', '系统管理员', 'admin@drmp.com', '13800000000', NULL, 1, 'ACTIVE', NOW(), NOW());

-- 为系统管理员分配角色
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (1, 1);

-- 插入业务范围基础数据
INSERT IGNORE INTO org_business_scopes (org_id, scope_name) VALUES
(1, '系统管理');

-- 插入服务区域基础数据
INSERT IGNORE INTO org_service_regions (org_id, province, city) VALUES
(1, '全国', '全国');