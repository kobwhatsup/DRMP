import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const ReportDashboard: React.FC = () => {
  return (
    <div>
      <Title level={3}>数据报表</Title>
      <Card>
        <p>数据报表功能开发中...</p>
      </Card>
    </div>
  );
};

export default ReportDashboard;