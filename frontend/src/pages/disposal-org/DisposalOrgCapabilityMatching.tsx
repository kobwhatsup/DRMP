import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Space, Modal, Form, Select, InputNumber,
  Tag, Progress, Statistic, Row, Col, Divider, Typography,
  Input, DatePicker, Alert, Tooltip, Rate, Badge
} from 'antd';
import {
  SearchOutlined, FilterOutlined, SettingOutlined, 
  ThunderboltOutlined, TeamOutlined, DollarOutlined,
  EnvironmentOutlined, ClockCircleOutlined, TrophyOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface CasePackage {
  id: number;
  name: string;
  sourceOrgName: string;
  caseCount: number;
  totalAmount: number;
  avgAmount: number;
  urgencyLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  regions: string[];
  businessTypes: string[];
  publishedAt: string;
  deadline: string;
  requirements: {
    minTeamSize: number;
    minCapacity: number;
    requiredQualifications: string[];
    preferredSettlement: string[];
  };
}

interface DisposalOrg {
  id: number;
  orgName: string;
  orgType: string;
  regions: string[];
  teamSize: number;
  monthlyCapacity: number;
  currentLoad: number;
  businessScope: string[];
  disposalTypes: string[];
  settlementMethods: string[];
  qualifications: string[];
  performance: {
    completedCases: number;
    avgRecoveryRate: number;
    avgProcessingTime: number;
    rating: number;
    reputation: number;
  };
  status: 'ACTIVE' | 'BUSY' | 'FULL';
  membershipStatus: 'ACTIVE' | 'EXPIRED';
  lastActiveAt: string;
}

interface MatchingRule {
  id: string;
  name: string;
  priority: number;
  enabled: boolean;
  criteria: {
    regionWeight: number;
    capacityWeight: number;
    performanceWeight: number;
    specialtyWeight: number;
    costWeight: number;
  };
}

const DisposalOrgCapabilityMatching: React.FC = () => {
  const [casePackages, setCasePackages] = useState<CasePackage[]>([]);
  const [disposalOrgs, setDisposalOrgs] = useState<DisposalOrg[]>([]);
  const [matchingRules, setMatchingRules] = useState<MatchingRule[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<CasePackage | null>(null);
  const [matchingResults, setMatchingResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [matchingModalVisible, setMatchingModalVisible] = useState(false);
  const [ruleConfigVisible, setRuleConfigVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCasePackages();
    loadDisposalOrgs();
    loadMatchingRules();
  }, []);

  const loadCasePackages = async () => {
    // 模拟加载案件包数据
    const mockPackages: CasePackage[] = [
      {
        id: 1,
        name: '工商银行个贷不良包-202407',
        sourceOrgName: '中国工商银行',
        caseCount: 1200,
        totalAmount: 18000000,
        avgAmount: 15000,
        urgencyLevel: 'HIGH',
        regions: ['北京', '天津', '河北'],
        businessTypes: ['BANK'],
        publishedAt: '2024-07-01',
        deadline: '2024-07-15',
        requirements: {
          minTeamSize: 20,
          minCapacity: 500,
          requiredQualifications: ['mediation_license', 'legal_practice'],
          preferredSettlement: ['HALF_RISK']
        }
      },
      {
        id: 2,
        name: '消费金融不良案件包-Q2',
        sourceOrgName: '某消费金融公司',
        caseCount: 800,
        totalAmount: 9600000,
        avgAmount: 12000,
        urgencyLevel: 'MEDIUM',
        regions: ['上海', '江苏', '浙江'],
        businessTypes: ['CONSUMER_FINANCE'],
        publishedAt: '2024-06-15',
        deadline: '2024-07-30',
        requirements: {
          minTeamSize: 15,
          minCapacity: 300,
          requiredQualifications: ['mediation_license'],
          preferredSettlement: ['FULL_RISK', 'HALF_RISK']
        }
      }
    ];
    setCasePackages(mockPackages);
  };

  const loadDisposalOrgs = async () => {
    // 模拟加载处置机构数据
    const mockOrgs: DisposalOrg[] = [
      {
        id: 1,
        orgName: '北京朝阳调解中心',
        orgType: 'MEDIATION_CENTER',
        regions: ['北京', '天津', '河北'],
        teamSize: 45,
        monthlyCapacity: 1200,
        currentLoad: 65,
        businessScope: ['BANK', 'CONSUMER_FINANCE'],
        disposalTypes: ['MEDIATION', 'LITIGATION'],
        settlementMethods: ['HALF_RISK'],
        qualifications: ['mediation_license', 'legal_practice'],
        performance: {
          completedCases: 15000,
          avgRecoveryRate: 68,
          avgProcessingTime: 45,
          rating: 4.8,
          reputation: 92
        },
        status: 'ACTIVE',
        membershipStatus: 'ACTIVE',
        lastActiveAt: '2024-07-30 15:30:00'
      },
      {
        id: 2,
        orgName: '上海融盛律师事务所',
        orgType: 'LAW_FIRM',
        regions: ['上海', '江苏', '浙江'],
        teamSize: 32,
        monthlyCapacity: 800,
        currentLoad: 45,
        businessScope: ['BANK', 'CONSUMER_FINANCE', 'ONLINE_LOAN'],
        disposalTypes: ['LITIGATION', 'ARBITRATION'],
        settlementMethods: ['FULL_RISK', 'HALF_RISK'],
        qualifications: ['legal_practice', 'arbitration_qualification'],
        performance: {
          completedCases: 8500,
          avgRecoveryRate: 72,
          avgProcessingTime: 38,
          rating: 4.6,
          reputation: 88
        },
        status: 'ACTIVE',
        membershipStatus: 'ACTIVE',
        lastActiveAt: '2024-07-30 11:20:00'
      }
    ];
    setDisposalOrgs(mockOrgs);
  };

  const loadMatchingRules = async () => {
    // 模拟加载匹配规则
    const mockRules: MatchingRule[] = [
      {
        id: 'region_priority',
        name: '地域优先匹配',
        priority: 1,
        enabled: true,
        criteria: {
          regionWeight: 40,
          capacityWeight: 25,
          performanceWeight: 20,
          specialtyWeight: 10,
          costWeight: 5
        }
      },
      {
        id: 'performance_priority',
        name: '业绩优先匹配',
        priority: 2,
        enabled: true,
        criteria: {
          regionWeight: 20,
          capacityWeight: 20,
          performanceWeight: 40,
          specialtyWeight: 15,
          costWeight: 5
        }
      }
    ];
    setMatchingRules(mockRules);
  };

  const calculateMatchingScore = (casePackage: CasePackage, org: DisposalOrg, rule: MatchingRule) => {
    let score = 0;
    
    // 地域匹配分数
    const regionMatch = casePackage.regions.some(region => org.regions.includes(region));
    const regionScore = regionMatch ? 100 : 0;
    
    // 容量匹配分数
    const availableCapacity = org.monthlyCapacity * (1 - org.currentLoad / 100);
    const capacityScore = Math.min(100, (availableCapacity / casePackage.requirements.minCapacity) * 100);
    
    // 业绩匹配分数
    const performanceScore = (org.performance.avgRecoveryRate + org.performance.rating * 20) / 2;
    
    // 专业匹配分数
    const specialtyMatch = casePackage.businessTypes.some(type => org.businessScope.includes(type));
    const specialtyScore = specialtyMatch ? 100 : 0;
    
    // 成本匹配分数（结算方式）
    const settlementMatch = casePackage.requirements.preferredSettlement.some(method => 
      org.settlementMethods.includes(method)
    );
    const costScore = settlementMatch ? 100 : 50;
    
    // 加权计算总分
    score = (
      regionScore * rule.criteria.regionWeight / 100 +
      capacityScore * rule.criteria.capacityWeight / 100 +
      performanceScore * rule.criteria.performanceWeight / 100 +
      specialtyScore * rule.criteria.specialtyWeight / 100 +
      costScore * rule.criteria.costWeight / 100
    );
    
    return Math.round(score);
  };

  const handleMatchingAnalysis = (casePackage: CasePackage) => {
    setSelectedPackage(casePackage);
    setLoading(true);
    
    // 使用第一个启用的规则进行匹配
    const activeRule = matchingRules.find(rule => rule.enabled);
    if (!activeRule) {
      alert('请先配置匹配规则');
      setLoading(false);
      return;
    }
    
    // 计算匹配结果
    const results = disposalOrgs
      .filter(org => org.status === 'ACTIVE' && org.membershipStatus === 'ACTIVE')
      .map(org => ({
        org,
        matchingScore: calculateMatchingScore(casePackage, org, activeRule),
        reasons: generateMatchingReasons(casePackage, org),
        recommendation: getRecommendationLevel(calculateMatchingScore(casePackage, org, activeRule))
      }))
      .sort((a, b) => b.matchingScore - a.matchingScore);
    
    setTimeout(() => {
      setMatchingResults(results);
      setMatchingModalVisible(true);
      setLoading(false);
    }, 1000);
  };

  const generateMatchingReasons = (casePackage: CasePackage, org: DisposalOrg) => {
    const reasons = [];
    
    // 地域匹配
    const regionMatch = casePackage.regions.some(region => org.regions.includes(region));
    if (regionMatch) {
      reasons.push('服务区域匹配');
    }
    
    // 容量匹配
    const availableCapacity = org.monthlyCapacity * (1 - org.currentLoad / 100);
    if (availableCapacity >= casePackage.requirements.minCapacity) {
      reasons.push('处理能力充足');
    }
    
    // 业务匹配
    const businessMatch = casePackage.businessTypes.some(type => org.businessScope.includes(type));
    if (businessMatch) {
      reasons.push('业务范围匹配');
    }
    
    // 业绩优秀
    if (org.performance.avgRecoveryRate > 65) {
      reasons.push('历史业绩优秀');
    }
    
    return reasons;
  };

  const getRecommendationLevel = (score: number) => {
    if (score >= 80) return 'HIGHLY_RECOMMENDED';
    if (score >= 60) return 'RECOMMENDED';
    if (score >= 40) return 'SUITABLE';
    return 'NOT_SUITABLE';
  };

  const getRecommendationTag = (level: string) => {
    const levelMap: Record<string, { color: string; text: string }> = {
      'HIGHLY_RECOMMENDED': { color: 'green', text: '强烈推荐' },
      'RECOMMENDED': { color: 'blue', text: '推荐' },
      'SUITABLE': { color: 'orange', text: '适合' },
      'NOT_SUITABLE': { color: 'red', text: '不适合' }
    };
    const config = levelMap[level] || { color: 'default', text: '未知' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getUrgencyTag = (level: string) => {
    const urgencyMap: Record<string, { color: string; text: string }> = {
      'HIGH': { color: 'red', text: '紧急' },
      'MEDIUM': { color: 'orange', text: '一般' },
      'LOW': { color: 'green', text: '不急' }
    };
    const config = urgencyMap[level] || { color: 'default', text: level };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const casePackageColumns: ColumnsType<CasePackage> = [
    {
      title: '案件包名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: CasePackage) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.sourceOrgName}
          </Text>
        </div>
      ),
    },
    {
      title: '案件信息',
      key: 'caseInfo',
      render: (_, record: CasePackage) => (
        <div>
          <Text>{record.caseCount}件</Text>
          <br />
          <Text type="secondary">¥{(record.totalAmount / 10000).toFixed(1)}万</Text>
        </div>
      ),
    },
    {
      title: '服务区域',
      dataIndex: 'regions',
      key: 'regions',
      render: (regions: string[]) => (
        <div>
          {regions.slice(0, 2).map(region => (
            <Tag key={region} color="blue" style={{ margin: '1px' }}>{region}</Tag>
          ))}
          {regions.length > 2 && <Text type="secondary">+{regions.length - 2}</Text>}
        </div>
      ),
    },
    {
      title: '紧急程度',
      dataIndex: 'urgencyLevel',
      key: 'urgencyLevel',
      render: (level: string) => getUrgencyTag(level),
    },
    {
      title: '截止时间',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (deadline: string) => (
        <div>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          <Text>{deadline}</Text>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: CasePackage) => (
        <Button 
          type="primary" 
          size="small"
          icon={<ThunderboltOutlined />}
          onClick={() => handleMatchingAnalysis(record)}
          loading={loading && selectedPackage?.id === record.id}
        >
          智能匹配
        </Button>
      ),
    },
  ];

  const matchingResultColumns: ColumnsType<any> = [
    {
      title: '处置机构',
      key: 'org',
      render: (_, record: any) => (
        <div>
          <Text strong>{record.org.orgName}</Text>
          <br />
          <Text type="secondary">{record.org.orgType}</Text>
        </div>
      ),
    },
    {
      title: '匹配分数',
      dataIndex: 'matchingScore',
      key: 'matchingScore',
      render: (score: number) => (
        <div style={{ textAlign: 'center' }}>
          <Progress
            type="circle"
            percent={score}
            width={50}
            strokeColor={score >= 80 ? '#52c41a' : score >= 60 ? '#1890ff' : '#fa8c16'}
          />
        </div>
      ),
    },
    {
      title: '推荐等级',
      dataIndex: 'recommendation',
      key: 'recommendation',
      render: (level: string) => getRecommendationTag(level),
    },
    {
      title: '匹配原因',
      dataIndex: 'reasons',
      key: 'reasons',
      render: (reasons: string[]) => (
        <div>
          {reasons.map((reason, index) => (
            <Tag key={index} color="blue" style={{ margin: '1px' }}>{reason}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: '机构信息',
      key: 'orgInfo',
      render: (_, record: any) => (
        <div>
          <div>
            <TeamOutlined style={{ marginRight: 4 }} />
            <Text>团队：{record.org.teamSize}人</Text>
          </div>
          <div>
            <TrophyOutlined style={{ marginRight: 4 }} />
            <Text>回款率：{record.org.performance.avgRecoveryRate}%</Text>
          </div>
          <div>
            <Badge 
              status={record.org.currentLoad > 80 ? 'error' : 'success'} 
              text={`负载：${record.org.currentLoad}%`}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>
              <ThunderboltOutlined style={{ marginRight: 8 }} />
              智能匹配分析
            </Title>
            <Space>
              <Button 
                icon={<SettingOutlined />}
                onClick={() => setRuleConfigVisible(true)}
              >
                匹配规则配置
              </Button>
              <Button icon={<FilterOutlined />}>
                高级筛选
              </Button>
            </Space>
          </div>
        }
      >
        <Alert
          message="智能匹配说明"
          description="系统将根据地域、容量、业绩、专业度等维度对处置机构进行智能匹配，为您推荐最合适的处置伙伴。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Table
          dataSource={casePackages}
          columns={casePackageColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </Card>

      {/* 匹配结果弹窗 */}
      <Modal
        title={`智能匹配结果 - ${selectedPackage?.name}`}
        visible={matchingModalVisible}
        onCancel={() => setMatchingModalVisible(false)}
        width={1200}
        footer={[
          <Button key="close" onClick={() => setMatchingModalVisible(false)}>
            关闭
          </Button>,
          <Button key="assign" type="primary">
            批量分配
          </Button>,
        ]}
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Statistic title="候选机构数量" value={matchingResults.length} />
          </Col>
          <Col span={6}>
            <Statistic 
              title="强烈推荐" 
              value={matchingResults.filter(r => r.recommendation === 'HIGHLY_RECOMMENDED').length} 
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="推荐机构" 
              value={matchingResults.filter(r => r.recommendation === 'RECOMMENDED').length} 
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="平均匹配分数" 
              value={matchingResults.length > 0 ? 
                Math.round(matchingResults.reduce((sum, r) => sum + r.matchingScore, 0) / matchingResults.length) : 0
              } 
              suffix="分"
            />
          </Col>
        </Row>

        <Table
          dataSource={matchingResults}
          columns={matchingResultColumns}
          rowKey="org.id"
          pagination={{ pageSize: 8 }}
          size="small"
        />
      </Modal>

      {/* 匹配规则配置弹窗 */}
      <Modal
        title="匹配规则配置"
        visible={ruleConfigVisible}
        onCancel={() => setRuleConfigVisible(false)}
        onOk={() => setRuleConfigVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          {matchingRules.map((rule, index) => (
            <Card key={rule.id} size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label={`规则${index + 1}：${rule.name}`}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Text>地域权重：</Text>
                          <InputNumber 
                            min={0} 
                            max={100} 
                            value={rule.criteria.regionWeight}
                            addonAfter="%" 
                          />
                        </Col>
                        <Col span={12}>
                          <Text>容量权重：</Text>
                          <InputNumber 
                            min={0} 
                            max={100} 
                            value={rule.criteria.capacityWeight}
                            addonAfter="%" 
                          />
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Text>业绩权重：</Text>
                          <InputNumber 
                            min={0} 
                            max={100} 
                            value={rule.criteria.performanceWeight}
                            addonAfter="%" 
                          />
                        </Col>
                        <Col span={12}>
                          <Text>专业权重：</Text>
                          <InputNumber 
                            min={0} 
                            max={100} 
                            value={rule.criteria.specialtyWeight}
                            addonAfter="%" 
                          />
                        </Col>
                      </Row>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          ))}
        </Form>
      </Modal>
    </div>
  );
};

export default DisposalOrgCapabilityMatching;