import React, { useState, useEffect } from 'react';
import {
  Modal,
  Card,
  Row,
  Col,
  Button,
  Space,
  Tag,
  Typography,
  Alert,
  Statistic,
  Progress,
  Descriptions,
  Divider,
  Tooltip,
  Badge,
  Radio,
  message,
  Spin
} from 'antd';
import {
  UserOutlined,
  FileProtectOutlined,
  BranchesOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  TrophyOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  StarOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { 
  DisposalMethod, 
  DisposalMethodConfig, 
  DisposalRecommendation,
  CaseDisposalInfo,
  DisposalPhase 
} from '../../types/disposal';

const { Title, Text, Paragraph } = Typography;

interface DisposalMethodSelectorProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (method: DisposalMethod, config: DisposalMethodConfig) => void;
  caseInfo: {
    id: string;
    caseNo: string;
    debtorName: string;
    remainingAmount: number;
    overdueDays: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    region: string;
    debtorContact: boolean;
  };
  currentDisposal?: CaseDisposalInfo;
}

const DisposalMethodSelector: React.FC<DisposalMethodSelectorProps> = ({
  visible,
  onCancel,
  onConfirm,
  caseInfo,
  currentDisposal
}) => {
  const [selectedMethod, setSelectedMethod] = useState<DisposalMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<DisposalRecommendation | null>(null);
  const [methodConfigs, setMethodConfigs] = useState<DisposalMethodConfig[]>([]);

  // 处置方式配置数据
  const defaultMethodConfigs: DisposalMethodConfig[] = [
    {
      method: DisposalMethod.MEDIATION,
      name: '调解处置',
      description: '通过调解中心进行纠纷解决，成本较低，时间较短，适合有还款意愿的债务人',
      icon: 'user',
      color: '#52c41a',
      avgDuration: 45,
      avgCost: 500,
      successRate: 0.68,
      applicableAmountRange: { min: 1000, max: 500000 },
      requiredDocuments: ['借款合同', '身份证明', '联系方式确认'],
      workflow: [DisposalPhase.PRE_MEDIATION, DisposalPhase.MEDIATION_ACTIVE, DisposalPhase.MEDIATION_COMPLETED]
    },
    {
      method: DisposalMethod.LITIGATION,
      name: '诉讼处置',
      description: '通过法院诉讼程序处理，具有强制执行力，适合金额较大或调解无效的案件',
      icon: 'file-protect',
      color: '#ff4d4f',
      avgDuration: 180,
      avgCost: 3000,
      successRate: 0.75,
      applicableAmountRange: { min: 10000, max: 10000000 },
      requiredDocuments: ['借款合同', '身份证明', '催收记录', '财产线索'],
      workflow: [DisposalPhase.PRE_LITIGATION, DisposalPhase.LITIGATION_FILED, DisposalPhase.LITIGATION_ACTIVE, DisposalPhase.JUDGMENT, DisposalPhase.EXECUTION]
    },
    {
      method: DisposalMethod.MIXED,
      name: '混合处置',
      description: '先尝试调解，失败后转入诉讼程序，综合性策略，最大化处置效果',
      icon: 'branches',
      color: '#1890ff',
      avgDuration: 120,
      avgCost: 2000,
      successRate: 0.72,
      applicableAmountRange: { min: 5000, max: 2000000 },
      requiredDocuments: ['借款合同', '身份证明', '联系方式确认', '财产线索'],
      workflow: [DisposalPhase.PRE_MEDIATION, DisposalPhase.MEDIATION_ACTIVE, DisposalPhase.PRE_LITIGATION, DisposalPhase.LITIGATION_ACTIVE, DisposalPhase.EXECUTION]
    }
  ];

  useEffect(() => {
    if (visible) {
      setMethodConfigs(defaultMethodConfigs);
      generateRecommendation();
      
      // 如果已有处置方式，设为默认选中
      if (currentDisposal) {
        setSelectedMethod(currentDisposal.disposalMethod);
      }
    }
  }, [visible, caseInfo]);

  // 生成智能推荐
  const generateRecommendation = async () => {
    setLoading(true);
    try {
      // 模拟AI推荐算法
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let recommendedMethod: DisposalMethod;
      let confidence: number;
      let reasons: string[] = [];

      const { remainingAmount, overdueDays, riskLevel, debtorContact } = caseInfo;

      // 推荐逻辑
      if (remainingAmount < 10000 && debtorContact) {
        recommendedMethod = DisposalMethod.MEDIATION;
        confidence = 0.85;
        reasons = [
          '金额较小，调解成本效益高',
          '债务人有联系，沟通基础良好',
          '调解周期短，资源占用少'
        ];
      } else if (remainingAmount > 100000 || riskLevel === 'HIGH') {
        recommendedMethod = DisposalMethod.LITIGATION;
        confidence = 0.90;
        reasons = [
          '金额较大，值得诉讼投入',
          '风险等级高，需要强制执行力',
          '诉讼胜诉率较高'
        ];
      } else {
        recommendedMethod = DisposalMethod.MIXED;
        confidence = 0.78;
        reasons = [
          '金额适中，可先尝试调解',
          '调解失败可转诉讼，策略灵活',
          '综合考虑成本和效果的最优选择'
        ];
      }

      const mockRecommendation: DisposalRecommendation = {
        caseId: caseInfo.id,
        recommendedMethod,
        confidence,
        reasons,
        alternatives: [
          {
            method: DisposalMethod.MEDIATION,
            score: 0.75,
            pros: ['成本低', '时间短', '维护关系'],
            cons: ['强制力弱', '适用范围有限']
          },
          {
            method: DisposalMethod.LITIGATION,
            score: 0.85,
            pros: ['执行力强', '法律保障', '威慑效果'],
            cons: ['成本高', '周期长', '程序复杂']
          }
        ].filter(alt => alt.method !== recommendedMethod),
        estimatedOutcome: {
          successProbability: confidence,
          expectedDuration: defaultMethodConfigs.find(c => c.method === recommendedMethod)?.avgDuration || 90,
          expectedCost: defaultMethodConfigs.find(c => c.method === recommendedMethod)?.avgCost || 1500,
          expectedRecoveryAmount: remainingAmount * confidence * 0.8
        }
      };

      setRecommendation(mockRecommendation);
      setSelectedMethod(recommendedMethod);
    } catch (error) {
      message.error('获取处置建议失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取方式图标
  const getMethodIcon = (method: DisposalMethod) => {
    switch (method) {
      case DisposalMethod.MEDIATION:
        return <UserOutlined style={{ fontSize: 24 }} />;
      case DisposalMethod.LITIGATION:
        return <FileProtectOutlined style={{ fontSize: 24 }} />;
      case DisposalMethod.MIXED:
        return <BranchesOutlined style={{ fontSize: 24 }} />;
      default:
        return <InfoCircleOutlined style={{ fontSize: 24 }} />;
    }
  };

  // 确认选择
  const handleConfirm = () => {
    if (!selectedMethod) {
      message.warning('请选择处置方式');
      return;
    }

    const config = methodConfigs.find(c => c.method === selectedMethod);
    if (!config) {
      message.error('配置信息缺失');
      return;
    }

    onConfirm(selectedMethod, config);
  };

  // 渲染推荐卡片
  const renderRecommendationCard = () => {
    if (!recommendation) return null;

    const config = methodConfigs.find(c => c.method === recommendation.recommendedMethod);
    if (!config) return null;

    return (
      <Card 
        size="small" 
        title={
          <Space>
            <ThunderboltOutlined style={{ color: '#faad14' }} />
            <span>AI智能推荐</span>
            <Badge count="推荐" style={{ backgroundColor: '#52c41a' }} />
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16}>
          <Col span={16}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                {getMethodIcon(recommendation.recommendedMethod)}
                <Text strong style={{ fontSize: 16 }}>{config.name}</Text>
                <Tag color="green">置信度: {(recommendation.confidence * 100).toFixed(0)}%</Tag>
              </Space>
              <Text type="secondary">{config.description}</Text>
              <div>
                <Text strong>推荐理由：</Text>
                <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                  {recommendation.reasons.map((reason, index) => (
                    <li key={index}><Text>{reason}</Text></li>
                  ))}
                </ul>
              </div>
            </Space>
          </Col>
          <Col span={8}>
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Statistic
                  title="预期周期"
                  value={recommendation.estimatedOutcome.expectedDuration}
                  suffix="天"
                  valueStyle={{ fontSize: 14 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="预期成本"
                  value={recommendation.estimatedOutcome.expectedCost}
                  prefix="¥"
                  valueStyle={{ fontSize: 14 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="成功率"
                  value={(recommendation.estimatedOutcome.successProbability * 100).toFixed(0)}
                  suffix="%"
                  valueStyle={{ fontSize: 14 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="预期回款"
                  value={recommendation.estimatedOutcome.expectedRecoveryAmount}
                  prefix="¥"
                  valueStyle={{ fontSize: 14 }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    );
  };

  // 渲染方式选择卡片
  const renderMethodCard = (config: DisposalMethodConfig) => {
    const isSelected = selectedMethod === config.method;
    const isRecommended = recommendation?.recommendedMethod === config.method;

    return (
      <Card
        key={config.method}
        hoverable
        className={isSelected ? 'disposal-method-selected' : ''}
        style={{
          border: isSelected ? `2px solid ${config.color}` : '1px solid #f0f0f0',
          position: 'relative'
        }}
        bodyStyle={{ padding: '16px' }}
        onClick={() => setSelectedMethod(config.method)}
      >
        {isRecommended && (
          <div style={{
            position: 'absolute',
            top: -1,
            right: -1,
            background: '#faad14',
            color: 'white',
            padding: '2px 8px',
            fontSize: '12px',
            borderRadius: '0 4px 0 8px'
          }}>
            <StarOutlined /> 推荐
          </div>
        )}

        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {/* 标题区域 */}
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <div style={{ color: config.color }}>
                {getMethodIcon(config.method)}
              </div>
              <div>
                <Text strong style={{ fontSize: 16 }}>{config.name}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {config.description}
                </Text>
              </div>
            </Space>
            {isSelected && (
              <CheckCircleOutlined style={{ color: config.color, fontSize: 20 }} />
            )}
          </Space>

          {/* 统计数据 */}
          <Row gutter={8}>
            <Col span={8}>
              <Statistic
                title="平均周期"
                value={config.avgDuration}
                suffix="天"
                valueStyle={{ fontSize: 14, color: config.color }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="平均成本"
                value={config.avgCost}
                prefix="¥"
                valueStyle={{ fontSize: 14, color: config.color }}
              />
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>成功率</Text>
                <div>
                  <Text strong style={{ color: config.color }}>
                    {(config.successRate * 100).toFixed(0)}%
                  </Text>
                </div>
              </div>
            </Col>
          </Row>

          {/* 进度条显示适用性 */}
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              适用金额范围: ¥{config.applicableAmountRange.min.toLocaleString()} - ¥{config.applicableAmountRange.max.toLocaleString()}
            </Text>
            <Progress
              percent={
                caseInfo.remainingAmount >= config.applicableAmountRange.min &&
                caseInfo.remainingAmount <= config.applicableAmountRange.max ? 100 : 50
              }
              size="small"
              strokeColor={config.color}
              showInfo={false}
              style={{ marginTop: 4 }}
            />
          </div>

          {/* 必需文档 */}
          <div>
            <Text type="secondary" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>
              必需文档:
            </Text>
            <Space wrap>
              {config.requiredDocuments.map(doc => (
                <Tag key={doc}>{doc}</Tag>
              ))}
            </Space>
          </div>
        </Space>
      </Card>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <TrophyOutlined />
          <span>选择处置方式</span>
          <Tag color="blue">{caseInfo.caseNo}</Tag>
        </Space>
      }
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button
          key="confirm"
          type="primary"
          onClick={handleConfirm}
          disabled={!selectedMethod}
        >
          确认选择
        </Button>
      ]}
      width={1000}
      bodyStyle={{ maxHeight: 'calc(80vh - 110px)', overflowY: 'auto' }}
    >
      <Spin spinning={loading} tip="AI正在分析最优处置方案...">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* 案件信息概览 */}
          <Card title="案件信息" size="small">
            <Descriptions column={4} size="small">
              <Descriptions.Item label="债务人">{caseInfo.debtorName}</Descriptions.Item>
              <Descriptions.Item label="剩余金额">¥{caseInfo.remainingAmount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="逾期天数">{caseInfo.overdueDays}天</Descriptions.Item>
              <Descriptions.Item label="风险等级">
                <Tag color={
                  caseInfo.riskLevel === 'LOW' ? 'green' :
                  caseInfo.riskLevel === 'MEDIUM' ? 'orange' : 'red'
                }>
                  {caseInfo.riskLevel === 'LOW' ? '低风险' :
                   caseInfo.riskLevel === 'MEDIUM' ? '中风险' : '高风险'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="所在地区">{caseInfo.region}</Descriptions.Item>
              <Descriptions.Item label="联系状态">
                <Tag color={caseInfo.debtorContact ? 'green' : 'red'}>
                  {caseInfo.debtorContact ? '可联系' : '失联'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* AI推荐 */}
          {renderRecommendationCard()}

          {/* 处置方式选择 */}
          <div>
            <Title level={5}>
              <Space>
                <InfoCircleOutlined />
                选择处置方式
              </Space>
            </Title>
            <Row gutter={16}>
              {methodConfigs.map(config => (
                <Col span={8} key={config.method}>
                  {renderMethodCard(config)}
                </Col>
              ))}
            </Row>
          </div>

          {/* 当前选择信息 */}
          {selectedMethod && (
            <Alert
              message={
                <Space>
                  <span>已选择:</span>
                  <Text strong>
                    {methodConfigs.find(c => c.method === selectedMethod)?.name}
                  </Text>
                  {recommendation?.recommendedMethod === selectedMethod && (
                    <Tag color="green">
                      <StarOutlined /> AI推荐
                    </Tag>
                  )}
                </Space>
              }
              type="info"
              showIcon
            />
          )}
        </Space>
      </Spin>

    </Modal>
  );
};

export default DisposalMethodSelector;