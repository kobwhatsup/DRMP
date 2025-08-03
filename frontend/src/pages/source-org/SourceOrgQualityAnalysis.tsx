import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Select, DatePicker, Button, Space, 
  Table, Tag, Tabs, Alert, Spin, message, Progress, Badge, Tooltip
} from 'antd';
import {
  CheckCircleOutlined, WarningOutlined, ExclamationCircleOutlined,
  RiseOutlined, FallOutlined, EyeOutlined, 
  DownloadOutlined, ReloadOutlined, SearchOutlined, FileTextOutlined,
  InfoCircleOutlined, BugOutlined, SafetyCertificateOutlined
} from '@ant-design/icons';
// import { Line, Column, Gauge, Radar } from '@ant-design/plots';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

// 数据接口定义
interface QualityAnalysisData {
  summary: {
    overallScore: number;
    completeRate: number;
    accuracyRate: number;
    disputeRate: number;
    improvedOrgs: number;
    decliningOrgs: number;
  };
  qualityTrend: Array<{
    month: string;
    overallScore: number;
    completeRate: number;
    accuracyRate: number;
    disputeRate: number;
  }>;
  orgQualityList: Array<{
    orgId: number;
    orgName: string;
    orgType: string;
    qualityScore: number;
    completeRate: number;
    accuracyRate: number;
    disputeRate: number;
    totalCases: number;
    qualityTrend: 'UP' | 'DOWN' | 'STABLE';
    lastAuditDate: string;
    issues: Array<{
      type: string;
      count: number;
      severity: 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
  }>;
  qualityDimensions: Array<{
    dimension: string;
    score: number;
    industry_avg: number;
  }>;
  issueDistribution: Array<{
    issueType: string;
    count: number;
    percentage: number;
    trend: string;
  }>;
  qualityRanking: Array<{
    rank: number;
    orgName: string;
    score: number;
    improvement: number;
  }>;
}

const SourceOrgQualityAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [qualityData, setQualityData] = useState<QualityAnalysisData | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(6, 'month'),
    dayjs()
  ]);
  const [selectedOrgType, setSelectedOrgType] = useState<string>('all');
  const [qualityFilter, setQualityFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadQualityData();
  }, [dateRange, selectedOrgType, qualityFilter]);

  const loadQualityData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockData: QualityAnalysisData = {
        summary: {
          overallScore: 85.6,
          completeRate: 92.3,
          accuracyRate: 89.7,
          disputeRate: 3.2,
          improvedOrgs: 12,
          decliningOrgs: 5
        },
        qualityTrend: [
          { month: '2024-02', overallScore: 82.1, completeRate: 89.5, accuracyRate: 86.2, disputeRate: 4.1 },
          { month: '2024-03', overallScore: 83.4, completeRate: 90.1, accuracyRate: 87.8, disputeRate: 3.8 },
          { month: '2024-04', overallScore: 84.2, completeRate: 91.2, accuracyRate: 88.3, disputeRate: 3.5 },
          { month: '2024-05', overallScore: 84.9, completeRate: 91.8, accuracyRate: 89.1, disputeRate: 3.4 },
          { month: '2024-06', overallScore: 85.3, completeRate: 92.0, accuracyRate: 89.5, disputeRate: 3.3 },
          { month: '2024-07', overallScore: 85.6, completeRate: 92.3, accuracyRate: 89.7, disputeRate: 3.2 }
        ],
        orgQualityList: [
          {
            orgId: 1, orgName: '中国工商银行', orgType: 'BANK',
            qualityScore: 92.5, completeRate: 96.8, accuracyRate: 94.2, disputeRate: 1.8,
            totalCases: 28900, qualityTrend: 'UP', lastAuditDate: '2024-07-25',
            issues: [
              { type: '身份信息不完整', count: 45, severity: 'MEDIUM' },
              { type: '联系方式错误', count: 23, severity: 'LOW' }
            ]
          },
          {
            orgId: 2, orgName: '招商银行', orgType: 'BANK',
            qualityScore: 89.2, completeRate: 94.1, accuracyRate: 91.8, disputeRate: 2.3,
            totalCases: 24300, qualityTrend: 'STABLE', lastAuditDate: '2024-07-20',
            issues: [
              { type: '债务信息不准确', count: 67, severity: 'MEDIUM' },
              { type: '担保信息缺失', count: 34, severity: 'HIGH' }
            ]
          },
          {
            orgId: 3, orgName: '平安普惠', orgType: 'CONSUMER_FINANCE',
            qualityScore: 85.8, completeRate: 91.5, accuracyRate: 88.9, disputeRate: 3.1,
            totalCases: 21600, qualityTrend: 'UP', lastAuditDate: '2024-07-18',
            issues: [
              { type: '收入证明不全', count: 89, severity: 'MEDIUM' },
              { type: '资产信息错误', count: 56, severity: 'HIGH' }
            ]
          },
          {
            orgId: 4, orgName: '蚂蚁借呗', orgType: 'ONLINE_LOAN',
            qualityScore: 78.3, completeRate: 87.2, accuracyRate: 84.1, disputeRate: 4.8,
            totalCases: 19800, qualityTrend: 'DOWN', lastAuditDate: '2024-07-15',
            issues: [
              { type: '信用记录缺失', count: 156, severity: 'HIGH' },
              { type: '还款记录不准', count: 98, severity: 'MEDIUM' },
              { type: '逾期信息错误', count: 67, severity: 'HIGH' }
            ]
          }
        ],
        qualityDimensions: [
          { dimension: '信息完整性', score: 92.3, industry_avg: 88.5 },
          { dimension: '数据准确性', score: 89.7, industry_avg: 86.2 },
          { dimension: '格式规范性', score: 94.1, industry_avg: 91.3 },
          { dimension: '时效性', score: 87.9, industry_avg: 84.7 },
          { dimension: '合规性', score: 91.2, industry_avg: 89.1 }
        ],
        issueDistribution: [
          { issueType: '身份信息问题', count: 234, percentage: 28.5, trend: 'DOWN' },
          { issueType: '债务信息问题', count: 189, percentage: 23.1, trend: 'STABLE' },
          { issueType: '联系方式问题', count: 156, percentage: 19.0, trend: 'DOWN' },
          { issueType: '资产信息问题', count: 123, percentage: 15.0, trend: 'UP' },
          { issueType: '其他问题', count: 118, percentage: 14.4, trend: 'STABLE' }
        ],
        qualityRanking: [
          { rank: 1, orgName: '中国工商银行', score: 92.5, improvement: 2.3 },
          { rank: 2, orgName: '招商银行', score: 89.2, improvement: 0.8 },
          { rank: 3, orgName: '平安普惠', score: 85.8, improvement: 3.1 },
          { rank: 4, orgName: '蚂蚁借呗', score: 78.3, improvement: -2.1 },
          { rank: 5, orgName: '京东金融', score: 82.1, improvement: 1.5 }
        ]
      };
      
      setQualityData(mockData);
    } catch (error) {
      console.error('加载质量分析数据失败:', error);
      message.error('加载质量分析数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    message.success('导出功能开发中...');
  };

  const handleViewDetails = (record: any) => {
    message.info(`查看 ${record.orgName} 详细质量报告`);
  };

  // 渲染质量趋势表格
  const renderQualityTrend = () => {
    if (!qualityData?.qualityTrend) return null;
    
    return (
      <Table
        dataSource={qualityData.qualityTrend}
        columns={[
          { title: '月份', dataIndex: 'month', key: 'month' },
          { 
            title: '综合评分', 
            dataIndex: 'overallScore', 
            key: 'overallScore',
            render: (score: number) => (
              <span style={{ color: getQualityLevelColor(score), fontWeight: 'bold' }}>
                {score}
              </span>
            )
          },
          { title: '完整率', dataIndex: 'completeRate', key: 'completeRate', render: (v: number) => `${v}%` },
          { title: '准确率', dataIndex: 'accuracyRate', key: 'accuracyRate', render: (v: number) => `${v}%` },
          { title: '争议率', dataIndex: 'disputeRate', key: 'disputeRate', render: (v: number) => `${v}%` },
        ]}
        size="small"
        pagination={false}
      />
    );
  };

  // 渲染质量维度
  const renderQualityDimensions = () => {
    if (!qualityData?.qualityDimensions) return null;
    
    return (
      <div>
        {qualityData.qualityDimensions.map((item, index) => (
          <div key={index} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>{item.dimension}</span>
              <span style={{ fontWeight: 'bold', color: item.score >= item.industry_avg ? '#52c41a' : '#ff4d4f' }}>
                {item.score}分 (行业平均: {item.industry_avg}分)
              </span>
            </div>
            <Progress
              percent={item.score}
              strokeColor={item.score >= 90 ? '#52c41a' : item.score >= 70 ? '#faad14' : '#ff4d4f'}
              status="active"
            />
            <Progress
              percent={item.industry_avg}
              strokeColor="#d9d9d9"
              showInfo={false}
              style={{ marginTop: -5 }}
            />
          </div>
        ))}
      </div>
    );
  };

  // 渲染问题分布
  const renderIssueDistribution = () => {
    if (!qualityData?.issueDistribution) return null;
    
    const maxCount = Math.max(...qualityData.issueDistribution.map(item => item.count));
    
    return (
      <div>
        {qualityData.issueDistribution.map((item, index) => (
          <div key={index} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>{item.issueType}</span>
              <span>
                {item.count} ({item.percentage}%)
                {item.trend === 'UP' && <RiseOutlined style={{ color: '#ff4d4f', marginLeft: 8 }} />}
                {item.trend === 'DOWN' && <FallOutlined style={{ color: '#52c41a', marginLeft: 8 }} />}
              </span>
            </div>
            <Progress
              percent={(item.count / maxCount) * 100}
              strokeColor="#ff7875"
              showInfo={false}
            />
          </div>
        ))}
      </div>
    );
  };

  // 机构质量列表表格配置
  const orgQualityColumns: ColumnsType<any> = [
    {
      title: '机构名称',
      dataIndex: 'orgName',
      key: 'orgName',
      width: 200,
      fixed: 'left',
    },
    {
      title: '机构类型',
      dataIndex: 'orgType',
      key: 'orgType',
      width: 100,
      render: (type: string) => {
        const typeMap: Record<string, { name: string; color: string }> = {
          'BANK': { name: '银行', color: 'blue' },
          'CONSUMER_FINANCE': { name: '消金', color: 'green' },
          'ONLINE_LOAN': { name: '网贷', color: 'orange' },
        };
        const config = typeMap[type] || { name: type, color: 'default' };
        return <Tag color={config.color}>{config.name}</Tag>;
      },
    },
    {
      title: '质量评分',
      dataIndex: 'qualityScore',
      key: 'qualityScore',
      width: 120,
      render: (score: number, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ 
              fontWeight: 'bold', 
              color: score >= 90 ? '#52c41a' : score >= 70 ? '#faad14' : '#ff4d4f',
              marginRight: 8
            }}>
              {score}
            </span>
            {record.qualityTrend === 'UP' && <RiseOutlined style={{ color: '#52c41a' }} />}
            {record.qualityTrend === 'DOWN' && <FallOutlined style={{ color: '#ff4d4f' }} />}
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
      title: '完整率',
      dataIndex: 'completeRate',
      key: 'completeRate',
      width: 100,
      render: (rate: number) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{rate}%</div>
          <Progress 
            percent={rate} 
           
            strokeColor={rate >= 95 ? '#52c41a' : rate >= 85 ? '#faad14' : '#ff4d4f'}
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: '准确率',
      dataIndex: 'accuracyRate',
      key: 'accuracyRate',
      width: 100,
      render: (rate: number) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{rate}%</div>
          <Progress 
            percent={rate} 
           
            strokeColor={rate >= 95 ? '#52c41a' : rate >= 85 ? '#faad14' : '#ff4d4f'}
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: '争议率',
      dataIndex: 'disputeRate',
      key: 'disputeRate',
      width: 100,
      render: (rate: number) => (
        <div>
          <div style={{ 
            fontWeight: 'bold',
            color: rate <= 2 ? '#52c41a' : rate <= 5 ? '#faad14' : '#ff4d4f'
          }}>
            {rate}%
          </div>
          <Progress 
            percent={rate * 10} // 放大显示
           
            strokeColor={rate <= 2 ? '#52c41a' : rate <= 5 ? '#faad14' : '#ff4d4f'}
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: '案件数量',
      dataIndex: 'totalCases',
      key: 'totalCases',
      width: 100,
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: '主要问题',
      key: 'issues',
      width: 200,
      render: (_, record) => (
        <div>
          {record.issues.slice(0, 2).map((issue: any, index: number) => (
            <div key={index} style={{ marginBottom: 4 }}>
              <Tag 
                color={issue.severity === 'HIGH' ? 'red' : issue.severity === 'MEDIUM' ? 'orange' : 'blue'}
               
              >
                {issue.type}({issue.count})
              </Tag>
            </div>
          ))}
          {record.issues.length > 2 && (
            <Tooltip title={record.issues.slice(2).map((issue: any) => `${issue.type}(${issue.count})`).join(', ')}>
              <Tag>+{record.issues.length - 2}项</Tag>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: '最近审核',
      dataIndex: 'lastAuditDate',
      key: 'lastAuditDate',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button 
            
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetails(record)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  const getQualityLevelColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 80) return '#faad14';
    if (score >= 70) return '#ff7a45';
    return '#ff4d4f';
  };

  const getQualityLevelText = (score: number) => {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 70) return '一般';
    return '待改进';
  };

  return (
    <div className="source-org-quality-analysis">
      <Card title="案件质量分析" bordered={false}>
        {/* 筛选条件 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
            />
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
          <Col span={4}>
            <Select
              value={qualityFilter}
              onChange={setQualityFilter}
              style={{ width: '100%' }}
              placeholder="质量等级"
            >
              <Option value="all">全部等级</Option>
              <Option value="excellent">优秀(90+)</Option>
              <Option value="good">良好(80-89)</Option>
              <Option value="average">一般(70-79)</Option>
              <Option value="poor">待改进(&lt;70)</Option>
            </Select>
          </Col>
          <Col span={8}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={loadQualityData} loading={loading}>
                刷新
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                导出报告
              </Button>
            </Space>
          </Col>
        </Row>

        <Spin spinning={loading}>
          {/* 概览统计 */}
          {qualityData && (
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="综合评分"
                    value={qualityData.summary.overallScore}
                    precision={1}
                    valueStyle={{ color: getQualityLevelColor(qualityData.summary.overallScore) }}
                    suffix={
                      <Tag color={getQualityLevelColor(qualityData.summary.overallScore)}>
                        {getQualityLevelText(qualityData.summary.overallScore)}
                      </Tag>
                    }
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="完整率"
                    value={qualityData.summary.completeRate}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="准确率"
                    value={qualityData.summary.accuracyRate}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<SafetyCertificateOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="争议率"
                    value={qualityData.summary.disputeRate}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: '#ff4d4f' }}
                    prefix={<ExclamationCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="改善机构"
                    value={qualityData.summary.improvedOrgs}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<RiseOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="下降机构"
                    value={qualityData.summary.decliningOrgs}
                    valueStyle={{ color: '#ff4d4f' }}
                    prefix={<FallOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          )}

          {/* 主要内容区域 */}
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="质量概览" key="overview">
              <Row gutter={16}>
                <Col span={8}>
                  <Card title="综合质量评分">
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <Progress
                        type="circle"
                        percent={qualityData?.summary.overallScore || 0}
                        strokeColor={getQualityLevelColor(qualityData?.summary.overallScore || 0)}
                        format={(percent) => (
                          <div>
                            <div style={{ fontSize: 28, fontWeight: 'bold' }}>{percent}</div>
                            <div style={{ fontSize: 14, marginTop: 4 }}>
                              {getQualityLevelText(percent || 0)}
                            </div>
                          </div>
                        )}
                        width={150}
                      />
                    </div>
                  </Card>
                </Col>
                <Col span={16}>
                  <Card title="质量趋势">
                    {renderQualityTrend()}
                  </Card>
                </Col>
              </Row>
              
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={12}>
                  <Card title="质量维度分析">
                    {renderQualityDimensions()}
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="质量排行榜">
                    <Table
                      columns={[
                        { 
                          title: '排名', 
                          dataIndex: 'rank', 
                          key: 'rank',
                          width: 60,
                          render: (rank: number) => (
                            <div className={`rank-badge rank-${Math.min(rank, 3)}`}>
                              {rank}
                            </div>
                          )
                        },
                        { title: '机构名称', dataIndex: 'orgName', key: 'orgName' },
                        { 
                          title: '评分', 
                          dataIndex: 'score', 
                          key: 'score',
                          render: (score: number) => (
                            <span style={{ color: getQualityLevelColor(score), fontWeight: 'bold' }}>
                              {score}
                            </span>
                          )
                        },
                        { 
                          title: '月度变化', 
                          dataIndex: 'improvement', 
                          key: 'improvement',
                          render: (improvement: number) => (
                            <span style={{ color: improvement >= 0 ? '#52c41a' : '#ff4d4f' }}>
                              {improvement >= 0 ? <RiseOutlined /> : <FallOutlined />}
                              {Math.abs(improvement)}
                            </span>
                          )
                        },
                      ]}
                      dataSource={qualityData?.qualityRanking || []}
                      rowKey="rank"
                     
                      pagination={false}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="机构质量" key="orgQuality">
              <Card title="机构质量详情">
                <Table
                  columns={orgQualityColumns}
                  dataSource={qualityData?.orgQualityList || []}
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

            <TabPane tab="问题分析" key="issues">
              <Row gutter={16}>
                <Col span={16}>
                  <Card title="问题类型分布">
                    {renderIssueDistribution()}
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="问题处理建议">
                    <Alert
                      message="质量改进建议"
                      description={
                        <div>
                          <p><BugOutlined /> 重点关注身份信息完整性问题</p>
                          <p><InfoCircleOutlined /> 加强债务信息准确性审核</p>
                          <p><WarningOutlined /> 建立联系方式验证机制</p>
                          <p><SafetyCertificateOutlined /> 完善数据质量管控流程</p>
                        </div>
                      }
                      type="info"
                      showIcon
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={24}>
                  <Card title="问题详情统计">
                    <Table
                      columns={[
                        { title: '问题类型', dataIndex: 'issueType', key: 'issueType' },
                        { 
                          title: '问题数量', 
                          dataIndex: 'count', 
                          key: 'count',
                          render: (count: number) => count.toLocaleString()
                        },
                        { 
                          title: '占比', 
                          dataIndex: 'percentage', 
                          key: 'percentage',
                          render: (percentage: number) => `${percentage}%`
                        },
                        { 
                          title: '趋势', 
                          dataIndex: 'trend', 
                          key: 'trend',
                          render: (trend: string) => (
                            <Tag color={trend === 'UP' ? 'red' : trend === 'DOWN' ? 'green' : 'blue'}>
                              {trend === 'UP' ? '上升' : trend === 'DOWN' ? '下降' : '稳定'}
                            </Tag>
                          )
                        },
                      ]}
                      dataSource={qualityData?.issueDistribution || []}
                      rowKey="issueType"
                     
                      pagination={false}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Spin>
      </Card>

      <style>{`
        .rank-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          color: white;
          font-weight: bold;
        }
        .rank-1 { background: #ff4d4f; }
        .rank-2 { background: #fa8c16; }
        .rank-3 { background: #fadb14; }
        .rank-badge:not(.rank-1):not(.rank-2):not(.rank-3) {
          background: #d9d9d9;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default SourceOrgQualityAnalysis;