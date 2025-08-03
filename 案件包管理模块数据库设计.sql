-- ============================================
-- DRMP 案件包管理模块数据库设计
-- ============================================

-- 案件包主表
CREATE TABLE case_packages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    package_name VARCHAR(200) NOT NULL COMMENT '案件包名称',
    package_code VARCHAR(100) NOT NULL UNIQUE COMMENT '案件包编号',
    source_org_id BIGINT NOT NULL COMMENT '案源机构ID',
    package_type ENUM('MEDIATION', 'LITIGATION', 'MIXED') DEFAULT 'MIXED' COMMENT '包类型：调解、诉讼、混合',
    case_count INT DEFAULT 0 COMMENT '案件数量',
    total_amount DECIMAL(18,2) DEFAULT 0.00 COMMENT '总欠款金额',
    avg_amount DECIMAL(18,2) DEFAULT 0.00 COMMENT '平均案件金额',
    min_amount DECIMAL(18,2) DEFAULT 0.00 COMMENT '最小案件金额',
    max_amount DECIMAL(18,2) DEFAULT 0.00 COMMENT '最大案件金额',
    avg_overdue_days INT DEFAULT 0 COMMENT '平均逾期天数',
    min_overdue_days INT DEFAULT 0 COMMENT '最小逾期天数',
    max_overdue_days INT DEFAULT 0 COMMENT '最大逾期天数',
    
    -- 处置要求
    expected_recovery_rate DECIMAL(5,2) COMMENT '期望回款率(%)',
    max_disposal_period INT COMMENT '最大处置周期(天)',
    preferred_disposal_methods JSON COMMENT '偏好处置方式配置',
    
    -- 分案策略
    assignment_strategy ENUM('REGION', 'AMOUNT', 'OVERDUE_DAYS', 'PERFORMANCE', 'LOAD_BALANCE', 'INTELLIGENT') NOT NULL COMMENT '分案策略',
    assignment_config JSON COMMENT '分案配置详情',
    auto_assignment BOOLEAN DEFAULT FALSE COMMENT '是否启用自动分案',
    
    -- 状态管理
    status ENUM('DRAFT', 'PENDING_ASSIGNMENT', 'ASSIGNING', 'ASSIGNED', 'PROCESSING', 'COMPLETED', 'CANCELLED') DEFAULT 'DRAFT' COMMENT '状态',
    publish_time TIMESTAMP NULL COMMENT '发布时间',
    assignment_deadline TIMESTAMP NULL COMMENT '分案截止时间',
    disposal_deadline TIMESTAMP NULL COMMENT '处置截止时间',
    
    -- 统计信息
    assigned_count INT DEFAULT 0 COMMENT '已分配案件数',
    processing_count INT DEFAULT 0 COMMENT '处置中案件数',
    completed_count INT DEFAULT 0 COMMENT '已完成案件数',
    recovered_amount DECIMAL(18,2) DEFAULT 0.00 COMMENT '已回款金额',
    recovery_rate DECIMAL(5,2) DEFAULT 0.00 COMMENT '当前回款率',
    
    -- 审计字段
    created_by BIGINT NOT NULL COMMENT '创建人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT COMMENT '更新人ID',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_source_org (source_org_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_package_code (package_code),
    INDEX idx_assignment_strategy (assignment_strategy)
) COMMENT '案件包主表';

-- 案件详情表（考虑分表）
CREATE TABLE case_details (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    case_package_id BIGINT NOT NULL COMMENT '所属案件包ID',
    case_number VARCHAR(100) NOT NULL COMMENT '案件编号（借据编号）',
    
    -- 债务人基本信息
    debtor_id_card VARCHAR(32) NOT NULL COMMENT '身份证号（加密）',
    debtor_name VARCHAR(100) NOT NULL COMMENT '债务人姓名',
    debtor_phone VARCHAR(20) COMMENT '手机号',
    debtor_gender ENUM('M', 'F', 'U') COMMENT '性别',
    debtor_education VARCHAR(50) COMMENT '学历',
    debtor_nation VARCHAR(50) COMMENT '民族',
    debtor_marriage VARCHAR(50) COMMENT '婚姻状况',
    
    -- 债务人地址信息
    registered_province VARCHAR(50) COMMENT '户籍省份',
    registered_city VARCHAR(50) COMMENT '户籍城市',
    registered_address TEXT COMMENT '户籍详细地址',
    current_province VARCHAR(50) COMMENT '现居省份',
    current_city VARCHAR(50) COMMENT '现居城市',
    current_address TEXT COMMENT '现居详细地址',
    
    -- 债务人工作信息
    work_company VARCHAR(200) COMMENT '工作单位',
    work_position VARCHAR(100) COMMENT '职务',
    work_start_date DATE COMMENT '入职时间',
    work_phone VARCHAR(20) COMMENT '单位电话',
    work_province VARCHAR(50) COMMENT '单位省份',
    work_city VARCHAR(50) COMMENT '单位城市',
    work_address TEXT COMMENT '单位地址',
    
    -- 借款项目信息
    loan_project VARCHAR(200) NOT NULL COMMENT '借款项目/产品线',
    contract_number VARCHAR(100) COMMENT '合同号',
    loan_amount DECIMAL(15,2) NOT NULL COMMENT '贷款金额',
    remaining_amount DECIMAL(15,2) NOT NULL COMMENT '剩余应还金额',
    overdue_days INT NOT NULL COMMENT '逾期天数',
    principal_amount DECIMAL(15,2) COMMENT '本金金额',
    interest_amount DECIMAL(15,2) COMMENT '利息金额',
    penalty_amount DECIMAL(15,2) COMMENT '罚息金额',
    
    -- 委托信息
    entrust_party VARCHAR(200) NOT NULL COMMENT '委托方',
    entrust_start_time TIMESTAMP NOT NULL COMMENT '委托开始时间',
    entrust_end_time TIMESTAMP NOT NULL COMMENT '委托到期时间',
    funding_party VARCHAR(200) NOT NULL COMMENT '资方名称',
    first_entrust_time TIMESTAMP COMMENT '首次委托时间',
    
    -- 贷款详细信息
    contract_amount DECIMAL(15,2) COMMENT '合同金额',
    total_periods INT COMMENT '总期数',
    monthly_payment DECIMAL(15,2) COMMENT '月还款额',
    monthly_interest_rate DECIMAL(8,6) COMMENT '月利率',
    monthly_fee_rate DECIMAL(8,6) COMMENT '月费率',
    annual_interest_rate DECIMAL(8,6) COMMENT '年化利率',
    loan_date DATE COMMENT '放款日',
    first_payment_date DATE COMMENT '首期还款日',
    loan_due_date DATE COMMENT '贷款到期日',
    payment_method VARCHAR(100) COMMENT '还款方式',
    min_payment DECIMAL(15,2) COMMENT '最低还款额',
    paid_amount DECIMAL(15,2) COMMENT '已还金额',
    paid_periods INT COMMENT '已还期数',
    is_completed BOOLEAN DEFAULT FALSE COMMENT '是否完结',
    remaining_periods INT COMMENT '未到期剩余期数',
    remaining_principal DECIMAL(15,2) COMMENT '剩余未到期本金',
    remaining_interest_rate DECIMAL(8,6) COMMENT '剩余未到期利率',
    monthly_remaining_principal DECIMAL(15,2) COMMENT '月初剩余本金',
    overdue_date DATE COMMENT '逾期日期',
    outstanding_interest DECIMAL(15,2) COMMENT '尚欠利息',
    overdue_penalty DECIMAL(15,2) COMMENT '逾期违约金',
    penalty_interest_rate DECIMAL(8,6) COMMENT '罚息利率',
    overdue_penalty_interest DECIMAL(15,2) COMMENT '逾期罚息',
    remaining_payment_periods INT COMMENT '剩余还款期数',
    overdue_m_value INT COMMENT '逾期M值',
    preferential_policy TEXT COMMENT '优惠政策',
    
    -- 商品信息
    product_name VARCHAR(200) COMMENT '贷款商品名称',
    product_type VARCHAR(100) COMMENT '商品类型',
    product_price DECIMAL(15,2) COMMENT '商品价格',
    product_down_payment DECIMAL(15,2) COMMENT '商品首付',
    
    -- 渠道信息
    channel_name VARCHAR(200) COMMENT '渠道名称',
    channel_type VARCHAR(100) COMMENT '渠道类型',
    has_jurisdiction_agreement BOOLEAN DEFAULT FALSE COMMENT '是否约定管辖',
    
    -- 其他债权信息
    funding_nature VARCHAR(100) COMMENT '资方性质',
    debtor_number VARCHAR(100) COMMENT '债务人编号',
    total_debt_amount DECIMAL(15,2) COMMENT '债权总额',
    guarantor VARCHAR(200) COMMENT '代偿方',
    guarantee_fee DECIMAL(15,2) COMMENT '担保费',
    payment_method_type VARCHAR(100) COMMENT '还款支付方式',
    account_number VARCHAR(50) COMMENT '账号',
    bank_name VARCHAR(200) COMMENT '开户行',
    
    -- 自定义字段（支持扩展）
    custom_field_1 VARCHAR(500) COMMENT '自定义字段1',
    custom_field_2 VARCHAR(500) COMMENT '自定义字段2',
    custom_field_3 VARCHAR(500) COMMENT '自定义字段3',
    custom_field_4 VARCHAR(500) COMMENT '自定义字段4',
    custom_field_5 VARCHAR(500) COMMENT '自定义字段5',
    custom_field_6 VARCHAR(500) COMMENT '自定义字段6',
    custom_field_7 VARCHAR(500) COMMENT '自定义字段7',
    custom_field_8 VARCHAR(500) COMMENT '自定义字段8',
    custom_field_9 VARCHAR(500) COMMENT '自定义字段9',
    custom_field_10 VARCHAR(500) COMMENT '自定义字段10',
    
    -- 处置状态
    disposal_status ENUM('PENDING', 'ASSIGNED', 'PROCESSING', 'MEDIATION_SUCCESS', 'LITIGATION_FILED', 'COMPLETED', 'CLOSED') DEFAULT 'PENDING' COMMENT '处置状态',
    assigned_org_id BIGINT COMMENT '分配的处置机构ID',
    assigned_at TIMESTAMP NULL COMMENT '分配时间',
    disposal_start_time TIMESTAMP NULL COMMENT '处置开始时间',
    disposal_end_time TIMESTAMP NULL COMMENT '处置结束时间',
    current_recovered_amount DECIMAL(15,2) DEFAULT 0.00 COMMENT '当前回款金额',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_case_number (case_number),
    INDEX idx_case_package (case_package_id),
    INDEX idx_debtor_id (debtor_id_card),
    INDEX idx_disposal_status (disposal_status),
    INDEX idx_assigned_org (assigned_org_id),
    INDEX idx_remaining_amount (remaining_amount),
    INDEX idx_overdue_days (overdue_days),
    INDEX idx_current_province (current_province),
    INDEX idx_loan_project (loan_project)
) COMMENT '案件详情表';

-- 联系人信息表
CREATE TABLE case_contacts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    case_id BIGINT NOT NULL COMMENT '案件ID',
    contact_type ENUM('CONTACT1', 'CONTACT2', 'CONTACT3', 'CONTACT4', 'CONTACT5') NOT NULL COMMENT '联系人类型',
    contact_name VARCHAR(100) COMMENT '联系人姓名',
    contact_phone VARCHAR(20) COMMENT '联系人电话',
    relationship VARCHAR(50) COMMENT '与债务人关系',
    work_company VARCHAR(200) COMMENT '工作单位',
    work_position VARCHAR(100) COMMENT '职务',
    work_province VARCHAR(50) COMMENT '单位省份',
    work_city VARCHAR(50) COMMENT '单位城市',
    work_address TEXT COMMENT '单位地址',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_case_id (case_id),
    INDEX idx_contact_type (contact_type)
) COMMENT '案件联系人信息表';

-- 案件附件表
CREATE TABLE case_attachments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    case_id BIGINT NOT NULL COMMENT '案件ID',
    case_package_id BIGINT NOT NULL COMMENT '案件包ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_size BIGINT COMMENT '文件大小（字节）',
    file_type VARCHAR(100) COMMENT '文件类型',
    attachment_type ENUM('CONTRACT', 'ID_CARD', 'LOAN_VOUCHER', 'PAYMENT_PROOF', 'OTHER') COMMENT '附件类型',
    description TEXT COMMENT '文件描述',
    upload_status ENUM('UPLOADING', 'SUCCESS', 'FAILED') DEFAULT 'UPLOADING' COMMENT '上传状态',
    
    uploaded_by BIGINT NOT NULL COMMENT '上传人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_case_id (case_id),
    INDEX idx_case_package_id (case_package_id),
    INDEX idx_attachment_type (attachment_type),
    INDEX idx_upload_status (upload_status)
) COMMENT '案件附件表';

-- 案件包分配记录表
CREATE TABLE case_package_assignments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    case_package_id BIGINT NOT NULL COMMENT '案件包ID',
    disposal_org_id BIGINT NOT NULL COMMENT '处置机构ID',
    assignment_type ENUM('AUTO', 'MANUAL', 'BID_WIN') NOT NULL COMMENT '分配类型：自动、手动、竞标',
    assignment_strategy VARCHAR(100) COMMENT '分配策略',
    assignment_score DECIMAL(5,2) COMMENT '匹配得分',
    case_count INT NOT NULL COMMENT '分配案件数量',
    total_amount DECIMAL(18,2) NOT NULL COMMENT '分配案件总金额',
    
    -- 分配条件和结果
    assignment_conditions JSON COMMENT '分配条件',
    assignment_result JSON COMMENT '分配结果详情',
    
    -- 状态管理
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED') DEFAULT 'PENDING' COMMENT '分配状态',
    response_deadline TIMESTAMP COMMENT '响应截止时间',
    accepted_at TIMESTAMP NULL COMMENT '接受时间',
    rejected_at TIMESTAMP NULL COMMENT '拒绝时间',
    rejection_reason TEXT COMMENT '拒绝原因',
    
    -- 处置要求
    disposal_requirements JSON COMMENT '处置要求',
    expected_completion_time TIMESTAMP COMMENT '期望完成时间',
    
    assigned_by BIGINT NOT NULL COMMENT '分配人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_case_package (case_package_id),
    INDEX idx_disposal_org (disposal_org_id),
    INDEX idx_status (status),
    INDEX idx_assignment_type (assignment_type),
    INDEX idx_response_deadline (response_deadline)
) COMMENT '案件包分配记录表';

-- 案件包状态变更历史表
CREATE TABLE case_package_status_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    case_package_id BIGINT NOT NULL COMMENT '案件包ID',
    from_status VARCHAR(50) COMMENT '原状态',
    to_status VARCHAR(50) NOT NULL COMMENT '目标状态',
    change_reason VARCHAR(200) COMMENT '变更原因',
    change_description TEXT COMMENT '变更描述',
    change_data JSON COMMENT '变更相关数据',
    
    operated_by BIGINT NOT NULL COMMENT '操作人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_case_package (case_package_id),
    INDEX idx_to_status (to_status),
    INDEX idx_created_at (created_at)
) COMMENT '案件包状态变更历史表';

-- 案件批量导入记录表
CREATE TABLE case_import_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    import_batch_id VARCHAR(100) NOT NULL COMMENT '导入批次ID',
    case_package_id BIGINT COMMENT '关联的案件包ID',
    file_name VARCHAR(255) NOT NULL COMMENT '导入文件名',
    file_path VARCHAR(500) COMMENT '文件路径',
    file_size BIGINT COMMENT '文件大小',
    
    -- 导入统计
    total_rows INT DEFAULT 0 COMMENT '总行数',
    success_rows INT DEFAULT 0 COMMENT '成功行数',
    failed_rows INT DEFAULT 0 COMMENT '失败行数',
    duplicate_rows INT DEFAULT 0 COMMENT '重复行数',
    
    -- 导入状态
    import_status ENUM('UPLOADING', 'VALIDATING', 'IMPORTING', 'SUCCESS', 'FAILED', 'PARTIAL_SUCCESS') DEFAULT 'UPLOADING' COMMENT '导入状态',
    progress_percentage INT DEFAULT 0 COMMENT '导入进度百分比',
    error_summary TEXT COMMENT '错误汇总',
    error_detail_file VARCHAR(500) COMMENT '详细错误报告文件路径',
    
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    imported_by BIGINT NOT NULL COMMENT '导入人ID',
    
    INDEX idx_import_batch (import_batch_id),
    INDEX idx_case_package (case_package_id),
    INDEX idx_import_status (import_status),
    INDEX idx_imported_by (imported_by),
    INDEX idx_started_at (started_at)
) COMMENT '案件批量导入记录表';

-- 案件包模板表
CREATE TABLE case_package_templates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    template_name VARCHAR(200) NOT NULL COMMENT '模板名称',
    template_type ENUM('IMPORT', 'ASSIGNMENT', 'DISPOSAL') NOT NULL COMMENT '模板类型',
    template_description TEXT COMMENT '模板描述',
    template_config JSON NOT NULL COMMENT '模板配置',
    
    -- 使用统计
    usage_count INT DEFAULT 0 COMMENT '使用次数',
    last_used_at TIMESTAMP NULL COMMENT '最后使用时间',
    
    -- 模板状态
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否活跃',
    is_default BOOLEAN DEFAULT FALSE COMMENT '是否默认模板',
    
    created_by BIGINT NOT NULL COMMENT '创建人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT COMMENT '更新人ID',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_template_type (template_type),
    INDEX idx_is_active (is_active),
    INDEX idx_created_by (created_by)
) COMMENT '案件包模板表';

-- 创建视图：案件包统计视图
CREATE VIEW v_case_package_stats AS
SELECT 
    cp.id,
    cp.package_name,
    cp.source_org_id,
    cp.case_count,
    cp.total_amount,
    cp.status,
    
    -- 分配统计
    COUNT(cpa.id) as assignment_count,
    COUNT(CASE WHEN cpa.status = 'ACCEPTED' THEN 1 END) as accepted_assignments,
    COUNT(CASE WHEN cpa.status = 'REJECTED' THEN 1 END) as rejected_assignments,
    
    -- 处置统计
    COUNT(CASE WHEN cd.disposal_status = 'PROCESSING' THEN 1 END) as processing_cases,
    COUNT(CASE WHEN cd.disposal_status = 'COMPLETED' THEN 1 END) as completed_cases,
    COALESCE(SUM(cd.current_recovered_amount), 0) as total_recovered_amount,
    
    -- 回款率计算
    CASE 
        WHEN cp.total_amount > 0 THEN 
            ROUND((COALESCE(SUM(cd.current_recovered_amount), 0) / cp.total_amount) * 100, 2)
        ELSE 0 
    END as current_recovery_rate
    
FROM case_packages cp
LEFT JOIN case_package_assignments cpa ON cp.id = cpa.case_package_id
LEFT JOIN case_details cd ON cp.id = cd.case_package_id
GROUP BY cp.id, cp.package_name, cp.source_org_id, cp.case_count, cp.total_amount, cp.status;

-- 创建索引优化查询性能
CREATE INDEX idx_case_details_composite ON case_details(case_package_id, disposal_status, remaining_amount);
CREATE INDEX idx_case_package_assignments_composite ON case_package_assignments(case_package_id, status, created_at);

-- 创建分区表（按年份分区）
-- ALTER TABLE case_details PARTITION BY RANGE (YEAR(created_at)) (
--     PARTITION p2024 VALUES LESS THAN (2025),
--     PARTITION p2025 VALUES LESS THAN (2026),
--     PARTITION p2026 VALUES LESS THAN (2027),
--     PARTITION p_future VALUES LESS THAN MAXVALUE
-- );