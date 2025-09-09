import React, { useState, useEffect } from 'react';
import {
  Card, Descriptions, Badge, Table, Button, Space, Tabs, Tag, Timeline,
  Row, Col, Statistic, Modal, message, Tooltip, Progress, Divider,
  Alert, Typography, Dropdown, Empty, Spin
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, SendOutlined, PrinterOutlined,
  DownloadOutlined, TeamOutlined, ClockCircleOutlined, DollarOutlined,
  FileTextOutlined, CheckCircleOutlined, ExclamationCircleOutlined,
  TrophyOutlined, RobotOutlined, UserSwitchOutlined, BarChartOutlined,
  CalendarOutlined, EnvironmentOutlined, BankOutlined, PercentageOutlined,
  FileDoneOutlined, ProfileOutlined, AuditOutlined, FieldTimeOutlined,
  EyeOutlined, CopyOutlined, ShareAltOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  casePackageManagementAPI,
  CasePackageDetail,
  CasePackageStatus,
  AssignmentType,
  CasePackageBid
} from '../../../services/casePackageManagementService';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// 案件数据接口
interface Case {
  id: number;
  caseNumber: string;
  debtorName: string;
  debtorIdCard: string;
  debtorPhone: string;
  loanAmount: number;
  remainingAmount: number;
  overdueDate: string;
  overdueDays: number;
  debtorProvince: string;
  debtorCity: string;
  status: string;
  disposalStatus: string;
  recoveredAmount?: number;
}

// 操作日志接口
interface OperationLog {
  id: number;
  operationType: string;
  operator: string;
  operationTime: string;
  description: string;
  status: 'success' | 'fail' | 'processing';
}

const CasePackageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [packageDetail, setPackageDetail] = useState<CasePackageDetail | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [bids, setBids] = useState<CasePackageBid[]>([]);
  const [operationLogs, setOperationLogs] = useState<OperationLog[]>([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [casesCurrentPage, setCasesCurrentPage] = useState(1);
  const [casesPageSize, setCasesPageSize] = useState(10);
  const [casesTotal, setCasesTotal] = useState(0);

  // 加载案件包详情
  const loadPackageDetail = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await casePackageManagementAPI.getCasePackageDetail(Number(id));
      setPackageDetail(response);
    } catch (error) {
      message.error('加载案件包详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载案件列表
  const loadCases = async () => {
    if (!id) return;
    
    try {
      const response = await casePackageManagementAPI.getCasesInPackage(Number(id), {
        page: casesCurrentPage - 1,
        size: casesPageSize
      });
      setCases(response.content || []);
      setCasesTotal(response.totalElements || 0);
    } catch (error) {
      console.error('加载案件列表失败', error);
    }
  };

  // 加载竞标列表
  const loadBids = async () => {
    if (!id) return;
    
    try {
      const response = await casePackageManagementAPI.getBidList(Number(id));
      setBids(response);
    } catch (error) {
      console.error('加载竞标列表失败', error);
    }
  };

  // 加载操作日志（模拟数据）
  const loadOperationLogs = () => {
    setOperationLogs([
      {
        id: 1,
        operationType: '创建案件包',
        operator: '张三',
        operationTime: '2024-01-15 10:30:00',
        description: '创建了案件包，包含1000个案件',
        status: 'success'
      },
      {
        id: 2,
        operationType: '发布案件包',
        operator: '张三',
        operationTime: '2024-01-15 14:00:00',
        description: '发布案件包，开启竞标流程',
        status: 'success'
      },
      {
        id: 3,
        operationType: '智能分案',
        operator: '系统',
        operationTime: '2024-01-16 09:00:00',
        description: '执行智能分案，分配给5家处置机构',
        status: 'processing'
      }
    ]);
  };

  useEffect(() => {
    loadPackageDetail();
    loadCases();
    loadOperationLogs();
  }, [id]);

  useEffect(() => {
    if (packageDetail?.allowBidding) {
      loadBids();
    }
  }, [packageDetail]);

  useEffect(() => {
    loadCases();
  }, [casesCurrentPage, casesPageSize]);

  // 获取状态颜色
  const getStatusColor = (status: CasePackageStatus) => {
    const statusColors = {
      [CasePackageStatus.DRAFT]: 'default',
      [CasePackageStatus.PUBLISHED]: 'processing',
      [CasePackageStatus.BIDDING]: 'warning',
      [CasePackageStatus.ASSIGNING]: 'processing',
      [CasePackageStatus.ASSIGNED]: 'cyan',
      [CasePackageStatus.IN_PROGRESS]: 'blue',
      [CasePackageStatus.COMPLETED]: 'success',
      [CasePackageStatus.CANCELLED]: 'error',
      [CasePackageStatus.WITHDRAWN]: 'default'
    };
    return statusColors[status] || 'default';
  };

  // 获取状态文本
  const getStatusText = (status: CasePackageStatus) => {
    const statusTexts = {
      [CasePackageStatus.DRAFT]: '草稿',
      [CasePackageStatus.PUBLISHED]: '已发布',
      [CasePackageStatus.BIDDING]: '竞标中',
      [CasePackageStatus.ASSIGNING]: '分配中',
      [CasePackageStatus.ASSIGNED]: '已分配',
      [CasePackageStatus.IN_PROGRESS]: '处置中',
      [CasePackageStatus.COMPLETED]: '已完成',
      [CasePackageStatus.CANCELLED]: '已取消',
      [CasePackageStatus.WITHDRAWN]: '已撤回'
    };
    return statusTexts[status] || status;
  };

  // 获取分配方式文本
  const getAssignmentTypeText = (type: AssignmentType) => {
    const typeTexts = {
      [AssignmentType.MANUAL]: '手动分案',
      [AssignmentType.BIDDING]: '竞标分案',
      [AssignmentType.SMART]: '智能分案',
      [AssignmentType.DESIGNATED]: '定向委托'
    };
    return typeTexts[type] || type;
  };

  // 案件列表列定义
  const caseColumns: ColumnsType<Case> = [
    {
      title: '案件编号',
      dataIndex: 'caseNumber',
      key: 'caseNumber',
      width: 150,
      fixed: 'left'
    },
    {
      title: '债务人信息',
      key: 'debtorInfo',
      width: 200,
      render: (_, record) => (
        <div>
          <div>{record.debtorName}</div>
          <div style={{ fontSize: 12, color: '#999' }}>
            {record.debtorIdCard?.replace(/^(.{6}).*(.{4})$/, '$1****$2')}
          </div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.debtorPhone}</div>
        </div>
      )
    },
    {
      title: '地区',
      key: 'location',
      width: 150,
      render: (_, record) => `${record.debtorProvince} ${record.debtorCity}`
    },
    {
      title: '贷款金额',
      dataIndex: 'loanAmount',
      key: 'loanAmount',
      width: 120,
      align: 'right',
      render: (amount) => `¥${amount?.toLocaleString()}`
    },
    {
      title: '剩余金额',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      width: 120,
      align: 'right',
      render: (amount) => `¥${amount?.toLocaleString()}`
    },
    {
      title: '逾期天数',
      dataIndex: 'overdueDays',
      key: 'overdueDays',
      width: 100,
      align: 'center',
      render: (days) => (
        <Tag color={days > 180 ? 'red' : days > 90 ? 'orange' : 'blue'}>
          {days}天
        </Tag>
      )
    },
    {
      title: '处置状态',
      dataIndex: 'disposalStatus',
      key: 'disposalStatus',
      width: 100,
      render: (status) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          'NOT_STARTED': { color: 'default', text: '未开始' },
          'IN_PROGRESS': { color: 'processing', text: '处置中' },
          'SETTLED': { color: 'success', text: '已结清' },
          'FAILED': { color: 'error', text: '处置失败' }
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '回收金额',
      dataIndex: 'recoveredAmount',
      key: 'recoveredAmount',
      width: 120,
      align: 'right',
      render: (amount) => amount ? `¥${amount.toLocaleString()}` : '-'
    }
  ];

  // 竞标列表列定义
  const bidColumns: ColumnsType<CasePackageBid> = [
    {
      title: '处置机构',
      dataIndex: 'disposalOrgName',
      key: 'disposalOrgName',
      width: 200
    },
    {
      title: '竞标金额',
      dataIndex: 'bidAmount',
      key: 'bidAmount',
      width: 150,
      align: 'right',
      render: (amount) => `¥${amount?.toLocaleString()}`
    },
    {
      title: '承诺回收率',
      dataIndex: 'proposedRecoveryRate',
      key: 'proposedRecoveryRate',
      width: 120,
      align: 'center',
      render: (rate) => `${rate}%`
    },
    {
      title: '处置周期',
      dataIndex: 'proposedDisposalDays',
      key: 'proposedDisposalDays',
      width: 120,
      align: 'center',
      render: (days) => `${days}天`
    },
    {
      title: '综合评分',
      dataIndex: 'comprehensiveScore',
      key: 'comprehensiveScore',
      width: 120,
      align: 'center',
      render: (score) => (
        <div>
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#1890ff' }}>
            {score || '-'}
          </span>
        </div>
      )
    },
    {
      title: '排名',
      dataIndex: 'ranking',
      key: 'ranking',
      width: 80,
      align: 'center',
      render: (ranking) => {
        if (!ranking) return '-';
        if (ranking === 1) return <Tag color="gold">第{ranking}名</Tag>;
        if (ranking === 2) return <Tag color="silver">第{ranking}名</Tag>;
        if (ranking === 3) return <Tag color="bronze">第{ranking}名</Tag>;
        return <Tag>第{ranking}名</Tag>;
      }
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <div>
          {record.isWinner && <Tag color="success">中标</Tag>}
          {record.status === 'SUBMITTED' && !record.isWinner && <Tag>已提交</Tag>}
          {record.status === 'WITHDRAWN' && <Tag color="default">已撤回</Tag>}
        </div>
      )
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 180,
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm')
    }
  ];

  // 处理操作
  const handleEdit = () => {
    navigate(`/case-packages/create?id=${id}`);
  };

  const handlePublish = () => {
    Modal.confirm({
      title: '确认发布',
      content: '确定要发布该案件包吗？发布后将开启分案流程。',
      onOk: async () => {
        try {
          await casePackageManagementAPI.publishCasePackage(Number(id));
          message.success('发布成功');
          loadPackageDetail();
        } catch (error) {
          message.error('发布失败');
        }
      }
    });
  };

  const handleExport = async () => {
    try {
      await casePackageManagementAPI.exportCases(Number(id));
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!packageDetail) {
    return <Empty description="案件包不存在" />;
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面头部 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(-1)}
              style={{ marginRight: 16 }}
            >
              返回
            </Button>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {packageDetail.packageName}
              </Title>
              <Space style={{ marginTop: 8 }}>
                <Text type="secondary">编号：{packageDetail.packageCode}</Text>
                <Divider type="vertical" />
                <Badge status={getStatusColor(packageDetail.status) as any} text={getStatusText(packageDetail.status)} />
                <Divider type="vertical" />
                <Tag>{getAssignmentTypeText(packageDetail.assignmentType)}</Tag>
              </Space>
            </div>
          </div>
          
          <Space>
            {packageDetail.status === CasePackageStatus.DRAFT && (
              <>
                <Button icon={<EditOutlined />} onClick={handleEdit}>编辑</Button>
                <Button type="primary" icon={<SendOutlined />} onClick={handlePublish}>发布</Button>
              </>
            )}
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => navigate(`/cases/list?packageId=${id}&packageName=${encodeURIComponent(packageDetail.packageName || '')}`)}
            >
              查看案件列表
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>导出</Button>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>打印</Button>
            <Dropdown
              menu={{
                items: [
                  { key: 'logs', label: '查看日志', icon: <ProfileOutlined /> },
                  { key: 'copy', label: '复制案件包', icon: <CopyOutlined /> },
                  { key: 'share', label: '分享', icon: <ShareAltOutlined /> }
                ]
              }}
            >
              <Button>更多</Button>
            </Dropdown>
          </Space>
        </div>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="案件总数"
              value={packageDetail.caseCount}
              prefix={<FileTextOutlined />}
              suffix="件"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总金额"
              value={packageDetail.totalAmount}
              prefix="¥"
              precision={2}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="剩余金额"
              value={packageDetail.remainingAmount}
              prefix="¥"
              precision={2}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="预期回收率"
              value={packageDetail.expectedRecoveryRate || 0}
              prefix={<PercentageOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* 详情标签页 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="基本信息" key="basic">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="案件包名称">{packageDetail.packageName}</Descriptions.Item>
              <Descriptions.Item label="案件包编号">{packageDetail.packageCode}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Badge status={getStatusColor(packageDetail.status) as any} text={getStatusText(packageDetail.status)} />
              </Descriptions.Item>
              <Descriptions.Item label="分配方式">
                {getAssignmentTypeText(packageDetail.assignmentType)}
              </Descriptions.Item>
              <Descriptions.Item label="案源机构">
                <Space>
                  <BankOutlined />
                  {packageDetail.sourceOrgName}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="处置机构">
                {packageDetail.disposalOrgName ? (
                  <Space>
                    <TeamOutlined />
                    {packageDetail.disposalOrgName}
                  </Space>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="委托开始日期">
                {packageDetail.entrustStartDate}
              </Descriptions.Item>
              <Descriptions.Item label="委托结束日期">
                {packageDetail.entrustEndDate}
              </Descriptions.Item>
              <Descriptions.Item label="预期处置天数">
                {packageDetail.expectedDisposalDays ? `${packageDetail.expectedDisposalDays}天` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="偏好处置方式">
                {packageDetail.preferredDisposalMethods || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {dayjs(packageDetail.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {dayjs(packageDetail.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="发布时间">
                {packageDetail.publishedAt ? dayjs(packageDetail.publishedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="分配时间">
                {packageDetail.assignedAt ? dayjs(packageDetail.assignedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>
                {packageDetail.description || '-'}
              </Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab={`案件列表 (${casesTotal})`} key="cases">
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="primary"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/cases/list?packageId=${id}&packageName=${encodeURIComponent(packageDetail?.packageName || '')}`)}
              >
                查看完整案件列表
              </Button>
            </div>
            <Table
              columns={caseColumns}
              dataSource={cases}
              rowKey="id"
              pagination={{
                current: casesCurrentPage,
                pageSize: casesPageSize,
                total: casesTotal,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条`,
                onChange: (page, size) => {
                  setCasesCurrentPage(page);
                  setCasesPageSize(size || 10);
                }
              }}
              scroll={{ x: 1200 }}
            />
          </TabPane>

          {packageDetail.allowBidding && (
            <TabPane tab={`竞标信息 (${bids.length})`} key="bids">
              {bids.length > 0 ? (
                <Table
                  columns={bidColumns}
                  dataSource={bids}
                  rowKey="id"
                  pagination={false}
                  scroll={{ x: 1200 }}
                />
              ) : (
                <Empty description="暂无竞标信息" />
              )}
            </TabPane>
          )}

          <TabPane tab="处置进度" key="progress">
            <Row gutter={16}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="已处置案件"
                    value={342}
                    suffix={`/ ${packageDetail.caseCount}`}
                  />
                  <Progress percent={34.2} strokeColor="#52c41a" />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="已回收金额"
                    value={1234567}
                    prefix="¥"
                    precision={2}
                  />
                  <Progress percent={45.6} strokeColor="#1890ff" />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="实际回收率"
                    value={28.5}
                    suffix="%"
                  />
                  <Progress percent={28.5} strokeColor="#fa8c16" />
                </Card>
              </Col>
            </Row>
            
            <Card style={{ marginTop: 16 }} title="处置时间轴">
              <Timeline mode="left">
                <Timeline.Item color="green">
                  <div>2024-01-15 10:30</div>
                  <div>创建案件包</div>
                </Timeline.Item>
                <Timeline.Item color="blue">
                  <div>2024-01-15 14:00</div>
                  <div>发布案件包</div>
                </Timeline.Item>
                <Timeline.Item color="orange">
                  <div>2024-01-16 09:00</div>
                  <div>开始竞标</div>
                </Timeline.Item>
                <Timeline.Item color="gray">
                  <div>预计 2024-01-20</div>
                  <div>竞标结束</div>
                </Timeline.Item>
              </Timeline>
            </Card>
          </TabPane>

          <TabPane tab="操作日志" key="logs">
            <Table
              columns={[
                {
                  title: '操作类型',
                  dataIndex: 'operationType',
                  key: 'operationType',
                  width: 120
                },
                {
                  title: '操作人',
                  dataIndex: 'operator',
                  key: 'operator',
                  width: 100
                },
                {
                  title: '操作时间',
                  dataIndex: 'operationTime',
                  key: 'operationTime',
                  width: 180
                },
                {
                  title: '描述',
                  dataIndex: 'description',
                  key: 'description'
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  width: 100,
                  render: (status: string) => {
                    const statusMap = {
                      'success': { color: 'success', text: '成功' },
                      'fail': { color: 'error', text: '失败' },
                      'processing': { color: 'processing', text: '处理中' }
                    };
                    const config = statusMap[status as keyof typeof statusMap];
                    return <Tag color={config.color}>{config.text}</Tag>;
                  }
                }
              ]}
              dataSource={operationLogs}
              rowKey="id"
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default CasePackageDetailPage;