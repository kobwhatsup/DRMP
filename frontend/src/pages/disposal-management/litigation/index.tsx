import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Alert
} from 'antd';
import {
  BankOutlined,
  FileTextOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  AuditOutlined,
  BarChartOutlined,
  RobotOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import LitigationWorkbench from './components/LitigationWorkbench';
import SmartFilingSystem from './components/SmartFilingSystem';
import TrialManagement from './components/TrialManagement';
import ExecutionTracking from './components/ExecutionTracking';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Interfaces are now defined in individual components
// This main page serves as a coordinator for all litigation modules

const LitigationManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('workbench');
  const [moduleStats, setModuleStats] = useState({
    totalCases: 156,
    activeFiling: 23,
    upcomingTrials: 8,
    activeExecutions: 34,
    completedCases: 91
  });

  useEffect(() => {
    loadModuleStats();
  }, []);

  const loadModuleStats = async () => {
    setLoading(true);
    try {
      // 模拟统计数据，实际应用中从各个模块API获取
      const stats = {
        totalCases: 156,
        activeFiling: 23,
        upcomingTrials: 8,
        activeExecutions: 34,
        completedCases: 91
      };
      setModuleStats(stats);
    } catch (error) {
      console.error('加载模块统计失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'workbench':
        return <LitigationWorkbench />;
      case 'filing':
        return <SmartFilingSystem />;
      case 'trial':
        return <TrialManagement />;
      case 'execution':
        return <ExecutionTracking />;
      default:
        return <LitigationWorkbench />;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面标题和总览统计 */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <BankOutlined style={{ marginRight: '8px' }} />
          诉讼管理平台
        </Title>
        <Text type="secondary">
          全流程诉讼管理系统，涵盖智能立案、庭审管理、执行跟踪等核心功能
        </Text>
      </div>

      {/* 综合统计概览 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={5}>
          <Card>
            <Statistic
              title="案件总数"
              value={moduleStats.totalCases}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="立案处理中"
              value={moduleStats.activeFiling}
              prefix={<RobotOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="即将开庭"
              value={moduleStats.upcomingTrials}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="执行中"
              value={moduleStats.activeExecutions}
              prefix={<AuditOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card>
            <Statistic
              title="已完结"
              value={moduleStats.completedCases}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 功能模块说明 */}
      <Alert
        message="全面的诉讼管理功能"
        description="集成智能立案系统（支持网上立案和线下立案）、庭审全流程管理、执行跟踪系统和综合工作台，实现诉讼案件的全生命周期管理"
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
        action={
          <Space>
            <Button size="small" icon={<RobotOutlined />}>智能分案</Button>
            <Button size="small" icon={<GlobalOutlined />}>在线庭审</Button>
            <Button size="small" icon={<BarChartOutlined />}>数据报表</Button>
          </Space>
        }
      />

      {/* 主要功能模块 */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          size="large"
          tabBarStyle={{ marginBottom: '0' }}
        >
          <TabPane
            tab={
              <span>
                <BankOutlined />
                诉讼工作台
              </span>
            }
            key="workbench"
          >
            <div style={{ padding: '16px 0' }}>
              {renderTabContent()}
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <RobotOutlined />
                智能立案
              </span>
            }
            key="filing"
          >
            <div style={{ padding: '16px 0' }}>
              {renderTabContent()}
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <CalendarOutlined />
                庭审管理
              </span>
            }
            key="trial"
          >
            <div style={{ padding: '16px 0' }}>
              {renderTabContent()}
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <AuditOutlined />
                执行跟踪
              </span>
            }
            key="execution"
          >
            <div style={{ padding: '16px 0' }}>
              {renderTabContent()}
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

// 主要功能模块说明：
// 1. 诉讼工作台 - 综合仪表板，统计数据，待办事项，快捷操作
// 2. 智能立案 - 网上立案和线下立案双轨制，批量处理，法院系统对接
// 3. 庭审管理 - 庭审日历，准备清单，在线庭审，录音录像管理
// 4. 执行跟踪 - 财产调查，执行措施，回款管理，和解协商

export default LitigationManagement;