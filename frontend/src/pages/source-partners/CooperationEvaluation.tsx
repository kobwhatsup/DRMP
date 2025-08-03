import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Space, Tag, Input, Select, Row, Col,
  Statistic, message, Modal, Form, Rate, Typography, Divider,
  Alert, Badge, Tooltip, Progress, Tabs, DatePicker, List,
  Avatar, Upload, Timeline, Descriptions, Empty
} from 'antd';
import {
  StarOutlined, EyeOutlined, EditOutlined, PlusOutlined,
  SearchOutlined, ReloadOutlined, ExportOutlined, UserOutlined,
  TrophyOutlined, CalendarOutlined, FileTextOutlined,
  HeartOutlined, MessageOutlined, LikeOutlined, DislikeOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined,
  UploadOutlined, DownloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { useDebouncedCallback } from 'use-debounce';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// 合作评价接口
interface CooperationEvaluation {
  id: number;
  sourceOrgId: number;
  sourceOrgName: string;
  sourceOrgType: string;
  cooperationPeriod: string;
  totalCases: number;
  totalAmount: number;
  completedCases: number;
  avgRecoveryRate: number;
  avgDisposalTime: number;
  serviceQuality: number;
  communicationQuality: number;
  paymentTimeliness: number;
  overallRating: number;
  evaluationStatus: 'PENDING' | 'SUBMITTED' | 'REVIEWED';
  lastEvaluationDate: string;
  evaluationCount: number;
  wouldRecommend: boolean;
  strengths: string[];
  improvements: string[];
  detailedComment: string;
  evidenceFiles?: string[];
}

// 评价详情接口
interface EvaluationDetail extends CooperationEvaluation {
  cooperationHistory: CooperationHistoryItem[];
  caseAnalysis: CaseAnalysisItem[];
  evaluationHistory: EvaluationHistoryItem[];
  mutualEvaluation?: MutualEvaluationItem;
}

interface CooperationHistoryItem {
  id: number;
  packageName: string;
  packageCode: string;
  startDate: string;
  endDate: string;
  caseCount: number;
  amount: number;
  recoveryRate: number;
  disposalTime: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'CANCELLED';
}

interface CaseAnalysisItem {
  dimension: string;
  yourPerformance: number;
  marketAverage: number;
  ranking: number;
  improvement: string;
}

interface EvaluationHistoryItem {
  id: number;
  evaluationDate: string;
  overallRating: number;
  keyPoints: string[];
  evaluator: string;
}

interface MutualEvaluationItem {
  sourceOrgRating: number;
  sourceOrgComment: string;
  sourceOrgDate: string;
  responseRequired: boolean;
}

const CooperationEvaluation: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [evaluations, setEvaluations] = useState<CooperationEvaluation[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  
  // 弹窗状态
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [evaluationModalVisible, setEvaluationModalVisible] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationDetail | null>(null);
  const [editingEvaluation, setEditingEvaluation] = useState<CooperationEvaluation | null>(null);
  
  const [form] = Form.useForm();

  // 模拟数据
  const mockEvaluations: CooperationEvaluation[] = [
    {
      id: 1,
      sourceOrgId: 1001,
      sourceOrgName: '某商业银行',
      sourceOrgType: 'BANK',
      cooperationPeriod: '2023-01-15至2024-07-30',
      totalCases: 1250,
      totalAmount: 65000000,
      completedCases: 1180,
      avgRecoveryRate: 42.5,
      avgDisposalTime: 85,
      serviceQuality: 4.5,
      communicationQuality: 4.2,
      paymentTimeliness: 4.8,
      overallRating: 4.5,
      evaluationStatus: 'SUBMITTED',
      lastEvaluationDate: '2024-07-30',
      evaluationCount: 3,
      wouldRecommend: true,
      strengths: ['案件质量高', '配合度好', '结算及时', '沟通顺畅'],
      improvements: ['案件信息可以更完善', '响应速度可以提升'],
      detailedComment: '整体合作非常愉快，案件质量较高，结算及时，希望继续保持良好的合作关系。',
      evidenceFiles: ['合作协议.pdf', '案件统计报告.xlsx', '回款记录.pdf']
    },
    {
      id: 2,
      sourceOrgId: 1002,
      sourceOrgName: '某消费金融公司',
      sourceOrgType: 'CONSUMER_FINANCE',
      cooperationPeriod: '2023-06-01至2024-05-31',
      totalCases: 800,
      totalAmount: 28000000,
      completedCases: 750,
      avgRecoveryRate: 38.2,
      avgDisposalTime: 95,
      serviceQuality: 4.0,
      communicationQuality: 3.8,
      paymentTimeliness: 4.2,
      overallRating: 4.0,
      evaluationStatus: 'REVIEWED',
      lastEvaluationDate: '2024-06-15',
      evaluationCount: 2,
      wouldRecommend: true,
      strengths: ['案件量稳定', '费率合理', '合规要求明确'],
      improvements: ['案件资料有时不够齐全', '沟通效率有待提升'],
      detailedComment: '合作过程总体顺利，案件量稳定，但在案件资料完整性方面还有提升空间。',
      evidenceFiles: ['业绩报告.pdf', '问题案件清单.xlsx']
    },
    {
      id: 3,
      sourceOrgId: 1003,
      sourceOrgName: '某网贷平台',
      sourceOrgType: 'ONLINE_LOAN',
      cooperationPeriod: '2024-03-01至今',
      totalCases: 300,
      totalAmount: 8500000,
      completedCases: 280,
      avgRecoveryRate: 35.8,
      avgDisposalTime: 72,
      serviceQuality: 3.5,
      communicationQuality: 3.2,
      paymentTimeliness: 3.8,
      overallRating: 3.5,
      evaluationStatus: 'PENDING',
      lastEvaluationDate: '',
      evaluationCount: 0,
      wouldRecommend: false,
      strengths: ['案件处置周期短', '费率有竞争力'],
      improvements: ['案件信息准确性有待提升', '服务响应速度慢', '缺乏主动沟通'],
      detailedComment: '初次合作，存在一些磨合问题，希望后续能够改善服务质量。',
      evidenceFiles: []
    }
  ];

  // 获取评价列表
  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setEvaluations(mockEvaluations);
    } catch (error) {
      message.error('获取评价列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 搜索防抖处理
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchText(value);
  }, 300);

  // 过滤数据
  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchSearch = !searchText || 
      evaluation.sourceOrgName.toLowerCase().includes(searchText.toLowerCase()) ||
      evaluation.detailedComment.toLowerCase().includes(searchText.toLowerCase());
    
    const matchStatus = !statusFilter || evaluation.evaluationStatus === statusFilter;
    
    const matchRating = !ratingFilter || 
      (ratingFilter === 'excellent' && evaluation.overallRating >= 4.5) ||
      (ratingFilter === 'good' && evaluation.overallRating >= 4.0 && evaluation.overallRating < 4.5) ||
      (ratingFilter === 'average' && evaluation.overallRating >= 3.0 && evaluation.overallRating < 4.0) ||
      (ratingFilter === 'poor' && evaluation.overallRating < 3.0);
    
    return matchSearch && matchStatus && matchRating;
  });

  // 获取状态显示配置
  const getStatusConfig = (status: string) => {
    const configs = {
      'PENDING': { color: 'default', text: '待评价' },
      'SUBMITTED': { color: 'processing', text: '已提交' },
      'REVIEWED': { color: 'success', text: '已审核' }
    };
    return configs[status as keyof typeof configs] || configs['PENDING'];
  };

  // 获取评级颜色
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return '#52c41a';
    if (rating >= 4.0) return '#1890ff';
    if (rating >= 3.0) return '#faad14';
    return '#f5222d';
  };

  // 表格列定义
  const columns: ColumnsType<CooperationEvaluation> = [
    {
      title: '案源机构',
      key: 'orgInfo',
      width: 250,
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <Avatar 
              style={{ backgroundColor: '#1890ff', marginRight: 8 }}
              icon={<UserOutlined />}
            />
            <strong>{record.sourceOrgName}</strong>
          </div>
          <div style={{ color: '#666', fontSize: '12px', marginBottom: 4 }}>
            {record.sourceOrgType} | {record.cooperationPeriod}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Tag color="blue">{record.totalCases}案件</Tag>
            <Tag color="green">¥{(record.totalAmount / 10000).toFixed(0)}万</Tag>
          </div>
        </div>
      ),
    },
    {
      title: '合作表现',
      key: 'performance',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: '12px', color: '#666' }}>回款率</div>
            <Progress 
              percent={record.avgRecoveryRate} 
              size="small" 
              strokeColor={getRatingColor(record.avgRecoveryRate / 20)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span>完成: {record.completedCases}/{record.totalCases}</span>
            <span>周期: {record.avgDisposalTime}天</span>
          </div>
        </div>
      ),
    },
    {
      title: '综合评价',
      key: 'rating',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: getRatingColor(record.overallRating),
            marginBottom: 4
          }}>
            {record.overallRating.toFixed(1)}
          </div>
          <Rate 
            disabled 
            value={record.overallRating} 
            style={{ fontSize: '14px' }}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
            {record.evaluationCount}次评价
          </div>
        </div>
      ),
    },
    {
      title: '各项评分',
      key: 'scores',
      width: 150,
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div style={{ marginBottom: 2 }}>
            <span style={{ color: '#666' }}>服务质量: </span>
            <Rate disabled value={record.serviceQuality} style={{ fontSize: '12px' }} />
          </div>
          <div style={{ marginBottom: 2 }}>
            <span style={{ color: '#666' }}>沟通质量: </span>
            <Rate disabled value={record.communicationQuality} style={{ fontSize: '12px' }} />
          </div>
          <div>
            <span style={{ color: '#666' }}>付款及时: </span>
            <Rate disabled value={record.paymentTimeliness} style={{ fontSize: '12px' }} />
          </div>
        </div>
      ),
    },
    {
      title: '推荐度',
      key: 'recommendation',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          {record.wouldRecommend ? (
            <Badge status="success" text={
              <span style={{ color: '#52c41a' }}>
                <LikeOutlined /> 推荐
              </span>
            } />
          ) : (
            <Badge status="error" text={
              <span style={{ color: '#f5222d' }}>
                <DislikeOutlined /> 不推荐
              </span>
            } />
          )}
        </div>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const config = getStatusConfig(record.evaluationStatus);
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="编辑评价">
            <Button 
              type="text" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleEditEvaluation(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 操作处理函数
  const handleViewDetail = async (record: CooperationEvaluation) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const detail: EvaluationDetail = {
        ...record,
        cooperationHistory: [
          {
            id: 1,
            packageName: '个人信贷案件包2024-001',
            packageCode: 'PKG-2024-001',
            startDate: '2024-01-15',
            endDate: '2024-03-15',
            caseCount: 200,
            amount: 10000000,
            recoveryRate: 45.2,
            disposalTime: 82,
            status: 'COMPLETED'
          },
          {
            id: 2,
            packageName: '个人信贷案件包2024-002',
            packageCode: 'PKG-2024-002',
            startDate: '2024-03-20',
            endDate: '2024-05-20',
            caseCount: 300,
            amount: 15000000,
            recoveryRate: 41.8,
            disposalTime: 88,
            status: 'COMPLETED'
          }
        ],
        caseAnalysis: [
          {
            dimension: '回款率',
            yourPerformance: 42.5,
            marketAverage: 38.2,
            ranking: 2,
            improvement: '优于市场平均水平，建议保持'
          },
          {
            dimension: '处置时效',
            yourPerformance: 85,
            marketAverage: 95,
            ranking: 3,
            improvement: '处置时效较好，可进一步优化'
          },
          {
            dimension: '服务质量',
            yourPerformance: 4.5,
            marketAverage: 4.1,
            ranking: 1,
            improvement: '服务质量优秀，继续保持'
          }
        ],
        evaluationHistory: [
          {
            id: 1,
            evaluationDate: '2024-03-30',
            overallRating: 4.2,
            keyPoints: ['回款率达标', '沟通及时', '资料完整'],
            evaluator: '项目经理'
          },
          {
            id: 2,
            evaluationDate: '2024-05-30',
            overallRating: 4.5,
            keyPoints: ['服务质量提升', '处置效率高', '合规性好'],
            evaluator: '项目经理'
          }
        ],
        mutualEvaluation: {
          sourceOrgRating: 4.3,
          sourceOrgComment: '处置机构专业能力强，回款效果好，沟通顺畅，希望继续合作。',
          sourceOrgDate: '2024-07-31',
          responseRequired: true
        }
      };
      setSelectedEvaluation(detail);
      setDetailModalVisible(true);
    } catch (error) {
      message.error('获取详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvaluation = (record: CooperationEvaluation) => {
    setEditingEvaluation(record);
    form.setFieldsValue({
      serviceQuality: record.serviceQuality,
      communicationQuality: record.communicationQuality,
      paymentTimeliness: record.paymentTimeliness,
      overallRating: record.overallRating,
      wouldRecommend: record.wouldRecommend,
      strengths: record.strengths,
      improvements: record.improvements,
      detailedComment: record.detailedComment
    });
    setEvaluationModalVisible(true);
  };

  const handleSaveEvaluation = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('评价保存成功');
      setEvaluationModalVisible(false);
      fetchEvaluations();
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    message.info('评价报告导出功能开发中...');
  };

  // 统计数据
  const stats = {
    total: evaluations.length,
    pending: evaluations.filter(e => e.evaluationStatus === 'PENDING').length,
    avgRating: evaluations.length > 0 ? 
      (evaluations.reduce((sum, e) => sum + e.overallRating, 0) / evaluations.length).toFixed(1) : '0',
    recommendRate: evaluations.length > 0 ? 
      Math.round((evaluations.filter(e => e.wouldRecommend).length / evaluations.length) * 100) : 0
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>合作评价</Title>
        <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
          管理与案源机构的合作评价，记录合作过程中的表现和反馈
        </Paragraph>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="合作机构"
              value={stats.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待评价"
              value={stats.pending}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均评分"
              value={stats.avgRating}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="推荐率"
              value={stats.recommendRate}
              suffix="%"
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 操作区域 */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} justify="space-between" align="middle">
          <Col flex="auto">
            <Space size="middle">
              <Search
                placeholder="搜索机构名称或评价内容"
                allowClear
                style={{ width: 300 }}
                onChange={(e) => debouncedSearch(e.target.value)}
                onSearch={debouncedSearch}
              />
              <Select
                placeholder="评价状态"
                allowClear
                style={{ width: 120 }}
                value={statusFilter}
                onChange={setStatusFilter}
              >
                <Option value="PENDING">待评价</Option>
                <Option value="SUBMITTED">已提交</Option>
                <Option value="REVIEWED">已审核</Option>
              </Select>
              <Select
                placeholder="评分等级"
                allowClear
                style={{ width: 120 }}
                value={ratingFilter}
                onChange={setRatingFilter}
              >
                <Option value="excellent">优秀(4.5+)</Option>
                <Option value="good">良好(4.0+)</Option>
                <Option value="average">一般(3.0+)</Option>
                <Option value="poor">较差(&lt;3.0)</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchEvaluations}>
                刷新
              </Button>
              <Button icon={<ExportOutlined />} onClick={handleExport}>
                导出报告
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 评价列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredEvaluations}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            total: filteredEvaluations.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>

      {/* 评价详情弹窗 */}
      <Modal
        title="合作评价详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedEvaluation && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="评价概览" key="1">
              <Row gutter={16}>
                <Col span={16}>
                  <Descriptions title="基本信息" column={2} bordered>
                    <Descriptions.Item label="机构名称">
                      {selectedEvaluation.sourceOrgName}
                    </Descriptions.Item>
                    <Descriptions.Item label="机构类型">
                      {selectedEvaluation.sourceOrgType}
                    </Descriptions.Item>
                    <Descriptions.Item label="合作期间">
                      {selectedEvaluation.cooperationPeriod}
                    </Descriptions.Item>
                    <Descriptions.Item label="评价状态">
                      <Tag color={getStatusConfig(selectedEvaluation.evaluationStatus).color}>
                        {getStatusConfig(selectedEvaluation.evaluationStatus).text}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="总案件数">
                      {selectedEvaluation.totalCases}
                    </Descriptions.Item>
                    <Descriptions.Item label="总金额">
                      ¥{selectedEvaluation.totalAmount.toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="完成案件">
                      {selectedEvaluation.completedCases}
                    </Descriptions.Item>
                    <Descriptions.Item label="平均回款率">
                      {selectedEvaluation.avgRecoveryRate}%
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={8}>
                  <Card title="综合评分" size="small">
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                      <div style={{ 
                        fontSize: '36px', 
                        fontWeight: 'bold', 
                        color: getRatingColor(selectedEvaluation.overallRating)
                      }}>
                        {selectedEvaluation.overallRating.toFixed(1)}
                      </div>
                      <Rate 
                        disabled 
                        value={selectedEvaluation.overallRating} 
                        style={{ fontSize: '16px' }}
                      />
                    </div>
                    <Divider />
                    <div style={{ fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>服务质量:</span>
                        <Rate disabled value={selectedEvaluation.serviceQuality} style={{ fontSize: '12px' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>沟通质量:</span>
                        <Rate disabled value={selectedEvaluation.communicationQuality} style={{ fontSize: '12px' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>付款及时:</span>
                        <Rate disabled value={selectedEvaluation.paymentTimeliness} style={{ fontSize: '12px' }} />
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>

              <Divider>评价内容</Divider>
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="优势亮点" size="small">
                    {selectedEvaluation.strengths.map((strength, index) => (
                      <Tag key={index} color="green" style={{ margin: '4px' }}>
                        {strength}
                      </Tag>
                    ))}
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="改进建议" size="small">
                    {selectedEvaluation.improvements.map((improvement, index) => (
                      <Tag key={index} color="orange" style={{ margin: '4px' }}>
                        {improvement}
                      </Tag>
                    ))}
                  </Card>
                </Col>
              </Row>

              <Card title="详细评价" size="small" style={{ marginTop: 16 }}>
                <Paragraph>{selectedEvaluation.detailedComment}</Paragraph>
              </Card>
            </TabPane>
            
            <TabPane tab="合作历史" key="2">
              <Table
                dataSource={selectedEvaluation.cooperationHistory}
                columns={[
                  { title: '案件包名称', dataIndex: 'packageName', key: 'packageName' },
                  { title: '案件包编号', dataIndex: 'packageCode', key: 'packageCode' },
                  { title: '开始时间', dataIndex: 'startDate', key: 'startDate' },
                  { title: '结束时间', dataIndex: 'endDate', key: 'endDate' },
                  { title: '案件数量', dataIndex: 'caseCount', key: 'caseCount' },
                  { 
                    title: '金额', 
                    dataIndex: 'amount', 
                    key: 'amount',
                    render: (amount) => `¥${amount.toLocaleString()}`
                  },
                  { 
                    title: '回款率', 
                    dataIndex: 'recoveryRate', 
                    key: 'recoveryRate',
                    render: (rate) => `${rate}%`
                  },
                  { 
                    title: '处置时间', 
                    dataIndex: 'disposalTime', 
                    key: 'disposalTime',
                    render: (time) => `${time}天`
                  },
                  {
                    title: '状态',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => (
                      <Tag color={status === 'COMPLETED' ? 'green' : status === 'IN_PROGRESS' ? 'blue' : 'red'}>
                        {status === 'COMPLETED' ? '已完成' : status === 'IN_PROGRESS' ? '进行中' : '已取消'}
                      </Tag>
                    )
                  }
                ]}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </TabPane>
            
            <TabPane tab="业绩分析" key="3">
              <List
                dataSource={selectedEvaluation.caseAnalysis}
                renderItem={item => (
                  <List.Item>
                    <Card style={{ width: '100%' }} size="small">
                      <Row gutter={16} align="middle">
                        <Col span={4}>
                          <strong>{item.dimension}</strong>
                        </Col>
                        <Col span={6}>
                          <div>您的表现: <strong style={{ color: '#1890ff' }}>{item.yourPerformance}</strong></div>
                        </Col>
                        <Col span={6}>
                          <div>市场平均: <strong style={{ color: '#666' }}>{item.marketAverage}</strong></div>
                        </Col>
                        <Col span={4}>
                          <Badge 
                            count={item.ranking} 
                            style={{ backgroundColor: item.ranking <= 3 ? '#52c41a' : '#faad14' }}
                          />
                          <span style={{ marginLeft: 8 }}>排名</span>
                        </Col>
                        <Col span={4}>
                          <Text type="secondary">{item.improvement}</Text>
                        </Col>
                      </Row>
                    </Card>
                  </List.Item>
                )}
              />
            </TabPane>
            
            <TabPane tab="评价历史" key="4">
              <Timeline>
                {selectedEvaluation.evaluationHistory.map(item => (
                  <Timeline.Item key={item.id}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <strong>{item.evaluationDate}</strong>
                        <Rate disabled value={item.overallRating} style={{ fontSize: '14px' }} />
                        <Text type="secondary">({item.overallRating.toFixed(1)}分)</Text>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        {item.keyPoints.map((point, index) => (
                          <Tag key={index} color="blue" style={{ margin: '2px' }}>
                            {point}
                          </Tag>
                        ))}
                      </div>
                      <Text type="secondary">评价人: {item.evaluator}</Text>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </TabPane>
            
            {selectedEvaluation.mutualEvaluation && (
              <TabPane tab="互评反馈" key="5">
                <Alert
                  message="案源机构评价"
                  description={
                    <div>
                      <div style={{ marginBottom: 8 }}>
                        <Rate disabled value={selectedEvaluation.mutualEvaluation.sourceOrgRating} />
                        <span style={{ marginLeft: 8 }}>
                          {selectedEvaluation.mutualEvaluation.sourceOrgRating.toFixed(1)}分
                        </span>
                      </div>
                      <Paragraph>{selectedEvaluation.mutualEvaluation.sourceOrgComment}</Paragraph>
                      <Text type="secondary">
                        评价时间: {selectedEvaluation.mutualEvaluation.sourceOrgDate}
                      </Text>
                    </div>
                  }
                  type="info"
                  style={{ marginBottom: 16 }}
                />
                
                {selectedEvaluation.mutualEvaluation.responseRequired && (
                  <Card title="回复评价" size="small">
                    <Form layout="vertical">
                      <Form.Item label="回复内容">
                        <TextArea rows={4} placeholder="请回复案源机构的评价..." />
                      </Form.Item>
                      <Form.Item>
                        <Button type="primary">提交回复</Button>
                      </Form.Item>
                    </Form>
                  </Card>
                )}
              </TabPane>
            )}
          </Tabs>
        )}
      </Modal>

      {/* 编辑评价弹窗 */}
      <Modal
        title="编辑合作评价"
        open={evaluationModalVisible}
        onCancel={() => setEvaluationModalVisible(false)}
        width={700}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveEvaluation}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="serviceQuality"
                label="服务质量"
                rules={[{ required: true, message: '请评分' }]}
              >
                <Rate />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="communicationQuality"
                label="沟通质量"
                rules={[{ required: true, message: '请评分' }]}
              >
                <Rate />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="paymentTimeliness"
                label="付款及时性"
                rules={[{ required: true, message: '请评分' }]}
              >
                <Rate />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="overallRating"
            label="综合评分"
            rules={[{ required: true, message: '请给出综合评分' }]}
          >
            <Rate />
          </Form.Item>

          <Form.Item
            name="wouldRecommend"
            label="是否推荐"
          >
            <Select placeholder="请选择是否推荐">
              <Option value={true}>推荐</Option>
              <Option value={false}>不推荐</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="strengths"
            label="优势亮点"
          >
            <Select
              mode="tags"
              placeholder="请输入优势亮点，支持自定义添加"
              style={{ width: '100%' }}
            >
              <Option value="案件质量高">案件质量高</Option>
              <Option value="配合度好">配合度好</Option>
              <Option value="结算及时">结算及时</Option>
              <Option value="沟通顺畅">沟通顺畅</Option>
              <Option value="响应迅速">响应迅速</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="improvements"
            label="改进建议"
          >
            <Select
              mode="tags"
              placeholder="请输入改进建议，支持自定义添加"
              style={{ width: '100%' }}
            >
              <Option value="案件信息需完善">案件信息需完善</Option>
              <Option value="响应速度可提升">响应速度可提升</Option>
              <Option value="沟通效率有待提升">沟通效率有待提升</Option>
              <Option value="资料准备需及时">资料准备需及时</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="detailedComment"
            label="详细评价"
            rules={[{ required: true, message: '请输入详细评价' }]}
          >
            <TextArea rows={4} placeholder="请详细描述合作过程中的体验和建议" />
          </Form.Item>

          <Form.Item name="evidenceFiles" label="相关附件">
            <Upload
              action="/upload"
              listType="text"
              multiple
            >
              <Button icon={<UploadOutlined />}>上传证明材料</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setEvaluationModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存评价
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CooperationEvaluation;