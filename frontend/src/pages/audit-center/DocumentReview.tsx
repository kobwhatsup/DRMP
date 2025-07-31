import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Space, Tag, Modal, Image, Row, Col, Descriptions,
  Form, Input, Select, message, Upload, Timeline, Alert, Progress, Rate,
  Tabs, Divider, Tooltip, Badge
} from 'antd';
import {
  EyeOutlined, CheckOutlined, CloseOutlined, DownloadOutlined,
  FileTextOutlined, FilePdfOutlined, FileImageOutlined,
  WarningOutlined, InfoCircleOutlined, SearchOutlined,
  ReloadOutlined, UploadOutlined, EditOutlined, DeleteOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

// 文件审核接口定义
interface DocumentReview {
  id: number;
  applicationId: number;
  orgName: string;
  orgType: string;
  documentName: string;
  documentType: string;
  documentTypeName: string;
  fileUrl: string;
  fileSize: string;
  uploadTime: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESUBMITTED';
  statusName: string;
  reviewer: string;
  reviewTime: string;
  comments: string;
  rejectionReason: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  checkPoints: Array<{
    point: string;
    status: 'PASS' | 'FAIL' | 'WARNING';
    comment: string;
  }>;
  versions: Array<{
    version: number;
    fileUrl: string;
    uploadTime: string;
    status: string;
    comments: string;
  }>;
}

// 审核标准配置
interface ReviewCriteria {
  documentType: string;
  checkPoints: Array<{
    id: string;
    name: string;
    description: string;
    required: boolean;
    weight: number;
  }>;
}

const DocumentReview: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<DocumentReview[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentReview | null>(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [criteriaModalVisible, setCriteriaModalVisible] = useState(false);
  const [reviewForm] = Form.useForm();
  const [filters, setFilters] = useState({
    status: 'all',
    documentType: 'all',
    orgType: 'all'
  });

  const [reviewCriteria, setReviewCriteria] = useState<ReviewCriteria[]>([]);

  useEffect(() => {
    loadDocuments();
    loadReviewCriteria();
  }, [filters]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockData: DocumentReview[] = [
        {
          id: 1,
          applicationId: 101,
          orgName: '深圳市创新科技小贷公司',
          orgType: 'SOURCE',
          documentName: '营业执照',
          documentType: 'BUSINESS_LICENSE',
          documentTypeName: '营业执照',
          fileUrl: '/files/business_license_1.pdf',
          fileSize: '2.3MB',
          uploadTime: '2024-07-28 10:30:00',
          status: 'PENDING',
          statusName: '待审核',
          reviewer: '',
          reviewTime: '',
          comments: '',
          rejectionReason: '',
          priority: 'HIGH',
          checkPoints: [
            { point: '执照有效期', status: 'PASS', comment: '有效期至2025年12月' },
            { point: '经营范围', status: 'WARNING', comment: '需确认是否包含小额贷款业务' },
            { point: '注册资本', status: 'PASS', comment: '注册资本5000万元' }
          ],
          versions: [
            {
              version: 1,
              fileUrl: '/files/business_license_1.pdf',
              uploadTime: '2024-07-28 10:30:00',
              status: 'CURRENT',
              comments: '初始上传'
            }
          ]
        },
        {
          id: 2,
          applicationId: 102,
          orgName: '北京德和律师事务所',
          orgType: 'DISPOSAL',
          documentName: '律师事务所执业许可证',
          documentType: 'PRACTICE_PERMIT',
          documentTypeName: '执业许可证',
          fileUrl: '/files/practice_permit_2.pdf',
          fileSize: '1.8MB',
          uploadTime: '2024-07-27 14:20:00',
          status: 'APPROVED',
          statusName: '已通过',
          reviewer: '审核员张三',
          reviewTime: '2024-07-28 09:00:00',
          comments: '文件清晰，信息完整，符合要求',
          rejectionReason: '',
          priority: 'MEDIUM',
          checkPoints: [
            { point: '许可证有效期', status: 'PASS', comment: '有效期至2026年6月' },
            { point: '执业范围', status: 'PASS', comment: '包含金融法律服务' },
            { point: '主任律师资格', status: 'PASS', comment: '具备高级律师资格' }
          ],
          versions: [
            {
              version: 1,
              fileUrl: '/files/practice_permit_2.pdf',
              uploadTime: '2024-07-27 14:20:00',
              status: 'APPROVED',
              comments: '审核通过'
            }
          ]
        },
        {
          id: 3,
          applicationId: 103,
          orgName: '上海浦东催收服务公司',
          orgType: 'DISPOSAL',
          documentName: '催收业务许可证',
          documentType: 'COLLECTION_PERMIT',
          documentTypeName: '催收许可证',
          fileUrl: '/files/collection_permit_3.pdf',
          fileSize: '2.1MB',
          uploadTime: '2024-07-26 16:45:00',
          status: 'REJECTED',
          statusName: '已拒绝',
          reviewer: '审核员李四',
          reviewTime: '2024-07-27 11:30:00',
          comments: '许可证已过期，需要重新上传有效证件',
          rejectionReason: '证件过期',
          priority: 'LOW',
          checkPoints: [
            { point: '许可证有效期', status: 'FAIL', comment: '已于2024年3月过期' },
            { point: '业务范围', status: 'PASS', comment: '符合催收业务要求' },
            { point: '注册信息', status: 'PASS', comment: '注册信息完整' }
          ],
          versions: [
            {
              version: 1,
              fileUrl: '/files/collection_permit_3.pdf',
              uploadTime: '2024-07-26 16:45:00',
              status: 'REJECTED',
              comments: '证件过期，需重新上传'
            }
          ]
        }
      ];
      
      setDocuments(mockData);
    } catch (error) {
      console.error('加载文件列表失败:', error);
      message.error('加载文件列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadReviewCriteria = async () => {
    try {
      // 模拟加载审核标准
      const mockCriteria: ReviewCriteria[] = [
        {
          documentType: 'BUSINESS_LICENSE',
          checkPoints: [
            { id: '1', name: '执照有效期', description: '营业执照必须在有效期内', required: true, weight: 30 },
            { id: '2', name: '经营范围', description: '经营范围必须符合申请业务类型', required: true, weight: 25 },
            { id: '3', name: '注册资本', description: '注册资本需达到最低要求', required: true, weight: 20 },
            { id: '4', name: '法人信息', description: '法人代表信息清晰完整', required: true, weight: 15 },
            { id: '5', name: '印章清晰', description: '公章或印章清晰可见', required: false, weight: 10 }
          ]
        },
        {
          documentType: 'PRACTICE_PERMIT',
          checkPoints: [
            { id: '1', name: '许可证有效期', description: '执业许可证在有效期内', required: true, weight: 35 },
            { id: '2', name: '执业范围', description: '执业范围包含相关法律服务', required: true, weight: 30 },
            { id: '3', name: '主任律师资格', description: '主任律师具备相应资格', required: true, weight: 25 },
            { id: '4', name: '律所信息', description: '律师事务所基本信息完整', required: true, weight: 10 }
          ]
        }
      ];
      
      setReviewCriteria(mockCriteria);
    } catch (error) {
      console.error('加载审核标准失败:', error);
    }
  };

  const handlePreview = (record: DocumentReview) => {
    setSelectedDocument(record);
    setPreviewModalVisible(true);
  };

  const handleReview = (record: DocumentReview) => {
    setSelectedDocument(record);
    setReviewModalVisible(true);
    
    // 预填充表单
    reviewForm.setFieldsValue({
      status: record.status,
      comments: record.comments,
      rejectionReason: record.rejectionReason
    });
  };

  const handleReviewSubmit = async () => {
    try {
      const values = await reviewForm.validateFields();
      // API调用
      message.success('审核操作成功');
      setReviewModalVisible(false);
      reviewForm.resetFields();
      loadDocuments();
    } catch (error) {
      message.error('审核操作失败');
    }
  };

  const handleDownload = (record: DocumentReview) => {
    // 模拟文件下载
    message.success(`开始下载 ${record.documentName}`);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImageOutlined style={{ color: '#52c41a' }} />;
      default:
        return <FileTextOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'orange',
      'APPROVED': 'green',
      'REJECTED': 'red',
      'RESUBMITTED': 'blue'
    };
    return statusMap[status] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const priorityMap: Record<string, string> = {
      'HIGH': 'red',
      'MEDIUM': 'orange',
      'LOW': 'green'
    };
    return priorityMap[priority] || 'default';
  };

  const getCheckPointIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckOutlined style={{ color: '#52c41a' }} />;
      case 'FAIL':
        return <CloseOutlined style={{ color: '#ff4d4f' }} />;
      case 'WARNING':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const columns: ColumnsType<DocumentReview> = [
    {
      title: '文件信息',
      key: 'fileInfo',
      width: 250,
      render: (_, record: DocumentReview) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            {getFileIcon(record.fileUrl)}
            <span style={{ marginLeft: 8, fontWeight: 'bold' }}>{record.documentName}</span>
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {record.orgName}
          </div>
          <div style={{ fontSize: 12, color: '#999' }}>
            {record.fileSize} | {dayjs(record.uploadTime).format('MM-DD HH:mm')}
          </div>
        </div>
      ),
    },
    {
      title: '文件类型',
      dataIndex: 'documentTypeName',
      key: 'documentTypeName',
      width: 120,
      render: (text: string, record: DocumentReview) => (
        <div>
          <Tag color={record.orgType === 'SOURCE' ? 'blue' : 'green'}>
            {text}
          </Tag>
        </div>
      ),
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string, record: DocumentReview) => (
        <div>
          <Tag color={getStatusColor(status)}>{record.statusName}</Tag>
          {record.reviewer && (
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              {record.reviewer}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '检查项目',
      key: 'checkPoints',
      width: 200,
      render: (_, record: DocumentReview) => (
        <div>
          {record.checkPoints.slice(0, 3).map((point, index) => (
            <div key={index} style={{ marginBottom: 2 }}>
              <span style={{ marginRight: 4 }}>
                {getCheckPointIcon(point.status)}
              </span>
              <span style={{ fontSize: 12 }}>{point.point}</span>
            </div>
          ))}
          {record.checkPoints.length > 3 && (
            <div style={{ fontSize: 12, color: '#666' }}>
              +{record.checkPoints.length - 3} 更多
            </div>
          )}
        </div>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority === 'HIGH' ? '高' : priority === 'MEDIUM' ? '中' : '低'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record: DocumentReview) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handlePreview(record)}
          >
            预览
          </Button>
          <Button 
            type="link" 
            icon={<DownloadOutlined />} 
            onClick={() => handleDownload(record)}
          >
            下载
          </Button>
          {record.status === 'PENDING' && (
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              onClick={() => handleReview(record)}
            >
              审核
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="document-review">
      <Card title="文件审核管理" bordered={false}>
        {/* 筛选条件 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={4}>
            <Select
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              style={{ width: '100%' }}
              placeholder="审核状态"
            >
              <Option value="all">全部状态</Option>
              <Option value="PENDING">待审核</Option>
              <Option value="APPROVED">已通过</Option>
              <Option value="REJECTED">已拒绝</Option>
              <Option value="RESUBMITTED">已重提</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              value={filters.documentType}
              onChange={(value) => setFilters({ ...filters, documentType: value })}
              style={{ width: '100%' }}
              placeholder="文件类型"
            >
              <Option value="all">全部类型</Option>
              <Option value="BUSINESS_LICENSE">营业执照</Option>
              <Option value="PRACTICE_PERMIT">执业许可证</Option>
              <Option value="COLLECTION_PERMIT">催收许可证</Option>
              <Option value="ID_CARD">身份证明</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              value={filters.orgType}
              onChange={(value) => setFilters({ ...filters, orgType: value })}
              style={{ width: '100%' }}
              placeholder="机构类型"
            >
              <Option value="all">全部机构</Option>
              <Option value="SOURCE">案源机构</Option>
              <Option value="DISPOSAL">处置机构</Option>
            </Select>
          </Col>
          <Col span={12}>
            <Space>
              <Button icon={<SearchOutlined />} type="primary">
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadDocuments}>
                刷新
              </Button>
              <Button icon={<InfoCircleOutlined />} onClick={() => setCriteriaModalVisible(true)}>
                审核标准
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 文件列表 */}
        <Table
          columns={columns}
          dataSource={documents}
          rowKey="id"
          loading={loading}
          pagination={{
            total: documents.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>

      {/* 文件预览弹窗 */}
      <Modal
        title="文件预览"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={null}
        width={900}
      >
        {selectedDocument && (
          <Tabs defaultActiveKey="preview">
            <TabPane tab="文件预览" key="preview">
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                {selectedDocument.fileUrl.endsWith('.pdf') ? (
                  <div>
                    <FilePdfOutlined style={{ fontSize: 48, color: '#ff4d4f', marginBottom: 16 }} />
                    <div>PDF文件预览</div>
                    <Button type="link" onClick={() => handleDownload(selectedDocument)}>
                      点击下载查看
                    </Button>
                  </div>
                ) : (
                  <Image
                    src={selectedDocument.fileUrl}
                    alt={selectedDocument.documentName}
                    style={{ maxWidth: '100%', maxHeight: 500 }}
                  />
                )}
              </div>
            </TabPane>
            
            <TabPane tab="检查项目" key="checkpoints">
              <Table
                dataSource={selectedDocument.checkPoints}
                rowKey="point"
               
                pagination={false}
                columns={[
                  { 
                    title: '检查项目', 
                    dataIndex: 'point', 
                    key: 'point',
                    width: 150
                  },
                  { 
                    title: '检查结果', 
                    dataIndex: 'status', 
                    key: 'status',
                    width: 100,
                    render: (status: string) => (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {getCheckPointIcon(status)}
                        <span style={{ marginLeft: 8 }}>
                          {status === 'PASS' ? '通过' : status === 'FAIL' ? '未通过' : '警告'}
                        </span>
                      </div>
                    )
                  },
                  { 
                    title: '备注', 
                    dataIndex: 'comment', 
                    key: 'comment'
                  },
                ]}
              />
            </TabPane>
            
            <TabPane tab="版本历史" key="versions">
              <Timeline>
                {selectedDocument.versions.map((version, index) => (
                  <Timeline.Item
                    key={index}
                    color={version.status === 'APPROVED' ? 'green' : version.status === 'REJECTED' ? 'red' : 'blue'}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold' }}>版本 {version.version}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{version.comments}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        {dayjs(version.uploadTime).format('YYYY-MM-DD HH:mm:ss')}
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* 审核操作弹窗 */}
      <Modal
        title="文件审核"
        open={reviewModalVisible}
        onOk={handleReviewSubmit}
        onCancel={() => {
          setReviewModalVisible(false);
          reviewForm.resetFields();
        }}
        width={600}
      >
        <Form form={reviewForm} layout="vertical">
          <Form.Item
            label="审核结果"
            name="status"
            rules={[{ required: true, message: '请选择审核结果' }]}
          >
            <Select placeholder="请选择审核结果">
              <Option value="APPROVED">通过</Option>
              <Option value="REJECTED">拒绝</Option>
              <Option value="RESUBMITTED">要求重新提交</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="审核意见"
            name="comments"
            rules={[{ required: true, message: '请输入审核意见' }]}
          >
            <TextArea rows={4} placeholder="请输入审核意见..." />
          </Form.Item>
          
          <Form.Item
            label="拒绝原因"
            name="rejectionReason"
            dependencies={['status']}
            rules={[
              ({ getFieldValue }) => ({
                required: getFieldValue('status') === 'REJECTED',
                message: '请输入拒绝原因',
              }),
            ]}
          >
            <Select placeholder="请选择拒绝原因" allowClear>
              <Option value="文件不清晰">文件不清晰</Option>
              <Option value="证件过期">证件过期</Option>
              <Option value="信息不完整">信息不完整</Option>
              <Option value="不符合要求">不符合要求</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 审核标准弹窗 */}
      <Modal
        title="审核标准"
        open={criteriaModalVisible}
        onCancel={() => setCriteriaModalVisible(false)}
        footer={null}
        width={800}
      >
        <Tabs>
          {reviewCriteria.map(criteria => (
            <TabPane tab={criteria.documentType} key={criteria.documentType}>
              <Table
                dataSource={criteria.checkPoints}
                rowKey="id"
               
                pagination={false}
                columns={[
                  { title: '检查项目', dataIndex: 'name', key: 'name', width: 150 },
                  { title: '描述', dataIndex: 'description', key: 'description' },
                  { 
                    title: '必需项', 
                    dataIndex: 'required', 
                    key: 'required',
                    width: 80,
                    render: (required: boolean) => (
                      <Tag color={required ? 'red' : 'blue'}>
                        {required ? '必需' : '可选'}
                      </Tag>
                    )
                  },
                  { 
                    title: '权重', 
                    dataIndex: 'weight', 
                    key: 'weight',
                    width: 80,
                    render: (weight: number) => `${weight}%`
                  },
                ]}
              />
            </TabPane>
          ))}
        </Tabs>
      </Modal>
    </div>
  );
};

export default DocumentReview;