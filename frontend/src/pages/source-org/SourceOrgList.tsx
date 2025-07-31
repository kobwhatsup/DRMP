import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Space, Tag, Input, Select, Row, Col, 
  Statistic, message, Modal, Tooltip, Badge, Avatar, Progress 
} from 'antd';
import {
  PlusOutlined, SearchOutlined, ReloadOutlined, ExportOutlined,
  EyeOutlined, EditOutlined, SettingOutlined, PhoneOutlined,
  MailOutlined, BankOutlined, TeamOutlined, RiseOutlined,
  WarningOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { useDebouncedCallback } from 'use-debounce';

const { Search } = Input;
const { Option } = Select;

// 案源机构列表项接口
interface SourceOrgListItem {
  id: number;
  orgCode: string;
  orgName: string;
  type: 'BANK' | 'CONSUMER_FINANCE' | 'ONLINE_LOAN' | 'MICRO_LOAN' | 'ASSIST_LOAN' | 'AMC' | 'OTHER';
  typeName: string;
  
  // 案件相关信息
  totalCasePackages: number;
  totalCases: number;
  monthlyActiveCases: number;
  avgCaseAmount: number;
  
  // 合作状态
  cooperationStatus: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';
  activeContracts: number;
  cooperationScore: number;
  
  // 联系信息
  contactPerson: string;
  contactPhone: string;
  businessManager: string;
  email: string;
  
  // 时间信息
  lastActiveAt: string;
  contractExpireAt: string;
  createdAt: string;
  
  // 业务指标
  monthlyGrowthRate: number;
  caseQualityScore: number;
  apiConnectivity: 'ONLINE' | 'OFFLINE' | 'ERROR';
}

// 统计数据接口
interface SourceOrgStats {
  totalOrgs: number;
  activeOrgs: number;
  totalCasePackages: number;
  totalCases: number;
  totalAmount: string;
  avgCooperationScore: number;
}

const SourceOrgList: React.FC = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<SourceOrgListItem[]>([]);
  const [stats, setStats] = useState<SourceOrgStats>({
    totalOrgs: 0, activeOrgs: 0, totalCasePackages: 0, 
    totalCases: 0, totalAmount: '0', avgCooperationScore: 0
  });
  
  const [filters, setFilters] = useState({
    keyword: '',
    type: undefined as string | undefined,
    cooperationStatus: undefined as string | undefined,
    businessManager: undefined as string | undefined,
  });
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // 机构类型配置
  const orgTypeConfig = {
    BANK: { name: '银行', color: '#1890ff', icon: <BankOutlined /> },
    CONSUMER_FINANCE: { name: '消费金融公司', color: '#52c41a', icon: <BankOutlined /> },
    ONLINE_LOAN: { name: '网络贷款公司', color: '#faad14', icon: <BankOutlined /> },
    MICRO_LOAN: { name: '小额贷款公司', color: '#f5222d', icon: <BankOutlined /> },
    ASSIST_LOAN: { name: '助贷公司', color: '#13c2c2', icon: <BankOutlined /> },
    AMC: { name: '资产管理公司', color: '#722ed1', icon: <BankOutlined /> },
    OTHER: { name: '其他', color: '#8c8c8c', icon: <BankOutlined /> },
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
      const mockData: SourceOrgListItem[] = [
        {
          id: 1, orgCode: 'ICBC001', orgName: '中国工商银行', type: 'BANK', typeName: '银行',
          totalCasePackages: 156, totalCases: 28900, monthlyActiveCases: 3200, avgCaseAmount: 14535,
          cooperationStatus: 'ACTIVE', activeContracts: 3, cooperationScore: 92.5,
          contactPerson: '张经理', contactPhone: '13800138001', businessManager: '李明',
          email: 'zhang@icbc.com', lastActiveAt: '2024-07-30 10:30:00', 
          contractExpireAt: '2025-12-31', createdAt: '2020-01-15',
          monthlyGrowthRate: 15.6, caseQualityScore: 88.5, apiConnectivity: 'ONLINE'
        },
        {
          id: 2, orgCode: 'CMB002', orgName: '招商银行', type: 'BANK', typeName: '银行',
          totalCasePackages: 142, totalCases: 24300, monthlyActiveCases: 2800, avgCaseAmount: 15637,
          cooperationStatus: 'ACTIVE', activeContracts: 2, cooperationScore: 89.2,
          contactPerson: '王主任', contactPhone: '13800138002', businessManager: '刘华',
          email: 'wang@cmb.com', lastActiveAt: '2024-07-30 09:45:00',
          contractExpireAt: '2025-06-30', createdAt: '2020-03-20',
          monthlyGrowthRate: 12.3, caseQualityScore: 91.2, apiConnectivity: 'ONLINE'
        },
        {
          id: 3, orgCode: 'PUHUI003', orgName: '平安普惠', type: 'CONSUMER_FINANCE', typeName: '消费金融公司',
          totalCasePackages: 89, totalCases: 21600, monthlyActiveCases: 2400, avgCaseAmount: 14352,
          cooperationStatus: 'ACTIVE', activeContracts: 2, cooperationScore: 85.8,
          contactPerson: '陈总监', contactPhone: '13800138003', businessManager: '周强',
          email: 'chen@puhui.com', lastActiveAt: '2024-07-30 11:20:00',
          contractExpireAt: '2025-09-15', createdAt: '2021-05-10',
          monthlyGrowthRate: 18.9, caseQualityScore: 83.6, apiConnectivity: 'ONLINE'
        },
        {
          id: 4, orgCode: 'ANT004', orgName: '蚂蚁借呗', type: 'ONLINE_LOAN', typeName: '网络贷款公司',
          totalCasePackages: 67, totalCases: 19800, monthlyActiveCases: 2100, avgCaseAmount: 13131,
          cooperationStatus: 'SUSPENDED', activeContracts: 1, cooperationScore: 78.3,
          contactPerson: '马经理', contactPhone: '13800138004', businessManager: '赵伟',
          email: 'ma@ant.com', lastActiveAt: '2024-07-28 14:30:00',
          contractExpireAt: '2024-12-31', createdAt: '2021-08-20',
          monthlyGrowthRate: -8.2, caseQualityScore: 76.4, apiConnectivity: 'ERROR'
        },
        {
          id: 5, orgCode: 'JD005', orgName: '京东金融', type: 'ONLINE_LOAN', typeName: '网络贷款公司',
          totalCasePackages: 73, totalCases: 18700, monthlyActiveCases: 2000, avgCaseAmount: 15508,
          cooperationStatus: 'ACTIVE', activeContracts: 1, cooperationScore: 82.1,
          contactPerson: '刘主管', contactPhone: '13800138005', businessManager: '孙杰',
          email: 'liu@jd.com', lastActiveAt: '2024-07-30 08:15:00',
          contractExpireAt: '2025-03-31', createdAt: '2021-12-05',
          monthlyGrowthRate: 24.1, caseQualityScore: 79.8, apiConnectivity: 'ONLINE'
        }
      ];

      const mockStats: SourceOrgStats = {
        totalOrgs: 45,
        activeOrgs: 38,
        totalCasePackages: 1256,
        totalCases: 186190,
        totalAmount: '28.4亿',
        avgCooperationScore: 85.6
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

  const handleView = (record: SourceOrgListItem) => {
    navigate(`/source-orgs/${record.id}`);
  };

  const handleEdit = (record: SourceOrgListItem) => {
    navigate(`/source-orgs/${record.id}/edit`);
  };

  const handleContact = (record: SourceOrgListItem, type: 'phone' | 'email') => {
    if (type === 'phone') {
      window.open(`tel:${record.contactPhone}`);
    } else {
      window.open(`mailto:${record.email}`);
    }
  };

  const handleSuspendCooperation = (record: SourceOrgListItem) => {
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
      'TERMINATED': 'red'
    };
    return statusMap[status as keyof typeof statusMap] || 'default';
  };

  const getCooperationStatusText = (status: string) => {
    const statusMap = {
      'ACTIVE': '正常合作',
      'SUSPENDED': '暂停合作',
      'TERMINATED': '终止合作'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getApiConnectivityStatus = (status: string) => {
    const statusMap = {
      'ONLINE': { color: 'green', text: '在线', icon: <CheckCircleOutlined /> },
      'OFFLINE': { color: 'orange', text: '离线', icon: <WarningOutlined /> },
      'ERROR': { color: 'red', text: '异常', icon: <WarningOutlined /> }
    };
    return statusMap[status as keyof typeof statusMap] || { color: 'default', text: status, icon: null };
  };

  // 表格列配置
  const columns: ColumnsType<SourceOrgListItem> = [
    {
      title: '机构信息',
      key: 'orgInfo',
      width: 280,
      fixed: 'left',
      render: (_, record) => {
        const typeConfig = orgTypeConfig[record.type];
        const apiStatus = getApiConnectivityStatus(record.apiConnectivity);
        
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
                  color={apiStatus.color} 
                  
                  style={{ marginLeft: 8 }}
                  icon={apiStatus.icon}
                >
                  {apiStatus.text}
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
      title: '案件业务',
      key: 'caseInfo',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#666' }}>案件包数量</span>
            <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
              {record.totalCasePackages.toLocaleString()}
            </div>
          </div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#666' }}>总案件数</span>
            <div style={{ fontWeight: 'bold', color: '#52c41a' }}>
              {record.totalCases.toLocaleString()}
            </div>
          </div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#666' }}>月活跃案件</span>
            <div style={{ fontWeight: 'bold', color: '#faad14' }}>
              {record.monthlyActiveCases.toLocaleString()}
            </div>
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#666' }}>平均金额</span>
            <div style={{ fontWeight: 'bold' }}>
              ¥{record.avgCaseAmount.toLocaleString()}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '合作状态',
      key: 'cooperation',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 8 }}>
            <Tag color={getCooperationStatusColor(record.cooperationStatus)}>
              {getCooperationStatusText(record.cooperationStatus)}
            </Tag>
          </div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#666' }}>有效合同</span>
            <div style={{ fontWeight: 'bold' }}>{record.activeContracts}个</div>
          </div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#666' }}>合作评分</span>
            <div style={{ fontWeight: 'bold', color: '#722ed1' }}>
              {record.cooperationScore}
            </div>
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#666' }}>案件质量</span>
            <Progress 
              percent={record.caseQualityScore} 
             
              strokeColor={record.caseQualityScore >= 80 ? '#52c41a' : '#faad14'}
              format={(percent) => `${percent}`}
            />
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
            <strong>业务经理：</strong>{record.businessManager}
          </div>
        </div>
      ),
    },
    {
      title: '业务指标',
      key: 'metrics',
      width: 140,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#666' }}>月度增长</span>
            <div style={{ 
              fontWeight: 'bold', 
              color: record.monthlyGrowthRate >= 0 ? '#52c41a' : '#ff4d4f' 
            }}>
              {record.monthlyGrowthRate >= 0 ? <RiseOutlined /> : <RiseOutlined style={{ transform: 'rotate(180deg)' }} />}
              {Math.abs(record.monthlyGrowthRate)}%
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            <div>最后活跃：</div>
            <div>{record.lastActiveAt.split(' ')[0]}</div>
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            <div>合同到期：</div>
            <div style={{ 
              color: new Date(record.contractExpireAt) < new Date(Date.now() + 90*24*60*60*1000) ? '#ff4d4f' : '#666'
            }}>
              {record.contractExpireAt}
            </div>
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
            <Tooltip title="合作管理">
              <Button 
                type="link" 
                icon={<SettingOutlined />} 
               
                onClick={() => navigate(`/source-orgs/${record.id}/cooperation`)}
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
    <div className="source-org-list">
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
              title="案件包总数"
              value={stats.totalCasePackages}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="案件总数"
              value={stats.totalCases}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="案件总金额"
              value={stats.totalAmount}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="平均合作评分"
              value={stats.avgCooperationScore}
              precision={1}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容 */}
      <Card title="案源机构列表" bordered={false}>
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
          <Col span={4}>
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
          <Col span={4}>
            <Select
              placeholder="合作状态"
              allowClear
              style={{ width: '100%' }}
              value={filters.cooperationStatus}
              onChange={(value) => setFilters(prev => ({ ...prev, cooperationStatus: value }))}
            >
              <Option value="ACTIVE">正常合作</Option>
              <Option value="SUSPENDED">暂停合作</Option>
              <Option value="TERMINATED">终止合作</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="业务经理"
              allowClear
              style={{ width: '100%' }}
              value={filters.businessManager}
              onChange={(value) => setFilters(prev => ({ ...prev, businessManager: value }))}
            >
              <Option value="李明">李明</Option>
              <Option value="刘华">刘华</Option>
              <Option value="周强">周强</Option>
              <Option value="赵伟">赵伟</Option>
              <Option value="孙杰">孙杰</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/source-orgs/create')}
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
          scroll={{ x: 1200 }}
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

export default SourceOrgList;