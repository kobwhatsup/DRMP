import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Button,
  Table,
  Statistic,
  Space,
  Tag,
  Tooltip,
  Empty,
  Spin
} from 'antd';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { accessKeyService, KeyUsageStats, AccessKey } from '../../services/accessKeyService';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Props {
  keyId?: string;
}

const KeyUsageStatsPage: React.FC<Props> = ({ keyId: propKeyId }) => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<KeyUsageStats | null>(null);
  const [accessKeys, setAccessKeys] = useState<AccessKey[]>([]);
  const [selectedKeyId, setSelectedKeyId] = useState<string>(propKeyId || '');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'days'),
    dayjs()
  ]);

  // 图表颜色
  const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#fa8c16', '#13c2c2', '#eb2f96'];

  // 加载访问密钥列表
  const loadAccessKeys = async () => {
    try {
      const response = await accessKeyService.getAccessKeys({ size: 1000 });
      setAccessKeys(response.data.content.filter(key => key.status === 'ACTIVE'));
    } catch (error) {
      console.error('加载访问密钥列表失败', error);
    }
  };

  // 加载统计数据
  const loadStats = async () => {
    if (!selectedKeyId) return;

    setLoading(true);
    try {
      const [startDate, endDate] = dateRange;
      const response = await accessKeyService.getKeyUsageStats(
        selectedKeyId,
        startDate.format('YYYY-MM-DD'),
        endDate.format('YYYY-MM-DD')
      );
      setStats(response.data);
    } catch (error) {
      console.error('加载统计数据失败', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccessKeys();
  }, []);

  useEffect(() => {
    if (selectedKeyId) {
      loadStats();
    }
  }, [selectedKeyId, dateRange]);

  // 端点统计表格列
  const endpointColumns: ColumnsType<any> = [
    {
      title: '端点',
      dataIndex: 'endpoint',
      key: 'endpoint',
      ellipsis: true,
    },
    {
      title: '方法',
      dataIndex: 'method',
      key: 'method',
      width: 80,
      render: (method) => <Tag color="blue">{method}</Tag>,
    },
    {
      title: '请求数',
      dataIndex: 'requests',
      key: 'requests',
      width: 100,
      sorter: (a, b) => a.requests - b.requests,
    },
    {
      title: '错误数',
      dataIndex: 'errors',
      key: 'errors',
      width: 100,
      sorter: (a, b) => a.errors - b.errors,
      render: (errors) => errors > 0 ? <span style={{ color: '#f5222d' }}>{errors}</span> : errors,
    },
    {
      title: '平均响应时间',
      dataIndex: 'avgResponseTime',
      key: 'avgResponseTime',
      width: 120,
      sorter: (a, b) => a.avgResponseTime - b.avgResponseTime,
      render: (time) => `${time.toFixed(2)}ms`,
    },
  ];

  // IP统计表格列
  const ipColumns: ColumnsType<any> = [
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 150,
    },
    {
      title: '请求数',
      dataIndex: 'requests',
      key: 'requests',
      width: 100,
      sorter: (a, b) => a.requests - b.requests,
    },
    {
      title: '错误数',
      dataIndex: 'errors',
      key: 'errors',
      width: 100,
      sorter: (a, b) => a.errors - b.errors,
      render: (errors) => errors > 0 ? <span style={{ color: '#f5222d' }}>{errors}</span> : errors,
    },
    {
      title: '最后访问',
      dataIndex: 'lastAccess',
      key: 'lastAccess',
      width: 150,
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  // 准备图表数据
  const prepareChartData = () => {
    if (!stats) return { hourlyData: [], dailyData: [], errorData: [] };

    // 小时数据
    const hourlyData = stats.hourlyStats.map(item => ({
      ...item,
      time: dayjs(item.hour).format('MM-DD HH:mm'),
      successRate: item.requests > 0 ? ((item.requests - item.errors) / item.requests * 100).toFixed(1) : 0,
    }));

    // 日统计数据
    const dailyData = stats.dailyStats.map(item => ({
      ...item,
      date: dayjs(item.date).format('MM-DD'),
      successRate: item.requests > 0 ? ((item.requests - item.errors) / item.requests * 100).toFixed(1) : 0,
    }));

    // 错误分布数据
    const errorData = Object.entries(stats.errorCounts || {}).map(([name, value]) => ({
      name,
      value,
    }));

    return { hourlyData, dailyData, errorData };
  };

  const { hourlyData, dailyData, errorData } = prepareChartData();

  return (
    <div style={{ padding: '24px' }}>
      {/* 控制面板 */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Select
              placeholder="选择访问密钥"
              style={{ width: '100%' }}
              value={selectedKeyId}
              onChange={setSelectedKeyId}
              showSearch
              optionFilterProp="children"
            >
              {accessKeys.map(key => (
                <Option key={key.keyId} value={key.keyId}>
                  {key.name} ({key.keyId})
                </Option>
              ))}
            </Select>
          </Col>
          
          <Col span={8}>
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && dates[0] && dates[1] && setDateRange([dates[0], dates[1]])}
              style={{ width: '100%' }}
            />
          </Col>
          
          <Col span={8}>
            <Space style={{ float: 'right' }}>
              <Button icon={<ReloadOutlined />} onClick={loadStats} loading={loading}>
                刷新
              </Button>
              <Button icon={<DownloadOutlined />}>
                导出报告
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {!selectedKeyId ? (
        <Card>
          <Empty description="请选择要查看统计的访问密钥" />
        </Card>
      ) : loading ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
          </div>
        </Card>
      ) : !stats ? (
        <Card>
          <Empty description="暂无统计数据" />
        </Card>
      ) : (
        <>
          {/* 概览统计 */}
          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="总请求数" 
                  value={stats.totalRequests} 
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="成功请求数" 
                  value={stats.successfulRequests} 
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="成功率" 
                  value={stats.successRate} 
                  precision={2}
                  suffix="%" 
                  valueStyle={{ color: stats.successRate >= 95 ? '#52c41a' : '#faad14' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="平均响应时间" 
                  value={stats.avgResponseTime} 
                  precision={2}
                  suffix="ms" 
                  valueStyle={{ color: stats.avgResponseTime <= 100 ? '#52c41a' : '#faad14' }}
                />
              </Card>
            </Col>
          </Row>

          {/* 请求趋势图 */}
          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col span={24}>
              <Card title="请求趋势" size="small">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line 
                      type="monotone" 
                      dataKey="requests" 
                      stroke="#1890ff" 
                      strokeWidth={2}
                      name="请求数"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="errors" 
                      stroke="#f5222d" 
                      strokeWidth={2}
                      name="错误数"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* 响应时间和成功率 */}
          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col span={12}>
              <Card title="平均响应时间" size="small">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="avgResponseTime" fill="#52c41a" name="响应时间(ms)" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            
            <Col span={12}>
              <Card title="错误分布" size="small">
                {errorData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={errorData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      >
                        {errorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <Empty description="暂无错误数据" />
                  </div>
                )}
              </Card>
            </Col>
          </Row>

          {/* 详细统计表格 */}
          <Row gutter={16}>
            <Col span={12}>
              <Card title="热门端点" size="small">
                <Table
                  columns={endpointColumns}
                  dataSource={stats.topEndpoints}
                  pagination={{ pageSize: 10, size: 'small' }}
                  size="small"
                  rowKey="endpoint"
                />
              </Card>
            </Col>
            
            <Col span={12}>
              <Card title="访问IP统计" size="small">
                <Table
                  columns={ipColumns}
                  dataSource={stats.topIpAddresses}
                  pagination={{ pageSize: 10, size: 'small' }}
                  size="small"
                  rowKey="ipAddress"
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default KeyUsageStatsPage;