import React, { useState, useEffect } from 'react';
import { Table, Card, Space, Button, Input, Select, DatePicker, Row, Col, message, Tooltip, Dropdown } from 'antd';
import { SearchOutlined, ReloadOutlined, ExportOutlined, SettingOutlined, FilterOutlined } from '@ant-design/icons';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { useDebouncedCallback } from 'use-debounce';

const { Search } = Input;
const { RangePicker } = DatePicker;

// 分页响应接口
export interface PageResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

// 查询参数接口
export interface QueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  keyword?: string;
  [key: string]: any;
}

// 过滤器配置
export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'dateRange' | 'input';
  options?: { label: string; value: any }[];
  placeholder?: string;
  allowClear?: boolean;
}

// 批量操作配置
export interface BatchAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

// DataTable属性接口
export interface DataTableProps<T> extends Omit<TableProps<T>, 'dataSource' | 'pagination' | 'onChange' | 'title'> {
  // 数据源
  dataSource: PageResponse<T>;
  
  // 加载状态
  loading?: boolean;
  
  // 查询参数变化回调
  onParamsChange?: (params: QueryParams) => void;
  
  // 搜索配置
  searchable?: boolean;
  searchPlaceholder?: string;
  
  // 过滤器配置
  filters?: FilterConfig[];
  
  // 批量操作配置
  batchActions?: BatchAction[];
  onBatchAction?: (action: string, selectedKeys: React.Key[], selectedRows: T[]) => void;
  
  // 导出功能
  exportable?: boolean;
  onExport?: (params: QueryParams) => void;
  
  // 刷新功能
  refreshable?: boolean;
  onRefresh?: () => void;
  
  // 新建按钮
  creatable?: boolean;
  createText?: string;
  onCreate?: () => void;
  
  // 工具栏
  toolbar?: React.ReactNode;
  
  // 表格标题
  title?: string;
  
  // 自定义样式
  className?: string;
  
  // 初始查询参数
  initialParams?: QueryParams;
}

const DataTable = <T extends Record<string, any>>({
  dataSource,
  loading = false,
  onParamsChange,
  searchable = true,
  searchPlaceholder = "请输入搜索关键词",
  filters = [],
  batchActions = [],
  onBatchAction,
  exportable = false,
  onExport,
  refreshable = true,
  onRefresh,
  creatable = false,
  createText = "新建",
  onCreate,
  toolbar,
  title,
  className,
  initialParams = { page: 0, size: 20, sortBy: 'id', sortDir: 'desc' },
  columns,
  rowSelection,
  ...tableProps
}: DataTableProps<T>) => {
  const [queryParams, setQueryParams] = useState<QueryParams>(initialParams);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  // 防抖搜索
  const debouncedSearch = useDebouncedCallback((keyword: string) => {
    const newParams = {
      ...queryParams,
      keyword,
      page: 0, // 搜索时重置到第一页
    };
    setQueryParams(newParams);
    onParamsChange?.(newParams);
  }, 500);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    debouncedSearch(value);
  };

  // 处理过滤器变化
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    
    const newParams = {
      ...queryParams,
      ...newFilters,
      page: 0, // 筛选时重置到第一页
    };
    setQueryParams(newParams);
    onParamsChange?.(newParams);
  };

  // 处理表格变化（分页、排序）
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    const newParams = {
      ...queryParams,
      page: pagination.current - 1, // Ant Design分页从1开始，API从0开始
      size: pagination.pageSize,
      sortBy: sorter.field || queryParams.sortBy,
      sortDir: sorter.order === 'ascend' ? 'asc' : 'desc',
    };
    setQueryParams(newParams);
    onParamsChange?.(newParams);
  };

  // 处理行选择
  const handleRowSelectionChange = (keys: React.Key[], rows: T[]) => {
    setSelectedRowKeys(keys);
    setSelectedRows(rows);
  };

  // 处理刷新
  const handleRefresh = () => {
    onRefresh?.();
  };

  // 处理导出
  const handleExport = () => {
    onExport?.(queryParams);
  };

  // 处理批量操作
  const handleBatchAction = (action: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要操作的数据');
      return;
    }
    onBatchAction?.(action, selectedRowKeys, selectedRows);
  };

  // 构建行选择配置
  const buildRowSelection = () => {
    if (!rowSelection && batchActions.length === 0) {
      return undefined;
    }
    
    return {
      selectedRowKeys,
      onChange: handleRowSelectionChange,
      ...rowSelection,
    };
  };

  // 渲染搜索栏
  const renderSearchBar = () => {
    if (!searchable && filters.length === 0) return null;

    return (
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {searchable && (
          <Col flex="300px">
            <Search
              placeholder={searchPlaceholder}
              allowClear
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={handleSearch}
              onClear={() => handleSearch('')}
            />
          </Col>
        )}
        
        {filters.map((filter) => (
          <Col key={filter.key} flex="200px">
            {filter.type === 'select' && (
              <Select
                placeholder={filter.placeholder || filter.label}
                allowClear={filter.allowClear !== false}
                style={{ width: '100%' }}
                value={filterValues[filter.key]}
                onChange={(value) => handleFilterChange(filter.key, value)}
                options={filter.options}
              />
            )}
            {filter.type === 'dateRange' && (
              <RangePicker
                placeholder={['开始时间', '结束时间']}
                style={{ width: '100%' }}
                value={filterValues[filter.key]}
                onChange={(dates) => handleFilterChange(filter.key, dates)}
              />
            )}
            {filter.type === 'input' && (
              <Input
                placeholder={filter.placeholder || filter.label}
                allowClear
                value={filterValues[filter.key]}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              />
            )}
          </Col>
        ))}
      </Row>
    );
  };

  // 渲染工具栏
  const renderToolbar = () => {
    const hasActions = creatable || refreshable || exportable || batchActions.length > 0 || toolbar;
    if (!hasActions) return null;

    return (
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col>
          <Space>
            {creatable && (
              <Button type="primary" onClick={onCreate}>
                {createText}
              </Button>
            )}
            {selectedRowKeys.length > 0 && batchActions.length > 0 && (
              <Dropdown
                menu={{
                  items: batchActions.map(action => ({
                    key: action.key,
                    label: action.label,
                    icon: action.icon,
                    danger: action.danger,
                    disabled: action.disabled,
                  })),
                  onClick: ({ key }) => handleBatchAction(key),
                }}
              >
                <Button icon={<SettingOutlined />}>
                  批量操作 ({selectedRowKeys.length})
                </Button>
              </Dropdown>
            )}
          </Space>
        </Col>
        <Col>
          <Space>
            {toolbar}
            {refreshable && (
              <Tooltip title="刷新">
                <Button icon={<ReloadOutlined />} onClick={handleRefresh} />
              </Tooltip>
            )}
            {exportable && (
              <Tooltip title="导出">
                <Button icon={<ExportOutlined />} onClick={handleExport} />
              </Tooltip>
            )}
          </Space>
        </Col>
      </Row>
    );
  };

  return (
    <div className={className}>
      {title && (
        <Card title={title} bordered={false} style={{ marginBottom: 16 }}>
          {renderSearchBar()}
          {renderToolbar()}
        </Card>
      )}
      
      {!title && (
        <>
          {renderSearchBar()}
          {renderToolbar()}
        </>
      )}

      <Table
        {...tableProps}
        columns={columns}
        dataSource={dataSource.content}
        loading={loading}
        rowSelection={buildRowSelection()}
        onChange={handleTableChange}
        pagination={{
          current: dataSource.number + 1, // Ant Design分页从1开始
          pageSize: dataSource.size,
          total: dataSource.totalElements,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
      />
    </div>
  );
};

export default DataTable;