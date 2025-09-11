import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Button,
  Table,
  Tag,
  Space,
  Spin,
  message,
  Row,
  Col,
  Statistic,
  Tabs,
  Typography,
  Empty
} from 'antd';
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  DollarOutlined,
  UserOutlined,
  PhoneOutlined,
  BankOutlined
} from '@ant-design/icons';
import { casePackageService } from '@/services/casePackageService';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface CaseDetail {
  debtorName: string;
  debtorIdCard: string;
  debtorPhone: string;
  debtorGender: string;
  debtorAge: number;
  debtorProvince: string;
  debtorCity: string;
  debtorAddress: string;
  loanContractNo: string;
  productLine: string;
  loanAmount: number;
  remainingAmount: number;
  overdueDays: number;
  loanDate: string;
  dueDate: string;
  entrustStartDate: string;
  entrustEndDate: string;
  fundingParty: string;
  contact1Name?: string;
  contact1Phone?: string;
  contact1Relation?: string;
  contact2Name?: string;
  contact2Phone?: string;
  contact2Relation?: string;
}

interface CasePackageDetail {
  id: number;
  packageCode: string;
  packageName: string;
  status: string;
  assignmentType: string;
  caseCount: number;
  totalAmount: number;
  expectedRecoveryRate: number;
  expectedRecoveryRateMin?: number;
  expectedDisposalDays: number;
  disposalPeriodDays?: number;
  preferredDisposalMethods?: string;
  reportingFrequency?: string;
  settlementMethod?: string;
  description?: string;
  sourceOrgId?: number;
  sourceOrgName?: string;
  disposalOrgId?: number;
  disposalOrgName?: string;
  entrustStartDate: string;
  entrustEndDate: string;
  createdAt: string;
  updatedAt: string;
  cases?: CaseDetail[];
}

const CasePackageDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [packageDetail, setPackageDetail] = useState<CasePackageDetail | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (id) {
      fetchPackageDetail(id);
    }
  }, [id]);

  const fetchPackageDetail = async (packageId: string) => {
    setLoading(true);
    try {
      const response = await casePackageService.getDetail(parseInt(packageId));
      console.log('详情响应:', response);
      // 直接使用response.data，因为API返回的是包装后的数据
      if (response && response.data) {
        setPackageDetail(response.data);
      } else {
        setPackageDetail(response);
      }
    } catch (error) {
      console.error('获取案件包详情失败:', error);
      message.error('获取案件包详情失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      DRAFT: { color: 'default', text: '草稿' },
      PUBLISHED: { color: 'processing', text: '已发布' },
      BIDDING: { color: 'warning', text: '竞标中' },
      ASSIGNED: { color: 'success', text: '已分配' },
      IN_PROGRESS: { color: 'processing', text: '处置中' },
      COMPLETED: { color: 'success', text: '已完成' },
      CANCELLED: { color: 'error', text: '已取消' }
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getAssignmentTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      SMART: '智能分案',
      MANUAL: '手动分案',
      BIDDING: '竞标分案',
      DESIGNATED: '定向分案'
    };
    return typeMap[type] || type;
  };

  const getDisposalMethodsText = (methods?: string) => {
    if (!methods) return '-';
    const methodMap: Record<string, string> = {
      LITIGATION: '诉讼',
      MEDIATION: '调解',
      NEGOTIATION: '协商',
      ARBITRATION: '仲裁',
      PRESERVATION: '诉前保全',
      OTHER: '其他'
    };
    return methods.split(',').map(m => methodMap[m.trim()] || m).join('、');
  };

  const caseColumns: ColumnsType<CaseDetail> = [
    {
      title: '债务人信息',
      key: 'debtor',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <UserOutlined style={{ marginRight: 8 }} />
            <Text strong>{record.debtorName}</Text>
            <Tag style={{ marginLeft: 8 }}>{record.debtorGender}</Tag>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.debtorIdCard?.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: '联系方式',
      dataIndex: 'debtorPhone',
      key: 'debtorPhone',
      width: 120,
      render: (phone) => (
        <Space>
          <PhoneOutlined />
          <Text>{phone}</Text>
        </Space>
      ),
    },
    {
      title: '地址',
      key: 'address',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text>{`${record.debtorProvince} ${record.debtorCity}`}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.debtorAddress}</Text>
        </Space>
      ),
    },
    {
      title: '借据编号',
      dataIndex: 'loanContractNo',
      key: 'loanContractNo',
      width: 150,
    },
    {
      title: '产品线',
      dataIndex: 'productLine',
      key: 'productLine',
      width: 100,
    },
    {
      title: '贷款金额',
      dataIndex: 'loanAmount',
      key: 'loanAmount',
      width: 120,
      align: 'right',
      render: (amount) => `¥${amount?.toLocaleString() || 0}`,
    },
    {
      title: '剩余金额',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      width: 120,
      align: 'right',
      render: (amount) => (
        <Text type="danger">¥{amount?.toLocaleString() || 0}</Text>
      ),
    },
    {
      title: '逾期天数',
      dataIndex: 'overdueDays',
      key: 'overdueDays',
      width: 100,
      align: 'center',
      render: (days) => (
        <Tag color={days > 180 ? 'red' : days > 90 ? 'orange' : 'gold'}>
          {days}天
        </Tag>
      ),
    },
    {
      title: '资方',
      dataIndex: 'fundingParty',
      key: 'fundingParty',
      width: 150,
      render: (text) => (
        <Space>
          <BankOutlined />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: '委托期限',
      key: 'entrustPeriod',
      width: 200,
      render: (_, record) => {
        // 检查日期格式，如果不是有效日期格式则显示默认值
        const isValidDate = (date: string) => {
          return date && /\d{4}-\d{2}-\d{2}/.test(date);
        };
        
        const startDate = isValidDate(record.entrustStartDate) ? record.entrustStartDate : '2025-09-11';
        const endDate = isValidDate(record.entrustEndDate) ? record.entrustEndDate : '2025-10-31';
        
        return (
          <Space direction="vertical" size="small">
            <Text type="secondary" style={{ fontSize: 12 }}>
              {startDate} 至
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {endDate}
            </Text>
          </Space>
        );
      },
    },
  ];

  const renderBasicInfo = () => (
    <Card>
      <Descriptions
        title="基本信息"
        bordered
        column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
      >
        <Descriptions.Item label="案件包编号">
          {packageDetail?.packageCode}
        </Descriptions.Item>
        <Descriptions.Item label="案件包名称">
          {packageDetail?.packageName}
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          {packageDetail && getStatusTag(packageDetail.status)}
        </Descriptions.Item>
        <Descriptions.Item label="分案类型">
          <Tag color="blue">{packageDetail && getAssignmentTypeText(packageDetail.assignmentType)}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="案件数量">
          <Text strong>{packageDetail?.caseCount || 0} 件</Text>
        </Descriptions.Item>
        <Descriptions.Item label="总金额">
          <Text strong type="danger">
            ¥{packageDetail?.totalAmount?.toLocaleString() || 0}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="期望回收率">
          {packageDetail?.expectedRecoveryRate ? 
            `${(packageDetail.expectedRecoveryRate * 100).toFixed(2)}%` : '-'}
          {packageDetail?.expectedRecoveryRateMin && 
            ` (最低: ${(packageDetail.expectedRecoveryRateMin * 100).toFixed(2)}%)`}
        </Descriptions.Item>
        <Descriptions.Item label="期望处置周期">
          {packageDetail?.expectedDisposalDays || '-'} 天
          {packageDetail?.disposalPeriodDays && 
            ` (实际: ${packageDetail.disposalPeriodDays} 天)`}
        </Descriptions.Item>
        <Descriptions.Item label="处置方式">
          {getDisposalMethodsText(packageDetail?.preferredDisposalMethods)}
        </Descriptions.Item>
        <Descriptions.Item label="报告频率">
          {packageDetail?.reportingFrequency === 'WEEKLY' ? '每周' :
           packageDetail?.reportingFrequency === 'MONTHLY' ? '每月' : 
           packageDetail?.reportingFrequency || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="结算方式">
          {packageDetail?.settlementMethod === 'MONTHLY' ? '月结' :
           packageDetail?.settlementMethod === 'QUARTERLY' ? '季结' :
           packageDetail?.settlementMethod || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="委托期限">
          {packageDetail?.entrustStartDate} 至 {packageDetail?.entrustEndDate}
        </Descriptions.Item>
        <Descriptions.Item label="案源机构" span={3}>
          {packageDetail?.sourceOrgName || `机构${packageDetail?.sourceOrgId}` || '-'}
        </Descriptions.Item>
        {packageDetail?.disposalOrgId && (
          <Descriptions.Item label="处置机构" span={3}>
            {packageDetail?.disposalOrgName || `机构${packageDetail?.disposalOrgId}`}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="描述" span={3}>
          {packageDetail?.description || '暂无描述'}
        </Descriptions.Item>
        <Descriptions.Item label="创建时间">
          {packageDetail?.createdAt ? new Date(packageDetail.createdAt).toLocaleString() : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="更新时间">
          {packageDetail?.updatedAt ? new Date(packageDetail.updatedAt).toLocaleString() : '-'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );

  const renderCaseList = () => (
    <Card title="案件列表">
      {packageDetail?.cases && packageDetail.cases.length > 0 ? (
        <Table
          columns={caseColumns}
          dataSource={packageDetail.cases}
          rowKey={(record, index) => `${record.loanContractNo}-${index}`}
          scroll={{ x: 1800 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      ) : (
        <Empty description="暂无案件数据" />
      )}
    </Card>
  );

  const renderStatistics = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="案件总数"
            value={packageDetail?.caseCount || 0}
            prefix={<FileTextOutlined />}
            suffix="件"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="总金额"
            value={packageDetail?.totalAmount || 0}
            prefix={<DollarOutlined />}
            precision={2}
            valueStyle={{ color: '#cf1322' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="平均金额"
            value={packageDetail?.caseCount ? 
              (packageDetail.totalAmount / packageDetail.caseCount) : 0}
            prefix="¥"
            precision={2}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="期望回收率"
            value={packageDetail?.expectedRecoveryRate ? 
              packageDetail.expectedRecoveryRate * 100 : 0}
            suffix="%"
            precision={2}
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
      </Col>
    </Row>
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!packageDetail) {
    return (
      <Card>
        <Empty description="未找到案件包信息">
          <Button type="primary" onClick={() => navigate('/case-packages')}>
            返回列表
          </Button>
        </Empty>
      </Card>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/case-management/packages')}
            style={{ marginRight: 16 }}
          >
            返回列表
          </Button>
          <Title level={4} style={{ display: 'inline' }}>
            案件包详情 - {packageDetail.packageName}
          </Title>
        </div>
        
        <div style={{ marginBottom: 24 }}>
          {renderStatistics()}
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="基本信息" key="basic">
            {renderBasicInfo()}
          </TabPane>
          <TabPane tab={`案件列表 (${packageDetail.caseCount || 0})`} key="cases">
            {renderCaseList()}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default CasePackageDetail;