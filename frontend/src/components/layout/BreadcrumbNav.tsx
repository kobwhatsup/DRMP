import React from 'react';
import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import { getBreadcrumb, getMenuConfigByUserType } from '@/config/menuConfig';
import { useAuthStore } from '@/store/authStore';

const BreadcrumbNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  
  // 获取用户类型对应的菜单配置
  const userType = user?.type || 'admin';
  const menuConfig = getMenuConfigByUserType(userType as 'admin' | 'source_org' | 'disposal_org');
  
  // 获取面包屑导航数据
  const breadcrumbItems = getBreadcrumb(location.pathname, menuConfig);
  
  // 如果没有面包屑或只有一级，不显示面包屑
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb style={{ margin: '16px 0' }}>
      {/* 首页链接 */}
      <Breadcrumb.Item>
        <Link to="/dashboard">
          <HomeOutlined />
          <span style={{ marginLeft: 4 }}>首页</span>
        </Link>
      </Breadcrumb.Item>
      
      {/* 动态面包屑项目 */}
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        
        return (
          <Breadcrumb.Item key={item.path || index}>
            {!isLast && item.path ? (
              <Link to={item.path}>{item.name}</Link>
            ) : (
              <span>{item.name}</span>
            )}
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
};

export default BreadcrumbNav;