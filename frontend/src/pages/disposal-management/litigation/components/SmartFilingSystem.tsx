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
  Steps,
  Alert,
  Progress,
  Tag,
  Space,
  Typography,
  Tabs,
  Upload,
  List,
  Checkbox,
  DatePicker,
  message,
  Divider,
  Statistic,
  Badge,
  Timeline,
  Tooltip,
  Popconfirm
} from 'antd';
import {
  CloudUploadOutlined,
  FileTextOutlined,
  RobotOutlined,
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  DownloadOutlined,
  SendOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Step } = Steps;
const { Dragger } = Upload;

interface FilingCase {
  id: string;
  caseNumber: string;
  debtorName: string;
  debtorIdCard: string;
  amount: number;
  filingStatus: 'pending' | 'preparing' | 'submitting' | 'filed' | 'accepted' | 'rejected';
  filingType: 'online' | 'offline';
  court: string;
  filingTime?: string;
  acceptTime?: string;
  rejectionReason?: string;
  caseId?: string;
  lawyer: string;
  priority: 'high' | 'medium' | 'low';
  documents: DocumentInfo[];
  progress: number;
}

interface DocumentInfo {
  id: string;
  name: string;
  type: 'complaint' | 'evidence' | 'power_of_attorney' | 'fee_receipt' | 'other';
  status: 'pending' | 'generated' | 'uploaded' | 'verified';
  url?: string;
  generatedTime?: string;
}

interface CourtInfo {
  id: string;
  name: string;
  level: string;
  jurisdiction: string;
  onlineSupport: boolean;
  apiStatus: 'connected' | 'disconnected' | 'maintenance';
  filingFee: number;
  averageProcessTime: number;
}

const SmartFilingSystem: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [filingCases, setFilingCases] = useState<FilingCase[]>([]);
  const [courts, setCourts] = useState<CourtInfo[]>([]);
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [batchFilingModalVisible, setBatchFilingModalVisible] = useState(false);
  const [caseDetailModalVisible, setCaseDetailModalVisible] = useState(false);
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [courtConfigModalVisible, setCourtConfigModalVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState<FilingCase | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [form] = Form.useForm();
  const [batchForm] = Form.useForm();

  useEffect(() => {
    loadFilingData();
  }, []);

  const loadFilingData = async () => {
    setLoading(true);
    try {
      // 模拟数据
      const mockCases: FilingCase[] = [
        {
          id: '1',
          caseNumber: 'LIT-2024-001',
          debtorName: '王五',
          debtorIdCard: '110101199001011234',
          amount: 100000,
          filingStatus: 'preparing',
          filingType: 'online',
          court: '北京市朝阳区法院',
          lawyer: '李律师',
          priority: 'high',
          progress: 65,
          documents: [
            { id: '1', name: '起诉状', type: 'complaint', status: 'generated', generatedTime: '2024-02-08 10:30:00' },
            { id: '2', name: '证据清单', type: 'evidence', status: 'pending' },
            { id: '3', name: '授权委托书', type: 'power_of_attorney', status: 'generated', generatedTime: '2024-02-08 11:00:00' }
          ]
        },
        {
          id: '2',
          caseNumber: 'LIT-2024-002',
          debtorName: '赵六',
          debtorIdCard: '110101199002021234',
          amount: 80000,
          filingStatus: 'submitting',
          filingType: 'online',
          court: '北京市海淀区法院',
          lawyer: '张律师',
          priority: 'medium',
          progress: 85,
          documents: [
            { id: '4', name: '起诉状', type: 'complaint', status: 'uploaded' },
            { id: '5', name: '证据清单', type: 'evidence', status: 'uploaded' },
            { id: '6', name: '授权委托书', type: 'power_of_attorney', status: 'verified' }
          ]
        },
        {
          id: '3',
          caseNumber: 'LIT-2024-003',
          debtorName: '孙七',
          debtorIdCard: '110101199003031234',
          amount: 120000,
          filingStatus: 'accepted',
          filingType: 'offline',
          court: '北京市西城区法院',
          filingTime: '2024-02-01 14:20:00',
          acceptTime: '2024-02-05 09:15:00',
          caseId: '(2024)京0102民初1234号',
          lawyer: '王律师',
          priority: 'high',
          progress: 100,
          documents: [
            { id: '7', name: '起诉状', type: 'complaint', status: 'verified' },
            { id: '8', name: '证据清单', type: 'evidence', status: 'verified' },
            { id: '9', name: '立案回执', type: 'fee_receipt', status: 'verified' }
          ]
        }
      ];

      const mockCourts: CourtInfo[] = [
        {
          id: '1',
          name: '北京市朝阳区法院',
          level: '区级',
          jurisdiction: '朝阳区',
          onlineSupport: true,
          apiStatus: 'connected',
          filingFee: 50,
          averageProcessTime: 3
        },
        {
          id: '2',
          name: '北京市海淀区法院',
          level: '区级',
          jurisdiction: '海淀区',
          onlineSupport: true,
          apiStatus: 'connected',
          filingFee: 50,
          averageProcessTime: 2
        },
        {
          id: '3',
          name: '北京市西城区法院',
          level: '区级',
          jurisdiction: '西城区',
          onlineSupport: false,
          apiStatus: 'disconnected',
          filingFee: 50,
          averageProcessTime: 5
        }
      ];

      setFilingCases(mockCases);
      setCourts(mockCourts);
    } catch (error) {
      console.error('加载立案数据失败:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'pending': 'default',
      'preparing': 'processing',
      'submitting': 'blue',
      'filed': 'orange',
      'accepted': 'success',
      'rejected': 'error'
    };
    return colorMap[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const textMap: { [key: string]: string } = {
      'pending': '待准备',
      'preparing': '准备中',
      'submitting': '提交中',
      'filed': '已提交',
      'accepted': '已受理',
      'rejected': '被驳回'
    };
    return textMap[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'high' ? 'red' : priority === 'medium' ? 'orange' : 'blue';
  };

  const getDocumentStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'pending': 'default',
      'generated': 'processing',
      'uploaded': 'blue',
      'verified': 'success'
    };
    return colorMap[status] || 'default';
  };

  const getDocumentStatusText = (status: string) => {
    const textMap: { [key: string]: string } = {
      'pending': '待生成',
      'generated': '已生成',
      'uploaded': '已上传',
      'verified': '已验证'
    };
    return textMap[status] || status;
  };

  const handleViewCaseDetail = (record: FilingCase) => {
    setSelectedCase(record);
    setCaseDetailModalVisible(true);
  };

  const handleBatchFiling = () => {
    if (selectedCases.length === 0) {
      message.warning('请选择要立案的案件');
      return;
    }
    setBatchFilingModalVisible(true);
  };

  const handleGenerateDocument = (caseId: string, documentType: string) => {
    console.log('生成文书:', caseId, documentType);
    message.success(`正在生成${documentType}...`);
    // 模拟生成过程
    setTimeout(() => {
      message.success('文书生成完成');
      loadFilingData();
    }, 2000);
  };

  const handleSubmitFiling = (caseId: string) => {
    console.log('提交立案:', caseId);
    message.success('正在提交立案申请...');
    // 模拟提交过程
    setTimeout(() => {
      message.success('立案申请提交成功');
      loadFilingData();
    }, 3000);
  };

  const handleBatchFilingSubmit = async (values: any) => {
    try {
      console.log('批量立案:', values);
      message.success('批量立案申请已提交');
      setBatchFilingModalVisible(false);
      setSelectedCases([]);
      loadFilingData();
    } catch (error) {
      message.error('提交失败');
    }
  };

  const filteredCases = filingCases.filter(case_ => {
    const matchesSearch = !searchTerm || 
      case_.caseNumber.includes(searchTerm) || 
      case_.debtorName.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || case_.filingStatus === statusFilter;
    const matchesType = typeFilter === 'all' || case_.filingType === typeFilter;
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'online' && case_.filingType === 'online') ||
      (activeTab === 'offline' && case_.filingType === 'offline') ||
      (activeTab === 'pending' && ['pending', 'preparing'].includes(case_.filingStatus)) ||
      (activeTab === 'processing' && ['submitting', 'filed'].includes(case_.filingStatus)) ||
      (activeTab === 'completed' && ['accepted'].includes(case_.filingStatus));
    
    return matchesSearch && matchesStatus && matchesType && matchesTab;
  });

  const columns = [
    {
      title: '案件编号',
      dataIndex: 'caseNumber',
      key: 'caseNumber',
      render: (text: string, record: FilingCase) => (
        <Space direction="vertical" size="small">
          <Text strong>{text}</Text>
          {record.caseId && <Text type="secondary" style={{ fontSize: 12 }}>{record.caseId}</Text>}
        </Space>
      )
    },
    {
      title: '债务人',
      dataIndex: 'debtorName',
      key: 'debtorName'
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `¥${amount.toLocaleString()}`
    },
    {
      title: '立案方式',
      dataIndex: 'filingType',
      key: 'filingType',
      render: (type: string) => (
        <Tag color={type === 'online' ? 'blue' : 'orange'}>
          {type === 'online' ? '网上立案' : '线下立案'}
        </Tag>
      )
    },
    {
      title: '法院',
      dataIndex: 'court',
      key: 'court'
    },
    {
      title: '承办律师',
      dataIndex: 'lawyer',
      key: 'lawyer'
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}
        </Tag>
      )
    },
    {
      title: '状态',
      key: 'status',
      render: (record: FilingCase) => (
        <Space direction="vertical" size="small">
          <Tag color={getStatusColor(record.filingStatus)}>
            {getStatusText(record.filingStatus)}
          </Tag>
          <Progress percent={record.progress} size="small" showInfo={false} />
        </Space>
      )
    },
    {
      title: '立案时间',
      dataIndex: 'filingTime',
      key: 'filingTime',
      render: (time: string) => time ? dayjs(time).format('MM-DD HH:mm') : '-'
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: FilingCase) => (
        <Space>
          <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => handleViewCaseDetail(record)}>
            详情
          </Button>
          {record.filingStatus === 'preparing' && (
            <Button 
              size="small" 
              type="link" 
              icon={<SendOutlined />}
              onClick={() => handleSubmitFiling(record.id)}
            >
              提交
            </Button>
          )}
          {record.filingStatus === 'pending' && (
            <Button 
              size="small" 
              type="link" 
              icon={<RobotOutlined />}
              onClick={() => handleGenerateDocument(record.id, '全部文书')}
            >
              生成
            </Button>
          )}
        </Space>
      )
    }
  ];

  const courtColumns = [
    {
      title: '法院名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level'
    },
    {
      title: '管辖范围',
      dataIndex: 'jurisdiction',
      key: 'jurisdiction'
    },
    {
      title: '网上立案',
      dataIndex: 'onlineSupport',
      key: 'onlineSupport',
      render: (support: boolean) => (
        <Tag color={support ? 'success' : 'default'}>
          {support ? '支持' : '不支持'}
        </Tag>
      )
    },
    {
      title: 'API状态',
      dataIndex: 'apiStatus',
      key: 'apiStatus',
      render: (status: string) => (
        <Badge 
          status={status === 'connected' ? 'success' : status === 'maintenance' ? 'processing' : 'error'}
          text={status === 'connected' ? '已连接' : status === 'maintenance' ? '维护中' : '未连接'}
        />
      )
    },
    {
      title: '立案费',
      dataIndex: 'filingFee',
      key: 'filingFee',
      render: (fee: number) => `¥${fee}`
    },
    {
      title: '平均处理时间',
      dataIndex: 'averageProcessTime',
      key: 'averageProcessTime',
      render: (time: number) => `${time}个工作日`
    }
  ];

  const filingStats = {
    total: filingCases.length,
    pending: filingCases.filter(c => c.filingStatus === 'pending').length,
    processing: filingCases.filter(c => ['preparing', 'submitting', 'filed'].includes(c.filingStatus)).length,
    completed: filingCases.filter(c => c.filingStatus === 'accepted').length,
    rejected: filingCases.filter(c => c.filingStatus === 'rejected').length,
    online: filingCases.filter(c => c.filingType === 'online').length,
    offline: filingCases.filter(c => c.filingType === 'offline').length
  };

  return (
    <div>
      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="立案总数"
              value={filingStats.total}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="待处理"
              value={filingStats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="处理中"
              value={filingStats.processing}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="已完成"
              value={filingStats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="网上立案"
              value={filingStats.online}
              prefix={<CloudUploadOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="线下立案"
              value={filingStats.offline}
              prefix={<FileTextOutlined />}
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
                    placeholder="状态筛选"
                  >
                    <Option value="all">全部状态</Option>
                    <Option value="pending">待准备</Option>
                    <Option value="preparing">准备中</Option>
                    <Option value="submitting">提交中</Option>
                    <Option value="filed">已提交</Option>
                    <Option value="accepted">已受理</Option>
                    <Option value="rejected">被驳回</Option>
                  </Select>
                  <Select
                    value={typeFilter}
                    onChange={setTypeFilter}
                    style={{ width: 120 }}
                    placeholder="方式筛选"
                  >
                    <Option value="all">全部方式</Option>
                    <Option value="online">网上立案</Option>
                    <Option value="offline">线下立案</Option>
                  </Select>
                  <Button icon={<ReloadOutlined />} onClick={loadFilingData}>
                    刷新
                  </Button>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={handleBatchFiling}
                    disabled={selectedCases.length === 0}
                  >
                    批量立案({selectedCases.length})
                  </Button>
                  <Button icon={<RobotOutlined />}>
                    智能分配
                  </Button>
                  <Button icon={<DownloadOutlined />}>
                    导出数据
                  </Button>
                  <Button 
                    icon={<FilterOutlined />}
                    onClick={() => setCourtConfigModalVisible(true)}
                  >
                    法院配置
                  </Button>
                </Space>
              </Col>
            </Row>

            <Table
              columns={columns}
              dataSource={filteredCases}
              loading={loading}
              rowKey="id"
              rowSelection={{
                selectedRowKeys: selectedCases,
                onChange: (selectedRowKeys: React.Key[]) => {
                  setSelectedCases(selectedRowKeys as string[]);
                }
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </TabPane>

          <TabPane tab="网上立案" key="online">
            <Alert
              message="网上立案系统"
              description="支持与多个法院系统对接，实现自动提交、状态同步和批量处理"
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

          <TabPane tab="线下立案" key="offline">
            <Alert
              message="线下立案管理"
              description="管理现场提交、材料准备和进度跟踪，支持预约和排队功能"
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

          <TabPane tab="待处理" key="pending">
            <Table
              columns={columns}
              dataSource={filteredCases}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="处理中" key="processing">
            <Table
              columns={columns}
              dataSource={filteredCases}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="已完成" key="completed">
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

      {/* 案件详情弹窗 */}
      <Modal
        title="立案案件详情"
        open={caseDetailModalVisible}
        onCancel={() => setCaseDetailModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setCaseDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedCase && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="基本信息">
                  <div><strong>案件编号：</strong>{selectedCase.caseNumber}</div>
                  <div><strong>债务人：</strong>{selectedCase.debtorName}</div>
                  <div><strong>身份证号：</strong>{selectedCase.debtorIdCard}</div>
                  <div><strong>债务金额：</strong>¥{selectedCase.amount.toLocaleString()}</div>
                  <div><strong>受理法院：</strong>{selectedCase.court}</div>
                  <div><strong>承办律师：</strong>{selectedCase.lawyer}</div>
                  <div><strong>立案方式：</strong>
                    <Tag color={selectedCase.filingType === 'online' ? 'blue' : 'orange'}>
                      {selectedCase.filingType === 'online' ? '网上立案' : '线下立案'}
                    </Tag>
                  </div>
                  <div><strong>当前状态：</strong>
                    <Tag color={getStatusColor(selectedCase.filingStatus)}>
                      {getStatusText(selectedCase.filingStatus)}
                    </Tag>
                  </div>
                  {selectedCase.caseId && (
                    <div><strong>法院案号：</strong>{selectedCase.caseId}</div>
                  )}
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="进度跟踪">
                  <Steps direction="vertical" current={Math.floor(selectedCase.progress / 25)}>
                    <Step title="材料准备" description="生成诉讼文书" />
                    <Step title="提交申请" description="向法院提交立案材料" />
                    <Step title="法院审核" description="等待法院受理审核" />
                    <Step title="立案完成" description="获得法院案号" />
                  </Steps>
                </Card>
              </Col>
            </Row>

            <Card size="small" title="文书材料" style={{ marginTop: 16 }}>
              <List
                dataSource={selectedCase.documents}
                renderItem={doc => (
                  <List.Item
                    actions={[
                      <Button size="small" type="link" icon={<EyeOutlined />}>
                        查看
                      </Button>,
                      <Button size="small" type="link" icon={<DownloadOutlined />}>
                        下载
                      </Button>,
                      doc.status === 'pending' && (
                        <Button 
                          size="small" 
                          type="link" 
                          icon={<RobotOutlined />}
                          onClick={() => handleGenerateDocument(selectedCase.id, doc.name)}
                        >
                          生成
                        </Button>
                      )
                    ].filter(Boolean)}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text>{doc.name}</Text>
                          <Tag color={getDocumentStatusColor(doc.status)}>
                            {getDocumentStatusText(doc.status)}
                          </Tag>
                        </Space>
                      }
                      description={doc.generatedTime && `生成时间: ${dayjs(doc.generatedTime).format('YYYY-MM-DD HH:mm')}`}
                    />
                  </List.Item>
                )}
              />
            </Card>

            {selectedCase.filingStatus !== 'pending' && (
              <Card size="small" title="操作记录" style={{ marginTop: 16 }}>
                <Timeline>
                  {selectedCase.filingTime && (
                    <Timeline.Item color="blue">
                      <Text strong>提交立案</Text>
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        {dayjs(selectedCase.filingTime).format('YYYY-MM-DD HH:mm')}
                      </Text>
                      <div>向{selectedCase.court}提交立案申请</div>
                    </Timeline.Item>
                  )}
                  {selectedCase.acceptTime && (
                    <Timeline.Item color="green">
                      <Text strong>立案成功</Text>
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        {dayjs(selectedCase.acceptTime).format('YYYY-MM-DD HH:mm')}
                      </Text>
                      <div>法院受理立案，案号：{selectedCase.caseId}</div>
                    </Timeline.Item>
                  )}
                  {selectedCase.rejectionReason && (
                    <Timeline.Item color="red">
                      <Text strong>立案被驳回</Text>
                      <div>驳回原因：{selectedCase.rejectionReason}</div>
                    </Timeline.Item>
                  )}
                </Timeline>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* 批量立案弹窗 */}
      <Modal
        title="批量立案"
        open={batchFilingModalVisible}
        onCancel={() => setBatchFilingModalVisible(false)}
        onOk={() => batchForm.submit()}
        width={800}
      >
        <Form form={batchForm} layout="vertical" onFinish={handleBatchFilingSubmit}>
          <Alert
            message={`已选择 ${selectedCases.length} 个案件进行批量立案`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Form.Item label="立案方式" name="filingType" rules={[{ required: true }]}>
            <Select placeholder="选择立案方式">
              <Option value="online">网上立案（推荐）</Option>
              <Option value="offline">线下立案</Option>
              <Option value="mixed">混合模式</Option>
            </Select>
          </Form.Item>

          <Form.Item label="智能分配法院" name="autoAssignCourt" valuePropName="checked">
            <Checkbox>根据案件金额和地域自动分配最适合的法院</Checkbox>
          </Form.Item>

          <Form.Item label="文书生成选项" name="documentOptions">
            <Checkbox.Group>
              <Row>
                <Col span={8}><Checkbox value="complaint">起诉状</Checkbox></Col>
                <Col span={8}><Checkbox value="evidence">证据清单</Checkbox></Col>
                <Col span={8}><Checkbox value="power_of_attorney">授权委托书</Checkbox></Col>
                <Col span={8}><Checkbox value="application">立案申请书</Checkbox></Col>
                <Col span={8}><Checkbox value="fee_calculation">诉讼费计算书</Checkbox></Col>
                <Col span={8}><Checkbox value="service_address">送达地址确认书</Checkbox></Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item label="提交时间安排" name="submitSchedule">
            <Select placeholder="选择提交时间">
              <Option value="immediate">立即提交</Option>
              <Option value="morning">明日上午</Option>
              <Option value="afternoon">明日下午</Option>
              <Option value="custom">自定义时间</Option>
            </Select>
          </Form.Item>

          <Form.Item label="备注" name="notes">
            <TextArea rows={3} placeholder="输入批量立案备注..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* 法院配置弹窗 */}
      <Modal
        title="法院系统配置"
        open={courtConfigModalVisible}
        onCancel={() => setCourtConfigModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setCourtConfigModalVisible(false)}>
            关闭
          </Button>,
          <Button key="test" type="primary">
            测试连接
          </Button>
        ]}
      >
        <Table
          columns={courtColumns}
          dataSource={courts}
          rowKey="id"
          pagination={false}
          size="middle"
        />
        
        <Divider />
        
        <Row gutter={16}>
          <Col span={12}>
            <Card size="small" title="API接口状态">
              <List
                dataSource={[
                  { name: '北京法院统一平台', status: 'success', message: '连接正常' },
                  { name: '上海法院网上立案', status: 'error', message: '连接超时' },
                  { name: '广州法院系统', status: 'processing', message: '维护中' }
                ]}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.name}
                      description={item.message}
                      avatar={
                        <Badge 
                          status={item.status as any}
                        />
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="系统配置">
              <Form layout="vertical" size="small">
                <Form.Item label="API超时时间(秒)">
                  <Input defaultValue="30" />
                </Form.Item>
                <Form.Item label="最大重试次数">
                  <Input defaultValue="3" />
                </Form.Item>
                <Form.Item label="批量提交间隔(秒)">
                  <Input defaultValue="5" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" size="small">保存配置</Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </Modal>
    </div>
  );
};

export default SmartFilingSystem;