-- 数据库性能优化脚本
-- 添加必要的索引以提升查询性能

-- ==================== 机构表索引优化 ====================
-- 机构类型和状态的复合索引，用于快速筛选可用处置机构
CREATE INDEX idx_org_type_status ON organizations(type, status);

-- 服务区域索引，用于地域匹配
CREATE INDEX idx_org_service_regions ON organizations((CAST(service_regions AS CHAR(255))));

-- 机构负载和容量的复合索引，用于容量评估
CREATE INDEX idx_org_load_capacity ON organizations(current_load, monthly_case_capacity);

-- 机构创建时间索引，用于统计分析
CREATE INDEX idx_org_created_at ON organizations(created_at);

-- ==================== 用户表索引优化 ====================
-- 用户名和状态复合索引，优化登录查询
CREATE INDEX idx_user_username_status ON users(username, status);

-- 机构ID和角色复合索引，优化权限查询
CREATE INDEX idx_user_org_role ON users(organization_id, role);

-- 最后登录时间索引，用于活跃度统计
CREATE INDEX idx_user_last_login ON users(last_login_time);

-- ==================== 案件包表索引优化 ====================
-- 案源机构和状态的复合索引
CREATE INDEX idx_case_pkg_source_status ON case_packages(source_org_id, status);

-- 处置机构和状态的复合索引
CREATE INDEX idx_case_pkg_disposal_status ON case_packages(disposal_org_id, status);

-- 发布时间索引，用于按时间查询
CREATE INDEX idx_case_pkg_published_at ON case_packages(published_at);

-- 案件数量和金额范围索引，用于统计查询
CREATE INDEX idx_case_pkg_amount_count ON case_packages(total_amount, case_count);

-- 期望处置周期索引
CREATE INDEX idx_case_pkg_disposal_days ON case_packages(expected_disposal_days);

-- ==================== 案件表索引优化 ====================
-- 案件包ID和状态复合索引，核心查询索引
CREATE INDEX idx_case_package_status ON cases(case_package_id, status);

-- 债务人身份证索引（考虑到加密，用前缀索引）
CREATE INDEX idx_case_debtor_id ON cases(debtor_id_card(100));

-- 债务人姓名索引（考虑到加密，用前缀索引）
CREATE INDEX idx_case_debtor_name ON cases(debtor_name(50));

-- 借据编号索引，用于精确查找
CREATE INDEX idx_case_loan_no ON cases(loan_no);

-- 逾期天数范围索引
CREATE INDEX idx_case_overdue_days ON cases(overdue_days);

-- 贷款金额范围索引
CREATE INDEX idx_case_loan_amount ON cases(loan_amount);

-- 剩余金额范围索引
CREATE INDEX idx_case_remaining_amount ON cases(remaining_amount);

-- 委托时间范围索引
CREATE INDEX idx_case_commission_period ON cases(commission_start_date, commission_end_date);

-- 分配给作业人员的索引
CREATE INDEX idx_case_assigned_to ON cases(assigned_to);

-- 处置状态和最后联系时间复合索引
CREATE INDEX idx_case_disposal_contact ON cases(disposal_status, last_contact_date);

-- 回款金额索引，用于统计
CREATE INDEX idx_case_recovery_amount ON cases(recovery_amount);

-- 案件更新时间索引
CREATE INDEX idx_case_updated_at ON cases(updated_at);

-- ==================== 分案记录表索引优化 ====================
-- 案件包ID和状态复合索引
CREATE INDEX idx_assign_package_status ON assignments(case_package_id, status);

-- 案源机构和分案时间复合索引
CREATE INDEX idx_assign_source_time ON assignments(source_org_id, assigned_at);

-- 处置机构和分案时间复合索引
CREATE INDEX idx_assign_disposal_time ON assignments(disposal_org_id, assigned_at);

-- 分案策略索引
CREATE INDEX idx_assign_strategy ON assignments(assignment_strategy);

-- 接受时间索引
CREATE INDEX idx_assign_accepted_at ON assignments(accepted_at);

-- ==================== 回款记录表索引优化 ====================
-- 案件ID和回款日期复合索引，核心统计查询
CREATE INDEX idx_payment_case_date ON payment_records(case_id, payment_date);

-- 回款日期范围索引
CREATE INDEX idx_payment_date ON payment_records(payment_date);

-- 对账状态索引
CREATE INDEX idx_payment_reconciliation ON payment_records(reconciliation_status);

-- 提交人和日期复合索引
CREATE INDEX idx_payment_submitter_date ON payment_records(submitted_by, payment_date);

-- 回款金额范围索引
CREATE INDEX idx_payment_amount ON payment_records(payment_amount);

-- ==================== 操作日志表索引优化 ====================
-- 用户ID和操作时间复合索引
CREATE INDEX idx_log_user_time ON operation_logs(user_id, operation_time);

-- 操作类型和时间复合索引
CREATE INDEX idx_log_type_time ON operation_logs(operation_type, operation_time);

-- 操作模块索引
CREATE INDEX idx_log_module ON operation_logs(operation_module);

-- 目标类型和ID复合索引
CREATE INDEX idx_log_target ON operation_logs(target_type, target_id);

-- 操作结果索引
CREATE INDEX idx_log_result ON operation_logs(result);

-- ==================== 文件表索引优化 ====================
-- 业务类型和业务ID复合索引
CREATE INDEX idx_file_business ON files(business_type, business_id);

-- 上传用户和时间复合索引
CREATE INDEX idx_file_user_time ON files(upload_user_id, created_at);

-- 文件类型索引
CREATE INDEX idx_file_type ON files(file_type);

-- 文件大小索引，用于存储统计
CREATE INDEX idx_file_size ON files(file_size);

-- ==================== 分区表设计（大数据量优化）====================
-- 对于案件表，如果数据量超过1000万条，建议按时间分区
-- 这里提供分区表的创建脚本模板，实际使用时需要根据具体需求调整

-- ALTER TABLE cases PARTITION BY RANGE (YEAR(created_at)) (
--     PARTITION p2024 VALUES LESS THAN (2025),
--     PARTITION p2025 VALUES LESS THAN (2026),
--     PARTITION p2026 VALUES LESS THAN (2027),
--     PARTITION p_future VALUES LESS THAN MAXVALUE
-- );

-- 对于操作日志表，建议按月分区
-- ALTER TABLE operation_logs PARTITION BY RANGE (YEAR(operation_time) * 100 + MONTH(operation_time)) (
--     PARTITION p202401 VALUES LESS THAN (202402),
--     PARTITION p202402 VALUES LESS THAN (202403),
--     -- 继续添加更多分区...
--     PARTITION p_future VALUES LESS THAN MAXVALUE
-- );

-- ==================== MySQL配置优化建议 ====================
-- 以下是MySQL配置文件(my.cnf)的优化建议，需要在数据库服务器上配置：

/*
# InnoDB优化配置
innodb_buffer_pool_size = 2G                    # 设置为物理内存的70-80%
innodb_log_file_size = 256M                     # 增大日志文件大小
innodb_log_buffer_size = 64M                    # 增大日志缓冲区
innodb_flush_log_at_trx_commit = 2              # 提升性能，降低持久性
innodb_file_per_table = 1                       # 每个表独立表空间
innodb_read_io_threads = 8                      # 增加读IO线程
innodb_write_io_threads = 8                     # 增加写IO线程

# 查询缓存
query_cache_type = 1                             # 启用查询缓存
query_cache_size = 256M                          # 查询缓存大小

# 连接优化
max_connections = 500                            # 最大连接数
max_connect_errors = 10000                       # 最大连接错误数

# 临时表优化
tmp_table_size = 128M                           # 内存临时表大小
max_heap_table_size = 128M                      # 堆表最大大小

# 排序和分组优化
sort_buffer_size = 4M                           # 排序缓冲区大小
read_buffer_size = 2M                           # 顺序读缓冲区大小
read_rnd_buffer_size = 8M                       # 随机读缓冲区大小
join_buffer_size = 8M                           # 连接缓冲区大小

# 慢查询日志
slow_query_log = 1                              # 启用慢查询日志
slow_query_log_file = /var/log/mysql/slow.log   # 慢查询日志文件
long_query_time = 2                             # 慢查询时间阈值(秒)
*/

-- ==================== 创建性能监控视图 ====================
-- 创建一些有用的性能监控视图

-- 机构处理能力统计视图
CREATE VIEW v_organization_capacity AS
SELECT 
    o.id,
    o.name,
    o.type,
    o.monthly_case_capacity,
    o.current_load,
    COUNT(cp.id) as current_packages,
    SUM(cp.case_count) as current_cases,
    AVG(pr.payment_amount) as avg_recovery
FROM organizations o
LEFT JOIN case_packages cp ON o.id = cp.disposal_org_id AND cp.status = 'PROCESSING'
LEFT JOIN cases c ON cp.id = c.case_package_id
LEFT JOIN payment_records pr ON c.id = pr.case_id
WHERE o.status = 'ACTIVE' AND o.type = 'DISPOSAL'
GROUP BY o.id, o.name, o.type, o.monthly_case_capacity, o.current_load;

-- 案件处理效率统计视图
CREATE VIEW v_case_processing_stats AS
SELECT 
    DATE_FORMAT(cp.published_at, '%Y-%m') as month,
    COUNT(cp.id) as total_packages,
    SUM(cp.case_count) as total_cases,
    SUM(cp.total_amount) as total_amount,
    AVG(DATEDIFF(cp.closed_at, cp.published_at)) as avg_processing_days,
    COUNT(CASE WHEN cp.status = 'CLOSED' THEN 1 END) as closed_packages
FROM case_packages cp
WHERE cp.published_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(cp.published_at, '%Y-%m')
ORDER BY month;

-- 机构业绩排行视图
CREATE VIEW v_organization_performance AS
SELECT 
    o.id,
    o.name,
    COUNT(cp.id) as handled_packages,
    SUM(cp.case_count) as handled_cases,
    SUM(pr.payment_amount) as total_recovery,
    AVG(pr.payment_amount / c.remaining_amount) as avg_recovery_rate,
    AVG(DATEDIFF(cp.closed_at, cp.assigned_at)) as avg_completion_days
FROM organizations o
JOIN case_packages cp ON o.id = cp.disposal_org_id
JOIN cases c ON cp.id = c.case_package_id
JOIN payment_records pr ON c.id = pr.case_id
WHERE o.type = 'DISPOSAL' 
  AND cp.status = 'CLOSED'
  AND cp.closed_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
GROUP BY o.id, o.name
HAVING handled_packages >= 5
ORDER BY avg_recovery_rate DESC, total_recovery DESC;

-- ==================== 数据清理和维护 ====================
-- 定期清理操作日志（保留最近6个月）
-- 注意：这个操作应该通过定时任务执行，不要直接运行
-- DELETE FROM operation_logs WHERE operation_time < DATE_SUB(NOW(), INTERVAL 6 MONTH);

-- 分析表统计信息更新
ANALYZE TABLE organizations;
ANALYZE TABLE users;
ANALYZE TABLE case_packages;
ANALYZE TABLE cases;
ANALYZE TABLE assignments;
ANALYZE TABLE payment_records;
ANALYZE TABLE operation_logs;
ANALYZE TABLE files;

-- 重建索引统计信息
-- OPTIMIZE TABLE organizations;
-- OPTIMIZE TABLE case_packages;
-- OPTIMIZE TABLE cases;

-- 检查索引使用情况的查询
-- SELECT 
--     TABLE_NAME,
--     INDEX_NAME,
--     CARDINALITY,
--     SUB_PART,
--     NULLABLE
-- FROM INFORMATION_SCHEMA.STATISTICS 
-- WHERE TABLE_SCHEMA = 'drmp' 
-- ORDER BY TABLE_NAME, INDEX_NAME;