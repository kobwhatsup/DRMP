-- 开发环境种子数据
-- 清理现有数据
DELETE FROM user_roles;
DELETE FROM role_permissions;
DELETE FROM permissions;
DELETE FROM roles;
DELETE FROM users;
DELETE FROM organizations;

-- 插入系统权限
INSERT INTO permissions (id, code, name, resource, action, description, created_at, updated_at, is_deleted, version) VALUES
(1, 'user:read', '查看用户', 'user', 'read', '查看用户信息', NOW(), NOW(), false, 0),
(2, 'user:create', '创建用户', 'user', 'create', '创建新用户', NOW(), NOW(), false, 0),
(3, 'user:update', '更新用户', 'user', 'update', '更新用户信息', NOW(), NOW(), false, 0),
(4, 'user:delete', '删除用户', 'user', 'delete', '删除用户', NOW(), NOW(), false, 0),
(5, 'organization:read', '查看机构', 'organization', 'read', '查看机构信息', NOW(), NOW(), false, 0),
(6, 'organization:create', '创建机构', 'organization', 'create', '创建新机构', NOW(), NOW(), false, 0),
(7, 'organization:update', '更新机构', 'organization', 'update', '更新机构信息', NOW(), NOW(), false, 0),
(8, 'organization:delete', '删除机构', 'organization', 'delete', '删除机构', NOW(), NOW(), false, 0),
(9, 'organization:approve', '审核机构', 'organization', 'approve', '审核机构申请', NOW(), NOW(), false, 0),
(10, 'case_package:read', '查看案件包', 'case_package', 'read', '查看案件包信息', NOW(), NOW(), false, 0),
(11, 'case_package:create', '创建案件包', 'case_package', 'create', '创建新案件包', NOW(), NOW(), false, 0),
(12, 'case_package:update', '更新案件包', 'case_package', 'update', '更新案件包信息', NOW(), NOW(), false, 0),
(13, 'case_package:delete', '删除案件包', 'case_package', 'delete', '删除案件包', NOW(), NOW(), false, 0),
(14, 'case_package:assign', '分配案件包', 'case_package', 'assign', '分配案件包给处置机构', NOW(), NOW(), false, 0),
(15, 'case:read', '查看案件', 'case', 'read', '查看案件信息', NOW(), NOW(), false, 0),
(16, 'case:update', '更新案件', 'case', 'update', '更新案件状态', NOW(), NOW(), false, 0),
(17, 'report:read', '查看报表', 'report', 'read', '查看统计报表', NOW(), NOW(), false, 0),
(18, 'report:export', '导出报表', 'report', 'export', '导出统计数据', NOW(), NOW(), false, 0),
(19, 'system:config', '系统配置', 'system', 'config', '管理系统配置', NOW(), NOW(), false, 0),
(20, 'system:log', '系统日志', 'system', 'log', '查看系统日志', NOW(), NOW(), false, 0);

-- 插入系统角色
INSERT INTO roles (id, code, name, description, is_system, organization_type, created_at, updated_at, is_deleted, version) VALUES
(1, 'ADMIN', '系统管理员', '拥有系统所有权限的管理员角色', true, null, NOW(), NOW(), false, 0),
(2, 'ORG_ADMIN', '机构管理员', '机构内部管理员角色', false, null, NOW(), NOW(), false, 0),
(3, 'ORG_USER', '机构用户', '机构普通用户角色', false, null, NOW(), NOW(), false, 0);

-- 给管理员角色分配所有权限
INSERT INTO role_permissions (role_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
(1, 11), (1, 12), (1, 13), (1, 14), (1, 15), (1, 16), (1, 17), (1, 18), (1, 19), (1, 20);

-- 给机构管理员分配部分权限
INSERT INTO role_permissions (role_id, permission_id) VALUES
(2, 1), (2, 2), (2, 3), (2, 5), (2, 10), (2, 15), (2, 16), (2, 17);

-- 给机构用户分配基础权限
INSERT INTO role_permissions (role_id, permission_id) VALUES
(3, 1), (3, 5), (3, 10), (3, 15), (3, 17);

-- 创建系统管理机构
INSERT INTO organizations (id, org_code, org_name, org_type, status, contact_person, contact_phone, email, address, team_size, monthly_case_capacity, current_load_percentage, description, created_at, updated_at, is_deleted, version) VALUES
(1, 'DRMP_SYSTEM', 'DRMP系统管理', 'SYSTEM', 'ACTIVE', '系统管理员', '400-000-0000', 'admin@drmp.com', '北京市朝阳区', 10, 0, 0, 'DRMP平台系统管理机构', NOW(), NOW(), false, 0);

-- 创建系统管理员用户
INSERT INTO users (id, username, email, real_name, phone, password, avatar, status, organization_id, created_at, updated_at, is_deleted, version) VALUES
(1, 'admin', 'admin@drmp.com', '系统管理员', '13800000000', '$2a$10$N7Ek5VhJ8u/jK3vQ2Q9.JOK1QN8HqkK/8c5D1E4.JOK2QN8HqkK/8c', '', 'ACTIVE', 1, NOW(), NOW(), false, 0);

-- 给用户分配管理员角色
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);

-- 创建一些示例机构数据
INSERT INTO organizations (id, org_code, org_name, org_type, status, contact_person, contact_phone, email, address, team_size, monthly_case_capacity, current_load_percentage, description, created_at, updated_at, is_deleted, version) VALUES
(2, 'ICBC_BJ_001', '中国工商银行北京分行', 'BANK', 'ACTIVE', '张经理', '010-12345678', 'zhang@icbc.com.cn', '北京市西城区复兴门内大街55号', 50, 500, 75, '中国工商银行北京分行，主要业务为个人和企业金融服务', NOW(), NOW(), false, 0),
(3, 'CMB_SH_001', '招商银行上海分行', 'BANK', 'ACTIVE', '李总监', '021-87654321', 'li@cmb.com.cn', '上海市浦东新区陆家嘴环路1000号', 45, 400, 60, '招商银行上海分行，专注于零售和公司银行业务', NOW(), NOW(), false, 0),
(4, 'LAW_BJ_001', '北京金杜律师事务所', 'LAW_FIRM', 'ACTIVE', '王律师', '010-98765432', 'wang@jd.com', '北京市朝阳区东三环中路5号财富金融中心', 120, 200, 80, '北京金杜律师事务所，专业提供金融法律服务', NOW(), NOW(), false, 0),
(5, 'MED_GZ_001', '广州市金融纠纷调解中心', 'MEDIATION_CENTER', 'ACTIVE', '陈主任', '020-12345678', 'chen@gzmediation.gov.cn', '广州市天河区珠江新城花城大道', 30, 300, 45, '广州市金融纠纷调解中心，专业处理各类金融纠纷', NOW(), NOW(), false, 0);