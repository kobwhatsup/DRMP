import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Space, Tag, Input, Select, Row, Col,
  Statistic, message, Modal, DatePicker, Typography, Divider,
  Alert, Badge, Tooltip, Progress, Tabs, Form, InputNumber,
  Timeline, Descriptions, List, Steps, Upload, Checkbox
} from 'antd';
import {
  AccountBookOutlined, DollarOutlined, ClockCircleOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined, ReloadOutlined,
  ExportOutlined, EyeOutlined, EditOutlined, PlusOutlined,
  SearchOutlined, FileTextOutlined, BankOutlined, CalendarOutlined,
  UploadOutlined, DownloadOutlined, PrinterOutlined,
  InfoCircleOutlined, CreditCardOutlined, PayCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { useDebouncedCallback } from 'use-debounce';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Step } = Steps;
const { TextArea } = Input;

// 结算记录接口
interface SettlementRecord {
  id: number;
  settlementCode: string;
  period: string;
  sourceOrg: string;
  packageCount: number;
  caseCount: number;
  totalAmount: number;
  recoveredAmount: number;
  feeAmount: number;
  adjustmentAmount: number;
  finalAmount: number;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'PAID' | 'DISPUTED' | 'CANCELLED';
  submittedAt?: string;
  reviewedAt?: string;
  paidAt?: string;
  paymentReference?: string;
  notes: string;
  attachments: string[];
  createdBy: string;
  createdAt: string;
}

// 结算详情接口
interface SettlementDetail extends SettlementRecord {
  packages: SettlementPackage[];
  adjustments: SettlementAdjustment[];
  documents: SettlementDocument[];
  auditLog: SettlementAuditLog[];
}

interface SettlementPackage {
  id: number;
  packageName: string;
  packageCode: string;
  caseCount: number;
  totalAmount: number;
  recoveredAmount: number;
  recoveryRate: number;
  feeRate: number;
  feeAmount: number;
  bonusAmount: number;
  totalFee: number;
}

interface SettlementAdjustment {
  id: number;
  type: 'BONUS' | 'PENALTY' | 'DISCOUNT' | 'OTHER';
  amount: number;
  reason: string;
  approvedBy: string;
  approvedAt: string;
}

interface SettlementDocument {
  id: number;
  name: string;
  type: 'INVOICE' | 'RECEIPT' | 'REPORT' | 'OTHER';
  url: string;
  uploadedAt: string;
}

interface SettlementAuditLog {
  id: number;
  action: string;
  operator: string;
  timestamp: string;
  notes: string;
}

const SettlementManagement: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  
  // 弹窗状态
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<SettlementDetail | null>(null);
  
  const [form] = Form.useForm();
  const [reviewForm] = Form.useForm();

  // 模拟数据
  const mockSettlements: SettlementRecord[] = [
    {
      id: 1,
      settlementCode: 'SET-2024-07-001',
      period: '2024-07',
      sourceOrg: '某商业银行',
      packageCount: 3,
      caseCount: 450,
      totalAmount: 22500000,
      recoveredAmount: 9675000,
      feeAmount: 820875,
      adjustmentAmount: 25000,
      finalAmount: 845875,
      status: 'PAID',
      submittedAt: '2024-08-01 10:00:00',
      reviewedAt: '2024-08-02 14:30:00',
      paidAt: '2024-08-05 16:45:00',
      paymentReference: 'PAY-2024-001',
      notes: '7月份结算，包含质量奖励25000元',
      attachments: ['结算报告.pdf', '发票.pdf', '回款凭证.xlsx'],
      createdBy: '财务专员',
      createdAt: '2024-08-01 09:30:00'
    },
    {
      id: 2,
      settlementCode: 'SET-2024-07-002',
      period: '2024-07',
      sourceOrg: '某股份制银行',
      packageCount: 2,
      caseCount: 280,
      totalAmount: 14800000,
      recoveredAmount: 6216000,
      feeAmount: 558720,
      adjustmentAmount: -15000,
      finalAmount: 543720,
      status: 'APPROVED',
      submittedAt: '2024-08-02 11:15:00',
      reviewedAt: '2024-08-03 15:20:00',
      notes: '7月份结算，扣除质量问题罚款15000元',
      attachments: ['结算明细.xlsx', '问题案件清单.pdf'],
      createdBy: '业务经理',
      createdAt: '2024-08-02 10:45:00'
    },
    {
      id: 3,
      settlementCode: 'SET-2024-07-003',
      period: '2024-07',
      sourceOrg: '某消金公司',
      packageCount: 1,
      caseCount: 120,
      totalAmount: 5200000,
      recoveredAmount: 1976000,
      feeAmount: 177840,
      adjustmentAmount: 0,
      finalAmount: 177840,
      status: 'PENDING_REVIEW',
      submittedAt: '2024-08-03 09:00:00',
      notes: '7月份结算，无调整项',
      attachments: ['业绩报告.pdf'],
      createdBy: '项目经理',
      createdAt: '2024-08-03 08:30:00'
    },
    {
      id: 4,
      settlementCode: 'SET-2024-08-001',
      period: '2024-08',
      sourceOrg: '某城商行',
      packageCount: 1,
      caseCount: 85,
      totalAmount: 7500000,
      recoveredAmount: 2850000,
      feeAmount: 256500,
      adjustmentAmount: 0,
      finalAmount: 256500,
      status: 'DRAFT',
      notes: '8月份结算草稿',
      attachments: [],
      createdBy: '当前用户',
      createdAt: '2024-08-10 14:20:00'
    }
  ];

  // 获取结算列表
  const fetchSettlements = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setSettlements(mockSettlements);
    } catch (error) {
      message.error('获取结算记录失败');
    } finally {
      setLoading(false);
    }
  };

  // 搜索防抖处理
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchText(value);
  }, 300);

  // 过滤数据
  const filteredSettlements = settlements.filter(settlement => {
    const matchSearch = !searchText || 
      settlement.settlementCode.toLowerCase().includes(searchText.toLowerCase()) ||
      settlement.sourceOrg.toLowerCase().includes(searchText.toLowerCase()) ||
      settlement.notes.toLowerCase().includes(searchText.toLowerCase());
    
    const matchStatus = !statusFilter || settlement.status === statusFilter;
    const matchPeriod = !periodFilter || settlement.period === periodFilter;
    
    return matchSearch && matchStatus && matchPeriod;
  });

  // 获取状态显示配置
  const getStatusConfig = (status: string) => {
    const configs = {
      'DRAFT': { text: '草稿', color: 'default', icon: <EditOutlined /> },
      'PENDING_REVIEW': { text: '待审核', color: 'processing', icon: <ClockCircleOutlined /> },
      'APPROVED': { text: '已审核', color: 'success', icon: <CheckCircleOutlined /> },
      'PAID': { text: '已付款', color: 'green', icon: <PayCircleOutlined /> },
      'DISPUTED': { text: '有争议', color: 'warning', icon: <ExclamationCircleOutlined /> },
      'CANCELLED': { text: '已取消', color: 'error', icon: <ExclamationCircleOutlined /> }
    };
    return configs[status as keyof typeof configs] || configs['DRAFT'];
  };

  // 表格列定义
  const columns: ColumnsType<SettlementRecord> = [
    {
      title: '结算信息',
      key: 'settlementInfo',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <AccountBookOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <strong>{record.settlementCode}</strong>
          </div>
          <div style={{ color: '#666', fontSize: '12px', marginBottom: 4 }}>
            结算期间: {record.period}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {record.sourceOrg}
          </div>
        </div>
      ),
    },
    {
      title: '案件统计',
      key: 'caseStats',
      width: 120,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.packageCount} 包</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.caseCount} 案件
          </div>
        </div>
      ),
    },
    {
      title: '金额信息',
      key: 'amountInfo',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <Text type="secondary">回款:</Text>
            <span style={{ fontWeight: 'bold', marginLeft: 4 }}>
              ¥{record.recoveredAmount.toLocaleString()}
            </span>
          </div>
          <div style={{ marginBottom: 4 }}>
            <Text type="secondary">服务费:</Text>
            <span style={{ color: '#1890ff', marginLeft: 4 }}>
              ¥{record.feeAmount.toLocaleString()}
            </span>
          </div>
          <div>
            <Text type="secondary">最终:</Text>
            <span style={{ fontWeight: 'bold', color: '#52c41a', marginLeft: 4 }}>
              ¥{record.finalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: '调整金额',
      dataIndex: 'adjustmentAmount',
      key: 'adjustmentAmount',
      width: 100,
      render: (amount) => (
        <span style={{ 
          color: amount > 0 ? '#52c41a' : amount < 0 ? '#f5222d' : '#666',
          fontWeight: amount !== 0 ? 'bold' : 'normal'
        }}>
          {amount > 0 ? '+' : ''}¥{amount.toLocaleString()}
        </span>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 120,
      render: (_, record) => {
        const config = getStatusConfig(record.status);
        return (
          <Badge 
            status={config.color as any}
            text={
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {config.icon}
                {config.text}
              </span>
            }
          />
        );
      },
    },
    {
      title: '关键时间',
      key: 'timeline',
      width: 120,
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div style={{ marginBottom: 2 }}>
            <Text type="secondary">创建:</Text>
            <div>{dayjs(record.createdAt).format('MM-DD HH:mm')}</div>
          </div>
          {record.paidAt && (
            <div style={{ color: '#52c41a' }}>
              <Text type="secondary">付款:</Text>
              <div>{dayjs(record.paidAt).format('MM-DD HH:mm')}</div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.status === 'DRAFT' && (
            <Tooltip title="编辑">
              <Button 
                type="text" 
                size="small" 
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
          )}
          {record.status === 'PENDING_REVIEW' && (
            <Tooltip title="审核">
              <Button 
                type="text" 
                size="small" 
                icon={<CheckCircleOutlined />}
                onClick={() => handleReview(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // 操作处理函数
  const handleViewDetail = async (record: SettlementRecord) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 模拟详细数据
      const detail: SettlementDetail = {
        ...record,
        packages: [
          {
            id: 1,
            packageName: '个人信贷案件包2024-001',
            packageCode: 'PKG-2024-001',
            caseCount: 200,
            totalAmount: 10000000,
            recoveredAmount: 4200000,
            recoveryRate: 42.0,
            feeRate: 8.5,
            feeAmount: 357000,
            bonusAmount: 10000,
            totalFee: 367000
          }
        ],
        adjustments: record.adjustmentAmount !== 0 ? [
          {
            id: 1,
            type: record.adjustmentAmount > 0 ? 'BONUS' : 'PENALTY',
            amount: Math.abs(record.adjustmentAmount),
            reason: record.adjustmentAmount > 0 ? '质量优秀奖励' : '质量问题扣款',
            approvedBy: '部门经理',
            approvedAt: '2024-08-01 15:30:00'
          }
        ] : [],
        documents: record.attachments.map((name, index) => ({
          id: index + 1,
          name: name,
          type: name.includes('发票') ? 'INVOICE' : 
                name.includes('报告') ? 'REPORT' : 'OTHER',
          url: `/documents/${name}`,
          uploadedAt: record.createdAt
        })),
        auditLog: [
          {
            id: 1,
            action: '创建结算单',
            operator: record.createdBy,
            timestamp: record.createdAt,
            notes: '初始创建'
          }
        ]
      };
      
      setSelectedSettlement(detail);
      setDetailModalVisible(true);
    } catch (error) {
      message.error('获取详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: SettlementRecord) => {
    form.setFieldsValue(record);
    setCreateModalVisible(true);
  };

  const handleReview = (record: SettlementRecord) => {
    setSelectedSettlement(record as SettlementDetail);
    reviewForm.resetFields();
    setReviewModalVisible(true);
  };

  const handleCreate = () => {
    form.resetFields();
    form.setFieldsValue({
      period: dayjs().format('YYYY-MM'),
      status: 'DRAFT'
    });
    setCreateModalVisible(true);
  };

  const handleSubmitSettlement = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('结算单保存成功');
      setCreateModalVisible(false);
      fetchSettlements();
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('审核完成');
      setReviewModalVisible(false);
      fetchSettlements();
    } catch (error) {
      message.error('审核失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    message.info('结算报表导出功能开发中...');
  };

  const handleBatchApprove = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要批量审核的记录');
      return;
    }
    
    Modal.confirm({
      title: '批量审核确认',
      content: `确定要批量审核选中的 ${selectedRowKeys.length} 条记录吗？`,
      onOk: async () => {
        setLoading(true);
        try {
          await new Promise(resolve => setTimeout(resolve, 1500));
          message.success('批量审核完成');
          setSelectedRowKeys([]);
          fetchSettlements();
        } catch (error) {
          message.error('批量审核失败');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // 统计数据
  const stats = {
    total: filteredSettlements.length,
    pending: filteredSettlements.filter(s => s.status === 'PENDING_REVIEW').length,
    totalAmount: filteredSettlements.reduce((sum, s) => sum + s.finalAmount, 0),
    paidAmount: filteredSettlements.filter(s => s.status === 'PAID').reduce((sum, s) => sum + s.finalAmount, 0)
  };

  useEffect(() => {
    fetchSettlements();
  }, []);

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>结算管理</Title>
        <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
          管理与案源机构的费用结算，跟踪审核和付款状态
        </Paragraph>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="结算单总数"
              value={stats.total}
              prefix={<AccountBookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审核"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="结算总额"
              value={stats.totalAmount}
              precision={0}
              formatter={(value) => `¥${Number(value).toLocaleString()}`}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已付款金额"
              value={stats.paidAmount}
              precision={0}
              formatter={(value) => `¥${Number(value).toLocaleString()}`}
              prefix={<PayCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 操作区域 */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} justify="space-between" align="middle">
          <Col flex="auto">
            <Space size="middle">
              <Search
                placeholder="搜索结算编号、机构或备注"
                allowClear
                style={{ width: 300 }}
                onChange={(e) => debouncedSearch(e.target.value)}
                onSearch={debouncedSearch}
              />
              <Select
                placeholder="结算状态"
                allowClear
                style={{ width: 120 }}
                value={statusFilter}
                onChange={setStatusFilter}
              >
                <Option value="DRAFT">草稿</Option>
                <Option value="PENDING_REVIEW">待审核</Option>
                <Option value="APPROVED">已审核</Option>
                <Option value="PAID">已付款</Option>
                <Option value="DISPUTED">有争议</Option>
              </Select>
              <Select
                placeholder="结算期间"
                allowClear
                style={{ width: 120 }}
                value={periodFilter}
                onChange={setPeriodFilter}
              >
                <Option value="2024-08">2024-08</Option>
                <Option value="2024-07">2024-07</Option>
                <Option value="2024-06">2024-06</Option>
                <Option value="2024-05">2024-05</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchSettlements} loading={loading}>
                刷新
              </Button>
              <Button icon={<ExportOutlined />} onClick={handleExport}>
                导出报表
              </Button>
              <Button 
                type="primary" 
                ghost
                disabled={selectedRowKeys.length === 0}
                onClick={handleBatchApprove}
              >
                批量审核
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                新建结算
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 结算列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredSettlements}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as number[]),
            getCheckboxProps: (record) => ({
              disabled: record.status !== 'PENDING_REVIEW'
            })
          }}
          pagination={{
            total: filteredSettlements.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>

      {/* 结算详情弹窗 */}
      <Modal
        title="结算详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedSettlement && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="基本信息" key="1">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="结算编号">
                  {selectedSettlement.settlementCode}
                </Descriptions.Item>
                <Descriptions.Item label="结算期间">
                  {selectedSettlement.period}
                </Descriptions.Item>
                <Descriptions.Item label="案源机构">
                  {selectedSettlement.sourceOrg}
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Badge 
                    status={getStatusConfig(selectedSettlement.status).color as any}
                    text={getStatusConfig(selectedSettlement.status).text}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="案件包数量">
                  {selectedSettlement.packageCount}
                </Descriptions.Item>
                <Descriptions.Item label="案件总数">
                  {selectedSettlement.caseCount}
                </Descriptions.Item>
                <Descriptions.Item label="案件总金额">
                  ¥{selectedSettlement.totalAmount.toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="回款金额">
                  ¥{selectedSettlement.recoveredAmount.toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="服务费">
                  ¥{selectedSettlement.feeAmount.toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="调整金额">
                  <span style={{ 
                    color: selectedSettlement.adjustmentAmount > 0 ? '#52c41a' : 
                           selectedSettlement.adjustmentAmount < 0 ? '#f5222d' : '#666'
                  }}>
                    {selectedSettlement.adjustmentAmount > 0 ? '+' : ''}
                    ¥{selectedSettlement.adjustmentAmount.toLocaleString()}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="最终结算金额">
                  <strong style={{ color: '#1890ff' }}>
                    ¥{selectedSettlement.finalAmount.toLocaleString()}
                  </strong>
                </Descriptions.Item>
                <Descriptions.Item label="付款参考号">
                  {selectedSettlement.paymentReference || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="备注" span={2}>
                  {selectedSettlement.notes}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            
            <TabPane tab="案件包明细" key="2">
              <Table
                dataSource={selectedSettlement.packages}
                columns={[
                  { title: '案件包名称', dataIndex: 'packageName', key: 'packageName' },
                  { title: '案件包编号', dataIndex: 'packageCode', key: 'packageCode', width: 150 },
                  { title: '案件数', dataIndex: 'caseCount', key: 'caseCount', width: 80 },
                  { 
                    title: '案件金额', 
                    dataIndex: 'totalAmount', 
                    key: 'totalAmount',
                    width: 120,
                    render: (amount) => `¥${amount.toLocaleString()}`
                  },
                  { 
                    title: '回款金额', 
                    dataIndex: 'recoveredAmount', 
                    key: 'recoveredAmount',
                    width: 120,
                    render: (amount) => `¥${amount.toLocaleString()}`
                  },
                  { 
                    title: '回款率', 
                    dataIndex: 'recoveryRate', 
                    key: 'recoveryRate',
                    width: 80,
                    render: (rate) => `${rate}%`
                  },
                  { 
                    title: '费率', 
                    dataIndex: 'feeRate', 
                    key: 'feeRate',
                    width: 80,
                    render: (rate) => `${rate}%`
                  },
                  { 
                    title: '总费用', 
                    dataIndex: 'totalFee', 
                    key: 'totalFee',
                    width: 120,
                    render: (fee) => `¥${fee.toLocaleString()}`
                  }
                ]}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </TabPane>
            
            {selectedSettlement.adjustments.length > 0 && (
              <TabPane tab="调整项目" key="3">
                <List
                  dataSource={selectedSettlement.adjustments}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Tag color={item.amount > 0 ? 'green' : 'red'}>
                              {item.type === 'BONUS' ? '奖励' :
                               item.type === 'PENALTY' ? '罚款' :
                               item.type === 'DISCOUNT' ? '折扣' : '其他'}
                            </Tag>
                            <span style={{ 
                              color: item.amount > 0 ? '#52c41a' : '#f5222d',
                              fontWeight: 'bold'
                            }}>
                              {item.amount > 0 ? '+' : ''}¥{Math.abs(item.amount).toLocaleString()}
                            </span>
                          </div>
                        }
                        description={
                          <div>
                            <div>{item.reason}</div>
                            <div style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>
                              批准人: {item.approvedBy} | 时间: {dayjs(item.approvedAt).format('YYYY-MM-DD HH:mm')}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </TabPane>
            )}
            
            <TabPane tab="相关文档" key="4">
              <List
                dataSource={selectedSettlement.documents}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button 
                        type="link" 
                        icon={<DownloadOutlined />}
                        onClick={() => message.info('下载功能开发中')}
                      >
                        下载
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<FileTextOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                      title={item.name}
                      description={
                        <div>
                          <Tag color="blue">
                            {item.type === 'INVOICE' ? '发票' :
                             item.type === 'RECEIPT' ? '收据' :
                             item.type === 'REPORT' ? '报告' : '其他'}
                          </Tag>
                          <span style={{ color: '#999', marginLeft: 8 }}>
                            {dayjs(item.uploadedAt).format('YYYY-MM-DD HH:mm')}
                          </span>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </TabPane>
            
            <TabPane tab="操作日志" key="5">
              <Timeline>
                {selectedSettlement.auditLog.map(log => (
                  <Timeline.Item key={log.id}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{log.action}</div>
                      <div style={{ color: '#666', fontSize: '12px', marginBottom: 4 }}>
                        {log.timestamp} | {log.operator}
                      </div>
                      <div>{log.notes}</div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* 创建/编辑结算弹窗 */}
      <Modal
        title="创建结算单"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        width={800}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitSettlement}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="period"
                label="结算期间"
                rules={[{ required: true, message: '请选择结算期间' }]}
              >
                <DatePicker picker="month" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sourceOrg"
                label="案源机构"
                rules={[{ required: true, message: '请选择案源机构' }]}
              >
                <Select placeholder="请选择案源机构">
                  <Option value="某商业银行">某商业银行</Option>
                  <Option value="某股份制银行">某股份制银行</Option>
                  <Option value="某消金公司">某消金公司</Option>
                  <Option value="某城商行">某城商行</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="packageCount"
                label="案件包数量"
                rules={[{ required: true, message: '请输入案件包数量' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="caseCount"
                label="案件总数"
                rules={[{ required: true, message: '请输入案件总数' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="totalAmount"
                label="案件总金额"
                rules={[{ required: true, message: '请输入案件总金额' }]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }}
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/¥\s?|(,*)/g, '') as any}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="recoveredAmount"
                label="回款金额"
                rules={[{ required: true, message: '请输入回款金额' }]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }}
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/¥\s?|(,*)/g, '') as any}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="feeAmount"
                label="服务费金额"
                rules={[{ required: true, message: '请输入服务费金额' }]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }}
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/¥\s?|(,*)/g, '') as any}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="adjustmentAmount"
                label="调整金额"
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/¥\s?|(,*)/g, '') as any}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="备注说明"
          >
            <TextArea rows={3} placeholder="请输入结算说明" />
          </Form.Item>

          <Form.Item name="attachments" label="相关附件">
            <Upload
              action="/upload"
              listType="text"
              multiple
            >
              <Button icon={<UploadOutlined />}>上传附件</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setCreateModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存结算单
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 审核弹窗 */}
      <Modal
        title="结算审核"
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        width={600}
        footer={null}
      >
        <Form
          form={reviewForm}
          layout="vertical"
          onFinish={handleSubmitReview}
        >
          <Alert
            message="请仔细核对结算信息"
            description="审核通过后，结算单将进入付款流程，请确保所有信息准确无误。"
            type="info"
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            name="decision"
            label="审核决定"
            rules={[{ required: true, message: '请选择审核决定' }]}
          >
            <Select placeholder="请选择审核决定">
              <Option value="APPROVED">审核通过</Option>
              <Option value="REJECTED">审核拒绝</Option>
              <Option value="RETURNED">退回修改</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="reviewNotes"
            label="审核意见"
            rules={[{ required: true, message: '请输入审核意见' }]}
          >
            <TextArea rows={4} placeholder="请输入审核意见和建议" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setReviewModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                提交审核
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SettlementManagement;