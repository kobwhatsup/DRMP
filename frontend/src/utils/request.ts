import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// 创建axios实例
const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 添加token到请求头
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;
    
    // Log response for debugging
    console.log('API Response:', response.config.url, data);
    
    // 统一处理后端返回的响应格式
    // 如果响应有code字段，按标准格式处理
    if (data && typeof data === 'object' && 'code' in data) {
      if (data.code === 200) {
        // 返回data字段中的实际数据
        return data.data || data;
      } else if (data.code === 401) {
        // 未授权，清除token并跳转到登录页
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(new Error('未授权访问'));
      } else {
        // 其他错误
        const errorMsg = data.message || '请求失败';
        message.error(errorMsg);
        return Promise.reject(new Error(errorMsg));
      }
    }
    
    // 如果没有code字段，直接返回数据（兼容旧接口）
    return data;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else {
      const errorMsg = error.response?.data?.message || error.message || '网络错误';
      message.error(errorMsg);
    }
    return Promise.reject(error);
  }
);

export const request = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return instance.get(url, config);
  },
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return instance.post(url, data, config);
  },
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return instance.put(url, data, config);
  },
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return instance.delete(url, config);
  },
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return instance.patch(url, data, config);
  },
};

export default request;