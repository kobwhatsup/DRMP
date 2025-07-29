import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const OrganizationDetail: React.FC = () => {
  return (
    <div>
      <Title level={3}>机构详情</Title>
      <Card>
        <p>机构详情功能开发中...</p>
      </Card>
    </div>
  );
};

export default OrganizationDetail;