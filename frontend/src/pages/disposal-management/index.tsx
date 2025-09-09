import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Space,
  Tag,
  Progress,
  Tabs,
  Select,
  DatePicker,
  Input,
  Drawer,
  Modal
} from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  BarChartOutlined,
  ExportOutlined,
  SettingOutlined
} from '@ant-design/icons';
import ReportAnalytics from './litigation/components/ReportAnalytics';
import { exportService } from '@/services/exportService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

interface DisposalCase {
  id: string;
  caseNumber: string;
  debtorName: string;
  amount: number;
  disposalType: '调解' | '诉讼';
  status: string;
  assignedOrg: string;
  createdTime: string;
  progressRate: number;
}

const DisposalOverview: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [disposalCases, setDisposalCases] = useState<DisposalCase[]>([]);
  const [selectedDisposalType, setSelectedDisposalType] = useState<string>('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);

  useEffect(() => {
    loadDisposalData();
  }, []);

  const loadDisposalData = async () => {
    setLoading(true);
    try {
      // 模拟数据加载
      const mockData: DisposalCase[] = [
        {
          id: '1',
          caseNumber: 'CASE-2024-001',
          debtorName: '张三',
          amount: 50000,
          disposalType: '调解',
          status: '进行中',
          assignedOrg: '华南调解中心',
          createdTime: '2024-01-15 10:30:00',
          progressRate: 65
        },
        {
          id: '2', 
          caseNumber: 'CASE-2024-002',
          debtorName: '李四',
          amount: 80000,
          disposalType: '诉讼',
          status: '立案中',
          assignedOrg: '金融法庭',
          createdTime: '2024-01-16 14:20:00',
          progressRate: 30
        }
      ];
      setDisposalCases(mockData);
    } catch (error) {
      console.error('加载处置数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    try {
      const options = {
        format,
        dateRange: [dayjs().subtract(30, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')] as [string, string],
        filters: { disposalType: selectedDisposalType }
      };
      
      const blob = await exportService.exportCaseData(options);
      const filename = exportService.generateFilename('disposal-cases', format);
      exportService.downloadFile(blob, filename);
      setExportModalVisible(false);
    } catch (error) {
      console.error('导出失败:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      '进行中': 'processing',
      '已完成': 'success',
      '待分配': 'warning',
      '立案中': 'blue',
      '调解中': 'cyan',
      '已结案': 'green'
    };
    return colorMap[status] || 'default';
  };

  const getDisposalTypeColor = (type: string) => {
    return type === '调解' ? 'blue' : 'orange';
  };

  const columns = [
    {
      title: '案件编号',
      dataIndex: 'caseNumber',
      key: 'caseNumber',
    },
    {
      title: '债务人',
      dataIndex: 'debtorName',
      key: 'debtorName',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '处置方式',
      dataIndex: 'disposalType',
      key: 'disposalType',
      render: (type: string) => (
        <Tag color={getDisposalTypeColor(type)}>{type}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: '处置机构',
      dataIndex: 'assignedOrg',
      key: 'assignedOrg',
    },
    {
      title: '进度',
      dataIndex: 'progressRate',
      key: 'progressRate',
      render: (rate: number) => (
        <Progress percent={rate} size="small" />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
      key: 'createdTime',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: DisposalCase) => (
        <Space>
          <Button type="link" size="small">查看</Button>
          <Button type="link" size="small">编辑</Button>
        </Space>
      ),
    },
  ];

  const statisticsData = [
    {
      title: '总案件数',
      value: 1234,
      icon: <FileTextOutlined style={{ color: '#1890ff' }} />,
      suffix: '件'
    },
    {
      title: '调解案件',
      value: 789,
      icon: <TeamOutlined style={{ color: '#52c41a' }} />,
      suffix: '件'
    },
    {
      title: '诉讼案件',
      value: 445,
      icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      suffix: '件'
    },
    {
      title: '已结案',
      value: 356,
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      suffix: '件'
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2>
          <DashboardOutlined style={{ marginRight: '8px' }} />
          处置总览
        </h2>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {statisticsData.map((stat, index) => (
          <Col span={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                suffix={stat.suffix}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 筛选区域 */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} align="middle">
          <Col span={4}>
            <Select
              placeholder="处置方式"
              value={selectedDisposalType}
              onChange={setSelectedDisposalType}
              style={{ width: '100%' }}
            >
              <Option value="all">全部</Option>
              <Option value="mediation">调解</Option>
              <Option value="litigation">诉讼</Option>
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker 
              placeholder={['开始日期', '结束日期']}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Input 
              placeholder="案件编号/债务人" 
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col span={4}>
            <Button type="primary" icon={<SearchOutlined />}>
              查询
            </Button>
          </Col>
          <Col span={4}>
            <Button icon={<FilterOutlined />}>
              高级筛选
            </Button>
          </Col>
          <Col span={2}>
            <Button 
              type="primary" 
              icon={<BarChartOutlined />}
              onClick={() => setShowAnalytics(true)}
            >
              分析
            </Button>
          </Col>
          <Col span={2}>
            <Button 
              icon={<ExportOutlined />}
              onClick={() => setExportModalVisible(true)}
            >
              导出
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 案件列表 */}
      <Card>
        <Tabs defaultActiveKey="all">
          <TabPane tab="全部案件" key="all">
            <Table
              columns={columns}
              dataSource={disposalCases}
              loading={loading}
              rowKey="id"
              pagination={{
                total: disposalCases.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </TabPane>
          <TabPane tab="调解案件" key="mediation">
            <Table
              columns={columns}
              dataSource={disposalCases.filter(item => item.disposalType === '调解')}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </TabPane>
          <TabPane tab="诉讼案件" key="litigation">
            <Table
              columns={columns}
              dataSource={disposalCases.filter(item => item.disposalType === '诉讼')}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 分析报表抽屉 */}
      <Drawer
        title="数据分析报表"
        placement="right"
        size="large"
        onClose={() => setShowAnalytics(false)}
        open={showAnalytics}
        width="80%"
      >
        <ReportAnalytics />
      </Drawer>

      {/* 导出模态框 */}
      <Modal
        title="导出数据"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        footer={null}
        width={400}
      >
        <div style={{ padding: '20px 0' }}>
          <h4>选择导出格式：</h4>
          <Space direction="vertical" style={{ width: '100%', marginTop: '16px' }}>
            <Button 
              block 
              type="primary" 
              icon={<ExportOutlined />}
              onClick={() => handleExport('excel')}
            >
              导出为 Excel
            </Button>
            <Button 
              block 
              icon={<ExportOutlined />}
              onClick={() => handleExport('pdf')}
            >
              导出为 PDF
            </Button>
            <Button 
              block 
              icon={<ExportOutlined />}
              onClick={() => handleExport('csv')}
            >
              导出为 CSV
            </Button>
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default DisposalOverview;