import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Space, Tag, Row, Col, Statistic, Alert, Modal,
  Form, Input, Select, Slider, Progress, Rate, Tabs, Descriptions,
  Timeline, Badge, Tooltip, message, Radio
} from 'antd';
import {
  ExclamationCircleOutlined, SafetyCertificateOutlined, WarningOutlined,
  CheckCircleOutlined, InfoCircleOutlined, TrophyOutlined, ThunderboltOutlined,
  EyeOutlined, EditOutlined, ReloadOutlined, SearchOutlined, 
  BarChartOutlined, PieChartOutlined
} from '@ant-design/icons';
import { Gauge, Column, Pie, Radar } from '@ant-design/plots';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

// 风险评估接口定义
interface RiskAssessment {
  id: number;
  applicationId: number;
  orgName: string;
  orgType: string;
  orgTypeName: string;
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  assessmentDate: string;
  assessor: string;
  status: 'PENDING' | 'COMPLETED' | 'REVIEW_REQUIRED';
  
  // 风险维度评分
  riskDimensions: {
    financial: number;        // 财务风险
    operational: number;      // 运营风险
    compliance: number;       // 合规风险
    reputation: number;       // 声誉风险
    technical: number;        // 技术风险
    market: number;          // 市场风险
  };
  
  // 风险因子
  riskFactors: Array<{
    category: string;
    factor: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    impact: number;
    probability: number;
    description: string;
    mitigation: string;
  }>;
  
  // 评估历史
  assessmentHistory: Array<{
    date: string;
    assessor: string;
    overallRisk: string;
    riskScore: number;
    comments: string;
  }>;
  
  // 建议措施
  recommendations: Array<{
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    category: string;
    description: string;
    timeline: string;
    responsible: string;
  }>;
}

// 风险统计数据
interface RiskStats {
  totalAssessments: number;
  lowRisk: number;
  mediumRisk: number;
  highRisk: number;
  criticalRisk: number;
  avgRiskScore: number;
  pendingAssessments: number;
  
  riskTrend: Array<{
    date: string;
    lowRisk: number;
    mediumRisk: number;
    highRisk: number;
    criticalRisk: number;
  }>;
  
  riskDistribution: Array<{
    category: string;
    count: number;
    percentage: number;
    avgScore: number;
  }>;
  
  factorFrequency: Array<{
    factor: string;
    count: number;
    severity: string;
  }>;
}

const RiskAssessment: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [riskStats, setRiskStats] = useState<RiskStats | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<RiskAssessment | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [assessModalVisible, setAssessModalVisible] = useState(false);
  const [assessForm] = Form.useForm();
  
  const [filters, setFilters] = useState({
    riskLevel: 'all',
    orgType: 'all',
    status: 'all'
  });

  useEffect(() => {
    loadAssessments();
    loadRiskStats();
  }, [filters]);

  const loadAssessments = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockData: RiskAssessment[] = [
        {
          id: 1,
          applicationId: 101,
          orgName: '深圳市创新科技小贷公司',
          orgType: 'SOURCE',
          orgTypeName: '案源机构',
          overallRisk: 'MEDIUM',
          riskScore: 65,
          assessmentDate: '2024-07-28 14:30:00',
          assessor: '风险评估师张三',
          status: 'COMPLETED',
          
          riskDimensions: {
            financial: 70,
            operational: 85,
            compliance: 60,
            reputation: 75,
            technical: 80,
            market: 55
          },
          
          riskFactors: [
            {
              category: '财务风险',
              factor: '注册资本相对较低',
              severity: 'MEDIUM',
              impact: 6,
              probability: 7,
              description: '注册资本5000万元，相对于业务规模偏低',
              mitigation: '建议增加注册资本或提供担保措施'
            },
            {
              category: '合规风险',
              factor: '监管政策变化',
              severity: 'HIGH',
              impact: 8,
              probability: 6,
              description: '小贷行业监管政策可能收紧',
              mitigation: '密切关注监管动态，提前准备合规措施'
            }
          ],
          
          assessmentHistory: [
            {
              date: '2024-07-28 14:30:00',
              assessor: '风险评估师张三',
              overallRisk: 'MEDIUM',
              riskScore: 65,
              comments: '整体风险可控，需关注合规风险'
            }
          ],
          
          recommendations: [
            {
              priority: 'HIGH',
              category: '合规管理',
              description: '建立完善的合规管理体系',
              timeline: '3个月内',
              responsible: '合规部门'
            },
            {
              priority: 'MEDIUM',
              category: '资本管理',
              description: '考虑增加注册资本',
              timeline: '6个月内',
              responsible: '财务部门'
            }
          ]
        },
        {
          id: 2,
          applicationId: 102,
          orgName: '北京德和律师事务所',
          orgType: 'DISPOSAL',
          orgTypeName: '处置机构',
          overallRisk: 'LOW',
          riskScore: 25,
          assessmentDate: '2024-07-27 16:20:00',
          assessor: '风险评估师李四',
          status: 'COMPLETED',
          
          riskDimensions: {
            financial: 20,
            operational: 15,
            compliance: 30,
            reputation: 10,
            technical: 25,
            market: 35
          },
          
          riskFactors: [
            {
              category: '市场风险',
              factor: '市场竞争激烈',
              severity: 'LOW',
              impact: 4,
              probability: 8,
              description: '律师服务市场竞争激烈，可能影响业务增长',
              mitigation: '提升专业服务质量，建立差异化优势'
            }
          ],
          
          assessmentHistory: [
            {
              date: '2024-07-27 16:20:00',
              assessor: '风险评估师李四',
              overallRisk: 'LOW',
              riskScore: 25,
              comments: '整体风险较低，运营规范'
            }
          ],
          
          recommendations: [
            {
              priority: 'LOW',
              category: '市场拓展',
              description: '加强市场推广，提升品牌知名度',
              timeline: '12个月内',
              responsible: '市场部门'
            }
          ]
        },
        {
          id: 3,
          applicationId: 103,
          orgName: '上海浦东催收服务公司',
          orgType: 'DISPOSAL',
          orgTypeName: '处置机构',
          overallRisk: 'HIGH',
          riskScore: 85,
          assessmentDate: '2024-07-26 11:45:00',
          assessor: '风险评估师王五',
          status: 'REVIEW_REQUIRED',
          
          riskDimensions: {
            financial: 75,
            operational: 90,
            compliance: 95,
            reputation: 80,
            technical: 70,
            market: 85
          },
          
          riskFactors: [
            {
              category: '合规风险',
              factor: '催收行为合规性存疑',
              severity: 'CRITICAL',
              impact: 9,
              probability: 8,
              description: '催收方式可能存在不当行为',
              mitigation: '立即整改催收流程，加强人员培训'
            },
            {
              category: '声誉风险',
              factor: '投诉率较高',
              severity: 'HIGH',
              impact: 7,
              probability: 9,
              description: '客户投诉率高于行业平均水平',
              mitigation: '改善服务质量，建立投诉处理机制'
            }
          ],
          
          assessmentHistory: [
            {
              date: '2024-07-26 11:45:00',
              assessor: '风险评估师王五',
              overallRisk: 'HIGH',
              riskScore: 85,
              comments: '存在较高合规风险，建议暂缓合作'
            }
          ],
          
          recommendations: [
            {
              priority: 'HIGH',
              category: '合规整改',
              description: '立即停止不当催收行为，整改业务流程',
              timeline: '立即执行',
              responsible: '业务部门'
            },
            {
              priority: 'HIGH',
              category: '人员培训',
              description: '加强催收人员合规培训',
              timeline: '1个月内',
              responsible: '人力资源部'
            }
          ]
        }
      ];
      
      setAssessments(mockData);
    } catch (error) {
      console.error('加载风险评估列表失败:', error);
      message.error('加载风险评估列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadRiskStats = async () => {
    try {
      // 模拟API调用
      const mockStats: RiskStats = {
        totalAssessments: 156,
        lowRisk: 89,
        mediumRisk: 45,
        highRisk: 18,
        criticalRisk: 4,
        avgRiskScore: 42.5,
        pendingAssessments: 12,
        
        riskTrend: [
          { date: '2024-07-21', lowRisk: 12, mediumRisk: 6, highRisk: 2, criticalRisk: 0 },
          { date: '2024-07-22', lowRisk: 15, mediumRisk: 8, highRisk: 3, criticalRisk: 1 },
          { date: '2024-07-23', lowRisk: 10, mediumRisk: 5, highRisk: 2, criticalRisk: 0 },
          { date: '2024-07-24', lowRisk: 18, mediumRisk: 9, highRisk: 4, criticalRisk: 1 },
          { date: '2024-07-25', lowRisk: 14, mediumRisk: 7, highRisk: 2, criticalRisk: 0 },
          { date: '2024-07-26', lowRisk: 11, mediumRisk: 6, highRisk: 3, criticalRisk: 1 },
          { date: '2024-07-27', lowRisk: 9, mediumRisk: 4, highRisk: 2, criticalRisk: 1 }
        ],
        
        riskDistribution: [
          { category: '案源机构', count: 78, percentage: 50.0, avgScore: 35.2 },
          { category: '处置机构', count: 78, percentage: 50.0, avgScore: 49.8 }
        ],
        
        factorFrequency: [
          { factor: '合规风险', count: 34, severity: 'HIGH' },
          { factor: '财务风险', count: 28, severity: 'MEDIUM' },
          { factor: '运营风险', count: 25, severity: 'MEDIUM' },
          { factor: '声誉风险', count: 18, severity: 'HIGH' },
          { factor: '技术风险', count: 15, severity: 'LOW' }
        ]
      };
      
      setRiskStats(mockStats);
    } catch (error) {
      console.error('加载风险统计失败:', error);
    }
  };

  const handleViewDetail = (record: RiskAssessment) => {
    setSelectedAssessment(record);
    setDetailModalVisible(true);
  };

  const handleAssessment = (record: RiskAssessment) => {
    setSelectedAssessment(record);
    setAssessModalVisible(true);
    
    // 预填充表单
    assessForm.setFieldsValue({
      overallRisk: record.overallRisk,
      riskScore: record.riskScore,
      ...record.riskDimensions
    });
  };

  const handleAssessmentSubmit = async () => {
    try {
      const values = await assessForm.validateFields();
      // API调用
      message.success('风险评估完成');
      setAssessModalVisible(false);
      assessForm.resetFields();
      loadAssessments();
    } catch (error) {
      message.error('风险评估失败');
    }
  };

  const getRiskColor = (risk: string) => {
    const riskMap: Record<string, string> = {
      'LOW': '#52c41a',
      'MEDIUM': '#faad14',
      'HIGH': '#ff7875',
      'CRITICAL': '#ff4d4f'
    };
    return riskMap[risk] || '#d9d9d9';
  };

  const getRiskText = (risk: string) => {
    const riskMap: Record<string, string> = {
      'LOW': '低风险',
      'MEDIUM': '中风险',
      'HIGH': '高风险',
      'CRITICAL': '极高风险'
    };
    return riskMap[risk] || risk;
  };

  const getSeverityColor = (severity: string) => {
    const severityMap: Record<string, string> = {
      'LOW': 'green',
      'MEDIUM': 'orange',
      'HIGH': 'red',
      'CRITICAL': 'magenta'
    };
    return severityMap[severity] || 'default';
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'orange',
      'COMPLETED': 'green',
      'REVIEW_REQUIRED': 'red'
    };
    return statusMap[status] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const priorityMap: Record<string, string> = {
      'HIGH': 'red',
      'MEDIUM': 'orange',
      'LOW': 'green'
    };
    return priorityMap[priority] || 'default';
  };

  const columns: ColumnsType<RiskAssessment> = [
    {
      title: '机构信息',
      key: 'orgInfo',
      width: 200,
      render: (_, record: RiskAssessment) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.orgName}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            <Tag color={record.orgType === 'SOURCE' ? 'blue' : 'green'}>
              {record.orgTypeName}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: '风险等级',
      dataIndex: 'overallRisk',
      key: 'overallRisk',
      width: 120,
      render: (risk: string, record: RiskAssessment) => (
        <div>
          <Tag color={getRiskColor(risk)}>{getRiskText(risk)}</Tag>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            评分: {record.riskScore}
          </div>
        </div>
      ),
    },
    {
      title: '风险评分',
      dataIndex: 'riskScore',
      key: 'riskScore',
      width: 100,
      render: (score: number) => (
        <div>
          <Progress
            type="circle"
            percent={score}
            size={50}
            strokeColor={score >= 80 ? '#ff4d4f' : score >= 60 ? '#faad14' : '#52c41a'}
          />
        </div>
      ),
    },
    {
      title: '评估时间',
      dataIndex: 'assessmentDate',
      key: 'assessmentDate',
      width: 150,
      render: (date: string) => (
        <div>
          <div>{dayjs(date).format('MM-DD HH:mm')}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {dayjs(date).fromNow()}
          </div>
        </div>
      ),
    },
    {
      title: '评估师',
      dataIndex: 'assessor',
      key: 'assessor',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          'PENDING': '待评估',
          'COMPLETED': '已完成',
          'REVIEW_REQUIRED': '需复核'
        };
        return (
          <Tag color={getStatusColor(status)}>
            {statusMap[status as keyof typeof statusMap]}
          </Tag>
        );
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_, record: RiskAssessment) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {record.status !== 'COMPLETED' && (
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              onClick={() => handleAssessment(record)}
            >
              评估
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 风险趋势图配置
  const riskTrendConfig = {
    data: riskStats?.riskTrend.flatMap(item => [
      { date: item.date, type: '低风险', value: item.lowRisk },
      { date: item.date, type: '中风险', value: item.mediumRisk },
      { date: item.date, type: '高风险', value: item.highRisk },
      { date: item.date, type: '极高风险', value: item.criticalRisk }
    ]) || [],
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    height: 300,
    color: ['#52c41a', '#faad14', '#ff7875', '#ff4d4f'],
  };

  // 风险因子频率图配置
  const factorFrequencyConfig = {
    data: riskStats?.factorFrequency || [],
    xField: 'factor',
    yField: 'count',
    height: 300,
    color: '#1890ff',
  };

  // 雷达图配置（风险维度）
  const riskDimensionsConfig = selectedAssessment ? {
    data: [
      { dimension: '财务风险', value: selectedAssessment.riskDimensions.financial },
      { dimension: '运营风险', value: selectedAssessment.riskDimensions.operational },
      { dimension: '合规风险', value: selectedAssessment.riskDimensions.compliance },
      { dimension: '声誉风险', value: selectedAssessment.riskDimensions.reputation },
      { dimension: '技术风险', value: selectedAssessment.riskDimensions.technical },
      { dimension: '市场风险', value: selectedAssessment.riskDimensions.market }
    ],
    xField: 'dimension',
    yField: 'value',
    height: 300,
    point: { size: 2 },
    area: {},
  } : null;

  return (
    <div className="risk-assessment">
      <Card title="风险评估管理" bordered={false}>
        {/* 统计概览 */}
        {riskStats && (
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={4}>
              <Card>
                <Statistic
                  title="总评估数"
                  value={riskStats.totalAssessments}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<BarChartOutlined />}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="低风险"
                  value={riskStats.lowRisk}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="中风险"
                  value={riskStats.mediumRisk}
                  valueStyle={{ color: '#faad14' }}
                  prefix={<WarningOutlined />}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="高风险"
                  value={riskStats.highRisk}
                  valueStyle={{ color: '#ff7875' }}
                  prefix={<ExclamationCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="极高风险"
                  value={riskStats.criticalRisk}
                  valueStyle={{ color: '#ff4d4f' }}
                  prefix={<ThunderboltOutlined />}
                />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="平均评分"
                  value={riskStats.avgRiskScore}
                  precision={1}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* 筛选条件 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={4}>
            <Select
              value={filters.riskLevel}
              onChange={(value) => setFilters({ ...filters, riskLevel: value })}
              style={{ width: '100%' }}
              placeholder="风险等级"
            >
              <Option value="all">全部风险等级</Option>
              <Option value="LOW">低风险</Option>
              <Option value="MEDIUM">中风险</Option>
              <Option value="HIGH">高风险</Option>
              <Option value="CRITICAL">极高风险</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              value={filters.orgType}
              onChange={(value) => setFilters({ ...filters, orgType: value })}
              style={{ width: '100%' }}
              placeholder="机构类型"
            >
              <Option value="all">全部机构</Option>
              <Option value="SOURCE">案源机构</Option>
              <Option value="DISPOSAL">处置机构</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              style={{ width: '100%' }}
              placeholder="评估状态"
            >
              <Option value="all">全部状态</Option>
              <Option value="PENDING">待评估</Option>
              <Option value="COMPLETED">已完成</Option>
              <Option value="REVIEW_REQUIRED">需复核</Option>
            </Select>
          </Col>
          <Col span={12}>
            <Space>
              <Button icon={<SearchOutlined />} type="primary">
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadAssessments}>
                刷新
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 评估列表 */}
        <Table
          columns={columns}
          dataSource={assessments}
          rowKey="id"
          loading={loading}
          pagination={{
            total: assessments.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>

      {/* 详情查看弹窗 */}
      <Modal
        title="风险评估详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={1000}
      >
        {selectedAssessment && (
          <Tabs defaultActiveKey="overview">
            <TabPane tab="评估概览" key="overview">
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Card title="整体风险">
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
                        <Tag color={getRiskColor(selectedAssessment.overallRisk)} style={{ fontSize: 16 }}>
                          {getRiskText(selectedAssessment.overallRisk)}
                        </Tag>
                      </div>
                      <Progress
                        type="circle"
                        percent={selectedAssessment.riskScore}
                        strokeColor={getRiskColor(selectedAssessment.overallRisk)}
                        format={percent => `${percent}分`}
                      />
                    </div>
                  </Card>
                </Col>
                <Col span={16}>
                  <Card title="风险维度分析">
                    {riskDimensionsConfig && <Radar {...riskDimensionsConfig} />}
                  </Card>
                </Col>
              </Row>
              
              <Card title="基本信息">
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="机构名称">{selectedAssessment.orgName}</Descriptions.Item>
                  <Descriptions.Item label="机构类型">{selectedAssessment.orgTypeName}</Descriptions.Item>
                  <Descriptions.Item label="评估时间">{selectedAssessment.assessmentDate}</Descriptions.Item>
                  <Descriptions.Item label="评估师">{selectedAssessment.assessor}</Descriptions.Item>
                  <Descriptions.Item label="评估状态">
                    <Tag color={getStatusColor(selectedAssessment.status)}>
                      {selectedAssessment.status === 'PENDING' ? '待评估' : 
                       selectedAssessment.status === 'COMPLETED' ? '已完成' : '需复核'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="风险评分">{selectedAssessment.riskScore}分</Descriptions.Item>
                </Descriptions>
              </Card>
            </TabPane>
            
            <TabPane tab="风险因子" key="factors">
              <Table
                dataSource={selectedAssessment.riskFactors}
                rowKey="factor"
               
                pagination={false}
                columns={[
                  { title: '风险类别', dataIndex: 'category', key: 'category', width: 100 },
                  { title: '风险因子', dataIndex: 'factor', key: 'factor', width: 150 },
                  { 
                    title: '严重程度', 
                    dataIndex: 'severity', 
                    key: 'severity',
                    width: 100,
                    render: (severity: string) => (
                      <Tag color={getSeverityColor(severity)}>
                        {severity === 'CRITICAL' ? '极高' : 
                         severity === 'HIGH' ? '高' : 
                         severity === 'MEDIUM' ? '中' : '低'}
                      </Tag>
                    )
                  },
                  { title: '影响度', dataIndex: 'impact', key: 'impact', width: 80 },
                  { title: '概率', dataIndex: 'probability', key: 'probability', width: 80 },
                  { title: '描述', dataIndex: 'description', key: 'description' },
                  { title: '缓解措施', dataIndex: 'mitigation', key: 'mitigation' },
                ]}
              />
            </TabPane>
            
            <TabPane tab="建议措施" key="recommendations">
              <Table
                dataSource={selectedAssessment.recommendations}
                rowKey="description"
               
                pagination={false}
                columns={[
                  { 
                    title: '优先级', 
                    dataIndex: 'priority', 
                    key: 'priority',
                    width: 80,
                    render: (priority: string) => (
                      <Tag color={getPriorityColor(priority)}>
                        {priority === 'HIGH' ? '高' : priority === 'MEDIUM' ? '中' : '低'}
                      </Tag>
                    )
                  },
                  { title: '类别', dataIndex: 'category', key: 'category', width: 100 },
                  { title: '建议措施', dataIndex: 'description', key: 'description' },
                  { title: '完成时限', dataIndex: 'timeline', key: 'timeline', width: 100 },
                  { title: '责任部门', dataIndex: 'responsible', key: 'responsible', width: 100 },
                ]}
              />
            </TabPane>
            
            <TabPane tab="评估历史" key="history">
              <Timeline>
                {selectedAssessment.assessmentHistory.map((history, index) => (
                  <Timeline.Item
                    key={index}
                    color={getRiskColor(history.overallRisk as any)}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold' }}>
                        {getRiskText(history.overallRisk)} (评分: {history.riskScore})
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                        {history.comments}
                      </div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                        {history.assessor} · {dayjs(history.date).format('YYYY-MM-DD HH:mm')}
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* 风险评估弹窗 */}
      <Modal
        title="风险评估"
        open={assessModalVisible}
        onOk={handleAssessmentSubmit}
        onCancel={() => {
          setAssessModalVisible(false);
          assessForm.resetFields();
        }}
        width={800}
      >
        <Form form={assessForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="整体风险等级"
                name="overallRisk"
                rules={[{ required: true, message: '请选择风险等级' }]}
              >
                <Radio.Group>
                  <Radio.Button value="LOW">低风险</Radio.Button>
                  <Radio.Button value="MEDIUM">中风险</Radio.Button>
                  <Radio.Button value="HIGH">高风险</Radio.Button>
                  <Radio.Button value="CRITICAL">极高风险</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="风险评分"
                name="riskScore"
                rules={[{ required: true, message: '请输入风险评分' }]}
              >
                <Slider min={0} max={100} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="财务风险" name="financial">
                <Slider min={0} max={100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="运营风险" name="operational">
                <Slider min={0} max={100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="合规风险" name="compliance">
                <Slider min={0} max={100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="声誉风险" name="reputation">
                <Slider min={0} max={100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="技术风险" name="technical">
                <Slider min={0} max={100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="市场风险" name="market">
                <Slider min={0} max={100} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            label="评估意见"
            name="comments"
            rules={[{ required: true, message: '请输入评估意见' }]}
          >
            <TextArea rows={4} placeholder="请输入风险评估意见..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RiskAssessment;