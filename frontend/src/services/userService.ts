import api from '@/utils/api';

// 用户相关接口
export interface User {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  realName?: string;
  avatarUrl?: string;
  organizationId?: number;
  organizationName?: string;
  userType: string;
  userTypeDesc: string;
  status: string;
  statusDesc: string;
  lastLoginTime?: string;
  lastLoginIp?: string;
  loginFailureCount: number;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  createdByName?: string;
  updatedByName?: string;
  roles: UserRole[];
}

export interface UserRole {
  id: number;
  roleCode: string;
  roleName: string;
  description?: string;
  roleType: string;
  status: string;
}

export interface UserCreateRequest {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  realName?: string;
  avatarUrl?: string;
  organizationId?: number;
  userType: string;
  status?: string;
  roleIds?: number[];
}

export interface UserUpdateRequest {
  email?: string;
  phone?: string;
  realName?: string;
  avatarUrl?: string;
  organizationId?: number;
  userType?: string;
  status?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  twoFactorEnabled?: boolean;
  roleIds?: number[];
}

export interface UserQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
  username?: string;
  email?: string;
  phone?: string;
  realName?: string;
  organizationId?: number;
  userType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  disabledUsers: number;
  lockedUsers: number;
  pendingUsers: number;
  todayNewUsers: number;
  onlineUsers: number;
}

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// 用户管理服务
export const userService = {
  // 分页查询用户
  getUsers: async (params: UserQueryParams): Promise<PageResult<User>> => {
    const response = await api.get('/system/users', { params });
    return response.data;
  },

  // 获取用户详情
  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`/system/users/${id}`);
    return response.data;
  },

  // 创建用户
  createUser: async (request: UserCreateRequest): Promise<User> => {
    const response = await api.post('/system/users', request);
    return response.data;
  },

  // 更新用户
  updateUser: async (id: number, request: UserUpdateRequest): Promise<User> => {
    const response = await api.put(`/system/users/${id}`, request);
    return response.data;
  },

  // 删除用户
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/system/users/${id}`);
  },

  // 批量删除用户
  deleteUsers: async (ids: number[]): Promise<void> => {
    await api.delete('/system/users/batch', { data: ids });
  },

  // 启用用户
  enableUser: async (id: number): Promise<void> => {
    await api.put(`/system/users/${id}/enable`);
  },

  // 禁用用户
  disableUser: async (id: number): Promise<void> => {
    await api.put(`/system/users/${id}/disable`);
  },

  // 锁定用户
  lockUser: async (id: number): Promise<void> => {
    await api.put(`/system/users/${id}/lock`);
  },

  // 解锁用户
  unlockUser: async (id: number): Promise<void> => {
    await api.put(`/system/users/${id}/unlock`);
  },

  // 重置密码
  resetPassword: async (id: number): Promise<{ newPassword: string }> => {
    const response = await api.put(`/system/users/${id}/reset-password`);
    return response.data;
  },

  // 分配角色
  assignRoles: async (id: number, roleIds: number[]): Promise<void> => {
    await api.put(`/system/users/${id}/roles`, roleIds);
  },

  // 移除角色
  removeRoles: async (id: number, roleIds: number[]): Promise<void> => {
    await api.delete(`/system/users/${id}/roles`, { data: roleIds });
  },

  // 检查用户名是否存在
  checkUsername: async (username: string): Promise<{ exists: boolean }> => {
    const response = await api.get('/system/users/check-username', {
      params: { username }
    });
    return response.data;
  },

  // 检查邮箱是否存在
  checkEmail: async (email: string): Promise<{ exists: boolean }> => {
    const response = await api.get('/system/users/check-email', {
      params: { email }
    });
    return response.data;
  },

  // 检查手机号是否存在
  checkPhone: async (phone: string): Promise<{ exists: boolean }> => {
    const response = await api.get('/system/users/check-phone', {
      params: { phone }
    });
    return response.data;
  },

  // 获取用户统计
  getUserStatistics: async (): Promise<UserStatistics> => {
    const response = await api.get('/system/users/statistics');
    return response.data;
  }
};