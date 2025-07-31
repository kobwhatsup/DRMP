import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, Card, Button, Space, Tag, Input, Select, DatePicker, Row, Col, message, 
  Statistic, Progress, Tabs, Badge, Tooltip, Dropdown, Modal, Avatar, Empty
} from 'antd';
import { 
  PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined,
  ExportOutlined, ReloadOutlined, SettingOutlined,
  BankOutlined, TeamOutlined, PhoneOutlined,
  MailOutlined, UserOutlined, CalendarOutlined, MoreOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import organizationService, { 
  Organization, 
  OrganizationQueryParams, 
  OrganizationStatistics,
  PageResponse
} from '@/services/organizationService';
import { useDebouncedCallback } from 'use-debounce';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// 机构类型定义
interface OrganizationType {
  code: string;
  name: string;
  category: 'SOURCE' | 'DISPOSAL';
  color: string;
  icon: React.ReactNode;
}

// 内部统计数据接口（映射到API响应）
interface OrganizationStats {
  total: number;
  source: number;
  disposal: number;
  active: number;
  pending: number;
  suspended: number;
}

// 快速筛选配置
interface QuickFilter {
  key: string;
  label: string;
  count: number;
}

const OrganizationList: React.FC = () => {
  const navigate = useNavigate();
  
  // 状态管理
  const [pageData, setPageData] = useState<PageResponse<Organization>>({
    content: [],
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    hasNext: false,
    hasPrevious: false,
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<OrganizationStats>({
    total: 0, source: 0, disposal: 0, active: 0, pending: 0, suspended: 0
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [queryParams, setQueryParams] = useState<OrganizationQueryParams>({
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });
  const [filters, setFilters] = useState({
    type: undefined as string | undefined,
    status: undefined as string | undefined,
    region: undefined as string | undefined,
    dateRange: undefined as any,
  });

  // 机构类型配置
  const organizationTypes: OrganizationType[] = [
    // 案源机构
    { code: 'BANK', name: '银行', category: 'SOURCE', color: '#1890ff', icon: <BankOutlined /> },
    { code: 'CONSUMER_FINANCE', name: '消费金融公司', category: 'SOURCE', color: '#52c41a', icon: <BankOutlined /> },
    { code: 'ONLINE_LOAN', name: '网络贷款公司', category: 'SOURCE', color: '#faad14', icon: <BankOutlined /> },
    { code: 'MICRO_LOAN', name: '小额贷款公司', category: 'SOURCE', color: '#f5222d', icon: <BankOutlined /> },
    { code: 'AMC', name: '资产管理公司', category: 'SOURCE', color: '#722ed1', icon: <BankOutlined /> },
    // 处置机构
    { code: 'MEDIATION_CENTER', name: '调解中心', category: 'DISPOSAL', color: '#13c2c2', icon: <TeamOutlined /> },
    { code: 'LAW_FIRM', name: '律师事务所', category: 'DISPOSAL', color: '#eb2f96', icon: <TeamOutlined /> },
    { code: 'OTHER', name: '其他', category: 'DISPOSAL', color: '#8c8c8c', icon: <TeamOutlined /> },
  ];

  // 快速筛选选项
  const quickFilters: QuickFilter[] = [
    { key: 'all', label: '全部机构', count: stats.total },
    { key: 'source', label: '案源机构', count: stats.source },
    { key: 'disposal', label: '处置机构', count: stats.disposal },
    { key: 'active', label: '正常运行', count: stats.active },
    { key: 'pending', label: '待审核', count: stats.pending },
  ];

  // 防抖搜索
  const debouncedSearch = useDebouncedCallback((keyword: string) => {
    setQueryParams(prev => ({
      ...prev,
      keyword,
      page: 0, // 搜索时重置到第一页
    }));
  }, 500);

  useEffect(() => {
    loadOrganizations();
  }, [queryParams]);

  useEffect(() => {
    loadStatistics();
  }, []);

  // 构建查询参数
  const buildQueryParams = useCallback((): OrganizationQueryParams => {
    const params: OrganizationQueryParams = { ...queryParams };
    
    // 处理分类筛选
    if (activeCategory !== 'all') {
      if (activeCategory === 'source') {
        // 通过后端逻辑筛选案源机构
        params.category = 'SOURCE';
      } else if (activeCategory === 'disposal') {
        // 通过后端逻辑筛选处置机构
        params.category = 'DISPOSAL';
      } else if (activeCategory === 'active') {
        params.status = 'ACTIVE';
      } else if (activeCategory === 'pending') {
        params.status = 'PENDING';
      }
    }

    // 处理筛选条件
    if (filters.type) {
      params.type = filters.type;
    }
    if (filters.status) {
      params.status = filters.status;
    }
    if (filters.region) {
      params.region = filters.region;
    }
    if (filters.dateRange && filters.dateRange.length === 2) {
      params.startDate = filters.dateRange[0].format('YYYY-MM-DD');
      params.endDate = filters.dateRange[1].format('YYYY-MM-DD');
    }

    return params;
  }, [queryParams, activeCategory, filters]);

  // 加载机构列表
  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const params = buildQueryParams();
      const data = await organizationService.getOrganizations(params);
      setPageData(data);
    } catch (error) {
      console.error('加载机构列表失败:', error);
      message.error('加载机构列表失败');
      // 设置空数据状态
      setPageData({
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true,
        hasNext: false,
        hasPrevious: false,
      });
    } finally {
      setLoading(false);
    }
  };

  // 加载统计数据
  const loadStatistics = async () => {
    try {
      const data = await organizationService.getOrganizationStatistics();
      // 映射API响应到内部状态
      setStats({
        total: data.totalCount,
        source: (data as any).sourceCount || 0, // 根据实际API字段调整
        disposal: (data as any).disposalCount || 0, // 根据实际API字段调整
        active: data.activeCount,
        pending: data.pendingCount,
        suspended: data.suspendedCount,
      });
    } catch (error) {
      console.error('加载统计数据失败', error);
      // 使用默认值
      setStats({
        total: 0,
        source: 0,
        disposal: 0,
        active: 0,
        pending: 0,
        suspended: 0,
      });
    }
  };

  // 获取机构类型信息
  const getTypeInfo = (typeCode: string) => {
    return organizationTypes.find(t => t.code === typeCode) || 
           { code: typeCode, name: typeCode, category: 'SOURCE', color: '#8c8c8c', icon: <BankOutlined /> };
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'green';
      case 'PENDING': return 'orange';
      case 'SUSPENDED': return 'red';
      case 'REJECTED': return 'red';
      default: return 'default';
    }
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    debouncedSearch(value);
  };

  // 处理分类切换
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setQueryParams(prev => ({
      ...prev,
      page: 0, // 重置到第一页
    }));
  };

  // 处理筛选变化
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setQueryParams(prev => ({
      ...prev,
      page: 0, // 重置到第一页
    }));
  };

  // 处理分页变化
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setQueryParams(prev => ({
      ...prev,
      page: pagination.current - 1, // Ant Design分页从1开始，API从0开始
      size: pagination.pageSize,
      sortBy: sorter.field || 'createdAt',
      sortDir: sorter.order === 'ascend' ? 'asc' : 'desc',
    }));
  };

  // 处理新建机构
  const handleCreate = () => {
    navigate('/organizations/create');
  };

  // 处理查看详情
  const handleView = (record: Organization) => {
    navigate(`/organizations/${record.id}`);
  };

  // 处理编辑
  const handleEdit = (record: Organization) => {
    navigate(`/organizations/${record.id}/edit`);
  };

  // 处理删除
  const handleDelete = (record: Organization) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除机构"${record.orgName}"吗？此操作不可恢复。`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await organizationService.deleteOrganization(record.id);
          loadOrganizations();
          loadStatistics(); // 更新统计数据
        } catch (error) {
          console.error('删除失败:', error);
        }
      }
    });
  };

  // 处理批量操作
  const handleBatchOperation = async (operation: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要操作的机构');
      return;
    }

    const ids = selectedRowKeys.map(key => Number(key));
    
    try {
      switch (operation) {
        case 'export':
          const blob = await organizationService.exportOrganizations({ 
            ids: ids.join(',') 
          } as any);
          organizationService.downloadFile(blob, `organizations_${new Date().getTime()}.xlsx`);
          break;
        case 'activate':
          await organizationService.batchOperation('activate', ids);
          loadOrganizations();
          loadStatistics();
          setSelectedRowKeys([]);
          break;
        case 'suspend':
          await organizationService.batchOperation('suspend', ids);
          loadOrganizations();
          loadStatistics();
          setSelectedRowKeys([]);
          break;
        default:
          message.error('未知操作');
      }
    } catch (error) {
      console.error('批量操作失败:', error);
    }
  };

  // 处理导出
  const handleExport = async () => {
    try {
      const params = buildQueryParams();
      const blob = await organizationService.exportOrganizations(params);
      organizationService.downloadFile(blob, `organizations_${new Date().getTime()}.xlsx`);
    } catch (error) {
      console.error('导出失败:', error);
    }
  };

  // 批量操作菜单
  const batchActions = [
    { key: 'export', label: '导出选中', icon: <ExportOutlined /> },
    { key: 'activate', label: '批量激活', icon: <EditOutlined /> },
    { key: 'suspend', label: '批量停用', icon: <DeleteOutlined /> },
  ];

  // 表格行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys);
    },
    getCheckboxProps: (record: Organization) => ({
      disabled: record.status === 'PENDING',
    }),
  };

  // 表格列配置
  const columns: ColumnsType<Organization> = [
    {
      title: '机构信息',
      key: 'orgInfo',
      width: 280,
      render: (_, record) => {
        const typeInfo = getTypeInfo(record.type);
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              size={40} 
              style={{ backgroundColor: typeInfo.color, marginRight: 12 }}
              icon={typeInfo.icon}
            />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 14 }}>
                {record.orgName}
              </div>
              <div style={{ color: '#666', fontSize: 12 }}>
                {record.orgCode}
              </div>
              <Tag color={typeInfo.color}>
                {typeInfo.name}
              </Tag>
            </div>
          </div>
        );
      },
    },
    {
      title: '联系信息',
      key: 'contact',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <UserOutlined style={{ marginRight: 4, color: '#666' }} />
            {record.contactPerson}
          </div>
          <div style={{ marginBottom: 4 }}>
            <PhoneOutlined style={{ marginRight: 4, color: '#666' }} />
            {record.contactPhone}
          </div>
          <div>
            <MailOutlined style={{ marginRight: 4, color: '#666' }} />
            <Tooltip title={record.email || ''}>
              {record.email && record.email.length > 20 ? `${record.email.substring(0, 20)}...` : (record.email || '')}
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      title: '处理能力',
      key: 'capacity',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#666' }}>团队规模</span>
            <div style={{ fontWeight: 'bold' }}>{record.teamSize} 人</div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#666' }}>月处理能力</span>
            <div style={{ fontWeight: 'bold' }}>{record.monthlyCaseCapacity} 件</div>
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#666' }}>当前负载</span>
            <Progress 
              percent={record.currentLoadPercentage} 
              
              status={record.currentLoadPercentage > 80 ? 'exception' : 'active'}
            />
          </div>
        </div>
      ),
    },
    {
      title: '服务区域',
      dataIndex: 'serviceRegions',
      key: 'serviceRegions',
      width: 120,
      render: (regions: string[]) => (
        <div>
          {regions && regions.length > 0 ? (
            <>
              {regions.slice(0, 2).map(region => (
                <Tag key={region} color="blue" style={{ marginBottom: 2, fontSize: 11 }}>
                  {region}
                </Tag>
              ))}
              {regions.length > 2 && (
                <Tooltip title={regions.slice(2).join(', ')}>
                  <Tag color="default" style={{ fontSize: 11 }}>+{regions.length - 2}</Tag>
                </Tooltip>
              )}
            </>
          ) : (
            <Tag color="default" style={{ fontSize: 11 }}>暂无</Tag>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <div>
          <Tag color={getStatusColor(record.status)}>
            {record.statusName}
          </Tag>
          {record.approvalAt && (
            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
              <CalendarOutlined style={{ marginRight: 2 }} />
              {record.approvalAt.split(' ')[0]}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '最后活跃',
      dataIndex: 'lastActiveAt',
      key: 'lastActiveAt',
      width: 120,
      render: (time: string) => (
        <div style={{ fontSize: 12 }}>
          {time ? time.split(' ')[0] : '-'}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              type="link" 
              icon={<EyeOutlined />} 
             
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="link" 
              icon={<EditOutlined />} 
             
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                { key: 'delete', label: '删除', icon: <DeleteOutlined />, danger: true },
                { key: 'export', label: '导出', icon: <ExportOutlined /> },
              ],
              onClick: ({ key }) => {
                if (key === 'delete') {
                  handleDelete(record);
                }
              }
            }}
            trigger={['click']}
          >
            <Button type="link" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 统计卡片区域 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="总机构数"
              value={stats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="案源机构"
              value={stats.source}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="处置机构"
              value={stats.disposal}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="正常运行"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="待审核"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="已停用"
              value={stats.suspended}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容区域 */}
      <Card>
        {/* 快速筛选标签页 */}
        <Tabs 
          activeKey={activeCategory} 
          onChange={handleCategoryChange}
          style={{ marginBottom: 16 }}
        >
          {quickFilters.map(filter => (
            <TabPane
              tab={
                <Badge count={filter.count} offset={[10, 0]}>
                  {filter.label}
                </Badge>
              }
              key={filter.key}
            />
          ))}
        </Tabs>

        {/* 搜索和筛选区域 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Search
              placeholder="搜索机构名称、代码或联系人"
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="机构类型"
              allowClear
              style={{ width: '100%' }}
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
            >
              <Select.OptGroup label="案源机构">
                {organizationTypes.filter(t => t.category === 'SOURCE').map(type => (
                  <Select.Option key={type.code} value={type.code}>
                    {type.icon} {type.name}
                  </Select.Option>
                ))}
              </Select.OptGroup>
              <Select.OptGroup label="处置机构">
                {organizationTypes.filter(t => t.category === 'DISPOSAL').map(type => (
                  <Select.Option key={type.code} value={type.code}>
                    {type.icon} {type.name}
                  </Select.Option>
                ))}
              </Select.OptGroup>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="机构状态"
              allowClear
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
            >
              <Select.Option value="ACTIVE">正常</Select.Option>
              <Select.Option value="PENDING">待审核</Select.Option>
              <Select.Option value="SUSPENDED">停用</Select.Option>
              <Select.Option value="REJECTED">已拒绝</Select.Option>
            </Select>
          </Col>
          <Col span={4}>
            <RangePicker 
              placeholder={['开始时间', '结束时间']}
              style={{ width: '100%' }}
              value={filters.dateRange}
              onChange={(dates) => handleFilterChange('dateRange', dates)}
            />
          </Col>
          <Col span={4}>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                新建机构
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadOrganizations}>
                刷新
              </Button>
              <Button icon={<ExportOutlined />} onClick={handleExport}>
                导出
              </Button>
              {selectedRowKeys.length > 0 && (
                <Dropdown
                  menu={{
                    items: batchActions,
                    onClick: ({ key }) => {
                      handleBatchOperation(key);
                    }
                  }}
                >
                  <Button icon={<SettingOutlined />}>
                    批量操作 ({selectedRowKeys.length})
                  </Button>
                </Dropdown>
              )}
            </Space>
          </Col>
        </Row>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={pageData.content}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          scroll={{ x: 1200 }}
          onChange={handleTableChange}
          pagination={{
            current: pageData.page + 1, // Ant Design分页从1开始
            pageSize: pageData.size,
            total: pageData.totalElements,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无数据"
              />
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default OrganizationList;