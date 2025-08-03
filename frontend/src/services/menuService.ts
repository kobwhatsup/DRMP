import request from '../utils/api';

export interface MenuCreateRequest {
  menuCode: string;
  menuName: string;
  parentId?: number;
  menuType: string;
  path?: string;
  component?: string;
  icon?: string;
  sortOrder?: number;
  visible?: boolean;
  permissionCode?: string;
  cacheFlag?: boolean;
  externalLink?: boolean;
  remark?: string;
}

export interface MenuUpdateRequest {
  menuName: string;
  parentId?: number;
  menuType?: string;
  path?: string;
  component?: string;
  icon?: string;
  sortOrder?: number;
  visible?: boolean;
  status?: string;
  permissionCode?: string;
  cacheFlag?: boolean;
  externalLink?: boolean;
  remark?: string;
}

export interface MenuResponse {
  id: number;
  menuCode: string;
  menuName: string;
  parentId: number;
  menuType: string;
  path?: string;
  component?: string;
  icon?: string;
  sortOrder: number;
  visible: boolean;
  status: string;
  permissionCode?: string;
  cacheFlag: boolean;
  externalLink: boolean;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  children?: MenuResponse[];
}

export const menuService = {
  createMenu: (data: MenuCreateRequest) => {
    return request.post<MenuResponse>('/system/menus', data);
  },

  updateMenu: (id: number, data: MenuUpdateRequest) => {
    return request.put<MenuResponse>(`/system/menus/${id}`, data);
  },

  deleteMenu: (id: number) => {
    return request.delete(`/system/menus/${id}`);
  },

  getMenu: (id: number) => {
    return request.get<MenuResponse>(`/system/menus/${id}`);
  },

  getMenuTree: () => {
    return request.get<MenuResponse[]>('/system/menus/tree');
  },

  getUserMenuTree: () => {
    return request.get<MenuResponse[]>('/system/menus/user-tree');
  },

  searchMenus: (keyword: string, page: number = 0, size: number = 20) => {
    return request.get('/system/menus/search', {
      params: { keyword, page, size }
    });
  },

  assignRoleMenus: (roleId: number, menuIds: number[]) => {
    return request.post(`/system/menus/role/${roleId}/assign`, menuIds);
  },

  getRoleMenuIds: (roleId: number) => {
    return request.get<number[]>(`/system/menus/role/${roleId}/menu-ids`);
  },

  getUserPermissions: () => {
    return request.get<string[]>('/system/menus/user-permissions');
  },

  refreshCache: () => {
    return request.post('/system/menus/refresh-cache');
  }
};