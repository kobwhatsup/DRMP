USE drmp;

-- Clean and start fresh
DELETE FROM user_roles;
DELETE FROM users;
DELETE FROM organizations;
DELETE FROM role_permissions;
DELETE FROM roles;
DELETE FROM permissions;

-- Insert essential permissions with IDs
INSERT INTO permissions (id, code, name, resource, action, description, created_at, updated_at, is_deleted, version) VALUES 
(1, 'organization:read', '查看机构', 'organization', 'read', '查看机构信息', NOW(), NOW(), false, 0),
(2, 'organization:create', '创建机构', 'organization', 'create', '创建新机构', NOW(), NOW(), false, 0);

-- Insert admin role
INSERT INTO roles (id, code, name, description, is_system, created_at, updated_at, is_deleted, version) VALUES 
(1, 'ADMIN', '系统管理员', '拥有系统所有权限的管理员角色', true, NOW(), NOW(), false, 0);

-- Give admin role permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 1), (1, 2);

-- Create system organization
INSERT INTO organizations (id, org_code, org_name, org_type, status, contact_person, contact_phone, email, address, team_size, monthly_case_capacity, current_load_percentage, description, created_at, updated_at, is_deleted, version) VALUES 
(1, 'DRMP_SYSTEM', 'DRMP系统管理', 'SYSTEM', 'ACTIVE', '系统管理员', '400-000-0000', 'admin@drmp.com', '北京市朝阳区', 10, 0, 0, 'DRMP平台系统管理机构', NOW(), NOW(), false, 0);

-- Create admin user  
INSERT INTO users (id, username, email, real_name, phone, password, avatar, status, organization_id, created_at, updated_at, is_deleted, version) VALUES 
(1, 'admin', 'admin@drmp.com', '系统管理员', '13800000000', '$2a$10$dkLDhbOqT3qJ2LLSzJ7n3uzFStbZGKnlzqJUU6dVN9l0IQ8j2mK6a', '', 'ACTIVE', 1, NOW(), NOW(), false, 0);

-- Assign admin role to user
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);