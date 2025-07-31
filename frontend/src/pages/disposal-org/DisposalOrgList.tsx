import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Space, Tag, Input, Select, Row, Col, 
  Statistic, message, Modal, Tooltip, Badge, Avatar, Progress 
} from 'antd';
import {
  PlusOutlined, SearchOutlined, ReloadOutlined, ExportOutlined,
  EyeOutlined, EditOutlined, SettingOutlined, PhoneOutlined,
  MailOutlined, TeamOutlined, TrophyOutlined, CheckCircleOutlined,
  WarningOutlined, ThunderboltOutlined, BankOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { useDebouncedCallback } from 'use-debounce';

const { Search } = Input;
const { Option } = Select;

// 处置机构列表项接口
interface DisposalOrgListItem {
  id: number;
  orgCode: string;
  orgName: string;
  type: 'MEDIATION_CENTER' | 'LAW_FIRM' | 'COLLECTION_AGENCY' | 'ARBITRATION_CENTER';
  typeName: string;
  
  // 处置能力信息
  teamSize: number;
  monthlyCapacity: number;
  currentLoad: number;
  utilization: number;
  performanceScore: number;
  
  // 资质信息
  qualifications: string[];
  certifications: string[];
  businessLicense: string;
  
  // 服务信息
  serviceRegions: string[];
  disposalTypes: string[];
  specialties: string[];
  
  // 合作状态
  cooperationStatus: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'PROBATION';
  membershipLevel: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
  joinDate: string;
  lastActiveDate: string;
  
  // 联系信息
  contactPerson: string;
  contactPhone: string;
  email: string;
  address: string;
  
  // 业务指标
  totalHandled: number;
  successRate: number;
  avgHandlingTime: number;
  customerSatisfaction: number;
  monthlyGrowthRate: number;
  
  // 财务信息
  totalEarnings: string;
  outstandingAmount: string;
  creditRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B';
}

// 统计数据接口
interface DisposalOrgStats {
  totalOrgs: number;
  activeOrgs: number;
  totalCapacity: number;
  currentUtilization: number;
  avgPerformanceScore: number;
  totalHandled: number;
}

const DisposalOrgList: React.FC = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<DisposalOrgListItem[]>([]);
  const [stats, setStats] = useState<DisposalOrgStats>({
    totalOrgs: 0, activeOrgs: 0, totalCapacity: 0, 
    currentUtilization: 0, avgPerformanceScore: 0, totalHandled: 0
  });
  
  const [filters, setFilters] = useState({
    keyword: '',
    type: undefined as string | undefined,
    cooperationStatus: undefined as string | undefined,
    membershipLevel: undefined as string | undefined,
    serviceRegion: undefined as string | undefined,
  });
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // 机构类型配置
  const orgTypeConfig = {
    MEDIATION_CENTER: { name: '调解中心', color: '#1890ff', icon: <TeamOutlined /> },
    LAW_FIRM: { name: '律师事务所', color: '#52c41a', icon: <BankOutlined /> },
    COLLECTION_AGENCY: { name: '催收机构', color: '#faad14', icon: <ThunderboltOutlined /> },
    ARBITRATION_CENTER: { name: '仲裁中心', color: '#722ed1', icon: <TrophyOutlined /> },
  };

  // 防抖搜索
  const debouncedSearch = useDebouncedCallback((keyword: string) => {
    setFilters(prev => ({ ...prev, keyword }));
    setPagination(prev => ({ ...prev, current: 1 }));
  }, 500);

  useEffect(() => {
    loadData();
  }, [filters, pagination.current, pagination.pageSize]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockData: DisposalOrgListItem[] = [
        {
          id: 1, orgCode: 'MC001', orgName: '北京朝阳调解中心', type: 'MEDIATION_CENTER', typeName: '调解中心',
          teamSize: 25, monthlyCapacity: 500, currentLoad: 480, utilization: 96, performanceScore: 92,
          qualifications: ['调解员资格', '法律职业资格'], certifications: ['ISO9001', '优秀调解组织'],
          businessLicense: '91110000MA001234X', serviceRegions: ['北京', '天津', '河北'],
          disposalTypes: ['民事调解', '商事调解', '金融纠纷调解'], specialties: ['金融纠纷', '消费纠纷'],
          cooperationStatus: 'ACTIVE', membershipLevel: 'PLATINUM', joinDate: '2019-03-15', lastActiveDate: '2024-07-30',
          contactPerson: '王主任', contactPhone: '13800138001', email: 'wang@bjcymc.com',
          address: '北京市朝阳区建国路88号', totalHandled: 2856, successRate: 89.5,
          avgHandlingTime: 15, customerSatisfaction: 92.3, monthlyGrowthRate: 12.5,
          totalEarnings: '156万', outstandingAmount: '12万', creditRating: 'AAA'
        },
        {
          id: 2, orgCode: 'LF002', orgName: '上海浦东法律服务所', type: 'LAW_FIRM', typeName: '律师事务所',
          teamSize: 32, monthlyCapacity: 600, currentLoad: 420, utilization: 70, performanceScore: 88,
          qualifications: ['律师执业证', '法律顾问资格'], certifications: ['优秀律师事务所', '诚信服务单位'],
          businessLicense: '91310000MA005678Y', serviceRegions: ['上海', '江苏', '浙江'],
          disposalTypes: ['法律咨询', '诉讼代理', '债务追收'], specialties: ['金融法律', '企业法务'],
          cooperationStatus: 'ACTIVE', membershipLevel: 'GOLD', joinDate: '2020-06-20', lastActiveDate: '2024-07-29',
          contactPerson: '李律师', contactPhone: '13800138002', email: 'li@shlawfirm.com',
          address: '上海市浦东新区世纪大道200号', totalHandled: 2134, successRate: 85.2,
          avgHandlingTime: 22, customerSatisfaction: 88.7, monthlyGrowthRate: 8.3,
          totalEarnings: '198万', outstandingAmount: '25万', creditRating: 'AA'
        },
        {
          id: 3, orgCode: 'CA003', orgName: '深圳南山催收服务公司', type: 'COLLECTION_AGENCY', typeName: '催收机构',
          teamSize: 18, monthlyCapacity: 350, currentLoad: 140, utilization: 40, performanceScore: 65,
          qualifications: ['催收从业资格', '金融服务许可'], certifications: ['合规催收认证'],
          businessLicense: '91440300MA009999Z', serviceRegions: ['广东', '福建', '海南'],
          disposalTypes: ['电话催收', '上门催收', '法律催收'], specialties: ['信用卡催收', '小贷催收'],
          cooperationStatus: 'PROBATION', membershipLevel: 'BRONZE', joinDate: '2021-09-10', lastActiveDate: '2024-07-25',
          contactPerson: '张经理', contactPhone: '13800138003', email: 'zhang@szcollect.com',
          address: '深圳市南山区科技园南区', totalHandled: 987, successRate: 72.1,
          avgHandlingTime: 45, customerSatisfaction: 75.6, monthlyGrowthRate: -5.2,
          totalEarnings: '89万', outstandingAmount: '45万', creditRating: 'BBB'
        },
        {
          id: 4, orgCode: 'AC004', orgName: '广州天河仲裁委员会', type: 'ARBITRATION_CENTER', typeName: '仲裁中心',
          teamSize: 15, monthlyCapacity: 200, currentLoad: 160, utilization: 80, performanceScore: 91,
          qualifications: ['仲裁员资格', '法律职业资格'], certifications: ['优秀仲裁机构', '国际仲裁认证'],
          businessLicense: '91440100MA012345A', serviceRegions: ['广东', '广西', '湖南'],
          disposalTypes: ['商事仲裁', '金融仲裁', '国际仲裁'], specialties: ['金融争议', '商事纠纷'],
          cooperationStatus: 'ACTIVE', membershipLevel: 'PLATINUM', joinDate: '2018-12-05', lastActiveDate: '2024-07-30',
          contactPerson: '陈主任', contactPhone: '13800138004', email: 'chen@gzarbitration.com',
          address: '广州市天河区珠江新城花城大道', totalHandled: 1567, successRate: 94.3,
          avgHandlingTime: 30, customerSatisfaction: 95.1, monthlyGrowthRate: 15.8,
          totalEarnings: '234万', outstandingAmount: '8万', creditRating: 'AAA'
        }
      ];

      const mockStats: DisposalOrgStats = {
        totalOrgs: 256,
        activeOrgs: 231,
        totalCapacity: 52800,
        currentUtilization: 78.5,
        avgPerformanceScore: 85.6,
        totalHandled: 186543
      };

      setDataSource(mockData);
      setStats(mockStats);
      setPagination(prev => ({ ...prev, total: mockData.length }));
      
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record: DisposalOrgListItem) => {
    navigate(`/disposal-orgs/${record.id}`);
  };

  const handleEdit = (record: DisposalOrgListItem) => {
    navigate(`/disposal-orgs/${record.id}/edit`);
  };

  const handleContact = (record: DisposalOrgListItem, type: 'phone' | 'email') => {
    if (type === 'phone') {
      window.open(`tel:${record.contactPhone}`);
    } else {
      window.open(`mailto:${record.email}`);
    }
  };

  const handleSuspendCooperation = (record: DisposalOrgListItem) => {
    Modal.confirm({
      title: '暂停合作',
      content: `确定要暂停与"${record.orgName}"的合作吗？`,
      onOk: async () => {
        try {
          // API调用
          message.success('合作已暂停');
          loadData();
        } catch (error) {
          message.error('操作失败');
        }
      }
    });
  };

  const getCooperationStatusColor = (status: string) => {
    const statusMap = {
      'ACTIVE': 'green',
      'SUSPENDED': 'orange', 
      'TERMINATED': 'red',
      'PROBATION': 'yellow'
    };
    return statusMap[status as keyof typeof statusMap] || 'default';
  };

  const getCooperationStatusText = (status: string) => {
    const statusMap = {
      'ACTIVE': '正常合作',
      'SUSPENDED': '暂停合作',
      'TERMINATED': '终止合作',
      'PROBATION': '试用期'
    };
    return statusMap[status as keyof typeof statusMap] || status;
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

  // 表格列配置
  const columns: ColumnsType<DisposalOrgListItem> = [
    {
      title: '机构信息',
      key: 'orgInfo',
      width: 280,
      fixed: 'left',
      render: (_, record) => {
        const typeConfig = orgTypeConfig[record.type];
        
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              size={48} 
              style={{ backgroundColor: typeConfig.color, marginRight: 12 }}
              icon={typeConfig.icon}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 4 }}>
                {record.orgName}
                <Tag 
                  color={getMembershipLevelColor(record.membershipLevel)} 
                  
                  style={{ marginLeft: 8 }}
                >
                  {record.membershipLevel}
                </Tag>
              </div>
              <div style={{ color: '#666', fontSize: 12, marginBottom: 2 }}>
                {record.orgCode}
              </div>
              <Tag color={typeConfig.color}>
                {typeConfig.name}
              </Tag>
            </div>
          </div>
        );
      },
    },
    {
      title: '处置能力',
      key: 'capacity',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#666' }}>团队规模</span>
            <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
              {record.teamSize}人
            </div>
          </div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#666' }}>月处理能力</span>
            <div style={{ fontWeight: 'bold', color: '#52c41a' }}>
              {record.monthlyCapacity}件
            </div>
          </div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#666' }}>当前负载</span>
            <div style={{ fontWeight: 'bold', color: '#faad14' }}>
              {record.currentLoad}件
            </div>
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#666' }}>利用率</span>
            <Progress 
              percent={record.utilization} 
             
              strokeColor={record.utilization > 95 ? '#ff4d4f' : record.utilization > 80 ? '#faad14' : '#52c41a'}
              format={(percent) => `${percent}%`}
            />
          </div>
        </div>
      ),
    },
    {
      title: '业绩指标',
      key: 'performance',
      width: 160,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#666' }}>业绩评分</span>
            <div style={{ 
              fontWeight: 'bold',
              color: record.performanceScore >= 90 ? '#52c41a' : record.performanceScore >= 70 ? '#faad14' : '#ff4d4f'
            }}>
              {record.performanceScore}
            </div>
          </div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#666' }}>成功率</span>
            <div style={{ fontWeight: 'bold' }}>{record.successRate}%</div>
          </div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#666' }}>处理案件</span>
            <div style={{ fontWeight: 'bold' }}>{record.totalHandled.toLocaleString()}</div>
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#666' }}>满意度</span>
            <div style={{ fontWeight: 'bold', color: '#722ed1' }}>
              {record.customerSatisfaction}%
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '合作状态',
      key: 'cooperation',
      width: 140,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 8 }}>
            <Tag color={getCooperationStatusColor(record.cooperationStatus)}>
              {getCooperationStatusText(record.cooperationStatus)}
            </Tag>
          </div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#666' }}>信用等级</span>
            <div>
              <Tag color={getCreditRatingColor(record.creditRating)}>
                {record.creditRating}
              </Tag>
            </div>
          </div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#666' }}>累计收入</span>
            <div style={{ fontWeight: 'bold' }}>{record.totalEarnings}</div>
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#666' }}>待结金额</span>
            <div style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
              {record.outstandingAmount}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '服务信息',
      key: 'service',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#666' }}>服务区域</span>
            <div>
              {record.serviceRegions.slice(0, 2).map(region => (
                <Tag key={region} color="blue">{region}</Tag>
              ))}
              {record.serviceRegions.length > 2 && (
                <Tooltip title={record.serviceRegions.slice(2).join(', ')}>
                  <Tag>+{record.serviceRegions.length - 2}</Tag>
                </Tooltip>
              )}
            </div>
          </div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#666' }}>处置类型</span>
            <div>
              {record.disposalTypes.slice(0, 2).map(type => (
                <Tag key={type} color="green">{type}</Tag>
              ))}
              {record.disposalTypes.length > 2 && (
                <Tooltip title={record.disposalTypes.slice(2).join(', ')}>
                  <Tag>+{record.disposalTypes.length - 2}</Tag>
                </Tooltip>
              )}
            </div>
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#666' }}>专业领域</span>
            <div>
              {record.specialties.map(specialty => (
                <Tag key={specialty} color="purple">{specialty}</Tag>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '联系信息',
      key: 'contact',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4, fontSize: 13 }}>
            <strong>联系人：</strong>{record.contactPerson}
          </div>
          <div style={{ marginBottom: 4, fontSize: 13 }}>
            <PhoneOutlined style={{ marginRight: 4, color: '#1890ff' }} />
            <Button 
              type="link" 
              
              style={{ padding: 0, fontSize: 12 }}
              onClick={() => handleContact(record, 'phone')}
            >
              {record.contactPhone}
            </Button>
          </div>
          <div style={{ marginBottom: 4, fontSize: 13 }}>
            <MailOutlined style={{ marginRight: 4, color: '#52c41a' }} />
            <Button 
              type="link" 
              
              style={{ padding: 0, fontSize: 12 }}
              onClick={() => handleContact(record, 'email')}
            >
              {record.email}
            </Button>
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            最后活跃：{record.lastActiveDate}
          </div>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space direction="vertical">
          <Space>
            <Tooltip title="查看详情">
              <Button 
                type="link" 
                icon={<EyeOutlined />} 
               
                onClick={() => handleView(record)}
              />
            </Tooltip>
            <Tooltip title="编辑">
              <Button 
                type="link" 
                icon={<EditOutlined />} 
               
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
            <Tooltip title="管理">
              <Button 
                type="link" 
                icon={<SettingOutlined />} 
               
                onClick={() => navigate(`/disposal-orgs/${record.id}/manage`)}
              />
            </Tooltip>
          </Space>
          {record.cooperationStatus === 'ACTIVE' && (
            <Button 
              type="link" 
              danger 
             
              onClick={() => handleSuspendCooperation(record)}
            >
              暂停合作
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="disposal-org-list">
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="机构总数"
              value={stats.totalOrgs}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="活跃机构"
              value={stats.activeOrgs}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="总处理能力"
              value={stats.totalCapacity}
              suffix="件/月"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="平均利用率"
              value={stats.currentUtilization}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="平均评分"
              value={stats.avgPerformanceScore}
              precision={1}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="处理案件总数"
              value={stats.totalHandled}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容 */}
      <Card title="处置机构列表" bordered={false}>
        {/* 搜索和筛选 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Search
              placeholder="搜索机构名称、代码或联系人"
              allowClear
              onSearch={(value) => debouncedSearch(value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={3}>
            <Select
              placeholder="机构类型"
              allowClear
              style={{ width: '100%' }}
              value={filters.type}
              onChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            >
              {Object.entries(orgTypeConfig).map(([key, config]) => (
                <Option key={key} value={key}>
                  {config.icon} {config.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={3}>
            <Select
              placeholder="合作状态"
              allowClear
              style={{ width: '100%' }}
              value={filters.cooperationStatus}
              onChange={(value) => setFilters(prev => ({ ...prev, cooperationStatus: value }))}
            >
              <Option value="ACTIVE">正常合作</Option>
              <Option value="SUSPENDED">暂停合作</Option>
              <Option value="PROBATION">试用期</Option>
              <Option value="TERMINATED">终止合作</Option>
            </Select>
          </Col>
          <Col span={3}>
            <Select
              placeholder="会员等级"
              allowClear
              style={{ width: '100%' }}
              value={filters.membershipLevel}
              onChange={(value) => setFilters(prev => ({ ...prev, membershipLevel: value }))}
            >
              <Option value="PLATINUM">铂金</Option>
              <Option value="GOLD">黄金</Option>
              <Option value="SILVER">白银</Option>
              <Option value="BRONZE">青铜</Option>
            </Select>
          </Col>
          <Col span={3}>
            <Select
              placeholder="服务区域"
              allowClear
              style={{ width: '100%' }}
              value={filters.serviceRegion}
              onChange={(value) => setFilters(prev => ({ ...prev, serviceRegion: value }))}
            >
              <Option value="北京">北京</Option>
              <Option value="上海">上海</Option>
              <Option value="广东">广东</Option>
              <Option value="江苏">江苏</Option>
              <Option value="浙江">浙江</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/disposal-orgs/create')}
              >
                新增机构
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadData}
                loading={loading}
              >
                刷新
              </Button>
              <Button 
                icon={<ExportOutlined />}
                onClick={() => message.info('导出功能开发中...')}
              >
                导出
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, current: page, pageSize }));
            }
          }}
        />
      </Card>
    </div>
  );
};

export default DisposalOrgList;