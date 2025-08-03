import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Space, Modal, Form, Input, Select, DatePicker,
  Tag, Progress, Statistic, Row, Col, Divider, Typography, Badge,
  Timeline, Upload, Tabs, Alert, Tooltip, Steps, Radio, InputNumber,
  List, Avatar, Descriptions, Drawer, message
} from 'antd';
import {
  SearchOutlined, FilterOutlined, EditOutlined, EyeOutlined,
  ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined,
  FileTextOutlined, DollarOutlined, CalendarOutlined, UploadOutlined,
  DownloadOutlined, PrinterOutlined, AuditOutlined, BankOutlined,
  MoneyCollectOutlined, AccountBookOutlined, CalculatorOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Step } = Steps;

interface SettlementRecord {
  id: number;
  settlementNo: string;
  casePackageId: number;
  casePackageName: string;
  sourceOrgName: string;
  settlementPeriod: string;
  totalCases: number;
  completedCases: number;
  totalAmount: number;
  recoveredAmount: number;
  settlementAmount: number;
  commissionRate: number;
  status: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'DISPUTED' | 'PAID' | 'COMPLETED';
  createdAt: string;
  confirmedAt?: string;
  paidAt?: string;
  dueDate: string;
  settlementType: 'MONTHLY' | 'QUARTERLY' | 'PROJECT_END';
  documents: any[];
  notes?: string;
}

interface DisputeRecord {
  id: number;
  settlementId: number;
  type: 'AMOUNT' | 'COMMISSION' | 'CASE_COUNT' | 'OTHER';
  description: string;
  disputedAmount?: number;
  proposedAmount?: number;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'ESCALATED';
  submittedBy: string;
  submittedAt: string;
  resolvedAt?: string;
  resolution?: string;
}

interface PaymentRecord {
  id: number;
  settlementId: number;
  amount: number;
  paymentMethod: 'BANK_TRANSFER' | 'CHECK' | 'ELECTRONIC';
  transactionId?: string;
  paymentDate: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  notes?: string;
}

const ReconciliationSettlement: React.FC = () => {
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [disputes, setDisputes] = useState<DisputeRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [selectedSettlement, setSelectedSettlement] = useState<SettlementRecord | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [disputeModalVisible, setDisputeModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('settlements');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [disputeForm] = Form.useForm();

  useEffect(() => {
    loadSettlements();
    loadDisputes();
    loadPayments();
  }, []);

  const loadSettlements = async () => {
    // 模拟加载结算记录
    const mockSettlements: SettlementRecord[] = [
      {
        id: 1,
        settlementNo: 'SET202407001',
        casePackageId: 1,
        casePackageName: '工商银行个贷不良包-202407',
        sourceOrgName: '中国工商银行',
        settlementPeriod: '2024-07',
        totalCases: 850,
        completedCases: 425,
        totalAmount: 12500000,
        recoveredAmount: 8750000,
        settlementAmount: 437500,
        commissionRate: 5,
        status: 'CONFIRMED',
        createdAt: '2024-07-31',
        confirmedAt: '2024-08-02',
        dueDate: '2024-08-15',
        settlementType: 'MONTHLY',
        documents: [],
        notes: '7月份结算，回款情况良好'
      },
      {
        id: 2,
        settlementNo: 'SET202406001',
        casePackageId: 1,
        casePackageName: '工商银行个贷不良包-202407',
        sourceOrgName: '中国工商银行',
        settlementPeriod: '2024-06',
        totalCases: 850,
        completedCases: 380,
        totalAmount: 12500000,
        recoveredAmount: 7500000,
        settlementAmount: 375000,
        commissionRate: 5,
        status: 'PAID',
        createdAt: '2024-06-30',
        confirmedAt: '2024-07-02',
        paidAt: '2024-07-10',
        dueDate: '2024-07-15',
        settlementType: 'MONTHLY',
        documents: [],
        notes: '6月份结算已完成'
      }
    ];
    setSettlements(mockSettlements);
  };

  const loadDisputes = async () => {
    // 模拟加载争议记录
    const mockDisputes: DisputeRecord[] = [
      {
        id: 1,
        settlementId: 1,
        type: 'AMOUNT',
        description: '对回款金额统计存在分歧，我方记录为890万，对方记录为875万',
        disputedAmount: 8900000,
        proposedAmount: 8750000,
        status: 'INVESTIGATING',
        submittedBy: '财务部',
        submittedAt: '2024-08-01 14:30',
        resolution: ''
      }
    ];
    setDisputes(mockDisputes);
  };

  const loadPayments = async () => {
    // 模拟加载付款记录
    const mockPayments: PaymentRecord[] = [
      {
        id: 1,
        settlementId: 2,
        amount: 375000,
        paymentMethod: 'BANK_TRANSFER',
        transactionId: 'TXN20240710001',
        paymentDate: '2024-07-10',
        status: 'COMPLETED',
        notes: '银行转账支付'
      }
    ];
    setPayments(mockPayments);
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      'DRAFT': { color: 'default', text: '草稿' },
      'PENDING': { color: 'orange', text: '待确认' },
      'CONFIRMED': { color: 'blue', text: '已确认' },
      'DISPUTED': { color: 'red', text: '有争议' },
      'PAID': { color: 'green', text: '已支付' },
      'COMPLETED': { color: 'green', text: '已完成' }
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getDisputeStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      'OPEN': { color: 'orange', text: '待处理' },
      'INVESTIGATING': { color: 'blue', text: '调查中' },
      'RESOLVED': { color: 'green', text: '已解决' },
      'ESCALATED': { color: 'red', text: '已升级' }
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getDisputeTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      'AMOUNT': '金额争议',
      'COMMISSION': '佣金争议',
      'CASE_COUNT': '案件数量争议',
      'OTHER': '其他争议'
    };
    return typeMap[type] || type;
  };

  const handleViewDetail = (settlement: SettlementRecord) => {
    setSelectedSettlement(settlement);
    setDetailVisible(true);
  };

  const handleSubmitDispute = (settlement: SettlementRecord) => {
    setSelectedSettlement(settlement);
    disputeForm.resetFields();
    setDisputeModalVisible(true);
  };

  const handleConfirmPayment = (settlement: SettlementRecord) => {
    setSelectedSettlement(settlement);
    form.resetFields();
    form.setFieldsValue({
      settlementId: settlement.id,
      amount: settlement.settlementAmount,
      paymentMethod: 'BANK_TRANSFER'
    });
    setPaymentModalVisible(true);
  };

  const submitDispute = async () => {
    try {
      const values = await disputeForm.validateFields();
      console.log('提交争议:', values);
      message.success('争议已提交，我们会尽快处理');
      setDisputeModalVisible(false);
      // 重新加载数据
      loadDisputes();
    } catch (error) {
      console.error('提交争议失败', error);
    }
  };

  const confirmPayment = async () => {
    try {
      const values = await form.validateFields();
      console.log('确认付款:', values);
      message.success('付款信息已确认');
      setPaymentModalVisible(false);
      // 重新加载数据
      loadPayments();
      loadSettlements();
    } catch (error) {
      console.error('确认付款失败', error);
    }
  };

  const settlementColumns: ColumnsType<SettlementRecord> = [
    {
      title: '结算信息',
      key: 'settlementInfo',
      width: 200,
      render: (_, record: SettlementRecord) => (
        <div>
          <Text strong>{record.settlementNo}</Text>
          <br />
          <Text type="secondary">{record.settlementPeriod} 结算</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.sourceOrgName}
          </Text>
        </div>
      ),
    },
    {
      title: '案件统计',
      key: 'caseStats',
      width: 120,
      render: (_, record: SettlementRecord) => (
        <div>
          <Text>总数: {record.totalCases}</Text>
          <br />
          <Text>完成: {record.completedCases}</Text>
          <br />
          <Text type="secondary">
            {Math.round((record.completedCases / record.totalCases) * 100)}%
          </Text>
        </div>
      ),
    },
    {
      title: '金额信息',
      key: 'amountInfo',
      width: 150,
      render: (_, record: SettlementRecord) => (
        <div>
          <Text>回款: ¥{(record.recoveredAmount / 10000).toFixed(1)}万</Text>
          <br />
          <Text strong style={{ color: '#52c41a' }}>
            佣金: ¥{(record.settlementAmount / 10000).toFixed(1)}万
          </Text>
          <br />
          <Text type="secondary">比例: {record.commissionRate}%</Text>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 100,
      render: (dueDate: string) => (
        <div>
          <CalendarOutlined style={{ marginRight: 4 }} />
          <Text 
            type={dayjs(dueDate).isBefore(dayjs()) ? 'danger' : 'secondary'}
          >
            {dueDate}
          </Text>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record: SettlementRecord) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.status === 'CONFIRMED' && (
            <Tooltip title="确认付款">
              <Button 
                type="text" 
                size="small" 
                icon={<MoneyCollectOutlined />}
                onClick={() => handleConfirmPayment(record)}
              />
            </Tooltip>
          )}
          <Tooltip title="提交争议">
            <Button 
              type="text" 
              size="small" 
              icon={<ExclamationCircleOutlined />}
              onClick={() => handleSubmitDispute(record)}
            />
          </Tooltip>
          <Tooltip title="下载结算单">
            <Button 
              type="text" 
              size="small" 
              icon={<DownloadOutlined />}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const disputeColumns: ColumnsType<DisputeRecord> = [
    {
      title: '争议信息',
      key: 'disputeInfo',
      render: (_, record: DisputeRecord) => (
        <div>
          <Text strong>{getDisputeTypeText(record.type)}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            结算单号: {settlements.find(s => s.id === record.settlementId)?.settlementNo}
          </Text>
        </div>
      ),
    },
    {
      title: '争议描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <Paragraph ellipsis={{ rows: 2, expandable: true }}>
          {text}
        </Paragraph>
      ),
    },
    {
      title: '争议金额',
      key: 'disputeAmount',
      render: (_, record: DisputeRecord) => (
        record.disputedAmount ? (
          <div>
            <Text>争议: ¥{(record.disputedAmount / 10000).toFixed(1)}万</Text>
            <br />
            {record.proposedAmount && (
              <Text type="secondary">
                建议: ¥{(record.proposedAmount / 10000).toFixed(1)}万
              </Text>
            )}
          </div>
        ) : '-'
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getDisputeStatusTag(status),
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: DisputeRecord) => (
        <Space size="small">
          <Button type="link" size="small">查看详情</Button>
          {record.status === 'OPEN' && (
            <Button type="link" size="small">撤回争议</Button>
          )}
        </Space>
      ),
    },
  ];

  const renderSettlementDetail = () => {
    if (!selectedSettlement) return null;

    return (
      <Tabs defaultActiveKey="basic">
        <TabPane tab="基本信息" key="basic">
          <Descriptions column={2} bordered>
            <Descriptions.Item label="结算单号">{selectedSettlement.settlementNo}</Descriptions.Item>
            <Descriptions.Item label="结算周期">{selectedSettlement.settlementPeriod}</Descriptions.Item>
            <Descriptions.Item label="案件包名称">{selectedSettlement.casePackageName}</Descriptions.Item>
            <Descriptions.Item label="案源机构">{selectedSettlement.sourceOrgName}</Descriptions.Item>
            <Descriptions.Item label="总案件数">{selectedSettlement.totalCases}件</Descriptions.Item>
            <Descriptions.Item label="完成案件数">{selectedSettlement.completedCases}件</Descriptions.Item>
            <Descriptions.Item label="总金额">¥{selectedSettlement.totalAmount.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="回款金额">¥{selectedSettlement.recoveredAmount.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="佣金比例">{selectedSettlement.commissionRate}%</Descriptions.Item>
            <Descriptions.Item label="结算金额">¥{selectedSettlement.settlementAmount.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{selectedSettlement.createdAt}</Descriptions.Item>
            <Descriptions.Item label="确认时间">{selectedSettlement.confirmedAt || '-'}</Descriptions.Item>
            <Descriptions.Item label="支付时间">{selectedSettlement.paidAt || '-'}</Descriptions.Item>
            <Descriptions.Item label="截止时间">{selectedSettlement.dueDate}</Descriptions.Item>
          </Descriptions>
          
          {selectedSettlement.notes && (
            <>
              <Divider />
              <Title level={5}>备注信息</Title>
              <Paragraph>{selectedSettlement.notes}</Paragraph>
            </>
          )}
        </TabPane>

        <TabPane tab="结算明细" key="details">
          <Row gutter={16}>
            <Col span={12}>
              <Card title="案件处理明细" size="small">
                <Statistic 
                  title="案件完成率" 
                  value={Math.round((selectedSettlement.completedCases / selectedSettlement.totalCases) * 100)} 
                  suffix="%" 
                />
                <Progress 
                  percent={Math.round((selectedSettlement.completedCases / selectedSettlement.totalCases) * 100)} 
                  strokeColor="#52c41a"
                />
                <Divider style={{ margin: '12px 0' }} />
                <Row gutter={8}>
                  <Col span={12}>
                    <Text type="secondary">待处理</Text>
                    <br />
                    <Text strong>{selectedSettlement.totalCases - selectedSettlement.completedCases}件</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">已完成</Text>
                    <br />
                    <Text strong>{selectedSettlement.completedCases}件</Text>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="资金回收明细" size="small">
                <Statistic 
                  title="资金回收率" 
                  value={Math.round((selectedSettlement.recoveredAmount / selectedSettlement.totalAmount) * 100)} 
                  suffix="%" 
                />
                <Progress 
                  percent={Math.round((selectedSettlement.recoveredAmount / selectedSettlement.totalAmount) * 100)} 
                  strokeColor="#1890ff"
                />
                <Divider style={{ margin: '12px 0' }} />
                <Row gutter={8}>
                  <Col span={12}>
                    <Text type="secondary">未回款</Text>
                    <br />
                    <Text>¥{((selectedSettlement.totalAmount - selectedSettlement.recoveredAmount) / 10000).toFixed(1)}万</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">已回款</Text>
                    <br />
                    <Text strong>¥{(selectedSettlement.recoveredAmount / 10000).toFixed(1)}万</Text>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="处理流程" key="process">
          <Steps
            current={selectedSettlement.status === 'COMPLETED' ? 4 : 
                    selectedSettlement.status === 'PAID' ? 3 :
                    selectedSettlement.status === 'CONFIRMED' ? 2 : 1}
            items={[
              {
                title: '生成结算单',
                description: selectedSettlement.createdAt,
                status: 'finish'
              },
              {
                title: '双方确认',
                description: selectedSettlement.confirmedAt || '待确认',
                status: selectedSettlement.confirmedAt ? 'finish' : 'process'
              },
              {
                title: '付款处理',
                description: selectedSettlement.paidAt || '待付款',
                status: selectedSettlement.paidAt ? 'finish' : 'wait'
              },
              {
                title: '结算完成',
                description: '流程结束',
                status: selectedSettlement.status === 'COMPLETED' ? 'finish' : 'wait'
              },
            ]}
          />
        </TabPane>

        <TabPane tab="相关文档" key="documents">
          <Upload.Dragger>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">支持上传结算凭证、银行回单等相关文档</p>
          </Upload.Dragger>
          
          <Divider />
          
          <List
            dataSource={[
              { name: '结算单.pdf', size: '1.2MB', uploadTime: '2024-07-31' },
              { name: '回款明细.xlsx', size: '856KB', uploadTime: '2024-07-31' }
            ]}
            renderItem={item => (
              <List.Item
                actions={[
                  <Button type="link" icon={<DownloadOutlined />}>下载</Button>,
                  <Button type="link" icon={<EyeOutlined />}>预览</Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<FileTextOutlined style={{ fontSize: '20px' }} />}
                  title={item.name}
                  description={`${item.size} · ${item.uploadTime}`}
                />
              </List.Item>
            )}
          />
        </TabPane>
      </Tabs>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* 统计面板 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月结算金额"
              value={(settlements.filter(s => s.settlementPeriod === '2024-07')
                .reduce((sum, s) => sum + s.settlementAmount, 0) / 10000).toFixed(1)}
              suffix="万"
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待确认结算"
              value={settlements.filter(s => s.status === 'PENDING').length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="争议处理中"
              value={disputes.filter(d => d.status === 'INVESTIGATING').length}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成结算"
              value={settlements.filter(s => s.status === 'COMPLETED').length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="结算管理" key="settlements">
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>
                  <AccountBookOutlined style={{ marginRight: 8 }} />
                  结算记录
                </Title>
                <Space>
                  <Button icon={<SearchOutlined />}>搜索</Button>
                  <Button icon={<FilterOutlined />}>筛选</Button>
                  <Button icon={<DownloadOutlined />}>导出</Button>
                </Space>
              </div>
            }
          >
            <Table
              dataSource={settlements}
              columns={settlementColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="争议处理" key="disputes">
          <Card title="争议记录">
            <Table
              dataSource={disputes}
              columns={disputeColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="付款记录" key="payments">
          <Card title="付款记录">
            <List
              dataSource={payments}
              renderItem={payment => (
                <List.Item
                  actions={[
                    <Button type="link">查看详情</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<BankOutlined />} />}
                    title={`结算单号: ${settlements.find(s => s.id === payment.settlementId)?.settlementNo}`}
                    description={
                      <div>
                        <Text>付款金额: ¥{(payment.amount / 10000).toFixed(1)}万</Text>
                        <br />
                        <Text type="secondary">付款方式: {payment.paymentMethod}</Text>
                        <br />
                        <Text type="secondary">付款时间: {payment.paymentDate}</Text>
                      </div>
                    }
                  />
                  <div>
                    <Tag color={payment.status === 'COMPLETED' ? 'green' : 'orange'}>
                      {payment.status === 'COMPLETED' ? '已完成' : '处理中'}
                    </Tag>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 结算详情抽屉 */}
      <Drawer
        title={`结算详情 - ${selectedSettlement?.settlementNo}`}
        placement="right"
        width={800}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
      >
        {renderSettlementDetail()}
      </Drawer>

      {/* 争议提交弹窗 */}
      <Modal
        title="提交争议"
        visible={disputeModalVisible}
        onCancel={() => setDisputeModalVisible(false)}
        onOk={submitDispute}
        width={600}
      >
        <Form form={disputeForm} layout="vertical">
          <Form.Item name="type" label="争议类型" rules={[{ required: true }]}>
            <Select>
              <Option value="AMOUNT">金额争议</Option>
              <Option value="COMMISSION">佣金争议</Option>
              <Option value="CASE_COUNT">案件数量争议</Option>
              <Option value="OTHER">其他争议</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="description" label="争议描述" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="请详细描述争议的具体情况..." />
          </Form.Item>
          
          <Form.Item name="disputedAmount" label="争议金额">
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder="如果涉及金额争议，请输入争议金额"
              formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>
          
          <Form.Item name="evidence" label="相关证据">
            <Upload>
              <Button icon={<UploadOutlined />}>上传证据文件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* 付款确认弹窗 */}
      <Modal
        title="确认付款"
        visible={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        onOk={confirmPayment}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="amount" label="付款金额" rules={[{ required: true }]}>
            <InputNumber 
              style={{ width: '100%' }} 
              formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              disabled
            />
          </Form.Item>
          
          <Form.Item name="paymentMethod" label="付款方式" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="BANK_TRANSFER">银行转账</Radio>
              <Radio value="CHECK">支票支付</Radio>
              <Radio value="ELECTRONIC">电子支付</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item name="transactionId" label="交易流水号">
            <Input placeholder="请输入银行交易流水号" />
          </Form.Item>
          
          <Form.Item name="paymentDate" label="付款日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item name="notes" label="备注">
            <TextArea rows={3} placeholder="付款相关备注信息..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReconciliationSettlement;