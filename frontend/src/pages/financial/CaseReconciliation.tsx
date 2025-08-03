import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Space, Modal, Form, Input, Select, DatePicker,
  Row, Col, Statistic, Tag, Badge, Alert, Upload, message, Tooltip,
  Typography, Divider, InputNumber, Progress, Timeline, Tabs, Spin,
  Dropdown, Popconfirm, Switch, Radio, Checkbox, Steps
} from 'antd';
import {
  DollarOutlined, CheckCircleOutlined, CloseCircleOutlined, 
  ExclamationCircleOutlined, UploadOutlined, DownloadOutlined,
  SearchOutlined, FilterOutlined, SyncOutlined, HistoryOutlined,
  FileTextOutlined, BankOutlined, ClockCircleOutlined, EditOutlined,
  DeleteOutlined, EyeOutlined, SettingOutlined, MoreOutlined,
  CalendarOutlined, AuditOutlined, MoneyCollectOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Step } = Steps;

// 对账状态枚举
const ReconciliationStatus = {
  PENDING: { text: '待对账', color: 'orange' },
  MATCHED: { text: '已匹配', color: 'blue' },
  CONFIRMED: { text: '已确认', color: 'green' },
  DISPUTED: { text: '有争议', color: 'red' },
  RESOLVED: { text: '已解决', color: 'purple' }
};

// 回款记录接口
interface PaymentRecord {
  id: number;
  caseId: number;
  caseName: string;
  debtorName: string;
  sourceOrgId: number;
  sourceOrgName: string;
  disposalOrgId: number;
  disposalOrgName: string;
  paymentAmount: number;
  paymentDate: string;
  paymentMethod: string;
  bankTransactionNo?: string;
  systemRecordId?: string;
  reconciliationStatus: string;
  confirmedAmount?: number;
  confirmedDate?: string;
  disputeReason?: string;
  attachments?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// 对账汇总接口
interface ReconciliationSummary {
  totalPayments: number;
  totalAmount: number;
  matchedCount: number;
  matchedAmount: number;
  pendingCount: number;
  pendingAmount: number;
  disputedCount: number;
  disputedAmount: number;
  matchRate: number;
  avgMatchTime: number; // 平均匹配时间（小时）
}

// 对账规则接口
interface ReconciliationRule {
  id: number;
  ruleName: string;
  matchCriteria: {
    amountTolerance: number; // 金额容差
    timeTolerance: number; // 时间容差（天）
    requiredFields: string[]; // 必需字段
    autoMatch: boolean; // 是否自动匹配
  };
  priority: number;
  enabled: boolean;
  createdAt: string;
}

/**
 * 案件对账管理页面
 */
const CaseReconciliation: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<PaymentRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [summary, setSummary] = useState<ReconciliationSummary>({
    totalPayments: 0,
    totalAmount: 0,
    matchedCount: 0,
    matchedAmount: 0,
    pendingCount: 0,
    pendingAmount: 0,
    disputedCount: 0,
    disputedAmount: 0,
    matchRate: 0,
    avgMatchTime: 0
  });
  const [reconciliationRules, setReconciliationRules] = useState<ReconciliationRule[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [disputeModalVisible, setDisputeModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(null);
  const [queryParams, setQueryParams] = useState({
    page: 0,
    size: 20,
    status: '',
    dateRange: [] as string[],
    orgId: '',
    keyword: ''
  });
  
  const [detailForm] = Form.useForm();
  const [batchForm] = Form.useForm();
  const [ruleForm] = Form.useForm();
  const [disputeForm] = Form.useForm();

  // 加载对账数据
  const loadData = async (params?: any) => {
    setLoading(true);
    try {
      const mergedParams = { ...queryParams, ...params };
      
      // 模拟对账数据
      const mockPaymentRecords: PaymentRecord[] = [
        {
          id: 1,
          caseId: 1,
          caseName: '张某某 - JJ202400001',
          debtorName: '张某某',
          sourceOrgId: 1,
          sourceOrgName: 'XX银行',
          disposalOrgId: 2,
          disposalOrgName: '华东调解中心',
          paymentAmount: 15000,
          paymentDate: '2024-01-20',
          paymentMethod: '银行转账',
          bankTransactionNo: 'TXN20240120001',
          systemRecordId: 'SYS20240120001',
          reconciliationStatus: 'MATCHED',
          confirmedAmount: 15000,
          confirmedDate: '2024-01-21',
          createdAt: '2024-01-20 14:30:00',
          updatedAt: '2024-01-21 09:15:00'
        },
        {
          id: 2,
          caseId: 2,
          caseName: '李某某 - JJ202400002',
          debtorName: '李某某',
          sourceOrgId: 1,
          sourceOrgName: 'XX银行',
          disposalOrgId: 3,
          disposalOrgName: '北京金诚律所',
          paymentAmount: 8500,
          paymentDate: '2024-01-19',
          paymentMethod: '支付宝转账',
          systemRecordId: 'SYS20240119002',
          reconciliationStatus: 'PENDING',
          createdAt: '2024-01-19 16:45:00',
          updatedAt: '2024-01-19 16:45:00'
        },
        {
          id: 3,
          caseId: 3,
          caseName: '王某某 - JJ202400003',
          debtorName: '王某某',
          sourceOrgId: 2,
          sourceOrgName: 'YY消金',
          disposalOrgId: 2,
          disposalOrgName: '华东调解中心',
          paymentAmount: 25000,
          paymentDate: '2024-01-18',
          paymentMethod: '银行转账',
          bankTransactionNo: 'TXN20240118003',
          reconciliationStatus: 'DISPUTED',
          disputeReason: '银行到账金额与系统记录不符',
          createdAt: '2024-01-18 11:20:00',
          updatedAt: '2024-01-22 15:30:00'
        }
      ];

      // 模拟汇总数据
      const mockSummary: ReconciliationSummary = {
        totalPayments: 156,
        totalAmount: 2850000,
        matchedCount: 89,
        matchedAmount: 1680000,
        pendingCount: 52,
        pendingAmount: 985000,
        disputedCount: 15,
        disputedAmount: 185000,
        matchRate: 57.1,
        avgMatchTime: 4.5
      };

      setDataSource(mockPaymentRecords);
      setTotal(mockPaymentRecords.length);
      setSummary(mockSummary);
      setQueryParams(mergedParams);
    } catch (error) {
      message.error('加载数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 加载对账规则
  const loadReconciliationRules = async () => {
    try {
      const mockRules: ReconciliationRule[] = [
        {
          id: 1,
          ruleName: '严格匹配规则',
          matchCriteria: {
            amountTolerance: 0,
            timeTolerance: 0,
            requiredFields: ['bankTransactionNo', 'paymentAmount', 'paymentDate'],
            autoMatch: true
          },
          priority: 1,
          enabled: true,
          createdAt: '2024-01-01 10:00:00'
        },
        {
          id: 2,
          ruleName: '宽松匹配规则',
          matchCriteria: {
            amountTolerance: 100,
            timeTolerance: 3,
            requiredFields: ['paymentAmount', 'paymentDate'],
            autoMatch: false
          },
          priority: 2,
          enabled: true,
          createdAt: '2024-01-01 10:00:00'
        }
      ];
      
      setReconciliationRules(mockRules);
    } catch (error) {
      console.error('Failed to load reconciliation rules:', error);
    }
  };

  useEffect(() => {
    loadData();
    loadReconciliationRules();
  }, []);

  // 手动匹配
  const handleManualMatch = async (record: PaymentRecord) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 更新记录状态
      const updatedRecords = dataSource.map(item => 
        item.id === record.id 
          ? { ...item, reconciliationStatus: 'MATCHED', confirmedDate: dayjs().format('YYYY-MM-DD') }
          : item
      );
      
      setDataSource(updatedRecords);
      message.success('手动匹配成功');
      loadData(); // 刷新汇总数据
    } catch (error) {
      message.error('匹配失败');
    }
  };

  // 确认对账
  const handleConfirmReconciliation = async (record: PaymentRecord) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedRecords = dataSource.map(item => 
        item.id === record.id 
          ? { 
              ...item, 
              reconciliationStatus: 'CONFIRMED',
              confirmedAmount: item.paymentAmount,
              confirmedDate: dayjs().format('YYYY-MM-DD')
            }
          : item
      );
      
      setDataSource(updatedRecords);
      message.success('对账确认成功');
      loadData();
    } catch (error) {
      message.error('确认失败');
    }
  };

  // 提出争议
  const handleRaiseDispute = (record: PaymentRecord) => {
    setSelectedRecord(record);
    setDisputeModalVisible(true);
  };

  // 提交争议
  const submitDispute = async (values: any) => {
    if (!selectedRecord) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedRecords = dataSource.map(item => 
        item.id === selectedRecord.id 
          ? { 
              ...item, 
              reconciliationStatus: 'DISPUTED',
              disputeReason: values.disputeReason
            }
          : item
      );
      
      setDataSource(updatedRecords);
      message.success('争议已提交');
      setDisputeModalVisible(false);
      disputeForm.resetFields();
      loadData();
    } catch (error) {
      message.error('提交争议失败');
    }
  };

  // 批量确认
  const handleBatchConfirm = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要确认的记录');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedRecords = dataSource.map(item => 
        selectedRowKeys.includes(item.id) && item.reconciliationStatus === 'MATCHED'
          ? { 
              ...item, 
              reconciliationStatus: 'CONFIRMED',
              confirmedAmount: item.paymentAmount,
              confirmedDate: dayjs().format('YYYY-MM-DD')
            }
          : item
      );
      
      setDataSource(updatedRecords);
      setSelectedRowKeys([]);
      message.success(`已批量确认 ${selectedRowKeys.length} 条记录`);
      loadData();
    } catch (error) {
      message.error('批量确认失败');
    }
  };

  // 自动对账
  const handleAutoReconciliation = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟自动对账结果
      const updatedRecords = dataSource.map(item => 
        item.reconciliationStatus === 'PENDING' && Math.random() > 0.3
          ? { ...item, reconciliationStatus: 'MATCHED', confirmedDate: dayjs().format('YYYY-MM-DD') }
          : item
      );
      
      setDataSource(updatedRecords);
      message.success('自动对账完成，匹配了部分记录');
      loadData();
    } catch (error) {
      message.error('自动对账失败');
    } finally {
      setLoading(false);
    }
  };

  // 导出对账报告
  const handleExportReport = async () => {
    try {
      message.success('对账报告导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  // 表格列定义
  const columns: ColumnsType<PaymentRecord> = [
    {
      title: '案件信息',
      key: 'caseInfo',
      width: 200,
      render: (record: PaymentRecord) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
            {record.caseName}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            债务人: {record.debtorName}
          </div>
        </div>
      )
    },
    {
      title: '机构信息',
      key: 'orgInfo',
      width: 180,
      render: (record: PaymentRecord) => (
        <div>
          <div style={{ fontSize: '12px', marginBottom: 2 }}>
            案源: {record.sourceOrgName}
          </div>
          <div style={{ fontSize: '12px' }}>
            处置: {record.disposalOrgName}
          </div>
        </div>
      )
    },
    {
      title: '回款信息',
      key: 'paymentInfo',
      width: 150,
      render: (record: PaymentRecord) => (
        <div>
          <div style={{ fontWeight: 'bold', color: '#52c41a' }}>
            ¥{record.paymentAmount.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.paymentDate}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.paymentMethod}
          </div>
        </div>
      )
    },
    {
      title: '交易凭证',
      dataIndex: 'bankTransactionNo',
      width: 120,
      render: (text: string) => text || <Text type="secondary">无</Text>
    },
    {
      title: '对账状态',
      dataIndex: 'reconciliationStatus',
      width: 100,
      render: (status: string) => {
        const config = ReconciliationStatus[status as keyof typeof ReconciliationStatus];
        return (
          <Badge 
            status={config?.color as any} 
            text={config?.text || status} 
          />
        );
      }
    },
    {
      title: '确认信息',
      key: 'confirmInfo',
      width: 120,
      render: (record: PaymentRecord) => (
        <div>
          {record.confirmedAmount && (
            <div style={{ fontSize: '12px', color: '#52c41a' }}>
              ¥{record.confirmedAmount.toLocaleString()}
            </div>
          )}
          {record.confirmedDate && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.confirmedDate}
            </div>
          )}
        </div>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (record: PaymentRecord) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedRecord(record);
              setDetailModalVisible(true);
            }}
          >
            详情
          </Button>
          
          {record.reconciliationStatus === 'PENDING' && (
            <Button 
              type="link" 
              size="small" 
              onClick={() => handleManualMatch(record)}
            >
              匹配
            </Button>
          )}
          
          {record.reconciliationStatus === 'MATCHED' && (
            <Button 
              type="link" 
              size="small" 
              onClick={() => handleConfirmReconciliation(record)}
            >
              确认
            </Button>
          )}
          
          {['MATCHED', 'CONFIRMED'].includes(record.reconciliationStatus) && (
            <Button 
              type="link" 
              size="small" 
              danger
              onClick={() => handleRaiseDispute(record)}
            >
              争议
            </Button>
          )}
        </Space>
      )
    }
  ];

  // 渲染汇总统计
  const renderSummaryStats = () => (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col span={4}>
        <Card>
          <Statistic
            title="总回款记录"
            value={summary.totalPayments}
            suffix="笔"
            valueStyle={{ color: '#1890ff' }}
            prefix={<MoneyCollectOutlined />}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="总回款金额"
            value={summary.totalAmount / 10000}
            suffix="万"
            precision={1}
            valueStyle={{ color: '#52c41a' }}
            prefix={<DollarOutlined />}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="已匹配"
            value={summary.matchedCount}
            suffix={`/ ${summary.totalPayments}`}
            valueStyle={{ color: '#722ed1' }}
            prefix={<CheckCircleOutlined />}
          />
          <Progress 
            percent={Number((summary.matchedCount / summary.totalPayments * 100).toFixed(1))} 
            size="small" 
            showInfo={false}
            strokeColor="#722ed1"
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="待处理"
            value={summary.pendingCount}
            valueStyle={{ color: '#faad14' }}
            prefix={<ClockCircleOutlined />}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="有争议"
            value={summary.disputedCount}
            valueStyle={{ color: '#ff4d4f' }}
            prefix={<ExclamationCircleOutlined />}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card>
          <Statistic
            title="匹配率"
            value={summary.matchRate}
            suffix="%"
            precision={1}
            valueStyle={{ color: '#13c2c2' }}
          />
        </Card>
      </Col>
    </Row>
  );

  return (
    <div className="case-reconciliation">
      {/* 页面头部 */}
      <Card style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <AuditOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              案件对账管理
            </Title>
            <Text type="secondary">回款记录对账、争议处理、财务结算</Text>
          </Col>
          <Col>
            <Space>
              <Button 
                type="primary" 
                icon={<SyncOutlined />}
                onClick={handleAutoReconciliation}
                loading={loading}
              >
                自动对账
              </Button>
              <Button 
                icon={<DownloadOutlined />}
                onClick={handleExportReport}
              >
                导出报告
              </Button>
              <Dropdown menu={{
                items: [
                  { key: 'rules', icon: <SettingOutlined />, label: '对账规则' },
                  { key: 'import', icon: <UploadOutlined />, label: '导入数据' },
                  { key: 'history', icon: <HistoryOutlined />, label: '对账历史' }
                ]
              }}>
                <Button icon={<MoreOutlined />}>更多操作</Button>
              </Dropdown>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 汇总统计 */}
      {renderSummaryStats()}

      {/* 搜索筛选 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Input.Search
              placeholder="搜索案件、债务人、交易号"
              allowClear
              onSearch={(value) => loadData({ keyword: value, page: 0 })}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="对账状态"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => loadData({ status: value, page: 0 })}
            >
              {Object.entries(ReconciliationStatus).map(([key, value]) => (
                <Option key={key} value={key}>{value.text}</Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              style={{ width: '100%' }}
              onChange={(dates) => {
                const dateRange = dates ? dates.map(d => d!.format('YYYY-MM-DD')) : [];
                loadData({ dateRange, page: 0 });
              }}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="选择机构"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => loadData({ orgId: value, page: 0 })}
            >
              <Option value="1">XX银行</Option>
              <Option value="2">YY消金</Option>
              <Option value="3">华东调解中心</Option>
              <Option value="4">北京金诚律所</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Space>
              <Button 
                icon={<FilterOutlined />}
                onClick={() => {
                  setQueryParams({
                    page: 0,
                    size: 20,
                    status: '',
                    dateRange: [],
                    orgId: '',
                    keyword: ''
                  });
                  loadData();
                }}
              >
                重置
              </Button>
              <Button 
                type="primary"
                disabled={selectedRowKeys.length === 0}
                onClick={handleBatchConfirm}
              >
                批量确认({selectedRowKeys.length})
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 对账记录表格 */}
      <Card>
        <Table
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          rowKey="id"
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            getCheckboxProps: (record) => ({
              disabled: record.reconciliationStatus !== 'MATCHED'
            })
          }}
          scroll={{ x: 1200 }}
          pagination={{
            current: queryParams.page + 1,
            pageSize: queryParams.size,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            onChange: (page, size) => {
              loadData({ page: page - 1, size });
            }
          }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="回款记录详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedRecord && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="基本信息" key="1">
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="案件信息" size="small">
                    <p><strong>案件编号:</strong> {selectedRecord.caseId}</p>
                    <p><strong>案件名称:</strong> {selectedRecord.caseName}</p>
                    <p><strong>债务人:</strong> {selectedRecord.debtorName}</p>
                    <p><strong>案源机构:</strong> {selectedRecord.sourceOrgName}</p>
                    <p><strong>处置机构:</strong> {selectedRecord.disposalOrgName}</p>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="回款信息" size="small">
                    <p><strong>回款金额:</strong> ¥{selectedRecord.paymentAmount.toLocaleString()}</p>
                    <p><strong>回款日期:</strong> {selectedRecord.paymentDate}</p>
                    <p><strong>回款方式:</strong> {selectedRecord.paymentMethod}</p>
                    <p><strong>交易凭证:</strong> {selectedRecord.bankTransactionNo || '无'}</p>
                    <p><strong>系统记录:</strong> {selectedRecord.systemRecordId || '无'}</p>
                  </Card>
                </Col>
              </Row>
              <Divider />
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="对账状态" size="small">
                    <p>
                      <strong>当前状态:</strong>
                      <Badge 
                        status={ReconciliationStatus[selectedRecord.reconciliationStatus as keyof typeof ReconciliationStatus]?.color as any}
                        text={ReconciliationStatus[selectedRecord.reconciliationStatus as keyof typeof ReconciliationStatus]?.text}
                        style={{ marginLeft: 8 }}
                      />
                    </p>
                    {selectedRecord.confirmedAmount && (
                      <p><strong>确认金额:</strong> ¥{selectedRecord.confirmedAmount.toLocaleString()}</p>
                    )}
                    {selectedRecord.confirmedDate && (
                      <p><strong>确认日期:</strong> {selectedRecord.confirmedDate}</p>
                    )}
                    {selectedRecord.disputeReason && (
                      <p><strong>争议原因:</strong> {selectedRecord.disputeReason}</p>
                    )}
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="时间信息" size="small">
                    <p><strong>创建时间:</strong> {selectedRecord.createdAt}</p>
                    <p><strong>更新时间:</strong> {selectedRecord.updatedAt}</p>
                  </Card>
                </Col>
              </Row>
            </TabPane>
            
            <TabPane tab="附件资料" key="2">
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Text type="secondary">暂无附件资料</Text>
              </div>
            </TabPane>
            
            <TabPane tab="操作日志" key="3">
              <Timeline>
                <Timeline.Item color="blue">
                  <p>回款记录创建</p>
                  <p style={{ fontSize: '12px', color: '#666' }}>{selectedRecord.createdAt}</p>
                </Timeline.Item>
                {selectedRecord.reconciliationStatus !== 'PENDING' && (
                  <Timeline.Item color="green">
                    <p>状态更新为: {ReconciliationStatus[selectedRecord.reconciliationStatus as keyof typeof ReconciliationStatus]?.text}</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>{selectedRecord.updatedAt}</p>
                  </Timeline.Item>
                )}
              </Timeline>
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* 争议处理弹窗 */}
      <Modal
        title="提出争议"
        open={disputeModalVisible}
        onCancel={() => {
          setDisputeModalVisible(false);
          disputeForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={disputeForm}
          layout="vertical"
          onFinish={submitDispute}
        >
          <Alert
            message="争议说明"
            description="如果您认为此条回款记录存在问题，请详细说明争议原因。争议提交后，相关人员会及时处理。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Form.Item
            name="disputeReason"
            label="争议原因"
            rules={[{ required: true, message: '请输入争议原因' }]}
          >
            <TextArea
              rows={4}
              placeholder="请详细描述争议的具体原因..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => {
                setDisputeModalVisible(false);
                disputeForm.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" danger htmlType="submit">
                提交争议
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CaseReconciliation;