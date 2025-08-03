import React from 'react';
import { useParams } from 'react-router-dom';
import SourceOrgDashboard from './SourceOrgDashboard';

/**
 * 案源方业绩看板路由包装器
 */
const SourceOrgDashboardWrapper: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  
  return <SourceOrgDashboard organizationId={Number(orgId) || 1} />;
};

export default SourceOrgDashboardWrapper;