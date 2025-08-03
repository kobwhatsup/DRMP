-- ================================
-- DRMP 系统管理模块数据库设计
-- ================================

-- 用户表（扩展现有用户体系）
CREATE TABLE IF NOT EXISTS sys_users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码(BCrypt加密)',
    email VARCHAR(100) UNIQUE COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    real_name VARCHAR(50) COMMENT '真实姓名',
    avatar_url VARCHAR(500) COMMENT '头像URL',
    organization_id BIGINT COMMENT '所属机构ID',
    user_type ENUM('ADMIN', 'ORGANIZATION_ADMIN', 'ORGANIZATION_USER') DEFAULT 'ORGANIZATION_USER' COMMENT '用户类型',
    status ENUM('ACTIVE', 'DISABLED', 'LOCKED', 'PENDING') DEFAULT 'PENDING' COMMENT '用户状态',
    last_login_time TIMESTAMP NULL COMMENT '最后登录时间',
    last_login_ip VARCHAR(45) COMMENT '最后登录IP',
    login_failure_count INT DEFAULT 0 COMMENT '登录失败次数',
    password_changed_at TIMESTAMP NULL COMMENT '密码修改时间',
    email_verified BOOLEAN DEFAULT FALSE COMMENT '邮箱是否验证',
    phone_verified BOOLEAN DEFAULT FALSE COMMENT '手机号是否验证',
    two_factor_enabled BOOLEAN DEFAULT FALSE COMMENT '是否启用双因子认证',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_organization_id (organization_id),
    INDEX idx_user_type (user_type),
    INDEX idx_status (status)
) COMMENT = '系统用户表';

-- 角色表
CREATE TABLE IF NOT EXISTS sys_roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
    role_name VARCHAR(100) NOT NULL COMMENT '角色名称',
    description TEXT COMMENT '角色描述',
    role_type ENUM('SYSTEM', 'ORGANIZATION', 'CUSTOM') DEFAULT 'CUSTOM' COMMENT '角色类型',
    status ENUM('ACTIVE', 'DISABLED') DEFAULT 'ACTIVE' COMMENT '角色状态',
    sort_order INT DEFAULT 0 COMMENT '排序序号',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    INDEX idx_role_code (role_code),
    INDEX idx_role_type (role_type),
    INDEX idx_status (status)
) COMMENT = '系统角色表';

-- 权限表
CREATE TABLE IF NOT EXISTS sys_permissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    permission_code VARCHAR(100) NOT NULL UNIQUE COMMENT '权限编码',
    permission_name VARCHAR(100) NOT NULL COMMENT '权限名称',
    description TEXT COMMENT '权限描述',
    resource_type ENUM('MENU', 'BUTTON', 'API', 'DATA') DEFAULT 'API' COMMENT '资源类型',
    resource_path VARCHAR(200) COMMENT '资源路径',
    http_method VARCHAR(10) COMMENT 'HTTP方法',
    parent_id BIGINT DEFAULT 0 COMMENT '父权限ID',
    sort_order INT DEFAULT 0 COMMENT '排序序号',
    status ENUM('ACTIVE', 'DISABLED') DEFAULT 'ACTIVE' COMMENT '权限状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_permission_code (permission_code),
    INDEX idx_parent_id (parent_id),
    INDEX idx_resource_type (resource_type)
) COMMENT = '系统权限表';

-- 角色权限关联表
CREATE TABLE IF NOT EXISTS sys_role_permissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL COMMENT '角色ID',
    permission_id BIGINT NOT NULL COMMENT '权限ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    UNIQUE KEY uk_role_permission (role_id, permission_id),
    INDEX idx_role_id (role_id),
    INDEX idx_permission_id (permission_id)
) COMMENT = '角色权限关联表';

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS sys_user_roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    organization_id BIGINT COMMENT '机构范围ID(数据权限)',
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '授权时间',
    expires_at TIMESTAMP NULL COMMENT '过期时间',
    created_by BIGINT COMMENT '创建人ID',
    UNIQUE KEY uk_user_role (user_id, role_id, organization_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id),
    INDEX idx_organization_id (organization_id)
) COMMENT = '用户角色关联表';

-- 系统配置表
CREATE TABLE IF NOT EXISTS sys_configs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    config_group VARCHAR(50) COMMENT '配置分组',
    config_name VARCHAR(100) COMMENT '配置名称',
    description TEXT COMMENT '配置描述',
    value_type ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'ARRAY') DEFAULT 'STRING' COMMENT '值类型',
    is_encrypted BOOLEAN DEFAULT FALSE COMMENT '是否加密存储',
    is_system BOOLEAN DEFAULT FALSE COMMENT '是否系统配置',
    editable BOOLEAN DEFAULT TRUE COMMENT '是否可编辑',
    sort_order INT DEFAULT 0 COMMENT '排序序号',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    INDEX idx_config_key (config_key),
    INDEX idx_config_group (config_group),
    INDEX idx_is_system (is_system)
) COMMENT = '系统配置表';

-- 操作日志表
CREATE TABLE IF NOT EXISTS sys_operation_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT COMMENT '操作用户ID',
    username VARCHAR(50) COMMENT '操作用户名',
    operation_type ENUM('CREATE', 'UPDATE', 'DELETE', 'QUERY', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT') COMMENT '操作类型',
    module_name VARCHAR(50) COMMENT '模块名称',
    business_type VARCHAR(50) COMMENT '业务类型',
    method_name VARCHAR(200) COMMENT '方法名称',
    request_method VARCHAR(10) COMMENT '请求方式',
    request_url VARCHAR(500) COMMENT '请求URL',
    request_params TEXT COMMENT '请求参数',
    response_result TEXT COMMENT '响应结果',
    error_message TEXT COMMENT '错误信息',
    operation_ip VARCHAR(45) COMMENT '操作IP',
    operation_location VARCHAR(100) COMMENT '操作地点',
    user_agent TEXT COMMENT '用户代理',
    execution_time BIGINT COMMENT '执行时间(毫秒)',
    operation_status ENUM('SUCCESS', 'FAILURE') DEFAULT 'SUCCESS' COMMENT '操作状态',
    operated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    INDEX idx_user_id (user_id),
    INDEX idx_operation_type (operation_type),
    INDEX idx_module_name (module_name),
    INDEX idx_operated_at (operated_at),
    INDEX idx_operation_ip (operation_ip)
) COMMENT = '系统操作日志表';

-- 登录日志表
CREATE TABLE IF NOT EXISTS sys_login_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT COMMENT '用户ID',
    username VARCHAR(50) COMMENT '用户名',
    login_ip VARCHAR(45) COMMENT '登录IP',
    login_location VARCHAR(100) COMMENT '登录地点',
    browser VARCHAR(100) COMMENT '浏览器类型',
    operating_system VARCHAR(100) COMMENT '操作系统',
    login_status ENUM('SUCCESS', 'FAILURE') COMMENT '登录状态',
    failure_reason VARCHAR(200) COMMENT '失败原因',
    session_id VARCHAR(200) COMMENT '会话ID',
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',
    logout_time TIMESTAMP NULL COMMENT '登出时间',
    INDEX idx_user_id (user_id),
    INDEX idx_username (username),
    INDEX idx_login_ip (login_ip),
    INDEX idx_login_time (login_time),
    INDEX idx_login_status (login_status)
) COMMENT = '用户登录日志表';

-- 系统通知表
CREATE TABLE IF NOT EXISTS sys_notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL COMMENT '通知标题',
    content TEXT COMMENT '通知内容',
    notification_type ENUM('SYSTEM', 'BUSINESS', 'SECURITY', 'MAINTENANCE') DEFAULT 'SYSTEM' COMMENT '通知类型',
    priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') DEFAULT 'NORMAL' COMMENT '优先级',
    target_type ENUM('ALL', 'ROLE', 'USER', 'ORGANIZATION') DEFAULT 'ALL' COMMENT '目标类型',
    target_ids TEXT COMMENT '目标ID列表(JSON数组)',
    publish_status ENUM('DRAFT', 'PUBLISHED', 'CANCELED') DEFAULT 'DRAFT' COMMENT '发布状态',
    publish_time TIMESTAMP NULL COMMENT '发布时间',
    expire_time TIMESTAMP NULL COMMENT '过期时间',
    read_count INT DEFAULT 0 COMMENT '已读数量',
    total_count INT DEFAULT 0 COMMENT '总数量',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    INDEX idx_notification_type (notification_type),
    INDEX idx_target_type (target_type),
    INDEX idx_publish_status (publish_status),
    INDEX idx_publish_time (publish_time)
) COMMENT = '系统通知表';

-- 用户通知关联表
CREATE TABLE IF NOT EXISTS sys_user_notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    notification_id BIGINT NOT NULL COMMENT '通知ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    read_status BOOLEAN DEFAULT FALSE COMMENT '是否已读',
    read_time TIMESTAMP NULL COMMENT '阅读时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_notification_user (notification_id, user_id),
    INDEX idx_notification_id (notification_id),
    INDEX idx_user_id (user_id),
    INDEX idx_read_status (read_status)
) COMMENT = '用户通知关联表';

-- 数据字典表
CREATE TABLE IF NOT EXISTS sys_dict_types (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    dict_code VARCHAR(100) NOT NULL UNIQUE COMMENT '字典编码',
    dict_name VARCHAR(100) NOT NULL COMMENT '字典名称',
    description TEXT COMMENT '字典描述',
    status ENUM('ACTIVE', 'DISABLED') DEFAULT 'ACTIVE' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    INDEX idx_dict_code (dict_code),
    INDEX idx_status (status)
) COMMENT = '数据字典类型表';

-- 数据字典数据表
CREATE TABLE IF NOT EXISTS sys_dict_data (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    dict_type_id BIGINT NOT NULL COMMENT '字典类型ID',
    dict_label VARCHAR(100) NOT NULL COMMENT '字典标签',
    dict_value VARCHAR(100) NOT NULL COMMENT '字典值',
    dict_sort INT DEFAULT 0 COMMENT '字典排序',
    css_class VARCHAR(100) COMMENT 'CSS类名',
    list_class VARCHAR(100) COMMENT '列表样式',
    is_default BOOLEAN DEFAULT FALSE COMMENT '是否默认',
    status ENUM('ACTIVE', 'DISABLED') DEFAULT 'ACTIVE' COMMENT '状态',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    INDEX idx_dict_type_id (dict_type_id),
    INDEX idx_dict_value (dict_value),
    INDEX idx_status (status),
    INDEX idx_dict_sort (dict_sort)
) COMMENT = '数据字典数据表';

-- 系统监控表
CREATE TABLE IF NOT EXISTS sys_monitoring (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    metric_name VARCHAR(100) NOT NULL COMMENT '指标名称',
    metric_value DECIMAL(15,4) COMMENT '指标值',
    metric_unit VARCHAR(20) COMMENT '指标单位',
    metric_type ENUM('CPU', 'MEMORY', 'DISK', 'NETWORK', 'DATABASE', 'APPLICATION') COMMENT '指标类型',
    server_ip VARCHAR(45) COMMENT '服务器IP',
    server_name VARCHAR(100) COMMENT '服务器名称',
    status ENUM('NORMAL', 'WARNING', 'CRITICAL') DEFAULT 'NORMAL' COMMENT '状态',
    threshold_warning DECIMAL(15,4) COMMENT '警告阈值',
    threshold_critical DECIMAL(15,4) COMMENT '严重阈值',
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '采集时间',
    INDEX idx_metric_name (metric_name),
    INDEX idx_metric_type (metric_type),
    INDEX idx_server_ip (server_ip),
    INDEX idx_collected_at (collected_at),
    INDEX idx_status (status)
) COMMENT = '系统监控数据表';

-- 数据备份记录表
CREATE TABLE IF NOT EXISTS sys_backup_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    backup_name VARCHAR(200) NOT NULL COMMENT '备份名称',
    backup_type ENUM('FULL', 'INCREMENTAL', 'DIFFERENTIAL') DEFAULT 'FULL' COMMENT '备份类型',
    backup_path VARCHAR(500) COMMENT '备份路径',
    file_size BIGINT COMMENT '文件大小(字节)',
    database_name VARCHAR(100) COMMENT '数据库名称',
    table_names TEXT COMMENT '备份表名列表',
    backup_status ENUM('RUNNING', 'SUCCESS', 'FAILED') DEFAULT 'RUNNING' COMMENT '备份状态',
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
    end_time TIMESTAMP NULL COMMENT '结束时间',
    duration BIGINT COMMENT '备份耗时(毫秒)',
    error_message TEXT COMMENT '错误信息',
    created_by BIGINT COMMENT '创建人ID',
    INDEX idx_backup_type (backup_type),
    INDEX idx_backup_status (backup_status),
    INDEX idx_start_time (start_time),
    INDEX idx_database_name (database_name)
) COMMENT = '数据备份记录表';

-- 系统菜单表
CREATE TABLE IF NOT EXISTS sys_menus (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    menu_code VARCHAR(100) NOT NULL UNIQUE COMMENT '菜单编码',
    menu_name VARCHAR(100) NOT NULL COMMENT '菜单名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父菜单ID',
    menu_type ENUM('DIRECTORY', 'MENU', 'BUTTON') DEFAULT 'MENU' COMMENT '菜单类型',
    path VARCHAR(200) COMMENT '路由路径',
    component VARCHAR(200) COMMENT '组件路径',
    icon VARCHAR(100) COMMENT '菜单图标',
    sort_order INT DEFAULT 0 COMMENT '排序序号',
    visible BOOLEAN DEFAULT TRUE COMMENT '是否可见',
    status ENUM('ACTIVE', 'DISABLED') DEFAULT 'ACTIVE' COMMENT '菜单状态',
    permission_code VARCHAR(100) COMMENT '权限编码',
    cache_flag BOOLEAN DEFAULT FALSE COMMENT '是否缓存',
    external_link BOOLEAN DEFAULT FALSE COMMENT '是否外链',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    INDEX idx_menu_code (menu_code),
    INDEX idx_parent_id (parent_id),
    INDEX idx_status (status),
    INDEX idx_sort_order (sort_order)
) COMMENT = '系统菜单表';

-- 角色菜单关联表
CREATE TABLE IF NOT EXISTS sys_role_menus (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL COMMENT '角色ID',
    menu_id BIGINT NOT NULL COMMENT '菜单ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    UNIQUE KEY uk_role_menu (role_id, menu_id),
    INDEX idx_role_id (role_id),
    INDEX idx_menu_id (menu_id)
) COMMENT = '角色菜单关联表';

-- 系统任务表
CREATE TABLE IF NOT EXISTS sys_tasks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_name VARCHAR(100) NOT NULL COMMENT '任务名称',
    task_group VARCHAR(50) COMMENT '任务分组',
    task_class VARCHAR(200) COMMENT '任务类名',
    cron_expression VARCHAR(100) COMMENT 'Cron表达式',
    description TEXT COMMENT '任务描述',
    task_params TEXT COMMENT '任务参数',
    task_status ENUM('ENABLED', 'DISABLED', 'RUNNING', 'PAUSED') DEFAULT 'DISABLED' COMMENT '任务状态',
    last_execution_time TIMESTAMP NULL COMMENT '最后执行时间',
    next_execution_time TIMESTAMP NULL COMMENT '下次执行时间',
    execution_count BIGINT DEFAULT 0 COMMENT '执行次数',
    failure_count BIGINT DEFAULT 0 COMMENT '失败次数',
    max_retry_count INT DEFAULT 3 COMMENT '最大重试次数',
    timeout_seconds INT DEFAULT 300 COMMENT '超时时间(秒)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT '创建人ID',
    updated_by BIGINT COMMENT '更新人ID',
    INDEX idx_task_name (task_name),
    INDEX idx_task_group (task_group),
    INDEX idx_task_status (task_status),
    INDEX idx_next_execution_time (next_execution_time)
) COMMENT = '系统定时任务表';

-- 任务执行日志表
CREATE TABLE IF NOT EXISTS sys_task_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id BIGINT NOT NULL COMMENT '任务ID',
    task_name VARCHAR(100) COMMENT '任务名称',
    execution_status ENUM('SUCCESS', 'FAILURE', 'RUNNING') COMMENT '执行状态',
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
    end_time TIMESTAMP NULL COMMENT '结束时间',
    execution_time BIGINT COMMENT '执行耗时(毫秒)',
    result_message TEXT COMMENT '执行结果',
    error_message TEXT COMMENT '错误信息',
    server_ip VARCHAR(45) COMMENT '执行服务器IP',
    INDEX idx_task_id (task_id),
    INDEX idx_task_name (task_name),
    INDEX idx_execution_status (execution_status),
    INDEX idx_start_time (start_time)
) COMMENT = '任务执行日志表';

-- 初始化基础数据
INSERT INTO sys_roles (role_code, role_name, description, role_type) VALUES
('SUPER_ADMIN', '超级管理员', '系统超级管理员，拥有所有权限', 'SYSTEM'),
('ADMIN', '管理员', '平台管理员，负责平台运营管理', 'SYSTEM'),
('SOURCE_ORG_ADMIN', '案源机构管理员', '案源机构管理员', 'ORGANIZATION'),
('SOURCE_ORG_USER', '案源机构用户', '案源机构普通用户', 'ORGANIZATION'),
('DISPOSAL_ORG_ADMIN', '处置机构管理员', '处置机构管理员', 'ORGANIZATION'),
('DISPOSAL_ORG_USER', '处置机构用户', '处置机构普通用户', 'ORGANIZATION'),
('AUDITOR', '审核员', '机构审核专员', 'SYSTEM');

-- 初始化权限数据
INSERT INTO sys_permissions (permission_code, permission_name, description, resource_type, resource_path) VALUES
-- 系统管理权限
('system:user:list', '用户列表', '查看用户列表', 'API', '/api/system/users'),
('system:user:create', '创建用户', '创建新用户', 'API', '/api/system/users'),
('system:user:update', '更新用户', '更新用户信息', 'API', '/api/system/users/*'),
('system:user:delete', '删除用户', '删除用户', 'API', '/api/system/users/*'),
('system:user:reset-password', '重置密码', '重置用户密码', 'API', '/api/system/users/*/reset-password'),
('system:role:list', '角色列表', '查看角色列表', 'API', '/api/system/roles'),
('system:role:create', '创建角色', '创建新角色', 'API', '/api/system/roles'),
('system:role:update', '更新角色', '更新角色信息', 'API', '/api/system/roles/*'),
('system:role:delete', '删除角色', '删除角色', 'API', '/api/system/roles/*'),
('system:config:list', '配置列表', '查看系统配置', 'API', '/api/system/configs'),
('system:config:update', '更新配置', '更新系统配置', 'API', '/api/system/configs/*'),
('system:log:list', '日志列表', '查看系统日志', 'API', '/api/system/logs'),
('system:backup:list', '备份列表', '查看备份记录', 'API', '/api/system/backups'),
('system:backup:create', '创建备份', '创建数据备份', 'API', '/api/system/backups'),
('system:monitor:view', '系统监控', '查看系统监控', 'API', '/api/system/monitoring');

-- 初始化配置数据
INSERT INTO sys_configs (config_key, config_value, config_group, config_name, description, value_type) VALUES
('system.title', 'DRMP全国分散诉调平台', 'system', '系统标题', '系统页面标题', 'STRING'),
('system.logo.url', '/assets/logo.png', 'system', '系统Logo', '系统Logo图片地址', 'STRING'),
('security.password.min.length', '8', 'security', '密码最小长度', '用户密码最小长度要求', 'NUMBER'),
('security.password.complexity', 'true', 'security', '密码复杂度检查', '是否启用密码复杂度检查', 'BOOLEAN'),
('security.login.max.failure', '5', 'security', '最大登录失败次数', '连续登录失败后锁定账户', 'NUMBER'),
('security.session.timeout', '1800', 'security', '会话超时时间', '用户会话超时时间(秒)', 'NUMBER'),
('file.upload.max.size', '10485760', 'file', '文件上传大小限制', '单个文件上传大小限制(字节)', 'NUMBER'),
('file.upload.allowed.types', '.jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx', 'file', '允许上传的文件类型', '允许上传的文件扩展名', 'STRING'),
('notification.email.enabled', 'true', 'notification', '邮件通知', '是否启用邮件通知', 'BOOLEAN'),
('notification.sms.enabled', 'false', 'notification', '短信通知', '是否启用短信通知', 'BOOLEAN');

-- 初始化字典类型
INSERT INTO sys_dict_types (dict_code, dict_name, description) VALUES
('user_status', '用户状态', '用户账户状态枚举'),
('organization_type', '机构类型', '机构类型分类'),
('case_status', '案件状态', '案件处理状态'),
('notification_type', '通知类型', '系统通知类型分类'),
('operation_type', '操作类型', '用户操作类型分类');

-- 初始化字典数据
INSERT INTO sys_dict_data (dict_type_id, dict_label, dict_value, dict_sort, css_class) VALUES
-- 用户状态
(1, '正常', 'ACTIVE', 1, 'success'),
(1, '禁用', 'DISABLED', 2, 'danger'),
(1, '锁定', 'LOCKED', 3, 'warning'),
(1, '待审核', 'PENDING', 4, 'info'),
-- 机构类型
(2, '案源机构', 'SOURCE', 1, 'primary'),
(2, '处置机构', 'DISPOSAL', 2, 'success'),
-- 案件状态
(3, '待分配', 'PENDING', 1, 'info'),
(3, '处理中', 'PROCESSING', 2, 'warning'),
(3, '已完成', 'COMPLETED', 3, 'success'),
(3, '已取消', 'CANCELLED', 4, 'danger'),
-- 通知类型
(4, '系统通知', 'SYSTEM', 1, 'info'),
(4, '业务通知', 'BUSINESS', 2, 'primary'),
(4, '安全通知', 'SECURITY', 3, 'warning'),
(4, '维护通知', 'MAINTENANCE', 4, 'danger'),
-- 操作类型
(5, '创建', 'CREATE', 1, 'success'),
(5, '更新', 'UPDATE', 2, 'primary'),
(5, '删除', 'DELETE', 3, 'danger'),
(5, '查询', 'QUERY', 4, 'info'),
(5, '登录', 'LOGIN', 5, 'success'),
(5, '登出', 'LOGOUT', 6, 'info'),
(5, '导出', 'EXPORT', 7, 'warning'),
(5, '导入', 'IMPORT', 8, 'warning');

-- 初始化菜单数据
INSERT INTO sys_menus (menu_code, menu_name, parent_id, menu_type, path, component, icon, sort_order) VALUES
-- 一级菜单
('dashboard', '工作台', 0, 'MENU', '/dashboard', 'Dashboard', 'dashboard', 1),
('case_management', '案件管理', 0, 'DIRECTORY', '/case', null, 'file-text', 2),
('organization_management', '机构管理', 0, 'DIRECTORY', '/organization', null, 'bank', 3),
('report_center', '报表中心', 0, 'DIRECTORY', '/report', null, 'bar-chart', 4),
('system_management', '系统管理', 0, 'DIRECTORY', '/system', null, 'setting', 5),
-- 案件管理子菜单
('case_list', '案件列表', 2, 'MENU', '/case/list', 'case/CaseList', null, 1),
('case_package', '案件包管理', 2, 'MENU', '/case/package', 'case/CasePackageList', null, 2),
('case_assignment', '智能分案', 2, 'MENU', '/case/assignment', 'case/IntelligentAssignment', null, 3),
('case_market', '案件市场', 2, 'MENU', '/case/market', 'case/CaseMarket', null, 4),
-- 机构管理子菜单
('source_org', '案源机构', 3, 'MENU', '/organization/source', 'organization/SourceOrgList', null, 1),
('disposal_org', '处置机构', 3, 'MENU', '/organization/disposal', 'organization/DisposalOrgList', null, 2),
('org_audit', '机构审核', 3, 'MENU', '/organization/audit', 'organization/OrgAudit', null, 3),
-- 报表中心子菜单
('report_dashboard', '数据看板', 4, 'MENU', '/report/dashboard', 'report/ReportDashboard', null, 1),
('report_analysis', '报表分析', 4, 'MENU', '/report/analysis', 'report/ReportAnalysis', null, 2),
-- 系统管理子菜单
('user_management', '用户管理', 5, 'MENU', '/system/user', 'system/UserManagement', null, 1),
('role_management', '角色管理', 5, 'MENU', '/system/role', 'system/RoleManagement', null, 2),
('menu_management', '菜单管理', 5, 'MENU', '/system/menu', 'system/MenuManagement', null, 3),
('permission_management', '权限管理', 5, 'MENU', '/system/permission', 'system/PermissionManagement', null, 4),
('config_management', '配置管理', 5, 'MENU', '/system/config', 'system/ConfigManagement', null, 5),
('log_management', '日志管理', 5, 'MENU', '/system/log', 'system/LogManagement', null, 6);

-- 初始化角色菜单关联
INSERT INTO sys_role_menus (role_id, menu_id) 
SELECT 1, id FROM sys_menus; -- 超级管理员拥有所有菜单权限