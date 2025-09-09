import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Space,
  Button,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Descriptions,
  Timeline,
  Badge,
  Typography,
  Divider,
  Alert,
  Tabs,
  Rate,
  message,
  Popconfirm,
  Avatar,
  Tooltip,
  Form,
  InputNumber,
  Input,
  Select,
  Checkbox
} from 'antd';
import {
  TrophyOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalculatorOutlined,
  BankOutlined,
  TeamOutlined,
  RiseOutlined,
  StarOutlined,
  StarFilled,
  SolutionOutlined,
  AuditOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { casePackageManagementAPI, CasePackageBid } from '../../../../services/casePackageManagementService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface BiddingEvaluationModalProps {
  open: boolean;
  packageId: number;
  packageName: string;
  totalAmount: number;
  caseCount: number;
  onCancel: () => void;
  onSuccess: () => void;
}

interface EvaluationCriteria {
  priceWeight: number;
  technicalWeight: number;
  experienceWeight: number;
  proposalWeight: number;
  recoveryRateWeight: number;
}

const BiddingEvaluationModal: React.FC<BiddingEvaluationModalProps> = ({
  open,
  packageId,
  packageName,
  totalAmount,
  caseCount,
  onCancel,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [bids, setBids] = useState<CasePackageBid[]>([]);
  const [selectedBidId, setSelectedBidId] = useState<number | null>(null);
  const [evaluationMode, setEvaluationMode] = useState<'auto' | 'manual'>('auto');
  const [activeTab, setActiveTab] = useState('overview');
  const [evaluationCriteria, setEvaluationCriteria] = useState<EvaluationCriteria>({
    priceWeight: 30,
    technicalWeight: 25,
    experienceWeight: 20,
    proposalWeight: 15,
    recoveryRateWeight: 10
  });
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      loadBids();
    }
  }, [open, packageId]);

  const loadBids = async () => {
    setLoading(true);
    try {
      const response = await casePackageManagementAPI.getBidList(packageId);
      const evaluatedBids = calculateScores(response || []);
      setBids(evaluatedBids);
    } catch (error) {
      message.error('加载竞标列表失败');
    } finally {
      setLoading(false);
    }
  };

  const calculateScores = (bidList: CasePackageBid[]): CasePackageBid[] => {
    if (bidList.length === 0) return [];

    // 计算各项得分
    const maxBidAmount = Math.max(...bidList.map(b => b.bidAmount));
    const minBidAmount = Math.min(...bidList.map(b => b.bidAmount));
    const maxRecoveryRate = Math.max(...bidList.map(b => b.proposedRecoveryRate));
    const minDisposalDays = Math.min(...bidList.map(b => b.proposedDisposalDays));

    return bidList.map(bid => {
      // 价格得分（竞标金额越高越好）
      const priceScore = minBidAmount === maxBidAmount ? 100 :
        ((bid.bidAmount - minBidAmount) / (maxBidAmount - minBidAmount)) * 100;
      
      // 技术得分（基于处置天数）
      const technicalScore = bid.proposedDisposalDays === minDisposalDays ? 100 :
        Math.max(0, 100 - ((bid.proposedDisposalDays - minDisposalDays) / minDisposalDays) * 50);
      
      // 承诺回收率得分
      const recoveryScore = (bid.proposedRecoveryRate / maxRecoveryRate) * 100;
      
      // 综合得分
      const comprehensiveScore = 
        (priceScore * evaluationCriteria.priceWeight +
         technicalScore * evaluationCriteria.technicalWeight +
         recoveryScore * evaluationCriteria.recoveryRateWeight +
         80 * evaluationCriteria.experienceWeight + // 模拟经验分
         75 * evaluationCriteria.proposalWeight) / 100; // 模拟方案分

      return {
        ...bid,
        priceScore: Math.round(priceScore),
        technicalScore: Math.round(technicalScore),
        comprehensiveScore: Math.round(comprehensiveScore),
        ranking: 0 // 将在排序后设置
      };
    }).sort((a, b) => (b.comprehensiveScore || 0) - (a.comprehensiveScore || 0))
      .map((bid, index) => ({ ...bid, ranking: index + 1 }));
  };

  const handleSelectWinner = async () => {
    if (!selectedBidId) {
      message.warning('请选择中标方');
      return;
    }

    try {
      setLoading(true);
      await casePackageManagementAPI.selectWinner(packageId, selectedBidId);
      message.success('选择中标方成功');
      onSuccess();
    } catch (error) {
      message.error('选择中标方失败');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<CasePackageBid> = [
    {
      title: '排名',
      dataIndex: 'ranking',
      key: 'ranking',
      width: 80,
      fixed: 'left',
      render: (ranking: number) => {
        const icons = {
          1: <TrophyOutlined style={{ color: '#ffd700' }} />,
          2: <TrophyOutlined style={{ color: '#c0c0c0' }} />,
          3: <TrophyOutlined style={{ color: '#cd7f32' }} />
        };
        return (
          <Space>
            {icons[ranking as keyof typeof icons]}
            <Text strong>#{ranking}</Text>
          </Space>
        );
      }
    },
    {
      title: '处置机构',
      dataIndex: 'disposalOrgName',
      key: 'disposalOrgName',
      width: 200,
      fixed: 'left',
      render: (name: string, record) => (
        <Space>
          <Avatar icon={<BankOutlined />} />
          <div>
            <Text strong>{name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              提交时间: {dayjs(record.submittedAt).format('MM-DD HH:mm')}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: '竞标金额',
      dataIndex: 'bidAmount',
      key: 'bidAmount',
      width: 150,
      sorter: (a, b) => a.bidAmount - b.bidAmount,
      render: (amount: number) => (
        <Statistic
          value={amount}
          prefix="¥"
          precision={0}
          valueStyle={{ fontSize: 16 }}
        />
      )
    },
    {
      title: '承诺回收率',
      dataIndex: 'proposedRecoveryRate',
      key: 'proposedRecoveryRate',
      width: 120,
      sorter: (a, b) => a.proposedRecoveryRate - b.proposedRecoveryRate,
      render: (rate: number) => (
        <Progress
          percent={rate}
          size="small"
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
        />
      )
    },
    {
      title: '处置周期',
      dataIndex: 'proposedDisposalDays',
      key: 'proposedDisposalDays',
      width: 100,
      sorter: (a, b) => a.proposedDisposalDays - b.proposedDisposalDays,
      render: (days: number) => (
        <Tag color={days <= 30 ? 'green' : days <= 60 ? 'orange' : 'red'}>
          {days}天
        </Tag>
      )
    },
    {
      title: '评分',
      key: 'scores',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text style={{ fontSize: 12 }}>价格分: {record.priceScore || 0}</Text>
          <Text style={{ fontSize: 12 }}>技术分: {record.technicalScore || 0}</Text>
          <Progress
            percent={record.comprehensiveScore || 0}
            size="small"
            format={percent => `综合: ${percent}`}
          />
        </Space>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Button
            type={selectedBidId === record.id ? 'primary' : 'default'}
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => setSelectedBidId(record.id)}
            block
          >
            {selectedBidId === record.id ? '已选择' : '选为中标'}
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => viewBidDetail(record)}
          >
            查看详情
          </Button>
        </Space>
      )
    }
  ];

  const viewBidDetail = (bid: CasePackageBid) => {
    Modal.info({
      title: `竞标详情 - ${bid.disposalOrgName}`,
      width: 800,
      content: (
        <Descriptions bordered column={2} size="small" style={{ marginTop: 16 }}>
          <Descriptions.Item label="竞标金额" span={1}>
            ¥{bid.bidAmount.toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="承诺回收率" span={1}>
            {bid.proposedRecoveryRate}%
          </Descriptions.Item>
          <Descriptions.Item label="承诺处置天数" span={1}>
            {bid.proposedDisposalDays}天
          </Descriptions.Item>
          <Descriptions.Item label="处置策略" span={1}>
            {bid.disposalStrategy}
          </Descriptions.Item>
          <Descriptions.Item label="团队介绍" span={2}>
            {bid.teamIntroduction}
          </Descriptions.Item>
          <Descriptions.Item label="过往业绩" span={2}>
            {bid.pastPerformance}
          </Descriptions.Item>
          <Descriptions.Item label="处置方案" span={2}>
            {bid.proposal}
          </Descriptions.Item>
          <Descriptions.Item label="服务承诺" span={2}>
            {bid.commitments}
          </Descriptions.Item>
        </Descriptions>
      ),
      okText: '关闭'
    });
  };

  const renderOverviewTab = () => (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="参与竞标"
              value={bids.length}
              suffix="家"
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="最高出价"
              value={Math.max(...bids.map(b => b.bidAmount), 0)}
              prefix="¥"
              precision={0}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均回收率"
              value={bids.length > 0 ? 
                bids.reduce((sum, b) => sum + b.proposedRecoveryRate, 0) / bids.length : 0}
              suffix="%"
              precision={1}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="最短周期"
              value={Math.min(...bids.map(b => b.proposedDisposalDays), 999)}
              suffix="天"
            />
          </Card>
        </Col>
      </Row>

      <Card title="竞标排行榜">
        <Table
          columns={columns}
          dataSource={bids}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={false}
          rowClassName={(record) => 
            record.ranking === 1 ? 'highlight-row' : ''
          }
        />
      </Card>

      {selectedBidId && (
        <Alert
          message="已选择中标方"
          description={
            <Space>
              <Text>
                您已选择 
                <Text strong>
                  {bids.find(b => b.id === selectedBidId)?.disposalOrgName}
                </Text>
                作为中标方
              </Text>
            </Space>
          }
          type="success"
          showIcon
        />
      )}
    </Space>
  );

  const renderComparisonTab = () => {
    const top3Bids = bids.slice(0, 3);
    
    return (
      <div>
        <Alert
          message="对比说明"
          description="系统自动展示综合得分前三名的竞标方案对比"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Row gutter={16}>
          {top3Bids.map((bid, index) => (
            <Col span={8} key={bid.id}>
              <Card
                title={
                  <Space>
                    <Badge count={`第${index + 1}名`} style={{ backgroundColor: index === 0 ? '#52c41a' : '#1890ff' }} />
                    {bid.disposalOrgName}
                  </Space>
                }
                extra={
                  <Button
                    type={selectedBidId === bid.id ? 'primary' : 'default'}
                    size="small"
                    onClick={() => setSelectedBidId(bid.id)}
                  >
                    {selectedBidId === bid.id ? '已选择' : '选择'}
                  </Button>
                }
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div>
                    <Text type="secondary">竞标金额</Text>
                    <Title level={4}>¥{bid.bidAmount.toLocaleString()}</Title>
                  </div>
                  
                  <div>
                    <Text type="secondary">承诺回收率</Text>
                    <Progress percent={bid.proposedRecoveryRate} />
                  </div>
                  
                  <div>
                    <Text type="secondary">处置周期</Text>
                    <div>
                      <Tag color={bid.proposedDisposalDays <= 30 ? 'green' : 'orange'}>
                        {bid.proposedDisposalDays}天
                      </Tag>
                    </div>
                  </div>
                  
                  <div>
                    <Text type="secondary">综合得分</Text>
                    <div>
                      <Rate disabled value={bid.comprehensiveScore! / 20} />
                      <Text strong style={{ marginLeft: 8 }}>
                        {bid.comprehensiveScore}分
                      </Text>
                    </div>
                  </div>
                  
                  <Divider />
                  
                  <div>
                    <Text type="secondary">处置策略</Text>
                    <Paragraph ellipsis={{ rows: 2 }}>
                      {bid.disposalStrategy || '暂无'}
                    </Paragraph>
                  </div>
                  
                  <div>
                    <Text type="secondary">核心优势</Text>
                    <Paragraph ellipsis={{ rows: 3 }}>
                      {bid.teamIntroduction || '暂无'}
                    </Paragraph>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  const renderScoringTab = () => (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card title="评分权重配置">
        <Form
          layout="vertical"
          initialValues={evaluationCriteria}
          onValuesChange={(_, values) => {
            setEvaluationCriteria(values);
            const evaluatedBids = calculateScores(bids);
            setBids(evaluatedBids);
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="priceWeight"
                label="价格权重"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  formatter={value => `${value}%`}
                  parser={value => {
                    const num = Number(value!.replace('%', ''));
                    return Math.min(Math.max(num, 0), 100) as any;
                  }}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="technicalWeight"
                label="技术权重"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  formatter={value => `${value}%`}
                  parser={value => {
                    const num = Number(value!.replace('%', ''));
                    return Math.min(Math.max(num, 0), 100) as any;
                  }}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="experienceWeight"
                label="经验权重"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  formatter={value => `${value}%`}
                  parser={value => {
                    const num = Number(value!.replace('%', ''));
                    return Math.min(Math.max(num, 0), 100) as any;
                  }}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="proposalWeight"
                label="方案权重"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  formatter={value => `${value}%`}
                  parser={value => {
                    const num = Number(value!.replace('%', ''));
                    return Math.min(Math.max(num, 0), 100) as any;
                  }}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="recoveryRateWeight"
                label="回收率权重"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  formatter={value => `${value}%`}
                  parser={value => {
                    const num = Number(value!.replace('%', ''));
                    return Math.min(Math.max(num, 0), 100) as any;
                  }}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Alert
                message={`总权重: ${Object.values(evaluationCriteria).reduce((a, b) => a + b, 0)}%`}
                type={Object.values(evaluationCriteria).reduce((a, b) => a + b, 0) === 100 ? 'success' : 'warning'}
              />
            </Col>
          </Row>
        </Form>
      </Card>

      <Card title="评分细则">
        <Timeline>
          <Timeline.Item dot={<DollarOutlined />} color="blue">
            <Text strong>价格评分</Text>
            <br />
            <Text type="secondary">竞标金额越高，得分越高。最高价得100分，其他按比例计算</Text>
          </Timeline.Item>
          <Timeline.Item dot={<CalculatorOutlined />} color="green">
            <Text strong>技术评分</Text>
            <br />
            <Text type="secondary">基于承诺处置天数，天数越少得分越高</Text>
          </Timeline.Item>
          <Timeline.Item dot={<SafetyCertificateOutlined />} color="orange">
            <Text strong>经验评分</Text>
            <br />
            <Text type="secondary">基于历史处置业绩、成功率等因素综合评定</Text>
          </Timeline.Item>
          <Timeline.Item dot={<SolutionOutlined />} color="purple">
            <Text strong>方案评分</Text>
            <br />
            <Text type="secondary">评估处置方案的可行性、创新性和完整性</Text>
          </Timeline.Item>
          <Timeline.Item dot={<RiseOutlined />} color="red">
            <Text strong>回收率评分</Text>
            <br />
            <Text type="secondary">承诺回收率越高，得分越高</Text>
          </Timeline.Item>
        </Timeline>
      </Card>
    </Space>
  );

  return (
    <Modal
      title={
        <Space>
          <TrophyOutlined />
          竞标评估 - {packageName}
        </Space>
      }
      open={open}
      onCancel={onCancel}
      width={1200}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Popconfirm
          key="confirm"
          title="确认选择中标方"
          description={`确定选择 ${bids.find(b => b.id === selectedBidId)?.disposalOrgName} 作为中标方吗？`}
          onConfirm={handleSelectWinner}
          disabled={!selectedBidId}
        >
          <Button type="primary" loading={loading} disabled={!selectedBidId}>
            确认中标
          </Button>
        </Popconfirm>
      ]}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'overview',
            label: '竞标概览',
            children: renderOverviewTab()
          },
          {
            key: 'comparison',
            label: '方案对比',
            children: renderComparisonTab()
          },
          {
            key: 'scoring',
            label: '评分规则',
            children: renderScoringTab()
          }
        ]}
      />
    </Modal>
  );
};

export default BiddingEvaluationModal;