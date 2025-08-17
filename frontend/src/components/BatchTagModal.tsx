import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Space,
  Tag,
  Button,
  Typography,
  Checkbox,
  Row,
  Col,
  Alert,
  Card,
  message
} from 'antd';
import {
  TagsOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { batchAddTags, batchRemoveTags, storeBatchOperation } from '@/services/batchOperationService';

const { Title } = Typography;

// 预定义标签 - 移到组件外部避免依赖问题
const commonTags = [
  '重点关注', '失联', '承诺还款', '异议', '投诉',
  '法律纠纷', '财产调查', '委托律师', '协商中',
  '分期还款', '一次性还款', '部分还款', '拒绝还款',
  '高风险', '中风险', '低风险', '已结案', '待跟进'
];

interface BatchTagModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (result: any) => void;
  caseIds: string[];
  operationType: 'add' | 'remove';
}

const BatchTagModal: React.FC<BatchTagModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  caseIds,
  operationType
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [predefinedTags, setPredefinedTags] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setPredefinedTags(commonTags);
      setSelectedTags([]);
      setCustomTag('');
      form.resetFields();
    }
  }, [visible, form]);

  // 添加自定义标签
  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags([...selectedTags, customTag.trim()]);
      setCustomTag('');
    }
  };

  // 移除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  // 切换预定义标签
  const handleTogglePredefinedTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 执行批量标签操作
  const handleExecute = async () => {
    if (selectedTags.length === 0) {
      message.warning('请至少选择一个标签');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (operationType === 'add') {
        result = await batchAddTags(caseIds, selectedTags);
      } else {
        result = await batchRemoveTags(caseIds, selectedTags);
      }
      
      // 存储操作数据以便后续查询
      storeBatchOperation(result);
      onSuccess(result);
    } catch (error: any) {
      message.error(`操作失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedTags([]);
    setCustomTag('');
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <Space>
          <TagsOutlined />
          <span>{operationType === 'add' ? '批量添加标签' : '批量移除标签'}</span>
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
          disabled={selectedTags.length === 0}
          onClick={handleExecute}
        >
          {operationType === 'add' ? '添加标签' : '移除标签'}
        </Button>
      ]}
      width={600}
      destroyOnClose
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 操作说明 */}
        <Alert
          message={`将对 ${caseIds.length} 个案件${operationType === 'add' ? '添加' : '移除'}所选标签`}
          type="info"
          showIcon
        />

        {/* 当前选中的标签 */}
        {selectedTags.length > 0 && (
          <div>
            <Title level={5}>已选择的标签:</Title>
            <Space size={[0, 8]} wrap>
              {selectedTags.map((tag, index) => (
                <Tag
                  key={index}
                  closable
                  onClose={() => handleRemoveTag(tag)}
                  color={operationType === 'add' ? 'green' : 'red'}
                >
                  {tag}
                </Tag>
              ))}
            </Space>
          </div>
        )}

        {/* 自定义标签输入 */}
        <div>
          <Title level={5}>添加自定义标签:</Title>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="输入自定义标签名称"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onPressEnter={handleAddCustomTag}
              maxLength={20}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddCustomTag}
              disabled={!customTag.trim() || selectedTags.includes(customTag.trim())}
            >
              添加
            </Button>
          </Space.Compact>
        </div>

        {/* 预定义标签选择 */}
        <Card title="选择预定义标签" size="small">
          <Row gutter={[12, 12]}>
            {predefinedTags.map((tag, index) => (
              <Col key={index} span={6}>
                  <Checkbox
                    checked={selectedTags.includes(tag)}
                    onChange={() => handleTogglePredefinedTag(tag)}
                  >
                    <Tag color={selectedTags.includes(tag) ? 'blue' : 'default'}>
                      {tag}
                    </Tag>
                  </Checkbox>
                </Col>
            ))}
          </Row>
        </Card>

        {/* 操作说明 */}
        <Alert
          message="标签说明"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>标签用于案件分类和快速筛选</li>
              <li>可以添加自定义标签或选择预定义标签</li>
              <li>每个案件最多可以有10个标签</li>
              <li>{operationType === 'add' ? '添加标签不会覆盖现有标签' : '只会移除选中的标签'}</li>
            </ul>
          }
          type="info"
          showIcon={false}
        />
      </Space>
    </Modal>
  );
};

export default BatchTagModal;