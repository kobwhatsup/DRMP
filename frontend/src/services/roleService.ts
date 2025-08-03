import api from '@/utils/api';

// 角色相关接口
export interface Role {
  id: number;
  roleCode: string;
  roleName: string;
  description?: string;
  roleType: string;
  roleTypeDesc: string;
  status: string;
  statusDesc: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  createdByName?: string;
  updatedByName?: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  permissionCode: string;
  permissionName: string;
  description?: string;
  resourceType: string;
  resourceTypeDesc: string;
  resourcePath?: string;
  httpMethod?: string;
  parentId: number;
  sortOrder: number;
  status: string;
  children?: Permission[];
}

export interface RoleCreateRequest {
  roleCode: string;
  roleName: string;
  description?: string;
  roleType: string;
  status?: string;
  sortOrder?: number;
  permissionIds?: number[];
}

export interface RoleUpdateRequest {
  roleName: string;
  description?: string;
  roleType?: string;
  status?: string;
  sortOrder?: number;
  permissionIds?: number[];
}

export interface RoleQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
  roleCode?: string;
  roleName?: string;
  roleType?: string;
  status?: string;
  keyword?: string;
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

// 角色管理服务
export const roleService = {
  // 分页查询角色
  getRoles: async (params: RoleQueryParams): Promise<PageResult<Role>> => {
    const response = await api.get('/system/roles', { params });
    return response.data;
  },

  // 获取角色详情
  getRoleById: async (id: number): Promise<Role> => {
    const response = await api.get(`/system/roles/${id}`);
    return response.data;
  },

  // 创建角色
  createRole: async (request: RoleCreateRequest): Promise<Role> => {
    const response = await api.post('/system/roles', request);
    return response.data;
  },

  // 更新角色
  updateRole: async (id: number, request: RoleUpdateRequest): Promise<Role> => {
    const response = await api.put(`/system/roles/${id}`, request);
    return response.data;
  },

  // 删除角色
  deleteRole: async (id: number): Promise<void> => {
    await api.delete(`/system/roles/${id}`);
  },

  // 批量删除角色
  deleteRoles: async (ids: number[]): Promise<void> => {
    await api.delete('/system/roles/batch', { data: ids });
  },

  // 启用角色
  enableRole: async (id: number): Promise<void> => {
    await api.put(`/system/roles/${id}/enable`);
  },

  // 禁用角色
  disableRole: async (id: number): Promise<void> => {
    await api.put(`/system/roles/${id}/disable`);
  },

  // 分配权限
  assignPermissions: async (id: number, permissionIds: number[]): Promise<void> => {
    await api.put(`/system/roles/${id}/permissions`, permissionIds);
  },

  // 检查角色编码是否存在
  checkRoleCode: async (roleCode: string, excludeId?: number): Promise<{ exists: boolean }> => {
    const response = await api.get('/system/roles/check-code', {
      params: { roleCode, excludeId }
    });
    return response.data;
  },

  // 获取所有权限树
  getPermissionTree: async (): Promise<Permission[]> => {
    const response = await api.get('/system/permissions/tree');
    return response.data;
  },

  // 获取所有启用的角色
  getActiveRoles: async (): Promise<Role[]> => {
    const response = await api.get('/system/roles/active');
    return response.data;
  }
};

// 权限管理服务
export const permissionService = {
  // 获取权限树
  getPermissionTree: async (): Promise<Permission[]> => {
    const response = await api.get('/system/permissions/tree');
    return response.data;
  },

  // 获取权限列表
  getPermissions: async (): Promise<Permission[]> => {
    const response = await api.get('/system/permissions');
    return response.data;
  },

  // 创建权限
  createPermission: async (request: any): Promise<Permission> => {
    const response = await api.post('/system/permissions', request);
    return response.data;
  },

  // 更新权限
  updatePermission: async (id: number, request: any): Promise<Permission> => {
    const response = await api.put(`/system/permissions/${id}`, request);
    return response.data;
  },

  // 删除权限
  deletePermission: async (id: number): Promise<void> => {
    await api.delete(`/system/permissions/${id}`);
  }
};