import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Switch,
  Radio,
  Divider,
  Space,
  Button,
  Tabs,
  Alert,
  Row,
  Col,
  Card,
  Typography,
  Upload,
  Table,
  message,
  Tooltip,
  Tag,
  Slider,
  Checkbox,
  TimePicker
} from 'antd';
import {
  InboxOutlined,
  PlusOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  TeamOutlined,
  DollarOutlined,
  CalendarOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { UploadProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { casePackageManagementAPI, AssignmentType, CasePackageStatus } from '../../../../services/casePackageManagementService';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { Dragger } = Upload;

interface CasePackageFormProps {
  open: boolean;
  editData?: any;
  onCancel: () => void;
  onSuccess: () => void;
}

interface CaseItem {
  id?: number;
  caseNumber: string;
  debtorName: string;
  debtorIdCard: string;
  debtorPhone: string;
  totalDebtAmount: number;
  overdueDays: number;
  debtType: string;
  region: string;
}

const CasePackageForm: React.FC<CasePackageFormProps> = ({
  open,
  editData,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [assignmentType, setAssignmentType] = useState<AssignmentType>(AssignmentType.MANUAL);
  const [allowBidding, setAllowBidding] = useState(false);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [uploadedCases, setUploadedCases] = useState<CaseItem[]>([]);
  const [selectedCaseIds, setSelectedCaseIds] = useState<number[]>([]);
  const [availableOrgs, setAvailableOrgs] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      if (editData) {
        form.setFieldsValue({
          ...editData,
          entrustDates: editData.entrustStartDate && editData.entrustEndDate
            ? [dayjs(editData.entrustStartDate), dayjs(editData.entrustEndDate)]
            : undefined,
          biddingStartTime: editData.biddingStartTime ? dayjs(editData.biddingStartTime) : undefined,
          biddingEndTime: editData.biddingEndTime ? dayjs(editData.biddingEndTime) : undefined
        });
        setAssignmentType(editData.assignmentType || AssignmentType.MANUAL);
        setAllowBidding(editData.allowBidding || false);
        loadCases(editData.id);
      } else {
        form.resetFields();
        setAssignmentType(AssignmentType.MANUAL);
        setAllowBidding(false);
        setCases([]);
        setUploadedCases([]);
      }
      loadAvailableOrgs();
    }
  }, [open, editData]);

  const loadCases = async (packageId: number) => {
    try {
      const response = await casePackageManagementAPI.getCasesInPackage(packageId, {
        page: 0,
        size: 1000
      });
      setCases(response.data.content || []);
    } catch (error) {
      message.error('加载案件列表失败');
    }
  };

  const loadAvailableOrgs = async () => {
    try {
      const response = await casePackageManagementAPI.getAvailableOrgs();
      setAvailableOrgs(response.data || []);
    } catch (error) {
      console.error('加载处置机构失败:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData = {
        ...values,
        assignmentType,
        allowBidding,
        entrustStartDate: values.entrustDates?.[0]?.format('YYYY-MM-DD'),
        entrustEndDate: values.entrustDates?.[1]?.format('YYYY-MM-DD'),
        biddingStartTime: values.biddingStartTime?.format('YYYY-MM-DD HH:mm:ss'),
        biddingEndTime: values.biddingEndTime?.format('YYYY-MM-DD HH:mm:ss'),
        cases: [...cases, ...uploadedCases]
      };

      delete formData.entrustDates;

      if (editData) {
        await casePackageManagementAPI.updateCasePackage(editData.id, formData);
        message.success('更新成功');
      } else {
        await casePackageManagementAPI.createCasePackage(formData);
        message.success('创建成功');
      }

      onSuccess();
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    accept: '.xlsx,.xls,.csv',
    beforeUpload: (file) => {
      const isValidType = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                         file.type === 'application/vnd.ms-excel' ||
                         file.type === 'text/csv';
      if (!isValidType) {
        message.error('只能上传 Excel 或 CSV 文件！');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过 10MB！');
        return false;
      }
      
      // 模拟文件解析
      setTimeout(() => {
        const mockCases: CaseItem[] = [
          {
            caseNumber: 'CASE2024001',
            debtorName: '张三',
            debtorIdCard: '110***********1234',
            debtorPhone: '138****5678',
            totalDebtAmount: 50000,
            overdueDays: 90,
            debtType: '信用贷',
            region: '北京市'
          },
          {
            caseNumber: 'CASE2024002',
            debtorName: '李四',
            debtorIdCard: '310***********5678',
            debtorPhone: '139****1234',
            totalDebtAmount: 80000,
            overdueDays: 120,
            debtType: '消费贷',
            region: '上海市'
          }
        ];
        setUploadedCases(prev => [...prev, ...mockCases]);
        message.success(`成功导入 ${mockCases.length} 条案件`);
      }, 1000);
      
      return false;
    }
  };

  const caseColumns: ColumnsType<CaseItem> = [
    {
      title: '案件编号',
      dataIndex: 'caseNumber',
      key: 'caseNumber',
      width: 120
    },
    {
      title: '债务人',
      dataIndex: 'debtorName',
      key: 'debtorName',
      width: 80
    },
    {
      title: '身份证号',
      dataIndex: 'debtorIdCard',
      key: 'debtorIdCard',
      width: 150
    },
    {
      title: '债务金额',
      dataIndex: 'totalDebtAmount',
      key: 'totalDebtAmount',
      width: 100,
      render: (val: number) => `¥${val.toLocaleString()}`
    },
    {
      title: '逾期天数',
      dataIndex: 'overdueDays',
      key: 'overdueDays',
      width: 80,
      render: (val: number) => <Tag color={val > 90 ? 'red' : 'orange'}>{val}天</Tag>
    },
    {
      title: '债务类型',
      dataIndex: 'debtType',
      key: 'debtType',
      width: 80
    },
    {
      title: '地区',
      dataIndex: 'region',
      key: 'region',
      width: 100
    },
    {
      title: '操作',
      key: 'action',
      width: 60,
      render: (_, record, index) => (
        <Button
          type="link"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => {
            const newCases = [...uploadedCases];
            newCases.splice(index, 1);
            setUploadedCases(newCases);
          }}
        >
          删除
        </Button>
      )
    }
  ];

  const renderBasicInfo = () => (
    <Card>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="packageName"
            label="案件包名称"
            rules={[{ required: true, message: '请输入案件包名称' }]}
          >
            <Input placeholder="请输入案件包名称" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="packageCode"
            label="案件包编号"
            rules={[{ required: true, message: '请输入案件包编号' }]}
          >
            <Input placeholder="系统自动生成或手动输入" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="entrustDates"
            label="委托期限"
            rules={[{ required: true, message: '请选择委托期限' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="expectedRecoveryRate"
            label="预期回收率"
            rules={[{ required: true, message: '请输入预期回收率' }]}
          >
            <InputNumber
              min={0}
              max={100}
              formatter={value => `${value}%`}
              parser={value => {
                const num = Number(value!.replace('%', ''));
                return Math.min(Math.max(num, 0), 100) as any;
              }}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="expectedDisposalDays"
            label="预期处置天数"
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入预期处置天数" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="preferredDisposalMethods"
            label="优先处置方式"
          >
            <Select placeholder="请选择优先处置方式">
              <Option value="MEDIATION">调解</Option>
              <Option value="LITIGATION">诉讼</Option>
              <Option value="ARBITRATION">仲裁</Option>
              <Option value="ASSET_DISPOSAL">资产处置</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="description"
        label="案件包描述"
      >
        <TextArea rows={4} placeholder="请输入案件包描述" />
      </Form.Item>
    </Card>
  );

  const renderAssignmentConfig = () => (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Title level={5}>分案方式</Title>
          <Radio.Group
            value={assignmentType}
            onChange={(e) => setAssignmentType(e.target.value)}
          >
            <Space direction="vertical">
              <Radio value={AssignmentType.MANUAL}>
                <Space>
                  <TeamOutlined />
                  手动分案
                  <Text type="secondary">手动选择处置机构</Text>
                </Space>
              </Radio>
              <Radio value={AssignmentType.BIDDING}>
                <Space>
                  <DollarOutlined />
                  竞标分案
                  <Text type="secondary">发布到案件市场，接受竞标</Text>
                </Space>
              </Radio>
              <Radio value={AssignmentType.SMART}>
                <Space>
                  <SettingOutlined />
                  智能分案
                  <Text type="secondary">根据规则自动分配</Text>
                </Space>
              </Radio>
              <Radio value={AssignmentType.DESIGNATED}>
                <Space>
                  <TeamOutlined />
                  定向分案
                  <Text type="secondary">指定特定机构处置</Text>
                </Space>
              </Radio>
            </Space>
          </Radio.Group>
        </div>

        {assignmentType === AssignmentType.MANUAL && (
          <div>
            <Divider />
            <Form.Item
              name="disposalOrgId"
              label="选择处置机构"
            >
              <Select
                placeholder="请选择处置机构"
                showSearch
                filterOption={(input, option) =>
                  (option?.label as string || '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {availableOrgs.map(org => (
                  <Option key={org.id} value={org.id}>{org.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        )}

        {assignmentType === AssignmentType.BIDDING && (
          <div>
            <Divider />
            <Form.Item
              name="allowBidding"
              valuePropName="checked"
              label="允许竞标"
            >
              <Switch
                checked={allowBidding}
                onChange={setAllowBidding}
                checkedChildren="是"
                unCheckedChildren="否"
              />
            </Form.Item>
            
            {allowBidding && (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="biddingStartTime"
                      label="竞标开始时间"
                      rules={[{ required: true, message: '请选择竞标开始时间' }]}
                    >
                      <DatePicker showTime style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="biddingEndTime"
                      label="竞标结束时间"
                      rules={[{ required: true, message: '请选择竞标结束时间' }]}
                    >
                      <DatePicker showTime style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="minBidAmount"
                      label="最低竞标金额"
                    >
                      <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => {
                          const num = Number(value!.replace(/\¥\s?|(,*)/g, ''));
                          return Math.max(num, 0) as any;
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="bidBondAmount"
                      label="竞标保证金"
                    >
                      <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => {
                          const num = Number(value!.replace(/\¥\s?|(,*)/g, ''));
                          return Math.max(num, 0) as any;
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="biddingRequirements"
                  label="竞标要求"
                >
                  <TextArea rows={3} placeholder="请输入竞标要求" />
                </Form.Item>
              </>
            )}
          </div>
        )}

        {assignmentType === AssignmentType.SMART && (
          <div>
            <Divider />
            <Title level={5}>智能分案配置</Title>
            
            <Form.Item label="地域权重">
              <Slider
                marks={{ 0: '0', 50: '50', 100: '100' }}
                defaultValue={30}
              />
            </Form.Item>
            
            <Form.Item label="业绩权重">
              <Slider
                marks={{ 0: '0', 50: '50', 100: '100' }}
                defaultValue={40}
              />
            </Form.Item>
            
            <Form.Item label="负载权重">
              <Slider
                marks={{ 0: '0', 50: '50', 100: '100' }}
                defaultValue={20}
              />
            </Form.Item>
            
            <Form.Item label="专业度权重">
              <Slider
                marks={{ 0: '0', 50: '50', 100: '100' }}
                defaultValue={10}
              />
            </Form.Item>

            <Form.Item
              name="minMatchScore"
              label="最低匹配分数"
            >
              <InputNumber min={0} max={100} defaultValue={60} />
            </Form.Item>
          </div>
        )}

        {assignmentType === AssignmentType.DESIGNATED && (
          <div>
            <Divider />
            <Form.Item
              name="designatedOrgIds"
              label="指定处置机构"
              rules={[{ required: true, message: '请选择指定的处置机构' }]}
            >
              <Select
                mode="multiple"
                placeholder="请选择指定的处置机构"
                showSearch
                filterOption={(input, option) =>
                  (option?.label as string || '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {availableOrgs.map(org => (
                  <Option key={org.id} value={org.id}>{org.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        )}
      </Space>
    </Card>
  );

  const renderCaseList = () => (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Title level={5}>批量导入案件</Title>
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持 Excel、CSV 格式，单个文件不超过10MB
            </p>
          </Dragger>
          <Button
            type="link"
            onClick={() => casePackageManagementAPI.downloadImportTemplate()}
          >
            下载导入模板
          </Button>
        </div>

        {(cases.length > 0 || uploadedCases.length > 0) && (
          <div>
            <Title level={5}>
              案件列表
              <Text type="secondary" style={{ marginLeft: 10, fontSize: 14 }}>
                共 {cases.length + uploadedCases.length} 条
              </Text>
            </Title>
            <Table
              columns={caseColumns}
              dataSource={[...cases, ...uploadedCases]}
              rowKey={(record, index) => record.id || `temp-${index}`}
              pagination={false}
              scroll={{ y: 400 }}
              size="small"
            />
          </div>
        )}
      </Space>
    </Card>
  );

  return (
    <Modal
      title={editData ? '编辑案件包' : '创建案件包'}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={900}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'basic',
              label: '基本信息',
              children: renderBasicInfo()
            },
            {
              key: 'assignment',
              label: '分案配置',
              children: renderAssignmentConfig()
            },
            {
              key: 'cases',
              label: '案件列表',
              children: renderCaseList()
            }
          ]}
        />
      </Form>
    </Modal>
  );
};

export default CasePackageForm;