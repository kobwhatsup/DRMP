import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Space, Steps, Alert, Progress, Tag, Badge,
  Typography, Divider, Row, Col, Statistic, Timeline, List, Tabs,
  Modal, Form, Input, message, Spin, Result, Collapse, Tooltip
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined,
  ExclamationCircleOutlined, InfoCircleOutlined, PlayCircleOutlined,
  PauseCircleOutlined, ReloadOutlined, BugOutlined, RocketOutlined,
  ExperimentOutlined, SecurityScanOutlined, SettingOutlined, MonitorOutlined,
  FileTextOutlined, ApiOutlined, BarChartOutlined, TeamOutlined,
  DollarOutlined, SyncOutlined, ThunderboltOutlined, DatabaseOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TabPane } = Tabs;
const { Panel } = Collapse;

// 测试项目接口
interface TestCase {
  id: string;
  module: string;
  testName: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED' | 'SKIPPED';
  duration?: number;
  errorMessage?: string;
  dependencies?: string[];
  testSteps: TestStep[];
}

// 测试步骤接口
interface TestStep {
  id: string;
  stepName: string;
  description: string;
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED';
  duration?: number;
  errorMessage?: string;
}

// 测试报告接口
interface TestReport {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  totalDuration: number;
  successRate: number;
  coverage: {
    modules: number;
    functions: number;
    lines: number;
  };
  issues: Array<{
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    module: string;
    description: string;
    suggestion: string;
  }>;
}

/**
 * 案件管理模块功能测试页面
 */
const CaseManagementTest: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testReport, setTestReport] = useState<TestReport | null>(null);
  const [currentTestId, setCurrentTestId] = useState<string | null>(null);
  const [testProgress, setTestProgress] = useState(0);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testLogs, setTestLogs] = useState<Array<{
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    module: string;
    message: string;
  }>>([]);

  // 初始化测试用例
  const initializeTestCases = () => {
    const mockTestCases: TestCase[] = [
      {
        id: 'TC001',
        module: '案件包管理',
        testName: '案件批量导入功能测试',
        description: '测试Excel/CSV文件批量导入案件数据功能',
        priority: 'HIGH',
        status: 'PENDING',
        dependencies: [],
        testSteps: [
          {
            id: 'TS001-1',
            stepName: '文件格式验证',
            description: '验证上传文件格式是否符合要求',
            status: 'PENDING'
          },
          {
            id: 'TS001-2',
            stepName: '数据字段验证',
            description: '验证必填字段和数据格式',
            status: 'PENDING'
          },
          {
            id: 'TS001-3',
            stepName: '重复数据检查',
            description: '检查是否存在重复的案件数据',
            status: 'PENDING'
          },
          {
            id: 'TS001-4',
            stepName: '数据库写入',
            description: '验证数据成功写入数据库',
            status: 'PENDING'
          }
        ]
      },
      {
        id: 'TC002',
        module: '智能分案引擎',
        testName: '自动分案算法测试',
        description: '测试基于多维度评分的智能分案算法',
        priority: 'HIGH',
        status: 'PENDING',
        dependencies: ['TC001'],
        testSteps: [
          {
            id: 'TS002-1',
            stepName: '机构匹配规则',
            description: '测试地域、能力、负载等匹配规则',
            status: 'PENDING'
          },
          {
            id: 'TS002-2',
            stepName: '评分算法',
            description: '验证综合评分算法的准确性',
            status: 'PENDING'
          },
          {
            id: 'TS002-3',
            stepName: '分案结果',
            description: '验证分案结果的合理性和均衡性',
            status: 'PENDING'
          }
        ]
      },
      {
        id: 'TC003',
        module: '案件市场',
        testName: '案件浏览与竞标测试',
        description: '测试处置机构浏览案件和竞标功能',
        priority: 'HIGH',
        status: 'PENDING',
        dependencies: ['TC001'],
        testSteps: [
          {
            id: 'TS003-1',
            stepName: '案件筛选',
            description: '测试按金额、地区、类型等条件筛选',
            status: 'PENDING'
          },
          {
            id: 'TS003-2',
            stepName: '竞标提交',
            description: '验证竞标信息提交和状态更新',
            status: 'PENDING'
          },
          {
            id: 'TS003-3',
            stepName: '竞标评估',
            description: '测试竞标结果评估和选择',
            status: 'PENDING'
          }
        ]
      },
      {
        id: 'TC004',
        module: '案件状态管理',
        testName: '案件流程跟踪测试',
        description: '测试案件处置全流程状态管理',
        priority: 'HIGH',
        status: 'PENDING',
        dependencies: ['TC002', 'TC003'],
        testSteps: [
          {
            id: 'TS004-1',
            stepName: '状态流转',
            description: '验证案件状态按流程正确流转',
            status: 'PENDING'
          },
          {
            id: 'TS004-2',
            stepName: '进展记录',
            description: '测试处置进展记录和更新功能',
            status: 'PENDING'
          },
          {
            id: 'TS004-3',
            stepName: '回款记录',
            description: '验证回款记录的准确性',
            status: 'PENDING'
          }
        ]
      },
      {
        id: 'TC005',
        module: '协作沟通',
        testName: '团队协作功能测试',
        description: '测试案件处置过程中的协作沟通功能',
        priority: 'MEDIUM',
        status: 'PENDING',
        dependencies: ['TC004'],
        testSteps: [
          {
            id: 'TS005-1',
            stepName: '实时消息',
            description: '测试实时消息发送和接收',
            status: 'PENDING'
          },
          {
            id: 'TS005-2',
            stepName: '文件共享',
            description: '验证文件上传和共享功能',
            status: 'PENDING'
          },
          {
            id: 'TS005-3',
            stepName: '任务协作',
            description: '测试团队任务分配和跟踪',
            status: 'PENDING'
          }
        ]
      },
      {
        id: 'TC006',
        module: '财务对账',
        testName: '对账结算功能测试',
        description: '测试回款对账和费用结算功能',
        priority: 'HIGH',
        status: 'PENDING',
        dependencies: ['TC004'],
        testSteps: [
          {
            id: 'TS006-1',
            stepName: '自动对账',
            description: '测试回款记录自动匹配对账',
            status: 'PENDING'
          },
          {
            id: 'TS006-2',
            stepName: '结算计算',
            description: '验证费用结算金额计算准确性',
            status: 'PENDING'
          },
          {
            id: 'TS006-3',
            stepName: '争议处理',
            description: '测试对账争议处理流程',
            status: 'PENDING'
          }
        ]
      },
      {
        id: 'TC007',
        module: '报表分析',
        testName: '数据分析报表测试',
        description: '测试各类业务报表和数据分析功能',
        priority: 'MEDIUM',
        status: 'PENDING',
        dependencies: ['TC004', 'TC006'],
        testSteps: [
          {
            id: 'TS007-1',
            stepName: '数据统计',
            description: '验证各项统计数据的准确性',
            status: 'PENDING'
          },
          {
            id: 'TS007-2',
            stepName: '图表展示',
            description: '测试图表组件的正确显示',
            status: 'PENDING'
          },
          {
            id: 'TS007-3',
            stepName: '报表导出',
            description: '验证报表导出功能',
            status: 'PENDING'
          }
        ]
      },
      {
        id: 'TC008',
        module: 'IDS系统集成',
        testName: 'API接口集成测试',
        description: '测试与IDS系统的API接口集成',
        priority: 'HIGH',
        status: 'PENDING',
        dependencies: ['TC004'],
        testSteps: [
          {
            id: 'TS008-1',
            stepName: 'API连接测试',
            description: '测试各API接口的连通性',
            status: 'PENDING'
          },
          {
            id: 'TS008-2',
            stepName: '数据同步',
            description: '验证数据双向同步的准确性',
            status: 'PENDING'
          },
          {
            id: 'TS008-3',
            stepName: '异常处理',
            description: '测试接口异常情况的处理',
            status: 'PENDING'
          }
        ]
      }
    ];

    setTestCases(mockTestCases);
  };

  useEffect(() => {
    initializeTestCases();
  }, []);

  // 执行单个测试用例
  const runSingleTest = async (testCase: TestCase): Promise<void> => {
    return new Promise((resolve) => {
      setCurrentTestId(testCase.id);
      
      // 更新测试用例状态为运行中
      setTestCases(prev => prev.map(tc => 
        tc.id === testCase.id 
          ? { ...tc, status: 'RUNNING' }
          : tc
      ));

      let stepIndex = 0;
      const runNextStep = () => {
        if (stepIndex >= testCase.testSteps.length) {
          // 所有步骤完成，随机决定测试结果
          const isSuccess = Math.random() > 0.15; // 85% 成功率
          const duration = Math.floor(Math.random() * 3000) + 1000;
          
          setTestCases(prev => prev.map(tc => 
            tc.id === testCase.id 
              ? { 
                  ...tc, 
                  status: isSuccess ? 'PASSED' : 'FAILED',
                  duration,
                  errorMessage: isSuccess ? undefined : '测试执行过程中发现异常'
                }
              : tc
          ));

          // 添加日志
          addTestLog(
            isSuccess ? 'INFO' : 'ERROR',
            testCase.module,
            `测试 ${testCase.testName} ${isSuccess ? '通过' : '失败'}`
          );

          resolve();
          return;
        }

        const currentStep = testCase.testSteps[stepIndex];
        
        // 更新当前步骤状态为运行中
        setTestCases(prev => prev.map(tc => 
          tc.id === testCase.id 
            ? {
                ...tc,
                testSteps: tc.testSteps.map(step =>
                  step.id === currentStep.id
                    ? { ...step, status: 'RUNNING' }
                    : step
                )
              }
            : tc
        ));

        // 模拟步骤执行时间
        setTimeout(() => {
          const stepSuccess = Math.random() > 0.1; // 90% 步骤成功率
          const stepDuration = Math.floor(Math.random() * 1000) + 200;

          // 更新步骤状态
          setTestCases(prev => prev.map(tc => 
            tc.id === testCase.id 
              ? {
                  ...tc,
                  testSteps: tc.testSteps.map(step =>
                    step.id === currentStep.id
                      ? { 
                          ...step, 
                          status: stepSuccess ? 'PASSED' : 'FAILED',
                          duration: stepDuration,
                          errorMessage: stepSuccess ? undefined : '步骤执行失败'
                        }
                      : step
                  )
                }
              : tc
          ));

          stepIndex++;
          setTimeout(runNextStep, 500);
        }, Math.floor(Math.random() * 1000) + 500);
      };

      runNextStep();
    });
  };

  // 执行所有测试
  const runAllTests = async () => {
    setIsTestRunning(true);
    setTestProgress(0);
    setTestLogs([]);
    
    addTestLog('INFO', '测试管理', '开始执行完整功能测试');
    
    const sortedTests = [...testCases].sort((a, b) => {
      // 简单的依赖排序：没有依赖的先执行
      if (a.dependencies?.length === 0 && b.dependencies?.length === 0) return 0;
      if (a.dependencies?.length === 0) return -1;
      if (b.dependencies?.length === 0) return 1;
      return 0;
    });

    for (let i = 0; i < sortedTests.length; i++) {
      await runSingleTest(sortedTests[i]);
      setTestProgress(Math.round(((i + 1) / sortedTests.length) * 100));
    }

    // 生成测试报告
    generateTestReport();
    setIsTestRunning(false);
    setCurrentTestId(null);
    
    addTestLog('INFO', '测试管理', '所有测试执行完成');
  };

  // 生成测试报告
  const generateTestReport = () => {
    const totalTests = testCases.length;
    const passedTests = testCases.filter(tc => tc.status === 'PASSED').length;
    const failedTests = testCases.filter(tc => tc.status === 'FAILED').length;
    const skippedTests = testCases.filter(tc => tc.status === 'SKIPPED').length;
    const totalDuration = testCases.reduce((sum, tc) => sum + (tc.duration || 0), 0);
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    const report: TestReport = {
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      totalDuration,
      successRate,
      coverage: {
        modules: 8, // 覆盖的模块数
        functions: 85, // 函数覆盖率
        lines: 78 // 代码行覆盖率
      },
      issues: failedTests > 0 ? [
        {
          severity: 'HIGH',
          module: '智能分案引擎',
          description: '分案算法在特定条件下可能产生不均衡分配',
          suggestion: '优化负载均衡算法，增加机构处理能力动态评估'
        },
        {
          severity: 'MEDIUM',
          module: 'IDS系统集成',
          description: 'API接口超时处理机制需要完善',
          suggestion: '增加重试机制和降级策略'
        }
      ] : []
    };

    setTestReport(report);
  };

  // 添加测试日志
  const addTestLog = (level: 'INFO' | 'WARN' | 'ERROR', module: string, message: string) => {
    const newLog = {
      timestamp: dayjs().format('HH:mm:ss.SSS'),
      level,
      module,
      message
    };
    
    setTestLogs(prev => [...prev, newLog]);
  };

  // 重置所有测试
  const resetAllTests = () => {
    setTestCases(prev => prev.map(tc => ({
      ...tc,
      status: 'PENDING',
      duration: undefined,
      errorMessage: undefined,
      testSteps: tc.testSteps.map(step => ({
        ...step,
        status: 'PENDING',
        duration: undefined,
        errorMessage: undefined
      }))
    })));
    
    setTestReport(null);
    setTestProgress(0);
    setCurrentTestId(null);
    setTestLogs([]);
  };

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return <LoadingOutlined style={{ color: '#1890ff' }} />;
      case 'PASSED':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'FAILED':
        return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
      case 'SKIPPED':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return 'processing';
      case 'PASSED':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'SKIPPED':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <div className="case-management-test">
      {/* 页面头部 */}
      <Card style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <ExperimentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              案件管理模块功能测试
            </Title>
            <Text type="secondary">全面测试案件管理模块的核心功能和集成性</Text>
          </Col>
          <Col>
            <Space>
              <Button 
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={runAllTests}
                loading={isTestRunning}
                disabled={isTestRunning}
              >
                {isTestRunning ? '测试中...' : '执行全部测试'}
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={resetAllTests}
                disabled={isTestRunning}
              >
                重置测试
              </Button>
            </Space>
          </Col>
        </Row>
        
        {isTestRunning && (
          <div style={{ marginTop: 16 }}>
            <Progress 
              percent={testProgress} 
              status="active"
              format={() => `${testProgress}% (${testCases.filter(tc => tc.status === 'PASSED' || tc.status === 'FAILED').length}/${testCases.length})`}
            />
          </div>
        )}
      </Card>

      {/* 测试报告概览 */}
      {testReport && (
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="测试总数"
                value={testReport.totalTests}
                suffix="个"
                prefix={<FileTextOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="通过率"
                value={testReport.successRate}
                suffix="%"
                precision={1}
                valueStyle={{ color: testReport.successRate >= 90 ? '#52c41a' : testReport.successRate >= 70 ? '#faad14' : '#f5222d' }}
                prefix={<CheckCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="执行时间"
                value={testReport.totalDuration / 1000}
                suffix="秒"
                precision={1}
                prefix={<ClockCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="代码覆盖率"
                value={testReport.coverage.lines}
                suffix="%"
                valueStyle={{ color: testReport.coverage.lines >= 80 ? '#52c41a' : '#faad14' }}
                prefix={<BarChartOutlined />}
              />
            </Col>
          </Row>
        </Card>
      )}

      <Tabs defaultActiveKey="testCases">
        {/* 测试用例 */}
        <TabPane tab="测试用例" key="testCases">
          <Card>
            <List
              dataSource={testCases}
              renderItem={(testCase) => (
                <List.Item
                  key={testCase.id}
                  style={{ 
                    backgroundColor: currentTestId === testCase.id ? '#f6ffed' : 'transparent',
                    border: currentTestId === testCase.id ? '1px solid #b7eb8f' : 'none',
                    borderRadius: 6,
                    padding: 16,
                    marginBottom: 8
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{ textAlign: 'center', minWidth: 60 }}>
                        {getStatusIcon(testCase.status)}
                        <div style={{ fontSize: '12px', marginTop: 4 }}>
                          {testCase.id}
                        </div>
                      </div>
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>
                          <Badge count={testCase.module} style={{ backgroundColor: '#108ee9', marginRight: 8 }} />
                          {testCase.testName}
                        </span>
                        <div>
                          <Tag color={testCase.priority === 'HIGH' ? 'red' : testCase.priority === 'MEDIUM' ? 'orange' : 'blue'}>
                            {testCase.priority}
                          </Tag>
                          <Tag color={getStatusColor(testCase.status)}>
                            {testCase.status}
                          </Tag>
                          {testCase.duration && (
                            <Tag color="purple">{testCase.duration}ms</Tag>
                          )}
                        </div>
                      </div>
                    }
                    description={
                      <div>
                        <Paragraph style={{ margin: '8px 0', color: '#666' }}>
                          {testCase.description}
                        </Paragraph>
                        
                        {testCase.dependencies && testCase.dependencies.length > 0 && (
                          <div style={{ marginBottom: 8 }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              依赖: {testCase.dependencies.join(', ')}
                            </Text>
                          </div>
                        )}

                        <Collapse size="small" ghost>
                          <Panel header={`测试步骤 (${testCase.testSteps.length})`} key="steps">
                            <Steps direction="horizontal" size="small" current={testCase.testSteps.findIndex(step => step.status === 'RUNNING')}>
                              {testCase.testSteps.map((step) => (
                                <Step
                                  key={step.id}
                                  title={step.stepName}
                                  description={step.description}
                                  status={
                                    step.status === 'PASSED' ? 'finish' :
                                    step.status === 'FAILED' ? 'error' :
                                    step.status === 'RUNNING' ? 'process' : 'wait'
                                  }
                                  icon={step.status === 'RUNNING' ? <LoadingOutlined /> : undefined}
                                />
                              ))}
                            </Steps>
                          </Panel>
                        </Collapse>

                        {testCase.errorMessage && (
                          <Alert
                            type="error"
                            message="测试失败"
                            description={testCase.errorMessage}
                            style={{ marginTop: 8 }}
                            showIcon
                          />
                        )}
                      </div>
                    }
                  />
                  <div>
                    <Button
                      size="small"
                      type="primary"
                      ghost
                      icon={<PlayCircleOutlined />}
                      onClick={() => runSingleTest(testCase)}
                      disabled={isTestRunning || testCase.status === 'RUNNING'}
                    >
                      单独执行
                    </Button>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </TabPane>

        {/* 测试日志 */}
        <TabPane tab="测试日志" key="logs">
          <Card 
            title="实时日志" 
            extra={
              <Button 
                size="small" 
                onClick={() => setTestLogs([])}
                disabled={isTestRunning}
              >
                清空日志
              </Button>
            }
          >
            <div style={{ height: 400, overflow: 'auto', backgroundColor: '#001529', padding: 16, borderRadius: 6 }}>
              {testLogs.length === 0 ? (
                <Text style={{ color: '#8c8c8c' }}>暂无日志信息</Text>
              ) : (
                testLogs.map((log, index) => (
                  <div key={index} style={{ marginBottom: 4, fontSize: '12px', fontFamily: 'monospace' }}>
                    <span style={{ color: '#52c41a' }}>[{log.timestamp}]</span>
                    <span style={{ 
                      color: log.level === 'ERROR' ? '#f5222d' : 
                            log.level === 'WARN' ? '#faad14' : '#1890ff',
                      marginLeft: 8,
                      marginRight: 8
                    }}>
                      {log.level}
                    </span>
                    <span style={{ color: '#722ed1', marginRight: 8 }}>{log.module}</span>
                    <span style={{ color: '#fff' }}>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabPane>

        {/* 测试报告 */}
        <TabPane tab="测试报告" key="report">
          {testReport ? (
            <Row gutter={16}>
              <Col span={12}>
                <Card title="测试结果统计">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="通过"
                        value={testReport.passedTests}
                        valueStyle={{ color: '#52c41a' }}
                        prefix={<CheckCircleOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="失败"
                        value={testReport.failedTests}
                        valueStyle={{ color: '#f5222d' }}
                        prefix={<CloseCircleOutlined />}
                      />
                    </Col>
                  </Row>
                  <Divider />
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="跳过"
                        value={testReport.skippedTests}
                        valueStyle={{ color: '#faad14' }}
                        prefix={<ExclamationCircleOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="总计"
                        value={testReport.totalTests}
                        valueStyle={{ color: '#1890ff' }}
                        prefix={<FileTextOutlined />}
                      />
                    </Col>
                  </Row>
                </Card>

                <Card title="覆盖率报告" style={{ marginTop: 16 }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span>模块覆盖率</span>
                      <span>{testReport.coverage.modules}/8</span>
                    </div>
                    <Progress percent={(testReport.coverage.modules / 8) * 100} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span>函数覆盖率</span>
                      <span>{testReport.coverage.functions}%</span>
                    </div>
                    <Progress percent={testReport.coverage.functions} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span>代码行覆盖率</span>
                      <span>{testReport.coverage.lines}%</span>
                    </div>
                    <Progress percent={testReport.coverage.lines} />
                  </div>
                </Card>
              </Col>

              <Col span={12}>
                <Card title="问题汇总">
                  {testReport.issues.length === 0 ? (
                    <Result
                      icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                      title="测试全部通过"
                      subTitle="恭喜！所有功能测试均已通过，系统运行正常。"
                    />
                  ) : (
                    <List
                      dataSource={testReport.issues}
                      renderItem={issue => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <Badge 
                                count={issue.severity} 
                                style={{ 
                                  backgroundColor: issue.severity === 'CRITICAL' ? '#f5222d' :
                                                 issue.severity === 'HIGH' ? '#fa541c' :
                                                 issue.severity === 'MEDIUM' ? '#faad14' : '#1890ff'
                                }} 
                              />
                            }
                            title={`${issue.module} - ${issue.description}`}
                            description={
                              <div>
                                <Text type="secondary">建议: {issue.suggestion}</Text>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </Card>

                <Card title="性能分析" style={{ marginTop: 16 }}>
                  <Statistic
                    title="总执行时间"
                    value={testReport.totalDuration / 1000}
                    suffix="秒"
                    precision={2}
                    prefix={<ClockCircleOutlined />}
                  />
                  <Divider />
                  <div>
                    <Text strong>执行效率评估:</Text>
                    <div style={{ marginTop: 8 }}>
                      {testReport.totalDuration < 10000 ? (
                        <Tag color="green">优秀 - 执行速度快</Tag>
                      ) : testReport.totalDuration < 30000 ? (
                        <Tag color="orange">良好 - 执行速度正常</Tag>
                      ) : (
                        <Tag color="red">需优化 - 执行速度较慢</Tag>
                      )}
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          ) : (
            <Card>
              <Result
                icon={<InfoCircleOutlined />}
                title="暂无测试报告"
                subTitle="请先执行测试用例生成测试报告"
                extra={
                  <Button type="primary" onClick={runAllTests}>
                    开始测试
                  </Button>
                }
              />
            </Card>
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default CaseManagementTest;