import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Space,
  Radio,
  Slider,
  Input,
  InputNumber,
  Select,
  Switch,
  Card,
  Row,
  Col,
  Divider,
  Typography,
  Alert,
  Table,
  Tag,
  Progress,
  Button,
  message,
  Spin,
  Statistic,
  Tooltip,
  Badge,
  Descriptions,
  Timeline,
  Avatar
} from 'antd';
import {
  SettingOutlined,
  EnvironmentOutlined,
  TrophyOutlined,
  TeamOutlined,
  BarChartOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  SyncOutlined,
  FileSearchOutlined,
  UserOutlined,
  DollarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { 
  casePackageManagementAPI, 
  SmartAssignRequest, 
  SmartAssignResult,
  AssignmentDetail,
  UnassignedCase,
  OrgAssignmentStat,
  RecommendedOrg
} from '../../../../services/casePackageManagementService';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface SmartAssignmentModalProps {
  visible: boolean;
  packageId: number;
  packageName: string;
  caseCount: number;
  totalAmount: number;
  onCancel: () => void;
  onSuccess: () => void;
}

const SmartAssignmentModal: React.FC<SmartAssignmentModalProps> = ({
  visible,
  packageId,
  packageName,
  caseCount,
  totalAmount,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<string>('COMPREHENSIVE');
  const [weights, setWeights] = useState({
    regionWeight: 30,
    performanceWeight: 40,
    loadWeight: 20,
    specialtyWeight: 10
  });
  const [previewResult, setPreviewResult] = useState<SmartAssignResult | null>(null);
  const [recommendedOrgs, setRecommendedOrgs] = useState<RecommendedOrg[]>([]);
  const [selectedOrgIds, setSelectedOrgIds] = useState<number[]>([]);
  const [excludeOrgIds, setExcludeOrgIds] = useState<number[]>([]);
  const [step, setStep] = useState<'config' | 'preview' | 'result'>('config');

  useEffect(() => {
    if (visible) {
      loadRecommendedOrgs();
      setStep('config');
      setPreviewResult(null);
      form.resetFields();
    }
  }, [visible]);

  const loadRecommendedOrgs = async () => {
    try {
      const response = await casePackageManagementAPI.getRecommendedOrgs(packageId);
      setRecommendedOrgs(response || []);
    } catch (error) {
      console.error('加载推荐机构失败:', error);
    }
  };

  const handlePreview = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const request: SmartAssignRequest = {
        casePackageId: packageId,
        strategy: strategy as any,
        ruleWeights: weights,
        regionWeight: weights.regionWeight,
        performanceWeight: weights.performanceWeight,
        loadWeight: weights.loadWeight,
        specialtyWeight: weights.specialtyWeight,
        minMatchScore: values.minMatchScore || 60,
        maxCasesPerOrg: values.maxCasesPerOrg,
        excludeOrgIds: excludeOrgIds,
        includeOrgIds: selectedOrgIds.length > 0 ? selectedOrgIds : undefined,
        preview: true,
        allowPartialAssignment: values.allowPartialAssignment,
        remarks: values.remarks
      };

      const response = await casePackageManagementAPI.previewSmartAssignment(request);
      setPreviewResult(response);
      setStep('preview');
    } catch (error) {
      message.error('预览失败');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!previewResult) return;
    
    try {
      setLoading(true);
      await casePackageManagementAPI.confirmAssignment(previewResult.assignmentId);
      message.success('智能分案成功');
      setStep('result');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error) {
      message.error('确认分案失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReconfig = () => {
    setStep('config');
    setPreviewResult(null);
  };

  const normalizeWeights = (changedField: string, value: number) => {
    const total = 100;
    const otherFields = Object.keys(weights).filter(key => key !== changedField);
    const remainingTotal = total - value;
    const otherSum = otherFields.reduce((sum, field) => sum + weights[field as keyof typeof weights], 0);
    
    if (otherSum === 0) {
      const avgValue = Math.floor(remainingTotal / otherFields.length);
      const newWeights = { ...weights, [changedField]: value };
      otherFields.forEach(field => {
        newWeights[field as keyof typeof weights] = avgValue;
      });
      setWeights(newWeights);
    } else {
      const ratio = remainingTotal / otherSum;
      const newWeights = { ...weights, [changedField]: value };
      otherFields.forEach(field => {
        newWeights[field as keyof typeof weights] = Math.round(weights[field as keyof typeof weights] * ratio);
      });
      setWeights(newWeights);
    }
  };

  const orgColumns: ColumnsType<RecommendedOrg> = [
    {
      title: '机构名称',
      dataIndex: 'orgName',
      key: 'orgName',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div>{text}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.orgCode}</Text>
          </div>
        </Space>
      )
    },
    {
      title: '匹配度',
      dataIndex: 'matchScore',
      key: 'matchScore',
      width: 120,
      render: (score: number) => (
        <Progress 
          percent={score} 
          size="small" 
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
        />
      )
    },
    {
      title: '地区',
      dataIndex: 'region',
      key: 'region',
      width: 100,
      render: (region: string) => <Tag icon={<EnvironmentOutlined />}>{region}</Tag>
    },
    {
      title: '负载率',
      dataIndex: 'utilizationRate',
      key: 'utilizationRate',
      width: 100,
      render: (rate: number) => (
        <Tag color={rate > 80 ? 'red' : rate > 60 ? 'orange' : 'green'}>
          {rate}%
        </Tag>
      )
    },
    {
      title: '历史业绩',
      key: 'performance',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text style={{ fontSize: 12 }}>回收率: {record.performanceStats.avgRecoveryRate}%</Text>
          <Text style={{ fontSize: 12 }}>成功率: {record.performanceStats.successRate}%</Text>
        </Space>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type={selectedOrgIds.includes(record.orgId) ? 'primary' : 'default'}
            size="small"
            onClick={() => {
              if (selectedOrgIds.includes(record.orgId)) {
                setSelectedOrgIds(selectedOrgIds.filter(id => id !== record.orgId));
              } else {
                setSelectedOrgIds([...selectedOrgIds, record.orgId]);
              }
            }}
          >
            {selectedOrgIds.includes(record.orgId) ? '已选择' : '选择'}
          </Button>
          <Button
            type={excludeOrgIds.includes(record.orgId) ? 'default' : 'text'}
            danger
            size="small"
            onClick={() => {
              if (excludeOrgIds.includes(record.orgId)) {
                setExcludeOrgIds(excludeOrgIds.filter(id => id !== record.orgId));
              } else {
                setExcludeOrgIds([...excludeOrgIds, record.orgId]);
              }
            }}
          >
            {excludeOrgIds.includes(record.orgId) ? '取消排除' : '排除'}
          </Button>
        </Space>
      )
    }
  ];

  const assignmentDetailColumns: ColumnsType<AssignmentDetail> = [
    {
      title: '案件编号',
      dataIndex: 'caseNumber',
      key: 'caseNumber',
      width: 120
    },
    {
      title: '案件金额',
      dataIndex: 'caseAmount',
      key: 'caseAmount',
      width: 100,
      render: (amount: number) => `¥${amount.toLocaleString()}`
    },
    {
      title: '分配机构',
      dataIndex: 'orgName',
      key: 'orgName',
      width: 150
    },
    {
      title: '匹配分数',
      dataIndex: 'matchScore',
      key: 'matchScore',
      width: 100,
      render: (score: number) => (
        <Progress percent={score} size="small" strokeColor="#52c41a" />
      )
    },
    {
      title: '匹配原因',
      dataIndex: 'matchReason',
      key: 'matchReason',
      ellipsis: true
    }
  ];

  const renderConfigStep = () => (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Alert
        message="智能分案说明"
        description="系统将根据您配置的策略和权重，自动将案件分配给最合适的处置机构。您可以预览分配结果后再确认执行。"
        type="info"
        showIcon
      />

      <Card title="选择分案策略" size="small">
        <Radio.Group
          value={strategy}
          onChange={(e) => setStrategy(e.target.value)}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Radio value="REGION_BASED">
              <Space>
                <EnvironmentOutlined />
                <span>地域优先</span>
                <Text type="secondary">优先分配给案件所在地区的处置机构</Text>
              </Space>
            </Radio>
            <Radio value="PERFORMANCE_BASED">
              <Space>
                <TrophyOutlined />
                <span>业绩优先</span>
                <Text type="secondary">优先分配给历史业绩优秀的处置机构</Text>
              </Space>
            </Radio>
            <Radio value="LOAD_BALANCE">
              <Space>
                <TeamOutlined />
                <span>负载均衡</span>
                <Text type="secondary">均衡分配，避免机构负载过重</Text>
              </Space>
            </Radio>
            <Radio value="SPECIALTY_MATCH">
              <Space>
                <BulbOutlined />
                <span>专业匹配</span>
                <Text type="secondary">根据机构专长匹配相应类型案件</Text>
              </Space>
            </Radio>
            <Radio value="COMPREHENSIVE">
              <Space>
                <BarChartOutlined />
                <span>综合评分</span>
                <Text type="secondary">综合考虑多个因素，智能匹配最优机构</Text>
              </Space>
            </Radio>
          </Space>
        </Radio.Group>
      </Card>

      {strategy === 'COMPREHENSIVE' && (
        <Card title="权重配置" size="small">
          <Form.Item label={`地域权重 (${weights.regionWeight}%)`}>
            <Slider
              value={weights.regionWeight}
              onChange={(value) => normalizeWeights('regionWeight', value)}
              marks={{ 0: '0', 50: '50', 100: '100' }}
            />
          </Form.Item>
          <Form.Item label={`业绩权重 (${weights.performanceWeight}%)`}>
            <Slider
              value={weights.performanceWeight}
              onChange={(value) => normalizeWeights('performanceWeight', value)}
              marks={{ 0: '0', 50: '50', 100: '100' }}
            />
          </Form.Item>
          <Form.Item label={`负载权重 (${weights.loadWeight}%)`}>
            <Slider
              value={weights.loadWeight}
              onChange={(value) => normalizeWeights('loadWeight', value)}
              marks={{ 0: '0', 50: '50', 100: '100' }}
            />
          </Form.Item>
          <Form.Item label={`专业度权重 (${weights.specialtyWeight}%)`}>
            <Slider
              value={weights.specialtyWeight}
              onChange={(value) => normalizeWeights('specialtyWeight', value)}
              marks={{ 0: '0', 50: '50', 100: '100' }}
            />
          </Form.Item>
        </Card>
      )}

      <Card title="高级配置" size="small">
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="minMatchScore"
                label="最低匹配分数"
                initialValue={60}
                tooltip="低于此分数的匹配将被拒绝"
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxCasesPerOrg"
                label="单机构最大案件数"
                tooltip="限制每个机构最多分配的案件数量"
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="不限制" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="allowPartialAssignment"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="允许部分分配" unCheckedChildren="必须全部分配" />
          </Form.Item>
          <Form.Item name="remarks" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注信息（选填）" />
          </Form.Item>
        </Form>
      </Card>

      <Card title="推荐处置机构" size="small">
        <Table
          columns={orgColumns}
          dataSource={recommendedOrgs}
          rowKey="orgId"
          pagination={false}
          scroll={{ y: 300 }}
          size="small"
        />
        <div style={{ marginTop: 16 }}>
          <Space>
            <Badge count={selectedOrgIds.length} showZero>
              <Tag icon={<CheckCircleOutlined />}>已选择机构</Tag>
            </Badge>
            <Badge count={excludeOrgIds.length} showZero>
              <Tag icon={<CloseCircleOutlined />} color="red">排除机构</Tag>
            </Badge>
          </Space>
        </div>
      </Card>
    </Space>
  );

  const renderPreviewStep = () => (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {previewResult && (
        <>
          <Card>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="总案件数"
                  value={previewResult.totalCases}
                  prefix={<FileSearchOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="已分配"
                  value={previewResult.assignedCases}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="未分配"
                  value={previewResult.unassignedCount}
                  valueStyle={{ color: previewResult.unassignedCount > 0 ? '#cf1322' : undefined }}
                  prefix={<ExclamationCircleOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="成功率"
                  value={previewResult.successRate}
                  suffix="%"
                  valueStyle={{ color: previewResult.successRate >= 90 ? '#3f8600' : '#faad14' }}
                />
              </Col>
            </Row>
          </Card>

          <Card title="分配详情" size="small">
            <Table
              columns={assignmentDetailColumns}
              dataSource={previewResult.assignmentDetails}
              rowKey="caseId"
              pagination={{ pageSize: 10 }}
              scroll={{ y: 300 }}
              size="small"
            />
          </Card>

          {previewResult.orgStats && previewResult.orgStats.length > 0 && (
            <Card title="机构分配统计" size="small">
              <Table
                columns={[
                  {
                    title: '机构名称',
                    dataIndex: 'orgName',
                    key: 'orgName'
                  },
                  {
                    title: '分配案件数',
                    dataIndex: 'assignedCount',
                    key: 'assignedCount',
                    sorter: (a, b) => a.assignedCount - b.assignedCount
                  },
                  {
                    title: '总金额',
                    dataIndex: 'totalAmount',
                    key: 'totalAmount',
                    render: (val: number) => `¥${val.toLocaleString()}`
                  },
                  {
                    title: '平均匹配度',
                    dataIndex: 'avgMatchScore',
                    key: 'avgMatchScore',
                    render: (val: number) => `${val.toFixed(1)}%`
                  },
                  {
                    title: '当前负载',
                    dataIndex: 'utilizationRate',
                    key: 'utilizationRate',
                    render: (val: number) => (
                      <Progress 
                        percent={val} 
                        size="small"
                        strokeColor={val > 80 ? '#ff4d4f' : val > 60 ? '#faad14' : '#52c41a'}
                      />
                    )
                  }
                ]}
                dataSource={previewResult.orgStats}
                rowKey="orgId"
                pagination={false}
                size="small"
              />
            </Card>
          )}

          {previewResult.unassignedCases && previewResult.unassignedCases.length > 0 && (
            <Card title="未分配案件" size="small">
              <Alert
                message={`有 ${previewResult.unassignedCases.length} 个案件未能成功分配`}
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Table
                columns={[
                  {
                    title: '案件编号',
                    dataIndex: 'caseNumber',
                    key: 'caseNumber'
                  },
                  {
                    title: '案件金额',
                    dataIndex: 'caseAmount',
                    key: 'caseAmount',
                    render: (val: number) => `¥${val.toLocaleString()}`
                  },
                  {
                    title: '未分配原因',
                    dataIndex: 'unassignedReason',
                    key: 'unassignedReason'
                  },
                  {
                    title: '建议操作',
                    dataIndex: 'suggestedAction',
                    key: 'suggestedAction'
                  }
                ]}
                dataSource={previewResult.unassignedCases}
                rowKey="caseId"
                pagination={false}
                size="small"
              />
            </Card>
          )}
        </>
      )}
    </Space>
  );

  const renderResultStep = () => (
    <div style={{ textAlign: 'center', padding: '48px 0' }}>
      <CheckCircleOutlined style={{ fontSize: 72, color: '#52c41a' }} />
      <Title level={3} style={{ marginTop: 24 }}>
        智能分案成功
      </Title>
      <Paragraph type="secondary">
        案件包已成功分配给相应的处置机构
      </Paragraph>
      {previewResult && (
        <Descriptions column={1} style={{ marginTop: 24 }}>
          <Descriptions.Item label="分配案件数">
            {previewResult.assignedCases} / {previewResult.totalCases}
          </Descriptions.Item>
          <Descriptions.Item label="涉及机构数">
            {previewResult.orgStats?.length || 0} 家
          </Descriptions.Item>
          <Descriptions.Item label="执行时间">
            {previewResult.executionTime} ms
          </Descriptions.Item>
        </Descriptions>
      )}
    </div>
  );

  const renderFooter = () => {
    if (step === 'config') {
      return [
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button
          key="preview"
          type="primary"
          onClick={handlePreview}
          loading={loading}
          icon={<SyncOutlined />}
        >
          预览分配结果
        </Button>
      ];
    }
    
    if (step === 'preview') {
      return [
        <Button key="back" onClick={handleReconfig}>
          重新配置
        </Button>,
        <Button
          key="confirm"
          type="primary"
          onClick={handleConfirm}
          loading={loading}
          disabled={!previewResult || previewResult.assignedCases === 0}
        >
          确认执行
        </Button>
      ];
    }
    
    return [
      <Button key="close" type="primary" onClick={onCancel}>
        完成
      </Button>
    ];
  };

  return (
    <Modal
      title={
        <Space>
          <SettingOutlined />
          智能分案 - {packageName}
        </Space>
      }
      visible={visible}
      onCancel={onCancel}
      width={900}
      footer={renderFooter()}
      destroyOnClose
    >
      <Spin spinning={loading}>
        {step === 'config' && renderConfigStep()}
        {step === 'preview' && renderPreviewStep()}
        {step === 'result' && renderResultStep()}
      </Spin>
    </Modal>
  );
};

export default SmartAssignmentModal;