import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Space,
  Button,
  Input,
  Select,
  DatePicker,
  Form,
  Row,
  Col,
  Tag,
  Tooltip,
  Modal,
  Descriptions,
  Typography,
  message,
  Statistic,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;

interface OperationLog {
  id: number;
  userId: number;
  username: string;
  operationType: string;
  operationTypeDesc: string;
  moduleName: string;
  businessType: string;
  methodName: string;
  requestMethod: string;
  requestUrl: string;
  requestParams: string;
  responseResult: string;
  errorMessage: string | null;
  operationIp: string;
  operationLocation: string;
  userAgent: string;
  executionTime: number;
  operationStatus: string;
  operationStatusDesc: string;
  operatedAt: string;
}

interface QueryParams {
  page: number;
  size: number;
  userId?: number;
  username?: string;
  operationType?: string;
  moduleName?: string;
  operationStatus?: string;
  startTime?: string;
  endTime?: string;
}

const OperationLogManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null);
  const [statistics, setStatistics] = useState<any>({});

  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 0,
    size: 20,
  });

  // 操作类型选项
  const operationTypes = [
    { value: 'CREATE', label: '创建' },
    { value: 'UPDATE', label: '更新' },
    { value: 'DELETE', label: '删除' },
    { value: 'QUERY', label: '查询' },
    { value: 'LOGIN', label: '登录' },
    { value: 'LOGOUT', label: '登出' },
    { value: 'EXPORT', label: '导出' },
    { value: 'IMPORT', label: '导入' },
  ];

  // 操作状态选项
  const statusOptions = [
    { value: 'SUCCESS', label: '成功' },
    { value: 'FAILURE', label: '失败' },
  ];

  useEffect(() => {
    fetchLogs();
    fetchStatistics();
  }, [queryParams]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockData = {
        content: [
          {
            id: 1,
            userId: 1,
            username: 'admin',
            operationType: 'LOGIN',
            operationTypeDesc: '登录',
            moduleName: '系统登录',
            businessType: '用户登录',
            methodName: 'login',
            requestMethod: 'POST',
            requestUrl: '/api/auth/login',
            requestParams: '{"username":"admin"}',
            responseResult: '{"success":true}',
            errorMessage: null,
            operationIp: '192.168.1.100',
            operationLocation: '北京市',
            userAgent: 'Mozilla/5.0...',
            executionTime: 120,
            operationStatus: 'SUCCESS',
            operationStatusDesc: '成功',
            operatedAt: '2024-01-15 09:30:00',
          },
          {
            id: 2,
            userId: 2,
            username: 'user1',
            operationType: 'CREATE',
            operationTypeDesc: '创建',
            moduleName: '用户管理',
            businessType: '创建用户',
            methodName: 'createUser',
            requestMethod: 'POST',
            requestUrl: '/api/system/users',
            requestParams: '{"username":"newuser","email":"test@example.com"}',
            responseResult: '{"id":123,"username":"newuser"}',
            errorMessage: null,
            operationIp: '192.168.1.101',
            operationLocation: '上海市',
            userAgent: 'Chrome/120.0.0.0',
            executionTime: 250,
            operationStatus: 'SUCCESS',
            operationStatusDesc: '成功',
            operatedAt: '2024-01-15 10:15:00',
          },
        ],
        totalElements: 2,
      };

      setLogs(mockData.content);
      setTotal(mockData.totalElements);
    } catch (error) {
      message.error('获取操作日志失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      // 模拟统计数据
      const mockStats = {
        totalOperations: 1250,
        successOperations: 1200,
        failureOperations: 50,
        successRate: 96.0,
        operationTypeDistribution: {
          '查询': 600,
          '更新': 300,
          '创建': 200,
          '删除': 100,
          '登录': 50,
        },
        moduleDistribution: {
          '用户管理': 400,
          '角色管理': 300,
          '权限管理': 250,
          '日志管理': 200,
          '系统配置': 100,
        },
      };
      setStatistics(mockStats);
    } catch (error) {
      console.error('获取统计数据失败', error);
    }
  };

  const handleSearch = () => {
    const values = form.getFieldsValue();
    const newParams: QueryParams = {
      ...queryParams,
      page: 0,
      ...values,
    };

    if (values.timeRange && values.timeRange.length === 2) {
      newParams.startTime = values.timeRange[0].format('YYYY-MM-DD HH:mm:ss');
      newParams.endTime = values.timeRange[1].format('YYYY-MM-DD HH:mm:ss');
    }

    setQueryParams(newParams);
  };

  const handleReset = () => {
    form.resetFields();
    setQueryParams({
      page: 0,
      size: 20,
    });
  };

  const handleTableChange = (pagination: any) => {
    setQueryParams({
      ...queryParams,
      page: pagination.current - 1,
      size: pagination.pageSize,
    });
  };

  const handleViewDetail = (log: OperationLog) => {
    setSelectedLog(log);
    setDetailModalVisible(true);
  };

  const handleExport = () => {
    message.success('导出功能开发中...');
  };

  const handleCleanLogs = () => {
    Modal.confirm({
      title: '确认清理日志',
      content: '是否清理90天前的操作日志？此操作不可恢复。',
      onOk: async () => {
        try {
          message.success('日志清理完成');
          fetchLogs();
        } catch (error) {
          message.error('日志清理失败');
        }
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的日志');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `是否删除选中的 ${selectedRowKeys.length} 条日志？`,
      onOk: async () => {
        try {
          message.success('删除成功');
          setSelectedRowKeys([]);
          fetchLogs();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const getStatusTag = (status: string) => {
    return status === 'SUCCESS' ? (
      <Tag color="success">成功</Tag>
    ) : (
      <Tag color="error">失败</Tag>
    );
  };

  const getOperationTypeTag = (type: string, desc: string) => {
    const colorMap: { [key: string]: string } = {
      CREATE: 'green',
      UPDATE: 'blue',
      DELETE: 'red',
      QUERY: 'default',
      LOGIN: 'purple',
      LOGOUT: 'orange',
      EXPORT: 'cyan',
      IMPORT: 'magenta',
    };
    return <Tag color={colorMap[type] || 'default'}>{desc}</Tag>;
  };

  const columns: ColumnsType<OperationLog> = [
    {
      title: '用户',
      dataIndex: 'username',
      width: 100,
      ellipsis: true,
    },
    {
      title: '操作类型',
      dataIndex: 'operationType',
      width: 100,
      render: (type, record) => getOperationTypeTag(type, record.operationTypeDesc),
    },
    {
      title: '模块',
      dataIndex: 'moduleName',
      width: 120,
      ellipsis: true,
    },
    {
      title: '业务类型',
      dataIndex: 'businessType',
      width: 120,
      ellipsis: true,
    },
    {
      title: '请求方法',
      dataIndex: 'requestMethod',
      width: 80,
      render: (method) => <Tag>{method}</Tag>,
    },
    {
      title: '请求URL',
      dataIndex: 'requestUrl',
      width: 200,
      ellipsis: true,
      render: (url) => (
        <Tooltip title={url}>
          <Text code style={{ fontSize: '12px' }}>{url}</Text>
        </Tooltip>
      ),
    },
    {
      title: '操作IP',
      dataIndex: 'operationIp',
      width: 120,
      render: (ip) => <Text code>{ip}</Text>,
    },
    {
      title: '执行时间',
      dataIndex: 'executionTime',
      width: 100,
      render: (time) => (
        <span style={{ color: time > 1000 ? '#ff4d4f' : '#52c41a' }}>
          {time}ms
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'operationStatus',
      width: 80,
      render: (status) => getStatusTag(status),
    },
    {
      title: '操作时间',
      dataIndex: 'operatedAt',
      width: 150,
      render: (time) => dayjs(time).format('MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          详情
        </Button>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总操作数"
              value={statistics.totalOperations}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="成功操作"
              value={statistics.successOperations}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="失败操作"
              value={statistics.failureOperations}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="成功率"
              value={statistics.successRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* 搜索表单 */}
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="用户名" name="username">
                <Input placeholder="请输入用户名" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="操作类型" name="operationType">
                <Select placeholder="请选择操作类型" allowClear>
                  {operationTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="模块名称" name="moduleName">
                <Input placeholder="请输入模块名称" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="操作状态" name="operationStatus">
                <Select placeholder="请选择操作状态" allowClear>
                  {statusOptions.map(status => (
                    <Option key={status.value} value={status.value}>
                      {status.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="操作时间" name="timeRange">
                <RangePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item label=" " colon={false}>
                <Space>
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={handleSearch}
                  >
                    搜索
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={handleReset}>
                    重置
                  </Button>
                  <Button
                    icon={<ExportOutlined />}
                    onClick={handleExport}
                  >
                    导出
                  </Button>
                  <Button
                    icon={<ClearOutlined />}
                    onClick={handleCleanLogs}
                  >
                    清理日志
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleBatchDelete}
                    disabled={selectedRowKeys.length === 0}
                  >
                    批量删除
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {/* 表格 */}
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{
            current: queryParams.page + 1,
            pageSize: queryParams.size,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="操作日志详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedLog && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="日志ID">{selectedLog.id}</Descriptions.Item>
            <Descriptions.Item label="操作用户">{selectedLog.username}</Descriptions.Item>
            <Descriptions.Item label="操作类型">
              {getOperationTypeTag(selectedLog.operationType, selectedLog.operationTypeDesc)}
            </Descriptions.Item>
            <Descriptions.Item label="操作状态">
              {getStatusTag(selectedLog.operationStatus)}
            </Descriptions.Item>
            <Descriptions.Item label="模块名称">{selectedLog.moduleName}</Descriptions.Item>
            <Descriptions.Item label="业务类型">{selectedLog.businessType}</Descriptions.Item>
            <Descriptions.Item label="方法名称" span={2}>
              <Text code>{selectedLog.methodName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="请求方法">{selectedLog.requestMethod}</Descriptions.Item>
            <Descriptions.Item label="请求URL">
              <Text code>{selectedLog.requestUrl}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="操作IP">{selectedLog.operationIp}</Descriptions.Item>
            <Descriptions.Item label="执行时间">{selectedLog.executionTime}ms</Descriptions.Item>
            <Descriptions.Item label="操作时间" span={2}>
              {dayjs(selectedLog.operatedAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="请求参数" span={2}>
              <Text code style={{ whiteSpace: 'pre-wrap' }}>
                {selectedLog.requestParams || '无'}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="响应结果" span={2}>
              <Text code style={{ whiteSpace: 'pre-wrap' }}>
                {selectedLog.responseResult || '无'}
              </Text>
            </Descriptions.Item>
            {selectedLog.errorMessage && (
              <Descriptions.Item label="错误信息" span={2}>
                <Text type="danger" style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedLog.errorMessage}
                </Text>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="用户代理" span={2}>
              <Text style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                {selectedLog.userAgent}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default OperationLogManagement;