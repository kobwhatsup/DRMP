import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const CasePackageList: React.FC = () => {
  return (
    <div>
      <Title level={3}>案件包管理</Title>
      <Card>
        <p>案件包列表功能开发中...</p>
      </Card>
    </div>
  );
};

export default CasePackageList;