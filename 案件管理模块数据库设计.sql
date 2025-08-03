-- DRMP 案件管理模块数据库表结构设计
-- 基于PRD需求，包含100+个案件字段，支持案件包管理、智能分案、案件市场等功能

-- ===========================================
-- 1. 案件包表 (case_packages) 
-- 案源机构批量发布的案件包
-- ===========================================
CREATE TABLE case_packages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '案件包ID',
    package_name VARCHAR(255) NOT NULL COMMENT '案件包名称',
    source_org_id BIGINT NOT NULL COMMENT '案源机构ID',
    
    -- 基础信息
    total_cases INT NOT NULL DEFAULT 0 COMMENT '案件总数',
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '总委托金额',
    avg_amount DECIMAL(15,2) COMMENT '平均案件金额',
    min_amount DECIMAL(15,2) COMMENT '最小案件金额',
    max_amount DECIMAL(15,2) COMMENT '最大案件金额',
    
    -- 处置要求
    expected_recovery_rate DECIMAL(5,2) COMMENT '期望回款率(%)',
    disposal_period INT COMMENT '处置周期(天)',
    disposal_methods JSON COMMENT '处置方式偏好 ["MEDIATION", "LITIGATION", "PRESERVATION"]',
    
    -- 分案策略
    assignment_strategy ENUM('REGION', 'AMOUNT', 'OVERDUE_DAYS', 'LOAD_BALANCE', 'PERFORMANCE', 'INTELLIGENT') 
        NOT NULL DEFAULT 'INTELLIGENT' COMMENT '分案策略',
    assignment_config JSON COMMENT '分案配置参数',
    
    -- 状态管理
    status ENUM('DRAFT', 'PUBLISHED', 'ASSIGNING', 'ASSIGNED', 'PROCESSING', 'COMPLETED', 'CANCELLED') 
        NOT NULL DEFAULT 'DRAFT' COMMENT '案件包状态',
    publish_time TIMESTAMP NULL COMMENT '发布时间',
    assignment_deadline TIMESTAMP NULL COMMENT '分案截止时间',
    
    -- 文件信息
    import_file_name VARCHAR(500) COMMENT '导入文件名',
    import_file_path VARCHAR(1000) COMMENT '导入文件路径',
    import_result JSON COMMENT '导入结果统计',
    
    -- 业绩统计
    assigned_cases INT NOT NULL DEFAULT 0 COMMENT '已分配案件数',
    processing_cases INT NOT NULL DEFAULT 0 COMMENT '处理中案件数',
    completed_cases INT NOT NULL DEFAULT 0 COMMENT '已完成案件数',
    recovered_amount DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '已回款金额',
    recovery_rate DECIMAL(5,2) NOT NULL DEFAULT 0 COMMENT '回款率(%)',
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by BIGINT COMMENT '创建人ID',
    
    INDEX idx_source_org_id (source_org_id),
    INDEX idx_status (status),
    INDEX idx_publish_time (publish_time),
    INDEX idx_assignment_strategy (assignment_strategy)
) COMMENT='案件包表';

-- ===========================================
-- 2. 案件表 (cases)
-- 存储具体的案件信息，包含100+个字段
-- 考虑到数据量大，按机构ID进行分表
-- ===========================================
CREATE TABLE cases (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '案件ID',
    case_package_id BIGINT NOT NULL COMMENT '所属案件包ID',
    source_org_id BIGINT NOT NULL COMMENT '案源机构ID',
    disposal_org_id BIGINT NULL COMMENT '处置机构ID',
    
    -- ============ 债务人基本信息 ============
    debtor_name VARCHAR(100) NOT NULL COMMENT '客户姓名',
    debtor_id_card VARCHAR(32) NOT NULL COMMENT '身份证号码(加密)',
    debtor_phone VARCHAR(20) COMMENT '手机号',
    debtor_gender ENUM('MALE', 'FEMALE', 'UNKNOWN') DEFAULT 'UNKNOWN' COMMENT '性别',
    debtor_age INT COMMENT '年龄',
    debtor_education VARCHAR(50) COMMENT '学历',
    debtor_marital_status VARCHAR(20) COMMENT '婚姻状况',
    debtor_occupation VARCHAR(100) COMMENT '职业',
    
    -- 债务人地址信息
    debtor_province VARCHAR(50) COMMENT '户籍省份',
    debtor_city VARCHAR(50) COMMENT '户籍城市',
    debtor_district VARCHAR(50) COMMENT '户籍区县',
    debtor_address VARCHAR(500) COMMENT '详细地址',
    debtor_postal_code VARCHAR(10) COMMENT '邮政编码',
    
    -- 债务人工作信息
    debtor_company VARCHAR(200) COMMENT '工作单位',
    debtor_position VARCHAR(100) COMMENT '职务',
    debtor_income DECIMAL(12,2) COMMENT '月收入',
    debtor_work_province VARCHAR(50) COMMENT '工作单位省份',
    debtor_work_city VARCHAR(50) COMMENT '工作单位城市',
    debtor_work_address VARCHAR(500) COMMENT '工作单位地址',
    
    -- ============ 债务基本信息 ============
    loan_contract_no VARCHAR(100) NOT NULL COMMENT '借据编号',
    product_line VARCHAR(100) COMMENT '借款项目/产品线',
    loan_amount DECIMAL(15,2) NOT NULL COMMENT '贷款金额',
    remaining_amount DECIMAL(15,2) NOT NULL COMMENT '剩余应还金额',
    overdue_days INT NOT NULL DEFAULT 0 COMMENT '逾期天数',
    overdue_amount DECIMAL(15,2) COMMENT '逾期金额',
    interest_rate DECIMAL(8,4) COMMENT '利率',
    loan_date DATE COMMENT '放款日期',
    due_date DATE COMMENT '到期日期',
    
    -- 委托信息
    entrust_start_date DATE COMMENT '委托开始时间',
    entrust_end_date DATE COMMENT '委托到期时间',
    funding_party VARCHAR(200) COMMENT '资方名称',
    guarantee_company VARCHAR(200) COMMENT '担保公司',
    guarantee_amount DECIMAL(15,2) COMMENT '担保金额',
    
    -- ============ 紧急联系人信息 ============
    contact1_name VARCHAR(100) COMMENT '紧急联系人1姓名',
    contact1_phone VARCHAR(20) COMMENT '紧急联系人1电话',
    contact1_relation VARCHAR(50) COMMENT '与紧急联系人1关系',
    contact1_company VARCHAR(200) COMMENT '紧急联系人1单位',
    contact1_position VARCHAR(100) COMMENT '紧急联系人1职务',
    contact1_province VARCHAR(50) COMMENT '紧急联系人1单位省份',
    contact1_city VARCHAR(50) COMMENT '紧急联系人1单位城市',
    contact1_address VARCHAR(500) COMMENT '紧急联系人1单位地址',
    
    contact2_name VARCHAR(100) COMMENT '紧急联系人2姓名',
    contact2_phone VARCHAR(20) COMMENT '紧急联系人2电话',
    contact2_relation VARCHAR(50) COMMENT '与紧急联系人2关系',
    contact2_company VARCHAR(200) COMMENT '紧急联系人2单位',
    contact2_position VARCHAR(100) COMMENT '紧急联系人2职务',
    contact2_province VARCHAR(50) COMMENT '紧急联系人2单位省份',
    contact2_city VARCHAR(50) COMMENT '紧急联系人2单位城市',
    contact2_address VARCHAR(500) COMMENT '紧急联系人2单位地址',
    
    contact3_name VARCHAR(100) COMMENT '紧急联系人3姓名',
    contact3_phone VARCHAR(20) COMMENT '紧急联系人3电话',
    contact3_relation VARCHAR(50) COMMENT '与紧急联系人3关系',
    contact3_company VARCHAR(200) COMMENT '紧急联系人3单位',
    contact3_position VARCHAR(100) COMMENT '紧急联系人3职务',
    contact3_province VARCHAR(50) COMMENT '紧急联系人3单位省份',
    contact3_city VARCHAR(50) COMMENT '紧急联系人3单位城市',
    contact3_address VARCHAR(500) COMMENT '紧急联系人3单位地址',
    
    contact4_name VARCHAR(100) COMMENT '紧急联系人4姓名',
    contact4_phone VARCHAR(20) COMMENT '紧急联系人4电话',
    contact4_relation VARCHAR(50) COMMENT '与紧急联系人4关系',
    contact4_company VARCHAR(200) COMMENT '紧急联系人4单位',
    contact4_position VARCHAR(100) COMMENT '紧急联系人4职务',
    contact4_province VARCHAR(50) COMMENT '紧急联系人4单位省份',
    contact4_city VARCHAR(50) COMMENT '紧急联系人4单位城市',
    contact4_address VARCHAR(500) COMMENT '紧急联系人4单位地址',
    
    contact5_name VARCHAR(100) COMMENT '紧急联系人5姓名',
    contact5_phone VARCHAR(20) COMMENT '紧急联系人5电话',
    contact5_relation VARCHAR(50) COMMENT '与紧急联系人5关系',
    contact5_company VARCHAR(200) COMMENT '紧急联系人5单位',
    contact5_position VARCHAR(100) COMMENT '紧急联系人5职务',
    contact5_province VARCHAR(50) COMMENT '紧急联系人5单位省份',
    contact5_city VARCHAR(50) COMMENT '紧急联系人5单位城市',
    contact5_address VARCHAR(500) COMMENT '紧急联系人5单位地址',
    
    -- ============ 案件状态和处置信息 ============
    status ENUM('PENDING', 'ASSIGNED', 'PROCESSING', 'MEDIATION', 'LITIGATION', 'SETTLED', 'COMPLETED', 'SUSPENDED') 
        NOT NULL DEFAULT 'PENDING' COMMENT '案件状态',
    disposal_type ENUM('MEDIATION', 'LITIGATION', 'PRESERVATION', 'EXECUTION') COMMENT '处置类型',
    priority_level ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM' COMMENT '优先级',
    difficulty_level ENUM('EASY', 'MEDIUM', 'HARD', 'VERY_HARD') COMMENT '难度等级',
    
    -- 分配信息
    assigned_at TIMESTAMP NULL COMMENT '分配时间',
    assigned_by BIGINT COMMENT '分配人ID',
    handler_id BIGINT COMMENT '具体处理人ID',
    
    -- 处置进展
    latest_progress TEXT COMMENT '最新进展描述',
    progress_updated_at TIMESTAMP NULL COMMENT '进展更新时间',
    communication_count INT DEFAULT 0 COMMENT '沟通次数',
    last_communication_at TIMESTAMP NULL COMMENT '最后沟通时间',
    
    -- 回款信息
    recovered_amount DECIMAL(15,2) DEFAULT 0 COMMENT '已回款金额',
    recovery_rate DECIMAL(5,2) DEFAULT 0 COMMENT '回款率(%)',
    last_payment_at TIMESTAMP NULL COMMENT '最后还款时间',
    payment_count INT DEFAULT 0 COMMENT '还款次数',
    
    -- 法律相关
    lawsuit_filed BOOLEAN DEFAULT FALSE COMMENT '是否已立案',
    lawsuit_number VARCHAR(100) COMMENT '案件编号',
    court_name VARCHAR(200) COMMENT '受理法院',
    lawsuit_status VARCHAR(50) COMMENT '诉讼状态',
    judgment_amount DECIMAL(15,2) COMMENT '判决金额',
    execution_status VARCHAR(50) COMMENT '执行状态',
    
    -- 时间统计
    processing_start_time TIMESTAMP NULL COMMENT '开始处置时间',
    processing_end_time TIMESTAMP NULL COMMENT '结束处置时间',
    processing_days INT DEFAULT 0 COMMENT '处置天数',
    
    -- 扩展字段(JSON存储非核心字段)
    extended_fields JSON COMMENT '扩展字段',
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_case_package_id (case_package_id),
    INDEX idx_source_org_id (source_org_id),
    INDEX idx_disposal_org_id (disposal_org_id),
    INDEX idx_debtor_id_card (debtor_id_card),
    INDEX idx_loan_contract_no (loan_contract_no),
    INDEX idx_status (status),
    INDEX idx_assigned_at (assigned_at),
    INDEX idx_overdue_days (overdue_days),
    INDEX idx_remaining_amount (remaining_amount),
    INDEX idx_debtor_province_city (debtor_province, debtor_city),
    INDEX idx_handler_id (handler_id)
) COMMENT='案件表';

-- ===========================================
-- 3. 案件附件表 (case_attachments)
-- 存储案件相关的文件材料
-- ===========================================
CREATE TABLE case_attachments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '附件ID',
    case_id BIGINT NOT NULL COMMENT '案件ID',
    case_package_id BIGINT NOT NULL COMMENT '案件包ID',
    
    file_name VARCHAR(500) NOT NULL COMMENT '文件名',
    file_path VARCHAR(1000) NOT NULL COMMENT '文件路径',
    file_size BIGINT COMMENT '文件大小(字节)',
    file_type VARCHAR(100) COMMENT '文件类型',
    file_category ENUM('CONTRACT', 'ID_CARD', 'VOUCHER', 'JUDGMENT', 'PAYMENT_PROOF', 'OTHER') 
        NOT NULL COMMENT '文件分类',
    
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    uploaded_by BIGINT COMMENT '上传人ID',
    
    INDEX idx_case_id (case_id),
    INDEX idx_case_package_id (case_package_id),
    INDEX idx_file_category (file_category)
) COMMENT='案件附件表';

-- ===========================================
-- 4. 案件分配记录表 (case_assignments)
-- 记录案件的分配历史和策略
-- ===========================================
CREATE TABLE case_assignments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '分配记录ID',
    case_package_id BIGINT NOT NULL COMMENT '案件包ID',
    source_org_id BIGINT NOT NULL COMMENT '案源机构ID',
    disposal_org_id BIGINT NOT NULL COMMENT '处置机构ID',
    
    assignment_strategy VARCHAR(50) NOT NULL COMMENT '分配策略',
    assignment_reason TEXT COMMENT '分配原因',
    match_score DECIMAL(5,2) COMMENT '匹配评分',
    
    case_count INT NOT NULL COMMENT '分配案件数量',
    total_amount DECIMAL(15,2) NOT NULL COMMENT '分配总金额',
    
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED') 
        NOT NULL DEFAULT 'PENDING' COMMENT '分配状态',
    
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
    response_deadline TIMESTAMP COMMENT '响应截止时间',
    responded_at TIMESTAMP NULL COMMENT '响应时间',
    response_note TEXT COMMENT '响应说明',
    
    accepted_case_count INT DEFAULT 0 COMMENT '接受案件数量',
    rejected_case_count INT DEFAULT 0 COMMENT '拒绝案件数量',
    
    INDEX idx_case_package_id (case_package_id),
    INDEX idx_source_org_id (source_org_id),
    INDEX idx_disposal_org_id (disposal_org_id),
    INDEX idx_assigned_at (assigned_at),
    INDEX idx_status (status)
) COMMENT='案件分配记录表';

-- ===========================================
-- 5. 案件分配明细表 (case_assignment_details)
-- 记录具体哪些案件分配给了哪个机构
-- ===========================================
CREATE TABLE case_assignment_details (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '分配明细ID',
    assignment_id BIGINT NOT NULL COMMENT '分配记录ID',
    case_id BIGINT NOT NULL COMMENT '案件ID',
    
    status ENUM('ASSIGNED', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'ASSIGNED' COMMENT '分配状态',
    responded_at TIMESTAMP NULL COMMENT '响应时间',
    
    INDEX idx_assignment_id (assignment_id),
    INDEX idx_case_id (case_id),
    UNIQUE KEY uk_assignment_case (assignment_id, case_id)
) COMMENT='案件分配明细表';

-- ===========================================
-- 6. 案件市场表 (case_market)
-- 案件市场中的案件包展示信息
-- ===========================================
CREATE TABLE case_market (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '市场记录ID',
    case_package_id BIGINT NOT NULL COMMENT '案件包ID',
    source_org_id BIGINT NOT NULL COMMENT '案源机构ID',
    
    market_status ENUM('PUBLISHED', 'BIDDING', 'ASSIGNED', 'WITHDRAWN') 
        NOT NULL DEFAULT 'PUBLISHED' COMMENT '市场状态',
    
    publish_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
    bidding_deadline TIMESTAMP COMMENT '竞标截止时间',
    min_bid_amount DECIMAL(15,2) COMMENT '最低竞标金额',
    current_bid_count INT DEFAULT 0 COMMENT '当前竞标数量',
    
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    favorite_count INT DEFAULT 0 COMMENT '收藏次数',
    
    INDEX idx_case_package_id (case_package_id),
    INDEX idx_source_org_id (source_org_id),
    INDEX idx_market_status (market_status),
    INDEX idx_publish_time (publish_time)
) COMMENT='案件市场表';

-- ===========================================
-- 7. 案件竞标记录表 (case_bids)
-- 处置机构对案件包的竞标记录
-- ===========================================
CREATE TABLE case_bids (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '竞标记录ID',
    case_package_id BIGINT NOT NULL COMMENT '案件包ID',
    disposal_org_id BIGINT NOT NULL COMMENT '处置机构ID',
    
    bid_amount DECIMAL(15,2) COMMENT '竞标金额',
    bid_note TEXT COMMENT '竞标说明',
    expected_recovery_rate DECIMAL(5,2) COMMENT '预期回款率',
    processing_period INT COMMENT '处置周期(天)',
    
    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '竞标时间',
    status ENUM('SUBMITTED', 'SELECTED', 'REJECTED', 'WITHDRAWN') 
        NOT NULL DEFAULT 'SUBMITTED' COMMENT '竞标状态',
    
    INDEX idx_case_package_id (case_package_id),
    INDEX idx_disposal_org_id (disposal_org_id),
    INDEX idx_bid_time (bid_time),
    INDEX idx_status (status)
) COMMENT='案件竞标记录表';

-- ===========================================
-- 8. 案件处置进展表 (case_progress_logs)
-- 记录案件的详细处置进展
-- ===========================================
CREATE TABLE case_progress_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '进展记录ID',
    case_id BIGINT NOT NULL COMMENT '案件ID',
    disposal_org_id BIGINT NOT NULL COMMENT '处置机构ID',
    handler_id BIGINT COMMENT '处理人ID',
    
    progress_type ENUM('CONTACT', 'MEDIATION', 'LITIGATION', 'PAYMENT', 'SETTLEMENT', 'OTHER') 
        NOT NULL COMMENT '进展类型',
    progress_content TEXT NOT NULL COMMENT '进展内容',
    contact_method ENUM('PHONE', 'SMS', 'EMAIL', 'LETTER', 'VISIT', 'ONLINE') COMMENT '联系方式',
    contact_result ENUM('SUCCESS', 'NO_ANSWER', 'REFUSED', 'INVALID', 'PROMISED') COMMENT '联系结果',
    
    next_action TEXT COMMENT '下一步行动',
    next_contact_time TIMESTAMP COMMENT '下次联系时间',
    
    -- IDS系统同步字段
    ids_sync_id VARCHAR(100) COMMENT 'IDS系统记录ID',
    sync_time TIMESTAMP COMMENT '同步时间',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    created_by BIGINT COMMENT '创建人ID',
    
    INDEX idx_case_id (case_id),
    INDEX idx_disposal_org_id (disposal_org_id),
    INDEX idx_handler_id (handler_id),
    INDEX idx_progress_type (progress_type),
    INDEX idx_created_at (created_at)
) COMMENT='案件处置进展表';

-- ===========================================
-- 9. 案件回款记录表 (case_payments)
-- 记录案件的回款信息
-- ===========================================
CREATE TABLE case_payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '回款记录ID',
    case_id BIGINT NOT NULL COMMENT '案件ID',
    disposal_org_id BIGINT NOT NULL COMMENT '处置机构ID',
    
    payment_amount DECIMAL(15,2) NOT NULL COMMENT '回款金额',
    payment_date DATE NOT NULL COMMENT '回款日期',
    payment_method ENUM('BANK_TRANSFER', 'CASH', 'CHECK', 'ONLINE_PAYMENT', 'OTHER') 
        COMMENT '回款方式',
    
    payment_proof_url VARCHAR(1000) COMMENT '回款凭证URL',
    payment_note TEXT COMMENT '回款说明',
    
    verified BOOLEAN DEFAULT FALSE COMMENT '是否已核实',
    verified_by BIGINT COMMENT '核实人ID',
    verified_at TIMESTAMP NULL COMMENT '核实时间',
    
    -- IDS系统同步字段
    ids_sync_id VARCHAR(100) COMMENT 'IDS系统记录ID',
    sync_time TIMESTAMP COMMENT '同步时间',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    created_by BIGINT COMMENT '创建人ID',
    
    INDEX idx_case_id (case_id),
    INDEX idx_disposal_org_id (disposal_org_id),
    INDEX idx_payment_date (payment_date),
    INDEX idx_verified (verified)
) COMMENT='案件回款记录表';

-- ===========================================
-- 10. 案件对账记录表 (case_reconciliation)
-- 案源机构与处置机构的对账记录
-- ===========================================
CREATE TABLE case_reconciliation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '对账记录ID',
    case_package_id BIGINT NOT NULL COMMENT '案件包ID',
    source_org_id BIGINT NOT NULL COMMENT '案源机构ID',
    disposal_org_id BIGINT NOT NULL COMMENT '处置机构ID',
    
    reconciliation_period VARCHAR(20) NOT NULL COMMENT '对账周期(如2024-01)',
    total_cases INT NOT NULL COMMENT '总案件数',
    completed_cases INT NOT NULL COMMENT '已完成案件数',
    total_recovered DECIMAL(15,2) NOT NULL COMMENT '总回款金额',
    
    source_org_confirmed BOOLEAN DEFAULT FALSE COMMENT '案源机构确认',
    disposal_org_confirmed BOOLEAN DEFAULT FALSE COMMENT '处置机构确认',
    
    discrepancy_amount DECIMAL(15,2) DEFAULT 0 COMMENT '差异金额',
    discrepancy_note TEXT COMMENT '差异说明',
    dispute_status ENUM('NONE', 'DISPUTED', 'RESOLVING', 'RESOLVED') 
        DEFAULT 'NONE' COMMENT '争议状态',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    confirmed_at TIMESTAMP NULL COMMENT '确认时间',
    
    INDEX idx_case_package_id (case_package_id),
    INDEX idx_source_org_id (source_org_id),
    INDEX idx_disposal_org_id (disposal_org_id),
    INDEX idx_reconciliation_period (reconciliation_period)
) COMMENT='案件对账记录表';

-- ===========================================
-- 11. 智能分案配置表 (assignment_configs)
-- 存储智能分案引擎的配置参数
-- ===========================================
CREATE TABLE assignment_configs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
    config_name VARCHAR(100) NOT NULL COMMENT '配置名称',
    config_type ENUM('GLOBAL', 'ORG_SPECIFIC', 'PACKAGE_SPECIFIC') 
        NOT NULL COMMENT '配置类型',
    org_id BIGINT COMMENT '机构ID(机构专用配置)',
    
    -- 地域权重配置
    region_weight DECIMAL(3,2) DEFAULT 0.3 COMMENT '地域匹配权重',
    same_province_score INT DEFAULT 100 COMMENT '同省份评分',
    same_city_score INT DEFAULT 90 COMMENT '同城市评分',
    adjacent_province_score INT DEFAULT 70 COMMENT '邻近省份评分',
    
    -- 金额权重配置
    amount_weight DECIMAL(3,2) DEFAULT 0.2 COMMENT '金额匹配权重',
    amount_range_preference JSON COMMENT '金额区间偏好配置',
    
    -- 账龄权重配置
    overdue_weight DECIMAL(3,2) DEFAULT 0.2 COMMENT '账龄匹配权重',
    overdue_range_preference JSON COMMENT '账龄区间偏好配置',
    
    -- 业绩权重配置
    performance_weight DECIMAL(3,2) DEFAULT 0.2 COMMENT '业绩权重',
    min_recovery_rate DECIMAL(5,2) DEFAULT 0 COMMENT '最低回款率要求',
    min_performance_score INT DEFAULT 0 COMMENT '最低业绩评分要求',
    
    -- 负载权重配置
    load_weight DECIMAL(3,2) DEFAULT 0.1 COMMENT '负载均衡权重',
    max_utilization_rate DECIMAL(5,2) DEFAULT 90 COMMENT '最大利用率限制',
    
    -- 其他配置
    max_assignments_per_org INT DEFAULT 10 COMMENT '单个机构最大分配数',
    assignment_timeout_hours INT DEFAULT 48 COMMENT '响应超时时间(小时)',
    
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_config_type (config_type),
    INDEX idx_org_id (org_id),
    INDEX idx_is_active (is_active)
) COMMENT='智能分案配置表';

-- ===========================================
-- 12. 分案评估日志表 (assignment_evaluation_logs)
-- 记录智能分案引擎的评估过程
-- ===========================================
CREATE TABLE assignment_evaluation_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '评估日志ID',
    case_package_id BIGINT NOT NULL COMMENT '案件包ID',
    disposal_org_id BIGINT NOT NULL COMMENT '处置机构ID',
    
    evaluation_strategy VARCHAR(50) NOT NULL COMMENT '评估策略',
    
    -- 各维度评分
    region_score DECIMAL(5,2) DEFAULT 0 COMMENT '地域评分',
    amount_score DECIMAL(5,2) DEFAULT 0 COMMENT '金额评分',
    overdue_score DECIMAL(5,2) DEFAULT 0 COMMENT '账龄评分',
    performance_score DECIMAL(5,2) DEFAULT 0 COMMENT '业绩评分',
    load_score DECIMAL(5,2) DEFAULT 0 COMMENT '负载评分',
    
    final_score DECIMAL(5,2) NOT NULL COMMENT '最终评分',
    rank_position INT COMMENT '排名位置',
    
    is_recommended BOOLEAN DEFAULT FALSE COMMENT '是否推荐',
    recommendation_reason TEXT COMMENT '推荐原因',
    
    evaluation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '评估时间',
    
    INDEX idx_case_package_id (case_package_id),
    INDEX idx_disposal_org_id (disposal_org_id),
    INDEX idx_final_score (final_score),
    INDEX idx_evaluation_time (evaluation_time)
) COMMENT='分案评估日志表';

-- ===========================================
-- 视图和触发器
-- ===========================================

-- 案件统计视图
CREATE VIEW case_statistics AS
SELECT 
    cp.id as case_package_id,
    cp.package_name,
    cp.source_org_id,
    cp.total_cases,
    cp.total_amount,
    COUNT(c.id) as actual_case_count,
    SUM(c.remaining_amount) as actual_total_amount,
    SUM(c.recovered_amount) as total_recovered,
    ROUND(SUM(c.recovered_amount) / SUM(c.remaining_amount) * 100, 2) as recovery_rate,
    COUNT(CASE WHEN c.status = 'COMPLETED' THEN 1 END) as completed_count,
    COUNT(CASE WHEN c.status = 'PROCESSING' THEN 1 END) as processing_count,
    COUNT(CASE WHEN c.status = 'PENDING' THEN 1 END) as pending_count
FROM case_packages cp
LEFT JOIN cases c ON cp.id = c.case_package_id
GROUP BY cp.id;

-- 处置机构业绩视图
CREATE VIEW disposal_org_performance AS
SELECT 
    c.disposal_org_id,
    COUNT(c.id) as total_cases,
    SUM(c.remaining_amount) as total_amount,
    SUM(c.recovered_amount) as recovered_amount,
    ROUND(SUM(c.recovered_amount) / SUM(c.remaining_amount) * 100, 2) as recovery_rate,
    AVG(c.processing_days) as avg_processing_days,
    COUNT(CASE WHEN c.status = 'COMPLETED' THEN 1 END) as completed_cases,
    MAX(c.updated_at) as last_activity_time
FROM cases c
WHERE c.disposal_org_id IS NOT NULL
GROUP BY c.disposal_org_id;