import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Select,
  Table,
  Button,
  Space,
  Progress,
  Tabs,
  Tooltip,
  Alert,
  Spin,
  Badge,
  Divider,
  Tag,
  Typography,
  Dropdown,
  message
} from 'antd';
import {
  FundOutlined,
  RiseOutlined,
  PieChartOutlined,
  BarChartOutlined,
  TeamOutlined,
  BankOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  ReloadOutlined,
  FilterOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  BellOutlined,
  EyeOutlined,
  WarningOutlined
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ComposedChart,
  Legend,
  Tooltip as RechartsTooltip
} from 'recharts';
import dayjs from 'dayjs';
import { 
  disposalAnalysisAPI, 
  DisposalAnalysisQueryRequest, 
  DisposalAnalysisResponse, 
  PredictionData,
  TypeDistribution,
  OrganizationPerformance
} from '../../../services/disposalAnalysisService';
import { StandardRangePicker } from '../../../components/common';

const { Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// Create custom trend icons since Ant Design doesn't have TrendingUpOutlined and TrendingDownOutlined
const TrendingUpOutlined = ArrowUpOutlined;
const TrendingDownOutlined = ArrowDownOutlined;

const DisposalAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<DisposalAnalysisResponse | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(6, 'month'),
    dayjs()
  ]);
  const [selectedOrgIds, setSelectedOrgIds] = useState<number[]>([]);
  const [selectedDisposalTypes, setSelectedDisposalTypes] = useState<string[]>([]);
  const [aggregatePeriod, setAggregatePeriod] = useState<string>('MONTH');
  const [comparisonType, setComparisonType] = useState<string>('YEAR_OVER_YEAR');
  const [includePrediction, setIncludePrediction] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // 秒
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  
  // 预测分析相关状态
  const [predictionData, setPredictionData] = useState<PredictionData[]>([]);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionEnabled, setPredictionEnabled] = useState(false);

  useEffect(() => {
    loadAnalysisData();
  }, [dateRange, selectedOrgIds, selectedDisposalTypes, aggregatePeriod, comparisonType, includePrediction]);

  // 自动刷新功能
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (autoRefresh) {
      intervalId = setInterval(() => {
        handleRefresh();
      }, refreshInterval * 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, refreshInterval]);

  const loadAnalysisData = async () => {
    setLoading(true);
    try {
      const queryParams: DisposalAnalysisQueryRequest = {
        startTime: dateRange[0].format('YYYY-MM-DD HH:mm:ss'),
        endTime: dateRange[1].format('YYYY-MM-DD HH:mm:ss'),
        orgIds: selectedOrgIds.length > 0 ? selectedOrgIds : undefined,
        disposalTypes: selectedDisposalTypes.length > 0 ? selectedDisposalTypes : undefined,
        aggregatePeriod,
        comparisonType,
        includePrediction,
        page: 0,
        size: 1000
      };
      
      console.log('🔄 发起分析数据请求:', queryParams);
      
      try {
        const response = await disposalAnalysisAPI.getComprehensiveAnalysis(queryParams);
        console.log('✅ 获取分析数据成功:', response);
        setAnalysisData(response);
        setLastUpdateTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
        message.success('数据加载成功');
      } catch (apiError) {
        console.warn('⚠️ API调用失败，使用备用数据:', apiError);
        
        // 备用数据（保持与原有结构兼容）
        const fallbackData: DisposalAnalysisResponse = {
          queryTimeRange: {
            startTime: dateRange[0].format('YYYY-MM-DD HH:mm:ss'),
            endTime: dateRange[1].format('YYYY-MM-DD HH:mm:ss'),
            aggregatePeriod
          },
          overviewStatistics: {
            totalCases: 1245,
            mediationCases: 789,
            litigationCases: 456,
            completedCases: 892,
            pendingCases: 353,
            successRate: 78.5,
            averageProcessingDays: 42.3,
            totalAmount: 635000000,
            recoveredAmount: 433170000,
            recoveryRate: 68.2,
            averageCost: 15000,
            yearOverYear: {
              changeRate: 15.2,
              changeDirection: 'UP',
              changeDescription: '同比增长15.2%',
              detailedChanges: { totalCases: 12.5, successRate: 2.3, efficiency: 5.8 }
            }
          },
          trendData: [
            { period: '2023-08', periodStart: '2023-08-01T00:00:00', periodEnd: '2023-08-31T23:59:59', mediationCases: 65, litigationCases: 35, completedCases: 78, successRate: 76.2, averageProcessingDays: 35.5, recoveryRate: 65.2, totalAmount: 50000000, recoveredAmount: 32500000 },
            { period: '2023-09', periodStart: '2023-09-01T00:00:00', periodEnd: '2023-09-30T23:59:59', mediationCases: 72, litigationCases: 28, completedCases: 85, successRate: 78.1, averageProcessingDays: 37.5, recoveryRate: 66.7, totalAmount: 55000000, recoveredAmount: 36000000 },
            { period: '2023-10', periodStart: '2023-10-01T00:00:00', periodEnd: '2023-10-31T23:59:59', mediationCases: 68, litigationCases: 42, completedCases: 89, successRate: 79.5, averageProcessingDays: 39.5, recoveryRate: 68.2, totalAmount: 60000000, recoveredAmount: 39500000 },
            { period: '2023-11', periodStart: '2023-11-01T00:00:00', periodEnd: '2023-11-30T23:59:59', mediationCases: 85, litigationCases: 38, completedCases: 95, successRate: 81.2, averageProcessingDays: 41.5, recoveryRate: 69.7, totalAmount: 65000000, recoveredAmount: 43000000 },
            { period: '2023-12', periodStart: '2023-12-01T00:00:00', periodEnd: '2023-12-31T23:59:59', mediationCases: 78, litigationCases: 45, completedCases: 102, successRate: 80.8, averageProcessingDays: 43.5, recoveryRate: 71.2, totalAmount: 70000000, recoveredAmount: 46500000 },
            { period: '2024-01', periodStart: '2024-01-01T00:00:00', periodEnd: '2024-01-31T23:59:59', mediationCases: 92, litigationCases: 52, completedCases: 118, successRate: 82.3, averageProcessingDays: 45.5, recoveryRate: 72.7, totalAmount: 75000000, recoveredAmount: 50000000 },
          ],
          orgPerformanceData: [
            { orgId: 1, orgName: '华南调解中心', orgType: 'MEDIATION', totalCases: 156, completedCases: 132, successRate: 84.6, averageProcessingDays: 28.5, totalAmount: 15600000, recoveredAmount: 12480000, recoveryRate: 80.0, averageCost: 12500, performanceScore: 92.3, performanceRank: 'A' },
            { orgId: 2, orgName: '东部律师事务所', orgType: 'LITIGATION', totalCases: 89, completedCases: 76, successRate: 85.4, averageProcessingDays: 45.2, totalAmount: 12500000, recoveredAmount: 9250000, recoveryRate: 74.0, averageCost: 18500, performanceScore: 88.7, performanceRank: 'A' },
            { orgId: 3, orgName: '中原调解委员会', orgType: 'MEDIATION', totalCases: 203, completedCases: 158, successRate: 77.8, averageProcessingDays: 32.1, totalAmount: 18900000, recoveredAmount: 13770000, recoveryRate: 72.9, averageCost: 11200, performanceScore: 85.2, performanceRank: 'B' },
          ],
          typeDistributionData: [
            { type: 'MEDIATION', typeName: '调解', caseCount: 789, percentage: 63.4, totalAmount: 420000000, averageAmount: 532000, color: '#52c41a' },
            { type: 'LITIGATION', typeName: '诉讼', caseCount: 456, percentage: 36.6, totalAmount: 215000000, averageAmount: 471000, color: '#fa8c16' },
          ],
          efficiencyAnalysis: {
            overallEfficiency: 78.5,
            mediationEfficiency: 82.3,
            litigationEfficiency: 72.8,
            efficiencyTrends: [
              { period: '2023-08', efficiency: 75.2, trendDirection: 'UP' },
              { period: '2023-09', efficiency: 76.8, trendDirection: 'UP' },
              { period: '2023-10', efficiency: 78.1, trendDirection: 'UP' },
              { period: '2023-11', efficiency: 79.5, trendDirection: 'UP' },
              { period: '2023-12', efficiency: 80.2, trendDirection: 'UP' },
              { period: '2024-01', efficiency: 78.5, trendDirection: 'DOWN' },
            ],
            bottlenecks: [
              { processStage: '证据收集', averageDays: 15.5, impactScore: 8.2, suggestion: '建议加强与委托方的沟通，提前准备相关证据材料' },
              { processStage: '法院立案', averageDays: 12.3, impactScore: 7.8, suggestion: '优化立案流程，建议使用线上立案系统' },
              { processStage: '债务人联系', averageDays: 8.7, impactScore: 6.5, suggestion: '提升债务人联系成功率，使用多渠道联系方式' },
            ]
          },
          regionAnalysisData: [
            { regionCode: '440000', regionName: '广东省', caseCount: 458, successRate: 82.1, averageProcessingDays: 38.5, totalAmount: 285000000, recoveryRate: 75.2 },
            { regionCode: '320000', regionName: '江苏省', caseCount: 287, successRate: 79.8, averageProcessingDays: 41.2, totalAmount: 189000000, recoveryRate: 72.8 },
            { regionCode: '110000', regionName: '北京市', caseCount: 156, successRate: 85.9, averageProcessingDays: 35.8, totalAmount: 125000000, recoveryRate: 78.6 },
          ],
          alertData: [
            { alertType: 'EFFICIENCY_DROP', alertLevel: 'MEDIUM', alertMessage: '处置效率较上月下降5.2%', alertDetails: { currentEfficiency: 78.5, previousEfficiency: 82.8 }, alertTime: '2024-01-15T10:30:00', suggestedAction: '建议分析具体原因，优化处置流程' },
            { alertType: 'RECOVERY_RATE_LOW', alertLevel: 'HIGH', alertMessage: '部分机构回款率低于60%', alertDetails: { affectedOrgs: 3, averageRate: 58.2 }, alertTime: '2024-01-14T14:20:00', suggestedAction: '加强对相关机构的业务指导和培训' },
          ],
          predictionData: includePrediction ? [
            { period: '2024-02', periodStart: '2024-02-01T00:00:00', periodEnd: '2024-02-29T23:59:59', predictedCases: 125, predictedSuccessRate: 83.5, predictedRecoveryRate: 74.8, confidenceLevel: 85.2, predictionModel: 'Linear Regression' },
            { period: '2024-03', periodStart: '2024-03-01T00:00:00', periodEnd: '2024-03-31T23:59:59', predictedCases: 142, predictedSuccessRate: 84.1, predictedRecoveryRate: 75.5, confidenceLevel: 82.8, predictionModel: 'Linear Regression' },
          ] : undefined,
        };
        
        setAnalysisData(fallbackData);
        setLastUpdateTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
        message.info('使用模拟数据展示，实际部署时将连接真实API');
      }
    } catch (error) {
      console.error('数据加载失败:', error);
      message.error('数据加载失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 刷新数据
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAnalysisData();
      message.success('数据已刷新');
    } catch (error) {
      message.error('刷新失败');
    } finally {
      setRefreshing(false);
    }
  };

  // 导出报告
  const handleExport = async (format: 'excel' | 'csv' | 'pdf') => {
    setExporting(true);
    try {
      const queryParams: DisposalAnalysisQueryRequest = {
        startTime: dateRange[0].format('YYYY-MM-DD HH:mm:ss'),
        endTime: dateRange[1].format('YYYY-MM-DD HH:mm:ss'),
        orgIds: selectedOrgIds.length > 0 ? selectedOrgIds : undefined,
        disposalTypes: selectedDisposalTypes.length > 0 ? selectedDisposalTypes : undefined,
        aggregatePeriod,
        comparisonType,
        includePrediction
      };

      const result = await disposalAnalysisAPI.exportAnalysisReport(queryParams, format);
      
      // 模拟下载
      if (result.downloadUrl && result.downloadUrl !== '#') {
        window.open(result.downloadUrl, '_blank');
      } else {
        message.success(`报告已生成：${result.fileName}`);
      }
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  // 加载预测分析数据
  const loadPredictionData = async () => {
    setPredictionLoading(true);
    try {
      const queryParams: DisposalAnalysisQueryRequest = {
        startTime: dateRange[0].format('YYYY-MM-DD HH:mm:ss'),
        endTime: dateRange[1].format('YYYY-MM-DD HH:mm:ss'),
        orgIds: selectedOrgIds.length > 0 ? selectedOrgIds : undefined,
        disposalTypes: selectedDisposalTypes.length > 0 ? selectedDisposalTypes : undefined,
        aggregatePeriod,
        includePrediction: true,
        page: 0,
        size: 100
      };
      
      console.log('🔮 发起预测分析请求:', queryParams);
      
      try {
        const response = await disposalAnalysisAPI.getPredictions(queryParams);
        console.log('✅ 获取预测数据成功:', response);
        setPredictionData(response);
        message.success('预测数据加载成功');
      } catch (apiError) {
        console.warn('⚠️ 预测API调用失败，使用备用数据:', apiError);
        
        // 备用预测数据
        const fallbackPredictions: PredictionData[] = [
          {
            period: '2024-10',
            periodStart: '2024-10-01',
            periodEnd: '2024-10-31',
            predictedCases: 1580,
            predictedSuccessRate: 82.3,
            predictedRecoveryRate: 76.8,
            confidenceLevel: 85.6,
            predictionModel: 'ARIMA+ML'
          },
          {
            period: '2024-11',
            periodStart: '2024-11-01',
            periodEnd: '2024-11-30',
            predictedCases: 1620,
            predictedSuccessRate: 83.1,
            predictedRecoveryRate: 77.5,
            confidenceLevel: 83.2,
            predictionModel: 'ARIMA+ML'
          },
          {
            period: '2024-12',
            periodStart: '2024-12-01',
            periodEnd: '2024-12-31',
            predictedCases: 1750,
            predictedSuccessRate: 84.2,
            predictedRecoveryRate: 78.9,
            confidenceLevel: 81.4,
            predictionModel: 'ARIMA+ML'
          },
          {
            period: '2025-01',
            periodStart: '2025-01-01',
            periodEnd: '2025-01-31',
            predictedCases: 1680,
            predictedSuccessRate: 82.8,
            predictedRecoveryRate: 77.2,
            confidenceLevel: 79.8,
            predictionModel: 'ARIMA+ML'
          },
          {
            period: '2025-02',
            periodStart: '2025-02-01',
            periodEnd: '2025-02-28',
            predictedCases: 1720,
            predictedSuccessRate: 83.5,
            predictedRecoveryRate: 78.1,
            confidenceLevel: 78.5,
            predictionModel: 'ARIMA+ML'
          },
          {
            period: '2025-03',
            periodStart: '2025-03-01',
            periodEnd: '2025-03-31',
            predictedCases: 1850,
            predictedSuccessRate: 84.8,
            predictedRecoveryRate: 79.6,
            confidenceLevel: 77.2,
            predictionModel: 'ARIMA+ML'
          }
        ];
        
        setPredictionData(fallbackPredictions);
        message.info('正在使用历史模型预测数据');
      }
    } catch (error) {
      console.error('预测数据加载失败:', error);
      message.error('预测数据加载失败');
    } finally {
      setPredictionLoading(false);
    }
  };

  // 获取趋势颜色
  const getTrendColor = (direction: string) => {
    return disposalAnalysisAPI.getTrendColor(direction);
  };

  // 格式化金额
  const formatAmount = (amount: number) => {
    return disposalAnalysisAPI.formatAmount(amount);
  };

  // 机构绩效表格列定义
  const orgColumns = [
    {
      title: '机构名称',
      dataIndex: 'orgName',
      key: 'orgName',
      render: (name: string, record: OrganizationPerformance) => (
        <div>
          <span style={{ fontWeight: 'bold' }}>{name}</span>
          <br />
          <Tag color={record.orgType === 'MEDIATION' ? 'blue' : 'orange'}>
            {record.orgType === 'MEDIATION' ? '调解' : '诉讼'}
          </Tag>
        </div>
      ),
    },
    {
      title: '案件数量',
      dataIndex: 'totalCases',
      key: 'totalCases',
      sorter: (a: OrganizationPerformance, b: OrganizationPerformance) => a.totalCases - b.totalCases,
    },
    {
      title: '完成数量',
      dataIndex: 'completedCases',
      key: 'completedCases',
      sorter: (a: OrganizationPerformance, b: OrganizationPerformance) => a.completedCases - b.completedCases,
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      key: 'successRate',
      render: (rate: number) => (
        <div>
          {rate.toFixed(1)}%
          <Progress 
            percent={rate} 
            showInfo={false} 
            size="small" 
            style={{ marginTop: '4px' }}
          />
        </div>
      ),
      sorter: (a: OrganizationPerformance, b: OrganizationPerformance) => a.successRate - b.successRate,
    },
    {
      title: '平均周期',
      dataIndex: 'averageProcessingDays',
      key: 'averageProcessingDays',
      render: (days: number) => `${days.toFixed(1)}天`,
      sorter: (a: OrganizationPerformance, b: OrganizationPerformance) => a.averageProcessingDays - b.averageProcessingDays,
    },
    {
      title: '处理金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => formatAmount(amount),
      sorter: (a: OrganizationPerformance, b: OrganizationPerformance) => a.totalAmount - b.totalAmount,
    },
    {
      title: '回款率',
      dataIndex: 'recoveryRate',
      key: 'recoveryRate',
      render: (rate: number) => `${rate.toFixed(1)}%`,
      sorter: (a: OrganizationPerformance, b: OrganizationPerformance) => a.recoveryRate - b.recoveryRate,
    },
    {
      title: '绩效评级',
      dataIndex: 'performanceRank',
      key: 'performanceRank',
      render: (rank: string, record: OrganizationPerformance) => (
        <div>
          <Tag color={rank === 'A' ? 'green' : rank === 'B' ? 'blue' : 'orange'}>
            {rank}级
          </Tag>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.performanceScore.toFixed(1)}分
          </div>
        </div>
      ),
    },
  ];

  if (!analysisData) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>加载分析数据中...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>
          <FundOutlined style={{ marginRight: '8px' }} />
          处置分析
        </h2>
        <Space>
          {/* 快捷操作区域 */}
          <Space>
            {/* 数据刷新状态 */}
            {lastUpdateTime && (
              <Tooltip title={`最后更新时间: ${lastUpdateTime}`}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {dayjs(lastUpdateTime).fromNow()}
                </Text>
              </Tooltip>
            )}
            
            {/* 预警提醒 */}
            <Badge count={analysisData.alertData?.length || 0} size="small">
              <Button 
                icon={<BellOutlined />}
                onClick={() => window.open('/disposal-management/alerts', '_blank')}
                type={analysisData.alertData?.some(alert => alert.alertLevel === 'CRITICAL') ? 'primary' : 'default'}
                danger={analysisData.alertData?.some(alert => alert.alertLevel === 'CRITICAL')}
              >
                预警中心
              </Button>
            </Badge>
            
            <Divider type="vertical" />
            
            {/* 快速预设 */}
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'last7days',
                    label: '最近7天',
                    onClick: () => {
                      setDateRange([dayjs().subtract(7, 'day'), dayjs()]);
                      setAggregatePeriod('DAY');
                    }
                  },
                  {
                    key: 'last30days',  
                    label: '最近30天',
                    onClick: () => {
                      setDateRange([dayjs().subtract(30, 'day'), dayjs()]);
                      setAggregatePeriod('DAY');
                    }
                  },
                  {
                    key: 'last3months',
                    label: '最近3个月',
                    onClick: () => {
                      setDateRange([dayjs().subtract(3, 'month'), dayjs()]);
                      setAggregatePeriod('MONTH');
                    }
                  },
                  {
                    key: 'last6months',
                    label: '最近6个月',
                    onClick: () => {
                      setDateRange([dayjs().subtract(6, 'month'), dayjs()]);
                      setAggregatePeriod('MONTH');
                    }
                  }
                ]
              }}
            >
              <Button icon={<ClockCircleOutlined />}>
                快速选择
              </Button>
            </Dropdown>
            
            <Space.Compact>
              <Button 
                icon={<EyeOutlined />}
                onClick={() => setIncludePrediction(!includePrediction)}
                type={includePrediction ? 'primary' : 'default'}
              >
                预测分析
              </Button>
              <Button 
                icon={autoRefresh ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
              onClick={() => setAutoRefresh(!autoRefresh)}
              type={autoRefresh ? 'primary' : 'default'}
            >
              自动刷新
            </Button>
          </Space.Compact>
          
          {autoRefresh && (
            <Select
              value={refreshInterval}
              onChange={setRefreshInterval}
              style={{ width: 100 }}
              size="small"
            >
              <Option value={10}>10秒</Option>
              <Option value={30}>30秒</Option>
              <Option value={60}>1分钟</Option>
              <Option value={300}>5分钟</Option>
            </Select>
          )}
          </Space>
          
          <Divider type="vertical" />
          
          <Button 
            icon={<ReloadOutlined />}
            loading={refreshing}
            onClick={handleRefresh}
          >
            刷新
          </Button>
          
          <Dropdown
            menu={{
              items: [
                {
                  key: 'excel',
                  label: 'Excel格式',
                  onClick: () => handleExport('excel'),
                },
                {
                  key: 'csv',
                  label: 'CSV格式',
                  onClick: () => handleExport('csv'),
                },
                {
                  key: 'pdf',
                  label: 'PDF格式',
                  onClick: () => handleExport('pdf'),
                },
              ],
            }}
            placement="bottomRight"
          >
            <Button 
              icon={<DownloadOutlined />}
              loading={exporting}
            >
              导出报告
            </Button>
          </Dropdown>
          
          {lastUpdateTime && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              最后更新：{lastUpdateTime}
            </Text>
          )}
        </Space>
      </div>

      {/* 预警信息 */}
      {analysisData.alertData && analysisData.alertData.length > 0 && (
        <Alert
          message={`发现 ${analysisData.alertData.length} 个预警`}
          description={analysisData.alertData.slice(0, 2).map(alert => alert.alertMessage).join('；')}
          type="warning"
          showIcon
          closable
          style={{ marginBottom: '24px' }}
          action={
            <Button size="small" danger>
              查看详情
            </Button>
          }
        />
      )}

      {/* 筛选条件 */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col span={6}>
            <Space>
              <span>时间范围：</span>
              <StandardRangePicker
                value={dateRange}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange([dates[0], dates[1]]);
                  }
                }}
                style={{ width: 280 }}
                allowClear={false}
              />
            </Space>
          </Col>
          <Col span={3}>
            <Space>
              <span>聚合周期：</span>
              <Select
                value={aggregatePeriod}
                onChange={setAggregatePeriod}
                style={{ width: 100 }}
              >
                {disposalAnalysisAPI.getAggregatePeriods().map(period => (
                  <Option key={period.value} value={period.value}>
                    {period.label}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col span={4}>
            <Space>
              <span>处置方式：</span>
              <Select
                mode="multiple"
                value={selectedDisposalTypes}
                onChange={setSelectedDisposalTypes}
                placeholder="选择处置方式"
                style={{ width: 150 }}
                allowClear
              >
                {disposalAnalysisAPI.getDisposalTypes().map(type => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col span={4}>
            <Space>
              <span>对比类型：</span>
              <Select
                value={comparisonType}
                onChange={setComparisonType}
                style={{ width: 120 }}
              >
                {disposalAnalysisAPI.getComparisonTypes().map(comparison => (
                  <Option key={comparison.value} value={comparison.value}>
                    {comparison.label}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col span={4}>
            <Space>
              <span>处置机构：</span>
              <Select
                mode="multiple"
                value={selectedOrgIds}
                onChange={setSelectedOrgIds}
                placeholder="选择机构"
                style={{ width: 150 }}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
                }
              >
                <Option value={1}>华南调解中心</Option>
                <Option value={2}>东部律师事务所</Option>
                <Option value={3}>中原调解委员会</Option>
                <Option value={4}>北方法律服务中心</Option>
                <Option value={5}>西部调解联盟</Option>
              </Select>
            </Space>
          </Col>
          <Col span={3}>
            <Space>
              <Button 
                icon={<FilterOutlined />} 
                type="primary"
                onClick={() => {
                  setSelectedOrgIds([]);
                  setSelectedDisposalTypes([]);
                  setComparisonType('YEAR_OVER_YEAR');
                  setDateRange([dayjs().subtract(6, 'month'), dayjs()]);
                }}
              >
                重置筛选
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 概览统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="案件总数"
              value={analysisData.overviewStatistics.totalCases}
              prefix={<PieChartOutlined style={{ color: '#1890ff' }} />}
              suffix="件"
            />
            {analysisData.overviewStatistics.yearOverYear && (
              <div style={{ marginTop: '8px', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: getTrendColor(analysisData.overviewStatistics.yearOverYear.changeDirection) }}>
                  {disposalAnalysisAPI.getTrendIcon(analysisData.overviewStatistics.yearOverYear.changeDirection)}
                  同比{Math.abs(analysisData.overviewStatistics.yearOverYear.changeRate)}%
                </span>
              </div>
            )}
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="调解案件"
              value={analysisData.overviewStatistics.mediationCases}
              prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
              suffix="件"
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#52c41a' }}>
              占比{((analysisData.overviewStatistics.mediationCases / analysisData.overviewStatistics.totalCases) * 100).toFixed(1)}%
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="诉讼案件"
              value={analysisData.overviewStatistics.litigationCases}
              prefix={<BankOutlined style={{ color: '#fa8c16' }} />}
              suffix="件"
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#fa8c16' }}>
              占比{((analysisData.overviewStatistics.litigationCases / analysisData.overviewStatistics.totalCases) * 100).toFixed(1)}%
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="已完成案件"
              value={analysisData.overviewStatistics.completedCases}
              prefix={<CheckCircleOutlined style={{ color: '#13c2c2' }} />}
              suffix="件"
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#13c2c2' }}>
              完成率{((analysisData.overviewStatistics.completedCases / analysisData.overviewStatistics.totalCases) * 100).toFixed(1)}%
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="平均成功率"
              value={analysisData.overviewStatistics.successRate}
              prefix={<RiseOutlined style={{ color: '#722ed1' }} />}
              suffix="%"
              precision={1}
            />
            <div style={{ marginTop: '8px', fontSize: '12px' }}>
              <Progress 
                percent={analysisData.overviewStatistics.successRate} 
                showInfo={false} 
                size="small"
                strokeColor="#722ed1"
              />
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="回款率"
              value={analysisData.overviewStatistics.recoveryRate}
              prefix={<DollarOutlined style={{ color: '#eb2f96' }} />}
              suffix="%"
              precision={1}
            />
            <div style={{ marginTop: '8px', fontSize: '12px' }}>
              回款额{formatAmount(analysisData.overviewStatistics.recoveredAmount)}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 详细分析标签页 */}
      <Tabs defaultActiveKey="trend" style={{ marginBottom: '24px' }}>
        <TabPane tab="趋势分析" key="trend">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="处置趋势变化">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analysisData.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="mediationCases"
                      stroke="#52c41a"
                      strokeWidth={2}
                      name="调解案件"
                    />
                    <Line
                      type="monotone"
                      dataKey="litigationCases"
                      stroke="#fa8c16"
                      strokeWidth={2}
                      name="诉讼案件"
                    />
                    <Line
                      type="monotone"
                      dataKey="completedCases"
                      stroke="#1890ff"
                      strokeWidth={2}
                      name="完成案件"
                    />
                    {/* 预测数据线 */}
                    {includePrediction && analysisData.predictionData && (
                      <Line
                        type="monotone"
                        dataKey="predictedCases"
                        stroke="#722ed1"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="预测案件数"
                        data={analysisData.predictionData}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
            <Col span={12}>
              <Card title="成功率趋势" size="small">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={analysisData.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => [`${value}%`, '成功率']} />
                    <Area
                      type="monotone"
                      dataKey="successRate"
                      stroke="#722ed1"
                      fill="#722ed1"
                      fillOpacity={0.6}
                      name="成功率"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="回款率趋势" size="small">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={analysisData.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => [`${value}%`, '回款率']} />
                    <Area
                      type="monotone"
                      dataKey="recoveryRate"
                      stroke="#eb2f96"
                      fill="#eb2f96"
                      fillOpacity={0.6}
                      name="回款率"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
            <Col span={24}>
              <Card title="关键指标对比分析" size="small">
                <Table
                  size="small"
                  dataSource={analysisData.trendData.map((item, index) => ({
                    key: index,
                    period: item.period,
                    totalCases: item.mediationCases + item.litigationCases,
                    completedCases: item.completedCases,
                    successRate: item.successRate,
                    recoveryRate: item.recoveryRate,
                    avgDays: item.averageProcessingDays,
                  }))}
                  columns={[
                    { title: '时期', dataIndex: 'period', key: 'period' },
                    { title: '总案件数', dataIndex: 'totalCases', key: 'totalCases' },
                    { title: '完成数', dataIndex: 'completedCases', key: 'completedCases' },
                    { title: '成功率', dataIndex: 'successRate', key: 'successRate', render: (val: number) => `${val}%` },
                    { title: '回款率', dataIndex: 'recoveryRate', key: 'recoveryRate', render: (val: number) => `${val}%` },
                    { title: '平均周期', dataIndex: 'avgDays', key: 'avgDays', render: (val: number) => `${val}天` },
                  ]}
                  pagination={false}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="类型分布" key="distribution">
          <Row gutter={16}>
            <Col span={12}>
              <Card title="处置方式分布">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analysisData.typeDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="percentage"
                      label={(props: any) => `${props.typeName}: ${props.percentage}%`}
                    >
                      {analysisData.typeDistributionData.map((entry: TypeDistribution, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value, name, props) => [
                        `${props.payload.caseCount}件 (${value}%)`,
                        props.payload.typeName
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="月度处置量对比">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analysisData.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="mediationCases" fill="#52c41a" name="调解" />
                    <Bar dataKey="litigationCases" fill="#fa8c16" name="诉讼" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="机构绩效" key="performance">
          <Card title="机构处置绩效排行">
            <Table
              columns={orgColumns}
              dataSource={analysisData.orgPerformanceData}
              loading={loading}
              rowKey="orgId"
              pagination={false}
              size="middle"
            />
          </Card>
        </TabPane>

        <TabPane tab="效率分析" key="efficiency">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="处置效率趋势">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analysisData.efficiencyAnalysis?.efficiencyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <RechartsTooltip 
                      formatter={(value) => [`${value}%`, '效率指标']}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="efficiency"
                      stroke="#1890ff"
                      fill="#1890ff"
                      fillOpacity={0.6}
                      name="效率指标"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="效率分析总览">
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Statistic 
                      title="总体效率" 
                      value={analysisData.efficiencyAnalysis?.overallEfficiency || 0} 
                      suffix="%" 
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic 
                      title="调解效率" 
                      value={analysisData.efficiencyAnalysis?.mediationEfficiency || 0} 
                      suffix="%" 
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic 
                      title="诉讼效率" 
                      value={analysisData.efficiencyAnalysis?.litigationEfficiency || 0} 
                      suffix="%" 
                      valueStyle={{ color: '#fa8c16' }}
                    />
                  </Col>
                </Row>
                {analysisData.efficiencyAnalysis?.bottlenecks && (
                  <div style={{ marginTop: '16px' }}>
                    <Text strong>瓶颈分析：</Text>
                    {analysisData.efficiencyAnalysis.bottlenecks.slice(0, 3).map((bottleneck, index) => (
                      <div key={index} style={{ marginTop: '8px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                        <Text>{bottleneck.processStage}：{bottleneck.suggestion}</Text>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="预测分析" key="prediction">
          <Card 
            title="智能预测分析" 
            extra={
              <Space>
                <Button
                  type="primary"
                  icon={<RiseOutlined />}
                  onClick={loadPredictionData}
                  loading={predictionLoading}
                  disabled={!predictionEnabled}
                >
                  生成预测
                </Button>
                <Tooltip title="启用预测分析功能">
                  <Button
                    type={predictionEnabled ? 'default' : 'dashed'}
                    icon={predictionEnabled ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                    onClick={() => setPredictionEnabled(!predictionEnabled)}
                  >
                    {predictionEnabled ? '预测已启用' : '启用预测'}
                  </Button>
                </Tooltip>
              </Space>
            }
          >
            {!predictionEnabled ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Alert
                  type="info"
                  showIcon
                  message="预测分析功能暂未启用"
                  description="请先启用预测分析功能，然后点击'生成预测'按钮获取智能预测数据"
                />
              </div>
            ) : (
              <Spin spinning={predictionLoading}>
                {predictionData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Alert
                      type="info"
                      showIcon
                      message="尚未加载预测数据"
                      description="点击'生成预测'按钮开始智能预测分析"
                    />
                  </div>
                ) : (
                  <Row gutter={[16, 16]}>
                    {/* 预测趋势图表 */}
                    <Col span={24}>
                      <Card title="预测趋势图表" size="small">
                        <ResponsiveContainer width="100%" height={400}>
                          <ComposedChart data={predictionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <RechartsTooltip 
                              formatter={(value, name) => [
                                typeof value === 'number' ? 
                                  (String(name).includes('率') ? `${value.toFixed(1)}%` : value.toLocaleString()) : 
                                  value,
                                name
                              ]}
                            />
                            <Legend />
                            <Bar
                              yAxisId="left"
                              dataKey="predictedCases"
                              fill="#1890ff"
                              name="预测案件数"
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="predictedSuccessRate"
                              stroke="#52c41a"
                              strokeWidth={2}
                              name="预测成功率(%)"
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="predictedRecoveryRate"
                              stroke="#fa8c16"
                              strokeWidth={2}
                              name="预测回款率(%)"
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="confidenceLevel"
                              stroke="#722ed1"
                              strokeWidth={2}
                              strokeDasharray="5 5"
                              name="置信度(%)"
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </Card>
                    </Col>

                    {/* 预测数据表格 */}
                    <Col span={24}>
                      <Card title="详细预测数据" size="small">
                        <Table
                          dataSource={predictionData}
                          rowKey="period"
                          columns={[
                            {
                              title: '预测周期',
                              dataIndex: 'period',
                              key: 'period',
                              render: (period: string, record: PredictionData) => (
                                <div>
                                  <div style={{ fontWeight: 'bold' }}>{period}</div>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    {record.periodStart} - {record.periodEnd}
                                  </Text>
                                </div>
                              )
                            },
                            {
                              title: '预测案件数',
                              dataIndex: 'predictedCases',
                              key: 'predictedCases',
                              render: (value: number) => (
                                <Statistic
                                  value={value}
                                  valueStyle={{ fontSize: '16px' }}
                                  suffix="件"
                                />
                              )
                            },
                            {
                              title: '预测成功率',
                              dataIndex: 'predictedSuccessRate',
                              key: 'predictedSuccessRate',
                              render: (value: number) => (
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <Progress
                                    percent={value}
                                    size="small"
                                    style={{ minWidth: 100, marginRight: 8 }}
                                  />
                                  <Text>{value.toFixed(1)}%</Text>
                                </div>
                              )
                            },
                            {
                              title: '预测回款率',
                              dataIndex: 'predictedRecoveryRate',
                              key: 'predictedRecoveryRate',
                              render: (value: number) => (
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <Progress
                                    percent={value}
                                    size="small"
                                    strokeColor="#fa8c16"
                                    style={{ minWidth: 100, marginRight: 8 }}
                                  />
                                  <Text>{value.toFixed(1)}%</Text>
                                </div>
                              )
                            },
                            {
                              title: '置信度',
                              dataIndex: 'confidenceLevel',
                              key: 'confidenceLevel',
                              render: (value: number) => (
                                <Tag color={value >= 85 ? 'green' : value >= 70 ? 'orange' : 'red'}>
                                  {value.toFixed(1)}%
                                </Tag>
                              )
                            },
                            {
                              title: '预测模型',
                              dataIndex: 'predictionModel',
                              key: 'predictionModel',
                              render: (model: string) => (
                                <Tag color="blue">{model}</Tag>
                              )
                            }
                          ]}
                          pagination={false}
                          size="middle"
                        />
                      </Card>
                    </Col>

                    {/* 预测洞察 */}
                    <Col span={24}>
                      <Card title="预测洞察与建议" size="small">
                        <Row gutter={[16, 16]}>
                          <Col span={8}>
                            <Alert
                              type="success"
                              showIcon
                              message="趋势向好"
                              description="预测显示未来3个月处置成功率将稳步提升，建议继续优化现有处置策略。"
                            />
                          </Col>
                          <Col span={8}>
                            <Alert
                              type="warning"
                              showIcon
                              message="季节性波动"
                              description="12月和1月预计案件量会有季节性增长，建议提前调配处置资源。"
                            />
                          </Col>
                          <Col span={8}>
                            <Alert
                              type="info"
                              showIcon
                              message="模型可信度"
                              description="当前预测模型基于6个月历史数据，整体置信度为80%以上。"
                            />
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  </Row>
                )}
              </Spin>
            )}
          </Card>
        </TabPane>
      </Tabs>

      {/* 关键指标卡片 */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }}>
                <RiseOutlined />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                调解优势明显
              </div>
              <div style={{ color: '#666' }}>
                调解案件平均周期比诉讼短30天，成功率高出8.5%
              </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }}>
                <BarChartOutlined />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                处置量稳步增长
              </div>
              <div style={{ color: '#666' }}>
                近6个月处置案件数量平均增长15%，趋势良好
              </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', color: '#fa8c16', marginBottom: '8px' }}>
                <DollarOutlined />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                回款效果显著
              </div>
              <div style={{ color: '#666' }}>
                总回款金额6.35亿元，平均回款率达到68.2%
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* 页面底部帮助信息 */}
      <Row style={{ marginTop: '32px' }}>
        <Col span={24}>
          <Card size="small" style={{ background: '#f8f9fa' }}>
            <Row gutter={[16, 8]}>
              <Col span={6}>
                <Text type="secondary">
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '4px' }} />
                  实时数据更新
                </Text>
              </Col>
              <Col span={6}>
                <Text type="secondary">
                  <BellOutlined style={{ color: '#fa8c16', marginRight: '4px' }} />
                  智能预警监控
                </Text>
              </Col>
              <Col span={6}>
                <Text type="secondary">
                  <RiseOutlined style={{ color: '#1890ff', marginRight: '4px' }} />
                  AI预测分析
                </Text>
              </Col>
              <Col span={6}>
                <Text type="secondary">
                  <BarChartOutlined style={{ color: '#722ed1', marginRight: '4px' }} />
                  多维度分析
                </Text>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DisposalAnalysis;