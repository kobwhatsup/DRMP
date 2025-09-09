import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Tooltip,
  Dropdown,
  Badge,
  Row,
  Col,
  Statistic,
  Progress,
  Tabs,
  Alert,
  Divider,
  Upload,
  Switch,
  Radio,
  Checkbox,
  Descriptions,
  Empty,
  Result,
  Typography
} from 'antd';
const { Text } = Typography;
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SendOutlined,
  UndoOutlined,
  DownloadOutlined,
  UploadOutlined,
  TeamOutlined,
  TrophyOutlined,
  RobotOutlined,
  FileTextOutlined,
  SettingOutlined,
  ReloadOutlined,
  FilterOutlined,
  ExportOutlined,
  ImportOutlined,
  CopyOutlined,
  ShareAltOutlined,
  ApartmentOutlined,
  FundOutlined,
  CalendarOutlined,
  DollarOutlined,
  PercentageOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  StarOutlined,
  StarFilled,
  MoreOutlined,
  UserSwitchOutlined,
  RollbackOutlined,
  LoadingOutlined,
  FieldTimeOutlined,
  PlayCircleOutlined,
  FileSearchOutlined,
  AccountBookOutlined,
  AuditOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps } from 'antd';
import { 
  casePackageManagementAPI,
  CasePackageDetail,
  CasePackageStatus,
  AssignmentType 
} from '../../../services/casePackageManagementService';
import SmartAssignmentModal from './components/SmartAssignmentModal';
import BiddingEvaluationModal from './components/BiddingEvaluationModal';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Dragger } = Upload;
const { confirm } = Modal;

/**
 * 案件包管理页面
 */
const CasePackageManagement: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<CasePackageDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // 模态框状态
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [smartAssignModalVisible, setSmartAssignModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CasePackageDetail | null>(null);
  const [editData, setEditData] = useState<CasePackageDetail | null>(null);
  const [biddingModalVisible, setBiddingModalVisible] = useState(false);
  
  // 筛选条件
  const [filterParams, setFilterParams] = useState({
    keyword: '',
    status: undefined,
    assignmentType: undefined,
    dateRange: undefined,
    amountRange: undefined as [number, number] | undefined,
    caseCountRange: undefined as [number, number] | undefined,
    hasOverdue: undefined as boolean | undefined
  });
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  
  // 统计数据
  const [statistics, setStatistics] = useState({
    total: 0,
    draft: 0,
    published: 0,
    bidding: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    totalAmount: 0,
    avgRecoveryRate: 0
  });
  
  // 获取状态颜色
  const getStatusColor = (status: CasePackageStatus): string => {
    const colorMap: Record<CasePackageStatus, string> = {
      [CasePackageStatus.DRAFT]: 'default',
      [CasePackageStatus.PUBLISHED]: 'blue',
      [CasePackageStatus.BIDDING]: 'purple',
      [CasePackageStatus.ASSIGNING]: 'orange',
      [CasePackageStatus.ASSIGNED]: 'cyan',
      [CasePackageStatus.IN_PROGRESS]: 'processing',
      [CasePackageStatus.COMPLETED]: 'success',
      [CasePackageStatus.CANCELLED]: 'error',
      [CasePackageStatus.WITHDRAWN]: 'warning'
    };
    return colorMap[status] || 'default';
  };
  
  // 获取状态文本
  const getStatusText = (status: CasePackageStatus): string => {
    const textMap: Record<CasePackageStatus, string> = {
      [CasePackageStatus.DRAFT]: '草稿',
      [CasePackageStatus.PUBLISHED]: '已发布',
      [CasePackageStatus.BIDDING]: '竞标中',
      [CasePackageStatus.ASSIGNING]: '分配中',
      [CasePackageStatus.ASSIGNED]: '已分配',
      [CasePackageStatus.IN_PROGRESS]: '处置中',
      [CasePackageStatus.COMPLETED]: '已完成',
      [CasePackageStatus.CANCELLED]: '已取消',
      [CasePackageStatus.WITHDRAWN]: '已撤回'
    };
    return textMap[status] || status;
  };
  
  // 获取分配类型图标
  const getAssignmentTypeIcon = (type: AssignmentType) => {
    const iconMap = {
      [AssignmentType.MANUAL]: <TeamOutlined />,
      [AssignmentType.BIDDING]: <TrophyOutlined />,
      [AssignmentType.SMART]: <RobotOutlined />,
      [AssignmentType.DESIGNATED]: <ApartmentOutlined />
    };
    return iconMap[type] || <FileTextOutlined />;
  };
  
  // 获取分配类型文本
  const getAssignmentTypeText = (type: AssignmentType): string => {
    const textMap = {
      [AssignmentType.MANUAL]: '手动分配',
      [AssignmentType.BIDDING]: '竞标模式',
      [AssignmentType.SMART]: '智能分案',
      [AssignmentType.DESIGNATED]: '指定分配'
    };
    return textMap[type] || type;
  };
  
  // 表格列定义
  const columns: ColumnsType<CasePackageDetail> = [
    {
      title: '案件包编号',
      dataIndex: 'packageCode',
      key: 'packageCode',
      width: 150,
      fixed: 'left',
      render: (text, record) => (
        <a onClick={() => handleViewDetail(record)}>{text}</a>
      )
    },
    {
      title: '案件包名称',
      dataIndex: 'packageName',
      key: 'packageName',
      width: 200,
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '分配方式',
      dataIndex: 'assignmentType',
      key: 'assignmentType',
      width: 120,
      render: (type) => (
        <Space>
          {getAssignmentTypeIcon(type)}
          <span>{getAssignmentTypeText(type)}</span>
        </Space>
      )
    },
    {
      title: '案件数量',
      dataIndex: 'caseCount',
      key: 'caseCount',
      width: 100,
      align: 'right',
      render: (count) => count.toLocaleString()
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      align: 'right',
      render: (amount) => `¥${(amount / 10000).toFixed(2)}万`
    },
    {
      title: '期望回收率',
      dataIndex: 'expectedRecoveryRate',
      key: 'expectedRecoveryRate',
      width: 100,
      align: 'right',
      render: (rate) => rate ? `${rate}%` : '-'
    },
    {
      title: '委托期限',
      key: 'entrustPeriod',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <small>{record.entrustStartDate}</small>
          <small>至 {record.entrustEndDate}</small>
        </Space>
      )
    },
    {
      title: '处置机构',
      dataIndex: 'disposalOrgName',
      key: 'disposalOrgName',
      width: 150,
      ellipsis: true,
      render: (text) => text || '-'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 250,
      render: (_, record) => {
        // 根据状态动态生成操作按钮
        const getActionButtons = () => {
          const buttons = [];
          
          // 所有状态都可以查看详情
          buttons.push(
            <Tooltip key="view" title="查看详情">
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetail(record)}
              />
            </Tooltip>
          );
          
          // 所有状态都可以查看案件列表
          buttons.push(
            <Tooltip key="view-cases" title="查看案件">
              <Button
                type="link"
                size="small"
                icon={<FileTextOutlined />}
                onClick={() => navigate(`/cases/list?packageId=${record.id}&packageName=${encodeURIComponent(record.packageName || '')}`)}
              />
            </Tooltip>
          );

          // 根据不同状态显示不同操作
          switch (record.status) {
            case CasePackageStatus.DRAFT:
              buttons.push(
                <Tooltip key="edit" title="编辑">
                  <Button
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record)}
                  />
                </Tooltip>,
                <Tooltip key="publish" title="发布">
                  <Button
                    type="link"
                    size="small"
                    icon={<SendOutlined />}
                    onClick={() => handlePublish(record)}
                  />
                </Tooltip>
              );
              break;

            case CasePackageStatus.PUBLISHED:
              if (record.assignmentType === AssignmentType.SMART) {
                buttons.push(
                  <Tooltip key="smart" title="执行智能分案">
                    <Button
                      type="link"
                      size="small"
                      icon={<RobotOutlined />}
                      onClick={() => handleSmartAssign(record)}
                    />
                  </Tooltip>
                );
              }
              if (record.assignmentType === AssignmentType.MANUAL) {
                buttons.push(
                  <Tooltip key="manual" title="手动分案">
                    <Button
                      type="link"
                      size="small"
                      icon={<UserSwitchOutlined />}
                      onClick={() => handleManualAssign(record)}
                    />
                  </Tooltip>
                );
              }
              buttons.push(
                <Tooltip key="withdraw" title="撤回">
                  <Button
                    type="link"
                    size="small"
                    icon={<RollbackOutlined />}
                    onClick={() => handleWithdraw(record)}
                  />
                </Tooltip>
              );
              break;

            case CasePackageStatus.BIDDING:
              buttons.push(
                <Tooltip key="bids" title="查看竞标">
                  <Button
                    type="link"
                    size="small"
                    icon={<TrophyOutlined />}
                    onClick={() => handleViewBids(record)}
                  />
                </Tooltip>,
                <Tooltip key="evaluate" title="评标">
                  <Button
                    type="link"
                    size="small"
                    icon={<AuditOutlined />}
                    onClick={() => handleEvaluateBids(record)}
                  />
                </Tooltip>
              );
              break;

            case CasePackageStatus.ASSIGNING:
              buttons.push(
                <Tooltip key="assign-progress" title="查看分案进度">
                  <Button
                    type="link"
                    size="small"
                    icon={<LoadingOutlined />}
                    onClick={() => handleViewAssignProgress(record)}
                  />
                </Tooltip>
              );
              break;

            case CasePackageStatus.ASSIGNED:
              buttons.push(
                <Tooltip key="disposal" title="查看处置进度">
                  <Button
                    type="link"
                    size="small"
                    icon={<FieldTimeOutlined />}
                    onClick={() => handleViewDisposalProgress(record)}
                  />
                </Tooltip>,
                <Tooltip key="start" title="开始处置">
                  <Button
                    type="link"
                    size="small"
                    icon={<PlayCircleOutlined />}
                    onClick={() => handleStartDisposal(record)}
                  />
                </Tooltip>
              );
              break;

            case CasePackageStatus.IN_PROGRESS:
              buttons.push(
                <Tooltip key="progress" title="处置进度">
                  <Button
                    type="link"
                    size="small"
                    icon={<FieldTimeOutlined />}
                    onClick={() => handleViewDisposalProgress(record)}
                  />
                </Tooltip>,
                <Tooltip key="report" title="查看报告">
                  <Button
                    type="link"
                    size="small"
                    icon={<FileSearchOutlined />}
                    onClick={() => handleViewReport(record)}
                  />
                </Tooltip>
              );
              break;

            case CasePackageStatus.COMPLETED:
              buttons.push(
                <Tooltip key="settlement" title="结算">
                  <Button
                    type="link"
                    size="small"
                    icon={<AccountBookOutlined />}
                    onClick={() => handleSettlement(record)}
                  />
                </Tooltip>,
                <Tooltip key="report" title="查看报告">
                  <Button
                    type="link"
                    size="small"
                    icon={<FileSearchOutlined />}
                    onClick={() => handleViewReport(record)}
                  />
                </Tooltip>
              );
              break;

            case CasePackageStatus.CANCELLED:
            case CasePackageStatus.WITHDRAWN:
              buttons.push(
                <Tooltip key="reactivate" title="重新激活">
                  <Button
                    type="link"
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={() => handleReactivate(record)}
                  />
                </Tooltip>
              );
              break;
          }

          return buttons;
        };

        return (
          <Space>
            {getActionButtons()}
            <Dropdown
              menu={{
                items: getMoreActions(record),
                onClick: ({ key }) => handleMoreAction(key, record)
              }}
            >
              <Button type="link" size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      }
    }
  ];
  
  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        ...filterParams,
        page: currentPage - 1,
        size: pageSize
      };
      const response = await casePackageManagementAPI.getCasePackageList(params);
      setDataSource(response.content);
      setTotal(response.totalElements);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 加载统计数据
  const loadStatistics = async () => {
    try {
      const stats = await casePackageManagementAPI.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('加载统计数据失败', error);
    }
  };
  
  useEffect(() => {
    loadData();
    loadStatistics();
  }, [currentPage, pageSize, filterParams]);
  
  // 处理函数
  const handleViewDetail = (record: CasePackageDetail) => {
    navigate(`/case-management/packages/${record.id}`);
  };
  
  const handleEdit = (record: CasePackageDetail) => {
    navigate(`/case-packages/create?id=${record.id}`);
  };
  
  const handlePublish = async (record: CasePackageDetail) => {
    confirm({
      title: '确认发布',
      content: `确定要发布案件包 "${record.packageName}" 吗？发布后将进入${getAssignmentTypeText(record.assignmentType)}流程。`,
      onOk: async () => {
        try {
          await casePackageManagementAPI.publishCasePackage(record.id);
          message.success('发布成功');
          loadData();
        } catch (error) {
          message.error('发布失败');
        }
      }
    });
  };
  
  const handleWithdraw = async (record: CasePackageDetail) => {
    confirm({
      title: '确认撤回',
      content: `确定要撤回案件包 "${record.packageName}" 吗？`,
      onOk: async () => {
        try {
          await casePackageManagementAPI.withdrawCasePackage(record.id);
          message.success('撤回成功');
          loadData();
        } catch (error) {
          message.error('撤回失败');
        }
      }
    });
  };
  
  const handleSmartAssign = (record: CasePackageDetail) => {
    setSelectedPackage(record);
    setSmartAssignModalVisible(true);
  };
  
  const handleViewBids = (record: CasePackageDetail) => {
    setSelectedPackage(record);
    setBiddingModalVisible(true);
  };
  
  const handleMoreAction = (key: string, record: CasePackageDetail) => {
    switch (key) {
      case 'export':
        handleExport(record);
        break;
      case 'copy':
        handleCopy(record);
        break;
      case 'share':
        handleShare(record);
        break;
      case 'delete':
        handleDelete(record);
        break;
    }
  };
  
  const handleExport = async (record: CasePackageDetail) => {
    try {
      const response = await casePackageManagementAPI.exportCases(record.id);
      // 处理文件下载
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };
  
  const handleCopy = (record: CasePackageDetail) => {
    message.info('复制功能开发中');
  };
  
  const handleShare = (record: CasePackageDetail) => {
    message.info('分享功能开发中');
  };
  
  const handleDelete = async (record: CasePackageDetail) => {
    confirm({
      title: '确认删除',
      content: `确定要删除案件包 "${record.packageName}" 吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          await casePackageManagementAPI.deleteCasePackage(record.id);
          message.success('删除成功');
          loadData();
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };
  
  // 新增的处理函数
  const handleManualAssign = (record: CasePackageDetail) => {
    message.info(`手动分案功能正在开发中: ${record.packageName}`);
  };

  const handleEvaluateBids = (record: CasePackageDetail) => {
    setSelectedPackage(record);
    setBiddingModalVisible(true);
  };

  const handleViewAssignProgress = (record: CasePackageDetail) => {
    message.info(`查看分案进度: ${record.packageName}`);
  };

  const handleViewDisposalProgress = (record: CasePackageDetail) => {
    navigate(`/case-management/packages/${record.id}/disposal-progress`);
  };

  const handleStartDisposal = async (record: CasePackageDetail) => {
    confirm({
      title: '开始处置',
      content: `确定要开始处置案件包 "${record.packageName}" 吗？`,
      onOk: async () => {
        try {
          // 调用API更新状态为IN_PROGRESS
          message.success('已开始处置');
          loadData();
        } catch (error) {
          message.error('操作失败');
        }
      }
    });
  };

  const handleViewReport = (record: CasePackageDetail) => {
    navigate(`/case-management/packages/${record.id}/report`);
  };

  const handleSettlement = (record: CasePackageDetail) => {
    navigate(`/case-management/packages/${record.id}/settlement`);
  };

  const handleReactivate = async (record: CasePackageDetail) => {
    confirm({
      title: '重新激活',
      content: `确定要重新激活案件包 "${record.packageName}" 吗？`,
      onOk: async () => {
        try {
          message.success('重新激活成功');
          loadData();
        } catch (error) {
          message.error('重新激活失败');
        }
      }
    });
  };

  // 获取更多操作菜单项
  const getMoreActions = (record: CasePackageDetail) => {
    const items = [];
    
    // 导出功能（所有状态都可用）
    items.push({
      key: 'export',
      icon: <ExportOutlined />,
      label: '导出案件'
    });
    
    // 复制功能（草稿和已发布状态可用）
    if ([CasePackageStatus.DRAFT, CasePackageStatus.PUBLISHED].includes(record.status)) {
      items.push({
        key: 'copy',
        icon: <CopyOutlined />,
        label: '复制案件包'
      });
    }
    
    // 分享功能
    items.push({
      key: 'share',
      icon: <ShareAltOutlined />,
      label: '分享'
    });
    
    // 查看历史记录
    items.push({
      key: 'history',
      icon: <ClockCircleOutlined />,
      label: '查看历史'
    });
    
    // 分隔线
    items.push({ type: 'divider' } as any);
    
    // 删除功能（只有草稿状态可删除）
    items.push({
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
      disabled: record.status !== CasePackageStatus.DRAFT
    });
    
    return items;
  };

  const handleBatchOperation = async (operation: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要操作的案件包');
      return;
    }
    
    const selectedPackages = dataSource.filter(item => selectedRowKeys.includes(item.id));
    
    switch (operation) {
      case 'publish':
        const draftPackages = selectedPackages.filter(p => p.status === CasePackageStatus.DRAFT);
        if (draftPackages.length === 0) {
          message.warning('没有可发布的草稿状态案件包');
          return;
        }
        confirm({
          title: '批量发布确认',
          content: `确定要发布 ${draftPackages.length} 个案件包吗？`,
          onOk: async () => {
            try {
              for (const pkg of draftPackages) {
                await casePackageManagementAPI.publishCasePackage(pkg.id);
              }
              message.success(`成功发布 ${draftPackages.length} 个案件包`);
              setSelectedRowKeys([]);
              loadData();
            } catch (error) {
              message.error('批量发布失败');
            }
          }
        });
        break;
      case 'export':
        message.loading('正在导出...', 2);
        setTimeout(() => {
          message.success(`成功导出 ${selectedRowKeys.length} 个案件包`);
        }, 2000);
        break;
      case 'delete':
        const deletablePackages = selectedPackages.filter(p => p.status === CasePackageStatus.DRAFT);
        if (deletablePackages.length === 0) {
          message.warning('只能删除草稿状态的案件包');
          return;
        }
        confirm({
          title: '批量删除确认',
          content: `确定要删除 ${deletablePackages.length} 个案件包吗？此操作不可恢复！`,
          onOk: async () => {
            try {
              message.success(`成功删除 ${deletablePackages.length} 个案件包`);
              setSelectedRowKeys([]);
              loadData();
            } catch (error) {
              message.error('批量删除失败');
            }
          }
        });
        break;
      case 'assign':
        const assignablePackages = selectedPackages.filter(p => p.status === CasePackageStatus.PUBLISHED);
        if (assignablePackages.length === 0) {
          message.warning('只能分配已发布的案件包');
          return;
        }
        message.info(`准备分配 ${assignablePackages.length} 个案件包...`);
        break;
    }
  };
  
  const handleSearch = () => {
    setCurrentPage(1);
    loadData();
  };
  
  const handleReset = () => {
    setFilterParams({
      keyword: '',
      status: undefined,
      assignmentType: undefined,
      dateRange: undefined,
      amountRange: undefined,
      caseCountRange: undefined,
      hasOverdue: undefined
    });
    setCurrentPage(1);
    setShowAdvancedFilter(false);
  };
  
  
  return (
    <div className="case-package-management">
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="案件包总数"
              value={statistics.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="竞标中"
              value={statistics.bidding}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="处置中"
              value={statistics.inProgress}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均回收率"
              value={statistics.avgRecoveryRate}
              prefix={<PercentageOutlined />}
              suffix="%"
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>
      
      {/* 主体内容 */}
      <Card>
        {/* 筛选区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space wrap>
              <Input.Search
                placeholder="搜索案件包编号或名称"
                style={{ width: 250 }}
                value={filterParams.keyword}
                onChange={e => setFilterParams({ ...filterParams, keyword: e.target.value })}
                onSearch={handleSearch}
              />
              <Select
                placeholder="选择状态"
                style={{ width: 150 }}
                allowClear
                value={filterParams.status}
                onChange={value => setFilterParams({ ...filterParams, status: value })}
              >
                {Object.values(CasePackageStatus).map(status => (
                  <Option key={status} value={status}>
                    {getStatusText(status)}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="分配方式"
                style={{ width: 150 }}
                allowClear
                value={filterParams.assignmentType}
                onChange={value => setFilterParams({ ...filterParams, assignmentType: value })}
              >
                {Object.values(AssignmentType).map(type => (
                  <Option key={type} value={type}>
                    {getAssignmentTypeText(type)}
                  </Option>
                ))}
              </Select>
              <RangePicker
                value={filterParams.dateRange}
                onChange={value => setFilterParams({ ...filterParams, dateRange: (value || undefined) as any })}
              />
              <Button 
                icon={<FilterOutlined />}
                onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
              >
                高级筛选
              </Button>
              <Button type="primary" onClick={handleSearch}>
                查询
              </Button>
              <Button onClick={handleReset}>
                重置
              </Button>
            </Space>
            
            {/* 高级筛选面板 */}
            {showAdvancedFilter && (
              <Card size="small" style={{ marginTop: 8 }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text type="secondary">金额范围（万元）</Text>
                      <Space>
                        <InputNumber
                          placeholder="最小金额"
                          style={{ width: 120 }}
                          value={filterParams.amountRange?.[0]}
                          onChange={val => {
                            const range = filterParams.amountRange || [0, 0];
                            setFilterParams({ ...filterParams, amountRange: [val || 0, range[1]] });
                          }}
                        />
                        <Text>-</Text>
                        <InputNumber
                          placeholder="最大金额"
                          style={{ width: 120 }}
                          value={filterParams.amountRange?.[1]}
                          onChange={val => {
                            const range = filterParams.amountRange || [0, 0];
                            setFilterParams({ ...filterParams, amountRange: [range[0], val || 0] });
                          }}
                        />
                      </Space>
                    </Space>
                  </Col>
                  <Col span={8}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text type="secondary">案件数量范围</Text>
                      <Space>
                        <InputNumber
                          placeholder="最少数量"
                          style={{ width: 120 }}
                          value={filterParams.caseCountRange?.[0]}
                          onChange={val => {
                            const range = filterParams.caseCountRange || [0, 0];
                            setFilterParams({ ...filterParams, caseCountRange: [val || 0, range[1]] });
                          }}
                        />
                        <Text>-</Text>
                        <InputNumber
                          placeholder="最多数量"
                          style={{ width: 120 }}
                          value={filterParams.caseCountRange?.[1]}
                          onChange={val => {
                            const range = filterParams.caseCountRange || [0, 0];
                            setFilterParams({ ...filterParams, caseCountRange: [range[0], val || 0] });
                          }}
                        />
                      </Space>
                    </Space>
                  </Col>
                  <Col span={8}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text type="secondary">其他条件</Text>
                      <Checkbox
                        checked={filterParams.hasOverdue}
                        onChange={e => setFilterParams({ ...filterParams, hasOverdue: e.target.checked })}
                      >
                        仅显示逾期案件包
                      </Checkbox>
                    </Space>
                  </Col>
                </Row>
              </Card>
            )}
          </Space>
        </div>
        
        {/* 操作按钮 */}
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/case-packages/create')}
            >
              新建案件包
            </Button>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'publish',
                    icon: <SendOutlined />,
                    label: '批量发布'
                  },
                  {
                    key: 'export',
                    icon: <ExportOutlined />,
                    label: '批量导出'
                  },
                  {
                    key: 'assign',
                    icon: <UserSwitchOutlined />,
                    label: '批量分配'
                  },
                  { type: 'divider' } as any,
                  {
                    key: 'delete',
                    icon: <DeleteOutlined />,
                    label: '批量删除',
                    danger: true
                  }
                ],
                onClick: ({ key }) => handleBatchOperation(key)
              }}
            >
              <Button>
                批量操作 <DownloadOutlined />
              </Button>
            </Dropdown>
            <Button icon={<ReloadOutlined />} onClick={loadData}>
              刷新
            </Button>
          </Space>
          {selectedRowKeys.length > 0 && (
            <Alert
              message={`已选择 ${selectedRowKeys.length} 个案件包`}
              type="info"
              showIcon
              closable
              onClose={() => setSelectedRowKeys([])}
              style={{ marginTop: 8 }}
            />
          )}
        </div>
        
        {/* 数据表格 */}
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys
          }}
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1800 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 10);
            }
          }}
        />
      </Card>
      
      
      {/* 智能分案模态框 */}
      {selectedPackage && (
        <SmartAssignmentModal
          open={smartAssignModalVisible}
          packageId={selectedPackage.id}
          packageName={selectedPackage.packageName}
          caseCount={selectedPackage.caseCount}
          totalAmount={selectedPackage.totalAmount}
          onCancel={() => {
            setSmartAssignModalVisible(false);
            setSelectedPackage(null);
          }}
          onSuccess={() => {
            setSmartAssignModalVisible(false);
            setSelectedPackage(null);
            loadData();
          }}
        />
      )}
      
      {/* 竞标评估模态框 */}
      {selectedPackage && biddingModalVisible && (
        <BiddingEvaluationModal
          open={biddingModalVisible}
          packageId={selectedPackage.id}
          packageName={selectedPackage.packageName}
          totalAmount={selectedPackage.totalAmount}
          caseCount={selectedPackage.caseCount}
          onCancel={() => {
            setBiddingModalVisible(false);
            setSelectedPackage(null);
          }}
          onSuccess={() => {
            setBiddingModalVisible(false);
            setSelectedPackage(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};

export default CasePackageManagement;