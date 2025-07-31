import React, { useState, useEffect } from 'react';
import { 
  Card, Descriptions, Tag, Button, Space, Tabs, Table, Progress, 
  Row, Col, Statistic, Timeline, Avatar, Divider, Empty, Spin, message 
} from 'antd';
import { 
  ArrowLeftOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ReloadOutlined, UserOutlined, PhoneOutlined,
  MailOutlined, EnvironmentOutlined, BankOutlined, TeamOutlined,
  FileTextOutlined, CalendarOutlined, DollarOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import organizationService, { Organization } from '@/services/organizationService';

const { TabPane } = Tabs;

interface CasePackage {
  id: number;
  packageCode: string;
  packageName: string;
  caseCount: number;
  totalAmount: number;
  status: string;
  statusName: string;
  createdAt: string;
  assignedAt?: string;
}

interface UserRecord {
  id: number;
  username: string;
  realName: string;
  email: string;
  roles: string[];
  status: string;
  lastLoginAt: string;
  createdAt: string;
}

interface ActivityRecord {
  id: number;
  action: string;
  description: string;
  operator: string;
  createdAt: string;
  status: 'success' | 'error' | 'processing';
}

const OrganizationDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [casePackages, setCasePackages] = useState<CasePackage[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);

  useEffect(() => {
    if (id) {
      loadOrganizationDetail();
    }
  }, [id]);

  const loadOrganizationDetail = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const data = await organizationService.getOrganizationDetail(Number(id));
      setOrganization(data);
      
      // 根据选中的tab加载相应数据
      if (activeTab === 'cases') {
        loadCasePackages();
      } else if (activeTab === 'users') {
        loadUsers();
      } else if (activeTab === 'activities') {
        loadActivities();
      }
    } catch (error) {
      console.error('加载机构详情失败:', error);
      message.error('加载机构详情失败');
    } finally {
      setLoading(false);
    }
  };

  const loadCasePackages = async () => {
    // Mock data for case packages
    setCasePackages([
      {
        id: 1,
        packageCode: 'PKG001',
        packageName: '个人信用卡逾期案件包',
        caseCount: 150,
        totalAmount: 2500000,
        status: 'PROCESSING',
        statusName: '处理中',
        createdAt: '2024-07-01 10:00:00',
        assignedAt: '2024-07-02 14:30:00',
      },
      {
        id: 2,
        packageCode: 'PKG002',
        packageName: '小额贷款逾期案件包',
        caseCount: 89,
        totalAmount: 1200000,
        status: 'COMPLETED',
        statusName: '已完成',
        createdAt: '2024-06-15 09:00:00',
        assignedAt: '2024-06-16 11:20:00',
      },
    ]);
  };

  const loadUsers = async () => {
    // Mock data for users
    setUsers([
      {
        id: 1,
        username: 'zhang.manager',
        realName: '张经理',
        email: 'zhang@icbc.com.cn',
        roles: ['ORG_ADMIN'],
        status: 'ACTIVE',
        lastLoginAt: '2024-07-19 14:20:00',
        createdAt: '2024-01-15 10:30:00',
      },
      {
        id: 2,
        username: 'li.user',
        realName: '李用户',
        email: 'li@icbc.com.cn',
        roles: ['ORG_USER'],
        status: 'ACTIVE',
        lastLoginAt: '2024-07-18 16:45:00',
        createdAt: '2024-02-20 09:15:00',
      },
    ]);
  };

  const loadActivities = async () => {
    // Mock data for activities
    setActivities([
      {
        id: 1,
        action: 'STATUS_CHANGE',
        description: '机构状态由"待审核"变更为"正常"',
        operator: '系统管理员',
        createdAt: '2024-01-20 16:45:00',
        status: 'success',
      },
      {
        id: 2,
        action: 'INFO_UPDATE',
        description: '更新了机构基础信息',
        operator: '张经理',
        createdAt: '2024-01-19 11:20:00',
        status: 'success',
      },
      {
        id: 3,
        action: 'USER_CREATE',
        description: '新增用户"李用户"',
        operator: '张经理',
        createdAt: '2024-02-20 09:15:00',
        status: 'success',
      },
    ]);
  };

  const handleBack = () => {
    navigate('/organizations');
  };

  const handleEdit = () => {
    navigate(`/organizations/${id}/edit`);
  };

  const handleDelete = () => {
    // 实现删除逻辑
    console.log('Delete organization');
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    
    // 切换tab时加载相应数据
    if (key === 'cases' && casePackages.length === 0) {
      loadCasePackages();
    } else if (key === 'users' && users.length === 0) {
      loadUsers();
    } else if (key === 'activities' && activities.length === 0) {
      loadActivities();
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Empty description="机构信息不存在" />
        <Button type="primary" onClick={handleBack}>返回列表</Button>
      </div>
    );
  }

  // 获取机构类型信息
  const getTypeInfo = (type: string) => {
    const typeMap: Record<string, { name: string; color: string; icon: React.ReactNode }> = {
      'BANK': { name: '银行', color: '#1890ff', icon: <BankOutlined /> },
      'CONSUMER_FINANCE': { name: '消费金融公司', color: '#52c41a', icon: <BankOutlined /> },
      'LAW_FIRM': { name: '律师事务所', color: '#eb2f96', icon: <TeamOutlined /> },
      'MEDIATION_CENTER': { name: '调解中心', color: '#13c2c2', icon: <TeamOutlined /> },
    };
    return typeMap[type] || { name: type, color: '#8c8c8c', icon: <BankOutlined /> };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'green';
      case 'PENDING': return 'orange';
      case 'SUSPENDED': return 'red';
      case 'REJECTED': return 'red';
      default: return 'default';
    }
  };

  const typeInfo = getTypeInfo(organization.type);

  // 案件包表格列配置
  const casePackageColumns: ColumnsType<CasePackage> = [
    {
      title: '案件包编号',
      dataIndex: 'packageCode',
      key: 'packageCode',
      width: 120,
    },
    {
      title: '案件包名称',
      dataIndex: 'packageName',
      key: 'packageName',
      width: 200,
    },
    {
      title: '案件数量',
      dataIndex: 'caseCount',
      key: 'caseCount',
      width: 100,
      render: (count) => `${count} 件`,
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount) => `¥${(amount / 10000).toFixed(2)}万`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Tag color={record.status === 'COMPLETED' ? 'green' : 'blue'}>
          {record.statusName}
        </Tag>
      ),
    },
    {
      title: '分配时间',
      dataIndex: 'assignedAt',
      key: 'assignedAt',
      width: 150,
    },
  ];

  // 用户表格列配置
  const userColumns: ColumnsType<UserRecord> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '真实姓名',
      dataIndex: 'realName',
      key: 'realName',
      width: 100,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      width: 120,
      render: (roles: string[]) => (
        <Space>
          {roles.map(role => (
            <Tag key={role} color="blue">
              {role === 'ORG_ADMIN' ? '机构管理员' : '机构用户'}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
          {status === 'ACTIVE' ? '正常' : '停用'}
        </Tag>
      ),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 150,
    },
  ];

  return (
    <div>
      {/* 页面头部 */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="large">
              <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
                返回
              </Button>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  size={48} 
                  style={{ backgroundColor: typeInfo.color, marginRight: 16 }}
                  icon={typeInfo.icon}
                />
                <div>
                  <h2 style={{ margin: 0, marginBottom: 4 }}>{organization.orgName}</h2>
                  <Space>
                    <Tag color={typeInfo.color}>{typeInfo.name}</Tag>
                    <Tag color={getStatusColor(organization.status)}>
                      {organization.statusName}
                    </Tag>
                    <span style={{ color: '#666' }}>{organization.orgCode}</span>
                  </Space>
                </div>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={loadOrganizationDetail}>
                刷新
              </Button>
              <Button icon={<EditOutlined />} onClick={handleEdit}>
                编辑
              </Button>
              <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                删除
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="团队规模"
              value={organization.teamSize}
              suffix="人"
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="月处理能力"
              value={organization.monthlyCaseCapacity}
              suffix="件"
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="当前负载"
              value={organization.currentLoadPercentage}
              suffix="%"
              valueStyle={{ 
                color: organization.currentLoadPercentage > 80 ? '#f5222d' : '#52c41a' 
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="服务区域"
              value={organization.serviceRegions.length}
              suffix="个"
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 详细信息标签页 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          {/* 基本信息 */}
          <TabPane tab="基本信息" key="basic">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="机构代码">{organization.orgCode}</Descriptions.Item>
              <Descriptions.Item label="机构名称">{organization.orgName}</Descriptions.Item>
              <Descriptions.Item label="机构类型">{typeInfo.name}</Descriptions.Item>
              <Descriptions.Item label="机构状态">
                <Tag color={getStatusColor(organization.status)}>
                  {organization.statusName}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="联系人">{organization.contactPerson}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{organization.contactPhone}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{organization.email}</Descriptions.Item>
              <Descriptions.Item label="地址" span={2}>{organization.address}</Descriptions.Item>
              <Descriptions.Item label="营业执照" span={2}>{(organization as any).businessLicense || '-'}</Descriptions.Item>
              <Descriptions.Item label="团队规模">{organization.teamSize} 人</Descriptions.Item>
              <Descriptions.Item label="月处理能力">{organization.monthlyCaseCapacity} 件</Descriptions.Item>
              <Descriptions.Item label="当前负载">
                <Progress 
                  percent={organization.currentLoadPercentage} 
                 
                  status={organization.currentLoadPercentage > 80 ? 'exception' : 'active'}
                />
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">{organization.createdAt}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <h4>服务区域</h4>
                <Space wrap>
                  {organization.serviceRegions.map(region => (
                    <Tag key={region} color="blue">{region}</Tag>
                  ))}
                </Space>
              </Col>
              <Col span={12}>
                <h4>业务范围</h4>
                <Space wrap>
                  {organization.businessScopes.map(scope => (
                    <Tag key={scope} color="green">{scope}</Tag>
                  ))}
                </Space>
              </Col>
            </Row>

            {organization.description && (
              <>
                <Divider />
                <h4>机构描述</h4>
                <p>{organization.description}</p>
              </>
            )}
          </TabPane>

          {/* 案件包信息 */}
          <TabPane tab="案件包" key="cases">
            <Table
              columns={casePackageColumns}
              dataSource={casePackages}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          {/* 用户信息 */}
          <TabPane tab="用户管理" key="users">
            <Table
              columns={userColumns}
              dataSource={users}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          {/* 操作记录 */}
          <TabPane tab="操作记录" key="activities">
            <Timeline>
              {activities.map(activity => (
                <Timeline.Item
                  key={activity.id}
                  dot={
                    activity.status === 'success' ? (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : activity.status === 'error' ? (
                      <CloseCircleOutlined style={{ color: '#f5222d' }} />
                    ) : (
                      <CalendarOutlined style={{ color: '#1890ff' }} />
                    )
                  }
                >
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{activity.description}</div>
                    <div style={{ color: '#666', fontSize: 12 }}>
                      操作人：{activity.operator} | 时间：{activity.createdAt}
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default OrganizationDetailPage;