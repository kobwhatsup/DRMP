import React from 'react';
import { useParams } from 'react-router-dom';
import DisposalOrgDashboard from './DisposalOrgDashboard';

/**
 * 处置方效能看板路由包装器
 */
const DisposalOrgDashboardWrapper: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  
  return <DisposalOrgDashboard organizationId={Number(orgId) || 1} />;
};

export default DisposalOrgDashboardWrapper;