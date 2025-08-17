import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  Form,
  Select,
  Table,
  Space,
  Button,
  Typography,
  Card,
  Tag,
  Progress,
  Alert,
  Avatar,
  Statistic,
  Row,
  Col,
  Radio,
  Divider,
  Input,
  Spin
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  StarOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import {
  getHandlers,
  getDepartments,
  getAssignmentSuggestions,
  assignCasesToHandler,
  Handler,
  AssignmentSuggestion,
  AssignmentRequest
} from '@/services/handlerService';
import { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;

interface HandlerSelectionModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (result: any) => void;
  caseIds: string[];
  title?: string;
}

const HandlerSelectionModal: React.FC<HandlerSelectionModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  caseIds,
  title = '分配处理人'
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [handlers, setHandlers] = useState<Handler[]>([]);
  const [departments, setDepartments] = useState<{ id: number; name: string; handlerCount: number }[]>([]);
  const [suggestions, setSuggestions] = useState<AssignmentSuggestion[]>([]);
  const [selectedHandler, setSelectedHandler] = useState<Handler | null>(null);
  const [assignmentMode, setAssignmentMode] = useState<'manual' | 'auto'>('auto');
  const [filters, setFilters] = useState({
    departmentId: undefined as number | undefined,
    available: true,
    skill: '',
    region: ''
  });

  // 获取处理人列表
  const fetchHandlers = useCallback(async () => {
    setLoading(true);
    try {
      const [handlersData, departmentsData] = await Promise.all([
        getHandlers(filters),
        getDepartments()
      ]);
      setHandlers(handlersData.content);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('获取处理人列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // 获取智能分配建议
  const fetchSuggestions = useCallback(async () => {
    if (caseIds.length === 0) return;
    
    try {
      const suggestionsData = await getAssignmentSuggestions(caseIds, {
        rule: 'LOAD_BALANCE',
        limit: 5
      });
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error('获取分配建议失败:', error);
    }
  }, [caseIds]);

  useEffect(() => {
    if (visible) {
      fetchHandlers();
      fetchSuggestions();
    }
  }, [visible, fetchHandlers, fetchSuggestions]);

  // 处理人表格列定义
  const handlerColumns: ColumnsType<Handler> = [
    {
      title: '处理人',
      key: 'handler',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div>
              <Text strong>{record.name}</Text>
              <Tag color="blue" style={{ marginLeft: 8 }}>
                {record.level}
              </Tag>
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.department} - {record.position}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: '工作负载',
      key: 'workload',
      width: 150,
      render: (_, record) => (
        <div>
          <Progress
            percent={Math.round((record.workload / record.maxCapacity) * 100)}
            size="small"
            format={() => `${record.workload}/${record.maxCapacity}`}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            可用容量: {record.maxCapacity - record.workload}
          </Text>
        </div>
      )
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      key: 'successRate',
      width: 100,
      render: (rate: number) => (
        <Text style={{ color: rate >= 90 ? '#52c41a' : rate >= 80 ? '#faad14' : '#ff4d4f' }}>
          {rate.toFixed(1)}%
        </Text>
      )
    },
    {
      title: '平均处理时间',
      dataIndex: 'avgHandleTime',
      key: 'avgHandleTime',
      width: 120,
      render: (time: number) => (
        <Text>{time}天</Text>
      )
    },
    {
      title: '技能标签',
      dataIndex: 'skills',
      key: 'skills',
      width: 200,
      render: (skills: string[]) => (
        <Space size={[0, 4]} wrap>
          {skills.slice(0, 3).map((skill, index) => (
            <Tag key={index} color="cyan" style={{ fontSize: 11 }}>
              {skill}
            </Tag>
          ))}
          {skills.length > 3 && (
            <Tag style={{ fontSize: 11 }}>+{skills.length - 3}</Tag>
          )}
        </Space>
      )
    },
    {
      title: '负责区域',
      dataIndex: 'regions',
      key: 'regions',
      width: 150,
      render: (regions: string[]) => (
        <Text>{regions.slice(0, 2).join(', ')}{regions.length > 2 ? '...' : ''}</Text>
      )
    }
  ];

  // 智能推荐表格列定义
  const suggestionColumns: ColumnsType<AssignmentSuggestion> = [
    {
      title: '推荐排名',
      key: 'rank',
      width: 80,
      render: (_, __, index) => (
        <div style={{ textAlign: 'center' }}>
          <Avatar
            size={32}
            style={{
              backgroundColor: index === 0 ? '#faad14' : index === 1 ? '#d9d9d9' : '#cd7f32'
            }}
          >
            {index + 1}
          </Avatar>
        </div>
      )
    },
    {
      title: '处理人信息',
      key: 'handler',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div>
              <Text strong>{record.handler.name}</Text>
              <Tag color="blue" style={{ marginLeft: 8 }}>
                {record.handler.level}
              </Tag>
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.handler.department}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: '匹配分数',
      dataIndex: 'score',
      key: 'score',
      width: 100,
      render: (score: number) => (
        <div style={{ textAlign: 'center' }}>
          <Progress
            type="circle"
            size={60}
            percent={score}
            format={() => score}
          />
        </div>
      )
    },
    {
      title: '推荐原因',
      dataIndex: 'reasons',
      key: 'reasons',
      width: 200,
      render: (reasons: string[]) => (
        <Space direction="vertical" size={2}>
          {reasons.map((reason, index) => (
            <Tag key={index} color="green" style={{ fontSize: 11 }}>
              {reason}
            </Tag>
          ))}
        </Space>
      )
    },
    {
      title: '分配后负载',
      key: 'workloadAfter',
      width: 120,
      render: (_, record) => (
        <div>
          <Text>
            {record.workloadAfterAssign}/{record.handler.maxCapacity}
          </Text>
          <Progress
            percent={Math.round((record.workloadAfterAssign / record.handler.maxCapacity) * 100)}
            size="small"
            showInfo={false}
          />
        </div>
      )
    },
    {
      title: '预计完成时间',
      dataIndex: 'estimatedCompletionTime',
      key: 'estimatedCompletionTime',
      width: 120,
      render: (time: number) => (
        <Text>{time}天</Text>
      )
    }
  ];

  // 执行分配
  const handleAssignment = async () => {
    if (!selectedHandler && assignmentMode === 'manual') {
      return;
    }

    setAssignmentLoading(true);
    try {
      const assignmentRequest: AssignmentRequest = {
        caseIds,
        handlerId: selectedHandler?.id,
        autoAssign: assignmentMode === 'auto',
        assignmentRule: 'LOAD_BALANCE',
        priority: 'MEDIUM',
        reason: form.getFieldValue('reason') || '批量分配案件'
      };

      const result = await assignCasesToHandler(assignmentRequest);
      onConfirm(result);
    } catch (error: any) {
      console.error('分配失败:', error);
    } finally {
      setAssignmentLoading(false);
    }
  };

  // 选择处理人
  const handleSelectHandler = (handler: Handler) => {
    setSelectedHandler(handler);
    setAssignmentMode('manual');
  };

  // 选择推荐
  const handleSelectSuggestion = (suggestion: AssignmentSuggestion) => {
    setSelectedHandler(suggestion.handler);
    setAssignmentMode('manual');
  };

  const handleCancel = () => {
    setSelectedHandler(null);
    setAssignmentMode('auto');
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <Space>
          <TeamOutlined />
          <span>{title}</span>
          <Tag color="blue">{caseIds.length} 个案件</Tag>
        </Space>
      }
      visible={visible}
      onCancel={handleCancel}
      width={1200}
      bodyStyle={{ maxHeight: 'calc(80vh - 110px)', overflowY: 'auto' }}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={assignmentLoading}
          disabled={assignmentMode === 'manual' && !selectedHandler}
          onClick={handleAssignment}
        >
          确认分配
        </Button>
      ]}
      destroyOnClose
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 分配模式选择 */}
        <Card size="small">
          <Radio.Group
            value={assignmentMode}
            onChange={(e) => setAssignmentMode(e.target.value)}
          >
            <Radio value="auto">智能分配（系统自动选择最佳处理人）</Radio>
            <Radio value="manual">手动选择（选择指定处理人）</Radio>
          </Radio.Group>
        </Card>

        {/* 分配原因 */}
        <Form form={form} layout="vertical">
          <Form.Item name="reason" label="分配原因">
            <Input.TextArea
              placeholder="请输入分配原因（可选）"
              rows={2}
              maxLength={200}
            />
          </Form.Item>
        </Form>

        {/* 智能推荐（当选择智能分配时显示） */}
        {assignmentMode === 'auto' && (
          <Card
            title={
              <Space>
                <StarOutlined />
                <span>智能推荐</span>
              </Space>
            }
            size="small"
          >
            {suggestions.length > 0 ? (
              <Table
                columns={suggestionColumns}
                dataSource={suggestions}
                rowKey="handlerId"
                pagination={false}
                size="small"
                rowSelection={{
                  type: 'radio',
                  selectedRowKeys: selectedHandler ? [selectedHandler.id] : [],
                  onSelect: (record) => handleSelectSuggestion(record)
                }}
              />
            ) : (
              <Alert
                message="正在分析最佳分配方案..."
                type="info"
                showIcon
              />
            )}
          </Card>
        )}

        {/* 处理人列表（当选择手动分配时显示） */}
        {assignmentMode === 'manual' && (
          <Card
            title={
              <Space>
                <UserOutlined />
                <span>选择处理人</span>
              </Space>
            }
            size="small"
            extra={
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchHandlers}
                  loading={loading}
                >
                  刷新
                </Button>
              </Space>
            }
          >
            {/* 筛选条件 */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Select
                  placeholder="选择部门"
                  style={{ width: '100%' }}
                  allowClear
                  value={filters.departmentId}
                  onChange={(value) => setFilters(prev => ({ ...prev, departmentId: value }))}
                >
                  {departments.map(dept => (
                    <Option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.handlerCount}人)
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col span={6}>
                <Input
                  placeholder="技能关键词"
                  prefix={<SearchOutlined />}
                  value={filters.skill}
                  onChange={(e) => setFilters(prev => ({ ...prev, skill: e.target.value }))}
                />
              </Col>
              <Col span={6}>
                <Input
                  placeholder="负责区域"
                  value={filters.region}
                  onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
                />
              </Col>
              <Col span={6}>
                <Select
                  placeholder="可用状态"
                  style={{ width: '100%' }}
                  value={filters.available}
                  onChange={(value) => setFilters(prev => ({ ...prev, available: value }))}
                >
                  <Option value={true}>仅显示可用</Option>
                  <Option value={false}>显示全部</Option>
                </Select>
              </Col>
            </Row>

            {/* 处理人表格 */}
            <Spin spinning={loading}>
              <Table
                columns={handlerColumns}
                dataSource={handlers}
                rowKey="id"
                size="small"
                pagination={{
                  pageSize: 5,
                  showSizeChanger: false
                }}
                rowSelection={{
                  type: 'radio',
                  selectedRowKeys: selectedHandler ? [selectedHandler.id] : [],
                  onSelect: handleSelectHandler
                }}
              />
            </Spin>
          </Card>
        )}

        {/* 选中的处理人信息 */}
        {selectedHandler && (
          <Card
            title={
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span>已选择处理人</span>
              </Space>
            }
            size="small"
          >
            <Row gutter={16}>
              <Col span={8}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    <Avatar size={40} icon={<UserOutlined />} />
                    <div>
                      <Title level={5} style={{ margin: 0 }}>
                        {selectedHandler.name}
                      </Title>
                      <Text type="secondary">
                        {selectedHandler.department} - {selectedHandler.position}
                      </Text>
                    </div>
                  </Space>
                </Space>
              </Col>
              <Col span={4}>
                <Statistic
                  title="当前负载"
                  value={selectedHandler.workload}
                  suffix={`/ ${selectedHandler.maxCapacity}`}
                  valueStyle={{ fontSize: 16 }}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="成功率"
                  value={selectedHandler.successRate}
                  precision={1}
                  suffix="%"
                  valueStyle={{ 
                    fontSize: 16,
                    color: selectedHandler.successRate >= 90 ? '#52c41a' : '#faad14'
                  }}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="平均处理时间"
                  value={selectedHandler.avgHandleTime}
                  suffix="天"
                  valueStyle={{ fontSize: 16 }}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="评分"
                  value={selectedHandler.rating}
                  precision={1}
                  suffix="/ 5"
                  valueStyle={{ fontSize: 16 }}
                />
              </Col>
            </Row>

            <Divider style={{ margin: '12px 0' }} />

            <Row gutter={16}>
              <Col span={12}>
                <Text strong>技能标签：</Text>
                <div style={{ marginTop: 4 }}>
                  <Space size={[0, 4]} wrap>
                    {selectedHandler.skills.map((skill, index) => (
                      <Tag key={index} color="blue">
                        {skill}
                      </Tag>
                    ))}
                  </Space>
                </div>
              </Col>
              <Col span={12}>
                <Text strong>负责区域：</Text>
                <div style={{ marginTop: 4 }}>
                  <Text>{selectedHandler.regions.join(', ')}</Text>
                </div>
              </Col>
            </Row>
          </Card>
        )}
      </Space>
    </Modal>
  );
};

export default HandlerSelectionModal;