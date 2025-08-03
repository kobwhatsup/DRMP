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
  InputNumber,
  Select,
  DatePicker,
  Form,
  Badge,
  Table,
  Divider,
  Rate,
  Avatar,
  Typography
} from 'antd';
import { 
  EyeOutlined,
  HeartOutlined,
  HeartFilled,
  SendOutlined,
  FilterOutlined,
  ReloadOutlined,
  TrophyOutlined,
  FireOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  TeamOutlined,
  StarOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { caseMarketService, type CasePackage } from '@/services/caseService';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

/**
 * 案件市场页面 - 处置机构浏览和竞标案件包
 */
const CaseMarket: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<CasePackage[]>([]);
  const [total, setTotal] = useState(0);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CasePackage | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [queryParams, setQueryParams] = useState({
    page: 0,
    size: 12, // 卡片布局适合较少的每页数量
    sortBy: 'publishTime',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [marketStats, setMarketStats] = useState({
    totalPackages: 0,
    totalAmount: 0,
    avgAmount: 0,
    activeOrgs: 0,
    hotPackages: 0
  });
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
  const loadData = async (params?: any) => {
    setLoading(true);
    try {
      const mergedParams = { ...queryParams, ...params };
      // 模拟市场数据，因为实际API还未实现
      const mockMarketData: CasePackage[] = [
        {
          id: 1,
          packageName: '华北地区个贷不良资产包A',
          packageCode: 'PKG-001',
          sourceOrgId: 1,
          sourceOrgName: '某股份制银行',
          totalCases: 256,
          totalAmount: 8500000,
          avgAmount: 33203,
          minAmount: 5000,
          maxAmount: 180000,
          expectedRecoveryRate: 65,
          disposalPeriod: 90,
          disposalMethods: ['MEDIATION', 'LITIGATION'],
          assignmentStrategy: 'INTELLIGENT',
          assignmentConfig: {},
          status: 'PUBLISHED',
          publishTime: '2024-01-15 10:30:00',
          assignmentDeadline: '2024-02-15 10:30:00',
          assignedCases: 0,
          processingCases: 0,
          completedCases: 0,
          recoveredAmount: 0,
          recoveryRate: 0,
          createdAt: '2024-01-10 10:30:00',
          updatedAt: '2024-01-15 10:30:00'
        }
      ];
      
      setDataSource(mockMarketData);
      setTotal(mockMarketData.length);
      setQueryParams(mergedParams);
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
      // 模拟统计数据
      setMarketStats({
        totalPackages: 156,
        totalAmount: 125800000,
        avgAmount: 806410,
        activeOrgs: 45,
        hotPackages: 12
      });
    } catch (error) {
      console.error('Failed to load market stats:', error);
    }
  };

  useEffect(() => {
    loadData();
    loadMarketStats();
  }, []);

  // 收藏/取消收藏
  const toggleFavorite = async (packageId: number) => {
    try {
      const newFavorites = new Set(favorites);
      if (newFavorites.has(packageId)) {
        await caseMarketService.unfavoriteCasePackage(packageId);
        newFavorites.delete(packageId);
        message.success('已取消收藏');
      } else {
        await caseMarketService.favoriteCasePackage(packageId);
        newFavorites.add(packageId);
        message.success('已添加收藏');
      }
      setFavorites(newFavorites);
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 竞标案件包
  const handleBid = (casePackage: CasePackage) => {
    setSelectedPackage(casePackage);
    setBidModalVisible(true);
  };

  // 查看详情
  const handleViewDetail = async (casePackage: CasePackage) => {
    setSelectedPackage(casePackage);
    setDetailModalVisible(true);
    // 增加浏览量
    try {
      await caseMarketService.incrementViewCount(casePackage.id);
    } catch (error) {
      console.error('Failed to increment view count:', error);
    }
  };

  // 提交竞标
  const submitBid = async (values: any) => {
    if (!selectedPackage) return;

    try {
      await caseMarketService.bidForCasePackage(selectedPackage.id, {
        bidAmount: values.bidAmount,
        bidNote: values.bidNote,
        expectedRecoveryRate: values.expectedRecoveryRate,
        processingPeriod: values.processingPeriod
      });
      message.success('竞标已提交，请等待审核');
      setBidModalVisible(false);
      form.resetFields();
      loadData(); // 刷新数据
    } catch (error) {
      message.error('竞标提交失败');
    }
  };

  // 渲染案件包卡片
  const renderCasePackageCard = (casePackage: CasePackage) => {
    const isHot = Math.random() > 0.7; // 模拟热门案件包
    const viewCount = Math.floor(Math.random() * 50 + 10);
    const bidCount = Math.floor(Math.random() * 8 + 2);
    
    return (
      <Card
        key={casePackage.id}
        hoverable
        style={{ height: '100%' }}
        cover={
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            height: 60,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px'
          }}>
            <div style={{ color: 'white', fontWeight: 'bold' }}>
              {casePackage.packageName}
            </div>
            <Space>
              {isHot && <Tag color="red">HOT</Tag>}
              <Button
                type="text"
                icon={favorites.has(casePackage.id) ? 
                  <HeartFilled style={{ color: '#ff4d4f' }} /> : 
                  <HeartOutlined style={{ color: 'white' }} />
                }
                onClick={() => toggleFavorite(casePackage.id)}
                style={{ color: 'white' }}
              />
            </Space>
          </div>
        }
        actions={[
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(casePackage)}
          >
            查看详情
          </Button>,
          <Button 
            type="primary" 
            icon={<SendOutlined />}
            onClick={() => handleBid(casePackage)}
          >
            立即竞标
          </Button>
        ]}
      >
        <div style={{ minHeight: 200 }}>
          {/* 基本信息 */}
          <div style={{ marginBottom: 12 }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {casePackage.id} • 发布于 {dayjs(casePackage.publishTime).format('MM-DD HH:mm')}
            </Text>
          </div>
          
          {/* 案件规模 */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <Statistic
                title="案件数"
                value={casePackage.totalCases || 0}
                suffix="件"
                valueStyle={{ fontSize: '16px', color: '#1890ff' }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="总金额"
                value={(casePackage.totalAmount || 0) / 10000}
                suffix="万"
                precision={1}
                valueStyle={{ fontSize: '16px', color: '#f56a00' }}
              />
            </Col>
          </Row>
          
          {/* 处置要求 */}
          <div style={{ marginBottom: 12 }}>
            <Row gutter={8}>
              <Col span={12}>
                <Text strong>期望回款率</Text>
                <div style={{ color: '#52c41a', fontWeight: 'bold' }}>
                  {casePackage.expectedRecoveryRate || 0}%
                </div>
              </Col>
              <Col span={12}>
                <Text strong>处置周期</Text>
                <div style={{ color: '#722ed1', fontWeight: 'bold' }}>
                  {casePackage.disposalPeriod || 0}天
                </div>
              </Col>
            </Row>
          </div>
          
          {/* 处置方式 */}
          {casePackage.disposalMethods && casePackage.disposalMethods.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <Text strong style={{ marginRight: 8 }}>处置方式:</Text>
              {casePackage.disposalMethods.map(method => {
                const methodMap: Record<string, { text: string; color: string }> = {
                  MEDIATION: { text: '调解', color: 'blue' },
                  LITIGATION: { text: '诉讼', color: 'red' },
                  PRESERVATION: { text: '保全', color: 'orange' }
                };
                const config = methodMap[method] || { text: method, color: 'default' };
                return (
                  <Tag key={method} color={config.color}>
                    {config.text}
                  </Tag>
                );
              })}
            </div>
          )}
          
          {/* 热度指标 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space size="large">
              <div style={{ textAlign: 'center' }}>
                <EyeOutlined style={{ color: '#8c8c8c' }} />
                <Text type="secondary" style={{ marginLeft: 4, fontSize: '12px' }}>
                  {viewCount}
                </Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <TeamOutlined style={{ color: '#8c8c8c' }} />
                <Text type="secondary" style={{ marginLeft: 4, fontSize: '12px' }}>
                  {bidCount}人竞标
                </Text>
              </div>
            </Space>
            {isHot && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FireOutlined style={{ color: '#ff4d4f', marginRight: 4 }} />
                <Text type="secondary" style={{ fontSize: '12px' }}>热门</Text>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="case-market">
      {/* 市场统计概览 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={5}>
          <Card>
            <Statistic
              title="案件包总数"
              value={marketStats.totalPackages}
              suffix="个"
              valueStyle={{ color: '#1890ff' }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="总金额"
              value={marketStats.totalAmount / 10000}
              suffix="万"
              precision={0}
              valueStyle={{ color: '#f56a00' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="平均金额"
              value={marketStats.avgAmount / 10000}
              suffix="万"
              precision={1}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="活跃机构"
              value={marketStats.activeOrgs}
              suffix="家"
              valueStyle={{ color: '#52c41a' }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="热门案件"
              value={marketStats.hotPackages}
              suffix="个"
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<FireOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索和筛选栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Input.Search
              placeholder="搜索案件包名称、编号"
              allowClear
              onSearch={(value) => loadData({ keyword: value, page: 0 })}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="金额范围"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => {
                if (value) {
                  const [min, max] = value.split('-').map(Number);
                  loadData({ totalAmountMin: min, totalAmountMax: max, page: 0 });
                } else {
                  loadData({ totalAmountMin: undefined, totalAmountMax: undefined, page: 0 });
                }
              }}
            >
              <Option value="0-100000">10万以下</Option>
              <Option value="100000-500000">10-50万</Option>
              <Option value="500000-1000000">50-100万</Option>
              <Option value="1000000-5000000">100-500万</Option>
              <Option value="5000000-99999999">500万以上</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="案件数量"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => {
                if (value) {
                  const [min, max] = value.split('-').map(Number);
                  loadData({ caseCountMin: min, caseCountMax: max, page: 0 });
                } else {
                  loadData({ caseCountMin: undefined, caseCountMax: undefined, page: 0 });
                }
              }}
            >
              <Option value="0-50">50件以下</Option>
              <Option value="50-200">50-200件</Option>
              <Option value="200-500">200-500件</Option>
              <Option value="500-99999">500件以上</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="排序方式"
              value={queryParams.sortBy}
              style={{ width: '100%' }}
              onChange={(value) => loadData({ sortBy: value, page: 0 })}
            >
              <Option value="publishTime">最新发布</Option>
              <Option value="totalAmount">金额最高</Option>
              <Option value="totalCases">案件最多</Option>
              <Option value="viewCount">浏览最多</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Space>
              <Button 
                icon={<ReloadOutlined />}
                onClick={() => loadData()}
                loading={loading}
              >
                刷新
              </Button>
              <Tooltip title="只看收藏">
                <Button 
                  icon={<HeartOutlined />}
                  type={favorites.size > 0 ? 'primary' : 'default'}
                  onClick={() => {
                    // TODO: 筛选收藏的案件包
                    message.info('收藏筛选功能开发中');
                  }}
                >
                  收藏
                </Button>
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 案件包卡片列表 */}
      <div style={{ minHeight: 600 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <span>加载中...</span>
          </div>
        ) : dataSource.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Title level={4} type="secondary">暂无案件包</Title>
            <Text type="secondary">当前没有可竞标的案件包，请稍后查看</Text>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {dataSource.map(casePackage => (
              <Col xs={24} sm={12} md={8} lg={6} key={casePackage.id}>
                {renderCasePackageCard(casePackage)}
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* 分页 */}
      {total > 0 && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button
            disabled={queryParams.page === 0}
            onClick={() => loadData({ page: queryParams.page! - 1 })}
          >
            上一页
          </Button>
          <span style={{ margin: '0 16px' }}>
            第 {(queryParams.page || 0) + 1} 页，共 {Math.ceil(total / (queryParams.size || 12))} 页
          </span>
          <Button
            disabled={(queryParams.page || 0) + 1 >= Math.ceil(total / (queryParams.size || 12))}
            onClick={() => loadData({ page: (queryParams.page || 0) + 1 })}
          >
            下一页
          </Button>
        </div>
      )}

      {/* 竞标对话框 */}
      <Modal
        title={`竞标案件包 - ${selectedPackage?.packageName}`}
        open={bidModalVisible}
        onCancel={() => {
          setBidModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={submitBid}
        >
          <Form.Item
            name="bidNote"
            label="竞标说明"
            rules={[
              { required: true, message: '请输入竞标说明' },
              { min: 50, message: '说明内容不能少于50字符' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="请详细说明您的处置能力、团队优势、预期效果等..."
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="expectedRecoveryRate"
                label="预期回款率(%)"
                rules={[{ required: true, message: '请输入预期回款率' }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  placeholder="如：60"
                  style={{ width: '100%' }}
                  formatter={value => `${value}%`}
                  parser={(value) => Number(value!.replace('%', '')) as any}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="processingPeriod"
                label="处置周期(天)"
                rules={[{ required: true, message: '请输入处置周期' }]}
              >
                <InputNumber
                  min={1}
                  max={365}
                  placeholder="如：90"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="bidAmount"
            label="竞标金额(万元)"
            tooltip="您愿意为此案件包支付的保证金或服务费"
          >
            <InputNumber
              min={0}
              placeholder="选填"
              style={{ width: '100%' }}
              formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number(value!.replace(/¥\s?|(,*)/g, '')) as any}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setBidModalVisible(false);
                form.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                提交竞标
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情对话框 */}
      <Modal
        title={`案件包详情 - ${selectedPackage?.packageName}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button key="bid" type="primary" onClick={() => {
            setDetailModalVisible(false);
            setBidModalVisible(true);
          }}>
            立即竞标
          </Button>
        ]}
        width={800}
      >
        {selectedPackage && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Card title="基本信息" size="small">
                  <p><strong>案件包编号:</strong> {selectedPackage.id}</p>
                  <p><strong>案件数量:</strong> {selectedPackage.totalCases}件</p>
                  <p><strong>总金额:</strong> ¥{(selectedPackage.totalAmount || 0).toLocaleString()}</p>
                  <p><strong>平均金额:</strong> ¥{(selectedPackage.avgAmount || 0).toLocaleString()}</p>
                  <p><strong>发布时间:</strong> {dayjs(selectedPackage.publishTime).format('YYYY-MM-DD HH:mm')}</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="处置要求" size="small">
                  <p><strong>期望回款率:</strong> {selectedPackage.expectedRecoveryRate || 0}%</p>
                  <p><strong>处置周期:</strong> {selectedPackage.disposalPeriod || 0}天</p>
                  <p><strong>处置方式:</strong> {selectedPackage.disposalMethods?.join(', ') || '不限'}</p>
                  <p><strong>分案策略:</strong> {selectedPackage.assignmentStrategy || 'INTELLIGENT'}</p>
                </Card>
              </Col>
            </Row>
            <Divider />
            <Card title="竞标情况" size="small">
              <p>当前竞标机构数: <strong style={{ color: '#1890ff' }}>5家</strong></p>
              <p>最高回款率承诺: <strong style={{ color: '#52c41a' }}>65%</strong></p>
              <p>最短处置周期: <strong style={{ color: '#722ed1' }}>75天</strong></p>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CaseMarket;