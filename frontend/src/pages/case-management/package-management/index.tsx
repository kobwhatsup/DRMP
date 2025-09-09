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
  Result
} from 'antd';
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
  StarFilled
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
import CasePackageForm from './components/CasePackageForm';
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
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [smartAssignModalVisible, setSmartAssignModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CasePackageDetail | null>(null);
  const [editData, setEditData] = useState<CasePackageDetail | null>(null);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [biddingModalVisible, setBiddingModalVisible] = useState(false);
  
  // 筛选条件
  const [filterParams, setFilterParams] = useState({
    keyword: '',
    status: undefined,
    assignmentType: undefined,
    dateRange: undefined
  });
  
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
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.status === CasePackageStatus.DRAFT && (
            <>
              <Tooltip title="编辑">
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                />
              </Tooltip>
              <Tooltip title="发布">
                <Button
                  type="link"
                  size="small"
                  icon={<SendOutlined />}
                  onClick={() => handlePublish(record)}
                />
              </Tooltip>
            </>
          )}
          {record.status === CasePackageStatus.PUBLISHED && (
            <>
              {record.assignmentType === AssignmentType.SMART && (
                <Tooltip title="智能分案">
                  <Button
                    type="link"
                    size="small"
                    icon={<RobotOutlined />}
                    onClick={() => handleSmartAssign(record)}
                  />
                </Tooltip>
              )}
              {record.assignmentType === AssignmentType.BIDDING && (
                <Tooltip title="查看竞标">
                  <Button
                    type="link"
                    size="small"
                    icon={<TrophyOutlined />}
                    onClick={() => handleViewBids(record)}
                  />
                </Tooltip>
              )}
              <Tooltip title="撤回">
                <Button
                  type="link"
                  size="small"
                  icon={<UndoOutlined />}
                  onClick={() => handleWithdraw(record)}
                />
              </Tooltip>
            </>
          )}
          <Dropdown
            menu={{
              items: [
                {
                  key: 'export',
                  icon: <ExportOutlined />,
                  label: '导出案件'
                },
                {
                  key: 'copy',
                  icon: <CopyOutlined />,
                  label: '复制案件包'
                },
                {
                  key: 'share',
                  icon: <ShareAltOutlined />,
                  label: '分享'
                },
                {
                  type: 'divider'
                },
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: '删除',
                  danger: true,
                  disabled: record.status !== CasePackageStatus.DRAFT
                }
              ],
              onClick: ({ key }) => handleMoreAction(key, record)
            }}
          >
            <Button type="link" size="small">
              更多
            </Button>
          </Dropdown>
        </Space>
      )
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
    setEditData(record);
    setCreateModalVisible(true);
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
  
  const handleBatchOperation = (operation: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要操作的案件包');
      return;
    }
    
    switch (operation) {
      case 'publish':
        message.info('批量发布功能开发中');
        break;
      case 'export':
        message.info('批量导出功能开发中');
        break;
      case 'delete':
        message.info('批量删除功能开发中');
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
      dateRange: undefined
    });
    setCurrentPage(1);
  };
  
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls',
    action: '#',
    beforeUpload: (file) => {
      // 这里处理文件上传逻辑
      return false;
    },
    onChange(info) {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
      } else if (status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
      }
    }
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
            <Button type="primary" onClick={handleSearch}>
              查询
            </Button>
            <Button onClick={handleReset}>
              重置
            </Button>
          </Space>
        </div>
        
        {/* 操作按钮 */}
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/case-management/packages/create')}
            >
              创建案件包
            </Button>
            <Button
              icon={<ImportOutlined />}
              onClick={() => setImportModalVisible(true)}
            >
              批量导入
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
      
      {/* 批量导入模态框 */}
      <Modal
        title="批量导入案件"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
        width={600}
      >
        <Alert
          message="导入说明"
          description={
            <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
              <li>支持 Excel 格式（.xlsx, .xls）</li>
              <li>单次最多导入 10000 条案件</li>
              <li>请使用系统提供的模板文件</li>
            </ul>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持单个文件上传，严禁上传涉密文件
          </p>
        </Dragger>
        
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={async () => {
              try {
                await casePackageManagementAPI.downloadImportTemplate();
                message.success('模板下载成功');
              } catch (error) {
                message.error('模板下载失败');
              }
            }}
          >
            下载导入模板
          </Button>
        </div>
      </Modal>
      
      {/* 创建/编辑案件包模态框 */}
      <CasePackageForm
        visible={createModalVisible}
        editData={editData}
        onCancel={() => {
          setCreateModalVisible(false);
          setEditData(null);
        }}
        onSuccess={() => {
          setCreateModalVisible(false);
          setEditData(null);
          loadData();
        }}
      />
      
      {/* 智能分案模态框 */}
      {selectedPackage && (
        <SmartAssignmentModal
          visible={smartAssignModalVisible}
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
          visible={biddingModalVisible}
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