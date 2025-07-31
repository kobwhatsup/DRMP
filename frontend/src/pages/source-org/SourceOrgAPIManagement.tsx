import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Button, Space, Table, Tag, 
  Tabs, Alert, Spin, message, Modal, Form, Input, Select,
  Badge, Timeline, Progress, Descriptions, Switch, Tooltip
} from 'antd';
import {
  ApiOutlined, CheckCircleOutlined, WarningOutlined, CloseCircleOutlined,
  ReloadOutlined, SettingOutlined, EyeOutlined, CodeOutlined,
  ClockCircleOutlined, ThunderboltOutlined, BugOutlined,
  SafetyCertificateOutlined, SyncOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { Line, Column } from '@ant-design/plots';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

// 数据接口定义
interface APIManagementData {
  summary: {
    totalAPIs: number;
    onlineAPIs: number;
    offlineAPIs: number;
    errorAPIs: number;
    avgResponseTime: number;
    successRate: number;
    todayCallCount: number;
  };
  apiStatusTrend: Array<{
    time: string;
    successRate: number;
    responseTime: number;
    errorCount: number;
  }>;
  orgAPIList: Array<{
    orgId: number;
    orgName: string;
    orgType: string;
    apiStatus: 'ONLINE' | 'OFFLINE' | 'ERROR' | 'MAINTENANCE';
    lastSyncTime: string;
    totalCalls: number;
    successRate: number;
    avgResponseTime: number;
    errorCount: number;
    apiVersion: string;
    healthScore: number;
    endpoints: Array<{
      name: string;
      method: string;
      status: string;
      responseTime: number;
      lastCall: string;
    }>;
  }>;
  apiCallStats: Array<{
    endpoint: string;
    calls: number;
    success: number;
    failed: number;
    avgResponseTime: number;
  }>;
  errorDistribution: Array<{
    errorType: string;
    count: number;
    percentage: number;
  }>;
  systemMonitoring: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
  };
}

const SourceOrgAPIManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState<APIManagementData | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrgType, setSelectedOrgType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    loadAPIData();
    
    if (autoRefresh) {
      const interval = setInterval(loadAPIData, 30000); // 30秒刷新
      return () => clearInterval(interval);
    }
  }, [selectedStatus, selectedOrgType, autoRefresh]);

  const loadAPIData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockData: APIManagementData = {
        summary: {
          totalAPIs: 45,
          onlineAPIs: 38,
          offlineAPIs: 4,
          errorAPIs: 3,
          avgResponseTime: 156,
          successRate: 98.5,
          todayCallCount: 12580
        },
        apiStatusTrend: [
          { time: '00:00', successRate: 98.2, responseTime: 145, errorCount: 12 },
          { time: '04:00', successRate: 98.8, responseTime: 134, errorCount: 8 },
          { time: '08:00', successRate: 97.9, responseTime: 167, errorCount: 15 },
          { time: '12:00', successRate: 98.5, responseTime: 156, errorCount: 9 },
          { time: '16:00', successRate: 98.1, responseTime: 162, errorCount: 11 },
          { time: '20:00', successRate: 98.7, responseTime: 149, errorCount: 7 }
        ],
        orgAPIList: [
          {
            orgId: 1, orgName: '中国工商银行', orgType: 'BANK',
            apiStatus: 'ONLINE', lastSyncTime: '2024-07-30 10:30:00',
            totalCalls: 2856, successRate: 99.2, avgResponseTime: 125, errorCount: 23,
            apiVersion: 'v2.1', healthScore: 95,
            endpoints: [
              { name: '案件数据推送', method: 'POST', status: 'ONLINE', responseTime: 125, lastCall: '2024-07-30 10:30:00' },
              { name: '状态回调', method: 'POST', status: 'ONLINE', responseTime: 89, lastCall: '2024-07-30 10:25:00' },
              { name: '文件上传', method: 'POST', status: 'ONLINE', responseTime: 234, lastCall: '2024-07-30 10:20:00' },
              { name: '进度查询', method: 'GET', status: 'ONLINE', responseTime: 67, lastCall: '2024-07-30 10:15:00' }
            ]
          },
          {
            orgId: 2, orgName: '招商银行', orgType: 'BANK',
            apiStatus: 'ONLINE', lastSyncTime: '2024-07-30 09:45:00',
            totalCalls: 2134, successRate: 98.8, avgResponseTime: 142, errorCount: 25,
            apiVersion: 'v2.0', healthScore: 92,
            endpoints: [
              { name: '案件数据推送', method: 'POST', status: 'ONLINE', responseTime: 142, lastCall: '2024-07-30 09:45:00' },
              { name: '状态回调', method: 'POST', status: 'ONLINE', responseTime: 98, lastCall: '2024-07-30 09:40:00' },
              { name: '进度查询', method: 'GET', status: 'ONLINE', responseTime: 75, lastCall: '2024-07-30 09:35:00' }
            ]
          },
          {
            orgId: 3, orgName: '平安普惠', orgType: 'CONSUMER_FINANCE',
            apiStatus: 'ERROR', lastSyncTime: '2024-07-30 08:20:00',
            totalCalls: 1567, successRate: 96.3, avgResponseTime: 189, errorCount: 58,
            apiVersion: 'v1.8', healthScore: 78,
            endpoints: [
              { name: '案件数据推送', method: 'POST', status: 'ERROR', responseTime: 0, lastCall: '2024-07-30 08:20:00' },
              { name: '状态回调', method: 'POST', status: 'ONLINE', responseTime: 156, lastCall: '2024-07-30 08:15:00' }
            ]
          },
          {
            orgId: 4, orgName: '蚂蚁借呗', orgType: 'ONLINE_LOAN',
            apiStatus: 'OFFLINE', lastSyncTime: '2024-07-29 16:00:00',
            totalCalls: 892, successRate: 94.1, avgResponseTime: 0, errorCount: 52,
            apiVersion: 'v1.5', healthScore: 65,
            endpoints: [
              { name: '案件数据推送', method: 'POST', status: 'OFFLINE', responseTime: 0, lastCall: '2024-07-29 16:00:00' },
              { name: '状态回调', method: 'POST', status: 'OFFLINE', responseTime: 0, lastCall: '2024-07-29 15:55:00' }
            ]
          }
        ],
        apiCallStats: [
          { endpoint: '案件数据推送', calls: 4580, success: 4512, failed: 68, avgResponseTime: 145 },
          { endpoint: '状态回调', calls: 3920, success: 3876, failed: 44, avgResponseTime: 98 },
          { endpoint: '文件上传', calls: 2340, success: 2298, failed: 42, avgResponseTime: 256 },
          { endpoint: '进度查询', calls: 1870, success: 1845, failed: 25, avgResponseTime: 67 }
        ],
        errorDistribution: [
          { errorType: '连接超时', count: 89, percentage: 37.2 },
          { errorType: '认证失败', count: 67, percentage: 28.0 },
          { errorType: '数据格式错误', count: 45, percentage: 18.8 },
          { errorType: '服务不可用', count: 23, percentage: 9.6 },
          { errorType: '其他错误', count: 15, percentage: 6.4 }
        ],
        systemMonitoring: {
          cpuUsage: 68,
          memoryUsage: 72,
          diskUsage: 45,
          networkLatency: 23
        }
      };
      
      setApiData(mockData);
    } catch (error) {
      console.error('加载API数据失败:', error);
      message.error('加载API数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAPIConfig = (record: any) => {
    setSelectedOrg(record);
    form.setFieldsValue({
      orgName: record.orgName,
      apiVersion: record.apiVersion,
      timeout: 30000,
      retryCount: 3
    });
    setConfigModalVisible(true);
  };

  const handleAPITest = (record: any) => {
    setSelectedOrg(record);
    setTestModalVisible(true);
  };

  const handleResetAPI = (record: any) => {
    Modal.confirm({
      title: '重置API连接',
      content: `确定要重置"${record.orgName}"的API连接吗？`,
      onOk: async () => {
        try {
          // API调用
          message.success('API连接已重置');
          loadAPIData();
        } catch (error) {
          message.error('重置失败');
        }
      }
    });
  };

  const handleConfigSubmit = async () => {
    try {
      const values = await form.validateFields();
      // API调用
      message.success('API配置已更新');
      setConfigModalVisible(false);
      form.resetFields();
      loadAPIData();
    } catch (error) {
      message.error('配置失败');
    }
  };

  const handleTestAPI = () => {
    // 模拟API测试
    message.loading('正在测试API连接...', 2.5);
    setTimeout(() => {
      message.success('API测试成功');
      setTestModalVisible(false);
    }, 2500);
  };

  // API状态趋势图配置
  const statusTrendConfig = {
    data: apiData?.apiStatusTrend || [],
    xField: 'time',
    yField: 'successRate',
    height: 300,
    point: {
      size: 5,
      shape: 'diamond',
    },
    color: '#52c41a',
    smooth: true,
    yAxis: {
      min: 95,
      max: 100,
    },
  };

  // API调用统计图配置
  const callStatsConfig = {
    data: apiData?.apiCallStats || [],
    xField: 'endpoint',
    yField: 'calls',
    height: 300,
    color: '#1890ff',
    label: {
      position: 'top' as const,
      style: {
        fill: '#333333',
        fontSize: 12,
        fontWeight: 'bold',
      },
    },
  };

  // 错误分布图配置
  const errorDistributionConfig = {
    data: apiData?.errorDistribution || [],
    xField: 'errorType',
    yField: 'count',
    height: 300,
    color: '#ff7875',
    label: {
      position: 'top' as const,
      style: {
        fill: '#333333',
        fontSize: 12,
        fontWeight: 'bold',
      },
    },
  };

  // 机构API列表表格配置
  const orgAPIColumns: ColumnsType<any> = [
    {
      title: '机构信息',
      key: 'orgInfo',
      width: 200,
      fixed: 'left',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{record.orgName}</div>
          <Tag>{record.orgType === 'BANK' ? '银行' : record.orgType === 'CONSUMER_FINANCE' ? '消金' : '网贷'}</Tag>
          <Tag style={{ marginLeft: 4 }}>v{record.apiVersion}</Tag>
        </div>
      ),
    },
    {
      title: 'API状态',
      dataIndex: 'apiStatus',
      key: 'apiStatus',
      width: 120,
      render: (status: string) => {
        const statusMap: Record<string, { name: string; color: string; icon: React.ReactNode }> = {
          'ONLINE': { name: '在线', color: 'green', icon: <CheckCircleOutlined /> },
          'OFFLINE': { name: '离线', color: 'default', icon: <CloseCircleOutlined /> },
          'ERROR': { name: '异常', color: 'red', icon: <WarningOutlined /> },
          'MAINTENANCE': { name: '维护中', color: 'orange', icon: <SyncOutlined spin /> },
        };
        const config = statusMap[status] || { name: status, color: 'default', icon: null };
        return (
          <Tag color={config.color}>
            {config.icon} {config.name}
          </Tag>
        );
      },
    },
    {
      title: '健康评分',
      dataIndex: 'healthScore',
      key: 'healthScore',
      width: 120,
      render: (score: number) => (
        <div>
          <div style={{ 
            fontWeight: 'bold',
            color: score >= 90 ? '#52c41a' : score >= 70 ? '#faad14' : '#ff4d4f'
          }}>
            {score}
          </div>
          <Progress 
            percent={score} 
           
            strokeColor={score >= 90 ? '#52c41a' : score >= 70 ? '#faad14' : '#ff4d4f'}
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      key: 'successRate',
      width: 100,
      render: (rate: number) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{rate}%</div>
          <Progress 
            percent={rate} 
           
            strokeColor={rate >= 98 ? '#52c41a' : rate >= 95 ? '#faad14' : '#ff4d4f'}
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: '响应时间',
      dataIndex: 'avgResponseTime',
      key: 'avgResponseTime',
      width: 100,
      render: (time: number) => (
        <span style={{
          color: time <= 100 ? '#52c41a' : time <= 200 ? '#faad14' : '#ff4d4f'
        }}>
          {time}ms
        </span>
      ),
    },
    {
      title: '调用次数',
      dataIndex: 'totalCalls',
      key: 'totalCalls',
      width: 100,
      render: (calls: number) => calls.toLocaleString(),
    },
    {
      title: '错误次数',
      dataIndex: 'errorCount',
      key: 'errorCount',
      width: 100,
      render: (count: number) => (
        <span style={{ color: count > 50 ? '#ff4d4f' : count > 20 ? '#faad14' : '#52c41a' }}>
          {count}
        </span>
      ),
    },
    {
      title: '最后同步',
      dataIndex: 'lastSyncTime',
      key: 'lastSyncTime',
      width: 150,
      render: (time: string) => (
        <Tooltip title={time}>
          {dayjs(time).fromNow()}
        </Tooltip>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space direction="vertical">
          <Space>
            <Button icon={<EyeOutlined />} onClick={() => handleAPITest(record)}>
              测试
            </Button>
            <Button icon={<SettingOutlined />} onClick={() => handleAPIConfig(record)}>
              配置
            </Button>
          </Space>
          <Button 
            
            icon={<ReloadOutlined />}
            onClick={() => handleResetAPI(record)}
          >
            重置
          </Button>
        </Space>
      ),
    },
  ];

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'ONLINE': 'green',
      'OFFLINE': 'default',
      'ERROR': 'red',
      'MAINTENANCE': 'orange'
    };
    return statusMap[status] || 'default';
  };

  return (
    <div className="source-org-api-management">
      <Card title="案源机构API对接管理" bordered={false}>
        {/* 筛选条件和控制面板 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={4}>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: '100%' }}
              placeholder="API状态"
            >
              <Option value="all">全部状态</Option>
              <Option value="ONLINE">在线</Option>
              <Option value="OFFLINE">离线</Option>
              <Option value="ERROR">异常</Option>
              <Option value="MAINTENANCE">维护中</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              value={selectedOrgType}
              onChange={setSelectedOrgType}
              style={{ width: '100%' }}
              placeholder="机构类型"
            >
              <Option value="all">全部类型</Option>
              <Option value="BANK">银行</Option>
              <Option value="CONSUMER_FINANCE">消费金融</Option>
              <Option value="ONLINE_LOAN">网络贷款</Option>
            </Select>
          </Col>
          <Col span={16}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={loadAPIData} loading={loading}>
                刷新
              </Button>
              <Button icon={<CodeOutlined />} type="primary">
                API文档
              </Button>
              <span style={{ marginLeft: 16, color: '#666', fontSize: 12 }}>
                自动刷新: 
                <Switch 
                 
                  checked={autoRefresh}
                  onChange={setAutoRefresh}
                  style={{ marginLeft: 8 }}
                />
              </span>
            </Space>
          </Col>
        </Row>

        <Spin spinning={loading}>
          {/* 概览统计 */}
          {apiData && (
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="API总数"
                    value={apiData.summary.totalAPIs}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<ApiOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="在线API"
                    value={apiData.summary.onlineAPIs}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="离线API"
                    value={apiData.summary.offlineAPIs}
                    valueStyle={{ color: '#faad14' }}
                    prefix={<CloseCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="异常API"
                    value={apiData.summary.errorAPIs}
                    valueStyle={{ color: '#ff4d4f' }}
                    prefix={<WarningOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="平均响应时间"
                    value={apiData.summary.avgResponseTime}
                    suffix="ms"
                    valueStyle={{ color: '#722ed1' }}
                    prefix={<ThunderboltOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="成功率"
                    value={apiData.summary.successRate}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: '#13c2c2' }}
                    prefix={<SafetyCertificateOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          )}

          {/* 主要内容区域 */}
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="API概览" key="overview">
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="API成功率趋势">
                    <Line {...statusTrendConfig} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="API调用统计">
                    <Column {...callStatsConfig} />
                  </Card>
                </Col>
              </Row>
              
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={12}>
                  <Card title="错误类型分布">
                    <Column {...errorDistributionConfig} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="系统监控">
                    <Row gutter={16}>
                      <Col span={12}>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ marginBottom: 8 }}>CPU使用率</div>
                          <Progress 
                            percent={apiData?.systemMonitoring.cpuUsage || 0} 
                            strokeColor={(apiData?.systemMonitoring.cpuUsage || 0) > 80 ? '#ff4d4f' : '#52c41a'}
                          />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ marginBottom: 8 }}>内存使用率</div>
                          <Progress 
                            percent={apiData?.systemMonitoring.memoryUsage || 0}
                            strokeColor={(apiData?.systemMonitoring.memoryUsage || 0) > 80 ? '#ff4d4f' : '#52c41a'}
                          />
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ marginBottom: 8 }}>磁盘使用率</div>
                          <Progress 
                            percent={apiData?.systemMonitoring.diskUsage || 0}
                            strokeColor={(apiData?.systemMonitoring.diskUsage || 0) > 80 ? '#ff4d4f' : '#52c41a'}
                          />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ marginBottom: 8 }}>网络延迟: {apiData?.systemMonitoring.networkLatency}ms</div>
                          <Progress 
                            percent={(apiData?.systemMonitoring.networkLatency || 0) / 100 * 100} 
                            strokeColor={(apiData?.systemMonitoring.networkLatency || 0) > 50 ? '#ff4d4f' : '#52c41a'}
                            showInfo={false}
                          />
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="机构API" key="orgApi">
              <Card title="机构API状态">
                <Table
                  columns={orgAPIColumns}
                  dataSource={apiData?.orgAPIList || []}
                  rowKey="orgId"
                  scroll={{ x: 1200 }}
                 
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
                  }}
                />
              </Card>
            </TabPane>

            <TabPane tab="端点监控" key="endpoints">
              <Card title="API端点详情">
                <Table
                  columns={[
                    { title: '端点名称', dataIndex: 'endpoint', key: 'endpoint' },
                    { 
                      title: '调用次数', 
                      dataIndex: 'calls', 
                      key: 'calls',
                      render: (calls: number) => calls.toLocaleString()
                    },
                    { 
                      title: '成功次数', 
                      dataIndex: 'success', 
                      key: 'success',
                      render: (success: number) => (
                        <span style={{ color: '#52c41a' }}>{success.toLocaleString()}</span>
                      )
                    },
                    { 
                      title: '失败次数', 
                      dataIndex: 'failed', 
                      key: 'failed',
                      render: (failed: number) => (
                        <span style={{ color: '#ff4d4f' }}>{failed.toLocaleString()}</span>
                      )
                    },
                    { 
                      title: '成功率', 
                      key: 'successRate',
                      render: (_, record) => {
                        const rate = (record.success / record.calls * 100).toFixed(1);
                        return (
                          <div>
                            <span style={{ fontWeight: 'bold' }}>{rate}%</span>
                            <Progress 
                              percent={parseFloat(rate)} 
                             
                              strokeColor={parseFloat(rate) >= 98 ? '#52c41a' : parseFloat(rate) >= 95 ? '#faad14' : '#ff4d4f'}
                              showInfo={false}
                            />
                          </div>
                        );
                      }
                    },
                    { 
                      title: '平均响应时间', 
                      dataIndex: 'avgResponseTime', 
                      key: 'avgResponseTime',
                      render: (time: number) => `${time}ms`
                    },
                  ]}
                  dataSource={apiData?.apiCallStats || []}
                  rowKey="endpoint"
                 
                  pagination={false}
                />
              </Card>
            </TabPane>
          </Tabs>
        </Spin>
      </Card>

      {/* API配置弹窗 */}
      <Modal
        title="API配置"
        open={configModalVisible}
        onOk={handleConfigSubmit}
        onCancel={() => {
          setConfigModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="机构名称"
            name="orgName"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="API版本"
            name="apiVersion"
            rules={[{ required: true, message: '请选择API版本' }]}
          >
            <Select>
              <Option value="v1.5">v1.5</Option>
              <Option value="v2.0">v2.0</Option>
              <Option value="v2.1">v2.1</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="超时时间(ms)"
            name="timeout"
            rules={[{ required: true, message: '请输入超时时间' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="重试次数"
            name="retryCount"
            rules={[{ required: true, message: '请输入重试次数' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="备注"
            name="remark"
          >
            <TextArea rows={3} placeholder="配置说明" />
          </Form.Item>
        </Form>
      </Modal>

      {/* API测试弹窗 */}
      <Modal
        title="API连接测试"
        open={testModalVisible}
        onOk={handleTestAPI}
        onCancel={() => setTestModalVisible(false)}
        width={700}
      >
        {selectedOrg && (
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="机构名称">{selectedOrg.orgName}</Descriptions.Item>
              <Descriptions.Item label="API状态">
                <Tag color={getStatusColor(selectedOrg.apiStatus)}>
                  {selectedOrg.apiStatus === 'ONLINE' ? '在线' : selectedOrg.apiStatus === 'OFFLINE' ? '离线' : '异常'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="API版本">{selectedOrg.apiVersion}</Descriptions.Item>
              <Descriptions.Item label="健康评分">{selectedOrg.healthScore}</Descriptions.Item>
            </Descriptions>
            
            <Alert
              message="API端点测试"
              description="以下端点将被测试连通性和响应时间"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Table
              columns={[
                { title: '端点名称', dataIndex: 'name', key: 'name' },
                { title: '请求方法', dataIndex: 'method', key: 'method' },
                { 
                  title: '状态', 
                  dataIndex: 'status', 
                  key: 'status',
                  render: (status: string) => (
                    <Badge 
                      status={status === 'ONLINE' ? 'success' : 'error'} 
                      text={status === 'ONLINE' ? '正常' : '异常'}
                    />
                  )
                },
                { 
                  title: '响应时间', 
                  dataIndex: 'responseTime', 
                  key: 'responseTime',
                  render: (time: number) => time > 0 ? `${time}ms` : '-'
                },
                { title: '最后调用', dataIndex: 'lastCall', key: 'lastCall' },
              ]}
              dataSource={selectedOrg.endpoints}
              rowKey="name"
             
              pagination={false}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SourceOrgAPIManagement;