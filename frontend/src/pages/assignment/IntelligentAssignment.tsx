import React, { useState, useEffect } from 'react';
import {
  Card, Steps, Row, Col, Statistic, Progress, Timeline, Table, 
  Button, Space, Tag, Alert, Spin, Typography, Divider, Badge,
  Modal, Form, Select, InputNumber, Slider, Switch, Tooltip
} from 'antd';
import {
  RobotOutlined, ThunderboltOutlined, CheckCircleOutlined,
  ClockCircleOutlined, TeamOutlined, BarChartOutlined,
  EnvironmentOutlined, DollarOutlined, CalendarOutlined,
  PlayCircleOutlined, PauseCircleOutlined, StopOutlined,
  SettingOutlined, EyeOutlined, ReloadOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { caseAssignmentService, casePackageService, type CasePackage } from '@/services/caseService';

const { Step } = Steps;
const { Title, Text } = Typography;
const { Option } = Select;

// 分案状态枚举
enum AssignmentStatus {
  PENDING = 'PENDING',
  ANALYZING = 'ANALYZING',
  MATCHING = 'MATCHING',
  ASSIGNING = 'ASSIGNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PAUSED = 'PAUSED'
}

// 分案结果接口
interface AssignmentResult {
  id: string;
  disposalOrgId: string;
  disposalOrgName: string;
  assignedCases: number;
  matchScore: number;
  region: string;
  specialties: string[];
  workload: number;
  avgRecoveryRate: number;
  avgProcessingDays: number;
  status: 'ASSIGNED' | 'PENDING' | 'REJECTED';
}

// 分案进度接口
interface AssignmentProgress {
  totalCases: number;
  analyzedCases: number;
  assignedCases: number;
  pendingCases: number;
  failedCases: number;
  currentStep: number;
  estimatedTime: number;
  avgMatchScore: number;
}

/**
 * 智能分案执行页面
 */
const IntelligentAssignment: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const packageId = searchParams.get('packageId');
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<AssignmentStatus>(AssignmentStatus.PENDING);
  const [casePackage, setCasePackage] = useState<CasePackage | null>(null);
  const [progress, setProgress] = useState<AssignmentProgress>({
    totalCases: 0,
    analyzedCases: 0,
    assignedCases: 0,
    pendingCases: 0,
    failedCases: 0,
    currentStep: 0,
    estimatedTime: 0,
    avgMatchScore: 0
  });
  const [assignmentResults, setAssignmentResults] = useState<AssignmentResult[]>([]);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [assignmentConfig, setAssignmentConfig] = useState({
    strategy: 'INTELLIGENT',
    regionWeight: 40,
    performanceWeight: 30,
    loadBalanceWeight: 20,
    capacityWeight: 10,
    autoConfirm: false,
    maxCasesPerOrg: 200,
    minMatchScore: 70
  });

  // 加载案件包信息
  const loadCasePackage = async () => {
    if (!packageId) return;
    
    try {
      // 模拟API调用，因为实际API还未实现
      const mockCasePackage: CasePackage = {
        id: Number(packageId),
        packageName: '测试案件包A',
        sourceOrgId: 1,
        sourceOrgName: '某银行',
        totalCases: 450,
        totalAmount: 15000000,
        avgAmount: 33333,
        minAmount: 5000,
        maxAmount: 200000,
        expectedRecoveryRate: 75,
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
      };
      
      setCasePackage(mockCasePackage);
      setProgress(prev => ({
        ...prev,
        totalCases: mockCasePackage.totalCases || 0
      }));
    } catch (error) {
      console.error('Failed to load case package:', error);
    }
  };

  // 启动智能分案
  const startAssignment = async () => {
    if (!packageId) return;
    
    setLoading(true);
    setStatus(AssignmentStatus.ANALYZING);
    
    try {
      // 模拟分案过程
      await simulateAssignmentProcess();
    } catch (error) {
      setStatus(AssignmentStatus.FAILED);
      console.error('Assignment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // 模拟分案过程
  const simulateAssignmentProcess = async () => {
    const totalCases = casePackage?.totalCases || 450;
    
    // 第一步：分析案件
    setStatus(AssignmentStatus.ANALYZING);
    setProgress(prev => ({ ...prev, currentStep: 1 }));
    
    for (let i = 0; i <= totalCases; i += 25) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress(prev => ({
        ...prev,
        analyzedCases: Math.min(i, totalCases)
      }));
    }
    
    // 第二步：匹配机构
    setStatus(AssignmentStatus.MATCHING);
    setProgress(prev => ({ ...prev, currentStep: 2 }));
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 第三步：执行分案
    setStatus(AssignmentStatus.ASSIGNING);
    setProgress(prev => ({ ...prev, currentStep: 3 }));
    
    // 模拟分案结果
    const mockResults: AssignmentResult[] = [
      {
        id: '1',
        disposalOrgId: '101',
        disposalOrgName: '华东调解中心',
        assignedCases: 150,
        matchScore: 94,
        region: '上海,江苏,浙江',
        specialties: ['金融纠纷调解', '债权债务处理'],
        workload: 75,
        avgRecoveryRate: 78,
        avgProcessingDays: 65,
        status: 'ASSIGNED'
      },
      {
        id: '2',
        disposalOrgId: '102',
        disposalOrgName: '北京金诚律所',
        assignedCases: 120,
        matchScore: 91,
        region: '北京,天津,河北',
        specialties: ['诉讼代理', '资产保全'],
        workload: 68,
        avgRecoveryRate: 82,
        avgProcessingDays: 78,
        status: 'ASSIGNED'
      },
      {
        id: '3',
        disposalOrgId: '103',
        disposalOrgName: '南方处置公司',
        assignedCases: 130,
        matchScore: 88,
        region: '广东,湖南,江西',
        specialties: ['综合处置', '催收服务'],
        workload: 82,
        avgRecoveryRate: 75,
        avgProcessingDays: 85,
        status: 'ASSIGNED'
      },
      {
        id: '4',
        disposalOrgId: '104',
        disposalOrgName: '西部协作组织',
        assignedCases: 50,
        matchScore: 72,
        region: '四川,重庆,云南',
        specialties: ['区域协作', '本地化处置'],
        workload: 45,
        avgRecoveryRate: 68,
        avgProcessingDays: 95,
        status: 'PENDING'
      }
    ];
    
    setAssignmentResults(mockResults);
    
    // 模拟逐步分配案件
    let assignedTotal = 0;
    for (const result of mockResults) {
      if (result.status === 'ASSIGNED') {
        for (let i = 0; i <= result.assignedCases; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 50));
          assignedTotal = Math.min(assignedTotal + 10, assignedTotal + result.assignedCases);
          setProgress(prev => ({
            ...prev,
            assignedCases: assignedTotal,
            pendingCases: totalCases - assignedTotal,
            avgMatchScore: mockResults.reduce((sum, r) => sum + r.matchScore, 0) / mockResults.length
          }));
        }
      }
    }
    
    setStatus(AssignmentStatus.COMPLETED);
    setProgress(prev => ({ ...prev, currentStep: 4 }));
  };

  // 暂停分案
  const pauseAssignment = () => {
    setStatus(AssignmentStatus.PAUSED);
    setLoading(false);
  };

  // 停止分案
  const stopAssignment = () => {
    setStatus(AssignmentStatus.PENDING);
    setLoading(false);
    setProgress({
      totalCases: casePackage?.totalCases || 0,
      analyzedCases: 0,
      assignedCases: 0,
      pendingCases: 0,
      failedCases: 0,
      currentStep: 0,
      estimatedTime: 0,
      avgMatchScore: 0
    });
    setAssignmentResults([]);
  };

  // 确认分案结果
  const confirmAssignment = async () => {
    try {
      await caseAssignmentService.confirmAssignment(Number(packageId), assignmentResults);
      Modal.success({
        title: '分案确认成功',
        content: '案件已成功分配给各处置机构，系统将发送通知',
        onOk: () => navigate('/case-packages')
      });
    } catch (error) {
      Modal.error({
        title: '分案确认失败',
        content: '请检查网络连接后重试'
      });
    }
  };

  // 表格列配置
  const columns: ColumnsType<AssignmentResult> = [
    {
      title: '处置机构',
      dataIndex: 'disposalOrgName',
      key: 'disposalOrgName',
      width: 200,
      render: (name: string, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.region}
          </div>
        </div>
      )
    },
    {
      title: '分配案件',
      dataIndex: 'assignedCases',
      key: 'assignedCases',
      width: 100,
      render: (cases: number) => (
        <Statistic value={cases} suffix="件" valueStyle={{ fontSize: '14px' }} />
      )
    },
    {
      title: '匹配度',
      dataIndex: 'matchScore',
      key: 'matchScore',
      width: 100,
      render: (score: number) => (
        <div>
          <Progress 
            percent={score} 
            size="small" 
            format={() => `${score}%`}
            strokeColor={score >= 90 ? '#52c41a' : score >= 80 ? '#faad14' : '#ff4d4f'}
          />
        </div>
      )
    },
    {
      title: '工作负载',
      dataIndex: 'workload',
      key: 'workload',
      width: 100,
      render: (load: number) => (
        <Progress 
          percent={load} 
          size="small" 
          format={() => `${load}%`}
          strokeColor={load >= 80 ? '#ff4d4f' : load >= 60 ? '#faad14' : '#52c41a'}
        />
      )
    },
    {
      title: '历史业绩',
      key: 'performance',
      width: 150,
      render: (record: AssignmentResult) => (
        <div>
          <div>回款率: {record.avgRecoveryRate}%</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            周期: {record.avgProcessingDays}天
          </div>
        </div>
      )
    },
    {
      title: '专长领域',
      dataIndex: 'specialties',
      key: 'specialties',
      width: 180,
      render: (specialties: string[]) => (
        <div>
          {specialties.map(specialty => (
            <Tag key={specialty} color="blue">
              {specialty}
            </Tag>
          ))}
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          ASSIGNED: { text: '已分配', color: 'success' },
          PENDING: { text: '待确认', color: 'warning' },
          REJECTED: { text: '已拒绝', color: 'error' }
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Badge status={config.color as any} text={config.text} />;
      }
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (record: AssignmentResult) => (
        <Space>
          <Tooltip title="查看详情">
            <Button type="link" size="small" icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="调整分配">
            <Button type="link" size="small" icon={<SettingOutlined />} />
          </Tooltip>
        </Space>
      )
    }
  ];

  useEffect(() => {
    loadCasePackage();
  }, [packageId]);

  const getStatusIcon = () => {
    switch (status) {
      case AssignmentStatus.ANALYZING:
      case AssignmentStatus.MATCHING:
      case AssignmentStatus.ASSIGNING:
        return <Spin size="small" />;
      case AssignmentStatus.COMPLETED:
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case AssignmentStatus.FAILED:
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <RobotOutlined />;
    }
  };

  const getStatusText = () => {
    const statusMap = {
      [AssignmentStatus.PENDING]: '准备就绪',
      [AssignmentStatus.ANALYZING]: '分析案件中...',
      [AssignmentStatus.MATCHING]: '匹配机构中...',
      [AssignmentStatus.ASSIGNING]: '执行分案中...',
      [AssignmentStatus.COMPLETED]: '分案完成',
      [AssignmentStatus.FAILED]: '分案失败',
      [AssignmentStatus.PAUSED]: '分案暂停'
    };
    return statusMap[status];
  };

  return (
    <div className="intelligent-assignment">
      {/* 头部信息 */}
      <Card style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between">
          <Col span={18}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {getStatusIcon()}
              <div style={{ marginLeft: 12 }}>
                <Title level={3} style={{ margin: 0 }}>
                  智能分案引擎 - {casePackage?.packageName}
                </Title>
                <Text type="secondary">{getStatusText()}</Text>
              </div>
            </div>
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Space>
              <Button 
                icon={<SettingOutlined />}
                onClick={() => setConfigModalVisible(true)}
                disabled={loading}
              >
                分案配置
              </Button>
              {status === AssignmentStatus.PENDING && (
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />}
                  onClick={startAssignment}
                  loading={loading}
                >
                  开始分案
                </Button>
              )}
              {loading && (
                <>
                  <Button 
                    icon={<PauseCircleOutlined />}
                    onClick={pauseAssignment}
                  >
                    暂停
                  </Button>
                  <Button 
                    danger 
                    icon={<StopOutlined />}
                    onClick={stopAssignment}
                  >
                    停止
                  </Button>
                </>
              )}
              {status === AssignmentStatus.COMPLETED && (
                <Button 
                  type="primary" 
                  onClick={confirmAssignment}
                >
                  确认分案
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 进度统计 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="案件总数"
              value={progress.totalCases}
              suffix="件"
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已分配"
              value={progress.assignedCases}
              suffix="件"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待分配"
              value={progress.totalCases - progress.assignedCases}
              suffix="件"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均匹配度"
              value={progress.avgMatchScore}
              suffix="%"
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
              precision={1}
            />
          </Card>
        </Col>
      </Row>

      {/* 分案步骤 */}
      <Card title="分案进度" style={{ marginBottom: 16 }}>
        <Steps current={progress.currentStep} status={status === AssignmentStatus.FAILED ? 'error' : 'process'}>
          <Step title="案件分析" description="分析案件特征和要求" />
          <Step title="机构匹配" description="根据策略匹配处置机构" />
          <Step title="执行分案" description="自动分配案件到机构" />
          <Step title="确认完成" description="确认分案结果" />
        </Steps>
        
        {(status === AssignmentStatus.ANALYZING || status === AssignmentStatus.ASSIGNING) && (
          <div style={{ marginTop: 16 }}>
            <Progress 
              percent={Math.round((progress.assignedCases / progress.totalCases) * 100)}
              status="active"
              format={(percent) => `${percent}% (${progress.assignedCases}/${progress.totalCases})`}
            />
          </div>
        )}
      </Card>

      {/* 分案结果 */}
      {assignmentResults.length > 0 && (
        <Card title="分案结果" style={{ marginBottom: 16 }}>
          <Table
            columns={columns}
            dataSource={assignmentResults}
            rowKey="id"
            pagination={false}
            size="middle"
            scroll={{ x: 1200 }}
          />
          
          {status === AssignmentStatus.COMPLETED && (
            <Alert
              style={{ marginTop: 16 }}
              message="分案完成"
              description={`已成功分配 ${progress.assignedCases} 件案件到 ${assignmentResults.filter(r => r.status === 'ASSIGNED').length} 家处置机构，平均匹配度 ${progress.avgMatchScore.toFixed(1)}%。请确认分案结果。`}
              type="success"
              showIcon
              action={
                <Button size="small" type="primary" onClick={confirmAssignment}>
                  确认分案
                </Button>
              }
            />
          )}
        </Card>
      )}

      {/* 分案配置弹窗 */}
      <Modal
        title="智能分案配置"
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        onOk={() => setConfigModalVisible(false)}
        width={600}
      >
        <Form layout="vertical" initialValues={assignmentConfig}>
          <Form.Item label="分案策略">
            <Select value={assignmentConfig.strategy} onChange={(value) => 
              setAssignmentConfig(prev => ({ ...prev, strategy: value }))
            }>
              <Option value="INTELLIGENT">智能分案</Option>
              <Option value="REGION_FIRST">地域优先</Option>
              <Option value="PERFORMANCE_FIRST">业绩优先</Option>
              <Option value="LOAD_BALANCE">负载均衡</Option>
            </Select>
          </Form.Item>

          <Divider>权重配置</Divider>
          
          <Form.Item label={`地域匹配权重: ${assignmentConfig.regionWeight}%`}>
            <Slider
              value={assignmentConfig.regionWeight}
              onChange={(value) => setAssignmentConfig(prev => ({ ...prev, regionWeight: value }))}
              max={100}
              marks={{ 0: '0%', 50: '50%', 100: '100%' }}
            />
          </Form.Item>

          <Form.Item label={`业绩权重: ${assignmentConfig.performanceWeight}%`}>
            <Slider
              value={assignmentConfig.performanceWeight}
              onChange={(value) => setAssignmentConfig(prev => ({ ...prev, performanceWeight: value }))}
              max={100}
              marks={{ 0: '0%', 50: '50%', 100: '100%' }}
            />
          </Form.Item>

          <Form.Item label={`负载均衡权重: ${assignmentConfig.loadBalanceWeight}%`}>
            <Slider
              value={assignmentConfig.loadBalanceWeight}
              onChange={(value) => setAssignmentConfig(prev => ({ ...prev, loadBalanceWeight: value }))}
              max={100}
              marks={{ 0: '0%', 50: '50%', 100: '100%' }}
            />
          </Form.Item>

          <Divider>高级设置</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="单机构最大案件数">
                <InputNumber
                  value={assignmentConfig.maxCasesPerOrg}
                  onChange={(value) => setAssignmentConfig(prev => ({ ...prev, maxCasesPerOrg: value || 200 }))}
                  min={1}
                  max={1000}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="最低匹配度">
                <InputNumber
                  value={assignmentConfig.minMatchScore}
                  onChange={(value) => setAssignmentConfig(prev => ({ ...prev, minMatchScore: value || 70 }))}
                  min={0}
                  max={100}
                  suffix="%"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Switch
              checked={assignmentConfig.autoConfirm}
              onChange={(checked) => setAssignmentConfig(prev => ({ ...prev, autoConfirm: checked }))}
            />
            <span style={{ marginLeft: 8 }}>自动确认分案结果</span>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default IntelligentAssignment;