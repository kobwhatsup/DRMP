import React, { useState, useEffect } from 'react';
import {
  Modal, Card, Button, Select, Slider, Radio, Space, Tag, Table, 
  Statistic, Progress, Alert, message, Spin, Row, Col, Divider, 
  Badge, Tooltip, Typography, Tabs, Descriptions, Avatar, List
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ExperimentOutlined, EnvironmentOutlined, TrophyOutlined,
  ThunderboltOutlined, BranchesOutlined, TeamOutlined,
  CheckCircleOutlined, InfoCircleOutlined, FileTextOutlined,
  MoneyCollectOutlined, ClockCircleOutlined, BarChartOutlined
} from '@ant-design/icons';
import assignmentService from '@/services/assignmentService';
import { casePackageService } from '@/services/casePackageService';
import { AssignmentEngine } from '@/utils/assignmentEngine';
import { AssignmentStrategy } from '@/types/assignment';
import type {
  CaseDetail, OrganizationProfile, AssignmentWeights,
  AssignmentConstraints, AssignmentRequest, AssignmentResult, OrgRecommendation,
  AssignmentMonitor, CaseAssignmentResult, OrgAssignmentStat
} from '@/types/assignment';
import type { CasePackage } from '@/types/casePackage';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface SmartAssignmentModalProps {
  visible: boolean;
  packageId: number;
  packageName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const SmartAssignmentModal: React.FC<SmartAssignmentModalProps> = ({
  visible,
  packageId,
  packageName,
  onClose,
  onSuccess
}) => {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('strategy');
  const [casePackage, setCasePackage] = useState<CasePackage | null>(null);
  const [cases, setCases] = useState<CaseDetail[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationProfile[]>([]);
  const [recommendations, setRecommendations] = useState<OrgRecommendation[]>([]);
  
  // 分案配置
  const [strategy, setStrategy] = useState<AssignmentStrategy>(AssignmentStrategy.COMPREHENSIVE);
  const [weights, setWeights] = useState<AssignmentWeights>({
    regionWeight: 30,
    performanceWeight: 30,
    loadWeight: 20,
    specialtyWeight: 20
  });
  const [constraints, setConstraints] = useState<AssignmentConstraints>({
    minMatchScore: 60,
    maxCasesPerOrg: 100,
    maxLoadRate: 80
  });
  
  // 分案结果
  const [assignmentResult, setAssignmentResult] = useState<AssignmentResult | null>(null);
  const [selectedOrgs, setSelectedOrgs] = useState<number[]>([]);
  const [isPreview, setIsPreview] = useState(false);

  // 加载数据
  useEffect(() => {
    if (visible && packageId) {
      loadInitialData();
    }
  }, [visible, packageId]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [packageData, casesData, orgsData, recsData] = await Promise.allSettled([
        casePackageService.getCasePackageDetail(packageId),
        assignmentService.getCasesByPackageId(packageId),
        assignmentService.getAvailableOrganizations(),
        assignmentService.getOrgRecommendations(packageId, 5)
      ]);

      if (packageData.status === 'fulfilled' && packageData.value) {
        setCasePackage(packageData.value);
      }
      
      if (casesData.status === 'fulfilled' && casesData.value) {
        setCases(casesData.value);
      }
      
      if (orgsData.status === 'fulfilled' && orgsData.value) {
        setOrganizations(orgsData.value);
      }
      
      if (recsData.status === 'fulfilled' && recsData.value) {
        // Convert AssignmentRecommendation to OrgRecommendation format
        const orgRecs: OrgRecommendation[] = recsData.value.map(rec => ({
          orgId: rec.organizationId,
          orgName: rec.organizationName,
          score: rec.score,
          reasons: [rec.reason],
          pros: Object.keys(rec.assessmentDetails || {}).filter(k => rec.assessmentDetails[k] > 0.5).map(k => k),
          cons: Object.keys(rec.assessmentDetails || {}).filter(k => rec.assessmentDetails[k] <= 0.5).map(k => k)
        }));
        setRecommendations(orgRecs);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 预览分案
  const handlePreview = async () => {
    if (cases.length === 0) {
      message.warning('没有可分配的案件');
      return;
    }
    
    if (organizations.length === 0) {
      message.warning('没有可用的处置机构');
      return;
    }

    setLoading(true);
    try {
      // 使用分案引擎计算分配方案
      const engine = new AssignmentEngine(strategy, weights, constraints);
      const engineResult = engine.assignCases(cases, organizations);
      
      // 转换为 AssignmentResult 格式
      const result: AssignmentResult = {
        assignmentId: `preview-${Date.now()}`,
        casePackageId: packageId,
        totalCases: cases.length,
        assignedCases: engineResult.assignments.length,
        failedCases: engineResult.unassignedCases.length,
        successRate: (engineResult.assignments.length / cases.length) * 100,
        avgMatchScore: engineResult.assignments.reduce((sum: number, a: CaseAssignmentResult) => sum + a.matchScore, 0) / (engineResult.assignments.length || 1),
        unassignedCases: engineResult.unassignedCases,
        caseAssignments: engineResult.assignments,
        orgStats: engineResult.orgStats,
        executionTime: 0,
        timestamp: new Date().toISOString()
      };
      
      setAssignmentResult(result);
      setIsPreview(true);
      setActiveTab('result');
      message.success('分案预览生成成功');
    } catch (error) {
      console.error('预览分案失败:', error);
      message.error('预览分案失败');
    } finally {
      setLoading(false);
    }
  };

  // 确认分案
  const handleConfirm = async () => {
    if (!assignmentResult) {
      message.warning('请先预览分案结果');
      return;
    }

    Modal.confirm({
      title: '确认分案',
      content: `确定要将 ${assignmentResult.assignedCases} 个案件分配给 ${assignmentResult.orgStats.length} 家处置机构吗？`,
      onOk: async () => {
        setLoading(true);
        try {
          // 需要先执行分案请求，获取assignmentId
          const request: AssignmentRequest = {
            casePackageId: packageId,
            strategy: strategy.toString(),
            weights,
            constraints
          };
          
          const executeResult = await assignmentService.executeAutoAssignment(packageId, [strategy.toString()]);
          if (executeResult.assignmentId) {
            await assignmentService.confirmAssignment(executeResult.assignmentId);
          }
          message.success('分案成功');
          onSuccess?.();
          onClose();
        } catch (error) {
          console.error('确认分案失败:', error);
          message.error('确认分案失败');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // 策略配置面板
  const renderStrategyPanel = () => (
    <div>
      <Card title="分案策略" className="mb-4">
        <Radio.Group
          value={strategy}
          onChange={e => setStrategy(e.target.value)}
          className="w-full"
        >
          <Space direction="vertical" className="w-full">
            <Radio value={AssignmentStrategy.REGION_BASED}>
              <Space>
                <EnvironmentOutlined />
                <span>地域优先</span>
                <Text type="secondary">优先分配给案件所在地区的处置机构</Text>
              </Space>
            </Radio>
            <Radio value={AssignmentStrategy.PERFORMANCE_BASED}>
              <Space>
                <TrophyOutlined />
                <span>业绩优先</span>
                <Text type="secondary">优先分配给历史业绩优秀的处置机构</Text>
              </Space>
            </Radio>
            <Radio value={AssignmentStrategy.LOAD_BALANCE}>
              <Space>
                <ThunderboltOutlined />
                <span>负载均衡</span>
                <Text type="secondary">均衡分配，避免机构负载过重</Text>
              </Space>
            </Radio>
            <Radio value={AssignmentStrategy.SPECIALTY_MATCH}>
              <Space>
                <BranchesOutlined />
                <span>专业匹配</span>
                <Text type="secondary">根据机构专长匹配案件类型</Text>
              </Space>
            </Radio>
            <Radio value={AssignmentStrategy.COMPREHENSIVE}>
              <Space>
                <ExperimentOutlined />
                <span>综合智能</span>
                <Text type="secondary">综合考虑多个因素，智能匹配最优方案</Text>
              </Space>
            </Radio>
          </Space>
        </Radio.Group>
      </Card>

      {strategy === AssignmentStrategy.COMPREHENSIVE && (
        <Card title="权重配置" className="mb-4">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>地域权重</span>
                <span>{weights.regionWeight}%</span>
              </div>
              <Slider
                value={weights.regionWeight}
                onChange={value => setWeights({...weights, regionWeight: value})}
                marks={{0: '0%', 50: '50%', 100: '100%'}}
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>业绩权重</span>
                <span>{weights.performanceWeight}%</span>
              </div>
              <Slider
                value={weights.performanceWeight}
                onChange={value => setWeights({...weights, performanceWeight: value})}
                marks={{0: '0%', 50: '50%', 100: '100%'}}
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>负载权重</span>
                <span>{weights.loadWeight}%</span>
              </div>
              <Slider
                value={weights.loadWeight}
                onChange={value => setWeights({...weights, loadWeight: value})}
                marks={{0: '0%', 50: '50%', 100: '100%'}}
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>专业权重</span>
                <span>{weights.specialtyWeight}%</span>
              </div>
              <Slider
                value={weights.specialtyWeight}
                onChange={value => setWeights({...weights, specialtyWeight: value})}
                marks={{0: '0%', 50: '50%', 100: '100%'}}
              />
            </div>
          </div>
        </Card>
      )}

      <Card title="约束条件">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span>最低匹配分数</span>
              <span>{constraints.minMatchScore}分</span>
            </div>
            <Slider
              value={constraints.minMatchScore}
              onChange={value => setConstraints({...constraints, minMatchScore: value})}
              min={0}
              max={100}
              marks={{0: '0', 60: '60', 100: '100'}}
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span>单机构最大案件数</span>
              <span>{constraints.maxCasesPerOrg}个</span>
            </div>
            <Slider
              value={constraints.maxCasesPerOrg}
              onChange={value => setConstraints({...constraints, maxCasesPerOrg: value})}
              min={10}
              max={500}
              step={10}
              marks={{10: '10', 250: '250', 500: '500'}}
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span>最大负载率</span>
              <span>{constraints.maxLoadRate}%</span>
            </div>
            <Slider
              value={constraints.maxLoadRate}
              onChange={value => setConstraints({...constraints, maxLoadRate: value})}
              min={50}
              max={100}
              marks={{50: '50%', 80: '80%', 100: '100%'}}
            />
          </div>
        </div>
      </Card>
    </div>
  );

  // 分案结果面板
  const renderResultPanel = () => {
    if (!assignmentResult) {
      return (
        <div className="text-center py-8">
          <Text type="secondary">暂无分案结果，请先点击"预览分案"</Text>
        </div>
      );
    }

    const orgColumns: ColumnsType<OrgAssignmentStat> = [
      {
        title: '处置机构',
        dataIndex: 'orgName',
        key: 'orgName',
      },
      {
        title: '分配案件数',
        dataIndex: 'assignedCount',
        key: 'assignedCount',
        sorter: (a, b) => a.assignedCount - b.assignedCount,
      },
      {
        title: '总金额',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        render: value => `¥${value.toLocaleString()}`,
        sorter: (a, b) => a.totalAmount - b.totalAmount,
      },
      {
        title: '平均匹配度',
        dataIndex: 'avgMatchScore',
        key: 'avgMatchScore',
        render: value => (
          <Progress 
            percent={value} 
            size="small" 
            strokeColor={value > 80 ? '#52c41a' : value > 60 ? '#faad14' : '#ff4d4f'}
          />
        ),
        sorter: (a, b) => a.avgMatchScore - b.avgMatchScore,
      },
      {
        title: '预计负载率',
        dataIndex: 'expectedLoadRate',
        key: 'expectedLoadRate',
        render: value => (
          <Progress 
            percent={value} 
            size="small"
            strokeColor={value > 80 ? '#ff4d4f' : value > 60 ? '#faad14' : '#52c41a'}
          />
        ),
        sorter: (a, b) => (a.expectedLoadRate || 0) - (b.expectedLoadRate || 0),
      }
    ];

    return (
      <div>
        {/* 分案统计 */}
        <Row gutter={16} className="mb-4">
          <Col span={6}>
            <Card>
              <Statistic
                title="总案件数"
                value={assignmentResult.totalCases}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="已分配"
                value={assignmentResult.assignedCases}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="分配率"
                value={assignmentResult.successRate}
                precision={1}
                suffix="%"
                valueStyle={{ color: assignmentResult.successRate > 90 ? '#3f8600' : '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="平均匹配度"
                value={assignmentResult.avgMatchScore}
                precision={1}
                suffix="分"
                valueStyle={{ color: assignmentResult.avgMatchScore > 80 ? '#3f8600' : '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 未分配案件提示 */}
        {assignmentResult.unassignedCases && assignmentResult.unassignedCases.length > 0 && (
          <Alert
            message={`有 ${assignmentResult.unassignedCases.length} 个案件未能分配`}
            description="可能原因：没有满足条件的处置机构，或所有机构已达到负载上限"
            type="warning"
            showIcon
            className="mb-4"
          />
        )}

        {/* 机构分配统计 */}
        <Card title="机构分配统计">
          <Table
            columns={orgColumns}
            dataSource={assignmentResult.orgStats}
            rowKey="orgId"
            pagination={false}
            size="small"
          />
        </Card>
      </div>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <ExperimentOutlined />
          <span>智能分案 - {packageName || `案件包${packageId}`}</span>
        </Space>
      }
      visible={visible}
      onCancel={onClose}
      width="90vw"
      style={{ top: 20 }}
      bodyStyle={{ height: '75vh', overflow: 'auto' }}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        activeTab === 'strategy' && (
          <Button 
            key="preview" 
            type="primary" 
            onClick={handlePreview}
            loading={loading}
            icon={<ExperimentOutlined />}
          >
            预览分案
          </Button>
        ),
        activeTab === 'result' && isPreview && (
          <Button 
            key="confirm" 
            type="primary" 
            onClick={handleConfirm}
            loading={loading}
            icon={<CheckCircleOutlined />}
          >
            确认分案
          </Button>
        )
      ]}
    >
      <Spin spinning={loading}>
        {/* 基本信息 */}
        <Card size="small" className="mb-4">
          <Row gutter={16}>
            <Col span={6}>
              <Statistic title="案件总数" value={cases.length} suffix="个" />
            </Col>
            <Col span={6}>
              <Statistic title="可用机构" value={organizations.length} suffix="家" />
            </Col>
            <Col span={6}>
              <Statistic title="推荐机构" value={recommendations.length} suffix="家" />
            </Col>
            <Col span={6}>
              <Statistic 
                title="总金额" 
                value={cases.reduce((sum, c) => sum + c.remainingAmount, 0)} 
                prefix="¥"
                precision={0}
              />
            </Col>
          </Row>
        </Card>

        {/* 标签页 */}
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="分案策略" key="strategy">
            {renderStrategyPanel()}
          </TabPane>
          <TabPane tab="分案结果" key="result" disabled={!isPreview}>
            {renderResultPanel()}
          </TabPane>
        </Tabs>
      </Spin>
    </Modal>
  );
};

export default SmartAssignmentModal;