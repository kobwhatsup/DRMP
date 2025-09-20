-- DRMP Initial Database Schema
-- Version: 1.0.0
-- Author: DRMP Team

-- Organizations table
CREATE TABLE organizations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    org_code VARCHAR(50) NOT NULL UNIQUE,
    org_name VARCHAR(200) NOT NULL,
    org_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    contact_person VARCHAR(50),
    contact_phone VARCHAR(20),
    email VARCHAR(100),
    address VARCHAR(500),
    business_license VARCHAR(500),
    team_size INT,
    monthly_case_capacity INT,
    current_load_percentage INT,
    cooperation_cases TEXT,
    description TEXT,
    approval_status VARCHAR(20),
    approval_by BIGINT,
    approval_at DATETIME,
    approval_remark VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    version INT DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_org_code (org_code),
    INDEX idx_org_type_status (org_type, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Organization service regions
CREATE TABLE org_service_regions (
    org_id BIGINT NOT NULL,
    region VARCHAR(50) NOT NULL,
    PRIMARY KEY (org_id, region),
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Organization business scopes
CREATE TABLE org_business_scopes (
    org_id BIGINT NOT NULL,
    scope VARCHAR(50) NOT NULL,
    PRIMARY KEY (org_id, scope),
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Organization disposal types
CREATE TABLE org_disposal_types (
    org_id BIGINT NOT NULL,
    disposal_type VARCHAR(50) NOT NULL,
    PRIMARY KEY (org_id, disposal_type),
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Organization settlement methods
CREATE TABLE org_settlement_methods (
    org_id BIGINT NOT NULL,
    settlement_method VARCHAR(50) NOT NULL,
    PRIMARY KEY (org_id, settlement_method),
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    real_name VARCHAR(50),
    phone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    organization_id BIGINT,
    last_login_at DATETIME,
    last_login_ip VARCHAR(50),
    login_attempts INT DEFAULT 0,
    locked_until DATETIME,
    password_changed_at DATETIME,
    avatar VARCHAR(500),
    remark VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    version INT DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_org_id (organization_id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Roles table
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    organization_type VARCHAR(20),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    version INT DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_role_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Permissions table
CREATE TABLE permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    version INT DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_permission_code (code),
    INDEX idx_permission_resource (resource)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User roles mapping
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Role permissions mapping
CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Case packages table
CREATE TABLE case_packages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    package_code VARCHAR(50) NOT NULL UNIQUE,
    package_name VARCHAR(200) NOT NULL,
    source_organization_id BIGINT NOT NULL,
    disposal_organization_id BIGINT,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    case_count INT NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    remaining_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    expected_recovery_rate DECIMAL(5,2),
    expected_disposal_days INT,
    preferred_disposal_methods VARCHAR(500),
    assignment_strategy VARCHAR(50),
    assignment_rules JSON,
    published_at DATETIME,
    assigned_at DATETIME,
    accepted_at DATETIME,
    closed_at DATETIME,
    entrust_start_date DATE NOT NULL,
    entrust_end_date DATE NOT NULL,
    description TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    version INT DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_package_code (package_code),
    INDEX idx_source_org (source_organization_id),
    INDEX idx_disposal_org (disposal_organization_id),
    INDEX idx_status (status),
    FOREIGN KEY (source_organization_id) REFERENCES organizations(id),
    FOREIGN KEY (disposal_organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cases table (will be partitioned by year/quarter in production)
CREATE TABLE cases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    case_no VARCHAR(100) NOT NULL UNIQUE,
    case_package_id BIGINT NOT NULL,
    -- Debtor basic info (encrypted)
    debtor_id_card_encrypted VARCHAR(255) NOT NULL,
    debtor_name_encrypted VARCHAR(255) NOT NULL,
    debtor_phone_encrypted VARCHAR(255),
    debtor_gender VARCHAR(10),
    -- Loan info
    loan_contract_no VARCHAR(100),
    loan_product VARCHAR(100),
    loan_amount DECIMAL(15,2) NOT NULL,
    remaining_amount DECIMAL(15,2) NOT NULL,
    overdue_days INT NOT NULL,
    overdue_date DATE,
    -- Case info
    principal VARCHAR(100),
    entrust_start_date DATE NOT NULL,
    entrust_end_date DATE NOT NULL,
    creditor_name VARCHAR(200),
    -- Additional fields stored as JSON for flexibility
    debt_info JSON,
    debtor_info JSON,
    contact_info JSON,
    custom_fields JSON,
    -- Status
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    disposal_status VARCHAR(30),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    version INT DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_case_no (case_no),
    INDEX idx_package_id (case_package_id),
    INDEX idx_overdue_days (overdue_days),
    INDEX idx_status (status),
    FOREIGN KEY (case_package_id) REFERENCES case_packages(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Case documents table
CREATE TABLE case_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    case_id BIGINT NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    document_name VARCHAR(200) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(50),
    upload_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by BIGINT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    version INT DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_case_id (case_id),
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Case package assignments table
CREATE TABLE case_package_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    case_package_id BIGINT NOT NULL,
    source_org_id BIGINT NOT NULL,
    disposal_org_id BIGINT NOT NULL,
    assignment_type VARCHAR(30) NOT NULL,
    assignment_strategy VARCHAR(50),
    assignment_reason VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    responded_at DATETIME,
    response_status VARCHAR(30),
    response_remark VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    version INT DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_package_id (case_package_id),
    INDEX idx_disposal_org (disposal_org_id),
    INDEX idx_status (status),
    FOREIGN KEY (case_package_id) REFERENCES case_packages(id),
    FOREIGN KEY (source_org_id) REFERENCES organizations(id),
    FOREIGN KEY (disposal_org_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- System configuration table
CREATE TABLE system_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT,
    config_type VARCHAR(20) NOT NULL DEFAULT 'STRING',
    description VARCHAR(500),
    is_encrypted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    version INT DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit log table
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    username VARCHAR(50),
    operation VARCHAR(50) NOT NULL,
    resource VARCHAR(100),
    resource_id BIGINT,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    request_method VARCHAR(10),
    request_url VARCHAR(500),
    request_params TEXT,
    response_status INT,
    error_msg TEXT,
    execution_time BIGINT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_operation (operation),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;