import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Select, Button, Space, Table, Tag, 
  Tabs, Alert, Spin, message, Progress, Badge, Modal, Form, Input, InputNumber
} from 'antd';
import {
  TeamOutlined, ThunderboltOutlined, WarningOutlined, CheckCircleOutlined,
  DownloadOutlined, ReloadOutlined, SettingOutlined, EyeOutlined,
  UserAddOutlined, UserDeleteOutlined, EditOutlined, SafetyCertificateOutlined,
  CalendarOutlined, ClockCircleOutlined, BarChartOutlined
} from '@ant-design/icons';
import { Line, Column, Gauge } from '@ant-design/plots';
import type { ColumnsType } from 'antd/es/table';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

// 数据接口定义
interface ResourceData {
  summary: {
    totalMembers: number;
    activeMnembers: number;
    seniorMembers: number;
    juniorMembers: number;
    avgExperience: number;
    utilizationRate: number;
    trainingHours: number;
    certificationRate: number;
  };
  memberList: Array<{
    id: number;
    name: string;
    position: string;
    level: 'SENIOR' | 'INTERMEDIATE' | 'JUNIOR';
    qualification: string;
    experience: number;
    specialties: string[];
    currentLoad: number;
    maxCapacity: number;
    utilization: number;
    performance: number;
    certifications: string[];
    joinDate: string;
    lastActive: string;
    status: 'ACTIVE' | 'BUSY' | 'LEAVE' | 'TRAINING';
  }>;
  teamStructure: Array<{
    department: string;
    totalMembers: number;
    seniorMembers: number;
    juniorMembers: number;
    utilization: number;
    avgPerformance: number;
  }>;
  skillDistribution: Array<{
    skill: string;
    memberCount: number;
    level: 'EXPERT' | 'PROFICIENT' | 'BASIC';
    demandLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  workloadTrend: Array<{
    month: string;
    totalCapacity: number;
    usedCapacity: number;
    utilization: number;
    newMembers: number;
  }>;
  trainingPrograms: Array<{
    id: string;
    name: string;
    type: 'SKILL' | 'CERTIFICATION' | 'COMPLIANCE';
    duration: number;
    participants: number;
    status: 'ACTIVE' | 'PLANNED' | 'COMPLETED';
    startDate: string;
    endDate: string;
  }>;
  performanceMetrics: Array<{
    metric: string;
    current: number;
    target: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
    status: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
  }>;
}

const DisposalOrgResourceManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resourceData, setResourceData] = useState<ResourceData | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [trainingModalVisible, setTrainingModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [form] = Form.useForm();
  const [trainingForm] = Form.useForm();

  useEffect(() => {
    loadResourceData();
  }, [selectedDepartment, selectedLevel, selectedStatus]);

  const loadResourceData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockData: ResourceData = {
        summary: {
          totalMembers: 156,
          activeMnembers: 142,
          seniorMembers: 45,
          juniorMembers: 97,
          avgExperience: 5.8,
          utilizationRate: 78.5,
          trainingHours: 1250,
          certificationRate: 89.7
        },
        memberList: [
          {
            id: 1, name: '王主任', position: '主任调解员', level: 'SENIOR',
            qualification: '高级调解员', experience: 15,
            specialties: ['金融纠纷', '合同纠纷'], currentLoad: 25, maxCapacity: 30,
            utilization: 83, performance: 92, certifications: ['调解员资格证', 'ISO认证'],
            joinDate: '2019-03-15', lastActive: '2024-07-30 10:30:00', status: 'ACTIVE'
          },
          {
            id: 2, name: '李调解员', position: '资深调解员', level: 'SENIOR',
            qualification: '中级调解员', experience: 8,
            specialties: ['消费纠纷', '民事纠纷'], currentLoad: 20, maxCapacity: 25,
            utilization: 80, performance: 88, certifications: ['调解员资格证'],
            joinDate: '2020-06-20', lastActive: '2024-07-30 09:45:00', status: 'ACTIVE'
          },
          {
            id: 3, name: '张调解员', position: '调解员', level: 'INTERMEDIATE',
            qualification: '初级调解员', experience: 3,
            specialties: ['简单民事纠纷'], currentLoad: 15, maxCapacity: 20,
            utilization: 75, performance: 78, certifications: ['调解员资格证'],
            joinDate: '2022-01-10', lastActive: '2024-07-30 08:20:00', status: 'BUSY'
          },
          {
            id: 4, name: '刘助理', position: '调解助理', level: 'JUNIOR',
            qualification: '调解助理', experience: 1,
            specialties: ['文书整理', '案件协调'], currentLoad: 10, maxCapacity: 15,
            utilization: 67, performance: 72, certifications: [],
            joinDate: '2023-09-01', lastActive: '2024-07-29 17:00:00', status: 'TRAINING'
          }
        ],
        teamStructure: [
          {
            department: '调解部',
            totalMembers: 45,
            seniorMembers: 15,
            juniorMembers: 30,
            utilization: 82.3,
            avgPerformance: 87.5
          },
          {
            department: '法务部',
            totalMembers: 32,
            seniorMembers: 12,
            juniorMembers: 20,
            utilization: 78.9,
            avgPerformance: 85.2
          },
          {
            department: '客服部',
            totalMembers: 28,
            seniorMembers: 8,
            juniorMembers: 20,
            utilization: 75.6,
            avgPerformance: 83.1
          },
          {
            department: '行政部',
            totalMembers: 15,
            seniorMembers: 5,
            juniorMembers: 10,
            utilization: 65.4,
            avgPerformance: 78.9
          }
        ],
        skillDistribution: [
          { skill: '金融纠纷处理', memberCount: 45, level: 'EXPERT', demandLevel: 'HIGH' },
          { skill: '消费纠纷调解', memberCount: 67, level: 'PROFICIENT', demandLevel: 'HIGH' },
          { skill: '合同争议解决', memberCount: 38, level: 'EXPERT', demandLevel: 'MEDIUM' },
          { skill: '法律文书制作', memberCount: 82, level: 'PROFICIENT', demandLevel: 'MEDIUM' },
          { skill: '客户沟通', memberCount: 124, level: 'PROFICIENT', demandLevel: 'HIGH' },
          { skill: '案件管理', memberCount: 156, level: 'BASIC', demandLevel: 'LOW' }
        ],
        workloadTrend: [
          { month: '2024-01', totalCapacity: 2800, usedCapacity: 2240, utilization: 80.0, newMembers: 3 },
          { month: '2024-02', totalCapacity: 2850, usedCapacity: 2223, utilization: 78.0, newMembers: 2 },
          { month: '2024-03', totalCapacity: 2900, usedCapacity: 2320, utilization: 80.0, newMembers: 4 },
          { month: '2024-04', totalCapacity: 2950, usedCapacity: 2301, utilization: 78.0, newMembers: 2 },
          { month: '2024-05', totalCapacity: 3000, usedCapacity: 2400, utilization: 80.0, newMembers: 5 },
          { month: '2024-06', totalCapacity: 3050, usedCapacity: 2379, utilization: 78.0, newMembers: 1 },
          { month: '2024-07', totalCapacity: 3100, usedCapacity: 2435, utilization: 78.5, newMembers: 3 }
        ],
        trainingPrograms: [
          {
            id: 'TR001', name: '金融纠纷调解专业培训', type: 'SKILL',
            duration: 40, participants: 25, status: 'ACTIVE',
            startDate: '2024-07-15', endDate: '2024-08-15'
          },
          {
            id: 'TR002', name: 'ISO9001质量管理体系培训', type: 'CERTIFICATION',
            duration: 24, participants: 156, status: 'PLANNED',
            startDate: '2024-08-01', endDate: '2024-08-31'
          },
          {
            id: 'TR003', name: '法律法规合规培训', type: 'COMPLIANCE',
            duration: 16, participants: 156, status: 'COMPLETED',
            startDate: '2024-06-01', endDate: '2024-06-30'
          }
        ],
        performanceMetrics: [
          { metric: '人员利用率', current: 78.5, target: 80.0, trend: 'UP', status: 'GOOD' },
          { metric: '培训完成率', current: 89.7, target: 90.0, trend: 'UP', status: 'GOOD' },
          { metric: '人员流失率', current: 3.2, target: 5.0, trend: 'DOWN', status: 'EXCELLENT' },
          { metric: '技能匹配度', current: 85.6, target: 85.0, trend: 'STABLE', status: 'EXCELLENT' },
          { metric: '工作满意度', current: 87.3, target: 85.0, trend: 'UP', status: 'EXCELLENT' }
        ]
      };
      
      setResourceData(mockData);
    } catch (error) {
      console.error('加载资源数据失败:', error);
      message.error('加载资源数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    setSelectedMember(null);
    form.resetFields();
    setMemberModalVisible(true);
  };

  const handleEditMember = (member: any) => {
    setSelectedMember(member);
    form.setFieldsValue(member);
    setMemberModalVisible(true);
  };

  const handleDeleteMember = (member: any) => {
    Modal.confirm({
      title: '删除成员',
      content: `确定要删除成员"${member.name}"吗？`,
      onOk: async () => {
        try {
          // API调用
          message.success('成员删除成功');
          loadResourceData();
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  const handleMemberSubmit = async () => {
    try {
      const values = await form.validateFields();
      // API调用
      message.success(selectedMember ? '成员信息更新成功' : '成员添加成功');
      setMemberModalVisible(false);
      form.resetFields();
      loadResourceData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleAddTraining = () => {
    trainingForm.resetFields();
    setTrainingModalVisible(true);
  };

  const handleTrainingSubmit = async () => {
    try {
      const values = await trainingForm.validateFields();
      // API调用
      message.success('培训计划添加成功');
      setTrainingModalVisible(false);
      trainingForm.resetFields();
      loadResourceData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 工作负载趋势图配置
  const workloadTrendConfig = {
    data: resourceData?.workloadTrend || [],
    xField: 'month',
    yField: 'utilization',
    height: 300,
    point: {
      size: 5,
      shape: 'diamond',
    },
    color: '#1890ff',
    smooth: true,
  };

  // 团队结构图配置
  const teamStructureConfig = {
    data: resourceData?.teamStructure || [],
    xField: 'department',
    yField: 'totalMembers',
    height: 300,
    color: '#52c41a',
    label: {
      position: 'middle' as const,
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
  };

  // 技能分布图配置
  const skillDistributionConfig = {
    data: resourceData?.skillDistribution || [],
    xField: 'skill',
    yField: 'memberCount',
    height: 300,
    color: '#faad14',
    label: {
      position: 'middle' as const,
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
  };

  // 利用率仪表盘配置
  const utilizationGaugeConfig = {
    percent: resourceData ? resourceData.summary.utilizationRate / 100 : 0,
    height: 200,
    color: ['#F4664A', '#FAAD14', '#30BF78'],
    innerRadius: 0.75,
    statistic: {
      title: {
        formatter: () => '人员利用率',
        style: ({ percent }: { percent: number }) => ({
          fontSize: '14px',
          color: percent > 0.8 ? '#30BF78' : '#FAAD14',
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

  // 成员列表表格配置
  const memberColumns: ColumnsType<any> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      fixed: 'left',
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
      width: 120,
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: string) => {
        const levelMap: Record<string, { name: string; color: string }> = {
          'SENIOR': { name: '高级', color: 'red' },
          'INTERMEDIATE': { name: '中级', color: 'orange' },
          'JUNIOR': { name: '初级', color: 'blue' },
        };
        const config = levelMap[level] || { name: level, color: 'default' };
        return <Tag color={config.color}>{config.name}</Tag>;
      },
    },
    {
      title: '工作经验',
      dataIndex: 'experience',
      key: 'experience',
      width: 100,
      render: (years: number) => `${years}年`,
    },
    {
      title: '专业领域',
      dataIndex: 'specialties',
      key: 'specialties',
      width: 150,
      render: (specialties: string[]) => (
        <div>
          {specialties.slice(0, 2).map(specialty => (
            <Tag key={specialty}>{specialty}</Tag>
          ))}
          {specialties.length > 2 && <Tag>+{specialties.length - 2}</Tag>}
        </div>
      ),
    },
    {
      title: '工作负载',
      key: 'workload',
      width: 120,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 12, marginBottom: 4 }}>
            {record.currentLoad}/{record.maxCapacity}
          </div>
          <Progress 
            percent={record.utilization} 
           
            strokeColor={record.utilization > 90 ? '#ff4d4f' : record.utilization > 70 ? '#faad14' : '#52c41a'}
            format={(percent) => `${percent}%`}
          />
        </div>
      ),
    },
    {
      title: '业绩评分',
      dataIndex: 'performance',
      key: 'performance',
      width: 100,
      render: (score: number) => (
        <span style={{ 
          fontWeight: 'bold',
          color: score >= 90 ? '#52c41a' : score >= 70 ? '#faad14' : '#ff4d4f'
        }}>
          {score}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { name: string; color: string }> = {
          'ACTIVE': { name: '在岗', color: 'green' },
          'BUSY': { name: '繁忙', color: 'orange' },
          'LEAVE': { name: '请假', color: 'red' },
          'TRAINING': { name: '培训中', color: 'blue' },
        };
        const config = statusMap[status] || { name: status, color: 'default' };
        return <Tag color={config.color}>{config.name}</Tag>;
      },
    },
    {
      title: '最后活跃',
      dataIndex: 'lastActive',
      key: 'lastActive',
      width: 150,
      render: (time: string) => time.split(' ')[0],
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button 
            
            icon={<EditOutlined />} 
            onClick={() => handleEditMember(record)}
          />
          <Button 
            
            icon={<EyeOutlined />} 
            onClick={() => message.info(`查看 ${record.name} 详情`)}
          />
          <Button 
            
            danger
            icon={<UserDeleteOutlined />} 
            onClick={() => handleDeleteMember(record)}
          />
        </Space>
      ),
    },
  ];

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'EXCELLENT': '#52c41a',
      'GOOD': '#73d13d',
      'AVERAGE': '#faad14',
      'POOR': '#ff4d4f'
    };
    return statusMap[status] || '#d9d9d9';
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'EXCELLENT': '优秀',
      'GOOD': '良好',
      'AVERAGE': '一般',
      'POOR': '待改进'
    };
    return statusMap[status] || status;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'UP') return <BarChartOutlined style={{ color: '#52c41a' }} />;
    if (trend === 'DOWN') return <BarChartOutlined style={{ color: '#ff4d4f', transform: 'rotate(180deg)' }} />;
    return <BarChartOutlined style={{ color: '#faad14' }} />;
  };

  return (
    <div className="disposal-org-resource-management">
      <Card title="处置机构人员资源管理" bordered={false}>
        {/* 筛选条件 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={4}>
            <Select
              value={selectedDepartment}
              onChange={setSelectedDepartment}
              style={{ width: '100%' }}
              placeholder="选择部门"
            >
              <Option value="all">全部部门</Option>
              <Option value="调解部">调解部</Option>
              <Option value="法务部">法务部</Option>
              <Option value="客服部">客服部</Option>
              <Option value="行政部">行政部</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              value={selectedLevel}
              onChange={setSelectedLevel}
              style={{ width: '100%' }}
              placeholder="人员级别"
            >
              <Option value="all">全部级别</Option>
              <Option value="SENIOR">高级</Option>
              <Option value="INTERMEDIATE">中级</Option>
              <Option value="JUNIOR">初级</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: '100%' }}
              placeholder="工作状态"
            >
              <Option value="all">全部状态</Option>
              <Option value="ACTIVE">在岗</Option>
              <Option value="BUSY">繁忙</Option>
              <Option value="LEAVE">请假</Option>
              <Option value="TRAINING">培训中</Option>
            </Select>
          </Col>
          <Col span={12}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={loadResourceData} loading={loading}>
                刷新数据
              </Button>
              <Button icon={<UserAddOutlined />} type="primary" onClick={handleAddMember}>
                添加成员
              </Button>
              <Button icon={<CalendarOutlined />} onClick={handleAddTraining}>
                安排培训
              </Button>
              <Button icon={<DownloadOutlined />}>
                导出报告
              </Button>
            </Space>
          </Col>
        </Row>

        <Spin spinning={loading}>
          {/* 概览统计 */}
          {resourceData && (
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={3}>
                <Card>
                  <Statistic
                    title="团队总人数"
                    value={resourceData.summary.totalMembers}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col span={3}>
                <Card>
                  <Statistic
                    title="在岗人数"
                    value={resourceData.summary.activeMnembers}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={3}>
                <Card>
                  <Statistic
                    title="高级成员"
                    value={resourceData.summary.seniorMembers}
                    valueStyle={{ color: '#722ed1' }}
                    prefix={<SafetyCertificateOutlined />}
                  />
                </Card>
              </Col>
              <Col span={3}>
                <Card>
                  <Statistic
                    title="平均经验"
                    value={resourceData.summary.avgExperience}
                    precision={1}
                    suffix="年"
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col span={3}>
                <Card>
                  <Statistic
                    title="利用率"
                    value={resourceData.summary.utilizationRate}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: '#13c2c2' }}
                    prefix={<ThunderboltOutlined />}
                  />
                </Card>
              </Col>
              <Col span={3}>
                <Card>
                  <Statistic
                    title="培训时长"
                    value={resourceData.summary.trainingHours}
                    suffix="小时"
                    valueStyle={{ color: '#eb2f96' }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={3}>
                <Card>
                  <Statistic
                    title="认证率"
                    value={resourceData.summary.certificationRate}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Card>
              </Col>
            </Row>
          )}

          {/* 主要内容区域 */}
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="资源概览" key="overview">
              <Row gutter={16}>
                <Col span={8}>
                  <Card title="人员利用率">
                    <Gauge {...utilizationGaugeConfig} />
                  </Card>
                </Col>
                <Col span={16}>
                  <Card title="工作负载趋势">
                    <Line {...workloadTrendConfig} />
                  </Card>
                </Col>
              </Row>
              
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={12}>
                  <Card title="团队结构">
                    <Column {...teamStructureConfig} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="绩效指标">
                    <Row gutter={16}>
                      {resourceData?.performanceMetrics.map((metric, index) => (
                        <Col span={24} key={index} style={{ marginBottom: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontSize: 12 }}>{metric.metric}</span>
                            <Space>
                              {getTrendIcon(metric.trend)}
                              <Badge 
                                color={getStatusColor(metric.status)} 
                                text={getStatusText(metric.status)}
                              />
                            </Space>
                          </div>
                          <Progress 
                            percent={(metric.current / metric.target) * 100} 
                            strokeColor={getStatusColor(metric.status)}
                            format={() => `${metric.current}${metric.metric.includes('率') ? '%' : ''}`}
                          />
                        </Col>
                      ))}
                    </Row>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="成员管理" key="members">
              <Card title="团队成员列表">
                <Table
                  columns={memberColumns}
                  dataSource={resourceData?.memberList || []}
                  rowKey="id"
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

            <TabPane tab="技能分析" key="skills">
              <Row gutter={16}>
                <Col span={16}>
                  <Card title="技能分布">
                    <Column {...skillDistributionConfig} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card title="技能需求分析">
                    <Table
                      columns={[
                        { title: '技能', dataIndex: 'skill', key: 'skill' },
                        { 
                          title: '人数', 
                          dataIndex: 'memberCount', 
                          key: 'memberCount',
                          render: (count: number) => count.toLocaleString()
                        },
                        { 
                          title: '水平', 
                          dataIndex: 'level', 
                          key: 'level',
                          render: (level: string) => {
                            const levelColors: Record<string, string> = {
                              'EXPERT': '#52c41a',
                              'PROFICIENT': '#faad14',
                              'BASIC': '#d9d9d9'
                            };
                            return (
                              <Tag color={levelColors[level] || 'default'}>
                                {level === 'EXPERT' ? '专家' : level === 'PROFICIENT' ? '熟练' : '基础'}
                              </Tag>
                            );
                          }
                        },
                        { 
                          title: '需求', 
                          dataIndex: 'demandLevel', 
                          key: 'demandLevel',
                          render: (demand: string) => {
                            const demandColors: Record<string, string> = {
                              'HIGH': '#ff4d4f',
                              'MEDIUM': '#faad14',
                              'LOW': '#52c41a'
                            };
                            return (
                              <Tag color={demandColors[demand] || 'default'}>
                                {demand === 'HIGH' ? '高' : demand === 'MEDIUM' ? '中' : '低'}
                              </Tag>
                            );
                          }
                        },
                      ]}
                      dataSource={resourceData?.skillDistribution || []}
                      rowKey="skill"
                     
                      pagination={false}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="培训管理" key="training">
              <Card title="培训计划">
                <Table
                  columns={[
                    { title: '培训名称', dataIndex: 'name', key: 'name' },
                    { 
                      title: '类型', 
                      dataIndex: 'type', 
                      key: 'type',
                      render: (type: string) => {
                        const typeMap: Record<string, { name: string; color: string }> = {
                          'SKILL': { name: '技能培训', color: 'blue' },
                          'CERTIFICATION': { name: '认证培训', color: 'green' },
                          'COMPLIANCE': { name: '合规培训', color: 'orange' },
                        };
                        const config = typeMap[type] || { name: type, color: 'default' };
                        return <Tag color={config.color}>{config.name}</Tag>;
                      }
                    },
                    { 
                      title: '时长', 
                      dataIndex: 'duration', 
                      key: 'duration',
                      render: (hours: number) => `${hours}小时`
                    },
                    { 
                      title: '参与人数', 
                      dataIndex: 'participants', 
                      key: 'participants',
                      render: (count: number) => `${count}人`
                    },
                    { 
                      title: '状态', 
                      dataIndex: 'status', 
                      key: 'status',
                      render: (status: string) => {
                        const statusMap: Record<string, { name: string; color: string }> = {
                          'ACTIVE': { name: '进行中', color: 'green' },
                          'PLANNED': { name: '计划中', color: 'blue' },
                          'COMPLETED': { name: '已完成', color: 'default' },
                        };
                        const config = statusMap[status] || { name: status, color: 'default' };
                        return <Tag color={config.color}>{config.name}</Tag>;
                      }
                    },
                    { title: '开始日期', dataIndex: 'startDate', key: 'startDate' },
                    { title: '结束日期', dataIndex: 'endDate', key: 'endDate' },
                  ]}
                  dataSource={resourceData?.trainingPrograms || []}
                  rowKey="id"
                 
                  pagination={false}
                />
              </Card>
            </TabPane>
          </Tabs>
        </Spin>
      </Card>

      {/* 成员管理弹窗 */}
      <Modal
        title={selectedMember ? '编辑成员' : '添加成员'}
        open={memberModalVisible}
        onOk={handleMemberSubmit}
        onCancel={() => {
          setMemberModalVisible(false);
          form.resetFields();
        }}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="姓名"
                name="name"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="职位"
                name="position"
                rules={[{ required: true, message: '请输入职位' }]}
              >
                <Input placeholder="请输入职位" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="级别"
                name="level"
                rules={[{ required: true, message: '请选择级别' }]}
              >
                <Select placeholder="请选择级别">
                  <Option value="SENIOR">高级</Option>
                  <Option value="INTERMEDIATE">中级</Option>
                  <Option value="JUNIOR">初级</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="工作经验(年)"
                name="experience"
                rules={[{ required: true, message: '请输入工作经验' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="最大处理能力"
                name="maxCapacity"
                rules={[{ required: true, message: '请输入最大处理能力' }]}
              >
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="专业领域"
                name="specialties"
              >
                <Select mode="multiple" placeholder="请选择专业领域">
                  <Option value="金融纠纷">金融纠纷</Option>
                  <Option value="消费纠纷">消费纠纷</Option>
                  <Option value="合同纠纷">合同纠纷</Option>
                  <Option value="民事纠纷">民事纠纷</Option>
                  <Option value="商事纠纷">商事纠纷</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 培训管理弹窗 */}
      <Modal
        title="添加培训计划"
        open={trainingModalVisible}
        onOk={handleTrainingSubmit}
        onCancel={() => {
          setTrainingModalVisible(false);
          trainingForm.resetFields();
        }}
        width={600}
      >
        <Form form={trainingForm} layout="vertical">
          <Form.Item
            label="培训名称"
            name="name"
            rules={[{ required: true, message: '请输入培训名称' }]}
          >
            <Input placeholder="请输入培训名称" />
          </Form.Item>
          <Form.Item
            label="培训类型"
            name="type"
            rules={[{ required: true, message: '请选择培训类型' }]}
          >
            <Select placeholder="请选择培训类型">
              <Option value="SKILL">技能培训</Option>
              <Option value="CERTIFICATION">认证培训</Option>
              <Option value="COMPLIANCE">合规培训</Option>
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="培训时长(小时)"
                name="duration"
                rules={[{ required: true, message: '请输入培训时长' }]}
              >
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="参与人数"
                name="participants"
                rules={[{ required: true, message: '请输入参与人数' }]}
              >
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="培训描述"
            name="description"
          >
            <TextArea rows={3} placeholder="请输入培训描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DisposalOrgResourceManagement;