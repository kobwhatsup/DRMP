/**
 * 通用类型定义
 */

// 通用API响应格式
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// 分页响应格式
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

// 分页请求参数
export interface PageRequest {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

// 查询条件基类
export interface BaseQueryParams extends PageRequest {
  keyword?: string;
}

// 下拉选项
export interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// 表格列配置
export interface TableColumn {
  key: string;
  title: string;
  dataIndex?: string;
  width?: number;
  sorter?: boolean;
  render?: (value: any, record: any, index: number) => React.ReactNode;
}

// 统计数据
export interface StatisticData {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  precision?: number;
  valueStyle?: React.CSSProperties;
}

// 图表数据点
export interface ChartDataPoint {
  x: string | number;
  y: number;
  [key: string]: any;
}

// 文件上传响应
export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

// 批量操作结果
export interface BatchOperationResult {
  successCount: number;
  failureCount: number;
  totalCount: number;
  errors?: string[];
}

// 排序方向
export type SortOrder = 'ascend' | 'descend' | null;

// 状态类型
export type Status = 'success' | 'error' | 'warning' | 'info' | 'processing' | 'default';

// 操作按钮配置
export interface ActionButton {
  key: string;
  label: string;
  type?: 'primary' | 'default' | 'dashed' | 'text' | 'link';
  danger?: boolean;
  disabled?: boolean;
  onClick: (record: any) => void;
}

// 搜索表单字段配置
export interface SearchFormField {
  name: string;
  label: string;
  type: 'input' | 'select' | 'date' | 'dateRange' | 'number' | 'numberRange';
  options?: Option[];
  placeholder?: string;
  rules?: any[];
}

// 表单模式
export type FormMode = 'create' | 'edit' | 'view';

// 权限
export interface Permission {
  action: string;
  resource: string;
}

// 用户信息
export interface UserInfo {
  id: number;
  username: string;
  realName: string;
  email: string;
  phone: string;
  organizationId: number;
  organizationName: string;
  roles: string[];
  permissions: Permission[];
}

// 组织信息
export interface Organization {
  id: number;
  name: string;
  type: 'SOURCE' | 'DISPOSAL';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
}

export default {};