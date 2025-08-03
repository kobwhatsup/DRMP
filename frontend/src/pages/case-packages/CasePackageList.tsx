import React, { useState, useEffect } from 'react';
import {
  Card, Button, Space, Tag, Modal, message, Tooltip, Dropdown, Progress,
  Table, Row, Col, Statistic, Input, Select, DatePicker, Alert, Badge
} from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  SendOutlined, UndoOutlined, UserAddOutlined, CheckOutlined,
  CloseOutlined, MoreOutlined, ExportOutlined, ImportOutlined,
  SearchOutlined, ReloadOutlined, FilterOutlined, DownloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { casePackageService, type CasePackage, type CasePackageQueryParams } from '@/services/caseService';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * 案件包列表页面
 */
const CasePackageList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<CasePackage[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [queryParams, setQueryParams] = useState<CasePackageQueryParams>({
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // 统计数据
  const [statistics, setStatistics] = useState({
    totalPackages: 0,
    draftPackages: 0,
    publishedPackages: 0,
    processingPackages: 0,
    completedPackages: 0,
    totalAmount: 0,
    recoveredAmount: 0,
    avgRecoveryRate: 0
  });

  // 状态颜色映射
  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      DRAFT: 'default',
      PUBLISHED: 'blue',
      ASSIGNING: 'orange',
      ASSIGNED: 'purple',
      PROCESSING: 'processing',
      COMPLETED: 'success',
      CANCELLED: 'error'
    };
    return colorMap[status] || 'default';
  };

  // 状态文本映射
  const getStatusText = (status: string): string => {
    const textMap: Record<string, string> = {
      DRAFT: '草稿',
      PUBLISHED: '已发布',
      ASSIGNING: '分案中',
      ASSIGNED: '已分配',
      PROCESSING: '处置中',
      COMPLETED: '已完成',
      CANCELLED: '已取消'
    };
    return textMap[status] || status;
  };

  // 加载数据
  const loadData = async (params?: Partial<CasePackageQueryParams>) => {
    setLoading(true);
    try {
      const mergedParams = { ...queryParams, ...params };
      // 模拟API响应数据，因为实际API还未实现
      const mockResponse = {
        items: [] as CasePackage[],
        total: 0
      };
      
      setDataSource(mockResponse.items);
      setTotal(mockResponse.total);
      setQueryParams(mergedParams);

      // 计算统计数据
      calculateStatistics(mockResponse.items);
    } catch (error) {
      message.error('加载数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 计算统计数据
  const calculateStatistics = (data: CasePackage[]) => {
    const stats = {
      totalPackages: data.length,
      draftPackages: data.filter(p => p.status === 'DRAFT').length,
      publishedPackages: data.filter(p => p.status === 'PUBLISHED').length,
      processingPackages: data.filter(p => p.status === 'PROCESSING').length,
      completedPackages: data.filter(p => p.status === 'COMPLETED').length,
      totalAmount: data.reduce((sum, p) => sum + (p.totalAmount || 0), 0),
      recoveredAmount: data.reduce((sum, p) => sum + (p.recoveredAmount || 0), 0),
      avgRecoveryRate: 0
    };
    
    if (stats.totalAmount > 0) {
      stats.avgRecoveryRate = (stats.recoveredAmount / stats.totalAmount) * 100;
    }
    
    setStatistics(stats);
  };

  // 操作处理函数
  const handlePublish = async (id: number) => {
    try {
      await casePackageService.publishCasePackage(id);
      message.success('发布成功');
      loadData();
    } catch (error) {
      message.error('发布失败');
    }
  };

  const handleCancel = async (id: number) => {
    Modal.confirm({
      title: '确认取消',
      content: '取消后案件包将无法继续处理，确定要取消吗？',
      onOk: async () => {
        try {
          await casePackageService.cancelCasePackage(id, '用户手动取消');
          message.success('取消成功');
          loadData();
        } catch (error) {
          message.error('取消失败');
        }
      }
    });
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后不可恢复，确定要删除这个案件包吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await casePackageService.deleteCasePackage(id);
          message.success('删除成功');
          loadData();
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  // 批量操作
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的案件包');
      return;
    }

    Modal.confirm({
      title: '批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个案件包吗？`,
      onOk: async () => {
        try {
          // 这里应该调用批量删除接口
          for (const id of selectedRowKeys) {
            await casePackageService.deleteCasePackage(Number(id));
          }
          message.success('批量删除成功');
          setSelectedRowKeys([]);
          loadData();
        } catch (error) {
          message.error('批量删除失败');
        }
      }
    });
  };

  const handleBatchPublish = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要发布的案件包');
      return;
    }

    Modal.confirm({
      title: '批量发布',
      content: `确定要发布选中的 ${selectedRowKeys.length} 个案件包吗？`,
      onOk: async () => {
        try {
          for (const id of selectedRowKeys) {
            await casePackageService.publishCasePackage(Number(id));
          }
          message.success('批量发布成功');
          setSelectedRowKeys([]);
          loadData();
        } catch (error) {
          message.error('批量发布失败');
        }
      }
    });
  };

  // 搜索处理
  const handleSearch = (value: string) => {
    loadData({ packageName: value, page: 0 });
  };

  // 筛选处理
  const handleFilter = (field: string, value: any) => {
    loadData({ [field]: value, page: 0 });
  };

  // 表格列定义
  const columns: ColumnsType<CasePackage> = [
    {
      title: '案件包信息',
      key: 'packageInfo',
      width: 250,
      fixed: 'left',
      render: (record: CasePackage) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
            {record.packageName}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            创建时间: {dayjs(record.createdAt).format('YYYY-MM-DD')}
          </div>
          {record.publishTime && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              发布时间: {dayjs(record.publishTime).format('YYYY-MM-DD')}
            </div>
          )}
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
      filters: [
        { text: '草稿', value: 'DRAFT' },
        { text: '已发布', value: 'PUBLISHED' },
        { text: '分案中', value: 'ASSIGNING' },
        { text: '已分配', value: 'ASSIGNED' },
        { text: '处置中', value: 'PROCESSING' },
        { text: '已完成', value: 'COMPLETED' },
        { text: '已取消', value: 'CANCELLED' }
      ],
      onFilter: (value: any, record: CasePackage) => record.status === value
    },
    {
      title: '案件统计',
      key: 'caseStats',
      width: 150,
      render: (record: CasePackage) => (
        <div>
          <div>总案件: <strong>{record.totalCases || 0}</strong></div>
          <div>已分配: <span style={{ color: '#1890ff' }}>{record.assignedCases || 0}</span></div>
          <div>处理中: <span style={{ color: '#faad14' }}>{record.processingCases || 0}</span></div>
          <div>已完成: <span style={{ color: '#52c41a' }}>{record.completedCases || 0}</span></div>
        </div>
      )
    },
    {
      title: '金额信息',
      key: 'amountInfo',
      width: 150,
      render: (record: CasePackage) => (
        <div>
          <div>总金额: <strong>¥{(record.totalAmount || 0).toLocaleString()}</strong></div>
          <div>已回款: <span style={{ color: '#52c41a' }}>¥{(record.recoveredAmount || 0).toLocaleString()}</span></div>
          <div>
            回款率: <strong style={{ color: record.recoveryRate > 50 ? '#52c41a' : '#faad14' }}>
              {record.recoveryRate ? record.recoveryRate.toFixed(1) : 0}%
            </strong>
          </div>
        </div>
      )
    },
    {
      title: '分案策略',
      dataIndex: 'assignmentStrategy',
      key: 'assignmentStrategy',
      width: 120,
      render: (strategy: string) => {
        const strategyMap: Record<string, string> = {
          INTELLIGENT: '智能分案',
          REGION: '按地区',
          AMOUNT: '按金额',
          OVERDUE_DAYS: '按账龄',
          PERFORMANCE: '按业绩',
          LOAD_BALANCE: '负载均衡'
        };
        return <Tag>{strategyMap[strategy] || strategy}</Tag>;
      }
    },
    {
      title: '处置要求',
      key: 'requirements',
      width: 180,
      render: (record: CasePackage) => (
        <div>
          {record.expectedRecoveryRate && (
            <div>期望回款率: {record.expectedRecoveryRate}%</div>
          )}
          {record.disposalPeriod && (
            <div>处置周期: {record.disposalPeriod}天</div>
          )}
          {record.disposalMethods && record.disposalMethods.length > 0 && (
            <div>
              处置方式: {record.disposalMethods.map(method => {
                const methodMap: Record<string, string> = {
                  MEDIATION: '调解',
                  LITIGATION: '诉讼',
                  PRESERVATION: '保全'
                };
                return methodMap[method] || method;
              }).join(', ')}
            </div>
          )}
        </div>
      )
    },
    {
      title: '进度',
      key: 'progress',
      width: 120,
      render: (record: CasePackage) => {
        const percent = record.totalCases > 0 ? 
          ((record.completedCases || 0) / record.totalCases) * 100 : 0;
        
        return (
          <div>
            <Progress 
              percent={percent} 
              size="small"
              format={() => `${percent.toFixed(1)}%`}
              strokeColor={percent > 70 ? '#52c41a' : percent > 40 ? '#faad14' : '#ff4d4f'}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
              {record.completedCases || 0}/{record.totalCases || 0}
            </div>
          </div>
        );
      }
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (record: CasePackage) => {
        const actionItems: MenuProps['items'] = [];

        // 根据状态显示不同操作
        if (record.status === 'DRAFT') {
          actionItems.push(
            {
              key: 'edit',
              icon: <EditOutlined />,
              label: '编辑',
              onClick: () => navigate(`/case-packages/${record.id}/edit`)
            },
            {
              key: 'publish',
              icon: <SendOutlined />,
              label: '发布',
              onClick: () => handlePublish(record.id)
            },
            {
              key: 'delete',
              icon: <DeleteOutlined />,
              label: '删除',
              danger: true,
              onClick: () => handleDelete(record.id)
            }
          );
        } else if (record.status === 'PUBLISHED') {
          actionItems.push(
            {
              key: 'assign',
              icon: <UserAddOutlined />,
              label: '智能分案',
              onClick: () => navigate(`/assignment?packageId=${record.id}`)
            },
            {
              key: 'cancel',
              icon: <UndoOutlined />,
              label: '取消',
              onClick: () => handleCancel(record.id)
            }
          );
        }

        // 通用操作
        actionItems.push(
          {
            type: 'divider'
          },
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: '查看详情',
            onClick: () => navigate(`/case-packages/${record.id}`)
          }
        );

        return (
          <Space>
            <Tooltip title="查看详情">
              <Button 
                type="link" 
                size="small"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/case-packages/${record.id}`)}
              />
            </Tooltip>
            <Dropdown menu={{ items: actionItems }} trigger={['click']}>
              <Button type="link" size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      }
    }
  ];

  // 初始化加载数据
  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="case-package-list">
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={3}>
          <Card>
            <Statistic
              title="总案件包"
              value={statistics.totalPackages}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="草稿"
              value={statistics.draftPackages}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="已发布"
              value={statistics.publishedPackages}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="处置中"
              value={statistics.processingPackages}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="已完成"
              value={statistics.completedPackages}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="总金额"
              value={statistics.totalAmount}
              precision={0}
              prefix="¥"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="平均回款率"
              value={statistics.avgRecoveryRate}
              precision={1}
              suffix="%"
              valueStyle={{ 
                color: statistics.avgRecoveryRate > 50 ? '#52c41a' : '#faad14' 
              }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title="案件包管理" 
        extra={
          <Space>
            <Button 
              icon={<ImportOutlined />} 
              onClick={() => navigate('/case-packages/import')}
            >
              批量导入
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => navigate('/case-packages/create')}
            >
              新建案件包
            </Button>
          </Space>
        }
      >
        {/* 搜索和筛选 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Search
              placeholder="搜索案件包名称"
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="状态筛选"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilter('status', value)}
            >
              <Option value="DRAFT">草稿</Option>
              <Option value="PUBLISHED">已发布</Option>
              <Option value="ASSIGNING">分案中</Option>
              <Option value="ASSIGNED">已分配</Option>
              <Option value="PROCESSING">处置中</Option>
              <Option value="COMPLETED">已完成</Option>
              <Option value="CANCELLED">已取消</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="分案策略"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilter('assignmentStrategy', value)}
            >
              <Option value="INTELLIGENT">智能分案</Option>
              <Option value="REGION">按地区</Option>
              <Option value="AMOUNT">按金额</Option>
              <Option value="OVERDUE_DAYS">按账龄</Option>
              <Option value="PERFORMANCE">按业绩</Option>
              <Option value="LOAD_BALANCE">负载均衡</Option>
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              placeholder={['发布开始日期', '发布结束日期']}
              style={{ width: '100%' }}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  handleFilter('publishTimeStart', dates[0].format('YYYY-MM-DD'));
                  handleFilter('publishTimeEnd', dates[1].format('YYYY-MM-DD'));
                } else {
                  handleFilter('publishTimeStart', undefined);
                  handleFilter('publishTimeEnd', undefined);
                }
              }}
            />
          </Col>
          <Col span={2}>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => loadData()}
              loading={loading}
            >
              刷新
            </Button>
          </Col>
        </Row>

        {/* 批量操作 */}
        {selectedRowKeys.length > 0 && (
          <Alert
            message={
              <Space>
                <span>已选择 {selectedRowKeys.length} 项</span>
                <Button size="small" onClick={handleBatchPublish}>
                  批量发布
                </Button>
                <Button size="small" danger onClick={handleBatchDelete}>
                  批量删除
                </Button>
                <Button size="small" onClick={() => setSelectedRowKeys([])}>
                  取消选择
                </Button>
              </Space>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            current: (queryParams.page || 0) + 1,
            pageSize: queryParams.size || 20,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            onChange: (page, size) => {
              loadData({ page: page - 1, size });
            }
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            getCheckboxProps: (record) => ({
              disabled: record.status === 'PROCESSING' || record.status === 'COMPLETED'
            })
          }}
        />
      </Card>
    </div>
  );
};

export default CasePackageList;