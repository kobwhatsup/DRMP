import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  message, 
  Tooltip,
  Progress,
  Statistic,
  Input,
  Select,
  DatePicker,
  Form,
  Badge
} from 'antd';
import { 
  EyeOutlined,
  HeartOutlined,
  HeartFilled,
  SendOutlined,
  FilterOutlined,
  ReloadOutlined,
  TrophyOutlined,
  FireOutlined
} from '@ant-design/icons';
import DataTable from '../../components/common/DataTable';
import { caseMarketService } from '../../services/caseMarketService';
import type { CasePackage, CasePackageQueryParams } from '../../types/casePackage';
import type { QueryParams, PageResponse } from '../../components/common/DataTable';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * 案件市场页面
 */
const CaseMarket: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<PageResponse<CasePackage>>({
    content: [],
    number: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    numberOfElements: 0,
    empty: true
  });
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CasePackage | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [marketStats, setMarketStats] = useState<any>({});
  const [form] = Form.useForm();

  // 格式化金额
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // 加载市场数据
  const loadData = async (params: QueryParams) => {
    setLoading(true);
    try {
      const response = await caseMarketService.getMarketCasePackages({
        keyword: params.keyword,
        minAmount: params.minAmount,
        maxAmount: params.maxAmount,
        minOverdueDays: params.minOverdueDays,
        maxOverdueDays: params.maxOverdueDays,
        sourceOrgId: params.sourceOrgId,
        page: params.page || 0,
        size: params.size || 20,
        sortBy: params.sortBy || 'publishedAt',
        sortDir: (params.sortDir as 'asc' | 'desc') || 'desc'
      });
      
      setDataSource(response);
    } catch (error) {
      message.error('加载数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 加载市场统计
  const loadMarketStats = async () => {
    try {
      const stats = await caseMarketService.getMarketStatistics();
      setMarketStats(stats);
    } catch (error) {
      console.error('Failed to load market stats:', error);
    }
  };

  useEffect(() => {
    loadMarketStats();
  }, []);

  // 收藏/取消收藏
  const toggleFavorite = (packageId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(packageId)) {
      newFavorites.delete(packageId);
      message.success('已取消收藏');
    } else {
      newFavorites.add(packageId);
      message.success('已添加收藏');
    }
    setFavorites(newFavorites);
  };

  // 申请案件包
  const handleApply = (casePackage: CasePackage) => {
    setSelectedPackage(casePackage);
    setApplyModalVisible(true);
  };

  // 提交申请
  const submitApplication = async (values: any) => {
    if (!selectedPackage) return;

    try {
      await caseMarketService.applyCasePackage(selectedPackage.id, values.proposal);
      message.success('申请已提交，请等待审核');
      setApplyModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('申请提交失败');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '案件包信息',
      key: 'packageInfo',
      width: 300,
      render: (record: CasePackage) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <Badge status="processing" />
            <strong style={{ marginLeft: 4 }}>{record.packageName}</strong>
            <Button
              type="link"
              size="small"
              icon={favorites.has(record.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
              onClick={() => toggleFavorite(record.id)}
              style={{ marginLeft: 8 }}
            />
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            编号：{record.packageCode}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            案源：{record.sourceOrgName}
          </div>
        </div>
      )
    },
    {
      title: '案件规模',
      key: 'scale',
      width: 150,
      render: (record: CasePackage) => (
        <div>
          <div>案件数：<strong>{record.caseCount?.toLocaleString()}</strong></div>
          <div>总额：<strong style={{ color: '#f56a00' }}>{formatAmount(record.totalAmount || 0)}</strong></div>
        </div>
      )
    },
    {
      title: '期望指标',
      key: 'expectations',
      width: 120,
      render: (record: CasePackage) => (
        <div>
          {record.expectedRecoveryRate && (
            <div>回收率：{(record.expectedRecoveryRate * 100).toFixed(1)}%</div>
          )}
          {record.expectedDisposalDays && (
            <div>期限：{record.expectedDisposalDays}天</div>
          )}
        </div>
      )
    },
    {
      title: '委托期限',
      key: 'duration',
      width: 120,
      render: (record: CasePackage) => (
        <div>
          <div>{new Date(record.entrustStartDate).toLocaleDateString()}</div>
          <div>至</div>
          <div>{new Date(record.entrustEndDate).toLocaleDateString()}</div>
        </div>
      )
    },
    {
      title: '热度',
      key: 'popularity',
      width: 100,
      render: () => (
        <div style={{ textAlign: 'center' }}>
          <FireOutlined style={{ color: '#ff7a45', fontSize: 16 }} />
          <div style={{ fontSize: '12px', color: '#666' }}>
            {Math.floor(Math.random() * 20 + 5)}人关注
          </div>
        </div>
      )
    },
    {
      title: '发布时间',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      width: 120,
      render: (date: string) => {
        const publishDate = new Date(date);
        const now = new Date();
        const diffHours = Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60));
        
        if (diffHours < 24) {
          return <span style={{ color: '#52c41a' }}>{diffHours}小时前</span>;
        } else {
          return publishDate.toLocaleDateString();
        }
      }
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (record: CasePackage) => (
        <Space direction="vertical" size="small">
          <Button 
            type="primary" 
            size="small" 
            icon={<SendOutlined />}
            onClick={() => handleApply(record)}
            style={{ width: '100%' }}
          >
            申请承接
          </Button>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => {
              // TODO: 查看详情
              console.log('View details:', record.id);
            }}
            style={{ width: '100%' }}
          >
            查看详情
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="case-market">
      {/* 市场统计概览 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="可接案件包"
              value={marketStats.totalAvailablePackages || 0}
              suffix="个"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总金额"
              value={marketStats.totalAvailableAmount || 0}
              formatter={(value) => formatAmount(Number(value))}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均包金额"
              value={marketStats.averagePackageAmount || 0}
              formatter={(value) => formatAmount(Number(value))}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃机构"
              value={marketStats.totalActiveDisposalOrgs || 0}
              suffix="家"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容区域 */}
      <Card 
        title={
          <Space>
            <span>案件市场</span>
            <Tag color="processing">实时更新</Tag>
          </Space>
        }
        extra={
          <Space>
            <Tooltip title="高级筛选">
              <Button 
                icon={<FilterOutlined />}
                onClick={() => setFilterVisible(!filterVisible)}
              >
                筛选
              </Button>
            </Tooltip>
            <Button 
              icon={<ReloadOutlined />}
              onClick={() => loadData({})}
            >
              刷新
            </Button>
          </Space>
        }
      >
        {/* 高级筛选面板 */}
        {filterVisible && (
          <Card size="small" style={{ marginBottom: 16, backgroundColor: '#fafafa' }}>
            <Form layout="inline">
              <Form.Item label="金额范围">
                <Input.Group compact>
                  <Input style={{ width: 100 }} placeholder="最小金额" />
                  <Input style={{ width: 30, textAlign: 'center', pointerEvents: 'none' }} value="~" />
                  <Input style={{ width: 100 }} placeholder="最大金额" />
                </Input.Group>
              </Form.Item>
              <Form.Item label="逾期天数">
                <Input.Group compact>
                  <Input style={{ width: 80 }} placeholder="最小" />
                  <Input style={{ width: 30, textAlign: 'center', pointerEvents: 'none' }} value="~" />
                  <Input style={{ width: 80 }} placeholder="最大" />
                </Input.Group>
              </Form.Item>
              <Form.Item label="案源机构">
                <Select style={{ width: 150 }} placeholder="选择机构">
                  <Option value="">全部</Option>
                  {/* TODO: 动态加载机构列表 */}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary">应用筛选</Button>
              </Form.Item>
              <Form.Item>
                <Button onClick={() => setFilterVisible(false)}>收起</Button>
              </Form.Item>
            </Form>
          </Card>
        )}

        <DataTable<CasePackage>
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          onParamsChange={loadData}
          rowKey="id"
          scroll={{ x: 1200 }}
          searchPlaceholder="搜索案件包名称、编号"
        />
      </Card>

      {/* 申请案件包对话框 */}
      <Modal
        title={`申请承接 - ${selectedPackage?.packageName}`}
        open={applyModalVisible}
        onCancel={() => {
          setApplyModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={submitApplication}
        >
          <Form.Item
            name="proposal"
            label="申请提案"
            rules={[
              { required: true, message: '请输入申请提案' },
              { min: 50, message: '提案内容不能少于50字符' }
            ]}
          >
            <TextArea
              rows={6}
              placeholder="请详细说明您的处置能力、预期效果、团队配置等..."
              showCount
              maxLength={2000}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="proposedFeeRate"
                label="建议费率(%)"
                rules={[{ required: true, message: '请输入建议费率' }]}
              >
                <Input placeholder="如：15" suffix="%" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="proposedDays"
                label="预计处置时间(天)"
                rules={[{ required: true, message: '请输入预计处置时间' }]}
              >
                <Input placeholder="如：90" suffix="天" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="teamInfo"
            label="团队信息"
          >
            <TextArea
              rows={3}
              placeholder="请简要介绍处置团队的人员配置和专业能力..."
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setApplyModalVisible(false);
                form.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                提交申请
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CaseMarket;