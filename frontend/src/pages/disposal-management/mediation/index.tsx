import React, { useState } from 'react';
import { Tabs } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  SolutionOutlined,
  PhoneOutlined,
  DollarOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import CaseWorkbench from './components/CaseWorkbench';
import DebtorManagement from './components/DebtorManagement';
import MediationProcess from './components/MediationProcess';
import CommunicationToolbox from './components/CommunicationToolbox';
import RepaymentManagement from './components/RepaymentManagement';
import PerformanceAnalysis from './components/PerformanceAnalysis';

const { TabPane } = Tabs;

const MediationManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('workbench');

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2>
          <TeamOutlined style={{ marginRight: '8px' }} />
          调解管理中心
        </h2>
      </div>

      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane
          tab={
            <span>
              <DashboardOutlined />
              工作台
            </span>
          }
          key="workbench"
        >
          <CaseWorkbench />
        </TabPane>

        <TabPane
          tab={
            <span>
              <TeamOutlined />
              债务人管理
            </span>
          }
          key="debtors"
        >
          <DebtorManagement />
        </TabPane>

        <TabPane
          tab={
            <span>
              <SolutionOutlined />
              调解过程
            </span>
          }
          key="process"
        >
          <MediationProcess />
        </TabPane>

        <TabPane
          tab={
            <span>
              <PhoneOutlined />
              沟通工具
            </span>
          }
          key="communication"
        >
          <CommunicationToolbox />
        </TabPane>

        <TabPane
          tab={
            <span>
              <DollarOutlined />
              还款管理
            </span>
          }
          key="repayment"
        >
          <RepaymentManagement />
        </TabPane>

        <TabPane
          tab={
            <span>
              <BarChartOutlined />
              业绩分析
            </span>
          }
          key="performance"
        >
          <PerformanceAnalysis />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default MediationManagement;