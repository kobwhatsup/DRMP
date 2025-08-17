import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  message,
  notification,
  Modal,
  Dropdown,
  Menu,
  Badge,
  Tooltip,
  Checkbox,
  Form,
  InputNumber,
  Typography,
  Divider,
  Drawer,
  Tabs,
  Progress,
  Alert,
  Statistic
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  FileAddOutlined,
  TagsOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  DownloadOutlined,
  PrinterOutlined,
  FileTextOutlined,
  UserOutlined,
  PhoneOutlined,
  DollarOutlined,
  CalendarOutlined,
  HistoryOutlined,
  RightOutlined
} from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import {
  batchUpdateCaseStatus,
  batchAssignCases,
  batchReturnCases,
  batchRetainCases,
  batchCloseCases,
  batchAddTags,
  batchRemoveTags,
  BatchOperationResponse
} from '@/services/batchOperationService';
import BatchOperationProgress from '@/components/BatchOperationProgress';
import HandlerSelectionModal from '@/components/HandlerSelectionModal';
import BatchTagModal from '@/components/BatchTagModal';
import BatchDocumentModal from '@/components/BatchDocumentModal';
import BatchReminderModal from '@/components/BatchReminderModal';
import BatchExportModal from '@/components/BatchExportModal';
import BatchStatusModal from '@/components/BatchStatusModal';
import CustomSuccessNotification from '@/components/CustomSuccessNotification';
import WorkRecordModal from '@/components/case/WorkRecordModal';
import DocumentRecordModal from '@/components/case/DocumentRecordModal';
import AddRecordModal from '@/components/case/AddRecordModal';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

interface CaseRecord {
  id: string;
  caseNo: string;
  debtorName: string;
  debtorIdCard: string;
  debtorPhone: string;
  loanAmount: number;
  remainingAmount: number;
  overdueDays: number;
  status: string;
  stage: string;
  handler: string;
  handlerId: string;
  lastContactDate: string;
  nextContactDate: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  recoveryRate: number;
  workRecordCount: number;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}

interface BatchOperation {
  type: string;
  label: string;
  icon: React.ReactNode;
  danger?: boolean;
}

const CaseList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CaseRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchOperationId, setBatchOperationId] = useState<number | null>(null);
  const [progressVisible, setProgressVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchForm] = Form.useForm();
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [selectedBatchOperation, setSelectedBatchOperation] = useState<string>('');
  const [tagDrawerVisible, setTagDrawerVisible] = useState(false);
  const [quickActionCase, setQuickActionCase] = useState<CaseRecord | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    returned: 0
  });
  const [handlerSelectionVisible, setHandlerSelectionVisible] = useState(false);
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [tagOperationType, setTagOperationType] = useState<'add' | 'remove'>('add');
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [customNotification, setCustomNotification] = useState<{
    visible: boolean;
    message: string;
    description: string;
  }>({
    visible: false,
    message: '',
    description: ''
  });
  const [workRecordModalVisible, setWorkRecordModalVisible] = useState(false);
  const [documentRecordModalVisible, setDocumentRecordModalVisible] = useState(false);
  const [addRecordModalVisible, setAddRecordModalVisible] = useState(false);
  const [selectedCaseForRecord, setSelectedCaseForRecord] = useState<CaseRecord | null>(null);

  // 批量操作选项
  const batchOperations: BatchOperation[] = [
    { type: 'status_update', label: '更新状态', icon: <CheckCircleOutlined /> },
    { type: 'assign', label: '分配处理人', icon: <TeamOutlined /> },
    { type: 'add_tags', label: '添加标签', icon: <TagsOutlined /> },
    { type: 'generate_docs', label: '生成文书', icon: <FileTextOutlined /> },
    { type: 'set_reminder', label: '设置提醒', icon: <ClockCircleOutlined /> },
    { type: 'export', label: '导出数据', icon: <ExportOutlined /> },
    { type: 'return', label: '退案', icon: <CloseCircleOutlined />, danger: true },
    { type: 'close', label: '结案', icon: <CheckCircleOutlined /> }
  ];

  // 查看作业记录
  const handleViewWorkRecords = (record: CaseRecord) => {
    setSelectedCaseForRecord(record);
    setWorkRecordModalVisible(true);
  };

  // 查看文档记录
  const handleViewDocuments = (record: CaseRecord) => {
    setSelectedCaseForRecord(record);
    setDocumentRecordModalVisible(true);
  };

  // 添加记录
  const handleAddRecord = (record: CaseRecord) => {
    setSelectedCaseForRecord(record);
    setAddRecordModalVisible(true);
  };

  // 查看详情
  const handleViewDetail = (record: CaseRecord) => {
    // 使用React Router跳转到详情页面
    navigate(`/cases/detail/${record.id}`);
  };

  // 添加记录成功回调
  const handleAddRecordSuccess = (recordData: any) => {
    message.success('作业记录添加成功');
    setAddRecordModalVisible(false);
    setSelectedCaseForRecord(null);
    fetchData(); // 刷新数据
  };

  // 案件状态映射
  const statusMap: Record<string, { color: string; label: string }> = {
    PENDING: { color: 'default', label: '待处理' },
    IN_CONTACT: { color: 'processing', label: '联系中' },
    NEGOTIATING: { color: 'warning', label: '协商中' },
    PAYMENT_PLAN: { color: 'cyan', label: '还款计划' },
    MONITORING: { color: 'blue', label: '监控中' },
    LEGAL_PROCESS: { color: 'purple', label: '法律程序' },
    SETTLED: { color: 'success', label: '已和解' },
    CLOSED: { color: 'default', label: '已结案' },
    RETURNED: { color: 'error', label: '已退案' }
  };

  // 优先级映射
  const priorityMap: Record<string, { color: string; label: string }> = {
    high: { color: 'red', label: '高' },
    medium: { color: 'orange', label: '中' },
    low: { color: 'green', label: '低' }
  };

  // 表格列定义
  const columns: ColumnsType<CaseRecord> = [
    {
      title: '案件编号',
      dataIndex: 'caseNo',
      key: 'caseNo',
      width: 120,
      render: (text: string, record: CaseRecord) => (
        <Button type="link" onClick={() => handleViewDetail(record)}>
          {text}
        </Button>
      )
    },
    {
      title: '债务人信息',
      key: 'debtorInfo',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <UserOutlined />
            <Text strong>{record.debtorName}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.debtorIdCard.replace(/^(.{6}).*(.{4})$/, '$1****$2')}
          </Text>
          <Space>
            <PhoneOutlined />
            <Text style={{ fontSize: 12 }}>{record.debtorPhone}</Text>
          </Space>
        </Space>
      )
    },
    {
      title: '金额信息',
      key: 'amountInfo',
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>贷款: ¥{record.loanAmount.toLocaleString()}</Text>
          <Text type="danger">剩余: ¥{record.remainingAmount.toLocaleString()}</Text>
          <Progress 
            percent={Math.round(record.recoveryRate * 100)} 
            size="small" 
            format={percent => `回收${percent}%`}
          />
        </Space>
      )
    },
    {
      title: '逾期天数',
      dataIndex: 'overdueDays',
      key: 'overdueDays',
      width: 100,
      sorter: true,
      render: (days: number) => (
        <Badge
          count={days}
          style={{
            backgroundColor: days > 180 ? '#ff4d4f' : days > 90 ? '#faad14' : '#52c41a'
          }}
          overflowCount={999}
        />
      )
    },
    {
      title: '案件状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: Object.entries(statusMap).map(([key, value]) => ({
        text: value.label,
        value: key
      })),
      render: (status: string) => (
        <Tag color={statusMap[status]?.color || 'default'}>
          {statusMap[status]?.label || status}
        </Tag>
      )
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      filters: Object.entries(priorityMap).map(([key, value]) => ({
        text: value.label,
        value: key
      })),
      render: (priority: string) => (
        <Tag color={priorityMap[priority]?.color || 'default'}>
          {priorityMap[priority]?.label || priority}
        </Tag>
      )
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: string[]) => (
        <Space size={[0, 8]} wrap>
          {tags.slice(0, 3).map((tag, index) => (
            <Tag key={index} color="blue">
              {tag}
            </Tag>
          ))}
          {tags.length > 3 && (
            <Tag>+{tags.length - 3}</Tag>
          )}
        </Space>
      )
    },
    {
      title: '处理人',
      dataIndex: 'handler',
      key: 'handler',
      width: 100,
      render: (handler: string) => (
        <Space>
          <UserOutlined />
          <Text>{handler}</Text>
        </Space>
      )
    },
    {
      title: '最近联系',
      dataIndex: 'lastContactDate',
      key: 'lastContactDate',
      width: 110,
      render: (date: string) => (
        <Tooltip title={moment(date).format('YYYY-MM-DD HH:mm:ss')}>
          <Text type="secondary">{moment(date).fromNow()}</Text>
        </Tooltip>
      )
    },
    {
      title: '下次联系',
      dataIndex: 'nextContactDate',
      key: 'nextContactDate',
      width: 110,
      render: (date: string) => {
        const isOverdue = moment(date).isBefore(moment());
        return (
          <Tooltip title={moment(date).format('YYYY-MM-DD HH:mm:ss')}>
            <Text type={isOverdue ? 'danger' : 'secondary'}>
              {moment(date).format('MM-DD HH:mm')}
            </Text>
          </Tooltip>
        );
      }
    },
    {
      title: '操作记录',
      key: 'records',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="作业记录">
            <Badge count={record.workRecordCount} showZero>
              <Button 
                size="small" 
                icon={<HistoryOutlined />} 
                onClick={() => handleViewWorkRecords(record)}
              />
            </Badge>
          </Tooltip>
          <Tooltip title="文档">
            <Badge count={record.documentCount} showZero>
              <Button 
                size="small" 
                icon={<FileTextOutlined />} 
                onClick={() => handleViewDocuments(record)}
              />
            </Badge>
          </Tooltip>
        </Space>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              type="link" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="添加记录">
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              onClick={() => handleAddRecord(record)}
            />
          </Tooltip>
          <Dropdown
            overlay={
              <Menu onClick={({ key }) => handleQuickAction(key, record)}>
                <Menu.Item key="call" icon={<PhoneOutlined />}>
                  拨打电话
                </Menu.Item>
                <Menu.Item key="sms" icon={<FileTextOutlined />}>
                  发送短信
                </Menu.Item>
                <Menu.Item key="tag" icon={<TagsOutlined />}>
                  快速标签
                </Menu.Item>
                <Menu.Item key="doc" icon={<FileAddOutlined />}>
                  生成文书
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="return" icon={<CloseCircleOutlined />} danger>
                  申请退案
                </Menu.Item>
              </Menu>
            }
          >
            <Button type="link" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ];

  // 加载数据
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 生成模拟数据
      const mockData: CaseRecord[] = Array.from({ length: 50 }, (_, i) => ({
        id: `CASE${(i + 1).toString().padStart(6, '0')}`,
        caseNo: `2024${(i + 1).toString().padStart(6, '0')}`,
        debtorName: `债务人${i + 1}`,
        debtorIdCard: `110105199001${(i + 1).toString().padStart(6, '0')}`,
        debtorPhone: `138${(10000000 + i).toString()}`,
        loanAmount: Math.floor(Math.random() * 1000000) + 10000,
        remainingAmount: Math.floor(Math.random() * 500000) + 5000,
        overdueDays: Math.floor(Math.random() * 365) + 30,
        status: Object.keys(statusMap)[Math.floor(Math.random() * Object.keys(statusMap).length)],
        stage: ['初期', '中期', '后期'][Math.floor(Math.random() * 3)],
        handler: ['张三', '李四', '王五'][Math.floor(Math.random() * 3)],
        handlerId: `USER${Math.floor(Math.random() * 10) + 1}`,
        lastContactDate: moment().subtract(Math.floor(Math.random() * 30), 'days').toISOString(),
        nextContactDate: moment().add(Math.floor(Math.random() * 7), 'days').toISOString(),
        tags: ['重点关注', '失联', '承诺还款', '异议', '投诉'].slice(0, Math.floor(Math.random() * 4) + 1),
        priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
        recoveryRate: Math.random() * 0.8,
        workRecordCount: Math.floor(Math.random() * 20),
        documentCount: Math.floor(Math.random() * 10),
        createdAt: moment().subtract(Math.floor(Math.random() * 90), 'days').toISOString(),
        updatedAt: moment().subtract(Math.floor(Math.random() * 7), 'days').toISOString()
      }));

      setData(mockData.slice((currentPage - 1) * pageSize, currentPage * pageSize));
      setTotal(mockData.length);

      // 更新统计数据
      setStatistics({
        total: mockData.length,
        pending: mockData.filter(d => d.status === 'PENDING').length,
        inProgress: mockData.filter(d => ['IN_CONTACT', 'NEGOTIATING'].includes(d.status)).length,
        completed: mockData.filter(d => ['SETTLED', 'CLOSED'].includes(d.status)).length,
        returned: mockData.filter(d => d.status === 'RETURNED').length
      });
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    // 清理所有悬浮消息和通知
    message.destroy();
    notification.destroy();
    fetchData();
  }, [fetchData]);

  // 处理表格选择
  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRows: CaseRecord[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(newSelectedRows);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
      {
        key: 'high-priority',
        text: '高优先级',
        onSelect: (changeableRowKeys: React.Key[]) => {
          const newSelectedRowKeys = changeableRowKeys.filter((key) => {
            const record = data.find(item => item.id === key);
            return record?.priority === 'high';
          });
          setSelectedRowKeys(newSelectedRowKeys);
        }
      }
    ]
  };

  // 处理批量操作
  const handleBatchOperation = (operation: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要操作的案件');
      return;
    }
    
    // 根据操作类型打开对应的弹窗
    switch (operation) {
      case 'assign':
        setHandlerSelectionVisible(true);
        return;
      case 'add_tags':
        setTagOperationType('add');
        setTagModalVisible(true);
        return;
      case 'remove_tags':
        setTagOperationType('remove');
        setTagModalVisible(true);
        return;
      case 'generate_docs':
        setDocumentModalVisible(true);
        return;
      case 'set_reminder':
        setReminderModalVisible(true);
        return;
      case 'export':
        setExportModalVisible(true);
        return;
      case 'status_update':
        setStatusModalVisible(true);
        return;
      case 'return':
      case 'close':
        setSelectedBatchOperation(operation);
        setBatchModalVisible(true);
        return;
      default:
        setSelectedBatchOperation(operation);
        setBatchModalVisible(true);
    }
  };

  // 执行批量操作
  const executeBatchOperation = async () => {
    setBatchLoading(true);
    try {
      const caseIds: string[] = selectedRowKeys.map(key => key.toString());
      let result: BatchOperationResponse;
      
      switch (selectedBatchOperation) {
        case 'status_update':
          result = await batchUpdateCaseStatus(caseIds, 'IN_PROGRESS', '批量更新状态');
          break;
        case 'assign':
          // 分配处理人操作现在通过HandlerSelectionModal处理
          throw new Error('分配处理人操作应通过处理人选择弹窗处理');
          break;
        case 'tag_add':
          result = await batchAddTags(caseIds, ['批量处理']);
          break;
        case 'tag_remove':
          result = await batchRemoveTags(caseIds, ['临时标签']);
          break;
        case 'return':
          result = await batchReturnCases(caseIds, '批量退案操作');
          break;
        case 'retain':
          result = await batchRetainCases(caseIds, '批量留案操作');
          break;
        case 'close':
          result = await batchCloseCases(caseIds, 'COMPLETED', '批量结案操作');
          break;
        default:
          throw new Error('未知的批量操作类型');
      }
      
      // 显示进度追踪窗口
      setBatchOperationId(result.id);
      setProgressVisible(true);
      setBatchModalVisible(false);
      setSelectedRowKeys([]);
      setSelectedRows([]);
    } catch (error: any) {
      message.error(`批量操作失败: ${error.message || '未知错误'}`);
    } finally {
      setBatchLoading(false);
    }
  };

  // 处理快速操作
  const handleQuickAction = (action: string, record: CaseRecord) => {
    setQuickActionCase(record);
    switch (action) {
      case 'call':
        message.info({
          content: `正在拨打 ${record.debtorPhone}...`,
          duration: 2,
          key: 'call-info'
        });
        break;
      case 'sms':
        message.info({
          content: '短信编辑器打开中...',
          duration: 2,
          key: 'sms-info'
        });
        break;
      case 'tag':
        setTagDrawerVisible(true);
        break;
      case 'doc':
        setDocumentModalVisible(true);
        break;
      case 'return':
        Modal.confirm({
          title: '确认退案',
          content: `确定要退回案件 ${record.caseNo} 吗？`,
          onOk: () => {
            message.success({
              content: '退案申请已提交',
              duration: 3,
              key: 'return-case-success'
            });
          }
        });
        break;
    }
  };


  // 搜索表单
  const handleSearch = (values: any) => {
    console.log('Search values:', values);
    fetchData();
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    fetchData();
  };

  // 处理处理人分配确认
  const handleHandlerAssignmentConfirm = (result: any) => {
    // 销毁之前的消息，避免堆叠
    message.destroy();
    // 显示新消息，设置3秒后自动关闭
    message.success({
      content: `成功分配 ${result.assignedCases.length} 个案件给处理人`,
      duration: 3,
      key: 'handler-assignment-success' // 使用固定key确保只显示一个消息
    });
    setHandlerSelectionVisible(false);
    setSelectedRowKeys([]);
    setSelectedRows([]);
    fetchData(); // 刷新数据
  };

  // 通用的批量操作成功处理
  const handleBatchOperationSuccess = (result: any, modalSetter: (visible: boolean) => void) => {
    // 清理所有现有消息和通知
    message.destroy();
    notification.destroy();
    setBatchOperationId(result.id);
    setProgressVisible(true);
    modalSetter(false);
    setSelectedRowKeys([]);
    setSelectedRows([]);
  };

  // 获取选中案件的当前状态
  const getCurrentStatuses = () => {
    return selectedRows.map(row => row.status);
  };

  return (
    <div className="case-list-page">
      {/* 页面标题和统计 */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Title level={4} style={{ margin: 0 }}>案件管理</Title>
          </Col>
          <Col>
            <Space>
              <Statistic title="总案件" value={statistics.total} />
              <Divider type="vertical" style={{ height: 40 }} />
              <Statistic title="待处理" value={statistics.pending} valueStyle={{ color: '#faad14' }} />
              <Divider type="vertical" style={{ height: 40 }} />
              <Statistic title="处理中" value={statistics.inProgress} valueStyle={{ color: '#1890ff' }} />
              <Divider type="vertical" style={{ height: 40 }} />
              <Statistic title="已完成" value={statistics.completed} valueStyle={{ color: '#52c41a' }} />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 搜索和筛选 */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
        >
          <Row gutter={[16, 16]} style={{ width: '100%' }}>
            <Col span={6}>
              <Form.Item name="keyword" style={{ width: '100%' }}>
                <Input 
                  placeholder="搜索案件编号、债务人姓名、身份证号、手机号" 
                  prefix={<SearchOutlined />}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="status" style={{ width: '100%' }}>
                <Select placeholder="案件状态" allowClear>
                  {Object.entries(statusMap).map(([key, value]) => (
                    <Option key={key} value={key}>{value.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="priority" style={{ width: '100%' }}>
                <Select placeholder="优先级" allowClear>
                  {Object.entries(priorityMap).map(([key, value]) => (
                    <Option key={key} value={key}>{value.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="dateRange" style={{ width: '100%' }}>
                <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  搜索
                </Button>
                <Button onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 批量操作工具栏 */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              {selectedRowKeys.length > 0 && (
                <Alert
                  message={`已选择 ${selectedRowKeys.length} 个案件`}
                  type="info"
                  showIcon
                  closable
                  onClose={() => setSelectedRowKeys([])}
                />
              )}
            </Space>
          </Col>
          <Col>
            <Space>
              {batchOperations.map(op => (
                <Button
                  key={op.type}
                  icon={op.icon}
                  danger={op.danger}
                  disabled={selectedRowKeys.length === 0}
                  onClick={() => handleBatchOperation(op.type)}
                >
                  {op.label}
                </Button>
              ))}
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchData}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 案件列表表格 */}
      <Card bordered={false}>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 10);
            }
          }}
          scroll={{ x: 1800 }}
        />
      </Card>

      {/* 批量操作确认弹窗 */}
      <Modal
        title={`批量${batchOperations.find(op => op.type === selectedBatchOperation)?.label}`}
        visible={batchModalVisible}
        onOk={executeBatchOperation}
        onCancel={() => setBatchModalVisible(false)}
        confirmLoading={loading}
      >
        <Alert
          message={`确认对 ${selectedRowKeys.length} 个案件执行批量操作？`}
          description="此操作不可撤销，请谨慎确认。"
          type="warning"
          showIcon
        />
      </Modal>

      {/* 标签管理抽屉 */}
      <Drawer
        title={`快速标签 - ${quickActionCase?.caseNo}`}
        placement="right"
        visible={tagDrawerVisible}
        onClose={() => setTagDrawerVisible(false)}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert message="选择要添加的标签" type="info" />
          {/* 标签选择内容 */}
        </Space>
      </Drawer>

      {/* 文书生成弹窗 */}
      <Modal
        title={`生成文书 - ${quickActionCase?.caseNo}`}
        visible={documentModalVisible}
        onOk={() => {
          message.success({
            content: '文书生成任务已提交',
            duration: 3,
            key: 'document-generate-success'
          });
          setDocumentModalVisible(false);
        }}
        onCancel={() => setDocumentModalVisible(false)}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert message="选择要生成的文书模板" type="info" />
          {/* 文书模板选择内容 */}
        </Space>
      </Modal>

      {/* 批量操作进度追踪 */}
      <BatchOperationProgress
        visible={progressVisible}
        operationId={batchOperationId}
        onClose={() => setProgressVisible(false)}
        onComplete={(result) => {
          // 强制清理所有消息和通知
          message.destroy();
          notification.destroy();
          
          // 使用自定义通知组件
          setCustomNotification({
            visible: true,
            message: '批量操作完成',
            description: `成功处理 ${result.successCount} 个案件`
          });
          
          fetchData(); // 刷新数据
        }}
      />

      {/* 处理人选择弹窗 */}
      <HandlerSelectionModal
        visible={handlerSelectionVisible}
        onCancel={() => setHandlerSelectionVisible(false)}
        onConfirm={handleHandlerAssignmentConfirm}
        caseIds={selectedRowKeys.map(key => key.toString())}
        title="批量分配处理人"
      />

      {/* 标签操作弹窗 */}
      <BatchTagModal
        visible={tagModalVisible}
        onCancel={() => setTagModalVisible(false)}
        onSuccess={(result) => handleBatchOperationSuccess(result, setTagModalVisible)}
        caseIds={selectedRowKeys.map(key => key.toString())}
        operationType={tagOperationType}
      />

      {/* 文书生成弹窗 */}
      <BatchDocumentModal
        visible={documentModalVisible}
        onCancel={() => setDocumentModalVisible(false)}
        onSuccess={(result) => handleBatchOperationSuccess(result, setDocumentModalVisible)}
        caseIds={selectedRowKeys.map(key => key.toString())}
      />

      {/* 设置提醒弹窗 */}
      <BatchReminderModal
        visible={reminderModalVisible}
        onCancel={() => setReminderModalVisible(false)}
        onSuccess={(result) => handleBatchOperationSuccess(result, setReminderModalVisible)}
        caseIds={selectedRowKeys.map(key => key.toString())}
      />

      {/* 导出数据弹窗 */}
      <BatchExportModal
        visible={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        onSuccess={(result) => handleBatchOperationSuccess(result, setExportModalVisible)}
        caseIds={selectedRowKeys.map(key => key.toString())}
      />

      {/* 状态更新弹窗 */}
      <BatchStatusModal
        visible={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        onSuccess={(result) => handleBatchOperationSuccess(result, setStatusModalVisible)}
        caseIds={selectedRowKeys.map(key => key.toString())}
        currentStatuses={getCurrentStatuses()}
      />

      {/* 自定义成功通知 */}
      {customNotification.visible && (
        <CustomSuccessNotification
          message={customNotification.message}
          description={customNotification.description}
          duration={3000}
          onClose={() => setCustomNotification(prev => ({ ...prev, visible: false }))}
        />
      )}

      {/* 作业记录查看弹窗 */}
      {selectedCaseForRecord && (
        <WorkRecordModal
          visible={workRecordModalVisible}
          onCancel={() => {
            setWorkRecordModalVisible(false);
            setSelectedCaseForRecord(null);
          }}
          caseId={selectedCaseForRecord.id}
          caseNo={selectedCaseForRecord.caseNo}
          expectedCount={selectedCaseForRecord.workRecordCount}
        />
      )}

      {/* 文档记录查看弹窗 */}
      {selectedCaseForRecord && (
        <DocumentRecordModal
          visible={documentRecordModalVisible}
          onCancel={() => {
            setDocumentRecordModalVisible(false);
            setSelectedCaseForRecord(null);
          }}
          caseId={selectedCaseForRecord.id}
          caseNo={selectedCaseForRecord.caseNo}
          expectedCount={selectedCaseForRecord.documentCount}
        />
      )}

      {/* 添加记录弹窗 */}
      {selectedCaseForRecord && (
        <AddRecordModal
          visible={addRecordModalVisible}
          onCancel={() => {
            setAddRecordModalVisible(false);
            setSelectedCaseForRecord(null);
          }}
          onSuccess={handleAddRecordSuccess}
          caseId={selectedCaseForRecord.id}
          caseNo={selectedCaseForRecord.caseNo}
          debtorName={selectedCaseForRecord.debtorName}
        />
      )}
    </div>
  );
};

export default CaseList;