import React, { useState, useEffect } from 'react';
import {
  Card,
  Timeline,
  Tag,
  Button,
  Space,
  Select,
  DatePicker,
  Input,
  Spin,
  Empty,
  Tooltip,
  Typography,
  Row,
  Col,
  Statistic,
  Progress,
  Drawer,
  Descriptions
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  UserOutlined,
  DollarOutlined,
  FileTextOutlined,
  FilterOutlined,
  EyeOutlined
} from '@ant-design/icons';
// import { PageHeader } from '@ant-design/pro-layout'; // 已废弃
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Search } = Input;
const { Text, Title } = Typography;
const { Option } = Select;

interface TimelineEvent {
  id: string;
  eventTime: string;
  eventType: string;
  eventTitle: string;
  eventDescription: string;
  operatorName?: string;
  operatorOrgId?: string;
  beforeStatus?: string;
  afterStatus?: string;
  amount?: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  eventData?: Record<string, any>;
}

interface CaseTimelineProps {
  casePackageId?: string;
  caseId?: string;
}

const eventTypeConfig = {
  PACKAGE_PUBLISHED: { label: '案件包发布', color: 'blue', icon: <FileTextOutlined /> },
  PACKAGE_ASSIGNED: { label: '案件分配', color: 'green', icon: <CheckCircleOutlined /> },
  PACKAGE_STARTED: { label: '开始处置', color: 'orange', icon: <ClockCircleOutlined /> },
  PACKAGE_COMPLETED: { label: '处置完成', color: 'green', icon: <CheckCircleOutlined /> },
  CASE_CONTACTED: { label: '联系债务人', color: 'blue', icon: <UserOutlined /> },
  CASE_NEGOTIATED: { label: '协商还款', color: 'purple', icon: <ExclamationCircleOutlined /> },
  CASE_SETTLED: { label: '达成和解', color: 'green', icon: <CheckCircleOutlined /> },
  PAYMENT_RECEIVED: { label: '收到还款', color: 'gold', icon: <DollarOutlined /> },
  LEGAL_ACTION: { label: '法律程序', color: 'red', icon: <ExclamationCircleOutlined /> },
  CONTRACT_SIGNED: { label: '合同签署', color: 'blue', icon: <FileTextOutlined /> }
};

const severityConfig = {
  LOW: { color: 'default', text: '低' },
  MEDIUM: { color: 'warning', text: '中' },
  HIGH: { color: 'error', text: '高' },
  CRITICAL: { color: 'error', text: '紧急' }
};

const CaseTimeline: React.FC<CaseTimelineProps> = ({ casePackageId, caseId }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  // 获取时间线数据
  const fetchTimeline = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockEvents: TimelineEvent[] = [
        {
          id: '1',
          eventTime: '2024-01-15 09:00:00',
          eventType: 'PACKAGE_PUBLISHED',
          eventTitle: '案件包发布',
          eventDescription: '案件包 CP2024001 已发布，包含 50 个案件',
          operatorName: '张三',
          operatorOrgId: '银行A',
          severity: 'LOW',
          eventData: { packageId: 'CP2024001', caseCount: 50 }
        },
        {
          id: '2',
          eventTime: '2024-01-15 14:30:00',
          eventType: 'PACKAGE_ASSIGNED',
          eventTitle: '案件分配',
          eventDescription: '案件包已分配给处置机构：律所B',
          operatorName: '系统自动',
          beforeStatus: 'PUBLISHED',
          afterStatus: 'ASSIGNED',
          severity: 'MEDIUM',
          eventData: { assignedTo: '律所B', strategy: 'GEOGRAPHIC' }
        },
        {
          id: '3',
          eventTime: '2024-01-16 10:15:00',
          eventType: 'PACKAGE_STARTED',
          eventTitle: '开始处置',
          eventDescription: '律所B 已开始处置案件包',
          operatorName: '李四',
          operatorOrgId: '律所B',
          beforeStatus: 'ASSIGNED',
          afterStatus: 'IN_PROGRESS',
          severity: 'MEDIUM'
        },
        {
          id: '4',
          eventTime: '2024-01-18 16:45:00',
          eventType: 'CASE_CONTACTED',
          eventTitle: '联系债务人',
          eventDescription: '成功联系债务人王某，了解还款意愿',
          operatorName: '王五',
          operatorOrgId: '律所B',
          severity: 'LOW',
          eventData: { debtorName: '王某', contactMethod: '电话' }
        },
        {
          id: '5',
          eventTime: '2024-01-20 11:20:00',
          eventType: 'CASE_NEGOTIATED',
          eventTitle: '协商还款',
          eventDescription: '与债务人达成分期还款协议',
          operatorName: '王五',
          operatorOrgId: '律所B',
          severity: 'HIGH',
          eventData: { agreementType: '分期还款', installments: 6 }
        },
        {
          id: '6',
          eventTime: '2024-01-22 09:30:00',
          eventType: 'PAYMENT_RECEIVED',
          eventTitle: '收到还款',
          eventDescription: '收到首期还款 5000 元',
          operatorName: '财务系统',
          amount: 5000,
          severity: 'HIGH',
          eventData: { paymentMethod: '银行转账', installmentNumber: 1 }
        },
        {
          id: '7',
          eventTime: '2024-01-25 15:10:00',
          eventType: 'CONTRACT_SIGNED',
          eventTitle: '和解协议签署',
          eventDescription: '双方正式签署和解协议',
          operatorName: '李四',
          operatorOrgId: '律所B',
          severity: 'HIGH',
          eventData: { contractType: '和解协议', contractNumber: 'SA2024001' }
        }
      ];
      
      setEvents(mockEvents);
      setFilteredEvents(mockEvents);
    } catch (error) {
      console.error('获取时间线失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [casePackageId, caseId]);

  // 应用筛选条件
  useEffect(() => {
    let filtered = [...events];

    // 事件类型筛选
    if (selectedEventTypes.length > 0) {
      filtered = filtered.filter(event => selectedEventTypes.includes(event.eventType));
    }

    // 严重程度筛选
    if (selectedSeverity.length > 0) {
      filtered = filtered.filter(event => selectedSeverity.includes(event.severity));
    }

    // 日期范围筛选
    if (dateRange) {
      const [start, end] = dateRange;
      filtered = filtered.filter(event => {
        const eventTime = dayjs(event.eventTime);
        return eventTime.isBetween(start, end, 'day', '[]');
      });
    }

    // 关键词搜索
    if (searchKeyword) {
      filtered = filtered.filter(event =>
        event.eventTitle.includes(searchKeyword) ||
        event.eventDescription.includes(searchKeyword) ||
        (event.operatorName && event.operatorName.includes(searchKeyword))
      );
    }

    setFilteredEvents(filtered);
  }, [events, selectedEventTypes, selectedSeverity, dateRange, searchKeyword]);

  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setDrawerVisible(true);
  };

  const getTimelineItemColor = (event: TimelineEvent) => {
    const config = eventTypeConfig[event.eventType as keyof typeof eventTypeConfig];
    return config?.color || 'gray';
  };

  const getTimelineItemIcon = (event: TimelineEvent) => {
    const config = eventTypeConfig[event.eventType as keyof typeof eventTypeConfig];
    return config?.icon || <InfoCircleOutlined />;
  };

  const renderTimelineItem = (event: TimelineEvent) => (
    <Timeline.Item
      key={event.id}
      color={getTimelineItemColor(event)}
      dot={getTimelineItemIcon(event)}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text strong>{event.eventTitle}</Text>
                <Tag color={severityConfig[event.severity].color}>
                  {severityConfig[event.severity].text}
                </Tag>
                {event.amount && (
                  <Tag color="gold">¥{event.amount.toLocaleString()}</Tag>
                )}
              </div>
              
              <Text type="secondary">{event.eventDescription}</Text>
              
              <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                <Text type="secondary">
                  <ClockCircleOutlined /> {dayjs(event.eventTime).format('YYYY-MM-DD HH:mm')}
                </Text>
                {event.operatorName && (
                  <Text type="secondary">
                    <UserOutlined /> {event.operatorName}
                    {event.operatorOrgId && ` (${event.operatorOrgId})`}
                  </Text>
                )}
              </div>

              {(event.beforeStatus || event.afterStatus) && (
                <div style={{ fontSize: 12 }}>
                  <Text type="secondary">状态变更：</Text>
                  {event.beforeStatus && (
                    <Tag>{event.beforeStatus}</Tag>
                  )}
                  {event.beforeStatus && event.afterStatus && ' → '}
                  {event.afterStatus && (
                    <Tag color="green">{event.afterStatus}</Tag>
                  )}
                </div>
              )}
            </Space>
          </div>
          
          <Button
            type="text"
           
            icon={<EyeOutlined />}
            onClick={() => handleEventClick(event)}
          >
            详情
          </Button>
        </div>
      </div>
    </Timeline.Item>
  );

  const eventTypeCounts = events.reduce((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalEvents = events.length;
  const todayEvents = events.filter(event => 
    dayjs(event.eventTime).isSame(dayjs(), 'day')
  ).length;

  const completionRate = events.filter(event => 
    ['PACKAGE_COMPLETED', 'CASE_SETTLED', 'PAYMENT_RECEIVED'].includes(event.eventType)
  ).length / Math.max(totalEvents, 1) * 100;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>案件时间线</Title>
        <Text type="secondary">
          {casePackageId ? `案件包: ${casePackageId}` : `案件: ${caseId}`}
        </Text>
      </div>

      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总事件数" value={totalEvents} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="今日事件" value={todayEvents} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="处置进度" 
              value={completionRate} 
              suffix="%" 
              formatter={(value) => <Progress percent={Number(value)} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="筛选结果" value={filteredEvents.length} />
          </Card>
        </Col>
      </Row>

      {/* 筛选区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Search
            placeholder="搜索事件"
            allowClear
            style={{ width: 200 }}
            onSearch={setSearchKeyword}
            onChange={e => !e.target.value && setSearchKeyword('')}
          />
          
          <Select
            mode="multiple"
            placeholder="事件类型"
            style={{ minWidth: 200 }}
            value={selectedEventTypes}
            onChange={setSelectedEventTypes}
            allowClear
          >
            {Object.entries(eventTypeConfig).map(([type, config]) => (
              <Option key={type} value={type}>
                {config.icon} {config.label}
              </Option>
            ))}
          </Select>

          <Select
            mode="multiple"
            placeholder="严重程度"
            style={{ minWidth: 120 }}
            value={selectedSeverity}
            onChange={setSelectedSeverity}
            allowClear
          >
            {Object.entries(severityConfig).map(([severity, config]) => (
              <Option key={severity} value={severity}>
                <Tag color={config.color}>{config.text}</Tag>
              </Option>
            ))}
          </Select>

          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
            format="YYYY-MM-DD"
          />

          <Button 
            icon={<FilterOutlined />}
            onClick={() => {
              setSelectedEventTypes([]);
              setSelectedSeverity([]);
              setDateRange(null);
              setSearchKeyword('');
            }}
          >
            清除筛选
          </Button>
        </Space>
      </Card>

      {/* 时间线 */}
      <Card>
        <Spin spinning={loading}>
          {filteredEvents.length > 0 ? (
            <Timeline mode="left">
              {filteredEvents.map(renderTimelineItem)}
            </Timeline>
          ) : (
            <Empty description="暂无时间线数据" />
          )}
        </Spin>
      </Card>

      {/* 事件详情抽屉 */}
      <Drawer
        title="事件详情"
        placement="right"
        width={600}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedEvent && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="事件标题">
                {selectedEvent.eventTitle}
              </Descriptions.Item>
              <Descriptions.Item label="事件类型">
                <Tag color={getTimelineItemColor(selectedEvent)}>
                  {eventTypeConfig[selectedEvent.eventType as keyof typeof eventTypeConfig]?.label || selectedEvent.eventType}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="发生时间">
                {dayjs(selectedEvent.eventTime).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="操作人">
                {selectedEvent.operatorName}
                {selectedEvent.operatorOrgId && ` (${selectedEvent.operatorOrgId})`}
              </Descriptions.Item>
              <Descriptions.Item label="严重程度">
                <Tag color={severityConfig[selectedEvent.severity].color}>
                  {severityConfig[selectedEvent.severity].text}
                </Tag>
              </Descriptions.Item>
              {selectedEvent.amount && (
                <Descriptions.Item label="涉及金额">
                  ¥{selectedEvent.amount.toLocaleString()}
                </Descriptions.Item>
              )}
              {(selectedEvent.beforeStatus || selectedEvent.afterStatus) && (
                <Descriptions.Item label="状态变更">
                  {selectedEvent.beforeStatus && (
                    <Tag>{selectedEvent.beforeStatus}</Tag>
                  )}
                  {selectedEvent.beforeStatus && selectedEvent.afterStatus && ' → '}
                  {selectedEvent.afterStatus && (
                    <Tag color="green">{selectedEvent.afterStatus}</Tag>
                  )}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="事件描述">
                {selectedEvent.eventDescription}
              </Descriptions.Item>
            </Descriptions>

            {selectedEvent.eventData && (
              <div style={{ marginTop: 16 }}>
                <Title level={5}>附加数据</Title>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: 12, 
                  borderRadius: 4,
                  fontSize: 12
                }}>
                  {JSON.stringify(selectedEvent.eventData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default CaseTimeline;