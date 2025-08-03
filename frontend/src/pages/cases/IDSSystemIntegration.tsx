import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Space, Modal, Form, Input, Select, DatePicker,
  Row, Col, Statistic, Tag, Badge, Alert, Upload, message, Tooltip,
  Typography, Divider, Tabs, Timeline, Switch, Steps, Progress, List,
  Spin, Empty, Descriptions, Drawer, Radio, Checkbox, InputNumber
} from 'antd';
import {
  ApiOutlined, SyncOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ExclamationCircleOutlined, SettingOutlined, EyeOutlined, EditOutlined,
  DeleteOutlined, PlusOutlined, ReloadOutlined, HistoryOutlined,
  CloudSyncOutlined, DatabaseOutlined, LinkOutlined, SecurityScanOutlined,
  BugOutlined, RocketOutlined, MonitorOutlined, BellOutlined, CodeOutlined,
  PlayCircleOutlined, PauseCircleOutlined, StopOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Step } = Steps;

// API接口状态枚举
const APIStatus = {
  ACTIVE: { text: '运行中', color: 'success' },
  INACTIVE: { text: '已停用', color: 'default' },
  ERROR: { text: '异常', color: 'error' },
  TESTING: { text: '测试中', color: 'processing' },
  MAINTENANCE: { text: '维护中', color: 'warning' }
};

// IDS系统接口定义
interface IDSApiInterface {
  id: number;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  status: string;
  lastSyncTime?: string;
  successRate: number;
  avgResponseTime: number;
  dailyCallCount: number;
  errorCount: number;
  dataMapping: {
    input: Record<string, any>;
    output: Record<string, any>;
  };
  authentication: {
    type: 'API_KEY' | 'OAUTH2' | 'BASIC' | 'JWT';
    config: Record<string, any>;
  };
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  retryPolicy: {
    maxRetries: number;
    backoffStrategy: 'LINEAR' | 'EXPONENTIAL';
  };
}

// 同步任务接口
interface SyncTask {
  id: number;
  taskName: string;
  taskType: 'CASE_DATA' | 'PROGRESS_UPDATE' | 'PAYMENT_RECORD' | 'STATUS_SYNC';
  sourceSystem: 'IDS' | 'DRMP';
  targetSystem: 'IDS' | 'DRMP';
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  scheduleType: 'MANUAL' | 'SCHEDULED' | 'REAL_TIME';
  scheduleConfig?: {
    cronExpression?: string;
    interval?: number; // 分钟
  };
  lastExecutionTime?: string;
  nextExecutionTime?: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  createdAt: string;
}

// API监控数据接口
interface ApiMonitorData {
  timestamp: string;
  responseTime: number;
  statusCode: number;
  success: boolean;
  errorMessage?: string;
  requestSize: number;
  responseSize: number;
}

/**
 * IDS系统集成管理页面
 */
const IDSSystemIntegration: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiInterfaces, setApiInterfaces] = useState<IDSApiInterface[]>([]);
  const [syncTasks, setSyncTasks] = useState<SyncTask[]>([]);
  const [monitorData, setMonitorData] = useState<ApiMonitorData[]>([]);
  const [selectedApi, setSelectedApi] = useState<IDSApiInterface | null>(null);
  const [selectedTask, setSelectedTask] = useState<SyncTask | null>(null);
  
  const [apiModalVisible, setApiModalVisible] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [monitorDrawerVisible, setMonitorDrawerVisible] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [configDrawerVisible, setConfigDrawerVisible] = useState(false);
  
  const [apiForm] = Form.useForm();
  const [taskForm] = Form.useForm();
  const [testForm] = Form.useForm();
  const [configForm] = Form.useForm();

  // 加载API接口列表
  const loadApiInterfaces = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟API接口数据
      const mockApis: IDSApiInterface[] = [
        {
          id: 1,
          name: '案件数据同步',
          endpoint: '/api/v1/cases/sync',
          method: 'POST',
          description: '同步案件基础数据到IDS系统',
          status: 'ACTIVE',
          lastSyncTime: '2024-01-20 14:30:00',
          successRate: 98.5,
          avgResponseTime: 245,
          dailyCallCount: 1256,
          errorCount: 18,
          dataMapping: {
            input: {
              caseId: 'string',
              debtorInfo: 'object',
              loanInfo: 'object'
            },
            output: {
              syncResult: 'boolean',
              idsId: 'string',
              message: 'string'
            }
          },
          authentication: {
            type: 'API_KEY',
            config: {
              keyName: 'X-API-Key',
              keyValue: '***hidden***'
            }
          },
          rateLimit: {
            requestsPerMinute: 100,
            requestsPerHour: 5000
          },
          retryPolicy: {
            maxRetries: 3,
            backoffStrategy: 'EXPONENTIAL'
          }
        },
        {
          id: 2,
          name: '处置进展更新',
          endpoint: '/api/v1/progress/update',
          method: 'PUT',
          description: '更新案件处置进展信息',
          status: 'ACTIVE',
          lastSyncTime: '2024-01-20 15:45:00',
          successRate: 95.2,
          avgResponseTime: 189,
          dailyCallCount: 856,
          errorCount: 41,
          dataMapping: {
            input: {
              caseId: 'string',
              progressType: 'string',
              progressContent: 'string',
              attachments: 'array'
            },
            output: {
              updateResult: 'boolean',
              progressId: 'string'
            }
          },
          authentication: {
            type: 'JWT',
            config: {
              tokenEndpoint: '/oauth/token',
              clientId: 'drmp_client'
            }
          },
          rateLimit: {
            requestsPerMinute: 60,
            requestsPerHour: 3000
          },
          retryPolicy: {
            maxRetries: 5,
            backoffStrategy: 'LINEAR'
          }
        },
        {
          id: 3,
          name: '回款记录同步',
          endpoint: '/api/v1/payments/sync',
          method: 'POST',
          description: '同步回款记录到IDS系统',
          status: 'ERROR',
          lastSyncTime: '2024-01-20 12:15:00',
          successRate: 87.3,
          avgResponseTime: 312,
          dailyCallCount: 423,
          errorCount: 54,
          dataMapping: {
            input: {
              caseId: 'string',
              paymentAmount: 'number',
              paymentDate: 'string',
              paymentMethod: 'string'
            },
            output: {
              syncResult: 'boolean',
              paymentId: 'string'
            }
          },
          authentication: {
            type: 'OAUTH2',
            config: {
              authUrl: '/oauth/authorize',
              tokenUrl: '/oauth/token',
              scope: 'payment.write'
            }
          },
          rateLimit: {
            requestsPerMinute: 30,
            requestsPerHour: 1500
          },
          retryPolicy: {
            maxRetries: 3,
            backoffStrategy: 'EXPONENTIAL'
          }
        }
      ];

      setApiInterfaces(mockApis);
    } catch (error) {
      message.error('加载API接口失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 加载同步任务列表
  const loadSyncTasks = async () => {
    try {
      // 模拟同步任务数据
      const mockTasks: SyncTask[] = [
        {
          id: 1,
          taskName: '每日案件数据同步',
          taskType: 'CASE_DATA',
          sourceSystem: 'DRMP',
          targetSystem: 'IDS',
          status: 'SUCCESS',
          scheduleType: 'SCHEDULED',
          scheduleConfig: {
            cronExpression: '0 2 * * *', // 每天凌晨2点
          },
          lastExecutionTime: '2024-01-20 02:00:00',
          nextExecutionTime: '2024-01-21 02:00:00',
          executionCount: 45,
          successCount: 43,
          failureCount: 2,
          createdAt: '2024-01-01 10:00:00'
        },
        {
          id: 2,
          taskName: '实时进展状态同步',
          taskType: 'PROGRESS_UPDATE',
          sourceSystem: 'IDS',
          targetSystem: 'DRMP',
          status: 'RUNNING',
          scheduleType: 'REAL_TIME',
          lastExecutionTime: '2024-01-20 15:30:00',
          executionCount: 2567,
          successCount: 2445,
          failureCount: 122,
          createdAt: '2024-01-01 10:00:00'
        },
        {
          id: 3,
          taskName: '回款记录同步',
          taskType: 'PAYMENT_RECORD',
          sourceSystem: 'IDS',
          targetSystem: 'DRMP',
          status: 'FAILED',
          scheduleType: 'SCHEDULED',
          scheduleConfig: {
            interval: 60 // 每小时
          },
          lastExecutionTime: '2024-01-20 14:00:00',
          nextExecutionTime: '2024-01-20 15:00:00',
          executionCount: 234,
          successCount: 198,
          failureCount: 36,
          createdAt: '2024-01-01 10:00:00'
        }
      ];

      setSyncTasks(mockTasks);
    } catch (error) {
      console.error('Failed to load sync tasks:', error);
    }
  };

  useEffect(() => {
    loadApiInterfaces();
    loadSyncTasks();
  }, []);

  // 测试API接口
  const handleTestApi = async (api: IDSApiInterface) => {
    setSelectedApi(api);
    setTestModalVisible(true);
  };

  // 执行API测试
  const executeApiTest = async (values: any) => {
    if (!selectedApi) return;

    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟测试结果
      const testResult = {
        success: Math.random() > 0.2,
        responseTime: Math.floor(Math.random() * 500) + 100,
        statusCode: Math.random() > 0.2 ? 200 : 500,
        response: {
          result: 'success',
          data: 'Test data response'
        }
      };

      if (testResult.success) {
        message.success(`API测试成功 - 响应时间: ${testResult.responseTime}ms`);
      } else {
        message.error(`API测试失败 - 状态码: ${testResult.statusCode}`);
      }

      setTestModalVisible(false);
      testForm.resetFields();
    } catch (error) {
      message.error('API测试执行失败');
    } finally {
      setLoading(false);
    }
  };

  // 启动/停止同步任务
  const handleTaskControl = async (task: SyncTask, action: 'start' | 'stop' | 'restart') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let newStatus: SyncTask['status'];
      switch (action) {
        case 'start':
          newStatus = 'RUNNING';
          break;
        case 'stop':
          newStatus = 'CANCELLED';
          break;
        case 'restart':
          newStatus = 'RUNNING';
          break;
        default:
          return;
      }

      const updatedTasks = syncTasks.map(t => 
        t.id === task.id ? { ...t, status: newStatus } : t
      );
      
      setSyncTasks(updatedTasks);
      message.success(`任务${action === 'start' ? '启动' : action === 'stop' ? '停止' : '重启'}成功`);
    } catch (error) {
      message.error(`任务${action === 'start' ? '启动' : action === 'stop' ? '停止' : '重启'}失败`);
    }
  };

  // 手动执行同步任务
  const handleManualSync = async (task: SyncTask) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const updatedTasks = syncTasks.map(t => 
        t.id === task.id 
          ? { 
              ...t, 
              status: 'SUCCESS' as const,
              lastExecutionTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              executionCount: t.executionCount + 1,
              successCount: t.successCount + 1
            }
          : t
      );
      
      setSyncTasks(updatedTasks);
      message.success('手动同步执行成功');
    } catch (error) {
      message.error('手动同步执行失败');
    } finally {
      setLoading(false);
    }
  };

  // API接口表格列定义
  const apiColumns: ColumnsType<IDSApiInterface> = [
    {
      title: 'API接口',
      key: 'apiInfo',
      width: 250,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
            <ApiOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            {record.name}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: 2 }}>
            <Tag color="blue">{record.method}</Tag>
            {record.endpoint}
          </div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {record.description}
          </div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => {
        const config = APIStatus[status as keyof typeof APIStatus];
        return (
          <Badge status={config?.color as any} text={config?.text} />
        );
      }
    },
    {
      title: '性能指标',
      key: 'performance',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px', marginBottom: 2 }}>
            成功率: <span style={{ color: '#52c41a' }}>{record.successRate}%</span>
          </div>
          <div style={{ fontSize: '12px', marginBottom: 2 }}>
            响应时间: <span style={{ color: '#1890ff' }}>{record.avgResponseTime}ms</span>
          </div>
          <div style={{ fontSize: '12px' }}>
            调用次数: <span style={{ color: '#722ed1' }}>{record.dailyCallCount}</span>
          </div>
        </div>
      )
    },
    {
      title: '最后同步',
      dataIndex: 'lastSyncTime',
      width: 120,
      render: (time?: string) => time ? dayjs(time).format('MM-DD HH:mm') : '-'
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="测试接口">
            <Button 
              type="text" 
              size="small" 
              icon={<PlayCircleOutlined />}
              onClick={() => handleTestApi(record)}
            />
          </Tooltip>
          <Tooltip title="查看监控">
            <Button 
              type="text" 
              size="small" 
              icon={<MonitorOutlined />}
              onClick={() => {
                setSelectedApi(record);
                setMonitorDrawerVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="接口配置">
            <Button 
              type="text" 
              size="small" 
              icon={<SettingOutlined />}
              onClick={() => {
                setSelectedApi(record);
                setConfigDrawerVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedApi(record);
                apiForm.setFieldsValue(record);
                setApiModalVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // 同步任务表格列定义
  const taskColumns: ColumnsType<SyncTask> = [
    {
      title: '任务信息',
      key: 'taskInfo',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
            <CloudSyncOutlined style={{ marginRight: 8, color: '#52c41a' }} />
            {record.taskName}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.sourceSystem} → {record.targetSystem}
          </div>
        </div>
      )
    },
    {
      title: '任务类型',
      dataIndex: 'taskType',
      width: 100,
      render: (type: string) => {
        const typeMap = {
          CASE_DATA: { text: '案件数据', color: 'blue' },
          PROGRESS_UPDATE: { text: '进展更新', color: 'green' },
          PAYMENT_RECORD: { text: '回款记录', color: 'orange' },
          STATUS_SYNC: { text: '状态同步', color: 'purple' }
        };
        const config = typeMap[type as keyof typeof typeMap];
        return <Tag color={config?.color}>{config?.text}</Tag>;
      }
    },
    {
      title: '执行方式',
      dataIndex: 'scheduleType',
      width: 100,
      render: (type: string) => {
        const scheduleMap = {
          MANUAL: { text: '手动', color: 'default' },
          SCHEDULED: { text: '定时', color: 'blue' },
          REAL_TIME: { text: '实时', color: 'green' }
        };
        const config = scheduleMap[type as keyof typeof scheduleMap];
        return <Tag color={config?.color}>{config?.text}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          PENDING: { text: '等待中', color: 'default' },
          RUNNING: { text: '运行中', color: 'processing' },
          SUCCESS: { text: '成功', color: 'success' },
          FAILED: { text: '失败', color: 'error' },
          CANCELLED: { text: '已取消', color: 'warning' }
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Badge status={config?.color as any} text={config?.text} />;
      }
    },
    {
      title: '执行统计',
      key: 'execution',
      width: 120,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px', marginBottom: 2 }}>
            总次数: {record.executionCount}
          </div>
          <div style={{ fontSize: '12px', marginBottom: 2 }}>
            成功: <span style={{ color: '#52c41a' }}>{record.successCount}</span>
          </div>
          <div style={{ fontSize: '12px' }}>
            失败: <span style={{ color: '#f5222d' }}>{record.failureCount}</span>
          </div>
        </div>
      )
    },
    {
      title: '最后执行',
      dataIndex: 'lastExecutionTime',
      width: 120,
      render: (time?: string) => time ? dayjs(time).format('MM-DD HH:mm') : '-'
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'RUNNING' ? (
            <Tooltip title="停止任务">
              <Button 
                type="text" 
                size="small" 
                icon={<PauseCircleOutlined />}
                onClick={() => handleTaskControl(record, 'stop')}
              />
            </Tooltip>
          ) : (
            <Tooltip title="启动任务">
              <Button 
                type="text" 
                size="small" 
                icon={<PlayCircleOutlined />}
                onClick={() => handleTaskControl(record, 'start')}
              />
            </Tooltip>
          )}
          <Tooltip title="手动执行">
            <Button 
              type="text" 
              size="small" 
              icon={<ThunderboltOutlined />}
              onClick={() => handleManualSync(record)}
              loading={loading}
            />
          </Tooltip>
          <Tooltip title="重启任务">
            <Button 
              type="text" 
              size="small" 
              icon={<ReloadOutlined />}
              onClick={() => handleTaskControl(record, 'restart')}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedTask(record);
                taskForm.setFieldsValue(record);
                setTaskModalVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="ids-system-integration">
      {/* 页面头部 */}
      <Card style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <ApiOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              IDS系统集成
            </Title>
            <Text type="secondary">智调系统API接口管理、数据同步、监控告警</Text>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<ReloadOutlined />}
                onClick={() => {
                  loadApiInterfaces();
                  loadSyncTasks();
                }}
                loading={loading}
              >
                刷新
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedApi(null);
                  apiForm.resetFields();
                  setApiModalVisible(true);
                }}
              >
                新增接口
              </Button>
              <Button
                type="primary"
                ghost
                icon={<CloudSyncOutlined />}
                onClick={() => {
                  setSelectedTask(null);
                  taskForm.resetFields();
                  setTaskModalVisible(true);
                }}
              >
                新增任务
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 系统状态概览 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="API接口总数"
              value={apiInterfaces.length}
              suffix="个"
              valueStyle={{ color: '#1890ff' }}
              prefix={<ApiOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="运行中任务"
              value={syncTasks.filter(t => t.status === 'RUNNING').length}
              suffix="个"
              valueStyle={{ color: '#52c41a' }}
              prefix={<CloudSyncOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日同步次数"
              value={syncTasks.reduce((sum, t) => sum + t.executionCount, 0)}
              suffix="次"
              valueStyle={{ color: '#722ed1' }}
              prefix={<SyncOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均成功率"
              value={apiInterfaces.reduce((sum, api) => sum + api.successRate, 0) / apiInterfaces.length || 0}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#13c2c2' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容 */}
      <Tabs defaultActiveKey="apis">
        <TabPane tab="API接口管理" key="apis">
          <Card>
            <Table
              loading={loading}
              dataSource={apiInterfaces}
              columns={apiColumns}
              rowKey="id"
              scroll={{ x: 1200 }}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="同步任务管理" key="tasks">
          <Card>
            <Table
              loading={loading}
              dataSource={syncTasks}
              columns={taskColumns}
              rowKey="id"
              scroll={{ x: 1200 }}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="系统监控" key="monitor">
          <Row gutter={16}>
            <Col span={24}>
              <Card title="接口调用监控">
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <MonitorOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                    <div>接口调用监控图表</div>
                    <div style={{ color: '#666', fontSize: '12px' }}>（监控图表组件集成中）</div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="日志记录" key="logs">
          <Card title="系统日志">
            <Timeline>
              <Timeline.Item color="green">
                <p>案件数据同步成功</p>
                <p style={{ fontSize: '12px', color: '#666' }}>2024-01-20 15:30:00 | 同步1234条案件数据</p>
              </Timeline.Item>
              <Timeline.Item color="red">
                <p>回款记录同步失败</p>
                <p style={{ fontSize: '12px', color: '#666' }}>2024-01-20 15:25:00 | 连接超时错误</p>
              </Timeline.Item>
              <Timeline.Item color="blue">
                <p>API接口测试完成</p>
                <p style={{ fontSize: '12px', color: '#666' }}>2024-01-20 15:20:00 | 所有接口测试通过</p>
              </Timeline.Item>
            </Timeline>
          </Card>
        </TabPane>
      </Tabs>

      {/* API测试弹窗 */}
      <Modal
        title="API接口测试"
        open={testModalVisible}
        onCancel={() => setTestModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedApi && (
          <div>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="接口名称">{selectedApi.name}</Descriptions.Item>
              <Descriptions.Item label="请求方法">{selectedApi.method}</Descriptions.Item>
              <Descriptions.Item label="接口地址" span={2}>{selectedApi.endpoint}</Descriptions.Item>
            </Descriptions>

            <Form
              form={testForm}
              layout="vertical"
              onFinish={executeApiTest}
            >
              <Form.Item
                name="testData"
                label="测试数据"
                rules={[{ required: true, message: '请输入测试数据' }]}
              >
                <TextArea
                  rows={6}
                  placeholder='请输入JSON格式的测试数据，例如：&#10;{&#10;  "caseId": "12345",&#10;  "debtorName": "张三"&#10;}'
                />
              </Form.Item>

              <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                <Space>
                  <Button onClick={() => setTestModalVisible(false)}>
                    取消
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    执行测试
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* API配置抽屉 */}
      <Drawer
        title="API接口配置"
        placement="right"
        onClose={() => setConfigDrawerVisible(false)}
        open={configDrawerVisible}
        width={600}
      >
        {selectedApi && (
          <Tabs defaultActiveKey="auth">
            <TabPane tab="认证配置" key="auth">
              <Form layout="vertical">
                <Form.Item label="认证类型">
                  <Select value={selectedApi.authentication.type}>
                    <Option value="API_KEY">API Key</Option>
                    <Option value="OAUTH2">OAuth 2.0</Option>
                    <Option value="JWT">JWT Token</Option>
                    <Option value="BASIC">Basic Auth</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="配置信息">
                  <TextArea
                    rows={4}
                    value={JSON.stringify(selectedApi.authentication.config, null, 2)}
                    readOnly
                  />
                </Form.Item>
              </Form>
            </TabPane>
            
            <TabPane tab="限流配置" key="rateLimit">
              <Form layout="vertical">
                <Form.Item label="每分钟请求数">
                  <InputNumber
                    value={selectedApi.rateLimit.requestsPerMinute}
                    min={1}
                    max={1000}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item label="每小时请求数">
                  <InputNumber
                    value={selectedApi.rateLimit.requestsPerHour}
                    min={1}
                    max={50000}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Form>
            </TabPane>
            
            <TabPane tab="重试策略" key="retry">
              <Form layout="vertical">
                <Form.Item label="最大重试次数">
                  <InputNumber
                    value={selectedApi.retryPolicy.maxRetries}
                    min={0}
                    max={10}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item label="退避策略">
                  <Select value={selectedApi.retryPolicy.backoffStrategy}>
                    <Option value="LINEAR">线性退避</Option>
                    <Option value="EXPONENTIAL">指数退避</Option>
                  </Select>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        )}
      </Drawer>
    </div>
  );
};

export default IDSSystemIntegration;