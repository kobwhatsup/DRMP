import axios, { AxiosResponse } from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加认证token
    // 从localStorage获取持久化的认证信息
    const authStorage = localStorage.getItem('drmp-auth-storage');
    if (authStorage) {
      try {
        const authData = JSON.parse(authStorage);
        const token = authData.state?.accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Failed to parse auth storage:', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 开发环境mock数据
const isDevelopment = process.env.NODE_ENV === 'development';

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // 在开发环境下，如果API调用失败且使用的是mock token，返回mock数据
    if (isDevelopment && error.config?.headers?.Authorization?.startsWith('Bearer mock.')) {
      const url = error.config.url;
      
      // 案件包统计API的mock响应
      if (url === '/api/case-packages/statistics') {
        return Promise.resolve({
          data: {
            totalPackages: 28,
            draftPackages: 5,
            publishedPackages: 12,
            processingPackages: 8,
            completedPackages: 3,
            totalAmount: 45600000,
            recoveredAmount: 12800000,
            avgRecoveryRate: 28.1
          }
        });
      }
      
      // 案件包列表API的mock响应
      if (url === '/api/case-packages') {
        return Promise.resolve({
          data: {
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: 20,
            number: 0
          }
        });
      }

      // 报表分析API的mock响应
      if (url.includes('/api/reports/')) {
        const mockDashboardData = {
          overview: {
            totalCases: 15240,
            completedCases: 8320,
            totalAmount: 456000000,
            recoveredAmount: 128000000,
            recoveryRate: 28.1,
            avgProcessingDays: 45.6,
            activePackages: 89,
            partneredOrgs: 156,
            staffCount: 24,
            casesPerStaff: 346.7,
            successRate: 76.5,
            totalOrgs: 245,
            activeOrgs: 189,
            totalCasesLong: 1524000,
            totalRevenue: 52000000
          },
          trends: [
            { date: '2025-07-01', label: '7月1日', value: 1200000, count: 120, category: 'recovery' },
            { date: '2025-07-02', label: '7月2日', value: 980000, count: 98, category: 'recovery' },
            { date: '2025-07-03', label: '7月3日', value: 1350000, count: 135, category: 'recovery' },
            { date: '2025-07-04', label: '7月4日', value: 1500000, count: 150, category: 'recovery' },
            { date: '2025-07-05', label: '7月5日', value: 1120000, count: 112, category: 'recovery' },
            { date: '2025-07-06', label: '7月6日', value: 1680000, count: 168, category: 'recovery' },
            { date: '2025-07-07', label: '7月7日', value: 1420000, count: 142, category: 'recovery' }
          ],
          charts: {},
          rankings: [
            {
              id: 1,
              name: '东方处置集团',
              value: 89.5,
              rank: 1,
              category: 'DISPOSAL_ORG',
              details: {
                totalRecovered: 25600000,
                avgRecoveryRate: 89.5,
                totalCompleted: 456,
                avgProcessingDays: 32
              }
            },
            {
              id: 2,
              name: '华南资产管理',
              value: 87.2,
              rank: 2,
              category: 'DISPOSAL_ORG',
              details: {
                totalRecovered: 18900000,
                avgRecoveryRate: 87.2,
                totalCompleted: 342,
                avgProcessingDays: 28
              }
            },
            {
              id: 3,
              name: '北京调解中心',
              value: 85.8,
              rank: 3,
              category: 'DISPOSAL_ORG',
              details: {
                totalRecovered: 22100000,
                avgRecoveryRate: 85.8,
                totalCompleted: 398,
                avgProcessingDays: 35
              }
            },
            {
              id: 4,
              name: '张三',
              value: 92.3,
              rank: 1,
              category: 'STAFF',
              details: {
                handledCases: 89,
                completedCases: 82,
                recoveredAmount: 3200000,
                avgProcessingDays: 25
              }
            },
            {
              id: 5,
              name: '李四',
              value: 88.7,
              rank: 2,
              category: 'STAFF',
              details: {
                handledCases: 76,
                completedCases: 67,
                recoveredAmount: 2800000,
                avgProcessingDays: 30
              }
            }
          ]
        };

        return Promise.resolve({ data: mockDashboardData });
      }

      // 系统管理API的mock响应
      if (url === '/system/users') {
        return Promise.resolve({
          data: {
            content: [
              {
                id: 1,
                username: 'admin',
                email: 'admin@drmp.com',
                realName: '系统管理员',
                organizationName: '平台管理',
                userType: 'ADMIN',
                userTypeDesc: '管理员',
                status: 'ACTIVE',
                statusDesc: '启用',
                lastLoginTime: '2025-08-03 10:30:00',
                createdAt: '2025-01-01 00:00:00',
                roles: [{ id: 1, roleCode: 'SUPER_ADMIN', roleName: '超级管理员' }]
              },
              {
                id: 2,
                username: 'user001',
                email: 'user001@example.com',
                realName: '张三',
                organizationName: '东方银行',
                userType: 'ORGANIZATION_USER',
                userTypeDesc: '机构用户',
                status: 'ACTIVE',
                statusDesc: '启用',
                lastLoginTime: '2025-08-03 09:15:00',
                createdAt: '2025-02-15 10:30:00',
                roles: [{ id: 2, roleCode: 'ORG_USER', roleName: '机构用户' }]
              }
            ],
            totalElements: 2,
            totalPages: 1,
            size: 20,
            number: 0
          }
        });
      }

      if (url === '/system/roles') {
        return Promise.resolve({
          data: {
            content: [
              {
                id: 1,
                roleCode: 'SUPER_ADMIN',
                roleName: '超级管理员',
                description: '系统超级管理员',
                roleType: 'SYSTEM',
                status: 'ACTIVE',
                permissions: []
              },
              {
                id: 2,
                roleCode: 'ORG_USER',
                roleName: '机构用户',
                description: '机构普通用户',
                roleType: 'ORGANIZATION',
                status: 'ACTIVE',
                permissions: []
              }
            ],
            totalElements: 2,
            totalPages: 1,
            size: 20,
            number: 0
          }
        });
      }

      if (url === '/system/permissions/tree') {
        return Promise.resolve({
          data: [
            {
              id: 1,
              permissionCode: 'system',
              permissionName: '系统管理',
              resourceType: 'MENU',
              children: [
                {
                  id: 2,
                  permissionCode: 'system:user',
                  permissionName: '用户管理',
                  resourceType: 'MENU',
                  children: []
                },
                {
                  id: 3,
                  permissionCode: 'system:role',
                  permissionName: '角色管理',
                  resourceType: 'MENU',
                  children: []
                }
              ]
            }
          ]
        });
      }

      if (url === '/system/users/statistics') {
        return Promise.resolve({
          data: {
            totalUsers: 25,
            activeUsers: 20,
            disabledUsers: 3,
            lockedUsers: 2,
            pendingUsers: 5,
            todayNewUsers: 2,
            onlineUsers: 8
          }
        });
      }
    }
    
    // 统一错误处理
    if (error.response?.status === 401) {
      // 未授权，但在开发环境下使用mock token时不跳转
      if (isDevelopment && error.config?.headers?.Authorization?.startsWith('Bearer mock.')) {
        console.warn('开发模式: API认证失败，但使用mock token，不跳转登录页');
        return Promise.reject(error);
      }
      // 清除认证信息并跳转到登录页
      localStorage.removeItem('drmp-auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
export { api };