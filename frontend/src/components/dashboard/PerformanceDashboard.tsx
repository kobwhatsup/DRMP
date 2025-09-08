import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Progress,
  DatePicker,
  Select,
  Button,
  Spin,
  Tooltip,
  Tag,
  Alert,
  Tabs,
  Space
} from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  TrophyOutlined,
  MoneyCollectOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  ExportOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../../hooks/useAuth';
import { performanceAPI } from '../../services/api';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

interface PerformanceData {
  totalCases: number;
  processedCases: number;
  totalAmount: number;
  recoveredAmount: number;
  recoveryRate: number;
  avgProcessingDays: number;
  monthlyTrend: Array<{
    month: string;
    cases: number;
    recovery: number;
    rate: number;
  }>;
  organizationRanking: Array<{
    id: number;
    name: string;
    cases: number;
    recovery: number;
    rate: number;
    avgDays: number;
  }>;
  caseTypeDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  regionPerformance: Array<{
    region: string;
    cases: number;
    recovery: number;
    rate: number;
  }>;
}

interface DashboardProps {
  userType: 'source' | 'disposal' | 'admin';
}

const PerformanceDashboard: React.FC<DashboardProps> = ({ userType }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PerformanceData | null>(null);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(3, 'month'),
    dayjs()
  ]);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedOrg, setSelectedOrg] = useState<number | null>(null);

  // 图表颜色配置
  const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#fa8c16'];

  useEffect(() => {
    loadDashboardData();
  }, [dateRange, selectedRegion, selectedOrg, userType]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        region: selectedRegion,
        organizationId: selectedOrg,
        userType
      };

      const response = await performanceAPI.getDashboardData(params);
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error('加载业绩数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const params = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        region: selectedRegion,
        organizationId: selectedOrg,
        userType,
        format: 'excel'
      };

      await performanceAPI.exportPerformanceReport(params);
    } catch (error) {
      console.error('导出数据失败:', error);
    }
  };

  const renderOverviewCards = () => (
    <Row gutter={[16, 16]} className=\"mb-6\">
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title=\"案件总数\"
            value={data?.totalCases || 0}
            prefix={<FileTextOutlined />}
            suffix=\"件\"
            valueStyle={{ color: '#1890ff' }}
          />
          <div className=\"mt-2 text-sm text-gray-500\">
            已处理: {data?.processedCases || 0}件
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title=\"委托金额\"
            value={data?.totalAmount || 0}
            prefix={<MoneyCollectOutlined />}
            suffix=\"万元\"
            precision={2}
            valueStyle={{ color: '#52c41a' }}
          />
          <div className=\"mt-2 text-sm text-gray-500\">
            已回款: {((data?.recoveredAmount || 0) / 10000).toFixed(2)}万元
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title=\"回款率\"
            value={data?.recoveryRate || 0}
            prefix={
              data?.recoveryRate && data.recoveryRate > 50 ? 
              <ArrowUpOutlined /> : <ArrowDownOutlined />
            }
            suffix=\"%\"
            precision={2}
            valueStyle={{ 
              color: data?.recoveryRate && data.recoveryRate > 50 ? '#52c41a' : '#f5222d' 
            }}
          />
          <Progress
            percent={data?.recoveryRate || 0}
            size=\"small\"
            showInfo={false}
            strokeColor={data?.recoveryRate && data.recoveryRate > 50 ? '#52c41a' : '#faad14'}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title=\"平均处置周期\"
            value={data?.avgProcessingDays || 0}
            prefix={<ClockCircleOutlined />}
            suffix=\"天\"
            valueStyle={{ color: '#722ed1' }}
          />
          <div className=\"mt-2\">
            <Tag color={data?.avgProcessingDays && data.avgProcessingDays < 30 ? 'green' : 'orange'}>
              {data?.avgProcessingDays && data.avgProcessingDays < 30 ? '高效' : '待优化'}
            </Tag>
          </div>
        </Card>
      </Col>
    </Row>
  );

  const renderTrendChart = () => (
    <Card title=\"月度趋势分析\" className=\"mb-6\">
      <ResponsiveContainer width=\"100%\" height={300}>
        <LineChart data={data?.monthlyTrend || []}>
          <CartesianGrid strokeDasharray=\"3 3\" />
          <XAxis dataKey=\"month\" />
          <YAxis yAxisId=\"left\" />
          <YAxis yAxisId=\"right\" orientation=\"right\" />
          <RechartsTooltip />
          <Legend />
          <Bar yAxisId=\"left\" dataKey=\"cases\" fill=\"#1890ff\" name=\"案件数量\" />
          <Line 
            yAxisId=\"right\" 
            type=\"monotone\" 
            dataKey=\"rate\" 
            stroke=\"#52c41a\" 
            strokeWidth={2}
            name=\"回款率(%)\" 
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );

  const renderOrganizationRanking = () => {
    const columns = [
      {
        title: '排名',
        dataIndex: 'rank',
        key: 'rank',
        width: 80,
        render: (text: number, record: any, index: number) => {
          const rank = index + 1;
          return (
            <div className=\"text-center\">
              {rank <= 3 ? (
                <TrophyOutlined 
                  style={{ 
                    color: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32',
                    fontSize: '16px'
                  }} 
                />
              ) : (
                <span className=\"font-semibold\">{rank}</span>
              )}
            </div>
          );
        }
      },
      {
        title: '机构名称',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
      },
      {
        title: '处理案件',
        dataIndex: 'cases',
        key: 'cases',
        render: (value: number) => `${value}件`,
        sorter: (a: any, b: any) => a.cases - b.cases,
      },
      {
        title: '回款金额',
        dataIndex: 'recovery',
        key: 'recovery',
        render: (value: number) => `${(value / 10000).toFixed(2)}万`,
        sorter: (a: any, b: any) => a.recovery - b.recovery,
      },
      {
        title: '回款率',
        dataIndex: 'rate',
        key: 'rate',
        render: (value: number) => (
          <div>
            <Progress 
              percent={value} 
              size=\"small\" 
              format={percent => `${percent}%`}
              strokeColor={value > 60 ? '#52c41a' : value > 40 ? '#faad14' : '#f5222d'}
            />
          </div>
        ),
        sorter: (a: any, b: any) => a.rate - b.rate,
      },
      {
        title: '平均周期',
        dataIndex: 'avgDays',
        key: 'avgDays',
        render: (value: number) => `${value}天`,
        sorter: (a: any, b: any) => a.avgDays - b.avgDays,
      }
    ];

    return (
      <Card title=\"机构业绩排行\" className=\"mb-6\">
        <Table
          columns={columns}
          dataSource={data?.organizationRanking || []}
          rowKey=\"id\"
          pagination={{ pageSize: 10 }}
          size=\"small\"
        />
      </Card>
    );
  };

  const renderCaseTypeDistribution = () => (
    <Card title=\"案件类型分布\" className=\"mb-6\">
      <ResponsiveContainer width=\"100%\" height={300}>
        <PieChart>
          <Pie
            data={data?.caseTypeDistribution || []}
            cx=\"50%\"
            cy=\"50%\"
            labelLine={false}
            label={({ type, percentage }) => `${type} ${percentage}%`}
            outerRadius={80}
            fill=\"#8884d8\"
            dataKey=\"count\"
          >
            {(data?.caseTypeDistribution || []).map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );

  const renderRegionPerformance = () => (
    <Card title=\"地域业绩分析\" className=\"mb-6\">
      <ResponsiveContainer width=\"100%\" height={300}>
        <BarChart data={data?.regionPerformance || []}>
          <CartesianGrid strokeDasharray=\"3 3\" />
          <XAxis dataKey=\"region\" />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          <Bar dataKey=\"cases\" fill=\"#1890ff\" name=\"案件数量\" />
          <Bar dataKey=\"rate\" fill=\"#52c41a\" name=\"回款率(%)\" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );

  const renderFilters = () => (
    <Card className=\"mb-6\">
      <Row gutter={16} align=\"middle\">
        <Col>
          <Space>
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && setDateRange(dates)}
              format=\"YYYY-MM-DD\"
            />
            <Select
              style={{ width: 120 }}
              value={selectedRegion}
              onChange={setSelectedRegion}
              placeholder=\"选择地区\"
            >
              <Option value=\"all\">全部地区</Option>
              <Option value=\"华北\">华北</Option>
              <Option value=\"华东\">华东</Option>
              <Option value=\"华南\">华南</Option>
              <Option value=\"华中\">华中</Option>
              <Option value=\"西北\">西北</Option>
              <Option value=\"西南\">西南</Option>
              <Option value=\"东北\">东北</Option>
            </Select>
            <Button 
              type=\"primary\" 
              icon={<ReloadOutlined />}
              onClick={loadDashboardData}
              loading={loading}
            >
              刷新
            </Button>
            <Button 
              icon={<ExportOutlined />}
              onClick={handleExportData}
            >
              导出报表
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );

  if (loading && !data) {
    return (
      <div className=\"flex justify-center items-center h-64\">
        <Spin size=\"large\" />
      </div>
    );
  }

  return (
    <div className=\"performance-dashboard\">
      {renderFilters()}
      
      {data ? (
        <>
          {renderOverviewCards()}
          
          <Tabs defaultActiveKey=\"trend\" type=\"card\">
            <TabPane tab=\"趋势分析\" key=\"trend\">
              {renderTrendChart()}
            </TabPane>
            
            <TabPane tab=\"机构排行\" key=\"ranking\">
              {renderOrganizationRanking()}
            </TabPane>
            
            <TabPane tab=\"类型分布\" key=\"distribution\">
              <Row gutter={16}>
                <Col span={12}>
                  {renderCaseTypeDistribution()}
                </Col>
                <Col span={12}>
                  {renderRegionPerformance()}
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </>
      ) : (
        <Alert
          message=\"暂无数据\"
          description=\"请调整筛选条件或联系管理员\"
          type=\"info\"
          showIcon
        />
      )}
    </div>
  );
};

export default PerformanceDashboard;