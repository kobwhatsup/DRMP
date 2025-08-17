import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Alert,
  Typography,
  Descriptions,
  Steps,
  Progress,
  Badge,
  Table,
  Tooltip,
  Drawer,
  Timeline,
  Statistic,
  List,
  Avatar,
  Tabs,
  Transfer,
  Spin,
  Result,
  Divider,
  Popconfirm,
  notification,
  InputNumber
} from 'antd';
import {
  ApiOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  SettingOutlined,
  MonitorOutlined,
  SecurityScanOutlined,
  CloudSyncOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  UserOutlined,
  TeamOutlined,
  BellOutlined,
  HistoryOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
  LinkOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { ColumnsType } from 'antd/es/table';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;
const { TabPane } = Tabs;

interface IDSConnection {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'TESTING';
  version: string;
  lastSync: string;
  organizationId: string;
  organizationName: string;
  apiKey: string;
  secretKey: string;
  syncFrequency: number; // 分钟
  autoSync: boolean;
  syncScope: string[];
  errorCount: number;
  totalSynced: number;
}

interface SyncRecord {
  id: string;
  connectionId: string;
  type: 'CASE_SYNC' | 'PROGRESS_SYNC' | 'DOCUMENT_SYNC' | 'STATUS_SYNC';
  direction: 'PUSH' | 'PULL' | 'BIDIRECTIONAL';
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL' | 'PENDING';
  startTime: string;
  endTime?: string;
  totalRecords: number;
  successRecords: number;
  failedRecords: number;
  errorMessage?: string;
  details: any;
}

interface APIEndpoint {
  id: string;
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  enabled: boolean;
  rateLimit: number;
  authentication: 'API_KEY' | 'OAUTH' | 'BASIC';
  requestCount: number;
  errorRate: number;
  avgResponseTime: number;
}

interface IDSIntegrationPanelProps {
  organizationId?: string;
  userRole?: string;
}

const IDSIntegrationPanel: React.FC<IDSIntegrationPanelProps> = ({
  organizationId,
  userRole = 'ADMIN'
}) => {
  const [connections, setConnections] = useState<IDSConnection[]>([]);
  const [syncRecords, setSyncRecords] = useState<SyncRecord[]>([]);
  const [apiEndpoints, setApiEndpoints] = useState<APIEndpoint[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<IDSConnection | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('connections');

  // 弹窗和抽屉状态
  const [connectionModalVisible, setConnectionModalVisible] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [syncDrawerVisible, setSyncDrawerVisible] = useState(false);
  const [configDrawerVisible, setConfigDrawerVisible] = useState(false);

  const [connectionForm] = Form.useForm();
  const [testForm] = Form.useForm();

  useEffect(() => {
    loadConnections();
    loadSyncRecords();
    loadAPIEndpoints();
  }, []);

  // 加载连接列表
  const loadConnections = async () => {
    setLoading(true);
    try {
      // 模拟数据
      const mockConnections: IDSConnection[] = [
        {
          id: '1',
          name: 'IDS主系统',
          description: '智调系统主要接口连接',
          endpoint: 'https://ids.example.com/api/v1',
          status: 'CONNECTED',
          version: '2.1.0',
          lastSync: moment().subtract(10, 'minutes').toISOString(),
          organizationId: 'ORG001',
          organizationName: '某调解中心',
          apiKey: 'ak_*********************',
          secretKey: 'sk_*********************',
          syncFrequency: 15,
          autoSync: true,
          syncScope: ['cases', 'progress', 'documents'],
          errorCount: 2,
          totalSynced: 1523
        },
        {
          id: '2',
          name: 'IDS备用系统',
          description: '智调系统备用接口连接',
          endpoint: 'https://ids-backup.example.com/api/v1',
          status: 'DISCONNECTED',
          version: '2.0.8',
          lastSync: moment().subtract(2, 'hours').toISOString(),
          organizationId: 'ORG001',
          organizationName: '某调解中心',
          apiKey: 'ak_*********************',
          secretKey: 'sk_*********************',
          syncFrequency: 30,
          autoSync: false,
          syncScope: ['cases'],
          errorCount: 0,
          totalSynced: 456
        }
      ];

      setConnections(mockConnections);
    } catch (error) {
      message.error('加载连接列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载同步记录
  const loadSyncRecords = async () => {
    try {
      const mockRecords: SyncRecord[] = Array.from({ length: 10 }, (_, i) => ({
        id: `SYNC${(i + 1).toString().padStart(4, '0')}`,
        connectionId: Math.random() > 0.5 ? '1' : '2',
        type: ['CASE_SYNC', 'PROGRESS_SYNC', 'DOCUMENT_SYNC', 'STATUS_SYNC'][Math.floor(Math.random() * 4)] as any,
        direction: ['PUSH', 'PULL', 'BIDIRECTIONAL'][Math.floor(Math.random() * 3)] as any,
        status: ['SUCCESS', 'FAILED', 'PARTIAL'][Math.floor(Math.random() * 3)] as any,
        startTime: moment().subtract(i * 30, 'minutes').toISOString(),
        endTime: moment().subtract(i * 30 - 5, 'minutes').toISOString(),
        totalRecords: Math.floor(Math.random() * 100) + 10,
        successRecords: Math.floor(Math.random() * 80) + 10,
        failedRecords: Math.floor(Math.random() * 10),
        errorMessage: Math.random() > 0.7 ? '连接超时' : undefined,
        details: {}
      }));

      setSyncRecords(mockRecords);
    } catch (error) {
      message.error('加载同步记录失败');
    }
  };

  // 加载API端点
  const loadAPIEndpoints = async () => {
    try {
      const mockEndpoints: APIEndpoint[] = [
        {
          id: '1',
          name: '案件同步',
          path: '/api/v1/cases/sync',
          method: 'POST',
          description: '同步案件数据到IDS系统',
          enabled: true,
          rateLimit: 100,
          authentication: 'API_KEY',
          requestCount: 1234,
          errorRate: 2.5,
          avgResponseTime: 250
        },
        {
          id: '2',
          name: '进度更新',
          path: '/api/v1/progress/update',
          method: 'PUT',
          description: '更新案件处理进度',
          enabled: true,
          rateLimit: 200,
          authentication: 'API_KEY',
          requestCount: 5678,
          errorRate: 1.2,
          avgResponseTime: 180
        },
        {
          id: '3',
          name: '文档上传',
          path: '/api/v1/documents/upload',
          method: 'POST',
          description: '上传处置文档',
          enabled: false,
          rateLimit: 50,
          authentication: 'OAUTH',
          requestCount: 123,
          errorRate: 5.0,
          avgResponseTime: 1200
        }
      ];

      setApiEndpoints(mockEndpoints);
    } catch (error) {
      message.error('加载API端点失败');
    }
  };

  // 测试连接
  const handleTestConnection = async (connection: IDSConnection) => {
    setSelectedConnection(connection);
    setTestModalVisible(true);
  };

  // 执行连接测试
  const executeConnectionTest = async () => {
    setLoading(true);
    try {
      // 模拟测试
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const success = Math.random() > 0.3; // 70%成功率
      
      if (success) {
        message.success('连接测试成功');
        notification.success({
          message: '连接测试成功',
          description: `与 ${selectedConnection?.name} 的连接正常，API响应时间: 250ms`
        });
      } else {
        message.error('连接测试失败');
        notification.error({
          message: '连接测试失败',
          description: '无法连接到目标系统，请检查网络和配置'
        });
      }
      
      setTestModalVisible(false);
    } catch (error) {
      message.error('测试过程出错');
    } finally {
      setLoading(false);
    }
  };

  // 手动同步
  const handleManualSync = async (connection: IDSConnection) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      message.success('手动同步完成');
      notification.info({
        message: '同步完成',
        description: `与 ${connection.name} 的数据同步已完成，共处理 ${Math.floor(Math.random() * 100)} 条记录`
      });
      
      // 刷新数据
      loadSyncRecords();
    } catch (error) {
      message.error('同步失败');
    } finally {
      setLoading(false);
    }
  };

  // 连接状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONNECTED': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'DISCONNECTED': return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'ERROR': return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'TESTING': return <SyncOutlined spin style={{ color: '#1890ff' }} />;
      default: return <CloseCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  // 连接表格列
  const connectionColumns: ColumnsType<IDSConnection> = [
    {
      title: '连接名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: IDSConnection) => (
        <Space>
          {getStatusIcon(record.status)}
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: '端点地址',
      dataIndex: 'endpoint',
      key: 'endpoint',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          CONNECTED: { color: 'success', text: '已连接' },
          DISCONNECTED: { color: 'default', text: '未连接' },
          ERROR: { color: 'error', text: '错误' },
          TESTING: { color: 'processing', text: '测试中' }
        };
        const config = statusMap[status as keyof typeof statusMap] || statusMap.DISCONNECTED;
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version'
    },
    {
      title: '最后同步',
      dataIndex: 'lastSync',
      key: 'lastSync',
      render: (time: string) => (
        <Tooltip title={moment(time).format('YYYY-MM-DD HH:mm:ss')}>
          <Text type="secondary">{moment(time).fromNow()}</Text>
        </Tooltip>
      )
    },
    {
      title: '同步状态',
      key: 'syncStatus',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>
            成功: {record.totalSynced - record.errorCount}
          </Text>
          <Text type="danger" style={{ fontSize: 12 }}>
            错误: {record.errorCount}
          </Text>
        </Space>
      )
    },
    {
      title: '自动同步',
      dataIndex: 'autoSync',
      key: 'autoSync',
      render: (autoSync: boolean) => (
        <Switch checked={autoSync} size="small" disabled />
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="测试连接">
            <Button 
              type="link" 
              icon={<ApiOutlined />}
              onClick={() => handleTestConnection(record)}
            />
          </Tooltip>
          <Tooltip title="手动同步">
            <Button 
              type="link" 
              icon={<SyncOutlined />}
              onClick={() => handleManualSync(record)}
              disabled={record.status !== 'CONNECTED'}
            />
          </Tooltip>
          <Tooltip title="配置">
            <Button 
              type="link" 
              icon={<SettingOutlined />}
              onClick={() => {
                setSelectedConnection(record);
                setConfigDrawerVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // 同步记录表格列
  const syncColumns: ColumnsType<SyncRecord> = [
    {
      title: '同步ID',
      dataIndex: 'id',
      key: 'id',
      width: 100
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap = {
          CASE_SYNC: { color: 'blue', text: '案件同步' },
          PROGRESS_SYNC: { color: 'green', text: '进度同步' },
          DOCUMENT_SYNC: { color: 'orange', text: '文档同步' },
          STATUS_SYNC: { color: 'purple', text: '状态同步' }
        };
        const config = typeMap[type as keyof typeof typeMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '方向',
      dataIndex: 'direction',
      key: 'direction',
      render: (direction: string) => {
        const directionMap = {
          PUSH: { icon: <UploadOutlined />, text: '推送' },
          PULL: { icon: <DownloadOutlined />, text: '拉取' },
          BIDIRECTIONAL: { icon: <SyncOutlined />, text: '双向' }
        };
        const config = directionMap[direction as keyof typeof directionMap];
        return (
          <Space>
            {config.icon}
            {config.text}
          </Space>
        );
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          SUCCESS: { color: 'success', text: '成功' },
          FAILED: { color: 'error', text: '失败' },
          PARTIAL: { color: 'warning', text: '部分成功' },
          PENDING: { color: 'processing', text: '进行中' }
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '记录数',
      key: 'records',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>总数: {record.totalRecords}</Text>
          <Text type="success" style={{ fontSize: 12 }}>成功: {record.successRecords}</Text>
          {record.failedRecords > 0 && (
            <Text type="danger" style={{ fontSize: 12 }}>失败: {record.failedRecords}</Text>
          )}
        </Space>
      )
    },
    {
      title: '耗时',
      key: 'duration',
      render: (_, record) => {
        if (!record.endTime) return '-';
        const duration = moment(record.endTime).diff(moment(record.startTime), 'seconds');
        return `${duration}秒`;
      }
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time: string) => moment(time).format('MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              type="link" 
              icon={<EyeOutlined />}
              onClick={() => {
                Modal.info({
                  title: '同步详情',
                  content: (
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="同步ID">{record.id}</Descriptions.Item>
                      <Descriptions.Item label="连接">{record.connectionId}</Descriptions.Item>
                      <Descriptions.Item label="类型">{record.type}</Descriptions.Item>
                      <Descriptions.Item label="状态">{record.status}</Descriptions.Item>
                      {record.errorMessage && (
                        <Descriptions.Item label="错误信息">{record.errorMessage}</Descriptions.Item>
                      )}
                    </Descriptions>
                  ),
                  width: 600
                });
              }}
            />
          </Tooltip>
          {record.status === 'FAILED' && (
            <Tooltip title="重试">
              <Button 
                type="link" 
                icon={<ReloadOutlined />}
                onClick={() => {
                  message.info('正在重试同步...');
                }}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="ids-integration-panel">
      {/* 概览统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃连接"
              value={connections.filter(c => c.status === 'CONNECTED').length}
              suffix={`/ ${connections.length}`}
              valueStyle={{ color: '#52c41a' }}
              prefix={<ApiOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日同步"
              value={syncRecords.filter(r => moment(r.startTime).isAfter(moment().startOf('day'))).length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<SyncOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="成功率"
              value={85.6}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="错误数"
              value={connections.reduce((sum, c) => sum + c.errorCount, 0)}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容 */}
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={4}>IDS系统集成管理</Title>
          </Col>
          <Col>
            <Space>
              <Button 
                type="primary" 
                icon={<ApiOutlined />}
                onClick={() => setConnectionModalVisible(true)}
              >
                新建连接
              </Button>
              <Button icon={<MonitorOutlined />}>
                监控面板
              </Button>
              <Button icon={<SettingOutlined />}>
                全局配置
              </Button>
            </Space>
          </Col>
        </Row>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="连接管理" key="connections">
            <Table
              columns={connectionColumns}
              dataSource={connections}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </TabPane>

          <TabPane tab="同步记录" key="sync-records">
            <Space style={{ marginBottom: 16 }}>
              <Button icon={<ReloadOutlined />} onClick={loadSyncRecords}>
                刷新
              </Button>
              <Button icon={<SyncOutlined />}>
                全量同步
              </Button>
            </Space>
            <Table
              columns={syncColumns}
              dataSource={syncRecords}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true
              }}
            />
          </TabPane>

          <TabPane tab="API端点" key="api-endpoints">
            <List
              itemLayout="horizontal"
              dataSource={apiEndpoints}
              renderItem={endpoint => (
                <List.Item
                  actions={[
                    <Switch 
                      checked={endpoint.enabled} 
                      onChange={(checked) => {
                        message.info(`${endpoint.name} ${checked ? '已启用' : '已禁用'}`);
                      }}
                    />,
                    <Button type="link" icon={<SettingOutlined />}>配置</Button>,
                    <Button type="link" icon={<MonitorOutlined />}>监控</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge 
                        status={endpoint.enabled ? 'success' : 'default'} 
                        dot
                      >
                        <Avatar icon={<ApiOutlined />} />
                      </Badge>
                    }
                    title={
                      <Space>
                        <Text strong>{endpoint.name}</Text>
                        <Tag color="blue">{endpoint.method}</Tag>
                        <Text code>{endpoint.path}</Text>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text>{endpoint.description}</Text>
                        <Space>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            请求: {endpoint.requestCount}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            错误率: {endpoint.errorRate}%
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            响应时间: {endpoint.avgResponseTime}ms
                          </Text>
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane tab="系统状态" key="system-status">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="系统健康度" size="small">
                  <Progress 
                    type="circle" 
                    percent={92} 
                    status="normal"
                    format={percent => `${percent}%`}
                  />
                  <Paragraph style={{ marginTop: 16, textAlign: 'center' }}>
                    系统运行正常
                  </Paragraph>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="实时状态" size="small">
                  <Timeline>
                    <Timeline.Item color="green">
                      <Text type="secondary">{moment().format('HH:mm')}</Text> 案件同步完成
                    </Timeline.Item>
                    <Timeline.Item color="blue">
                      <Text type="secondary">{moment().subtract(5, 'minutes').format('HH:mm')}</Text> 进度更新推送
                    </Timeline.Item>
                    <Timeline.Item color="orange">
                      <Text type="secondary">{moment().subtract(10, 'minutes').format('HH:mm')}</Text> 连接测试通过
                    </Timeline.Item>
                    <Timeline.Item>
                      <Text type="secondary">{moment().subtract(15, 'minutes').format('HH:mm')}</Text> 系统启动
                    </Timeline.Item>
                  </Timeline>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* 新建连接弹窗 */}
      <Modal
        title="新建IDS连接"
        visible={connectionModalVisible}
        onOk={() => {
          connectionForm.validateFields().then(values => {
            message.success('连接创建成功');
            setConnectionModalVisible(false);
            connectionForm.resetFields();
            loadConnections();
          });
        }}
        onCancel={() => {
          setConnectionModalVisible(false);
          connectionForm.resetFields();
        }}
        width={600}
      >
        <Form
          form={connectionForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="连接名称"
            rules={[{ required: true, message: '请输入连接名称' }]}
          >
            <Input placeholder="请输入连接名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea placeholder="请输入连接描述" />
          </Form.Item>
          <Form.Item
            name="endpoint"
            label="端点地址"
            rules={[{ required: true, message: '请输入端点地址' }]}
          >
            <Input placeholder="https://ids.example.com/api/v1" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="apiKey"
                label="API Key"
                rules={[{ required: true, message: '请输入API Key' }]}
              >
                <Input.Password placeholder="请输入API Key" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="secretKey"
                label="Secret Key"
                rules={[{ required: true, message: '请输入Secret Key' }]}
              >
                <Input.Password placeholder="请输入Secret Key" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="syncFrequency"
                label="同步频率(分钟)"
                initialValue={15}
              >
                <InputNumber min={1} max={1440} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="autoSync"
                label="自动同步"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 连接测试弹窗 */}
      <Modal
        title="连接测试"
        visible={testModalVisible}
        onOk={executeConnectionTest}
        onCancel={() => setTestModalVisible(false)}
        confirmLoading={loading}
      >
        <Alert
          message="连接测试"
          description={`即将测试与 "${selectedConnection?.name}" 的连接`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Descriptions bordered column={1}>
          <Descriptions.Item label="连接名称">
            {selectedConnection?.name}
          </Descriptions.Item>
          <Descriptions.Item label="端点地址">
            {selectedConnection?.endpoint}
          </Descriptions.Item>
          <Descriptions.Item label="当前状态">
            <Tag color={selectedConnection?.status === 'CONNECTED' ? 'success' : 'error'}>
              {selectedConnection?.status === 'CONNECTED' ? '已连接' : '未连接'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Modal>

      {/* 配置抽屉 */}
      <Drawer
        title="连接配置"
        placement="right"
        width={500}
        visible={configDrawerVisible}
        onClose={() => setConfigDrawerVisible(false)}
      >
        {selectedConnection && (
          <div>
            <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="名称">
                  {selectedConnection.name}
                </Descriptions.Item>
                <Descriptions.Item label="描述">
                  {selectedConnection.description}
                </Descriptions.Item>
                <Descriptions.Item label="端点">
                  {selectedConnection.endpoint}
                </Descriptions.Item>
                <Descriptions.Item label="版本">
                  {selectedConnection.version}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="同步配置" size="small" style={{ marginBottom: 16 }}>
              <Form layout="vertical" size="small">
                <Form.Item label="同步频率">
                  <InputNumber 
                    value={selectedConnection.syncFrequency}
                    min={1} 
                    max={1440} 
                    addonAfter="分钟"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item label="自动同步">
                  <Switch checked={selectedConnection.autoSync} />
                </Form.Item>
                <Form.Item label="同步范围">
                  <Select 
                    mode="multiple" 
                    value={selectedConnection.syncScope}
                    style={{ width: '100%' }}
                  >
                    <Option value="cases">案件数据</Option>
                    <Option value="progress">进度记录</Option>
                    <Option value="documents">文档资料</Option>
                    <Option value="status">状态更新</Option>
                  </Select>
                </Form.Item>
              </Form>
            </Card>

            <Card title="统计信息" size="small">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="总同步数"
                    value={selectedConnection.totalSynced}
                    valueStyle={{ fontSize: 16 }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="错误次数"
                    value={selectedConnection.errorCount}
                    valueStyle={{ fontSize: 16, color: '#ff4d4f' }}
                  />
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default IDSIntegrationPanel;