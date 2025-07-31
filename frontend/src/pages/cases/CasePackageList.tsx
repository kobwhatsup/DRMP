import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  message, 
  Tooltip,
  Dropdown,
  Progress
} from 'antd';
import type { MenuProps } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  SendOutlined,
  UndoOutlined,
  UserAddOutlined,
  CheckOutlined,
  CloseOutlined,
  MoreOutlined,
  ExportOutlined,
  ImportOutlined
} from '@ant-design/icons';
import DataTable from '../../components/common/DataTable';
import { casePackageService } from '../../services/casePackageService';
import type { CasePackage, CasePackageStatus } from '../../types/casePackage';
import type { QueryParams, PageResponse } from '../../components/common/DataTable';

/**
 * 案件包列表页面
 */
const CasePackageList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<PageResponse<CasePackage>>({
    content: [],
    number: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    numberOfElements: 0,
    empty: true
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 状态颜色映射
  const getStatusColor = (status: CasePackageStatus): string => {
    const colorMap: Record<CasePackageStatus, string> = {
      DRAFT: 'default',
      PUBLISHED: 'blue',
      WITHDRAWN: 'orange',
      ASSIGNED: 'purple',
      IN_PROGRESS: 'processing',
      COMPLETED: 'success',
      CANCELLED: 'error'
    };
    return colorMap[status] || 'default';
  };

  // 状态文本映射
  const getStatusText = (status: CasePackageStatus): string => {
    const textMap: Record<CasePackageStatus, string> = {
      DRAFT: '草稿',
      PUBLISHED: '已发布',
      WITHDRAWN: '已撤回',
      ASSIGNED: '已分配',
      IN_PROGRESS: '处置中',
      COMPLETED: '已完成',
      CANCELLED: '已取消'
    };
    return textMap[status] || status;
  };

  // 格式化金额
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // 加载数据
  const loadData = async (params: QueryParams) => {
    setLoading(true);
    try {
      const response = await casePackageService.getCasePackageList({
        keyword: params.keyword,
        status: params.status as CasePackageStatus,
        page: params.page || 0,
        size: params.size || 20,
        sortBy: params.sortBy || 'createdAt',
        sortDir: (params.sortDir as 'asc' | 'desc') || 'desc'
      });
      
      setDataSource(response);
    } catch (error) {
      message.error('加载数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 操作处理函数
  const handlePublish = async (id: number) => {
    try {
      await casePackageService.publishCasePackage(id);
      message.success('发布成功');
      loadData({});
    } catch (error) {
      message.error('发布失败');
    }
  };

  const handleWithdraw = async (id: number) => {
    try {
      await casePackageService.withdrawCasePackage(id);
      message.success('撤回成功');
      loadData({});
    } catch (error) {
      message.error('撤回失败');
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后不可恢复，确定要删除这个案件包吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await casePackageService.deleteCasePackage(id);
          message.success('删除成功');
          loadData({});
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  // 批量操作
  const handleBatchOperation = async (action: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要操作的案件包');
      return;
    }

    const actionText = {
      publish: '发布',
      withdraw: '撤回',
      delete: '删除'
    }[action] || action;

    Modal.confirm({
      title: `批量${actionText}`,
      content: `确定要${actionText}选中的 ${selectedRowKeys.length} 个案件包吗？`,
      onOk: async () => {
        try {
          await casePackageService.batchOperateCasePackages(
            selectedRowKeys as number[],
            action
          );
          message.success(`批量${actionText}成功`);
          setSelectedRowKeys([]);
          loadData({});
        } catch (error) {
          message.error(`批量${actionText}失败`);
        }
      }
    });
  };

  // 表格列定义
  const columns = [
    {
      title: '案件包编号',
      dataIndex: 'packageCode',
      key: 'packageCode',
      width: 150,
      sorter: true,
      fixed: 'left' as const
    },
    {
      title: '案件包名称',
      dataIndex: 'packageName',
      key: 'packageName',
      width: 200,
      sorter: true,
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: CasePackageStatus) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
      filters: [
        { text: '草稿', value: 'DRAFT' },
        { text: '已发布', value: 'PUBLISHED' },
        { text: '已撤回', value: 'WITHDRAWN' },
        { text: '已分配', value: 'ASSIGNED' },
        { text: '处置中', value: 'IN_PROGRESS' },
        { text: '已完成', value: 'COMPLETED' },
        { text: '已取消', value: 'CANCELLED' }
      ]
    },
    {
      title: '案件数量',
      dataIndex: 'caseCount',
      key: 'caseCount',
      width: 100,
      sorter: true,
      render: (count: number) => count?.toLocaleString() || 0
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      sorter: true,
      render: (amount: number) => formatAmount(amount || 0)
    },
    {
      title: '剩余金额',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      width: 120,
      sorter: true,
      render: (amount: number) => formatAmount(amount || 0)
    },
    {
      title: '回收率',
      dataIndex: 'expectedRecoveryRate',
      key: 'expectedRecoveryRate',
      width: 100,
      render: (rate: number) => rate ? `${(rate * 100).toFixed(1)}%` : '-'
    },
    {
      title: '进度',
      key: 'progress',
      width: 120,
      render: (record: CasePackage) => {
        const total = record.totalAmount || 0;
        const remaining = record.remainingAmount || 0;
        const recovered = total - remaining;
        const percent = total > 0 ? (recovered / total) * 100 : 0;
        
        return (
          <Progress 
            percent={percent} 
            
            format={() => `${percent.toFixed(1)}%`}
            strokeColor={percent > 70 ? '#52c41a' : percent > 40 ? '#faad14' : '#ff4d4f'}
          />
        );
      }
    },
    {
      title: '案源机构',
      dataIndex: 'sourceOrgName',
      key: 'sourceOrgName',
      width: 150,
      ellipsis: true
    },
    {
      title: '处置机构',
      dataIndex: 'disposalOrgName',
      key: 'disposalOrgName',
      width: 150,
      ellipsis: true,
      render: (text: string) => text || '-'
    },
    {
      title: '发布时间',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      width: 150,
      sorter: true,
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      sorter: true,
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (record: CasePackage) => {
        const actionItems: MenuProps['items'] = [];

        // 根据状态显示不同操作
        if (record.status === 'DRAFT') {
          actionItems.push(
            {
              key: 'edit',
              icon: <EditOutlined />,
              label: '编辑',
              onClick: () => {
                // TODO: 跳转到编辑页面
                console.log('Edit:', record.id);
              }
            },
            {
              key: 'publish',
              icon: <SendOutlined />,
              label: '发布',
              onClick: () => handlePublish(record.id)
            },
            {
              key: 'delete',
              icon: <DeleteOutlined />,
              label: '删除',
              danger: true,
              onClick: () => handleDelete(record.id)
            }
          );
        } else if (record.status === 'PUBLISHED') {
          actionItems.push(
            {
              key: 'withdraw',
              icon: <UndoOutlined />,
              label: '撤回',
              onClick: () => handleWithdraw(record.id)
            },
            {
              key: 'assign',
              icon: <UserAddOutlined />,
              label: '分配',
              onClick: () => {
                // TODO: 打开分配对话框
                console.log('Assign:', record.id);
              }
            }
          );
        } else if (record.status === 'ASSIGNED') {
          actionItems.push(
            {
              key: 'accept',
              icon: <CheckOutlined />,
              label: '接受',
              onClick: () => {
                // TODO: 接受案件包
                console.log('Accept:', record.id);
              }
            },
            {
              key: 'reject',
              icon: <CloseOutlined />,
              label: '拒绝',
              onClick: () => {
                // TODO: 拒绝案件包
                console.log('Reject:', record.id);
              }
            }
          );
        }

        // 通用操作
        actionItems.push(
          {
            type: 'divider'
          },
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: '查看详情',
            onClick: () => {
              // TODO: 跳转到详情页面
              console.log('View:', record.id);
            }
          }
        );

        return (
          <Space>
            <Tooltip title="查看详情">
              <Button 
                type="link" 
                
                icon={<EyeOutlined />}
                onClick={() => console.log('View:', record.id)}
              />
            </Tooltip>
            <Dropdown menu={{ items: actionItems }} trigger={['click']}>
              <Button type="link" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      }
    }
  ];

  // 工具栏按钮
  const toolbarButtons = [
    {
      key: 'create',
      type: 'primary' as const,
      icon: <PlusOutlined />,
      text: '新建案件包',
      onClick: () => {
        // TODO: 跳转到创建页面
        console.log('Create new case package');
      }
    },
    {
      key: 'import',
      icon: <ImportOutlined />,
      text: '批量导入',
      onClick: () => {
        // TODO: 打开批量导入对话框
        console.log('Import cases');
      }
    },
    {
      key: 'export',
      icon: <ExportOutlined />,
      text: '导出数据',
      onClick: () => {
        // TODO: 导出选中数据
        console.log('Export data');
      }
    }
  ];

  // 批量操作按钮
  const batchButtons = [
    {
      key: 'batch-publish',
      text: '批量发布',
      onClick: () => handleBatchOperation('publish')
    },
    {
      key: 'batch-withdraw',
      text: '批量撤回',
      onClick: () => handleBatchOperation('withdraw')
    },
    {
      key: 'batch-delete',
      text: '批量删除',
      danger: true,
      onClick: () => handleBatchOperation('delete')
    }
  ];

  return (
    <div className="case-package-list">
      <Card title="案件包管理" extra={
        <Space>
          <Button type="primary" icon={<PlusOutlined />}>
            新建案件包
          </Button>
        </Space>
      }>
        <DataTable<CasePackage>
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          onParamsChange={loadData}
          rowKey="id"
          scroll={{ x: 1800 }}
          searchPlaceholder="搜索案件包编号、名称"
        />
      </Card>
    </div>
  );
};

export default CasePackageList;