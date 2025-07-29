import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  realName: string;
  phone: string;
  avatar: string;
  organizationId: number;
  organizationName: string;
  organizationType: string;
  roles: string[];
  permissions: string[];
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  userInfo: UserInfo | null;
  login: (accessToken: string, refreshToken: string, userInfo: UserInfo) => void;
  logout: () => void;
  updateUserInfo: (userInfo: UserInfo) => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      userInfo: null,

      login: (accessToken: string, refreshToken: string, userInfo: UserInfo) => {
        set({
          isAuthenticated: true,
          accessToken,
          refreshToken,
          userInfo,
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          userInfo: null,
        });
      },

      updateUserInfo: (userInfo: UserInfo) => {
        set({ userInfo });
      },

      hasPermission: (permission: string) => {
        const { userInfo } = get();
        return userInfo?.permissions?.includes(permission) || false;
      },

      hasRole: (role: string) => {
        const { userInfo } = get();
        return userInfo?.roles?.includes(role) || false;
      },
    }),
    {
      name: 'drmp-auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userInfo: state.userInfo,
      }),
    }
  )
);