import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const CaseList: React.FC = () => {
  return (
    <div>
      <Title level={3}>案件管理</Title>
      <Card>
        <p>案件列表功能开发中...</p>
      </Card>
    </div>
  );
};

export default CaseList;