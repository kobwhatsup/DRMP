import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Descriptions, Tabs, Tag, Button, Space, Row, Col, Timeline, Statistic,
  Table, Avatar, Badge, Divider, message, Modal, Form, Input, Progress,
  Alert, Tooltip, Rate, Select
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, SettingOutlined, PhoneOutlined,
  MailOutlined, TeamOutlined, TrophyOutlined, ThunderboltOutlined,
  CheckCircleOutlined, WarningOutlined, BankOutlined, SafetyCertificateOutlined,
  DollarOutlined, CalendarOutlined, UserOutlined, StarOutlined,
  FileTextOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { Line, Column, Gauge } from '@ant-design/plots';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { TextArea } = Input;

// 处置机构详情接口
interface DisposalOrgDetail {
  id: number;
  orgCode: string;
  orgName: string;
  type: string;
  typeName: string;
  
  // 基本信息
  legalRepresentative: string;
  registeredCapital: number;
  registrationDate: string;
  businessLicense: string;
  address: string;
  description: string;
  
  // 联系信息
  contactPerson: string;
  contactPhone: string;
  email: string;
  businessManager: string;
  
  // 银行信息
  bankName: string;
  bankAccount: string;
  
  // 处置能力信息
  capacityInfo: {
    teamSize: number;
    monthlyCapacity: number;
    currentLoad: number;
    utilization: number;
    avgHandlingTime: number;
    peakCapacity: number;
  };
  
  // 业绩统计
  performanceStats: {
    totalHandled: number;
    successRate: number;
    customerSatisfaction: number;
    avgResponseTime: number;
    monthlyTrend: Array<{
      month: string;
      handled: number;
      success: number;
      satisfaction: number;
    }>;
  };
  
  // 资质认证
  qualifications: {
    licenses: Array<{
      name: string;
      number: string;
      issueDate: string;
      expireDate: string;
      status: 'VALID' | 'EXPIRED' | 'PENDING';
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      issueDate: string;
      level: string;
    }>;
    awards: Array<{
      name: string;
      year: string;
      issuer: string;
      description: string;
    }>;
  };
  
  // 服务信息
  serviceInfo: {
    regions: string[];
    disposalTypes: string[];
    specialties: string[];
    workingHours: string;
    languages: string[];
  };
  
  // 会员信息
  membershipInfo: {
    level: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
    joinDate: string;
    renewDate: string;
    status: string;
    creditRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B';
    performanceScore: number;
  };
  
  // 财务信息
  financialInfo: {
    totalEarnings: string;
    currentMonthEarnings: string;
    outstandingAmount: string;
    avgMonthlyIncome: string;
    paymentStatus: 'NORMAL' | 'DELAYED' | 'OVERDUE';
    lastPaymentDate: string;
  };
  
  // 团队信息
  teamInfo: {
    totalMembers: number;
    seniorMembers: number;
    juniorMembers: number;
    members: Array<{
      name: string;
      position: string;
      qualification: string;
      experience: number;
      specialties: string[];
    }>;
  };
  
  // 案件类型分布
  caseTypeDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
    avgAmount: string;
  }>;
  
  // 操作历史
  operationHistory: Array<{
    id: string;
    action: string;
    operator: string;
    time: string;
    description: string;
    status: string;
  }>;
}

const DisposalOrgDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [orgDetail, setOrgDetail] = useState<DisposalOrgDetail | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [membershipModalVisible, setMembershipModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (id) {
      loadOrgDetail();
    }
  }, [id]);

  const loadOrgDetail = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockData: DisposalOrgDetail = {
        id: 1,
        orgCode: 'MC001',
        orgName: '北京朝阳调解中心',
        type: 'MEDIATION_CENTER',
        typeName: '调解中心',
        
        legalRepresentative: '王主任',
        registeredCapital: 500,
        registrationDate: '2019-03-15',
        businessLicense: '91110000MA001234X',
        address: '北京市朝阳区建国路88号',
        description: '北京朝阳调解中心成立于2019年，专业从事金融纠纷调解服务。',
        
        contactPerson: '王主任',
        contactPhone: '13800138001',
        email: 'wang@bjcymc.com',
        businessManager: '李经理',
        
        bankName: '中国建设银行朝阳支行',
        bankAccount: '1100123456789012',
        
        capacityInfo: {
          teamSize: 25,
          monthlyCapacity: 500,
          currentLoad: 480,
          utilization: 96,
          avgHandlingTime: 15,
          peakCapacity: 650
        },
        
        performanceStats: {
          totalHandled: 2856,
          successRate: 89.5,
          customerSatisfaction: 92.3,
          avgResponseTime: 2.5,
          monthlyTrend: [
            { month: '2024-01', handled: 380, success: 340, satisfaction: 91.2 },
            { month: '2024-02', handled: 420, success: 375, satisfaction: 90.8 },
            { month: '2024-03', handled: 450, success: 405, satisfaction: 92.1 },
            { month: '2024-04', handled: 440, success: 396, satisfaction: 91.8 },
            { month: '2024-05', handled: 480, success: 432, satisfaction: 92.5 },
            { month: '2024-06', handled: 490, success: 441, satisfaction: 92.8 },
            { month: '2024-07', handled: 480, success: 430, satisfaction: 92.3 }
          ]
        },
        
        qualifications: {
          licenses: [
            {
              name: '人民调解员证书',
              number: 'RMTZ2019001',
              issueDate: '2019-03-20',
              expireDate: '2024-03-20',
              status: 'VALID'
            },
            {
              name: '法律职业资格证',
              number: 'A2018001234',
              issueDate: '2018-12-15',
              expireDate: '2025-12-15',
              status: 'VALID'
            }
          ],
          certifications: [
            {
              name: 'ISO9001质量管理体系认证',
              issuer: '中国质量认证中心',
              issueDate: '2020-06-15',
              level: '优秀'
            },
            {
              name: '北京市优秀调解组织',
              issuer: '北京市司法局',
              issueDate: '2022-12-01',
              level: '市级'
            }
          ],
          awards: [
            {
              name: '2023年度优秀调解机构',
              year: '2023',
              issuer: '北京市调解协会',
              description: '在金融纠纷调解领域表现突出'
            }
          ]
        },
        
        serviceInfo: {
          regions: ['北京', '天津', '河北'],
          disposalTypes: ['民事调解', '商事调解', '金融纠纷调解'],
          specialties: ['金融纠纷', '消费纠纷', '合同纠纷'],
          workingHours: '周一至周五 9:00-17:00',
          languages: ['中文', '英文']
        },
        
        membershipInfo: {
          level: 'PLATINUM',
          joinDate: '2019-03-15',
          renewDate: '2024-03-15',
          status: 'ACTIVE',
          creditRating: 'AAA',
          performanceScore: 92
        },
        
        financialInfo: {
          totalEarnings: '156万',
          currentMonthEarnings: '23万',
          outstandingAmount: '12万',
          avgMonthlyIncome: '18万',
          paymentStatus: 'NORMAL',
          lastPaymentDate: '2024-07-25'
        },
        
        teamInfo: {
          totalMembers: 25,
          seniorMembers: 8,
          juniorMembers: 17,
          members: [
            {
              name: '王主任',
              position: '主任调解员',
              qualification: '高级调解员',
              experience: 15,
              specialties: ['金融纠纷', '合同纠纷']
            },
            {
              name: '李调解员',
              position: '资深调解员',
              qualification: '中级调解员',
              experience: 8,
              specialties: ['消费纠纷', '民事纠纷']
            },
            {
              name: '张调解员',
              position: '调解员',
              qualification: '初级调解员',
              experience: 3,
              specialties: ['简单民事纠纷']
            }
          ]
        },
        
        caseTypeDistribution: [
          { type: '金融纠纷', count: 1200, percentage: 42.0, avgAmount: '8,500' },
          { type: '消费纠纷', count: 856, percentage: 30.0, avgAmount: '3,200' },
          { type: '合同纠纷', count: 500, percentage: 17.5, avgAmount: '15,600' },
          { type: '其他纠纷', count: 300, percentage: 10.5, avgAmount: '5,800' }
        ],
        
        operationHistory: [
          {
            id: '1',
            action: '会员等级升级',
            operator: '系统管理员',
            time: '2024-07-25 14:30:00',
            description: '由于业绩优秀，会员等级升级为铂金级',
            status: 'COMPLETED'
          },
          {
            id: '2',
            action: '资质认证更新',
            operator: '王主任',
            time: '2024-07-20 09:00:00',
            description: '更新ISO9001质量管理体系认证',
            status: 'COMPLETED'
          },
          {
            id: '3',
            action: '团队扩充',
            operator: '王主任',
            time: '2024-07-15 16:00:00',
            description: '新增3名调解员，团队规模扩大到25人',
            status: 'COMPLETED'
          }
        ]
      };
      
      setOrgDetail(mockData);
    } catch (error) {
      console.error('加载机构详情失败:', error);
      message.error('加载机构详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleMembershipManagement = async () => {
    try {
      const values = await form.validateFields();
      // API调用
      message.success('会员信息更新成功');
      setMembershipModalVisible(false);
      form.resetFields();
      loadOrgDetail();
    } catch (error) {
      message.error('操作失败');
    }
  };

  if (!orgDetail) {
    return <Card loading={loading} />;
  }

  // 业绩趋势图配置
  const performanceTrendConfig = {
    data: orgDetail.performanceStats.monthlyTrend,
    xField: 'month',
    yField: 'handled',
    height: 300,
    point: { size: 5, shape: 'diamond' },
    color: '#1890ff',
  };

  // 案件类型分布图配置
  const caseTypeConfig = {
    data: orgDetail.caseTypeDistribution,
    xField: 'type',
    yField: 'count',
    height: 300,
    color: '#52c41a',
    label: {
      position: 'middle' as const,
      style: { fill: '#FFFFFF', opacity: 0.6 },
    },
  };

  // 利用率仪表盘配置
  const utilizationGaugeConfig = {
    percent: orgDetail.capacityInfo.utilization / 100,
    height: 200,
    color: ['#F4664A', '#FAAD14', '#30BF78'],
    innerRadius: 0.75,
    statistic: {
      title: {
        formatter: () => '产能利用率',
        style: ({ percent }: { percent: number }) => ({
          fontSize: '14px',
          color: percent > 0.95 ? '#F4664A' : '#30BF78',
        }),
      },
      content: {
        style: {
          fontSize: '24px',
          fontWeight: 'bold',
        },
        formatter: ({ percent }: { percent: number }) => `${(percent * 100).toFixed(1)}%`,
      },
    },
  };

  const getMembershipLevelColor = (level: string) => {
    const levelMap = {
      'PLATINUM': '#722ed1',
      'GOLD': '#faad14',
      'SILVER': '#d9d9d9',
      'BRONZE': '#d48806'
    };
    return levelMap[level as keyof typeof levelMap] || 'default';
  };

  const getCreditRatingColor = (rating: string) => {
    const ratingMap = {
      'AAA': '#52c41a',
      'AA': '#73d13d',
      'A': '#95de64',
      'BBB': '#faad14',
      'BB': '#ffc53d',
      'B': '#ff7875'
    };
    return ratingMap[rating as keyof typeof ratingMap] || 'default';
  };

  return (
    <div className="disposal-org-detail">
      {/* 页面头部 */}
      <Card style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space size="large" align="center">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/disposal-orgs')}
              >
                返回列表
              </Button>
              <Avatar 
                size={48} 
                style={{ backgroundColor: '#1890ff' }}
                icon={<TeamOutlined />}
              />
              <div>
                <h2 style={{ margin: 0 }}>{orgDetail.orgName}</h2>
                <Space>
                  <Tag color="blue">{orgDetail.typeName}</Tag>
                  <Tag color={getMembershipLevelColor(orgDetail.membershipInfo.level)}>
                    {orgDetail.membershipInfo.level}会员
                  </Tag>
                  <Badge 
                    status="success"
                    text="正常合作"
                  />
                </Space>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<EditOutlined />} 
                onClick={() => navigate(`/disposal-orgs/${id}/edit`)}
              >
                编辑
              </Button>
              <Button 
                icon={<SettingOutlined />}
                onClick={() => setMembershipModalVisible(true)}
              >
                会员管理
              </Button>
              <Button 
                type="primary"
                icon={<TrophyOutlined />}
                onClick={() => navigate(`/disposal-orgs/${id}/performance`)}
              >
                业绩管理
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 关键指标卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="处理案件总数"
              value={orgDetail.performanceStats.totalHandled}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="成功率"
              value={orgDetail.performanceStats.successRate}
              precision={1}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="客户满意度"
              value={orgDetail.performanceStats.customerSatisfaction}
              precision={1}
              suffix="%"
              prefix={<StarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="累计收入"
              value={orgDetail.financialInfo.totalEarnings}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容区域 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="基本信息" key="basic">
            <Descriptions title="机构信息" bordered column={2}>
              <Descriptions.Item label="机构代码">{orgDetail.orgCode}</Descriptions.Item>
              <Descriptions.Item label="机构类型">{orgDetail.typeName}</Descriptions.Item>
              <Descriptions.Item label="法定代表人">{orgDetail.legalRepresentative}</Descriptions.Item>
              <Descriptions.Item label="注册资本">{orgDetail.registeredCapital}万元</Descriptions.Item>
              <Descriptions.Item label="成立日期">{orgDetail.registrationDate}</Descriptions.Item>
              <Descriptions.Item label="营业执照">{orgDetail.businessLicense}</Descriptions.Item>
              <Descriptions.Item label="地址" span={2}>{orgDetail.address}</Descriptions.Item>
              <Descriptions.Item label="机构简介" span={2}>{orgDetail.description}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="联系信息" bordered column={2}>
              <Descriptions.Item label="联系人">{orgDetail.contactPerson}</Descriptions.Item>
              <Descriptions.Item label="联系电话">
                <Button type="link" icon={<PhoneOutlined />} href={`tel:${orgDetail.contactPhone}`}>
                  {orgDetail.contactPhone}
                </Button>
              </Descriptions.Item>
              <Descriptions.Item label="邮箱">
                <Button type="link" icon={<MailOutlined />} href={`mailto:${orgDetail.email}`}>
                  {orgDetail.email}
                </Button>
              </Descriptions.Item>
              <Descriptions.Item label="业务经理">{orgDetail.businessManager}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="银行信息" bordered column={2}>
              <Descriptions.Item label="开户行">{orgDetail.bankName}</Descriptions.Item>
              <Descriptions.Item label="银行账号">{orgDetail.bankAccount}</Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab="处置能力" key="capacity">
            <Row gutter={16}>
              <Col span={8}>
                <Card title="产能利用率">
                  <Gauge {...utilizationGaugeConfig} />
                </Card>
              </Col>
              <Col span={16}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Card>
                      <Statistic
                        title="团队规模"
                        value={orgDetail.capacityInfo.teamSize}
                        suffix="人"
                        prefix={<TeamOutlined />}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card>
                      <Statistic
                        title="月处理能力"
                        value={orgDetail.capacityInfo.monthlyCapacity}
                        suffix="件"
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card>
                      <Statistic
                        title="当前负载"
                        value={orgDetail.capacityInfo.currentLoad}
                        suffix="件"
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card>
                      <Statistic
                        title="平均处理时间"
                        value={orgDetail.capacityInfo.avgHandlingTime}
                        suffix="天"
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="业绩统计" key="performance">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="月度处理趋势">
                  <Line {...performanceTrendConfig} />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="案件类型分布">
                  <Column {...caseTypeConfig} />
                </Card>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Card title="业绩指标">
                  <Row gutter={16}>
                    <Col span={6}>
                      <Statistic
                        title="总处理案件"
                        value={orgDetail.performanceStats.totalHandled}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="成功率"
                        value={orgDetail.performanceStats.successRate}
                        precision={1}
                        suffix="%"
                        valueStyle={{ color: '#52c41a' }}
                      />
                      <Progress 
                        percent={orgDetail.performanceStats.successRate} 
                        strokeColor="#52c41a" 
                        showInfo={false}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="客户满意度"
                        value={orgDetail.performanceStats.customerSatisfaction}
                        precision={1}
                        suffix="%"
                        valueStyle={{ color: '#faad14' }}
                      />
                      <Rate 
                        disabled 
                        value={orgDetail.performanceStats.customerSatisfaction / 20} 
                        allowHalf 
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="平均响应时间"
                        value={orgDetail.performanceStats.avgResponseTime}
                        precision={1}
                        suffix="小时"
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="资质认证" key="qualifications">
            <Card title="执业资质" style={{ marginBottom: 16 }}>
              <Table
                dataSource={orgDetail.qualifications.licenses}
                rowKey="number"
               
                pagination={false}
                columns={[
                  { title: '资质名称', dataIndex: 'name', key: 'name' },
                  { title: '证书编号', dataIndex: 'number', key: 'number' },
                  { title: '颁发日期', dataIndex: 'issueDate', key: 'issueDate' },
                  { title: '到期日期', dataIndex: 'expireDate', key: 'expireDate' },
                  { 
                    title: '状态', 
                    dataIndex: 'status', 
                    key: 'status',
                    render: (status: string) => (
                      <Tag color={status === 'VALID' ? 'green' : status === 'EXPIRED' ? 'red' : 'orange'}>
                        {status === 'VALID' ? '有效' : status === 'EXPIRED' ? '已过期' : '待审核'}
                      </Tag>
                    )
                  },
                ]}
              />
            </Card>

            <Card title="认证证书" style={{ marginBottom: 16 }}>
              <Table
                dataSource={orgDetail.qualifications.certifications}
                rowKey="name"
               
                pagination={false}
                columns={[
                  { title: '认证名称', dataIndex: 'name', key: 'name' },
                  { title: '颁发机构', dataIndex: 'issuer', key: 'issuer' },
                  { title: '颁发日期', dataIndex: 'issueDate', key: 'issueDate' },
                  { title: '等级', dataIndex: 'level', key: 'level' },
                ]}
              />
            </Card>

            <Card title="获奖荣誉">
              <Table
                dataSource={orgDetail.qualifications.awards}
                rowKey="name"
               
                pagination={false}
                columns={[
                  { title: '奖项名称', dataIndex: 'name', key: 'name' },
                  { title: '获奖年份', dataIndex: 'year', key: 'year' },
                  { title: '颁发机构', dataIndex: 'issuer', key: 'issuer' },
                  { title: '描述', dataIndex: 'description', key: 'description' },
                ]}
              />
            </Card>
          </TabPane>

          <TabPane tab="会员管理" key="membership">
            <Card title="会员信息" style={{ marginBottom: 16 }}>
              <Descriptions bordered column={3}>
                <Descriptions.Item label="会员等级">
                  <Tag color={getMembershipLevelColor(orgDetail.membershipInfo.level)}>
                    {orgDetail.membershipInfo.level}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="信用等级">
                  <Tag color={getCreditRatingColor(orgDetail.membershipInfo.creditRating)}>
                    {orgDetail.membershipInfo.creditRating}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="业绩评分">
                  <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
                    {orgDetail.membershipInfo.performanceScore}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="加入日期">{orgDetail.membershipInfo.joinDate}</Descriptions.Item>
                <Descriptions.Item label="续费日期">{orgDetail.membershipInfo.renewDate}</Descriptions.Item>
                <Descriptions.Item label="会员状态">
                  <Badge status="success" text="正常" />
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="财务信息">
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="累计收入"
                    value={orgDetail.financialInfo.totalEarnings}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<DollarOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="本月收入"
                    value={orgDetail.financialInfo.currentMonthEarnings}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="待结金额"
                    value={orgDetail.financialInfo.outstandingAmount}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="月均收入"
                    value={orgDetail.financialInfo.avgMonthlyIncome}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Col>
              </Row>
            </Card>
          </TabPane>

          <TabPane tab="团队信息" key="team">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="团队总人数"
                    value={orgDetail.teamInfo.totalMembers}
                    suffix="人"
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="资深成员"
                    value={orgDetail.teamInfo.seniorMembers}
                    suffix="人"
                    prefix={<TrophyOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="初级成员"
                    value={orgDetail.teamInfo.juniorMembers}
                    suffix="人"
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
            </Row>

            <Card title="团队成员">
              <Table
                dataSource={orgDetail.teamInfo.members}
                rowKey="name"
               
                pagination={false}
                columns={[
                  { title: '姓名', dataIndex: 'name', key: 'name' },
                  { title: '职位', dataIndex: 'position', key: 'position' },
                  { title: '资质', dataIndex: 'qualification', key: 'qualification' },
                  { 
                    title: '工作经验', 
                    dataIndex: 'experience', 
                    key: 'experience',
                    render: (years: number) => `${years}年`
                  },
                  { 
                    title: '专业领域', 
                    dataIndex: 'specialties', 
                    key: 'specialties',
                    render: (specialties: string[]) => (
                      <div>
                        {specialties.map(specialty => (
                          <Tag key={specialty}>{specialty}</Tag>
                        ))}
                      </div>
                    )
                  },
                ]}
              />
            </Card>
          </TabPane>

          <TabPane tab="操作历史" key="history">
            <Timeline>
              {orgDetail.operationHistory.map(item => (
                <Timeline.Item
                  key={item.id}
                  color={item.status === 'COMPLETED' ? 'green' : 'blue'}
                >
                  <div>
                    <h4>{item.action}</h4>
                    <p>{item.description}</p>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      <CalendarOutlined /> {item.time} | 
                      <UserOutlined style={{ marginLeft: 8 }} /> {item.operator}
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </TabPane>
        </Tabs>
      </Card>

      {/* 会员管理弹窗 */}
      <Modal
        title="会员管理"
        open={membershipModalVisible}
        onOk={handleMembershipManagement}
        onCancel={() => {
          setMembershipModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="操作类型"
            name="actionType"
            rules={[{ required: true, message: '请选择操作类型' }]}
          >
            <Select placeholder="请选择操作类型">
              <Select.Option value="upgrade">会员升级</Select.Option>
              <Select.Option value="downgrade">会员降级</Select.Option>
              <Select.Option value="suspend">暂停会员</Select.Option>
              <Select.Option value="renew">续费会员</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="备注说明"
            name="remark"
            rules={[{ required: true, message: '请输入备注说明' }]}
          >
            <TextArea rows={4} placeholder="请输入操作备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DisposalOrgDetail;