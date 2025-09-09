import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Slider,
  InputNumber,
  DatePicker,
  Checkbox,
  Drawer,
  Form,
  Divider,
  Badge,
  Avatar,
  Typography,
  Statistic,
  Progress,
  Timeline,
  Empty,
  Spin,
  message,
  Modal,
  Descriptions,
  Table,
  Tooltip,
  Rate,
  Alert
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  HeartOutlined,
  HeartFilled,
  DollarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TrophyOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  StarOutlined,
  RiseOutlined,
  FallOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  BankOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { casePackageManagementAPI, MarketQueryParams } from '../../../services/casePackageManagementService';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

interface MarketPackage {
  id: number;
  packageCode: string;
  packageName: string;
  sourceOrgName: string;
  caseCount: number;
  totalAmount: number;
  remainingAmount: number;
  expectedRecoveryRate: number;
  regions: string[];
  debtTypes: string[];
  biddingEndTime: string;
  currentBidCount: number;
  minBidAmount: number;
  isFavorite: boolean;
  tags: string[];
  avgOverdueDays: number;
  description: string;
  publishedAt: string;
}

const CaseMarket: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<MarketPackage[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<MarketPackage | null>(null);
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<MarketQueryParams>({
    page: 0,
    size: 12,
    onlyBiddable: true
  });

  const [form] = Form.useForm();
  const [bidForm] = Form.useForm();

  useEffect(() => {
    loadMarketPackages();
  }, [filters]);

  const loadMarketPackages = async () => {
    setLoading(true);
    try {
      const response = await casePackageManagementAPI.getMarketPackages(filters);
      setPackages(response.data.content || []);
      const favoriteIds = new Set<number>(
        (response.data.content || [])
          .filter((pkg: MarketPackage) => pkg.isFavorite)
          .map((pkg: MarketPackage) => pkg.id as number)
      );
      setFavorites(favoriteIds);
    } catch (error) {
      message.error('加载案件市场失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (values: any) => {
    setFilters({
      ...filters,
      ...values,
      page: 0
    });
    setFilterVisible(false);
  };

  const toggleFavorite = async (packageId: number) => {
    try {
      await casePackageManagementAPI.toggleFavorite(packageId);
      const newFavorites = new Set(favorites);
      if (newFavorites.has(packageId)) {
        newFavorites.delete(packageId);
      } else {
        newFavorites.add(packageId);
      }
      setFavorites(newFavorites);
      message.success(newFavorites.has(packageId) ? '收藏成功' : '取消收藏');
    } catch (error) {
      message.error('操作失败');
    }
  };

  const showPackageDetail = (pkg: MarketPackage) => {
    setSelectedPackage(pkg);
    setDetailModalVisible(true);
  };

  const showBidModal = (pkg: MarketPackage) => {
    setSelectedPackage(pkg);
    setBidModalVisible(true);
    bidForm.resetFields();
  };

  const handleSubmitBid = async () => {
    try {
      const values = await bidForm.validateFields();
      const bidData = {
        casePackageId: selectedPackage!.id,
        ...values
      };
      await casePackageManagementAPI.submitBid(bidData);
      message.success('竞标提交成功');
      setBidModalVisible(false);
      loadMarketPackages();
    } catch (error) {
      message.error('竞标提交失败');
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const end = dayjs(endTime);
    const now = dayjs();
    const diff = end.diff(now, 'hour');
    
    if (diff < 0) return { text: '已结束', color: 'default' };
    if (diff < 24) return { text: `剩余${diff}小时`, color: 'error' };
    if (diff < 72) return { text: `剩余${Math.floor(diff / 24)}天`, color: 'warning' };
    return { text: `剩余${Math.floor(diff / 24)}天`, color: 'processing' };
  };

  const renderPackageCard = (pkg: MarketPackage) => {
    const timeInfo = getTimeRemaining(pkg.biddingEndTime);
    
    return (
      <Card
        hoverable
        actions={[
          <Button
            type="text"
            icon={favorites.has(pkg.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
            onClick={() => toggleFavorite(pkg.id)}
          >
            收藏
          </Button>,
          <Button type="text" onClick={() => showPackageDetail(pkg)}>
            查看详情
          </Button>,
          <Button type="primary" onClick={() => showBidModal(pkg)}>
            立即竞标
          </Button>
        ]}
        style={{ height: '100%' }}
      >
        <div style={{ minHeight: 280 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Badge.Ribbon text={timeInfo.text} color={timeInfo.color}>
                <Title level={5} style={{ marginBottom: 8 }}>
                  {pkg.packageName}
                </Title>
              </Badge.Ribbon>
              <Space size="small" wrap>
                <Tag icon={<BankOutlined />} color="blue">{pkg.sourceOrgName}</Tag>
                {pkg.tags.map(tag => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
            </div>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="案件数量"
                  value={pkg.caseCount}
                  suffix="件"
                  prefix={<TeamOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="总金额"
                  value={pkg.totalAmount}
                  precision={0}
                  prefix="¥"
                  suffix="万"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="预期回收率"
                  value={pkg.expectedRecoveryRate}
                  suffix="%"
                  prefix={<RiseOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="当前竞标"
                  value={pkg.currentBidCount}
                  suffix="家"
                  prefix={<TrophyOutlined />}
                />
              </Col>
            </Row>

            <div>
              <Space size="small" wrap>
                <Tag icon={<EnvironmentOutlined />}>
                  {pkg.regions.slice(0, 2).join('、')}
                  {pkg.regions.length > 2 && `等${pkg.regions.length}个地区`}
                </Tag>
                <Tag icon={<ClockCircleOutlined />}>
                  平均逾期{pkg.avgOverdueDays}天
                </Tag>
              </Space>
            </div>

            <Paragraph
              ellipsis={{ rows: 2, expandable: false }}
              type="secondary"
              style={{ marginBottom: 0 }}
            >
              {pkg.description || '暂无描述'}
            </Paragraph>
          </Space>
        </div>
      </Card>
    );
  };

  const renderFilterDrawer = () => (
    <Drawer
      title="筛选条件"
      placement="right"
      onClose={() => setFilterVisible(false)}
      visible={filterVisible}
      width={400}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSearch}
      >
        <Form.Item label="关键词" name="keyword">
          <Input placeholder="搜索案件包名称、描述等" />
        </Form.Item>

        <Form.Item label="案源机构" name="sourceOrgIds">
          <Select mode="multiple" placeholder="请选择案源机构">
            <Option value={1}>工商银行</Option>
            <Option value={2}>建设银行</Option>
            <Option value={3}>招商银行</Option>
          </Select>
        </Form.Item>

        <Form.Item label="金额范围">
          <Space>
            <Form.Item name="minAmount" noStyle>
              <InputNumber placeholder="最小金额" style={{ width: 150 }} />
            </Form.Item>
            <span>-</span>
            <Form.Item name="maxAmount" noStyle>
              <InputNumber placeholder="最大金额" style={{ width: 150 }} />
            </Form.Item>
          </Space>
        </Form.Item>

        <Form.Item label="案件数量">
          <Space>
            <Form.Item name="minCaseCount" noStyle>
              <InputNumber placeholder="最少" style={{ width: 150 }} />
            </Form.Item>
            <span>-</span>
            <Form.Item name="maxCaseCount" noStyle>
              <InputNumber placeholder="最多" style={{ width: 150 }} />
            </Form.Item>
          </Space>
        </Form.Item>

        <Form.Item label="地区" name="regions">
          <Select mode="multiple" placeholder="请选择地区">
            <Option value="北京">北京</Option>
            <Option value="上海">上海</Option>
            <Option value="广州">广州</Option>
            <Option value="深圳">深圳</Option>
          </Select>
        </Form.Item>

        <Form.Item label="债务类型" name="debtTypes">
          <Select mode="multiple" placeholder="请选择债务类型">
            <Option value="信用贷">信用贷</Option>
            <Option value="消费贷">消费贷</Option>
            <Option value="车贷">车贷</Option>
            <Option value="房贷">房贷</Option>
          </Select>
        </Form.Item>

        <Form.Item label="预期回收率">
          <Slider
            range
            marks={{
              0: '0%',
              25: '25%',
              50: '50%',
              75: '75%',
              100: '100%'
            }}
            defaultValue={[0, 100]}
          />
        </Form.Item>

        <Form.Item label="竞标截止时间" name="biddingEndDate">
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="onlyBiddable" valuePropName="checked">
          <Checkbox>仅显示可竞标案件包</Checkbox>
        </Form.Item>

        <Form.Item name="onlyFavorites" valuePropName="checked">
          <Checkbox>仅显示收藏的案件包</Checkbox>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              应用筛选
            </Button>
            <Button onClick={() => {
              form.resetFields();
              setFilters({ page: 0, size: 12, onlyBiddable: true });
            }}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Drawer>
  );

  const renderDetailModal = () => (
    <Modal
      title="案件包详情"
      visible={detailModalVisible}
      onCancel={() => setDetailModalVisible(false)}
      width={800}
      footer={[
        <Button key="close" onClick={() => setDetailModalVisible(false)}>
          关闭
        </Button>,
        <Button
          key="bid"
          type="primary"
          onClick={() => {
            setDetailModalVisible(false);
            showBidModal(selectedPackage!);
          }}
        >
          立即竞标
        </Button>
      ]}
    >
      {selectedPackage && (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Descriptions bordered column={2}>
            <Descriptions.Item label="案件包编号">{selectedPackage.packageCode}</Descriptions.Item>
            <Descriptions.Item label="案件包名称">{selectedPackage.packageName}</Descriptions.Item>
            <Descriptions.Item label="案源机构">{selectedPackage.sourceOrgName}</Descriptions.Item>
            <Descriptions.Item label="发布时间">{dayjs(selectedPackage.publishedAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
            <Descriptions.Item label="案件数量">{selectedPackage.caseCount} 件</Descriptions.Item>
            <Descriptions.Item label="总金额">¥{selectedPackage.totalAmount.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="剩余金额">¥{selectedPackage.remainingAmount.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="预期回收率">{selectedPackage.expectedRecoveryRate}%</Descriptions.Item>
            <Descriptions.Item label="平均逾期天数">{selectedPackage.avgOverdueDays} 天</Descriptions.Item>
            <Descriptions.Item label="竞标截止时间">
              <Tag color={getTimeRemaining(selectedPackage.biddingEndTime).color}>
                {dayjs(selectedPackage.biddingEndTime).format('YYYY-MM-DD HH:mm')}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="最低竞标金额">¥{selectedPackage.minBidAmount?.toLocaleString() || '无限制'}</Descriptions.Item>
            <Descriptions.Item label="当前竞标数">{selectedPackage.currentBidCount} 家</Descriptions.Item>
            <Descriptions.Item label="覆盖地区" span={2}>
              {selectedPackage.regions.map(region => (
                <Tag key={region}>{region}</Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="债务类型" span={2}>
              {selectedPackage.debtTypes.map(type => (
                <Tag key={type}>{type}</Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="案件包描述" span={2}>
              {selectedPackage.description || '暂无描述'}
            </Descriptions.Item>
          </Descriptions>

          <Card title="案件分布" size="small">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="信用贷"
                  value={45}
                  suffix="%"
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="消费贷"
                  value={35}
                  suffix="%"
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="其他"
                  value={20}
                  suffix="%"
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
            </Row>
          </Card>
        </Space>
      )}
    </Modal>
  );

  const renderBidModal = () => (
    <Modal
      title={`竞标 - ${selectedPackage?.packageName}`}
      visible={bidModalVisible}
      onCancel={() => setBidModalVisible(false)}
      onOk={handleSubmitBid}
      width={700}
      okText="提交竞标"
    >
      <Form
        form={bidForm}
        layout="vertical"
      >
        <Alert
          message="竞标须知"
          description="请仔细填写竞标信息，提交后不可修改。竞标结果将在截止时间后24小时内公布。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="bidAmount"
              label="竞标金额"
              rules={[
                { required: true, message: '请输入竞标金额' },
                {
                  validator: (_, value) => {
                    if (selectedPackage?.minBidAmount && value < selectedPackage.minBidAmount) {
                      return Promise.reject(`竞标金额不能低于${selectedPackage.minBidAmount}`);
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={selectedPackage?.minBidAmount || 0}
                formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => Number(value!.replace(/\¥\s?|(,*)/g, ''))}
                placeholder="请输入竞标金额"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="proposedRecoveryRate"
              label="承诺回收率"
              rules={[{ required: true, message: '请输入承诺回收率' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={100}
                formatter={value => `${value}%`}
                parser={value => {
                  const num = Number(value!.replace('%', ''));
                  return Math.min(Math.max(num, 0), 100) as any;
                }}
                placeholder="请输入承诺回收率"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="proposedDisposalDays"
              label="承诺处置天数"
              rules={[{ required: true, message: '请输入承诺处置天数' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                placeholder="请输入承诺处置天数"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="disposalStrategy"
              label="处置策略"
              rules={[{ required: true, message: '请选择处置策略' }]}
            >
              <Select placeholder="请选择处置策略">
                <Option value="MEDIATION">调解为主</Option>
                <Option value="LITIGATION">诉讼为主</Option>
                <Option value="MIXED">调解+诉讼</Option>
                <Option value="ASSET">资产处置</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="teamIntroduction"
          label="团队介绍"
          rules={[{ required: true, message: '请输入团队介绍' }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="请简要介绍您的处置团队情况"
          />
        </Form.Item>

        <Form.Item
          name="pastPerformance"
          label="过往业绩"
          rules={[{ required: true, message: '请输入过往业绩' }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="请说明类似案件的处置经验和业绩"
          />
        </Form.Item>

        <Form.Item
          name="proposal"
          label="处置方案"
          rules={[{ required: true, message: '请输入处置方案' }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="请详细说明您的处置方案"
          />
        </Form.Item>

        <Form.Item
          name="commitments"
          label="服务承诺"
        >
          <Input.TextArea
            rows={2}
            placeholder="请输入服务承诺（选填）"
          />
        </Form.Item>
      </Form>
    </Modal>
  );

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Row gutter={16} align="middle">
              <Col flex="auto">
                <Input.Search
                  placeholder="搜索案件包名称、机构、地区等"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  onSearch={(value) => setFilters({ ...filters, keyword: value, page: 0 })}
                />
              </Col>
              <Col>
                <Space>
                  <Select
                    style={{ width: 150 }}
                    placeholder="排序方式"
                    onChange={(value) => setFilters({ ...filters, sortBy: value, page: 0 })}
                  >
                    <Option value="publishedAt">最新发布</Option>
                    <Option value="biddingEndTime">即将截止</Option>
                    <Option value="totalAmount">金额最高</Option>
                    <Option value="caseCount">案件最多</Option>
                    <Option value="currentBidCount">竞标最多</Option>
                  </Select>
                  <Button
                    icon={<FilterOutlined />}
                    onClick={() => setFilterVisible(true)}
                  >
                    筛选
                  </Button>
                  <Button
                    icon={<HeartOutlined />}
                    onClick={() => navigate('/case-management/my-favorites')}
                  >
                    我的收藏
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <Card size="small">
                <Statistic
                  title="可竞标案件包"
                  value={packages.length}
                  prefix={<FileTextOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <Card size="small">
                <Statistic
                  title="总案件数"
                  value={packages.reduce((sum, pkg) => sum + pkg.caseCount, 0)}
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <Card size="small">
                <Statistic
                  title="总金额"
                  value={packages.reduce((sum, pkg) => sum + pkg.totalAmount, 0) / 10000}
                  suffix="万"
                  precision={0}
                  prefix={<DollarOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <Card size="small">
                <Statistic
                  title="平均回收率"
                  value={
                    packages.length > 0
                      ? packages.reduce((sum, pkg) => sum + pkg.expectedRecoveryRate, 0) / packages.length
                      : 0
                  }
                  suffix="%"
                  precision={1}
                  prefix={<RiseOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <Card size="small">
                <Statistic
                  title="今日新增"
                  value={12}
                  prefix={<ThunderboltOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <Card size="small">
                <Statistic
                  title="即将截止"
                  value={3}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        <Col span={24}>
          <Spin spinning={loading}>
            {packages.length === 0 ? (
              <Card>
                <Empty description="暂无可竞标的案件包" />
              </Card>
            ) : (
              <Row gutter={[16, 16]}>
                {packages.map(pkg => (
                  <Col key={pkg.id} xs={24} sm={12} lg={8} xl={6}>
                    {renderPackageCard(pkg)}
                  </Col>
                ))}
              </Row>
            )}
          </Spin>
        </Col>
      </Row>

      {renderFilterDrawer()}
      {renderDetailModal()}
      {renderBidModal()}
    </div>
  );
};

export default CaseMarket;