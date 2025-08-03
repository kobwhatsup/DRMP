-- ========================================
-- DRMP 报表分析模块数据库设计
-- ========================================

-- 统计数据聚合表 (支持多维度统计预计算)
CREATE TABLE report_statistics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    statistic_date DATE NOT NULL COMMENT '统计日期',
    dimension_type VARCHAR(50) NOT NULL COMMENT '统计维度类型：OVERALL/ORG/USER/REGION/PRODUCT',
    dimension_value VARCHAR(200) COMMENT '维度值：机构ID/用户ID/地区编码/产品类型等',
    metric_type VARCHAR(100) NOT NULL COMMENT '指标类型',
    metric_value DECIMAL(20,4) COMMENT '指标数值',
    metric_count BIGINT DEFAULT 0 COMMENT '指标计数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_date_dimension (statistic_date, dimension_type, dimension_value),
    INDEX idx_metric_type (metric_type),
    UNIQUE KEY uk_stat_unique (statistic_date, dimension_type, dimension_value, metric_type)
) COMMENT '统计数据聚合表';

-- 案件处置效果统计表 (按案件包/机构维度)
CREATE TABLE case_performance_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    case_package_id BIGINT NOT NULL COMMENT '案件包ID',
    source_org_id BIGINT NOT NULL COMMENT '案源机构ID',
    disposal_org_id BIGINT COMMENT '处置机构ID',
    statistic_date DATE NOT NULL COMMENT '统计日期',
    
    -- 案件数量统计
    total_cases INT DEFAULT 0 COMMENT '总案件数',
    assigned_cases INT DEFAULT 0 COMMENT '已分配案件数',
    processing_cases INT DEFAULT 0 COMMENT '处置中案件数',
    settled_cases INT DEFAULT 0 COMMENT '已和解案件数',
    litigation_cases INT DEFAULT 0 COMMENT '已诉讼案件数',
    completed_cases INT DEFAULT 0 COMMENT '已完成案件数',
    
    -- 金额统计
    total_amount DECIMAL(15,2) DEFAULT 0 COMMENT '总委托金额',
    recovered_amount DECIMAL(15,2) DEFAULT 0 COMMENT '已回款金额',
    recovery_rate DECIMAL(8,4) DEFAULT 0 COMMENT '回款率',
    
    -- 时效统计
    avg_processing_days DECIMAL(8,2) DEFAULT 0 COMMENT '平均处置天数',
    avg_settlement_days DECIMAL(8,2) DEFAULT 0 COMMENT '平均和解天数',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_package_date (case_package_id, statistic_date),
    INDEX idx_source_org_date (source_org_id, statistic_date),
    INDEX idx_disposal_org_date (disposal_org_id, statistic_date),
    UNIQUE KEY uk_perf_daily (case_package_id, statistic_date)
) COMMENT '案件处置效果统计表';

-- 机构业绩汇总表 (机构级别的日度汇总)
CREATE TABLE organization_performance_summary (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    organization_id BIGINT NOT NULL COMMENT '机构ID',
    organization_type ENUM('SOURCE', 'DISPOSAL') NOT NULL COMMENT '机构类型',
    statistic_date DATE NOT NULL COMMENT '统计日期',
    
    -- 基础指标
    active_packages INT DEFAULT 0 COMMENT '活跃案件包数',
    total_cases INT DEFAULT 0 COMMENT '案件总数',
    new_cases INT DEFAULT 0 COMMENT '新增案件数',
    completed_cases INT DEFAULT 0 COMMENT '完成案件数',
    
    -- 金额指标
    total_amount DECIMAL(15,2) DEFAULT 0 COMMENT '总金额',
    recovered_amount DECIMAL(15,2) DEFAULT 0 COMMENT '回款金额',
    recovery_rate DECIMAL(8,4) DEFAULT 0 COMMENT '回款率',
    
    -- 效率指标
    avg_processing_days DECIMAL(8,2) DEFAULT 0 COMMENT '平均处置周期',
    success_rate DECIMAL(8,4) DEFAULT 0 COMMENT '成功率',
    
    -- 案源方特有指标
    partnered_orgs INT DEFAULT 0 COMMENT '合作处置机构数',
    
    -- 处置方特有指标
    staff_count INT DEFAULT 0 COMMENT '作业人员数',
    cases_per_staff DECIMAL(8,2) DEFAULT 0 COMMENT '人均案件数',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_org_date (organization_id, statistic_date),
    INDEX idx_type_date (organization_type, statistic_date),
    UNIQUE KEY uk_org_daily (organization_id, statistic_date)
) COMMENT '机构业绩汇总表';

-- 平台运营统计表 (平台级别的全局统计)
CREATE TABLE platform_operation_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    statistic_date DATE NOT NULL COMMENT '统计日期',
    
    -- 机构统计
    total_orgs INT DEFAULT 0 COMMENT '总机构数',
    active_orgs INT DEFAULT 0 COMMENT '活跃机构数',
    new_orgs INT DEFAULT 0 COMMENT '新增机构数',
    source_orgs INT DEFAULT 0 COMMENT '案源机构数',
    disposal_orgs INT DEFAULT 0 COMMENT '处置机构数',
    
    -- 案件统计
    total_packages INT DEFAULT 0 COMMENT '总案件包数',
    active_packages INT DEFAULT 0 COMMENT '活跃案件包数',
    total_cases BIGINT DEFAULT 0 COMMENT '总案件数',
    processing_cases BIGINT DEFAULT 0 COMMENT '处置中案件数',
    completed_cases BIGINT DEFAULT 0 COMMENT '已完成案件数',
    
    -- 金额统计
    total_amount DECIMAL(18,2) DEFAULT 0 COMMENT '总委托金额',
    recovered_amount DECIMAL(18,2) DEFAULT 0 COMMENT '总回款金额',
    platform_commission DECIMAL(18,2) DEFAULT 0 COMMENT '平台佣金',
    
    -- 效率统计
    avg_assignment_hours DECIMAL(8,2) DEFAULT 0 COMMENT '平均分案耗时(小时)',
    avg_processing_days DECIMAL(8,2) DEFAULT 0 COMMENT '平均处置周期',
    overall_recovery_rate DECIMAL(8,4) DEFAULT 0 COMMENT '整体回款率',
    
    -- 系统健康指标
    api_call_count BIGINT DEFAULT 0 COMMENT 'API调用次数',
    error_rate DECIMAL(8,4) DEFAULT 0 COMMENT '错误率',
    avg_response_time DECIMAL(8,2) DEFAULT 0 COMMENT '平均响应时间(ms)',
    
    -- 收入统计
    membership_revenue DECIMAL(15,2) DEFAULT 0 COMMENT '会员费收入',
    service_revenue DECIMAL(15,2) DEFAULT 0 COMMENT '增值服务收入',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_platform_daily (statistic_date)
) COMMENT '平台运营统计表';

-- 用户行为统计表 (支持用户级别的业绩分析)
CREATE TABLE user_performance_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    organization_id BIGINT NOT NULL COMMENT '所属机构ID',
    statistic_date DATE NOT NULL COMMENT '统计日期',
    
    -- 工作量统计
    handled_cases INT DEFAULT 0 COMMENT '处理案件数',
    completed_cases INT DEFAULT 0 COMMENT '完成案件数',
    
    -- 效果统计
    recovered_amount DECIMAL(15,2) DEFAULT 0 COMMENT '回款金额',
    success_rate DECIMAL(8,4) DEFAULT 0 COMMENT '成功率',
    avg_processing_days DECIMAL(8,2) DEFAULT 0 COMMENT '平均处置天数',
    
    -- 行为统计
    login_count INT DEFAULT 0 COMMENT '登录次数',
    active_hours DECIMAL(8,2) DEFAULT 0 COMMENT '活跃时长(小时)',
    operation_count INT DEFAULT 0 COMMENT '操作次数',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_date (user_id, statistic_date),
    INDEX idx_org_date (organization_id, statistic_date),
    UNIQUE KEY uk_user_daily (user_id, statistic_date)
) COMMENT '用户行为统计表';

-- 报表配置表 (支持自定义报表配置)
CREATE TABLE report_configurations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    report_name VARCHAR(200) NOT NULL COMMENT '报表名称',
    report_type VARCHAR(50) NOT NULL COMMENT '报表类型：DASHBOARD/EXPORT/SCHEDULED',
    target_role VARCHAR(50) NOT NULL COMMENT '目标角色：ADMIN/SOURCE_ORG/DISPOSAL_ORG',
    
    -- 配置信息
    config_json JSON COMMENT '报表配置JSON',
    chart_config JSON COMMENT '图表配置JSON',
    
    -- 权限控制
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    visibility ENUM('PUBLIC', 'PRIVATE', 'ORGANIZATION') DEFAULT 'PUBLIC' COMMENT '可见性',
    
    created_by BIGINT COMMENT '创建人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type_role (report_type, target_role),
    INDEX idx_active (is_active)
) COMMENT '报表配置表';

-- 定时报表任务表 (支持定时生成和发送报表)
CREATE TABLE scheduled_reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    report_config_id BIGINT NOT NULL COMMENT '报表配置ID',
    organization_id BIGINT COMMENT '机构ID',
    
    -- 调度配置
    schedule_type ENUM('DAILY', 'WEEKLY', 'MONTHLY') NOT NULL COMMENT '调度类型',
    schedule_time TIME NOT NULL COMMENT '调度时间',
    schedule_day INT COMMENT '调度日期(月报时使用)',
    
    -- 发送配置
    recipient_emails TEXT COMMENT '收件人邮箱列表',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    
    -- 执行状态
    last_run_at TIMESTAMP COMMENT '最后执行时间',
    next_run_at TIMESTAMP COMMENT '下次执行时间',
    run_count INT DEFAULT 0 COMMENT '执行次数',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (report_config_id) REFERENCES report_configurations(id),
    INDEX idx_schedule (is_active, next_run_at),
    INDEX idx_org (organization_id)
) COMMENT '定时报表任务表';

-- 报表生成历史表 (记录报表生成历史)
CREATE TABLE report_generation_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    report_config_id BIGINT NOT NULL COMMENT '报表配置ID',
    organization_id BIGINT COMMENT '机构ID',
    user_id BIGINT COMMENT '请求用户ID',
    
    -- 报表信息
    report_title VARCHAR(500) COMMENT '报表标题',
    report_period_start DATE COMMENT '统计开始日期',
    report_period_end DATE COMMENT '统计结束日期',
    
    -- 生成状态
    generation_status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING' COMMENT '生成状态',
    file_path VARCHAR(1000) COMMENT '文件路径',
    file_size BIGINT COMMENT '文件大小(字节)',
    
    -- 时间记录
    started_at TIMESTAMP COMMENT '开始时间',
    completed_at TIMESTAMP COMMENT '完成时间',
    processing_duration INT COMMENT '处理时长(秒)',
    
    error_message TEXT COMMENT '错误信息',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (report_config_id) REFERENCES report_configurations(id),
    INDEX idx_org_date (organization_id, created_at),
    INDEX idx_status (generation_status),
    INDEX idx_period (report_period_start, report_period_end)
) COMMENT '报表生成历史表';

-- 数据分析报告表 (增值服务 - 深度分析报告)
CREATE TABLE data_analysis_reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    report_name VARCHAR(200) NOT NULL COMMENT '报告名称',
    report_type VARCHAR(100) NOT NULL COMMENT '报告类型',
    report_description TEXT COMMENT '报告描述',
    
    -- 内容信息
    content_json JSON COMMENT '报告内容JSON',
    insights JSON COMMENT '洞察分析JSON',
    recommendations JSON COMMENT '建议建议JSON',
    
    -- 生成信息
    data_period_start DATE COMMENT '数据期间开始',
    data_period_end DATE COMMENT '数据期间结束',
    generated_at TIMESTAMP COMMENT '生成时间',
    generated_by VARCHAR(100) COMMENT '生成方式：AUTO/MANUAL',
    
    -- 销售信息
    price DECIMAL(10,2) COMMENT '报告价格',
    is_purchasable BOOLEAN DEFAULT TRUE COMMENT '是否可购买',
    purchase_count INT DEFAULT 0 COMMENT '购买次数',
    
    -- 文件信息
    file_path VARCHAR(1000) COMMENT '报告文件路径',
    preview_content TEXT COMMENT '预览内容',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type_date (report_type, generated_at),
    INDEX idx_purchasable (is_purchasable),
    INDEX idx_period (data_period_start, data_period_end)
) COMMENT '数据分析报告表';

-- 报告购买记录表
CREATE TABLE report_purchase_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    report_id BIGINT NOT NULL COMMENT '报告ID',
    organization_id BIGINT NOT NULL COMMENT '购买机构ID',
    user_id BIGINT NOT NULL COMMENT '购买用户ID',
    
    -- 购买信息
    purchase_price DECIMAL(10,2) NOT NULL COMMENT '购买价格',
    payment_status ENUM('PENDING', 'PAID', 'REFUNDED') DEFAULT 'PENDING' COMMENT '支付状态',
    payment_method VARCHAR(50) COMMENT '支付方式',
    
    -- 访问控制
    access_granted_at TIMESTAMP COMMENT '授权访问时间',
    access_expires_at TIMESTAMP COMMENT '访问过期时间',
    download_count INT DEFAULT 0 COMMENT '下载次数',
    view_count INT DEFAULT 0 COMMENT '查看次数',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (report_id) REFERENCES data_analysis_reports(id),
    INDEX idx_org_date (organization_id, created_at),
    INDEX idx_payment_status (payment_status),
    UNIQUE KEY uk_org_report (organization_id, report_id)
) COMMENT '报告购买记录表';

-- 创建视图：案源方业绩看板数据视图
CREATE VIEW v_source_org_dashboard AS
SELECT 
    ops.organization_id,
    ops.statistic_date,
    ops.active_packages,
    ops.total_cases,
    ops.completed_cases,
    ops.total_amount,
    ops.recovered_amount,
    ops.recovery_rate,
    ops.avg_processing_days,
    ops.partnered_orgs,
    o.organization_name,
    o.organization_code
FROM organization_performance_summary ops
JOIN organizations o ON ops.organization_id = o.id
WHERE ops.organization_type = 'SOURCE'
  AND ops.statistic_date >= DATE_SUB(CURRENT_DATE, INTERVAL 90 DAY);

-- 创建视图：处置方效能看板数据视图  
CREATE VIEW v_disposal_org_dashboard AS
SELECT 
    ops.organization_id,
    ops.statistic_date,
    ops.active_packages,
    ops.total_cases,
    ops.completed_cases,
    ops.total_amount,
    ops.recovered_amount,
    ops.recovery_rate,
    ops.avg_processing_days,
    ops.success_rate,
    ops.staff_count,
    ops.cases_per_staff,
    o.organization_name,
    o.organization_code
FROM organization_performance_summary ops
JOIN organizations o ON ops.organization_id = o.id
WHERE ops.organization_type = 'DISPOSAL'
  AND ops.statistic_date >= DATE_SUB(CURRENT_DATE, INTERVAL 90 DAY);

-- 创建存储过程：统计数据聚合
DELIMITER //
CREATE PROCEDURE sp_aggregate_daily_statistics(IN target_date DATE)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- 聚合案件处置效果统计
    INSERT INTO case_performance_stats (
        case_package_id, source_org_id, disposal_org_id, statistic_date,
        total_cases, processing_cases, completed_cases,
        total_amount, recovered_amount, recovery_rate
    )
    SELECT 
        cp.id,
        cp.source_org_id,
        cp.disposal_org_id,
        target_date,
        cp.total_cases,
        (SELECT COUNT(*) FROM case_details cd WHERE cd.case_package_id = cp.id AND cd.disposal_status IN ('PROCESSING')),
        (SELECT COUNT(*) FROM case_details cd WHERE cd.case_package_id = cp.id AND cd.disposal_status IN ('COMPLETED')),
        cp.total_amount,
        COALESCE((SELECT SUM(cd.current_recovered_amount) FROM case_details cd WHERE cd.case_package_id = cp.id), 0),
        CASE 
            WHEN cp.total_amount > 0 THEN 
                COALESCE((SELECT SUM(cd.current_recovered_amount) FROM case_details cd WHERE cd.case_package_id = cp.id), 0) / cp.total_amount * 100
            ELSE 0 
        END
    FROM case_packages cp
    WHERE cp.created_at <= target_date
    ON DUPLICATE KEY UPDATE
        total_cases = VALUES(total_cases),
        processing_cases = VALUES(processing_cases),
        completed_cases = VALUES(completed_cases),
        recovered_amount = VALUES(recovered_amount),
        recovery_rate = VALUES(recovery_rate),
        updated_at = CURRENT_TIMESTAMP;
    
    -- 聚合机构业绩汇总
    INSERT INTO organization_performance_summary (
        organization_id, organization_type, statistic_date,
        active_packages, total_cases, completed_cases,
        total_amount, recovered_amount, recovery_rate
    )
    SELECT 
        o.id,
        o.type,
        target_date,
        (SELECT COUNT(*) FROM case_packages cp WHERE 
            (o.type = 'SOURCE' AND cp.source_org_id = o.id) OR 
            (o.type = 'DISPOSAL' AND cp.disposal_org_id = o.id)
            AND cp.status IN ('PROCESSING', 'ASSIGNED')),
        COALESCE(SUM(cps.total_cases), 0),
        COALESCE(SUM(cps.completed_cases), 0),
        COALESCE(SUM(cps.total_amount), 0),
        COALESCE(SUM(cps.recovered_amount), 0),
        CASE 
            WHEN SUM(cps.total_amount) > 0 THEN 
                SUM(cps.recovered_amount) / SUM(cps.total_amount) * 100
            ELSE 0 
        END
    FROM organizations o
    LEFT JOIN case_performance_stats cps ON 
        ((o.type = 'SOURCE' AND cps.source_org_id = o.id) OR 
         (o.type = 'DISPOSAL' AND cps.disposal_org_id = o.id))
        AND cps.statistic_date = target_date
    GROUP BY o.id, o.type
    ON DUPLICATE KEY UPDATE
        active_packages = VALUES(active_packages),
        total_cases = VALUES(total_cases),
        completed_cases = VALUES(completed_cases),
        total_amount = VALUES(total_amount),
        recovered_amount = VALUES(recovered_amount),
        recovery_rate = VALUES(recovery_rate),
        updated_at = CURRENT_TIMESTAMP;
    
    COMMIT;
END //
DELIMITER ;