import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  Input,
  Radio,
  Space,
  Button,
  Typography,
  Card,
  Alert,
  Tag,
  Row,
  Col,
  Steps,
  message
} from 'antd';
import {
  ExclamationCircleOutlined,
  EditOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { storeBatchOperation } from '@/services/batchOperationService';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface StatusOption {
  value: string;
  label: string;
  color: string;
  description: string;
  nextSteps?: string[];
  requiredReason?: boolean;
}

interface BatchStatusModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (result: any) => void;
  caseIds: string[];
  currentStatuses?: string[];
}

const BatchStatusModal: React.FC<BatchStatusModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  caseIds,
  currentStatuses = []
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [updateMode, setUpdateMode] = useState<'direct' | 'workflow'>('direct');

  // 状态选项定义
  const statusOptions: StatusOption[] = [
    {
      value: 'PENDING',
      label: '待处理',
      color: 'default',
      description: '新分配的案件，等待开始处理',
      nextSteps: ['IN_CONTACT', 'DOCUMENT_REVIEW']
    },
    {
      value: 'IN_CONTACT',
      label: '联系中',
      color: 'processing',
      description: '正在与债务人进行接触和沟通',
      nextSteps: ['NEGOTIATING', 'UNABLE_CONTACT', 'PAYMENT_PLAN']
    },
    {
      value: 'NEGOTIATING',
      label: '协商中',
      color: 'warning',
      description: '与债务人就还款事宜进行协商',
      nextSteps: ['PAYMENT_PLAN', 'LEGAL_PROCESS', 'SETTLED']
    },
    {
      value: 'PAYMENT_PLAN',
      label: '还款计划',
      color: 'cyan',
      description: '已制定还款计划，监控执行情况',
      nextSteps: ['MONITORING', 'SETTLED', 'BREACH_PLAN']
    },
    {
      value: 'MONITORING',
      label: '监控中',
      color: 'blue',
      description: '监控还款计划执行或债务人履约情况',
      nextSteps: ['SETTLED', 'LEGAL_PROCESS', 'PAYMENT_PLAN']
    },
    {
      value: 'LEGAL_PROCESS',
      label: '法律程序',
      color: 'purple',
      description: '启动法律程序，进行诉讼或仲裁',
      nextSteps: ['LITIGATION', 'SETTLED', 'ASSET_FREEZE'],
      requiredReason: true
    },
    {
      value: 'UNABLE_CONTACT',
      label: '无法联系',
      color: 'red',
      description: '多次尝试联系债务人失败',
      nextSteps: ['INVESTIGATION', 'LEGAL_PROCESS', 'SKIP_TRACE'],
      requiredReason: true
    },
    {
      value: 'SETTLED',
      label: '已和解',
      color: 'success',
      description: '债务已清偿或达成和解协议',
      nextSteps: ['CLOSED'],
      requiredReason: true
    },
    {
      value: 'CLOSED',
      label: '已结案',
      color: 'default',
      description: '案件处理完毕，正式结案',
      requiredReason: true
    },
    {
      value: 'RETURNED',
      label: '已退案',
      color: 'error',
      description: '案件退回给委托方',
      requiredReason: true
    }
  ];

  // 状态流程定义
  const statusWorkflow: Record<string, string[]> = {
    'PENDING': ['IN_CONTACT', 'DOCUMENT_REVIEW', 'UNABLE_CONTACT'],
    'IN_CONTACT': ['NEGOTIATING', 'UNABLE_CONTACT', 'PAYMENT_PLAN'],
    'NEGOTIATING': ['PAYMENT_PLAN', 'LEGAL_PROCESS', 'SETTLED', 'UNABLE_CONTACT'],
    'PAYMENT_PLAN': ['MONITORING', 'SETTLED', 'LEGAL_PROCESS'],
    'MONITORING': ['SETTLED', 'LEGAL_PROCESS', 'PAYMENT_PLAN'],
    'LEGAL_PROCESS': ['SETTLED', 'CLOSED', 'RETURNED'],
    'UNABLE_CONTACT': ['IN_CONTACT', 'LEGAL_PROCESS', 'RETURNED'],
    'SETTLED': ['CLOSED'],
    'CLOSED': [],
    'RETURNED': []
  };

  useEffect(() => {
    if (visible) {
      setSelectedStatus('');
      setUpdateMode('direct');
      form.resetFields();
    }
  }, [visible, form]);

  // 获取推荐的下一步状态
  const getRecommendedStatuses = () => {
    if (currentStatuses.length === 0) return statusOptions;
    
    const uniqueCurrentStatuses = Array.from(new Set(currentStatuses));
    if (uniqueCurrentStatuses.length === 1) {
      const currentStatus = uniqueCurrentStatuses[0];
      const recommendedNext = statusWorkflow[currentStatus] || [];
      return statusOptions.filter(option => recommendedNext.includes(option.value));
    }
    
    // 多种状态混合时，显示所有可能的状态
    return statusOptions;
  };

  // 执行状态更新
  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      message.warning('请选择目标状态');
      return;
    }

    try {
      const values = await form.validateFields();
      const selectedOption = statusOptions.find(opt => opt.value === selectedStatus);
      
      if (selectedOption?.requiredReason && !values.reason?.trim()) {
        message.warning('此状态变更需要填写原因');
        return;
      }

      setLoading(true);

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));

      const result = {
        id: Date.now(),
        operationType: 'STATUS_UPDATE',
        operationTypeDesc: '批量更新状态',
        operationName: `批量更新为"${selectedOption?.label}"`,
        targetType: 'CASE',
        targetCount: caseIds.length,
        successCount: caseIds.length,
        failedCount: 0,
        status: 'COMPLETED',
        statusDesc: '更新完成',
        parameters: JSON.stringify({
          newStatus: selectedStatus,
          reason: values.reason,
          updateMode,
          caseIds
        }),
        progressPercentage: 100,
        currentStep: '状态更新完成',
        createdBy: 1,
        organizationId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        successRate: 100,
        isCompleted: true,
        executionTime: 1500,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };

      // 存储操作数据以便后续查询
      storeBatchOperation(result);
      onSuccess(result);
    } catch (error: any) {
      message.error(`状态更新失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedStatus('');
    form.resetFields();
    onCancel();
  };

  const selectedOption = statusOptions.find(opt => opt.value === selectedStatus);
  const recommendedStatuses = getRecommendedStatuses();

  return (
    <Modal
      title={
        <Space>
          <EditOutlined />
          <span>批量更新状态</span>
          <Tag color="blue">{caseIds.length} 个案件</Tag>
        </Space>
      }
      visible={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          disabled={!selectedStatus}
          onClick={handleUpdateStatus}
        >
          更新状态
        </Button>
      ]}
      width={1200}
      destroyOnClose
      bodyStyle={{ maxHeight: 'calc(80vh - 110px)', overflowY: 'auto' }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* 操作说明 */}
        <Alert
          message={`将更新 ${caseIds.length} 个案件的状态`}
          description={
            currentStatuses.length > 0 && (
              <div>
                当前状态分布: {Array.from(new Set(currentStatuses)).map(status => {
                  const option = statusOptions.find(opt => opt.value === status);
                  return (
                    <Tag key={status} color={option?.color || 'default'} style={{ margin: '2px' }}>
                      {option?.label || status}
                    </Tag>
                  );
                })}
              </div>
            )
          }
          type="info"
          showIcon
        />

        {/* 更新模式选择 */}
        <Card title="更新模式" size="small">
          <Radio.Group
            value={updateMode}
            onChange={(e) => setUpdateMode(e.target.value)}
          >
            <Radio value="direct">直接更新（忽略流程限制）</Radio>
            <Radio value="workflow">按流程更新（仅显示推荐的下一步状态）</Radio>
          </Radio.Group>
        </Card>

        {/* 状态选择 */}
        <Card title="选择目标状态" size="small">
          <Row gutter={[16, 12]}>
            {(updateMode === 'workflow' ? recommendedStatuses : statusOptions).map(option => (
              <Col key={option.value} span={6}>
                <Card
                  size="small"
                  hoverable
                  className={selectedStatus === option.value ? 'selected-status' : ''}
                  style={{
                    border: selectedStatus === option.value ? '2px solid #1890ff' : '1px solid #d9d9d9',
                    cursor: 'pointer',
                    height: '100%'
                  }}
                  onClick={() => setSelectedStatus(option.value)}
                >
                  <Space direction="vertical" style={{ width: '100%' }} size="small">
                    <Space>
                      <Tag color={option.color}>{option.label}</Tag>
                      {option.requiredReason && (
                        <Tag color="orange" icon={<ExclamationCircleOutlined />}>
                          需要原因
                        </Tag>
                      )}
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {option.description}
                    </Text>
                    {option.nextSteps && option.nextSteps.length > 0 && (
                      <div>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          下一步状态: {option.nextSteps.map(step => {
                            const nextOption = statusOptions.find(opt => opt.value === step);
                            return nextOption?.label;
                          }).join(', ')}
                        </Text>
                      </div>
                    )}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          {updateMode === 'workflow' && recommendedStatuses.length === 0 && (
            <Alert
              message="当前状态已是终态"
              description="所选案件的当前状态已是流程终态，无推荐的下一步状态。可切换到直接更新模式进行状态变更。"
              type="warning"
              showIcon
            />
          )}
        </Card>

        {/* 状态详情 */}
        {selectedOption && (
          <Card
            title={
              <Space>
                <Tag color={selectedOption.color}>{selectedOption.label}</Tag>
                <span>状态详情</span>
              </Space>
            }
            size="small"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Text>{selectedOption.description}</Text>
              
              {selectedOption.nextSteps && selectedOption.nextSteps.length > 0 && (
                <div>
                  <Title level={5}>后续可能的状态变更:</Title>
                  <Space size={[0, 8]} wrap>
                    {selectedOption.nextSteps.map(step => {
                      const nextOption = statusOptions.find(opt => opt.value === step);
                      return nextOption ? (
                        <Tag key={step} color={nextOption.color}>
                          <ArrowRightOutlined /> {nextOption.label}
                        </Tag>
                      ) : null;
                    })}
                  </Space>
                </div>
              )}
            </Space>
          </Card>
        )}

        {/* 更新原因 */}
        <Card title="更新原因" size="small">
          <Form form={form} layout="horizontal">
            <Form.Item
              name="reason"
              label={
                <Space>
                  <span>变更原因</span>
                  {selectedOption?.requiredReason && <Text type="danger">*</Text>}
                </Space>
              }
              rules={selectedOption?.requiredReason ? [
                { required: true, message: '此状态变更必须填写原因' }
              ] : []}
            >
              <TextArea
                placeholder="请输入状态变更的原因（可选）"
                rows={3}
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Form>
        </Card>

        {/* 操作说明 */}
        <Alert
          message="更新说明"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>状态更新后将记录操作日志，可在案件详情中查看</li>
              <li>某些状态变更会触发自动化流程（如通知、文档生成等）</li>
              <li>建议按照业务流程进行状态更新，确保数据一致性</li>
              <li>重要状态变更（如结案、退案）需要填写详细原因</li>
            </ul>
          }
          type="info"
          showIcon={false}
        />
      </Space>
    </Modal>
  );
};

export default BatchStatusModal;