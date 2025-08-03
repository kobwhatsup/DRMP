import request from '../utils/api';

export interface PermissionCreateRequest {
  permissionCode: string;
  permissionName: string;
  description?: string;
  resourceType: string;
  resourcePath?: string;
  httpMethod?: string;
  parentId?: number;
  sortOrder?: number;
}

export interface PermissionUpdateRequest {
  permissionName: string;
  description?: string;
  resourceType?: string;
  resourcePath?: string;
  httpMethod?: string;
  parentId?: number;
  sortOrder?: number;
  status?: string;
}

export interface PermissionResponse {
  id: number;
  permissionCode: string;
  permissionName: string;
  description?: string;
  resourceType: string;
  resourcePath?: string;
  httpMethod?: string;
  parentId: number;
  sortOrder: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  children?: PermissionResponse[];
}

export const permissionService = {
  createPermission: (data: PermissionCreateRequest) => {
    return request.post<PermissionResponse>('/system/permissions', data);
  },

  updatePermission: (id: number, data: PermissionUpdateRequest) => {
    return request.put<PermissionResponse>(`/system/permissions/${id}`, data);
  },

  deletePermission: (id: number) => {
    return request.delete(`/system/permissions/${id}`);
  },

  getPermission: (id: number) => {
    return request.get<PermissionResponse>(`/system/permissions/${id}`);
  },

  getPermissionTree: () => {
    return request.get<PermissionResponse[]>('/system/permissions/tree');
  },

  getPermissionsByType: (resourceType: string) => {
    return request.get<PermissionResponse[]>(`/system/permissions/by-type/${resourceType}`);
  },

  searchPermissions: (keyword: string, page: number = 0, size: number = 20) => {
    return request.get('/system/permissions/search', {
      params: { keyword, page, size }
    });
  },

  assignRolePermissions: (roleId: number, permissionIds: number[]) => {
    return request.post(`/system/permissions/role/${roleId}/assign`, permissionIds);
  },

  getRolePermissionIds: (roleId: number) => {
    return request.get<number[]>(`/system/permissions/role/${roleId}/permission-ids`);
  },

  getMyPermissions: () => {
    return request.get<PermissionResponse[]>('/system/permissions/my-permissions');
  },

  getMyPermissionCodes: () => {
    return request.get<string[]>('/system/permissions/my-permission-codes');
  }
};