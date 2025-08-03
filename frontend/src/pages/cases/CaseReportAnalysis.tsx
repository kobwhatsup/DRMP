import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Space, Row, Col, Statistic, Select, DatePicker,
  Typography, Divider, Tabs, Progress, Badge, Tooltip, message, Spin,
  Radio, Switch, Tag, Form, Input, Modal, Upload, List, Timeline, Empty, Alert
} from 'antd';
import {
  BarChartOutlined, PieChartOutlined, LineChartOutlined, AreaChartOutlined,
  DollarOutlined, TrophyOutlined, ClockCircleOutlined, TeamOutlined,
  FileTextOutlined, DownloadOutlined, PrinterOutlined, FilterOutlined,
  ReloadOutlined, CalendarOutlined, ExclamationCircleOutlined, CheckCircleOutlined,
  RiseOutlined, FallOutlined, EyeOutlined, SettingOutlined, DashboardOutlined,
  ThunderboltOutlined, BankOutlined, FireOutlined, StarOutlined, FundOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

// 报表数据接口
interface CaseReportData {
  period: string;
  totalCases: number;
  assignedCases: number;
  completedCases: number;
  totalAmount: number;
  recoveredAmount: number;
  recoveryRate: number;
  avgProcessingDays: number;
  activeOrgs: number;
  topPerformers: Array<{
    orgName: string;
    recoveryAmount: number;
    recoveryRate: number;
    completedCases: number;
  }>;
}

// 分析指标接口
interface AnalysisMetrics {
  performance: {
    totalRevenue: number;
    revenueGrowth: number;
    caseVolume: number;
    volumeGrowth: number;
    avgRecoveryRate: number;
    rateGrowth: number;
    avgProcessingTime: number;
    timeImprovement: number;
  };
  distribution: {
    byAmount: Array<{ range: string; count: number; percentage: number }>;
    byRegion: Array<{ region: string; count: number; amount: number }>;
    byOrgType: Array<{ type: string; count: number; performance: number }>;
    byStatus: Array<{ status: string; count: number; percentage: number }>;
  };
  trends: {
    monthlyRecovery: Array<{ month: string; amount: number; rate: number }>;
    orgPerformance: Array<{ month: string; topOrgs: number; avgRate: number }>;
    caseFlow: Array<{ month: string; published: number; assigned: number; completed: number }>;
  };
}

/**
 * 案件报表分析页面
 */
const CaseReportAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<CaseReportData | null>(null);
  const [analysisMetrics, setAnalysisMetrics] = useState<AnalysisMetrics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [reportType, setReportType] = useState<'overview' | 'performance' | 'distribution' | 'trends'>('overview');
  const [chartType, setChartType] = useState<'column' | 'line' | 'pie' | 'area'>('column');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [customReportVisible, setCustomReportVisible] = useState(false);

  const [customForm] = Form.useForm();

  // 加载报表数据
  const loadReportData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 模拟报表数据
      const mockReportData: CaseReportData = {
        period: `${selectedPeriod[0].format('YYYY-MM-DD')} ~ ${selectedPeriod[1].format('YYYY-MM-DD')}`,
        totalCases: 8456,
        assignedCases: 7892,
        completedCases: 6234,
        totalAmount: 425800000,
        recoveredAmount: 186500000,
        recoveryRate: 43.8,
        avgProcessingDays: 45.2,
        activeOrgs: 156,
        topPerformers: [
          {
            orgName: '华东调解中心',
            recoveryAmount: 12800000,
            recoveryRate: 67.2,
            completedCases: 234
          },
          {
            orgName: '北京金诚律所',
            recoveryAmount: 9650000,
            recoveryRate: 58.9,
            completedCases: 189
          },
          {
            orgName: '南方处置集团',
            recoveryAmount: 8420000,
            recoveryRate: 52.1,
            completedCases: 167
          }
        ]
      };

      // 模拟分析指标
      const mockAnalysisMetrics: AnalysisMetrics = {
        performance: {
          totalRevenue: 186500000,
          revenueGrowth: 15.8,
          caseVolume: 8456,
          volumeGrowth: 23.4,
          avgRecoveryRate: 43.8,
          rateGrowth: 2.1,
          avgProcessingTime: 45.2,
          timeImprovement: -8.5
        },
        distribution: {
          byAmount: [
            { range: '1万以下', count: 2456, percentage: 29.1 },
            { range: '1-5万', count: 3234, percentage: 38.2 },
            { range: '5-10万', count: 1598, percentage: 18.9 },
            { range: '10-50万', count: 945, percentage: 11.2 },
            { range: '50万以上', count: 223, percentage: 2.6 }
          ],
          byRegion: [
            { region: '华东地区', count: 2456, amount: 89500000 },
            { region: '华北地区', count: 1897, amount: 76800000 },
            { region: '华南地区', count: 1634, amount: 68200000 },
            { region: '西南地区', count: 1278, amount: 52300000 },
            { region: '其他地区', count: 1191, amount: 42700000 }
          ],
          byOrgType: [
            { type: '调解中心', count: 3456, performance: 58.9 },
            { type: '律师事务所', count: 2789, performance: 45.6 },
            { type: '资产管理公司', count: 1456, performance: 37.2 },
            { type: '其他机构', count: 755, performance: 28.8 }
          ],
          byStatus: [
            { status: '已完成', count: 6234, percentage: 73.7 },
            { status: '处理中', count: 1658, percentage: 19.6 },
            { status: '待分配', count: 564, percentage: 6.7 }
          ]
        },
        trends: {
          monthlyRecovery: [
            { month: '2024-01', amount: 18500000, rate: 42.1 },
            { month: '2024-02', amount: 19200000, rate: 43.5 },
            { month: '2024-03', amount: 20800000, rate: 44.2 },
            { month: '2024-04', amount: 22100000, rate: 45.8 },
            { month: '2024-05', amount: 21900000, rate: 44.9 },
            { month: '2024-06', amount: 23500000, rate: 46.3 }
          ],
          orgPerformance: [
            { month: '2024-01', topOrgs: 45, avgRate: 48.2 },
            { month: '2024-02', topOrgs: 52, avgRate: 49.1 },
            { month: '2024-03', topOrgs: 58, avgRate: 50.5 },
            { month: '2024-04', topOrgs: 61, avgRate: 51.8 },
            { month: '2024-05', topOrgs: 67, avgRate: 52.3 },
            { month: '2024-06', topOrgs: 73, avgRate: 53.7 }
          ],
          caseFlow: [
            { month: '2024-01', published: 1456, assigned: 1398, completed: 1234 },
            { month: '2024-02', published: 1598, assigned: 1521, completed: 1345 },
            { month: '2024-03', published: 1678, assigned: 1612, completed: 1456 },
            { month: '2024-04', published: 1756, assigned: 1689, completed: 1523 },
            { month: '2024-05', published: 1834, assigned: 1767, completed: 1598 },
            { month: '2024-06', published: 1923, assigned: 1856, completed: 1676 }
          ]
        }
      };

      setReportData(mockReportData);
      setAnalysisMetrics(mockAnalysisMetrics);
    } catch (error) {
      message.error('加载报表数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadReportData();
      }, 30000); // 30秒自动刷新
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // 导出报表
  const handleExportReport = async (format: 'excel' | 'pdf' | 'csv') => {
    try {
      message.success(`正在导出${format.toUpperCase()}格式报表...`);
      // 实际项目中这里会调用导出API
    } catch (error) {
      message.error('导出失败');
    }
  };

  // 生成自定义报表
  const handleCustomReport = async (values: any) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('自定义报表生成成功');
      setCustomReportVisible(false);
      customForm.resetFields();
    } catch (error) {
      message.error('生成失败');
    }
  };

  // 渲染概览仪表板
  const renderOverviewDashboard = () => {
    if (!reportData || !analysisMetrics) return <Spin size="large" />;

    return (
      <div>
        {/* 核心指标 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="案件总量"
                value={reportData.totalCases}
                suffix="件"
                valueStyle={{ color: '#1890ff' }}
                prefix={<FileTextOutlined />}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                <span style={{ color: analysisMetrics.performance.volumeGrowth > 0 ? '#52c41a' : '#f5222d' }}>
                  {analysisMetrics.performance.volumeGrowth > 0 ? <RiseOutlined /> : <FallOutlined />}
                  {Math.abs(analysisMetrics.performance.volumeGrowth)}%
                </span>
                <span style={{ marginLeft: 8 }}>较上期</span>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="回款金额"
                value={reportData.recoveredAmount / 10000}
                suffix="万"
                precision={0}
                valueStyle={{ color: '#52c41a' }}
                prefix={<DollarOutlined />}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                <span style={{ color: analysisMetrics.performance.revenueGrowth > 0 ? '#52c41a' : '#f5222d' }}>
                  {analysisMetrics.performance.revenueGrowth > 0 ? <RiseOutlined /> : <FallOutlined />}
                  {Math.abs(analysisMetrics.performance.revenueGrowth)}%
                </span>
                <span style={{ marginLeft: 8 }}>较上期</span>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="回款率"
                value={reportData.recoveryRate}
                suffix="%"
                precision={1}
                valueStyle={{ color: '#722ed1' }}
                prefix={<TrophyOutlined />}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                <span style={{ color: analysisMetrics.performance.rateGrowth > 0 ? '#52c41a' : '#f5222d' }}>
                  {analysisMetrics.performance.rateGrowth > 0 ? <RiseOutlined /> : <FallOutlined />}
                  {Math.abs(analysisMetrics.performance.rateGrowth)}%
                </span>
                <span style={{ marginLeft: 8 }}>较上期</span>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="平均处理天数"
                value={reportData.avgProcessingDays}
                suffix="天"
                precision={1}
                valueStyle={{ color: '#faad14' }}
                prefix={<ClockCircleOutlined />}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                <span style={{ color: analysisMetrics.performance.timeImprovement < 0 ? '#52c41a' : '#f5222d' }}>
                  {analysisMetrics.performance.timeImprovement < 0 ? <FallOutlined /> : <RiseOutlined />}
                  {Math.abs(analysisMetrics.performance.timeImprovement)}%
                </span>
                <span style={{ marginLeft: 8 }}>较上期</span>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 处理流程统计 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card title="案件处理流程" extra={<EyeOutlined />}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>总案件数</span>
                  <span>{reportData.totalCases}</span>
                </div>
                <Progress percent={100} strokeColor="#1890ff" showInfo={false} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>已分配</span>
                  <span>{reportData.assignedCases}</span>
                </div>
                <Progress 
                  percent={Math.round(reportData.assignedCases / reportData.totalCases * 100)} 
                  strokeColor="#52c41a" 
                  showInfo={false} 
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>已完成</span>
                  <span>{reportData.completedCases}</span>
                </div>
                <Progress 
                  percent={Math.round(reportData.completedCases / reportData.totalCases * 100)} 
                  strokeColor="#722ed1" 
                  showInfo={false} 
                />
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="活跃机构统计" extra={<TeamOutlined />}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="活跃机构数"
                    value={reportData.activeOrgs}
                    suffix="家"
                    valueStyle={{ color: '#13c2c2' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="平均案件数"
                    value={Math.round(reportData.assignedCases / reportData.activeOrgs)}
                    suffix="件/机构"
                    valueStyle={{ color: '#eb2f96' }}
                  />
                </Col>
              </Row>
              <Divider />
              <div>
                <Text strong>机构类型分布</Text>
                <div style={{ marginTop: 8 }}>
                  {analysisMetrics.distribution.byOrgType.map(item => (
                    <div key={item.type} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span>{item.type}</span>
                      <span>{item.count}家 ({item.performance}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 顶级表现者 */}
        <Card title="顶级表现者" extra={<StarOutlined style={{ color: '#faad14' }} />}>
          <Table
            dataSource={reportData.topPerformers}
            pagination={false}
            size="small"
            columns={[
              {
                title: '机构名称',
                dataIndex: 'orgName',
                render: (text: string) => (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TrophyOutlined style={{ color: '#faad14', marginRight: 8 }} />
                    <strong>{text}</strong>
                  </div>
                )
              },
              {
                title: '回款金额',
                dataIndex: 'recoveryAmount',
                render: (amount: number) => (
                  <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>
                    ¥{(amount / 10000).toFixed(0)}万
                  </Text>
                )
              },
              {
                title: '回款率',
                dataIndex: 'recoveryRate',
                render: (rate: number) => (
                  <div>
                    <Text style={{ color: '#722ed1', fontWeight: 'bold' }}>{rate}%</Text>
                    <Progress 
                      percent={rate} 
                      showInfo={false} 
                      strokeColor="#722ed1" 
                      style={{ marginTop: 4 }}
                      size="small"
                    />
                  </div>
                )
              },
              {
                title: '完成案件',
                dataIndex: 'completedCases',
                render: (count: number) => (
                  <Badge count={count} style={{ backgroundColor: '#1890ff' }} />
                )
              }
            ]}
          />
        </Card>
      </div>
    );
  };

  // 渲染业绩分析
  const renderPerformanceAnalysis = () => {
    if (!analysisMetrics) return <Spin size="large" />;

    const monthlyData = analysisMetrics.trends.monthlyRecovery.map(item => ({
      month: item.month,
      回款金额: item.amount / 10000,
      回款率: item.rate
    }));

    return (
      <div>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card title="月度回款趋势" extra={
              <Radio.Group value={chartType} onChange={(e) => setChartType(e.target.value)}>
                <Radio.Button value="line"><LineChartOutlined />线图</Radio.Button>
                <Radio.Button value="column"><BarChartOutlined />柱图</Radio.Button>
                <Radio.Button value="area"><AreaChartOutlined />面积图</Radio.Button>
              </Radio.Group>
            }>
              {/* 这里需要根据实际使用的图表库来实现 */}
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <BarChartOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                  <div>月度回款趋势图表</div>
                  <div style={{ color: '#666', fontSize: '12px' }}>（图表组件集成中）</div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card title="机构业绩排名">
              <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <TrophyOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
                  <div>机构业绩排名图表</div>
                  <div style={{ color: '#666', fontSize: '12px' }}>（图表组件集成中）</div>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="处理效率分析">
              <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <ThunderboltOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                  <div>处理效率分析图表</div>
                  <div style={{ color: '#666', fontSize: '12px' }}>（图表组件集成中）</div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // 渲染分布分析
  const renderDistributionAnalysis = () => {
    if (!analysisMetrics) return <Spin size="large" />;

    return (
      <div>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card title="案件金额分布">
              <List
                dataSource={analysisMetrics.distribution.byAmount}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.range}
                      description={
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{item.count}件</span>
                            <span>{item.percentage}%</span>
                          </div>
                          <Progress percent={item.percentage} showInfo={false} />
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="地区分布">
              <List
                dataSource={analysisMetrics.distribution.byRegion}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.region}
                      description={
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{item.count}件</span>
                            <span>¥{(item.amount / 10000).toFixed(0)}万</span>
                          </div>
                          <Progress 
                            percent={Math.round(item.amount / analysisMetrics.performance.totalRevenue * 100)} 
                            showInfo={false} 
                          />
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Card title="案件状态分布">
              <Row gutter={16}>
                {analysisMetrics.distribution.byStatus.map(item => (
                  <Col span={8} key={item.status}>
                    <Card size="small">
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: 8 }}>
                          {item.count}
                        </div>
                        <div style={{ color: '#666', marginBottom: 8 }}>{item.status}</div>
                        <Progress 
                          type="circle" 
                          percent={item.percentage} 
                          width={80}
                          format={() => `${item.percentage}%`}
                        />
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // 渲染趋势分析
  const renderTrendAnalysis = () => {
    if (!analysisMetrics) return <Spin size="large" />;

    return (
      <div>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card title="案件流转趋势">
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <FundOutlined style={{ fontSize: 48, color: '#722ed1', marginBottom: 16 }} />
                  <div>案件流转趋势图表</div>
                  <div style={{ color: '#666', fontSize: '12px' }}>显示发布、分配、完成的月度趋势</div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Card title="机构成长趋势">
              <div style={{ height: 250 }}>
                <Timeline>
                  {analysisMetrics.trends.orgPerformance.map((item, index) => (
                    <Timeline.Item 
                      key={item.month}
                      color={index === analysisMetrics.trends.orgPerformance.length - 1 ? 'green' : 'blue'}
                    >
                      <div>
                        <strong>{item.month}</strong>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          顶级机构: {item.topOrgs}家 | 平均回款率: {item.avgRate}%
                        </div>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="预测分析">
              <Alert
                message="基于历史数据的预测"
                description={
                  <div>
                    <p>• 下月预计完成案件数: <strong>1,850件</strong></p>
                    <p>• 预计回款金额: <strong>2,580万元</strong></p>
                    <p>• 预计回款率: <strong>47.2%</strong></p>
                    <p>• 建议关注: 处理效率提升</p>
                  </div>
                }
                type="info"
                showIcon
              />
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Button type="primary" ghost>
                  查看详细预测报告
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div className="case-report-analysis">
      {/* 页面头部 */}
      <Card style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <DashboardOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              案件报表分析
            </Title>
            <Text type="secondary">案件处置数据统计、业绩分析、趋势预测</Text>
          </Col>
          <Col>
            <Space>
              <Switch
                checkedChildren="自动刷新"
                unCheckedChildren="手动刷新"
                checked={autoRefresh}
                onChange={setAutoRefresh}
              />
              <Button 
                icon={<ReloadOutlined />}
                onClick={loadReportData}
                loading={loading}
              >
                刷新
              </Button>
              <Button
                icon={<SettingOutlined />}
                onClick={() => setCustomReportVisible(true)}
              >
                自定义报表
              </Button>
              <Button.Group>
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => handleExportReport('excel')}
                >
                  Excel
                </Button>
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => handleExportReport('pdf')}
                >
                  PDF
                </Button>
                <Button 
                  icon={<PrinterOutlined />}
                  onClick={() => window.print()}
                >
                  打印
                </Button>
              </Button.Group>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 筛选控制 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Space>
              <Text>时间范围:</Text>
              <RangePicker
                value={selectedPeriod}
                onChange={(dates) => {
                  if (dates) {
                    setSelectedPeriod(dates as [dayjs.Dayjs, dayjs.Dayjs]);
                  }
                }}
              />
            </Space>
          </Col>
          <Col span={8}>
            <Space>
              <Text>报表类型:</Text>
              <Radio.Group value={reportType} onChange={(e) => setReportType(e.target.value)}>
                <Radio.Button value="overview">概览</Radio.Button>
                <Radio.Button value="performance">业绩</Radio.Button>
                <Radio.Button value="distribution">分布</Radio.Button>
                <Radio.Button value="trends">趋势</Radio.Button>
              </Radio.Group>
            </Space>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Text type="secondary">
              报表周期: {reportData?.period || '加载中...'}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* 报表内容 */}
      <Spin spinning={loading}>
        {reportType === 'overview' && renderOverviewDashboard()}
        {reportType === 'performance' && renderPerformanceAnalysis()}
        {reportType === 'distribution' && renderDistributionAnalysis()}
        {reportType === 'trends' && renderTrendAnalysis()}
      </Spin>

      {/* 自定义报表弹窗 */}
      <Modal
        title="自定义报表生成"
        open={customReportVisible}
        onCancel={() => setCustomReportVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={customForm}
          layout="vertical"
          onFinish={handleCustomReport}
        >
          <Form.Item
            name="reportName"
            label="报表名称"
            rules={[{ required: true, message: '请输入报表名称' }]}
          >
            <Input placeholder="输入自定义报表名称" />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="时间范围"
            rules={[{ required: true, message: '请选择时间范围' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="metrics"
            label="包含指标"
            rules={[{ required: true, message: '请选择要包含的指标' }]}
          >
            <Select mode="multiple" placeholder="选择要分析的指标">
              <Option value="caseVolume">案件量统计</Option>
              <Option value="recoveryRate">回款率分析</Option>
              <Option value="orgPerformance">机构业绩</Option>
              <Option value="regionDistribution">地区分布</Option>
              <Option value="timeAnalysis">时效分析</Option>
              <Option value="trendForecast">趋势预测</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="format"
            label="输出格式"
            rules={[{ required: true, message: '请选择输出格式' }]}
          >
            <Radio.Group>
              <Radio value="excel">Excel表格</Radio>
              <Radio value="pdf">PDF报告</Radio>
              <Radio value="dashboard">在线仪表板</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setCustomReportVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                生成报表
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CaseReportAnalysis;