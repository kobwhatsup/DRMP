-- 创建机构表
CREATE TABLE IF NOT EXISTS organizations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT '机构名称',
    type VARCHAR(50) NOT NULL COMMENT '机构类型：SOURCE-案源机构, DISPOSAL-处置机构',
    status VARCHAR(50) DEFAULT 'PENDING' COMMENT '状态：PENDING-待审核, ACTIVE-正常, SUSPENDED-停用',
    contact_person VARCHAR(100) COMMENT '联系人',
    contact_phone VARCHAR(20) COMMENT '联系电话',
    email VARCHAR(100) COMMENT '邮箱',
    address TEXT COMMENT '办公地址',
    business_license VARCHAR(255) COMMENT '营业执照路径',
    contract_start_date DATE COMMENT '合同开始日期',
    contract_end_date DATE COMMENT '合同结束日期',
    team_size INT COMMENT '团队规模',
    monthly_case_capacity INT COMMENT '每月处理案件数量',
    current_load INT DEFAULT 0 COMMENT '当前负载',
    service_regions TEXT COMMENT '服务区域（JSON）',
    business_scope TEXT COMMENT '业务范围（JSON）',
    disposal_types TEXT COMMENT '处置类型（JSON）',
    settlement_type VARCHAR(50) COMMENT '结算方式',
    description TEXT COMMENT '机构描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    INDEX idx_org_type (type),
    INDEX idx_org_status (status),
    INDEX idx_org_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='机构表';

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
    real_name VARCHAR(100) COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号（加密）',
    email VARCHAR(100) COMMENT '邮箱',
    organization_id BIGINT COMMENT '所属机构ID',
    role VARCHAR(50) NOT NULL COMMENT '角色',
    status VARCHAR(50) DEFAULT 'ACTIVE' COMMENT '状态',
    last_login_time TIMESTAMP NULL COMMENT '最后登录时间',
    login_attempts INT DEFAULT 0 COMMENT '登录尝试次数',
    locked_until TIMESTAMP NULL COMMENT '锁定截止时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_org_id (organization_id),
    INDEX idx_status (status),
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 创建案件包表
CREATE TABLE IF NOT EXISTS case_packages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    package_name VARCHAR(255) NOT NULL COMMENT '案件包名称',
    source_org_id BIGINT NOT NULL COMMENT '案源机构ID',
    disposal_org_id BIGINT COMMENT '处置机构ID',
    case_count INT DEFAULT 0 COMMENT '案件数量',
    total_amount DECIMAL(15,2) COMMENT '总欠款金额',
    expected_recovery_rate DECIMAL(5,2) COMMENT '期望回款率',
    expected_disposal_days INT COMMENT '期望处置周期（天）',
    disposal_types TEXT COMMENT '偏好处置方式（JSON）',
    assignment_strategy VARCHAR(100) COMMENT '分案策略',
    status VARCHAR(50) DEFAULT 'PENDING' COMMENT '状态',
    published_at TIMESTAMP NULL COMMENT '发布时间',
    assigned_at TIMESTAMP NULL COMMENT '分配时间',
    closed_at TIMESTAMP NULL COMMENT '关闭时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    INDEX idx_source_org (source_org_id),
    INDEX idx_disposal_org (disposal_org_id),
    INDEX idx_status (status),
    INDEX idx_published_at (published_at),
    FOREIGN KEY (source_org_id) REFERENCES organizations(id),
    FOREIGN KEY (disposal_org_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='案件包表';

-- 创建案件表（考虑分表）
CREATE TABLE IF NOT EXISTS cases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    case_package_id BIGINT NOT NULL COMMENT '案件包ID',
    loan_no VARCHAR(100) NOT NULL COMMENT '借据编号',
    debtor_id_card VARCHAR(255) NOT NULL COMMENT '债务人身份证（加密）',
    debtor_name VARCHAR(100) NOT NULL COMMENT '债务人姓名（加密）',
    debtor_phone VARCHAR(255) COMMENT '债务人手机号（加密）',
    gender VARCHAR(10) COMMENT '性别',
    loan_product VARCHAR(100) COMMENT '借款产品',
    loan_amount DECIMAL(15,2) NOT NULL COMMENT '贷款金额',
    remaining_amount DECIMAL(15,2) NOT NULL COMMENT '剩余应还金额',
    overdue_days INT COMMENT '逾期天数',
    overdue_date DATE COMMENT '逾期日期',
    commission_start_date DATE COMMENT '委托开始日期',
    commission_end_date DATE COMMENT '委托结束日期',
    capital_name VARCHAR(255) COMMENT '资方名称',
    status VARCHAR(50) DEFAULT 'PENDING' COMMENT '案件状态',
    disposal_status VARCHAR(50) COMMENT '处置状态',
    recovery_amount DECIMAL(15,2) DEFAULT 0 COMMENT '已回款金额',
    last_contact_date TIMESTAMP NULL COMMENT '最后联系时间',
    assigned_to BIGINT COMMENT '分配给（作业人员ID）',
    extra_data JSON COMMENT '扩展字段（JSON存储非核心字段）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_package_id (case_package_id),
    INDEX idx_loan_no (loan_no),
    INDEX idx_debtor_id (debtor_id_card(50)),
    INDEX idx_status (status),
    INDEX idx_overdue_days (overdue_days),
    INDEX idx_assigned_to (assigned_to),
    FOREIGN KEY (case_package_id) REFERENCES case_packages(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='案件表';

-- 创建分案记录表
CREATE TABLE IF NOT EXISTS assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    case_package_id BIGINT NOT NULL COMMENT '案件包ID',
    source_org_id BIGINT NOT NULL COMMENT '案源机构ID',
    disposal_org_id BIGINT NOT NULL COMMENT '处置机构ID',
    assignment_type VARCHAR(50) COMMENT '分案类型',
    assignment_strategy VARCHAR(100) COMMENT '分案策略',
    assignment_reason TEXT COMMENT '分案依据',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '分案时间',
    accepted_at TIMESTAMP NULL COMMENT '接受时间',
    rejected_at TIMESTAMP NULL COMMENT '拒绝时间',
    status VARCHAR(50) DEFAULT 'PENDING' COMMENT '状态',
    created_by BIGINT,
    INDEX idx_package_id (case_package_id),
    INDEX idx_source_org (source_org_id),
    INDEX idx_disposal_org (disposal_org_id),
    INDEX idx_assigned_at (assigned_at),
    INDEX idx_status (status),
    FOREIGN KEY (case_package_id) REFERENCES case_packages(id),
    FOREIGN KEY (source_org_id) REFERENCES organizations(id),
    FOREIGN KEY (disposal_org_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分案记录表';

-- 创建回款记录表
CREATE TABLE IF NOT EXISTS payment_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    case_id BIGINT NOT NULL COMMENT '案件ID',
    payment_amount DECIMAL(15,2) NOT NULL COMMENT '回款金额',
    payment_date DATE NOT NULL COMMENT '回款日期',
    payment_type VARCHAR(50) COMMENT '回款类型',
    payment_method VARCHAR(50) COMMENT '支付方式',
    voucher_path VARCHAR(500) COMMENT '凭证文件路径',
    reconciliation_status VARCHAR(50) DEFAULT 'PENDING' COMMENT '对账状态',
    remark TEXT COMMENT '备注',
    submitted_by BIGINT COMMENT '提交人ID',
    confirmed_by BIGINT COMMENT '确认人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_case_id (case_id),
    INDEX idx_payment_date (payment_date),
    INDEX idx_reconciliation_status (reconciliation_status),
    FOREIGN KEY (case_id) REFERENCES cases(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='回款记录表';

-- 创建操作日志表
CREATE TABLE IF NOT EXISTS operation_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT COMMENT '操作用户ID',
    username VARCHAR(100) COMMENT '用户名',
    operation_type VARCHAR(50) COMMENT '操作类型',
    operation_module VARCHAR(50) COMMENT '操作模块',
    operation_content TEXT COMMENT '操作内容',
    target_id BIGINT COMMENT '操作目标ID',
    target_type VARCHAR(50) COMMENT '操作目标类型',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    result VARCHAR(20) COMMENT '操作结果',
    error_msg TEXT COMMENT '错误信息',
    operation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_operation_time (operation_time),
    INDEX idx_operation_type (operation_type),
    INDEX idx_target (target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 创建文件表
CREATE TABLE IF NOT EXISTS files (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    original_name VARCHAR(255) COMMENT '原始文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_size BIGINT COMMENT '文件大小（字节）',
    file_type VARCHAR(50) COMMENT '文件类型',
    mime_type VARCHAR(100) COMMENT 'MIME类型',
    business_type VARCHAR(50) COMMENT '业务类型',
    business_id BIGINT COMMENT '业务ID',
    upload_user_id BIGINT COMMENT '上传用户ID',
    is_encrypted BOOLEAN DEFAULT FALSE COMMENT '是否加密',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_business (business_type, business_id),
    INDEX idx_upload_user (upload_user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文件表';

-- 插入默认管理员用户
INSERT INTO users (username, password, real_name, role, status) 
VALUES ('admin', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WfSr/lFr7vsK01Nvo6kqK', '系统管理员', 'ADMIN', 'ACTIVE');