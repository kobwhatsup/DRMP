import React, { useState, useEffect } from 'react';
import {
  Card,
  Select,
  Button,
  Modal,
  Form,
  Input,
  Steps,
  Timeline,
  Tag,
  Space,
  Row,
  Col,
  Alert,
  message,
  Tooltip,
  Divider,
  Typography,
  Descriptions,
  DatePicker,
  Radio
} from 'antd';
import {
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  HistoryOutlined,
  SaveOutlined,
  RollbackOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useApiRequest } from '@/hooks/useApiRequest';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { Step } = Steps;

// 案件状态枚举
export const CASE_STATUS = {
  PENDING: { 
    code: 'PENDING', 
    name: '待处理', 
    color: 'default',
    description: '案件已分配，等待开始处理'
  },
  IN_PROGRESS: { 
    code: 'IN_PROGRESS', 
    name: '处理中', 
    color: 'processing',
    description: '案件正在处理中'
  },
  MEDIATION: { 
    code: 'MEDIATION', 
    name: '调解中', 
    color: 'warning',
    description: '案件进入调解程序'
  },
  LITIGATION: { 
    code: 'LITIGATION', 
    name: '诉讼中', 
    color: 'error',
    description: '案件进入诉讼程序'
  },
  SETTLED: { 
    code: 'SETTLED', 
    name: '已和解', 
    color: 'success',
    description: '案件达成和解协议'
  },
  COMPLETED: { 
    code: 'COMPLETED', 
    name: '已完成', 
    color: 'success',
    description: '案件处理完成'
  },
  CLOSED: { 
    code: 'CLOSED', 
    name: '已结案', 
    color: 'default',
    description: '案件已结案归档'
  },
  SUSPENDED: { 
    code: 'SUSPENDED', 
    name: '已暂停', 
    color: 'warning',
    description: '案件暂停处理'
  },
  CANCELLED: { 
    code: 'CANCELLED', 
    name: '已取消', 
    color: 'error',
    description: '案件已取消'
  }
};

// 状态流转规则
const STATUS_FLOW_RULES = {
  PENDING: ['IN_PROGRESS', 'SUSPENDED', 'CANCELLED'],
  IN_PROGRESS: ['MEDIATION', 'LITIGATION', 'SETTLED', 'COMPLETED', 'SUSPENDED'],
  MEDIATION: ['SETTLED', 'LITIGATION', 'SUSPENDED', 'COMPLETED'],
  LITIGATION: ['SETTLED', 'COMPLETED', 'SUSPENDED'],
  SETTLED: ['COMPLETED', 'CLOSED'],
  COMPLETED: ['CLOSED'],
  SUSPENDED: ['IN_PROGRESS', 'CANCELLED'],
  CLOSED: [],
  CANCELLED: []
};

interface CaseStatusHistory {
  id: number;
  fromStatus: string;
  toStatus: string;
  reason: string;
  remark?: string;
  operator: string;
  operatorName: string;
  createdAt: string;
  approvalStatus?: string;
  approvedBy?: string;
  approvedAt?: string;
}

interface CaseStatusManagementProps {
  caseId: string;
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
  showHistory?: boolean;
  editable?: boolean;
}

const CaseStatusManagement: React.FC<CaseStatusManagementProps> = ({
  caseId,
  currentStatus,
  onStatusChange,
  showHistory = true,
  editable = true
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [statusHistory, setStatusHistory] = useState<CaseStatusHistory[]>([]);
  const [form] = Form.useForm();

  // 获取允许的下一步状态
  const getAllowedNextStatuses = (currentStatus: string) => {
    return STATUS_FLOW_RULES[currentStatus as keyof typeof STATUS_FLOW_RULES] || [];
  };

  // 获取状态配置
  const getStatusConfig = (status: string) => {
    return CASE_STATUS[status as keyof typeof CASE_STATUS] || {
      code: status,
      name: status,
      color: 'default',
      description: ''
    };
  };

  // 模拟API调用 - 获取状态历史
  const { 
    loading: historyLoading, 
    execute: loadStatusHistory 
  } = useApiRequest(async () => {
    // 模拟数据
    const mockHistory: CaseStatusHistory[] = [
      {
        id: 1,
        fromStatus: 'PENDING',
        toStatus: 'IN_PROGRESS',
        reason: '开始案件处理',
        remark: '已联系债务人，开始催收工作',
        operator: 'USER001',
        operatorName: '张处理员',
        createdAt: '2024-08-15 09:00:00',
        approvalStatus: 'APPROVED'
      },
      {
        id: 2,
        fromStatus: 'IN_PROGRESS',
        toStatus: 'MEDIATION',
        reason: '债务人同意调解',
        remark: '债务人表示愿意通过调解方式解决争议',
        operator: 'USER001',
        operatorName: '张处理员',
        createdAt: '2024-08-16 14:30:00',
        approvalStatus: 'PENDING'
      }
    ];
    setStatusHistory(mockHistory);
    return mockHistory;
  });

  // 模拟API调用 - 更新状态
  const { 
    loading: updateLoading, 
    execute: updateStatus 
  } = useApiRequest(async (statusData: any) => {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    message.success('状态更新成功');
    onStatusChange?.(statusData.toStatus);
    return true;
  });

  // 打开状态变更对话框
  const handleStatusChange = () => {
    setModalVisible(true);
  };

  // 提交状态变更
  const handleSubmitStatusChange = async () => {
    try {
      const values = await form.validateFields();
      await updateStatus({
        caseId,
        fromStatus: currentStatus,
        toStatus: selectedStatus,
        ...values
      });
      setModalVisible(false);
      form.resetFields();
      setSelectedStatus('');
    } catch (error) {
      console.error('状态更新失败:', error);
    }
  };

  // 查看状态历史
  const handleViewHistory = () => {
    setHistoryModalVisible(true);
    loadStatusHistory();
  };

  // 获取状态步骤
  const getStatusSteps = () => {
    const allStatuses = ['PENDING', 'IN_PROGRESS', 'MEDIATION', 'COMPLETED', 'CLOSED'];
    const currentIndex = allStatuses.indexOf(currentStatus);
    
    return allStatuses.map((status, index) => {
      const config = getStatusConfig(status);
      let stepStatus: 'wait' | 'process' | 'finish' | 'error' = 'wait';
      
      if (index < currentIndex) {
        stepStatus = 'finish';
      } else if (index === currentIndex) {
        stepStatus = 'process';
      }
      
      if (status === 'CANCELLED' || status === 'SUSPENDED') {
        stepStatus = 'error';
      }
      
      return {
        title: config.name,
        description: config.description,
        status: stepStatus,
        icon: index === currentIndex ? <ClockCircleOutlined /> : undefined
      };
    });
  };

  const currentStatusConfig = getStatusConfig(currentStatus);
  const allowedNextStatuses = getAllowedNextStatuses(currentStatus);

  return (
    <div className="case-status-management">
      <Card 
        title={
          <Space>
            <FileTextOutlined />
            <span>案件状态管理</span>
          </Space>
        }
        extra={
          <Space>
            {showHistory && (
              <Button 
                icon={<HistoryOutlined />}
                onClick={handleViewHistory}
              >
                状态历史
              </Button>
            )}
            {editable && allowedNextStatuses.length > 0 && (
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={handleStatusChange}
              >
                变更状态
              </Button>
            )}
          </Space>
        }
      >
        {/* 当前状态显示 */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Alert
              message={
                <Space>
                  <span>当前状态：</span>
                  <Tag color={currentStatusConfig.color} style={{ fontSize: '14px', padding: '4px 12px' }}>
                    {currentStatusConfig.name}
                  </Tag>
                </Space>
              }
              description={currentStatusConfig.description}
              type="info"
              showIcon
            />
          </Col>
        </Row>

        <Divider />

        {/* 状态流程步骤 */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Title level={5}>处理流程</Title>
            <Steps 
              current={getStatusSteps().findIndex(step => step.status === 'process')}
              size="small"
              items={getStatusSteps()}
            />
          </Col>
        </Row>

        {/* 下一步可选状态 */}
        {allowedNextStatuses.length > 0 && (
          <>
            <Divider />
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Title level={5}>可执行操作</Title>
                <Space wrap>
                  {allowedNextStatuses.map(status => {
                    const config = getStatusConfig(status);
                    return (
                      <Tooltip key={status} title={config.description}>
                        <Tag 
                          color={config.color}
                          style={{ cursor: 'pointer', padding: '4px 8px' }}
                          onClick={() => {
                            setSelectedStatus(status);
                            handleStatusChange();
                          }}
                        >
                          {config.name}
                        </Tag>
                      </Tooltip>
                    );
                  })}
                </Space>
              </Col>
            </Row>
          </>
        )}
      </Card>

      {/* 状态变更对话框 */}
      <Modal
        title="变更案件状态"
        open={modalVisible}
        onOk={handleSubmitStatusChange}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setSelectedStatus('');
        }}
        confirmLoading={updateLoading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="当前状态">
                <Tag color={currentStatusConfig.color}>
                  {currentStatusConfig.name}
                </Tag>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="变更为"
                name="toStatus"
                rules={[{ required: true, message: '请选择目标状态' }]}
              >
                <Select 
                  placeholder="选择目标状态"
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                >
                  {allowedNextStatuses.map(status => {
                    const config = getStatusConfig(status);
                    return (
                      <Option key={status} value={status}>
                        <Space>
                          <Tag color={config.color} style={{ margin: 0 }}>
                            {config.name}
                          </Tag>
                          <span>{config.description}</span>
                        </Space>
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            label="变更原因"
            name="reason"
            rules={[{ required: true, message: '请输入变更原因' }]}
          >
            <Input placeholder="请输入状态变更的原因" />
          </Form.Item>

          <Form.Item label="备注说明" name="remark">
            <TextArea 
              rows={3}
              placeholder="请输入详细说明（可选）"
            />
          </Form.Item>

          <Form.Item label="是否需要审批" name="needApproval">
            <Radio.Group defaultValue={false}>
              <Radio value={false}>直接生效</Radio>
              <Radio value={true}>提交审批</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      {/* 状态历史对话框 */}
      <Modal
        title="状态变更历史"
        open={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={null}
        width={800}
      >
        {historyLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <span>加载中...</span>
          </div>
        ) : (
          <Timeline>
            {statusHistory.map(history => {
              const fromConfig = getStatusConfig(history.fromStatus);
              const toConfig = getStatusConfig(history.toStatus);
              
              return (
                <Timeline.Item
                  key={history.id}
                  dot={
                    history.approvalStatus === 'APPROVED' ? 
                      <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
                      <ClockCircleOutlined style={{ color: '#1890ff' }} />
                  }
                >
                  <div>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div>
                        <Space>
                          <Tag color={fromConfig.color}>{fromConfig.name}</Tag>
                          <span>→</span>
                          <Tag color={toConfig.color}>{toConfig.name}</Tag>
                          <Text type="secondary">
                            {moment(history.createdAt).format('YYYY-MM-DD HH:mm')}
                          </Text>
                        </Space>
                      </div>
                      
                      <Descriptions size="small" column={1}>
                        <Descriptions.Item label="变更原因">
                          {history.reason}
                        </Descriptions.Item>
                        {history.remark && (
                          <Descriptions.Item label="备注说明">
                            {history.remark}
                          </Descriptions.Item>
                        )}
                        <Descriptions.Item label="操作人员">
                          <Space>
                            <UserOutlined />
                            {history.operatorName}
                          </Space>
                        </Descriptions.Item>
                        {history.approvalStatus && (
                          <Descriptions.Item label="审批状态">
                            <Tag 
                              color={
                                history.approvalStatus === 'APPROVED' ? 'success' :
                                history.approvalStatus === 'REJECTED' ? 'error' : 'warning'
                              }
                            >
                              {
                                history.approvalStatus === 'APPROVED' ? '已通过' :
                                history.approvalStatus === 'REJECTED' ? '已拒绝' : '待审批'
                              }
                            </Tag>
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </Space>
                  </div>
                </Timeline.Item>
              );
            })}
          </Timeline>
        )}
      </Modal>
    </div>
  );
};

export default CaseStatusManagement;