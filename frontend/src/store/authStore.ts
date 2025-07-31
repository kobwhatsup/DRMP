import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  name: string; // 用户真实姓名
  phone: string;
  avatar: string;
  organizationId: number;
  organizationName: string;
  type: 'admin' | 'source_org' | 'disposal_org'; // 用户类型，用于确定菜单和路由
  roles: string[];
  permissions: string[];
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: UserInfo | null; // 重命名为user，更简洁
  login: (accessToken: string, refreshToken: string, userInfo: UserInfo) => void;
  logout: () => void;
  updateUser: (userInfo: UserInfo) => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      user: null,

      login: (accessToken: string, refreshToken: string, userInfo: UserInfo) => {
        set({
          isAuthenticated: true,
          accessToken,
          refreshToken,
          user: userInfo,
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          user: null,
        });
      },

      updateUser: (userInfo: UserInfo) => {
        set({ user: userInfo });
      },

      hasPermission: (permission: string) => {
        const { user } = get();
        return user?.permissions?.includes(permission) || false;
      },

      hasRole: (role: string) => {
        const { user } = get();
        return user?.roles?.includes(role) || false;
      },
    }),
    {
      name: 'drmp-auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);