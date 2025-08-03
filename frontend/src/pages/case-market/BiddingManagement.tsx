import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Space, Tag, Input, Select, Row, Col,
  Statistic, message, Modal, Form, Rate, Progress, Typography,
  Divider, Alert, Badge, Tooltip, Steps, Timeline, Tabs,
  DatePicker, InputNumber, Upload, List, Avatar, Descriptions
} from 'antd';
import {
  EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined,
  SearchOutlined, ReloadOutlined, ExportOutlined, TrophyOutlined,
  ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined,
  FileTextOutlined, UserOutlined, DollarOutlined, CalendarOutlined,
  UploadOutlined, DownloadOutlined, MessageOutlined, PhoneOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { useDebouncedCallback } from 'use-debounce';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Step } = Steps;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// 竞标记录接口
interface BiddingRecord {
  id: number;
  packageId: number;
  packageName: string;
  packageCode: string;
  caseType: string;
  totalCases: number;
  totalAmount: number;
  publishOrg: string;
  bidStatus: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  bidAmount: number;
  proposedFeeRate: number;
  expectedRecoveryRate: number;
  disposalPeriod: number;
  submittedAt: string;
  bidDeadline: string;
  reviewResult?: string;
  competitorCount: number;
  myRanking?: number;
  winProbability: number;
  serviceRegions: string[];
  requirements: string;
}

// 竞标详情接口
interface BiddingDetail extends BiddingRecord {
  packageDescription: string;
  publishOrgInfo: {
    name: string;
    contactPerson: string;
    contactPhone: string;
    email: string;
  };
  slaRequirements: {
    maxResponseTime: number;
    maxDisposalTime: number;
    minRecoveryRate: number;
    reportingFrequency: string;
  };
  bidHistory: BiddingHistoryItem[];
  competitors: CompetitorInfo[];
}

interface BiddingHistoryItem {
  id: number;
  action: string;
  description: string;
  operator: string;
  timestamp: string;
  status: string;
}

interface CompetitorInfo {
  id: number;
  orgName: string;
  bidAmount: number;
  feeRate: number;
  recoveryRate: number;
  ranking: number;
  isWinner: boolean;
}

const BiddingManagement: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [biddings, setBiddings] = useState<BiddingRecord[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // 弹窗状态
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [selectedBidding, setSelectedBidding] = useState<BiddingDetail | null>(null);
  
  const [form] = Form.useForm();

  // 模拟数据
  const mockBiddings: BiddingRecord[] = [
    {
      id: 1,
      packageId: 1001,
      packageName: '个人信用贷款案件包2024-001',
      packageCode: 'PKG-2024-001',
      caseType: 'PERSONAL_LOAN',
      totalCases: 500,
      totalAmount: 25000000,
      publishOrg: '某商业银行',
      bidStatus: 'SUBMITTED',
      bidAmount: 23000000,
      proposedFeeRate: 8.5,
      expectedRecoveryRate: 35,
      disposalPeriod: 90,
      submittedAt: '2024-07-20 14:30:00',
      bidDeadline: '2024-08-05 18:00:00',
      competitorCount: 12,
      myRanking: 3,
      winProbability: 65,
      serviceRegions: ['北京市', '天津市', '河北省'],
      requirements: '要求处置机构具备丰富的个人信贷处置经验，有完善的催收团队和法务团队'
    },
    {
      id: 2,
      packageId: 1002,
      packageName: '信用卡逾期案件包2024-002',
      packageCode: 'PKG-2024-002',
      caseType: 'CREDIT_CARD',
      totalCases: 800,
      totalAmount: 18000000,
      publishOrg: '某股份制银行',
      bidStatus: 'ACCEPTED',
      bidAmount: 16500000,
      proposedFeeRate: 9.2,
      expectedRecoveryRate: 42,
      disposalPeriod: 120,
      submittedAt: '2024-07-15 10:15:00',
      bidDeadline: '2024-07-30 18:00:00',
      reviewResult: '恭喜您的投标方案被选中！请及时联系发布机构确认合作细节。',
      competitorCount: 8,
      myRanking: 1,
      winProbability: 95,
      serviceRegions: ['上海市', '江苏省', '浙江省'],
      requirements: '要求处置机构在长三角地区有分支机构，有信用卡业务处置经验'
    },
    {
      id: 3,
      packageId: 1003,
      packageName: '车贷逾期案件包2024-003',
      packageCode: 'PKG-2024-003',
      caseType: 'CAR_LOAN',
      totalCases: 200,
      totalAmount: 15000000,
      publishOrg: '某汽车金融公司',
      bidStatus: 'REJECTED',
      bidAmount: 14200000,
      proposedFeeRate: 10.5,
      expectedRecoveryRate: 55,
      disposalPeriod: 60,
      submittedAt: '2024-07-10 16:45:00',
      bidDeadline: '2024-07-25 18:00:00',
      reviewResult: '感谢您的参与，本次您的方案未被选中。建议优化处置周期和费率方案。',
      competitorCount: 6,
      myRanking: 4,
      winProbability: 25,
      serviceRegions: ['广东省', '深圳市'],
      requirements: '要求处置机构熟悉车辆抵押贷款业务，有车辆处置经验和渠道'
    },
    {
      id: 4,
      packageId: 1004,
      packageName: '企业贷款逾期案件包2024-004',
      packageCode: 'PKG-2024-004',
      caseType: 'BUSINESS_LOAN',
      totalCases: 50,
      totalAmount: 80000000,
      publishOrg: '某城商行',
      bidStatus: 'DRAFT',
      bidAmount: 0,
      proposedFeeRate: 0,
      expectedRecoveryRate: 0,
      disposalPeriod: 0,
      submittedAt: '',
      bidDeadline: '2024-08-10 18:00:00',
      competitorCount: 15,
      winProbability: 0,
      serviceRegions: ['北京市', '上海市', '广州市'],
      requirements: '要求处置机构有企业贷款处置经验，具备完善的尽调和法务团队'
    }
  ];

  // 获取竞标列表
  const fetchBiddings = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setBiddings(mockBiddings);
    } catch (error) {
      message.error('获取竞标列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 搜索防抖处理
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchText(value);
  }, 300);

  // 过滤数据
  const filteredBiddings = biddings.filter(bidding => {
    const matchSearch = !searchText || 
      bidding.packageName.toLowerCase().includes(searchText.toLowerCase()) ||
      bidding.packageCode.toLowerCase().includes(searchText.toLowerCase()) ||
      bidding.publishOrg.toLowerCase().includes(searchText.toLowerCase());
    
    const matchStatus = !statusFilter || bidding.bidStatus === statusFilter;
    
    return matchSearch && matchStatus;
  });

  // 获取状态显示配置
  const getStatusConfig = (status: string) => {
    const configs = {
      'DRAFT': { color: 'default', text: '草稿', icon: <EditOutlined /> },
      'SUBMITTED': { color: 'processing', text: '已提交', icon: <ClockCircleOutlined /> },
      'UNDER_REVIEW': { color: 'warning', text: '评审中', icon: <ExclamationCircleOutlined /> },
      'ACCEPTED': { color: 'success', text: '中标', icon: <TrophyOutlined /> },
      'REJECTED': { color: 'error', text: '未中标', icon: <ExclamationCircleOutlined /> },
      'EXPIRED': { color: 'default', text: '已过期', icon: <ClockCircleOutlined /> }
    };
    return configs[status as keyof typeof configs] || configs['DRAFT'];
  };

  // 表格列定义
  const columns: ColumnsType<BiddingRecord> = [
    {
      title: '案件包信息',
      key: 'packageInfo',
      width: 300,
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <strong>{record.packageName}</strong>
          </div>
          <div style={{ color: '#666', fontSize: '12px', marginBottom: 4 }}>
            {record.packageCode} | {record.publishOrg}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Tag color="blue">{record.totalCases}案件</Tag>
            <Tag color="green">¥{(record.totalAmount / 10000).toFixed(0)}万</Tag>
          </div>
        </div>
      ),
    },
    {
      title: '竞标状态',
      key: 'status',
      width: 120,
      render: (_, record) => {
        const config = getStatusConfig(record.bidStatus);
        return (
          <div style={{ textAlign: 'center' }}>
            <Badge 
              status={config.color as any}
              text={
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {config.icon}
                  {config.text}
                </span>
              }
            />
            {record.myRanking && (
              <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                排名: {record.myRanking}/{record.competitorCount}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: '竞标方案',
      key: 'bidInfo',
      width: 150,
      render: (_, record) => (
        <div>
          {record.bidAmount > 0 ? (
            <>
              <div>费率: {record.proposedFeeRate}%</div>
              <div>回款率: {record.expectedRecoveryRate}%</div>
              <div>周期: {record.disposalPeriod}天</div>
            </>
          ) : (
            <Text type="secondary">未填写</Text>
          )}
        </div>
      ),
    },
    {
      title: '中标概率',
      key: 'probability',
      width: 120,
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          <Progress
            type="circle"
            size={50}
            percent={record.winProbability}
            strokeColor={
              record.winProbability >= 70 ? '#52c41a' :
              record.winProbability >= 40 ? '#faad14' : '#f5222d'
            }
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
            中标概率
          </div>
        </div>
      ),
    },
    {
      title: '截止时间',
      key: 'deadline',
      width: 120,
      render: (_, record) => {
        const isUrgent = dayjs(record.bidDeadline).diff(dayjs(), 'hour') < 24;
        return (
          <div style={{ color: isUrgent ? '#f5222d' : '#666' }}>
            <div>{dayjs(record.bidDeadline).format('MM-DD')}</div>
            <div style={{ fontSize: '12px' }}>
              {dayjs(record.bidDeadline).format('HH:mm')}
            </div>
            {isUrgent && <Tag color="red">紧急</Tag>}
          </div>
        );
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
          {record.bidStatus === 'DRAFT' && (
            <Tooltip title="编辑竞标">
              <Button 
                type="text" 
                size="small" 
                icon={<EditOutlined />}
                onClick={() => handleEditBid(record)}
              />
            </Tooltip>
          )}
          {record.bidStatus === 'ACCEPTED' && (
            <Tooltip title="联系发布方">
              <Button 
                type="text" 
                size="small" 
                icon={<PhoneOutlined />}
                onClick={() => handleContact(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // 操作处理函数
  const handleViewDetail = async (record: BiddingRecord) => {
    setLoading(true);
    try {
      // 模拟获取详细信息
      await new Promise(resolve => setTimeout(resolve, 500));
      const detail: BiddingDetail = {
        ...record,
        packageDescription: '本批次案件主要为个人信用贷款逾期案件，债务人分布在华北地区，案件金额在1万-10万之间，逾期时间90-365天不等。',
        publishOrgInfo: {
          name: record.publishOrg,
          contactPerson: '张经理',
          contactPhone: '010-12345678',
          email: 'zhang.manager@bank.com'
        },
        slaRequirements: {
          maxResponseTime: 24,
          maxDisposalTime: 90,
          minRecoveryRate: 30,
          reportingFrequency: '每周'
        },
        bidHistory: [
          {
            id: 1,
            action: '创建竞标',
            description: '创建竞标草稿',
            operator: '当前用户',
            timestamp: '2024-07-20 09:00:00',
            status: 'DRAFT'
          },
          {
            id: 2,
            action: '提交竞标',
            description: '提交竞标方案',
            operator: '当前用户',
            timestamp: '2024-07-20 14:30:00',
            status: 'SUBMITTED'
          }
        ],
        competitors: [
          {
            id: 1,
            orgName: '某调解中心A',
            bidAmount: 24000000,
            feeRate: 8.2,
            recoveryRate: 38,
            ranking: 1,
            isWinner: false
          },
          {
            id: 2,
            orgName: '某律所B',
            bidAmount: 23500000,
            feeRate: 8.8,
            recoveryRate: 33,
            ranking: 2,
            isWinner: false
          },
          {
            id: 3,
            orgName: '当前机构',
            bidAmount: record.bidAmount,
            feeRate: record.proposedFeeRate,
            recoveryRate: record.expectedRecoveryRate,
            ranking: record.myRanking || 0,
            isWinner: record.bidStatus === 'ACCEPTED'
          }
        ]
      };
      setSelectedBidding(detail);
      setDetailModalVisible(true);
    } catch (error) {
      message.error('获取详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBid = (record: BiddingRecord) => {
    form.setFieldsValue({
      bidAmount: record.bidAmount || record.totalAmount * 0.9,
      proposedFeeRate: record.proposedFeeRate || 8.5,
      expectedRecoveryRate: record.expectedRecoveryRate || 35,
      disposalPeriod: record.disposalPeriod || 90,
      bidDescription: ''
    });
    setBidModalVisible(true);
  };

  const handleContact = (record: BiddingRecord) => {
    Modal.info({
      title: '联系发布方',
      content: (
        <div>
          <p>机构：{record.publishOrg}</p>
          <p>联系人：张经理</p>
          <p>电话：010-12345678</p>
          <p>邮箱：zhang.manager@bank.com</p>
        </div>
      )
    });
  };

  const handleSubmitBid = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('竞标方案提交成功');
      setBidModalVisible(false);
      fetchBiddings(); // 刷新列表
    } catch (error) {
      message.error('提交失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    message.info('竞标记录导出功能开发中...');
  };

  // 统计数据
  const stats = {
    total: biddings.length,
    draft: biddings.filter(b => b.bidStatus === 'DRAFT').length,
    submitted: biddings.filter(b => b.bidStatus === 'SUBMITTED' || b.bidStatus === 'UNDER_REVIEW').length,
    won: biddings.filter(b => b.bidStatus === 'ACCEPTED').length,
    winRate: biddings.length > 0 ? Math.round((biddings.filter(b => b.bidStatus === 'ACCEPTED').length / biddings.filter(b => b.bidStatus !== 'DRAFT').length) * 100) : 0
  };

  useEffect(() => {
    fetchBiddings();
  }, []);

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>竞标管理</Title>
        <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
          管理您的案件包竞标记录，跟踪竞标状态和结果
        </Paragraph>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总竞标数"
              value={stats.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="草稿"
              value={stats.draft}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中"
              value={stats.submitted}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="中标率"
              value={stats.winRate}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
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
                placeholder="搜索案件包名称、编号或发布机构"
                allowClear
                style={{ width: 300 }}
                onChange={(e) => debouncedSearch(e.target.value)}
                onSearch={debouncedSearch}
              />
              <Select
                placeholder="竞标状态"
                allowClear
                style={{ width: 150 }}
                value={statusFilter}
                onChange={setStatusFilter}
              >
                <Option value="DRAFT">草稿</Option>
                <Option value="SUBMITTED">已提交</Option>
                <Option value="UNDER_REVIEW">评审中</Option>
                <Option value="ACCEPTED">中标</Option>
                <Option value="REJECTED">未中标</Option>
                <Option value="EXPIRED">已过期</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchBiddings}>
                刷新
              </Button>
              <Button icon={<ExportOutlined />} onClick={handleExport}>
                导出记录
              </Button>
              <Button type="primary" onClick={() => navigate('/case-market/browse')}>
                浏览案件包
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 竞标列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredBiddings}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            total: filteredBiddings.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>

      {/* 竞标详情弹窗 */}
      <Modal
        title="竞标详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedBidding && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="基本信息" key="1">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="案件包名称" span={2}>
                  {selectedBidding.packageName}
                </Descriptions.Item>
                <Descriptions.Item label="案件包编号">
                  {selectedBidding.packageCode}
                </Descriptions.Item>
                <Descriptions.Item label="发布机构">
                  {selectedBidding.publishOrg}
                </Descriptions.Item>
                <Descriptions.Item label="案件数量">
                  {selectedBidding.totalCases}
                </Descriptions.Item>
                <Descriptions.Item label="总金额">
                  ¥{selectedBidding.totalAmount.toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="服务区域" span={2}>
                  {selectedBidding.serviceRegions.join(', ')}
                </Descriptions.Item>
                <Descriptions.Item label="案件包描述" span={2}>
                  {selectedBidding.packageDescription}
                </Descriptions.Item>
                <Descriptions.Item label="处置要求" span={2}>
                  {selectedBidding.requirements}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            
            <TabPane tab="我的竞标" key="2">
              <Alert
                message={`竞标状态：${getStatusConfig(selectedBidding.bidStatus).text}`}
                type={selectedBidding.bidStatus === 'ACCEPTED' ? 'success' : 
                      selectedBidding.bidStatus === 'REJECTED' ? 'error' : 'info'}
                style={{ marginBottom: 16 }}
              />
              
              <Descriptions column={2} bordered>
                <Descriptions.Item label="竞标金额">
                  ¥{selectedBidding.bidAmount.toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="服务费率">
                  {selectedBidding.proposedFeeRate}%
                </Descriptions.Item>
                <Descriptions.Item label="预期回款率">
                  {selectedBidding.expectedRecoveryRate}%
                </Descriptions.Item>
                <Descriptions.Item label="处置周期">
                  {selectedBidding.disposalPeriod}天
                </Descriptions.Item>
                <Descriptions.Item label="提交时间">
                  {selectedBidding.submittedAt}
                </Descriptions.Item>
                <Descriptions.Item label="我的排名">
                  {selectedBidding.myRanking}/{selectedBidding.competitorCount}
                </Descriptions.Item>
              </Descriptions>
              
              {selectedBidding.reviewResult && (
                <Alert
                  message="评审结果"
                  description={selectedBidding.reviewResult}
                  type={selectedBidding.bidStatus === 'ACCEPTED' ? 'success' : 'warning'}
                  style={{ marginTop: 16 }}
                />
              )}
            </TabPane>
            
            <TabPane tab="竞争对手" key="3">
              <List
                dataSource={selectedBidding.competitors}
                renderItem={(competitor, index) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          style={{ 
                            backgroundColor: competitor.isWinner ? '#52c41a' : 
                                           competitor.ranking <= 3 ? '#faad14' : '#d9d9d9'
                          }}
                        >
                          {competitor.ranking}
                        </Avatar>
                      }
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {competitor.orgName}
                          {competitor.isWinner && <TrophyOutlined style={{ color: '#52c41a' }} />}
                        </div>
                      }
                      description={
                        <div>
                          <div>竞标金额: ¥{competitor.bidAmount.toLocaleString()}</div>
                          <div>费率: {competitor.feeRate}% | 回款率: {competitor.recoveryRate}%</div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </TabPane>
            
            <TabPane tab="操作历史" key="4">
              <Timeline>
                {selectedBidding.bidHistory.map(item => (
                  <Timeline.Item key={item.id}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{item.action}</div>
                      <div style={{ color: '#666', fontSize: '12px', marginBottom: 4 }}>
                        {item.timestamp} | {item.operator}
                      </div>
                      <div>{item.description}</div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* 编辑竞标弹窗 */}
      <Modal
        title="编辑竞标方案"
        open={bidModalVisible}
        onCancel={() => setBidModalVisible(false)}
        width={600}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitBid}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="bidAmount"
                label="竞标金额"
                rules={[{ required: true, message: '请输入竞标金额' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/¥\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="proposedFeeRate"
                label="服务费率(%)"
                rules={[{ required: true, message: '请输入服务费率' }]}
              >
                <InputNumber min={0} max={20} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="expectedRecoveryRate"
                label="预期回款率(%)"
                rules={[{ required: true, message: '请输入预期回款率' }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="disposalPeriod"
                label="处置周期(天)"
                rules={[{ required: true, message: '请输入处置周期' }]}
              >
                <InputNumber min={30} max={365} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="bidDescription"
            label="竞标说明"
            rules={[{ required: true, message: '请输入竞标说明' }]}
          >
            <TextArea rows={4} placeholder="请详细说明您的处置方案、团队优势、服务承诺等" />
          </Form.Item>

          <Form.Item name="attachments" label="附件材料">
            <Upload
              action="/upload"
              listType="text"
              multiple
            >
              <Button icon={<UploadOutlined />}>上传资质证明或方案文档</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setBidModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                提交竞标
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BiddingManagement;