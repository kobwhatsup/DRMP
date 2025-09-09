import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Tag,
  Space,
  Typography,
  Spin,
  Empty,
  Badge,
  Tooltip,
  Button,
  Select,
  DatePicker
} from 'antd';
import {
  BellOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
  FireOutlined,
  ThunderboltOutlined,
  AlertOutlined,
  DashboardOutlined,
  LineChartOutlined,
  PieChartOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { Line, Pie, Column, Area, Gauge } from '@ant-design/plots';
import dayjs from 'dayjs';
import {
  alertService,
  AlertStatistics,
  AlertTrend,
  Alert,
  AlertLevel,
  AlertType,
  AlertStatus,
  ALERT_LEVEL_CONFIG,
  ALERT_TYPE_CONFIG
} from '../../services/alertService';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

interface AlertDashboardProps {
  orgId?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // 秒
}

const AlertDashboard: React.FC<AlertDashboardProps> = ({
  orgId,
  autoRefresh = true,
  refreshInterval = 30
}) => {
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<AlertStatistics | null>(null);
  const [trends, setTrends] = useState<AlertTrend[]>([]);
  const [hotAlerts, setHotAlerts] = useState<Alert[]>([]);
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'day'),
    dayjs()
  ]);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const queryParams = {
        startTime: dateRange[0].format('YYYY-MM-DD HH:mm:ss'),
        endTime: dateRange[1].format('YYYY-MM-DD HH:mm:ss'),
        orgIds: orgId ? [orgId] : undefined
      };

      // 并行加载所有数据
      const [statsData, trendsData, hotData, distData] = await Promise.all([
        alertService.getStatistics(queryParams),
        alertService.getTrends({
          ...queryParams,
          groupBy: selectedPeriod
        }),
        alertService.getHotAlerts({ limit: 5 }),
        alertService.getDistribution({ dimension: 'type' })
      ]);

      setStatistics(statsData);
      setTrends(trendsData);
      setHotAlerts(hotData);
      setDistribution(distData);
    } catch (error) {
      console.error('加载预警数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化和自动刷新
  useEffect(() => {
    loadData();
  }, [dateRange, selectedPeriod, orgId]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadData();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, dateRange, selectedPeriod, orgId]);

  // 获取级别图标
  const getLevelIcon = (level: AlertLevel) => {
    const icons = {
      [AlertLevel.CRITICAL]: <FireOutlined style={{ color: ALERT_LEVEL_CONFIG[level].color }} />,
      [AlertLevel.HIGH]: <ThunderboltOutlined style={{ color: ALERT_LEVEL_CONFIG[level].color }} />,
      [AlertLevel.MEDIUM]: <ExclamationCircleOutlined style={{ color: ALERT_LEVEL_CONFIG[level].color }} />,
      [AlertLevel.LOW]: <InfoCircleOutlined style={{ color: ALERT_LEVEL_CONFIG[level].color }} />,
      [AlertLevel.INFO]: <InfoCircleOutlined style={{ color: ALERT_LEVEL_CONFIG[level].color }} />
    };
    return icons[level];
  };

  // 获取状态颜色
  const getStatusColor = (status: AlertStatus) => {
    const colors = {
      [AlertStatus.NEW]: 'red',
      [AlertStatus.ACKNOWLEDGED]: 'orange',
      [AlertStatus.IN_PROGRESS]: 'blue',
      [AlertStatus.RESOLVED]: 'green',
      [AlertStatus.CLOSED]: 'default',
      [AlertStatus.ESCALATED]: 'purple'
    };
    return colors[status];
  };

  // 趋势图配置
  const trendConfig = {
    data: trends.flatMap(t => [
      { date: t.date, type: '严重', value: t.critical },
      { date: t.date, type: '高危', value: t.high },
      { date: t.date, type: '中等', value: t.medium },
      { date: t.date, type: '低危', value: t.low }
    ]),
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000
      }
    },
    color: ['#f5222d', '#fa8c16', '#faad14', '#52c41a'],
    legend: {
      position: 'top-right'
    },
    tooltip: {
      showCrosshairs: true
    }
  };

  // 分布饼图配置
  const distributionConfig = {
    data: Object.entries(distribution).map(([key, value]) => ({
      type: ALERT_TYPE_CONFIG[key as AlertType]?.label || key,
      value,
      category: ALERT_TYPE_CONFIG[key as AlertType]?.category || '其他'
    })),
    angleField: 'value',
    colorField: 'category',
    radius: 1,
    innerRadius: 0.6,
    label: {
      type: 'inner',
      offset: '-50%',
      content: '{value}',
      style: {
        textAlign: 'center',
        fontSize: 14
      }
    },
    statistic: {
      title: false,
      content: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        },
        content: '预警分布'
      }
    },
    interactions: [{ type: 'element-selected' }, { type: 'element-active' }]
  };

  // 响应时间仪表盘配置
  const gaugeConfig = {
    percent: statistics ? Math.min(statistics.avgResponseTime / 60, 1) : 0,
    radius: 0.75,
    range: {
      color: ['#52c41a', '#faad14', '#f5222d'],
      width: 12
    },
    indicator: {
      pointer: {
        style: {
          stroke: '#D0D0D0'
        }
      },
      pin: {
        style: {
          stroke: '#D0D0D0'
        }
      }
    },
    statistic: {
      title: {
        formatter: () => '平均响应',
        style: {
          fontSize: '14px'
        }
      },
      content: {
        formatter: () => `${statistics?.avgResponseTime || 0} 分钟`,
        style: {
          fontSize: '16px'
        }
      }
    }
  };

  if (loading && !statistics) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="加载预警数据..." />
      </div>
    );
  }

  return (
    <div className="alert-dashboard">
      {/* 顶部控制栏 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Card size="small" bodyStyle={{ padding: '12px 16px' }}>
            <Row align="middle" justify="space-between">
              <Col>
                <Space>
                  <DashboardOutlined />
                  <Title level={5} style={{ margin: 0 }}>预警监控面板</Title>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Text>时间范围：</Text>
                  <RangePicker
                    value={dateRange}
                    onChange={(dates) => {
                      if (dates && dates[0] && dates[1]) {
                        setDateRange([dates[0], dates[1]]);
                      }
                    }}
                  />
                  <Select
                    value={selectedPeriod}
                    onChange={setSelectedPeriod}
                    style={{ width: 100 }}
                  >
                    <Select.Option value="day">按天</Select.Option>
                    <Select.Option value="week">按周</Select.Option>
                    <Select.Option value="month">按月</Select.Option>
                  </Select>
                  <Button type="primary" onClick={loadData} loading={loading}>
                    刷新
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="总预警数"
              value={statistics?.total || 0}
              prefix={<BellOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">今日新增</Text>
              <Text strong style={{ marginLeft: 8 }}>
                {statistics?.todayCount || 0}
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="未解决预警"
              value={statistics?.unresolved || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
            <Progress
              percent={statistics ? (statistics.unresolved / statistics.total) * 100 : 0}
              strokeColor="#ff4d4f"
              showInfo={false}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="严重预警"
              value={statistics?.byLevel[AlertLevel.CRITICAL] || 0}
              prefix={<FireOutlined />}
              valueStyle={{ color: ALERT_LEVEL_CONFIG[AlertLevel.CRITICAL].color }}
            />
            <div style={{ marginTop: 8 }}>
              <Space>
                <Badge color={ALERT_LEVEL_CONFIG[AlertLevel.HIGH].color} />
                <Text>高危: {statistics?.byLevel[AlertLevel.HIGH] || 0}</Text>
              </Space>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Gauge {...gaugeConfig} />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 趋势图 */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <LineChartOutlined />
                <Text strong>预警趋势</Text>
              </Space>
            }
            extra={
              <Text type="secondary">
                最近{selectedPeriod === 'day' ? '7天' : selectedPeriod === 'week' ? '4周' : '3个月'}
              </Text>
            }
          >
            {trends.length > 0 ? (
              <Area {...trendConfig} height={300} />
            ) : (
              <Empty description="暂无趋势数据" />
            )}
          </Card>
        </Col>

        {/* 类型分布 */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <PieChartOutlined />
                <Text strong>类型分布</Text>
              </Space>
            }
          >
            {Object.keys(distribution).length > 0 ? (
              <Pie {...distributionConfig} height={300} />
            ) : (
              <Empty description="暂无分布数据" />
            )}
          </Card>
        </Col>
      </Row>

      {/* 热点预警 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <AlertOutlined />
                <Text strong>热点预警</Text>
              </Space>
            }
            extra={
              <Text type="secondary">最新的重要预警</Text>
            }
          >
            {hotAlerts.length > 0 ? (
              <div className="hot-alerts-list">
                {hotAlerts.map((alert, index) => (
                  <div
                    key={alert.id}
                    style={{
                      padding: '12px 0',
                      borderBottom: index < hotAlerts.length - 1 ? '1px solid #f0f0f0' : 'none'
                    }}
                  >
                    <Row align="middle" gutter={16}>
                      <Col flex="40px">
                        {getLevelIcon(alert.level)}
                      </Col>
                      <Col flex="auto">
                        <div>
                          <Space>
                            <Text strong>{alert.title}</Text>
                            <Tag color={ALERT_LEVEL_CONFIG[alert.level].color}>
                              {ALERT_LEVEL_CONFIG[alert.level].label}
                            </Tag>
                            <Tag color={getStatusColor(alert.status)}>
                              {alert.status}
                            </Tag>
                          </Space>
                        </div>
                        <Paragraph
                          style={{ margin: '4px 0 0 0', color: '#666' }}
                          ellipsis={{ rows: 1 }}
                        >
                          {alert.message}
                        </Paragraph>
                      </Col>
                      <Col flex="150px" style={{ textAlign: 'right' }}>
                        <Space direction="vertical" size={0}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {dayjs(alert.triggeredAt).format('MM-DD HH:mm')}
                          </Text>
                          {alert.acknowledgedAt && (
                            <Text type="success" style={{ fontSize: 12 }}>
                              已确认
                            </Text>
                          )}
                        </Space>
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="暂无热点预警" />
            )}
          </Card>
        </Col>
      </Row>

      {/* 级别统计 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <BarChartOutlined />
                <Text strong>级别统计</Text>
              </Space>
            }
          >
            <Row gutter={16}>
              {Object.entries(ALERT_LEVEL_CONFIG).map(([level, config]) => (
                <Col key={level} xs={24} sm={12} md={8} lg={4}>
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div style={{ fontSize: 32, color: config.color }}>
                      {statistics?.byLevel[level as AlertLevel] || 0}
                    </div>
                    <Text>{config.label}</Text>
                    {config.responseTime && (
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <ClockCircleOutlined /> {config.responseTime}分钟
                        </Text>
                      </div>
                    )}
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AlertDashboard;