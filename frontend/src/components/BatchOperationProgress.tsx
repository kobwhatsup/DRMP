import React, { useState, useEffect } from 'react';
import {
  Modal,
  Progress,
  List,
  Typography,
  Space,
  Tag,
  Button,
  Alert,
  Result,
  Spin
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import {
  getBatchOperation,
  BatchOperationResponse
} from '@/services/batchOperationService';

const { Title, Text } = Typography;

interface BatchOperationProgressProps {
  visible: boolean;
  operationId: number | null;
  onClose: () => void;
  onComplete?: (result: BatchOperationResponse) => void;
}

const BatchOperationProgress: React.FC<BatchOperationProgressProps> = ({
  visible,
  operationId,
  onClose,
  onComplete
}) => {
  const [operation, setOperation] = useState<BatchOperationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNotifiedCompletion, setHasNotifiedCompletion] = useState(false);

  // 重置通知状态当操作 ID 变化时
  useEffect(() => {
    setHasNotifiedCompletion(false);
  }, [operationId]);

  // 轮询获取操作状态
  useEffect(() => {
    if (!visible || !operationId) return;

    let timer: NodeJS.Timeout;
    let shouldContinuePolling = true;

    const fetchOperationStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getBatchOperation(operationId);
        setOperation(data);
        
        // 如果操作完成且还没有通知过，通知父组件
        if (data.isCompleted && onComplete && !hasNotifiedCompletion) {
          setHasNotifiedCompletion(true);
          onComplete(data);
        }
        
        // 如果操作完成，停止轮询
        if (data.isCompleted) {
          shouldContinuePolling = false;
        }
      } catch (err: any) {
        setError(err.message || '获取操作状态失败');
        // 当出现错误时，停止轮询
        shouldContinuePolling = false;
      } finally {
        setLoading(false);
      }
    };

    // 立即获取一次
    fetchOperationStatus();

    // 开始轮询
    timer = setInterval(() => {
      if (!shouldContinuePolling || operation?.isCompleted) {
        clearInterval(timer);
        return;
      }
      fetchOperationStatus();
    }, 3000);

    return () => {
      shouldContinuePolling = false;
      clearInterval(timer);
    };
  }, [visible, operationId, operation?.isCompleted, onComplete, hasNotifiedCompletion]);

  const handleClose = () => {
    setOperation(null);
    setError(null);
    setHasNotifiedCompletion(false);
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'PROCESSING':
        return 'processing';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'FAILED':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'PROCESSING':
        return <LoadingOutlined style={{ color: '#1890ff' }} />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  return (
    <Modal
      title="批量操作进度"
      visible={visible}
      onCancel={handleClose}
      footer={[
        <Button key="close" onClick={handleClose}>
          {operation?.isCompleted ? '关闭' : '最小化'}
        </Button>
      ]}
      width={800}
      destroyOnClose
      bodyStyle={{ maxHeight: 'calc(80vh - 110px)', overflowY: 'auto' }}
    >
      {loading && !operation && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>正在获取操作状态...</Text>
          </div>
        </div>
      )}

      {error && (
        <Alert
          message="获取操作状态失败"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {operation && (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* 操作基本信息 */}
          <div>
            <Title level={4}>{operation.operationName}</Title>
            <Space>
              <Text type="secondary">操作类型:</Text>
              <Tag>{operation.operationTypeDesc}</Tag>
              <Text type="secondary">状态:</Text>
              <Tag 
                color={getStatusColor(operation.status)}
                icon={getStatusIcon(operation.status)}
              >
                {operation.statusDesc}
              </Tag>
            </Space>
          </div>

          {/* 进度条 */}
          <div>
            <div style={{ marginBottom: 8 }}>
              <Space>
                <Text strong>操作进度:</Text>
                <Text>{operation.progressPercentage}%</Text>
              </Space>
            </div>
            <Progress
              percent={operation.progressPercentage}
              status={
                operation.status === 'FAILED' ? 'exception' :
                operation.status === 'COMPLETED' ? 'success' : 'active'
              }
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
          </div>

          {/* 统计信息 */}
          <div>
            <List
              size="small"
              dataSource={[
                { label: '目标数量', value: operation.targetCount },
                { label: '成功数量', value: operation.successCount },
                { label: '失败数量', value: operation.failedCount },
                { label: '成功率', value: `${operation.successRate}%` },
                { label: '执行时间', value: operation.executionTime ? `${operation.executionTime}ms` : '-' }
              ]}
              renderItem={item => (
                <List.Item>
                  <Text type="secondary">{item.label}:</Text>
                  <Text strong>{item.value}</Text>
                </List.Item>
              )}
            />
          </div>

          {/* 当前步骤 */}
          {operation.currentStep && (
            <Alert
              message="当前步骤"
              description={operation.currentStep}
              type="info"
              showIcon
            />
          )}

          {/* 错误信息 */}
          {operation.errorMessage && (
            <Alert
              message="错误信息"
              description={operation.errorMessage}
              type="error"
              showIcon
            />
          )}

          {/* 完成状态 */}
          {operation.isCompleted && (
            <Result
              status={operation.status === 'COMPLETED' ? 'success' : 'error'}
              title={
                operation.status === 'COMPLETED' 
                  ? '批量操作完成' 
                  : '批量操作失败'
              }
              subTitle={
                operation.status === 'COMPLETED'
                  ? `成功处理 ${operation.successCount} 个项目`
                  : operation.errorMessage || '操作过程中发生错误'
              }
            />
          )}

          {/* 时间信息 */}
          <div>
            <Space direction="vertical" size="small">
              {operation.startedAt && (
                <Text type="secondary">
                  开始时间: {operation.startedAt}
                </Text>
              )}
              {operation.completedAt && (
                <Text type="secondary">
                  完成时间: {operation.completedAt}
                </Text>
              )}
            </Space>
          </div>
        </Space>
      )}
    </Modal>
  );
};

export default BatchOperationProgress;