import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Select,
  DatePicker,
  Tabs,
  Divider,
  Alert,
  Badge,
  Tooltip,
  Modal,
  List,
  Avatar,
  Progress,
  notification,
  Empty,
  Spin
} from 'antd';
import {
  BellOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  FilterOutlined,
  ExportOutlined,
  EyeOutlined,
  SettingOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { disposalAnalysisAPI, AlertData, DisposalAnalysisQueryRequest } from '../../../services/disposalAnalysisService';
import { StandardRangePicker } from '../../../components/common';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface AlertCenterProps {}

const AlertCenter: React.FC<AlertCenterProps> = () => {
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<AlertData[]>([]);
  const [selectedAlertIds, setSelectedAlertIds] = useState<string[]>([]);
  const [alertStats, setAlertStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    unread: 0
  });
  
  // 筛选条件
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'day'),
    dayjs()
  ]);
  
  // 模态框状态
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);
  
  // 自动刷新
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // 秒

  // 获取预警级别颜色
  const getAlertLevelColor = (level: string): string => {
    const colorMap: Record<string, string> = {
      'CRITICAL': '#f5222d',
      'HIGH': '#fa8c16', 
      'MEDIUM': '#faad14',
      'LOW': '#52c41a'
    };
    return colorMap[level] || '#d9d9d9';
  };

  // 获取预警级别图标
  const getAlertLevelIcon = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return <ExclamationCircleOutlined style={{ color: '#f5222d' }} />;
      case 'HIGH':
        return <WarningOutlined style={{ color: '#fa8c16' }} />;
      case 'MEDIUM':
        return <InfoCircleOutlined style={{ color: '#faad14' }} />;
      case 'LOW':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      default:
        return <BellOutlined />;
    }
  };

  // 获取预警类型标签
  const getAlertTypeTag = (type: string): React.ReactNode => {
    const typeMap: Record<string, { label: string; color: string }> = {
      'EFFICIENCY_DECLINE': { label: '效率下降', color: 'orange' },
      'COST_OVERRUN': { label: '成本超支', color: 'red' },
      'CASE_BACKLOG': { label: '案件积压', color: 'purple' },
      'RECOVERY_RATE_LOW': { label: '回款率低', color: 'magenta' },
      'ORGANIZATION_ANOMALY': { label: '机构异常', color: 'volcano' },
      'PROCESSING_TIMEOUT': { label: '处理超时', color: 'geekblue' }
    };
    
    const config = typeMap[type] || { label: type, color: 'default' };
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  // 加载预警数据
  const loadAlerts = async () => {
    setLoading(true);
    try {
      const queryParams: DisposalAnalysisQueryRequest = {
        startTime: dateRange[0].format('YYYY-MM-DD HH:mm:ss'),
        endTime: dateRange[1].format('YYYY-MM-DD HH:mm:ss'),
        page: 1,
        size: 100
      };

      const response = await disposalAnalysisAPI.getAlerts(queryParams);
      const alertList = response || [];
      setAlerts(alertList);
      
      // 计算统计数据
      const stats = {
        total: alertList.length,
        critical: alertList.filter((a: AlertData) => a.alertLevel === 'CRITICAL').length,
        high: alertList.filter((a: AlertData) => a.alertLevel === 'HIGH').length,
        medium: alertList.filter((a: AlertData) => a.alertLevel === 'MEDIUM').length,
        low: alertList.filter((a: AlertData) => a.alertLevel === 'LOW').length,
        unread: alertList.filter((a: AlertData) => !(a.alertDetails as any)?.read).length
      };
      setAlertStats(stats);
      
      applyFilters(alertList);
      
    } catch (error) {
      console.error('加载预警数据失败:', error);
      notification.error({
        message: '加载失败',
        description: '无法加载预警数据，请稍后重试'
      });
    } finally {
      setLoading(false);
    }
  };

  // 应用筛选条件
  const applyFilters = (alertList: AlertData[] = alerts) => {
    let filtered = [...alertList];
    
    if (selectedLevel !== 'ALL') {
      filtered = filtered.filter(alert => alert.alertLevel === selectedLevel);
    }
    
    if (selectedType !== 'ALL') {
      filtered = filtered.filter(alert => alert.alertType === selectedType);
    }
    
    if (selectedStatus !== 'ALL') {
      const isRead = selectedStatus === 'READ';
      filtered = filtered.filter(alert => !!(alert.alertDetails as any)?.read === isRead);
    }
    
    setFilteredAlerts(filtered);
  };

  // 查看预警详情
  const viewAlertDetails = (alert: AlertData) => {
    setSelectedAlert(alert);
    setDetailModalVisible(true);
    
    // 标记为已读
    if (!(alert.alertDetails as any)?.read) {
      const updatedAlert = {
        ...alert,
        alertDetails: {
          ...alert.alertDetails,
          read: true
        }
      };
      
      const updatedAlerts = alerts.map(a => 
        a.alertType === alert.alertType && a.alertTime === alert.alertTime ? updatedAlert : a
      );
      setAlerts(updatedAlerts);
      applyFilters(updatedAlerts);
      
      // 更新统计
      setAlertStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      }));
    }
  };

  // 批量操作
  const handleBatchRead = () => {
    const updatedAlerts = alerts.map(alert => ({
      ...alert,
      alertDetails: {
        ...alert.alertDetails,
        read: true
      }
    }));
    
    setAlerts(updatedAlerts);
    applyFilters(updatedAlerts);
    setAlertStats(prev => ({ ...prev, unread: 0 }));
    
    notification.success({
      message: '操作成功',
      description: '所有预警已标记为已读'
    });
  };

  // 导出预警数据
  const handleExport = async () => {
    try {
      const queryParams: DisposalAnalysisQueryRequest = {
        startTime: dateRange[0].format('YYYY-MM-DD HH:mm:ss'),
        endTime: dateRange[1].format('YYYY-MM-DD HH:mm:ss')
      };

      const response = await disposalAnalysisAPI.exportAnalysisReport(queryParams, 'excel');
      
      // 创建下载链接
      const link = document.createElement('a');
      link.href = response.downloadUrl;
      link.download = response.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      notification.success({
        message: '导出成功',
        description: '预警数据已导出到Excel文件'
      });
      
    } catch (error) {
      notification.error({
        message: '导出失败',
        description: '无法导出预警数据，请稍后重试'
      });
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '预警级别',
      dataIndex: 'alertLevel',
      key: 'alertLevel',
      width: 100,
      render: (level: string) => (
        <Space>
          {getAlertLevelIcon(level)}
          <Tag color={getAlertLevelColor(level)}>
            {level}
          </Tag>
        </Space>
      )
    },
    {
      title: '预警类型',
      dataIndex: 'alertType',
      key: 'alertType',
      width: 120,
      render: (type: string) => getAlertTypeTag(type)
    },
    {
      title: '预警信息',
      dataIndex: 'alertMessage',
      key: 'alertMessage',
      ellipsis: true,
      render: (message: string, record: AlertData) => (
        <div>
          <div style={{ fontWeight: !(record.alertDetails as any)?.read ? 'bold' : 'normal' }}>
            {message}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.suggestedAction}
          </Text>
        </div>
      )
    },
    {
      title: '预警时间',
      dataIndex: 'alertTime',
      key: 'alertTime',
      width: 180,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: (record: AlertData) => (
        <Badge
          status={(record.alertDetails as any)?.read ? 'default' : 'processing'}
          text={(record.alertDetails as any)?.read ? '已读' : '未读'}
        />
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (record: AlertData) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => viewAlertDetails(record)}
          >
            详情
          </Button>
        </Space>
      )
    }
  ];

  // 初始化和自动刷新
  useEffect(() => {
    loadAlerts();
  }, [dateRange]);

  useEffect(() => {
    applyFilters();
  }, [selectedLevel, selectedType, selectedStatus]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (autoRefresh) {
      intervalId = setInterval(() => {
        loadAlerts();
      }, refreshInterval * 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, refreshInterval, dateRange]);

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        {/* 页面标题和操作 */}
        <Col span={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2}>
              <BellOutlined style={{ marginRight: 8 }} />
              预警中心
            </Title>
            <Space>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={loadAlerts}
                loading={loading}
              >
                刷新
              </Button>
              <Button
                icon={<ExportOutlined />}
                onClick={handleExport}
              >
                导出
              </Button>
              <Button
                icon={<SettingOutlined />}
                onClick={() => {
                  // TODO: 打开预警设置页面
                }}
              >
                设置
              </Button>
            </Space>
          </div>
        </Col>

        {/* 统计卡片 */}
        <Col span={24}>
          <Row gutter={16}>
            <Col span={4}>
              <Card size="small">
                <Statistic
                  title="总预警"
                  value={alertStats.total}
                  prefix={<BellOutlined />}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card size="small">
                <Statistic
                  title="未读预警"
                  value={alertStats.unread}
                  valueStyle={{ color: '#f5222d' }}
                  prefix={<ExclamationCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card size="small">
                <Statistic
                  title="严重"
                  value={alertStats.critical}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card size="small">
                <Statistic
                  title="高危"
                  value={alertStats.high}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card size="small">
                <Statistic
                  title="中等"
                  value={alertStats.medium}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card size="small">
                <Statistic
                  title="低危"
                  value={alertStats.low}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* 筛选器 */}
        <Col span={24}>
          <Card size="small">
            <Row gutter={16} align="middle">
              <Col span={6}>
                <Space>
                  <Text>时间范围：</Text>
                  <StandardRangePicker
                    value={dateRange}
                    onChange={(dates) => {
                      if (dates && dates[0] && dates[1]) {
                        setDateRange([dates[0], dates[1]]);
                      }
                    }}
                    allowClear={false}
                    style={{ width: 280 }}
                  />
                </Space>
              </Col>
              <Col span={4}>
                <Space>
                  <Text>预警级别：</Text>
                  <Select
                    value={selectedLevel}
                    onChange={setSelectedLevel}
                    style={{ width: 120 }}
                  >
                    <Select.Option value="ALL">全部</Select.Option>
                    <Select.Option value="CRITICAL">严重</Select.Option>
                    <Select.Option value="HIGH">高危</Select.Option>
                    <Select.Option value="MEDIUM">中等</Select.Option>
                    <Select.Option value="LOW">低危</Select.Option>
                  </Select>
                </Space>
              </Col>
              <Col span={4}>
                <Space>
                  <Text>预警类型：</Text>
                  <Select
                    value={selectedType}
                    onChange={setSelectedType}
                    style={{ width: 140 }}
                  >
                    <Select.Option value="ALL">全部</Select.Option>
                    <Select.Option value="EFFICIENCY_DECLINE">效率下降</Select.Option>
                    <Select.Option value="COST_OVERRUN">成本超支</Select.Option>
                    <Select.Option value="CASE_BACKLOG">案件积压</Select.Option>
                    <Select.Option value="RECOVERY_RATE_LOW">回款率低</Select.Option>
                    <Select.Option value="ORGANIZATION_ANOMALY">机构异常</Select.Option>
                    <Select.Option value="PROCESSING_TIMEOUT">处理超时</Select.Option>
                  </Select>
                </Space>
              </Col>
              <Col span={4}>
                <Space>
                  <Text>状态：</Text>
                  <Select
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    style={{ width: 100 }}
                  >
                    <Select.Option value="ALL">全部</Select.Option>
                    <Select.Option value="unread">未读</Select.Option>
                    <Select.Option value="read">已读</Select.Option>
                  </Select>
                </Space>
              </Col>
              <Col span={6}>
                <Space>
                  <Text>自动刷新：</Text>
                  <Select
                    value={autoRefresh ? refreshInterval : 0}
                    onChange={(value) => {
                      if (value === 0) {
                        setAutoRefresh(false);
                      } else {
                        setAutoRefresh(true);
                        setRefreshInterval(value);
                      }
                    }}
                    style={{ width: 100 }}
                  >
                    <Select.Option value={0}>关闭</Select.Option>
                    <Select.Option value={10}>10秒</Select.Option>
                    <Select.Option value={30}>30秒</Select.Option>
                    <Select.Option value={60}>1分钟</Select.Option>
                    <Select.Option value={300}>5分钟</Select.Option>
                  </Select>
                  {alertStats.unread > 0 && (
                    <Button size="small" onClick={handleBatchRead}>
                      全部已读
                    </Button>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 预警列表 */}
        <Col span={24}>
          <Card>
            <Spin spinning={loading}>
              <Table
                dataSource={filteredAlerts}
                columns={columns}
                rowKey="id"
                rowSelection={{
                  selectedRowKeys: selectedAlertIds,
                  onChange: (keys) => setSelectedAlertIds(keys as string[])
                }}
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条预警`
                }}
                rowClassName={(record) => 
                  !(record.alertDetails as any)?.read ? 'alert-unread' : ''
                }
              />
            </Spin>
          </Card>
        </Col>
      </Row>

      {/* 预警详情模态框 */}
      <Modal
        title={
          <Space>
            {selectedAlert && getAlertLevelIcon(selectedAlert.alertLevel)}
            预警详情
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {selectedAlert && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>预警级别：</Text>
                <div>
                  <Space>
                    {getAlertLevelIcon(selectedAlert.alertLevel)}
                    <Tag color={getAlertLevelColor(selectedAlert.alertLevel)}>
                      {selectedAlert.alertLevel}
                    </Tag>
                  </Space>
                </div>
              </Col>
              <Col span={12}>
                <Text strong>预警类型：</Text>
                <div>{getAlertTypeTag(selectedAlert.alertType)}</div>
              </Col>
              <Col span={12}>
                <Text strong>预警时间：</Text>
                <div>{dayjs(selectedAlert.alertTime).format('YYYY-MM-DD HH:mm:ss')}</div>
              </Col>
              <Col span={12}>
                <Text strong>状态：</Text>
                <div>
                  <Badge
                    status={(selectedAlert.alertDetails as any)?.read ? 'default' : 'processing'}
                    text={(selectedAlert.alertDetails as any)?.read ? '已读' : '未读'}
                  />
                </div>
              </Col>
              <Col span={24}>
                <Text strong>预警信息：</Text>
                <div style={{ marginTop: 8 }}>
                  <Alert
                    type={selectedAlert.alertLevel === 'CRITICAL' ? 'error' : 
                          selectedAlert.alertLevel === 'HIGH' ? 'warning' : 
                          selectedAlert.alertLevel === 'MEDIUM' ? 'info' : 'success'}
                    message={selectedAlert.alertMessage}
                    showIcon
                  />
                </div>
              </Col>
              <Col span={24}>
                <Text strong>建议措施：</Text>
                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                  {selectedAlert.suggestedAction}
                </div>
              </Col>
              {selectedAlert.alertDetails && Object.keys(selectedAlert.alertDetails).length > 0 && (
                <Col span={24}>
                  <Text strong>详细信息：</Text>
                  <div style={{ marginTop: 8 }}>
                    <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, fontSize: 12 }}>
                      {JSON.stringify(selectedAlert.alertDetails, null, 2)}
                    </pre>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>

      <style dangerouslySetInnerHTML={{__html: `
        .alert-unread {
          background-color: #fff7e6 !important;
        }
        .alert-unread:hover {
          background-color: #fff1d6 !important;
        }
      `}} />
    </div>
  );
};

export default AlertCenter;