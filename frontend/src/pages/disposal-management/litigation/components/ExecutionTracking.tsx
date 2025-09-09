import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Alert,
  Tag,
  Space,
  Typography,
  Tabs,
  List,
  Progress,
  Timeline,
  Upload,
  Descriptions,
  Steps,
  Statistic,
  Badge,
  message,
  Popconfirm,
  Drawer,
  Radio,
  InputNumber,
  Checkbox
} from 'antd';
import {
  DollarOutlined,
  BankOutlined,
  CarOutlined,
  HomeOutlined,
  SearchOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  DownloadOutlined,
  PhoneOutlined,
  AlertOutlined,
  TrophyOutlined,
  MoneyCollectOutlined,
  AuditOutlined,
  SafetyCertificateOutlined,
  ReconciliationOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface ExecutionCase {
  id: string;
  caseNumber: string;
  caseId: string;
  executionId?: string;
  debtorName: string;
  debtorIdCard: string;
  judgmentAmount: number;
  paidAmount: number;
  remainingAmount: number;
  executionStatus: 'preparing' | 'filed' | 'investigating' | 'freezing' | 'seizing' | 'auctioning' | 'distributing' | 'completed' | 'terminated';
  executionStartTime?: string;
  lastUpdateTime: string;
  court: string;
  executor?: string;
  lawyer: string;
  priority: 'high' | 'medium' | 'low';
  assets: AssetInfo[];
  measures: ExecutionMeasure[];
  collections: Collection[];
  settlementOffers: SettlementOffer[];
}

interface AssetInfo {
  id: string;
  type: 'bank_account' | 'real_estate' | 'vehicle' | 'stock' | 'salary' | 'other';
  description: string;
  estimatedValue: number;
  status: 'investigating' | 'located' | 'frozen' | 'seized' | 'disposed';
  details?: string;
  location?: string;
  investigateTime?: string;
}

interface ExecutionMeasure {
  id: string;
  type: 'inquiry' | 'freeze' | 'seize' | 'auction' | 'deduct' | 'restrict' | 'blacklist';
  description: string;
  executeTime: string;
  amount?: number;
  status: 'applied' | 'approved' | 'executed' | 'completed' | 'failed';
  result?: string;
  documents: string[];
}

interface Collection {
  id: string;
  amount: number;
  type: 'voluntary' | 'enforcement' | 'auction' | 'offset';
  collectionTime: string;
  description: string;
  receiptNumber?: string;
  status: 'received' | 'confirmed' | 'allocated';
}

interface SettlementOffer {
  id: string;
  proposedAmount: number;
  installments?: number;
  firstPayment?: number;
  monthlyPayment?: number;
  offerTime: string;
  status: 'proposed' | 'negotiating' | 'accepted' | 'rejected' | 'completed';
  response?: string;
}

const ExecutionTracking: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [executionCases, setExecutionCases] = useState<ExecutionCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<ExecutionCase | null>(null);
  const [assetModalVisible, setAssetModalVisible] = useState(false);
  const [measureModalVisible, setMeasureModalVisible] = useState(false);
  const [collectionModalVisible, setCollectionModalVisible] = useState(false);
  const [settlementModalVisible, setSettlementModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [form] = Form.useForm();
  const [assetForm] = Form.useForm();
  const [measureForm] = Form.useForm();
  const [collectionForm] = Form.useForm();
  const [settlementForm] = Form.useForm();

  useEffect(() => {
    loadExecutionData();
  }, []);

  const loadExecutionData = async () => {
    setLoading(true);
    try {
      // 模拟数据
      const mockCases: ExecutionCase[] = [
        {
          id: '1',
          caseNumber: 'LIT-2024-001',
          caseId: '(2024)京0105民初1234号',
          executionId: '(2024)京0105执1234号',
          debtorName: '王五',
          debtorIdCard: '110101199001011234',
          judgmentAmount: 100000,
          paidAmount: 30000,
          remainingAmount: 70000,
          executionStatus: 'investigating',
          executionStartTime: '2024-02-01 09:00:00',
          lastUpdateTime: '2024-02-08 14:30:00',
          court: '北京市朝阳区法院',
          executor: '执行员李某',
          lawyer: '李律师',
          priority: 'high',
          assets: [
            {
              id: '1',
              type: 'bank_account',
              description: '中国银行储蓄账户',
              estimatedValue: 25000,
              status: 'frozen',
              details: '账户余额25000元',
              investigateTime: '2024-02-02 10:00:00'
            },
            {
              id: '2',
              type: 'real_estate',
              description: '朝阳区住宅一套',
              estimatedValue: 2000000,
              status: 'located',
              details: '三居室，面积120㎡',
              location: '朝阳区某小区',
              investigateTime: '2024-02-05 15:00:00'
            }
          ],
          measures: [
            {
              id: '1',
              type: 'inquiry',
              description: '财产调查',
              executeTime: '2024-02-01 14:00:00',
              status: 'completed',
              result: '发现银行存款和房产',
              documents: ['调查令', '查询结果']
            },
            {
              id: '2',
              type: 'freeze',
              description: '冻结银行账户',
              executeTime: '2024-02-02 10:30:00',
              amount: 25000,
              status: 'executed',
              result: '成功冻结账户资金',
              documents: ['冻结裁定书']
            }
          ],
          collections: [
            {
              id: '1',
              amount: 30000,
              type: 'voluntary',
              collectionTime: '2024-02-06 16:20:00',
              description: '债务人主动还款',
              receiptNumber: 'REC-2024-001',
              status: 'confirmed'
            }
          ],
          settlementOffers: [
            {
              id: '1',
              proposedAmount: 80000,
              installments: 12,
              firstPayment: 20000,
              monthlyPayment: 5000,
              offerTime: '2024-02-08 10:00:00',
              status: 'negotiating',
              response: '债务人要求降低首付金额'
            }
          ]
        },
        {
          id: '2',
          caseNumber: 'LIT-2024-002',
          caseId: '(2024)京0108民初5678号',
          debtorName: '赵六',
          debtorIdCard: '110101199002021234',
          judgmentAmount: 80000,
          paidAmount: 80000,
          remainingAmount: 0,
          executionStatus: 'completed',
          executionStartTime: '2024-01-15 09:00:00',
          lastUpdateTime: '2024-02-05 11:15:00',
          court: '北京市海淀区法院',
          executor: '执行员张某',
          lawyer: '张律师',
          priority: 'medium',
          assets: [
            {
              id: '3',
              type: 'salary',
              description: '工资收入',
              estimatedValue: 80000,
              status: 'disposed',
              details: '月工资8000元，执行10个月',
              investigateTime: '2024-01-16 09:00:00'
            }
          ],
          measures: [
            {
              id: '3',
              type: 'deduct',
              description: '扣除工资',
              executeTime: '2024-01-20 08:00:00',
              amount: 80000,
              status: 'completed',
              result: '分期扣除完毕',
              documents: ['扣除裁定书']
            }
          ],
          collections: [
            {
              id: '2',
              amount: 80000,
              type: 'enforcement',
              collectionTime: '2024-02-05 11:00:00',
              description: '工资扣除执行完毕',
              status: 'confirmed'
            }
          ],
          settlementOffers: []
        }
      ];

      setExecutionCases(mockCases);
    } catch (error) {
      console.error('加载执行数据失败:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getExecutionStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'preparing': 'default',
      'filed': 'blue',
      'investigating': 'processing',
      'freezing': 'orange',
      'seizing': 'purple',
      'auctioning': 'cyan',
      'distributing': 'gold',
      'completed': 'success',
      'terminated': 'error'
    };
    return colorMap[status] || 'default';
  };

  const getExecutionStatusText = (status: string) => {
    const textMap: { [key: string]: string } = {
      'preparing': '准备中',
      'filed': '已立案',
      'investigating': '调查中',
      'freezing': '冻结中',
      'seizing': '查封中',
      'auctioning': '拍卖中',
      'distributing': '分配中',
      'completed': '已完结',
      'terminated': '终结'
    };
    return textMap[status] || status;
  };

  const getAssetTypeIcon = (type: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'bank_account': <BankOutlined />,
      'real_estate': <HomeOutlined />,
      'vehicle': <CarOutlined />,
      'stock': <BarChartOutlined />,
      'salary': <MoneyCollectOutlined />,
      'other': <FileTextOutlined />
    };
    return iconMap[type] || <FileTextOutlined />;
  };

  const getAssetTypeName = (type: string) => {
    const nameMap: { [key: string]: string } = {
      'bank_account': '银行存款',
      'real_estate': '不动产',
      'vehicle': '车辆',
      'stock': '股权',
      'salary': '工资收入',
      'other': '其他财产'
    };
    return nameMap[type] || type;
  };

  const getMeasureTypeIcon = (type: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'inquiry': <SearchOutlined />,
      'freeze': <SafetyCertificateOutlined />,
      'seize': <AuditOutlined />,
      'auction': <TrophyOutlined />,
      'deduct': <MoneyCollectOutlined />,
      'restrict': <AlertOutlined />,
      'blacklist': <ExclamationCircleOutlined />
    };
    return iconMap[type] || <FileTextOutlined />;
  };

  const handleAssetManagement = (record: ExecutionCase) => {
    setSelectedCase(record);
    setAssetModalVisible(true);
  };

  const handleMeasureManagement = (record: ExecutionCase) => {
    setSelectedCase(record);
    setMeasureModalVisible(true);
  };

  const handleCollectionManagement = (record: ExecutionCase) => {
    setSelectedCase(record);
    setCollectionModalVisible(true);
  };

  const handleSettlement = (record: ExecutionCase) => {
    setSelectedCase(record);
    setSettlementModalVisible(true);
  };

  const handleViewDetail = (record: ExecutionCase) => {
    setSelectedCase(record);
    setDetailDrawerVisible(true);
  };

  const handleAssetSubmit = async (values: any) => {
    try {
      console.log('新增财产信息:', values);
      message.success('财产信息添加成功');
      setAssetModalVisible(false);
      assetForm.resetFields();
      loadExecutionData();
    } catch (error) {
      message.error('添加失败');
    }
  };

  const handleMeasureSubmit = async (values: any) => {
    try {
      console.log('新增执行措施:', values);
      message.success('执行措施添加成功');
      setMeasureModalVisible(false);
      measureForm.resetFields();
      loadExecutionData();
    } catch (error) {
      message.error('添加失败');
    }
  };

  const handleCollectionSubmit = async (values: any) => {
    try {
      console.log('记录回款:', values);
      message.success('回款记录添加成功');
      setCollectionModalVisible(false);
      collectionForm.resetFields();
      loadExecutionData();
    } catch (error) {
      message.error('添加失败');
    }
  };

  const filteredCases = executionCases.filter(case_ => {
    const matchesSearch = !searchTerm || 
      case_.caseNumber.includes(searchTerm) || 
      case_.debtorName.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || case_.executionStatus === statusFilter;
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'active' && !['completed', 'terminated'].includes(case_.executionStatus)) ||
      (activeTab === 'investigating' && case_.executionStatus === 'investigating') ||
      (activeTab === 'executing' && ['freezing', 'seizing', 'auctioning'].includes(case_.executionStatus)) ||
      (activeTab === 'completed' && case_.executionStatus === 'completed');
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const columns = [
    {
      title: '案件信息',
      key: 'caseInfo',
      render: (record: ExecutionCase) => (
        <Space direction="vertical" size="small">
          <Text strong>{record.caseNumber}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.caseId}</Text>
          {record.executionId && (
            <Text type="secondary" style={{ fontSize: 12 }}>{record.executionId}</Text>
          )}
          <Text>{record.debtorName}</Text>
        </Space>
      )
    },
    {
      title: '执行金额',
      key: 'amount',
      render: (record: ExecutionCase) => (
        <Space direction="vertical" size="small">
          <div>
            <Text strong>判决：</Text>
            <Text>¥{record.judgmentAmount.toLocaleString()}</Text>
          </div>
          <div>
            <Text strong>已收：</Text>
            <Text style={{ color: '#52c41a' }}>¥{record.paidAmount.toLocaleString()}</Text>
          </div>
          <div>
            <Text strong>余额：</Text>
            <Text style={{ color: record.remainingAmount > 0 ? '#fa541c' : '#52c41a' }}>
              ¥{record.remainingAmount.toLocaleString()}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: '执行进度',
      key: 'progress',
      render: (record: ExecutionCase) => {
        const progress = Math.round((record.paidAmount / record.judgmentAmount) * 100);
        return (
          <Space direction="vertical" size="small">
            <Progress percent={progress} size="small" />
            <Tag color={getExecutionStatusColor(record.executionStatus)}>
              {getExecutionStatusText(record.executionStatus)}
            </Tag>
          </Space>
        );
      }
    },
    {
      title: '执行法院',
      dataIndex: 'court',
      key: 'court'
    },
    {
      title: '执行员',
      dataIndex: 'executor',
      key: 'executor',
      render: (executor: string) => executor || '-'
    },
    {
      title: '承办律师',
      dataIndex: 'lawyer',
      key: 'lawyer'
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdateTime',
      key: 'lastUpdateTime',
      render: (time: string) => dayjs(time).format('MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: ExecutionCase) => (
        <Space direction="vertical" size="small">
          <Space>
            <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
              详情
            </Button>
            <Button size="small" type="link" icon={<SearchOutlined />} onClick={() => handleAssetManagement(record)}>
              财产
            </Button>
          </Space>
          <Space>
            <Button size="small" type="link" icon={<AuditOutlined />} onClick={() => handleMeasureManagement(record)}>
              措施
            </Button>
            <Button size="small" type="link" icon={<MoneyCollectOutlined />} onClick={() => handleCollectionManagement(record)}>
              回款
            </Button>
          </Space>
        </Space>
      )
    }
  ];

  const executionStats = {
    total: executionCases.length,
    investigating: executionCases.filter(c => c.executionStatus === 'investigating').length,
    executing: executionCases.filter(c => ['freezing', 'seizing', 'auctioning'].includes(c.executionStatus)).length,
    completed: executionCases.filter(c => c.executionStatus === 'completed').length,
    totalJudgment: executionCases.reduce((sum, c) => sum + c.judgmentAmount, 0),
    totalPaid: executionCases.reduce((sum, c) => sum + c.paidAmount, 0),
    totalRemaining: executionCases.reduce((sum, c) => sum + c.remainingAmount, 0)
  };

  return (
    <div>
      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="执行案件"
              value={executionStats.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="调查中"
              value={executionStats.investigating}
              prefix={<SearchOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="执行中"
              value={executionStats.executing}
              prefix={<AuditOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="已完结"
              value={executionStats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="已回收"
              value={executionStats.totalPaid / 10000}
              precision={1}
              suffix="万元"
              prefix={<MoneyCollectOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="执行率"
              value={executionStats.totalJudgment > 0 ? (executionStats.totalPaid / executionStats.totalJudgment * 100) : 0}
              precision={1}
              suffix="%"
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="全部案件" key="all">
            {/* 工具栏 */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Space>
                  <Input
                    placeholder="搜索案件编号或债务人"
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: 200 }}
                    allowClear
                  />
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: 120 }}
                    placeholder="执行状态"
                  >
                    <Option value="all">全部状态</Option>
                    <Option value="investigating">调查中</Option>
                    <Option value="freezing">冻结中</Option>
                    <Option value="seizing">查封中</Option>
                    <Option value="auctioning">拍卖中</Option>
                    <Option value="completed">已完结</Option>
                  </Select>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button type="primary" icon={<PlusOutlined />}>
                    申请执行
                  </Button>
                  <Button icon={<SearchOutlined />}>
                    批量查询
                  </Button>
                  <Button icon={<DownloadOutlined />}>
                    导出报告
                  </Button>
                </Space>
              </Col>
            </Row>

            <Table
              columns={columns}
              dataSource={filteredCases}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </TabPane>

          <TabPane tab="活跃案件" key="active">
            <Table
              columns={columns}
              dataSource={filteredCases}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="调查阶段" key="investigating">
            <Alert
              message="财产调查阶段"
              description="正在调查债务人财产状况，包括银行账户、房产、车辆等资产"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              columns={columns}
              dataSource={filteredCases}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="执行阶段" key="executing">
            <Alert
              message="执行措施实施中"
              description="正在实施冻结、查封、拍卖等执行措施"
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              columns={columns}
              dataSource={filteredCases}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="已完结" key="completed">
            <Alert
              message="执行完结案件"
              description="已完成执行的案件，包括执行完毕和终结执行"
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              columns={columns}
              dataSource={filteredCases}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 案件详情抽屉 */}
      <Drawer
        title="执行案件详情"
        placement="right"
        width={1000}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {selectedCase && (
          <div>
            <Card size="small" title="基本信息" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="案件编号">{selectedCase.caseNumber}</Descriptions.Item>
                    <Descriptions.Item label="法院案号">{selectedCase.caseId}</Descriptions.Item>
                    {selectedCase.executionId && (
                      <Descriptions.Item label="执行案号">{selectedCase.executionId}</Descriptions.Item>
                    )}
                    <Descriptions.Item label="债务人">{selectedCase.debtorName}</Descriptions.Item>
                    <Descriptions.Item label="身份证号">{selectedCase.debtorIdCard}</Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={12}>
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="执行法院">{selectedCase.court}</Descriptions.Item>
                    <Descriptions.Item label="执行员">{selectedCase.executor || '-'}</Descriptions.Item>
                    <Descriptions.Item label="承办律师">{selectedCase.lawyer}</Descriptions.Item>
                    <Descriptions.Item label="执行状态">
                      <Tag color={getExecutionStatusColor(selectedCase.executionStatus)}>
                        {getExecutionStatusText(selectedCase.executionStatus)}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="优先级">
                      <Tag color={selectedCase.priority === 'high' ? 'red' : selectedCase.priority === 'medium' ? 'orange' : 'blue'}>
                        {selectedCase.priority === 'high' ? '高' : selectedCase.priority === 'medium' ? '中' : '低'}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>

            <Card size="small" title="执行金额" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic title="判决金额" value={selectedCase.judgmentAmount} prefix="¥" />
                </Col>
                <Col span={8}>
                  <Statistic title="已回收" value={selectedCase.paidAmount} prefix="¥" valueStyle={{ color: '#52c41a' }} />
                </Col>
                <Col span={8}>
                  <Statistic title="未回收" value={selectedCase.remainingAmount} prefix="¥" valueStyle={{ color: '#fa541c' }} />
                </Col>
              </Row>
              <Progress 
                percent={Math.round((selectedCase.paidAmount / selectedCase.judgmentAmount) * 100)} 
                style={{ marginTop: 16 }}
              />
            </Card>

            <Card size="small" title="财产信息" style={{ marginBottom: 16 }}>
              <List
                dataSource={selectedCase.assets}
                renderItem={asset => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={getAssetTypeIcon(asset.type)}
                      title={
                        <Space>
                          <Text>{asset.description}</Text>
                          <Tag color={asset.status === 'disposed' ? 'success' : asset.status === 'frozen' ? 'orange' : 'processing'}>
                            {asset.status}
                          </Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <div>类型: {getAssetTypeName(asset.type)} | 估值: ¥{asset.estimatedValue.toLocaleString()}</div>
                          {asset.details && <div>详情: {asset.details}</div>}
                          {asset.location && <div>位置: {asset.location}</div>}
                          {asset.investigateTime && (
                            <div style={{ color: '#666' }}>
                              调查时间: {dayjs(asset.investigateTime).format('YYYY-MM-DD HH:mm')}
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>

            <Card size="small" title="执行措施" style={{ marginBottom: 16 }}>
              <Timeline>
                {selectedCase.measures.map(measure => (
                  <Timeline.Item
                    key={measure.id}
                    dot={getMeasureTypeIcon(measure.type)}
                    color={measure.status === 'completed' ? 'green' : measure.status === 'failed' ? 'red' : 'blue'}
                  >
                    <Space direction="vertical" size="small">
                      <Text strong>{measure.description}</Text>
                      <Text type="secondary">{dayjs(measure.executeTime).format('YYYY-MM-DD HH:mm')}</Text>
                      {measure.amount && <Text>涉及金额: ¥{measure.amount.toLocaleString()}</Text>}
                      <Tag color={measure.status === 'completed' ? 'success' : measure.status === 'failed' ? 'error' : 'processing'}>
                        {measure.status}
                      </Tag>
                      {measure.result && <div>执行结果: {measure.result}</div>}
                    </Space>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>

            <Card size="small" title="回款记录" style={{ marginBottom: 16 }}>
              <List
                dataSource={selectedCase.collections}
                renderItem={collection => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>¥{collection.amount.toLocaleString()}</Text>
                          <Tag color={collection.type === 'voluntary' ? 'green' : 'blue'}>
                            {collection.type === 'voluntary' ? '主动还款' : 
                             collection.type === 'enforcement' ? '强制执行' : 
                             collection.type === 'auction' ? '拍卖所得' : '其他'}
                          </Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <div>{collection.description}</div>
                          <div style={{ color: '#666' }}>
                            时间: {dayjs(collection.collectionTime).format('YYYY-MM-DD HH:mm')}
                            {collection.receiptNumber && ` | 收据号: ${collection.receiptNumber}`}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>

            {selectedCase.settlementOffers.length > 0 && (
              <Card size="small" title="和解方案">
                <List
                  dataSource={selectedCase.settlementOffers}
                  renderItem={offer => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Space>
                            <Text strong>¥{offer.proposedAmount.toLocaleString()}</Text>
                            <Tag color={offer.status === 'completed' ? 'success' : offer.status === 'rejected' ? 'error' : 'processing'}>
                              {offer.status}
                            </Tag>
                          </Space>
                        }
                        description={
                          <div>
                            {offer.installments && (
                              <div>分期方案: {offer.installments}期，首付¥{offer.firstPayment?.toLocaleString()}，月付¥{offer.monthlyPayment?.toLocaleString()}</div>
                            )}
                            <div>提议时间: {dayjs(offer.offerTime).format('YYYY-MM-DD HH:mm')}</div>
                            {offer.response && <div>回复: {offer.response}</div>}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}
          </div>
        )}
      </Drawer>

      {/* 财产管理弹窗 */}
      <Modal
        title="财产信息管理"
        open={assetModalVisible}
        onCancel={() => setAssetModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setAssetModalVisible(false)}>
            关闭
          </Button>,
          <Button key="add" type="primary" onClick={() => assetForm.submit()}>
            新增财产
          </Button>
        ]}
        width={800}
      >
        <Form form={assetForm} layout="vertical" onFinish={handleAssetSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="财产类型" name="type" rules={[{ required: true }]}>
                <Select placeholder="选择财产类型">
                  <Option value="bank_account">银行存款</Option>
                  <Option value="real_estate">不动产</Option>
                  <Option value="vehicle">车辆</Option>
                  <Option value="stock">股权</Option>
                  <Option value="salary">工资收入</Option>
                  <Option value="other">其他财产</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="估值金额" name="estimatedValue" rules={[{ required: true }]}>
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value: any) => value.replace(/¥\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item label="财产描述" name="description" rules={[{ required: true }]}>
            <Input placeholder="请输入财产具体信息" />
          </Form.Item>

          <Form.Item label="详细信息" name="details">
            <TextArea rows={2} placeholder="财产的详细描述信息" />
          </Form.Item>

          <Form.Item label="所在位置" name="location">
            <Input placeholder="财产所在位置（如适用）" />
          </Form.Item>

          <Form.Item label="调查状态" name="status" rules={[{ required: true }]}>
            <Select>
              <Option value="investigating">调查中</Option>
              <Option value="located">已定位</Option>
              <Option value="frozen">已冻结</Option>
              <Option value="seized">已查封</Option>
              <Option value="disposed">已处置</Option>
            </Select>
          </Form.Item>
        </Form>

        {selectedCase && selectedCase.assets.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Title level={5}>现有财产</Title>
            <Table
              dataSource={selectedCase.assets}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: '类型',
                  dataIndex: 'type',
                  render: (type: string) => (
                    <Space>
                      {getAssetTypeIcon(type)}
                      {getAssetTypeName(type)}
                    </Space>
                  )
                },
                {
                  title: '描述',
                  dataIndex: 'description'
                },
                {
                  title: '估值',
                  dataIndex: 'estimatedValue',
                  render: (value: number) => `¥${value.toLocaleString()}`
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  render: (status: string) => (
                    <Tag color={status === 'disposed' ? 'success' : status === 'frozen' ? 'orange' : 'processing'}>
                      {status}
                    </Tag>
                  )
                }
              ]}
            />
          </div>
        )}
      </Modal>

      {/* 执行措施弹窗 */}
      <Modal
        title="执行措施管理"
        open={measureModalVisible}
        onCancel={() => setMeasureModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setMeasureModalVisible(false)}>
            关闭
          </Button>,
          <Button key="add" type="primary" onClick={() => measureForm.submit()}>
            新增措施
          </Button>
        ]}
        width={800}
      >
        <Form form={measureForm} layout="vertical" onFinish={handleMeasureSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="措施类型" name="type" rules={[{ required: true }]}>
                <Select placeholder="选择执行措施">
                  <Option value="inquiry">财产调查</Option>
                  <Option value="freeze">冻结存款</Option>
                  <Option value="seize">查封财产</Option>
                  <Option value="auction">司法拍卖</Option>
                  <Option value="deduct">扣除收入</Option>
                  <Option value="restrict">限制消费</Option>
                  <Option value="blacklist">失信名单</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="执行时间" name="executeTime" rules={[{ required: true }]}>
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="措施描述" name="description" rules={[{ required: true }]}>
            <Input placeholder="请描述具体的执行措施" />
          </Form.Item>

          <Form.Item label="涉及金额" name="amount">
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value: any) => value.replace(/¥\s?|(,*)/g, '')}
              placeholder="如果涉及金额请填写"
            />
          </Form.Item>

          <Form.Item label="执行状态" name="status" rules={[{ required: true }]}>
            <Select>
              <Option value="applied">已申请</Option>
              <Option value="approved">已批准</Option>
              <Option value="executed">已执行</Option>
              <Option value="completed">已完成</Option>
              <Option value="failed">执行失败</Option>
            </Select>
          </Form.Item>

          <Form.Item label="执行结果" name="result">
            <TextArea rows={3} placeholder="请描述执行结果或进展情况" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 回款记录弹窗 */}
      <Modal
        title="回款记录管理"
        open={collectionModalVisible}
        onCancel={() => setCollectionModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setCollectionModalVisible(false)}>
            关闭
          </Button>,
          <Button key="add" type="primary" onClick={() => collectionForm.submit()}>
            记录回款
          </Button>
        ]}
        width={600}
      >
        <Form form={collectionForm} layout="vertical" onFinish={handleCollectionSubmit}>
          <Form.Item label="回款金额" name="amount" rules={[{ required: true }]}>
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value: any) => value.replace(/¥\s?|(,*)/g, '')}
              placeholder="请输入回款金额"
            />
          </Form.Item>

          <Form.Item label="回款类型" name="type" rules={[{ required: true }]}>
            <Select>
              <Option value="voluntary">主动还款</Option>
              <Option value="enforcement">强制执行</Option>
              <Option value="auction">拍卖所得</Option>
              <Option value="offset">债务抵消</Option>
            </Select>
          </Form.Item>

          <Form.Item label="回款时间" name="collectionTime" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="回款说明" name="description" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="请描述回款的具体情况" />
          </Form.Item>

          <Form.Item label="收据编号" name="receiptNumber">
            <Input placeholder="收款收据编号（可选）" />
          </Form.Item>

          <Form.Item label="确认状态" name="status">
            <Radio.Group defaultValue="received">
              <Radio value="received">已收到</Radio>
              <Radio value="confirmed">已确认</Radio>
              <Radio value="allocated">已分配</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      {/* 和解协商弹窗 */}
      <Modal
        title="和解协商"
        open={settlementModalVisible}
        onCancel={() => setSettlementModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setSettlementModalVisible(false)}>
            关闭
          </Button>,
          <Button key="propose" type="primary">
            提出方案
          </Button>
        ]}
        width={700}
      >
        {selectedCase && (
          <div>
            <Alert
              message="和解协商"
              description={`案件${selectedCase.caseNumber}，判决金额¥${selectedCase.judgmentAmount.toLocaleString()}，已回收¥${selectedCase.paidAmount.toLocaleString()}，剩余¥${selectedCase.remainingAmount.toLocaleString()}`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Form form={settlementForm} layout="vertical">
              <Form.Item label="和解方案类型">
                <Radio.Group defaultValue="installment">
                  <Radio value="lump_sum">一次性付清</Radio>
                  <Radio value="installment">分期付款</Radio>
                  <Radio value="reduction">减免部分债务</Radio>
                </Radio.Group>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="协商金额" name="proposedAmount">
                    <InputNumber
                      style={{ width: '100%' }}
                      formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value: any) => value.replace(/¥\s?|(,*)/g, '')}
                      max={selectedCase.remainingAmount}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="分期数量" name="installments">
                    <Select placeholder="分几期还款">
                      <Option value={3}>3期</Option>
                      <Option value={6}>6期</Option>
                      <Option value={12}>12期</Option>
                      <Option value={24}>24期</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="首付金额" name="firstPayment">
                    <InputNumber
                      style={{ width: '100%' }}
                      formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value: any) => value.replace(/¥\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="月付金额" name="monthlyPayment">
                    <InputNumber
                      style={{ width: '100%' }}
                      formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value: any) => value.replace(/¥\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="协商说明" name="notes">
                <TextArea rows={4} placeholder="描述和解方案的具体条件和要求" />
              </Form.Item>
            </Form>

            {selectedCase.settlementOffers.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Title level={5}>历史协商记录</Title>
                <Timeline>
                  {selectedCase.settlementOffers.map(offer => (
                    <Timeline.Item
                      key={offer.id}
                      color={offer.status === 'completed' ? 'green' : offer.status === 'rejected' ? 'red' : 'blue'}
                    >
                      <Space direction="vertical" size="small">
                        <Text strong>协商金额: ¥{offer.proposedAmount.toLocaleString()}</Text>
                        {offer.installments && (
                          <Text>分期方案: {offer.installments}期，首付¥{offer.firstPayment?.toLocaleString()}，月付¥{offer.monthlyPayment?.toLocaleString()}</Text>
                        )}
                        <Tag color={offer.status === 'completed' ? 'success' : offer.status === 'rejected' ? 'error' : 'processing'}>
                          {offer.status}
                        </Tag>
                        <Text type="secondary">{dayjs(offer.offerTime).format('YYYY-MM-DD HH:mm')}</Text>
                        {offer.response && <div>回复: {offer.response}</div>}
                      </Space>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExecutionTracking;