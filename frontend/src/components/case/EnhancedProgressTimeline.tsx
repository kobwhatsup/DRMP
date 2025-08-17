import React, { useState, useEffect } from 'react';
import {
  Card,
  Timeline,
  Button,
  Space,
  Tag,
  Avatar,
  Tooltip,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  message,
  Drawer,
  Tabs,
  Badge,
  Alert,
  Typography,
  Row,
  Col,
  Statistic,
  Progress,
  Divider,
  List,
  Empty,
  Skeleton,
  Descriptions,
  InputNumber
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  UserOutlined,
  FileTextOutlined,
  PhoneOutlined,
  MessageOutlined,
  MailOutlined,
  HomeOutlined,
  CarOutlined,
  TeamOutlined,
  DollarOutlined,
  FileAddOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  FilterOutlined,
  DownloadOutlined,
  PrinterOutlined,
  ShareAltOutlined,
  FlagOutlined,
  StarOutlined,
  CommentOutlined,
  PaperClipOutlined,
  AudioOutlined,
  VideoCameraOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  EyeOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface ProgressRecord {
  id: string;
  type: 'CONTACT' | 'VISIT' | 'PAYMENT' | 'LEGAL' | 'NEGOTIATION' | 'DOCUMENT' | 'SYSTEM';
  subType?: string;
  title: string;
  description: string;
  result?: string;
  amount?: number;
  operator: string;
  operatorAvatar?: string;
  createTime: string;
  updateTime?: string;
  attachments?: Attachment[];
  tags?: string[];
  location?: string;
  duration?: number;
  participants?: string[];
  nextAction?: string;
  nextActionTime?: string;
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'IN_PROGRESS';
  relatedRecords?: string[];
  comments?: Comment[];
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadTime: string;
}

interface Comment {
  id: string;
  content: string;
  author: string;
  authorAvatar?: string;
  createTime: string;
}

interface FilterOptions {
  types: string[];
  dateRange: any;
  importance: string[];
  status: string[];
  operator: string;
  keyword: string;
}

interface EnhancedProgressTimelineProps {
  caseId: string;
  records?: ProgressRecord[];
  loading?: boolean;
  onRefresh?: () => void;
  onAddRecord?: (record: Partial<ProgressRecord>) => void;
  onEditRecord?: (record: ProgressRecord) => void;
  onDeleteRecord?: (recordId: string) => void;
  allowEdit?: boolean;
}

const EnhancedProgressTimeline: React.FC<EnhancedProgressTimelineProps> = ({
  caseId,
  records: initialRecords = [],
  loading = false,
  onRefresh,
  onAddRecord,
  onEditRecord,
  onDeleteRecord,
  allowEdit = true
}) => {
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ProgressRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ProgressRecord | null>(null);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    types: [],
    dateRange: null,
    importance: [],
    status: [],
    operator: '',
    keyword: ''
  });
  const [viewMode, setViewMode] = useState<'timeline' | 'list' | 'calendar'>('timeline');
  const [statistics, setStatistics] = useState({
    totalRecords: 0,
    successRate: 0,
    avgResponseTime: 0,
    totalAmount: 0
  });

  const [form] = Form.useForm();

  // 进度类型配置
  const progressTypeConfig = {
    CONTACT: { label: '联系', icon: <PhoneOutlined />, color: '#1890ff' },
    VISIT: { label: '外访', icon: <CarOutlined />, color: '#52c41a' },
    PAYMENT: { label: '还款', icon: <DollarOutlined />, color: '#faad14' },
    LEGAL: { label: '法律', icon: <FileTextOutlined />, color: '#f5222d' },
    NEGOTIATION: { label: '协商', icon: <TeamOutlined />, color: '#722ed1' },
    DOCUMENT: { label: '文书', icon: <FileAddOutlined />, color: '#13c2c2' },
    SYSTEM: { label: '系统', icon: <SyncOutlined />, color: '#8c8c8c' }
  };

  // 重要程度配置
  const importanceConfig = {
    HIGH: { label: '高', color: 'red' },
    MEDIUM: { label: '中', color: 'orange' },
    LOW: { label: '低', color: 'green' }
  };

  // 状态配置
  const statusConfig = {
    SUCCESS: { label: '成功', color: 'success' },
    FAILED: { label: '失败', color: 'error' },
    PENDING: { label: '待处理', color: 'warning' },
    IN_PROGRESS: { label: '进行中', color: 'processing' }
  };

  useEffect(() => {
    // 加载模拟数据
    if (initialRecords.length === 0) {
      loadMockData();
    } else {
      setRecords(initialRecords);
      setFilteredRecords(initialRecords);
    }
  }, [initialRecords]);

  useEffect(() => {
    // 应用过滤器
    applyFilters();
  }, [filters, records]);

  useEffect(() => {
    // 计算统计数据
    calculateStatistics();
  }, [filteredRecords]);

  const loadMockData = () => {
    const mockRecords: ProgressRecord[] = [
      {
        id: '1',
        type: 'CONTACT',
        subType: '电话',
        title: '首次电话联系',
        description: '与债务人进行首次电话沟通，说明还款事宜',
        result: '债务人承诺3日内还款5000元',
        operator: '张三',
        createTime: moment().subtract(7, 'days').toISOString(),
        tags: ['承诺还款', '态度良好'],
        duration: 15,
        nextAction: '跟进还款情况',
        nextActionTime: moment().subtract(4, 'days').toISOString(),
        importance: 'HIGH',
        status: 'SUCCESS',
        comments: [
          {
            id: 'c1',
            content: '债务人态度诚恳，建议持续跟进',
            author: '李四',
            createTime: moment().subtract(7, 'days').toISOString()
          }
        ]
      },
      {
        id: '2',
        type: 'PAYMENT',
        title: '部分还款',
        description: '债务人通过银行转账还款',
        amount: 5000,
        operator: '系统',
        createTime: moment().subtract(4, 'days').toISOString(),
        importance: 'HIGH',
        status: 'SUCCESS'
      },
      {
        id: '3',
        type: 'VISIT',
        subType: '上门',
        title: '上门外访',
        description: '前往债务人住址进行外访',
        result: '债务人不在家，邻居称其外出打工',
        operator: '王五',
        createTime: moment().subtract(2, 'days').toISOString(),
        location: '北京市朝阳区xxx小区',
        duration: 120,
        participants: ['王五', '赵六'],
        importance: 'MEDIUM',
        status: 'FAILED',
        attachments: [
          {
            id: 'a1',
            name: '外访照片.jpg',
            type: 'image/jpeg',
            size: 2048000,
            url: '/api/files/a1',
            uploadTime: moment().subtract(2, 'days').toISOString()
          }
        ]
      },
      {
        id: '4',
        type: 'NEGOTIATION',
        title: '还款协商',
        description: '与债务人协商制定还款计划',
        result: '达成分期还款协议，每月还款2000元',
        operator: '张三',
        createTime: moment().subtract(1, 'days').toISOString(),
        importance: 'HIGH',
        status: 'SUCCESS',
        relatedRecords: ['1', '2']
      },
      {
        id: '5',
        type: 'DOCUMENT',
        title: '生成还款协议',
        description: '根据协商结果生成还款协议文书',
        operator: '系统',
        createTime: moment().toISOString(),
        importance: 'MEDIUM',
        status: 'SUCCESS',
        attachments: [
          {
            id: 'a2',
            name: '还款协议.pdf',
            type: 'application/pdf',
            size: 1024000,
            url: '/api/files/a2',
            uploadTime: moment().toISOString()
          }
        ]
      }
    ];

    setRecords(mockRecords);
    setFilteredRecords(mockRecords);
  };

  const applyFilters = () => {
    let filtered = [...records];

    // 类型过滤
    if (filters.types.length > 0) {
      filtered = filtered.filter(r => filters.types.includes(r.type));
    }

    // 日期范围过滤
    if (filters.dateRange) {
      const [start, end] = filters.dateRange;
      filtered = filtered.filter(r => {
        const recordDate = moment(r.createTime);
        return recordDate.isBetween(start, end, 'day', '[]');
      });
    }

    // 重要程度过滤
    if (filters.importance.length > 0) {
      filtered = filtered.filter(r => filters.importance.includes(r.importance));
    }

    // 状态过滤
    if (filters.status.length > 0) {
      filtered = filtered.filter(r => filters.status.includes(r.status));
    }

    // 操作人过滤
    if (filters.operator) {
      filtered = filtered.filter(r => 
        r.operator.toLowerCase().includes(filters.operator.toLowerCase())
      );
    }

    // 关键词过滤
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(keyword) ||
        r.description.toLowerCase().includes(keyword) ||
        (r.result && r.result.toLowerCase().includes(keyword))
      );
    }

    setFilteredRecords(filtered);
  };

  const calculateStatistics = () => {
    const total = filteredRecords.length;
    const successful = filteredRecords.filter(r => r.status === 'SUCCESS').length;
    const totalAmount = filteredRecords
      .filter(r => r.type === 'PAYMENT' && r.amount)
      .reduce((sum, r) => sum + (r.amount || 0), 0);

    setStatistics({
      totalRecords: total,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      avgResponseTime: 24, // 模拟数据
      totalAmount
    });
  };

  const handleAddRecord = () => {
    form.validateFields().then(values => {
      const newRecord: Partial<ProgressRecord> = {
        ...values,
        id: Date.now().toString(),
        operator: '当前用户',
        createTime: moment().toISOString(),
        status: 'SUCCESS'
      };

      if (onAddRecord) {
        onAddRecord(newRecord);
      } else {
        setRecords([...records, newRecord as ProgressRecord]);
      }

      message.success('进度记录添加成功');
      setAddModalVisible(false);
      form.resetFields();
    });
  };

  const handleViewDetail = (record: ProgressRecord) => {
    setSelectedRecord(record);
    setDetailDrawerVisible(true);
  };

  const handleExport = () => {
    message.info('正在导出进度记录...');
  };

  const handlePrint = () => {
    window.print();
  };

  const renderTimelineItem = (record: ProgressRecord) => {
    const config = progressTypeConfig[record.type];
    
    return (
      <Timeline.Item
        key={record.id}
        dot={
          <Avatar 
            size="small" 
            style={{ backgroundColor: config.color }}
            icon={config.icon}
          />
        }
      >
        <Card 
          size="small" 
          className="timeline-card"
          hoverable
          onClick={() => handleViewDetail(record)}
        >
          <Row gutter={[16, 8]}>
            <Col span={16}>
              <Space direction="vertical" size={0}>
                <Space>
                  <Text strong>{record.title}</Text>
                  <Tag color={importanceConfig[record.importance].color}>
                    {importanceConfig[record.importance].label}
                  </Tag>
                  <Tag color={statusConfig[record.status].color}>
                    {statusConfig[record.status].label}
                  </Tag>
                </Space>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {record.description}
                </Text>
                {record.result && (
                  <Text style={{ fontSize: 12 }}>
                    结果: {record.result}
                  </Text>
                )}
                {record.amount && (
                  <Text type="success" strong>
                    金额: ¥{record.amount.toLocaleString()}
                  </Text>
                )}
                {record.tags && record.tags.length > 0 && (
                  <Space size={[0, 8]} wrap>
                    {record.tags.map((tag, index) => (
                      <Tag key={index} color="blue">{tag}</Tag>
                    ))}
                  </Space>
                )}
              </Space>
            </Col>
            <Col span={8} style={{ textAlign: 'right' }}>
              <Space direction="vertical" size={0}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {moment(record.createTime).format('YYYY-MM-DD HH:mm')}
                </Text>
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {record.operator}
                  </Text>
                </Space>
                {record.attachments && record.attachments.length > 0 && (
                  <Badge count={record.attachments.length}>
                    <PaperClipOutlined />
                  </Badge>
                )}
                {record.comments && record.comments.length > 0 && (
                  <Badge count={record.comments.length}>
                    <CommentOutlined />
                  </Badge>
                )}
              </Space>
            </Col>
          </Row>
        </Card>
      </Timeline.Item>
    );
  };

  const renderListView = () => (
    <List
      dataSource={filteredRecords}
      loading={loading}
      renderItem={record => {
        const config = progressTypeConfig[record.type];
        return (
          <List.Item
            key={record.id}
            actions={[
              <Button 
                type="link" 
                icon={<EyeOutlined />}
                onClick={() => handleViewDetail(record)}
              >
                查看
              </Button>,
              allowEdit && (
                <Button 
                  type="link" 
                  icon={<EditOutlined />}
                  onClick={() => onEditRecord?.(record)}
                >
                  编辑
                </Button>
              ),
              allowEdit && (
                <Button 
                  type="link" 
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: '确认删除',
                      content: '确定要删除这条进度记录吗？',
                      onOk: () => onDeleteRecord?.(record.id)
                    });
                  }}
                >
                  删除
                </Button>
              )
            ].filter(Boolean)}
          >
            <List.Item.Meta
              avatar={
                <Avatar 
                  style={{ backgroundColor: config.color }}
                  icon={config.icon}
                />
              }
              title={
                <Space>
                  <Text strong>{record.title}</Text>
                  <Tag color={importanceConfig[record.importance].color}>
                    {importanceConfig[record.importance].label}
                  </Tag>
                  <Tag color={statusConfig[record.status].color}>
                    {statusConfig[record.status].label}
                  </Tag>
                </Space>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Text>{record.description}</Text>
                  {record.result && (
                    <Text type="secondary">结果: {record.result}</Text>
                  )}
                  <Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {moment(record.createTime).format('YYYY-MM-DD HH:mm')}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      操作人: {record.operator}
                    </Text>
                  </Space>
                </Space>
              }
            />
          </List.Item>
        );
      }}
    />
  );

  return (
    <div className="enhanced-progress-timeline">
      {/* 统计信息 */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic 
              title="总记录数" 
              value={statistics.totalRecords}
              prefix={<FileTextOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="成功率" 
              value={statistics.successRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="平均响应时间" 
              value={statistics.avgResponseTime}
              suffix="小时"
              prefix={<ClockCircleOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="累计回款" 
              value={statistics.totalAmount}
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
        </Row>
      </Card>

      {/* 工具栏 */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button
                type={viewMode === 'timeline' ? 'primary' : 'default'}
                icon={<ClockCircleOutlined />}
                onClick={() => setViewMode('timeline')}
              >
                时间线
              </Button>
              <Button
                type={viewMode === 'list' ? 'primary' : 'default'}
                icon={<FileTextOutlined />}
                onClick={() => setViewMode('list')}
              >
                列表
              </Button>
              <Button
                icon={<FilterOutlined />}
                onClick={() => setFilterDrawerVisible(true)}
              >
                筛选
                {Object.values(filters).some(v => 
                  (Array.isArray(v) && v.length > 0) || 
                  (typeof v === 'string' && v) || 
                  v !== null
                ) && (
                  <Badge dot style={{ marginLeft: 8 }} />
                )}
              </Button>
            </Space>
          </Col>
          <Col>
            <Space>
              {allowEdit && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setAddModalVisible(true)}
                >
                  添加记录
                </Button>
              )}
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                导出
              </Button>
              <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                打印
              </Button>
              <Button icon={<SyncOutlined />} onClick={onRefresh}>
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 内容区域 */}
      <Card bordered={false}>
        {loading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : filteredRecords.length === 0 ? (
          <Empty description="暂无进度记录" />
        ) : viewMode === 'timeline' ? (
          <Timeline mode="left">
            {filteredRecords.map(renderTimelineItem)}
          </Timeline>
        ) : (
          renderListView()
        )}
      </Card>

      {/* 添加记录弹窗 */}
      <Modal
        title="添加进度记录"
        visible={addModalVisible}
        onOk={handleAddRecord}
        onCancel={() => {
          setAddModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="记录类型"
                rules={[{ required: true, message: '请选择记录类型' }]}
              >
                <Select placeholder="请选择">
                  {Object.entries(progressTypeConfig).map(([key, config]) => (
                    <Option key={key} value={key}>
                      <Space>
                        {config.icon}
                        {config.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="importance"
                label="重要程度"
                rules={[{ required: true, message: '请选择重要程度' }]}
              >
                <Select placeholder="请选择">
                  {Object.entries(importanceConfig).map(([key, config]) => (
                    <Option key={key} value={key}>
                      {config.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入标题" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea rows={3} placeholder="请输入详细描述" />
          </Form.Item>
          <Form.Item name="result" label="结果">
            <TextArea rows={2} placeholder="请输入处理结果" />
          </Form.Item>
          <Form.Item name="amount" label="金额">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              placeholder="请输入金额"
            />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入后回车添加标签">
              <Option value="承诺还款">承诺还款</Option>
              <Option value="态度良好">态度良好</Option>
              <Option value="失联">失联</Option>
              <Option value="拒绝沟通">拒绝沟通</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情抽屉 */}
      <Drawer
        title="进度详情"
        placement="right"
        width={600}
        visible={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {selectedRecord && (
          <div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="类型">
                <Space>
                  {progressTypeConfig[selectedRecord.type].icon}
                  {progressTypeConfig[selectedRecord.type].label}
                  {selectedRecord.subType && `- ${selectedRecord.subType}`}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="标题">
                {selectedRecord.title}
              </Descriptions.Item>
              <Descriptions.Item label="描述">
                {selectedRecord.description}
              </Descriptions.Item>
              {selectedRecord.result && (
                <Descriptions.Item label="结果">
                  {selectedRecord.result}
                </Descriptions.Item>
              )}
              {selectedRecord.amount && (
                <Descriptions.Item label="金额">
                  ¥{selectedRecord.amount.toLocaleString()}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="重要程度">
                <Tag color={importanceConfig[selectedRecord.importance].color}>
                  {importanceConfig[selectedRecord.importance].label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusConfig[selectedRecord.status].color}>
                  {statusConfig[selectedRecord.status].label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="操作人">
                {selectedRecord.operator}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {moment(selectedRecord.createTime).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              {selectedRecord.location && (
                <Descriptions.Item label="位置">
                  <Space>
                    <EnvironmentOutlined />
                    {selectedRecord.location}
                  </Space>
                </Descriptions.Item>
              )}
              {selectedRecord.duration && (
                <Descriptions.Item label="持续时间">
                  {selectedRecord.duration} 分钟
                </Descriptions.Item>
              )}
              {selectedRecord.participants && selectedRecord.participants.length > 0 && (
                <Descriptions.Item label="参与人员">
                  {selectedRecord.participants.join(', ')}
                </Descriptions.Item>
              )}
              {selectedRecord.tags && selectedRecord.tags.length > 0 && (
                <Descriptions.Item label="标签">
                  <Space size={[0, 8]} wrap>
                    {selectedRecord.tags.map((tag, index) => (
                      <Tag key={index} color="blue">{tag}</Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* 附件 */}
            {selectedRecord.attachments && selectedRecord.attachments.length > 0 && (
              <>
                <Divider>附件</Divider>
                <List
                  dataSource={selectedRecord.attachments}
                  renderItem={attachment => (
                    <List.Item
                      actions={[
                        <Button type="link" icon={<DownloadOutlined />}>
                          下载
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<PaperClipOutlined />}
                        title={attachment.name}
                        description={`${(attachment.size / 1024 / 1024).toFixed(2)} MB`}
                      />
                    </List.Item>
                  )}
                />
              </>
            )}

            {/* 评论 */}
            {selectedRecord.comments && selectedRecord.comments.length > 0 && (
              <>
                <Divider>评论</Divider>
                <List
                  dataSource={selectedRecord.comments}
                  renderItem={comment => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={
                          <Space>
                            <Text>{comment.author}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {moment(comment.createTime).fromNow()}
                            </Text>
                          </Space>
                        }
                        description={comment.content}
                      />
                    </List.Item>
                  )}
                />
              </>
            )}
          </div>
        )}
      </Drawer>

      {/* 筛选抽屉 */}
      <Drawer
        title="筛选条件"
        placement="right"
        width={400}
        visible={filterDrawerVisible}
        onClose={() => setFilterDrawerVisible(false)}
        footer={
          <Space>
            <Button 
              onClick={() => {
                setFilters({
                  types: [],
                  dateRange: null,
                  importance: [],
                  status: [],
                  operator: '',
                  keyword: ''
                });
              }}
            >
              重置
            </Button>
            <Button type="primary" onClick={() => setFilterDrawerVisible(false)}>
              确定
            </Button>
          </Space>
        }
      >
        <Form layout="vertical">
          <Form.Item label="记录类型">
            <Select
              mode="multiple"
              placeholder="请选择"
              value={filters.types}
              onChange={types => setFilters({ ...filters, types })}
            >
              {Object.entries(progressTypeConfig).map(([key, config]) => (
                <Option key={key} value={key}>
                  {config.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="日期范围">
            <RangePicker
              style={{ width: '100%' }}
              value={filters.dateRange}
              onChange={dateRange => setFilters({ ...filters, dateRange })}
            />
          </Form.Item>
          <Form.Item label="重要程度">
            <Select
              mode="multiple"
              placeholder="请选择"
              value={filters.importance}
              onChange={importance => setFilters({ ...filters, importance })}
            >
              {Object.entries(importanceConfig).map(([key, config]) => (
                <Option key={key} value={key}>
                  {config.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="状态">
            <Select
              mode="multiple"
              placeholder="请选择"
              value={filters.status}
              onChange={status => setFilters({ ...filters, status })}
            >
              {Object.entries(statusConfig).map(([key, config]) => (
                <Option key={key} value={key}>
                  {config.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="操作人">
            <Input
              placeholder="请输入操作人"
              value={filters.operator}
              onChange={e => setFilters({ ...filters, operator: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="关键词">
            <Input
              placeholder="搜索标题、描述、结果"
              value={filters.keyword}
              onChange={e => setFilters({ ...filters, keyword: e.target.value })}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default EnhancedProgressTimeline;