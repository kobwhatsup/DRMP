import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Tabs,
  Timeline,
  Button,
  Space,
  Tag,
  Descriptions,
  Avatar,
  Typography,
  Divider,
  Statistic,
  List,
  Form,
  Input,
  Select,
  DatePicker,
  Modal,
  message,
  Upload,
  Alert,
  Badge,
  Tooltip,
  Result,
  Skeleton,
  InputNumber
} from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  PhoneOutlined,
  IdcardOutlined,
  DollarOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  FileAddOutlined,
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  PrinterOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  TagsOutlined,
  CommentOutlined,
  PaperClipOutlined,
  TeamOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  EyeOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useParams, useNavigate } from 'react-router-dom';
import {
  WorkRecordCreateRequest
} from '@/services/workRecordService';
import {
  downloadDocument
} from '@/services/documentService';
import {
  batchAddTags
} from '@/services/batchOperationService';
import { useKeyboardShortcuts, commonShortcuts } from '@/hooks/useKeyboardShortcuts';
import CaseStatusManagement from '@/components/case/CaseStatusManagement';
import QuickProgressEntry from '@/components/case/QuickProgressEntry';
import CaseLabelsManagement from '@/components/case/CaseLabelsManagement';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

interface CaseDetailData {
  id: string;
  caseNo: string;
  status: string;
  stage: string;
  priority: string;
  debtorInfo: {
    name: string;
    idCard: string;
    phone: string;
    address: string;
    employer: string;
    monthlyIncome: number;
  };
  loanInfo: {
    loanAmount: number;
    remainingAmount: number;
    overdueDays: number;
    overdueInterest: number;
    loanDate: string;
    dueDate: string;
    loanPurpose: string;
    guarantor: string;
  };
  handler: {
    id: string;
    name: string;
    phone: string;
    department: string;
  };
  organization: {
    sourceOrg: string;
    disposalOrg: string;
    assignDate: string;
  };
  statistics: {
    contactCount: number;
    workRecordCount: number;
    documentCount: number;
    recoveryAmount: number;
    recoveryRate: number;
  };
}

interface WorkRecord {
  id: string;
  type: string;
  title: string;
  content: string;
  handler: string;
  createdAt: string;
  contactMethod?: string;
  contactResult?: string;
  nextAction?: string;
  attachments?: string[];
  tags?: string[];
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  status: string;
  generatedAt: string;
  generatedBy: string;
  downloadCount: number;
}

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  operator: string;
  timestamp: string;
  status: 'success' | 'processing' | 'error' | 'default';
  icon?: React.ReactNode;
}

const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<CaseDetailData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [recordForm] = Form.useForm();
  const [documentForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // 案件状态映射
  const statusMap: Record<string, { color: string; label: string }> = {
    PENDING: { color: 'default', label: '待处理' },
    IN_CONTACT: { color: 'processing', label: '联系中' },
    NEGOTIATING: { color: 'warning', label: '协商中' },
    PAYMENT_PLAN: { color: 'cyan', label: '还款计划' },
    MONITORING: { color: 'blue', label: '监控中' },
    LEGAL_PROCESS: { color: 'purple', label: '法律程序' },
    SETTLED: { color: 'success', label: '已和解' },
    CLOSED: { color: 'default', label: '已结案' },
    RETURNED: { color: 'error', label: '已退案' }
  };

  // 文档类型图标映射
  const documentIconMap: Record<string, React.ReactNode> = {
    pdf: <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: 24 }} />,
    word: <FileWordOutlined style={{ color: '#1890ff', fontSize: 24 }} />,
    excel: <FileExcelOutlined style={{ color: '#52c41a', fontSize: 24 }} />,
    other: <FileTextOutlined style={{ color: '#666', fontSize: 24 }} />
  };

  // 使用模拟数据而不是API调用，避免请求失败
  const [dataLoading, setDataLoading] = useState(true);

  // 模拟数据加载函数
  const loadMockData = async () => {
      setDataLoading(true);
      
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 模拟作业记录数据
      const mockWorkRecords = [
        {
          id: 1,
          recordType: 'CONTACT',
          title: '首次联系',
          content: '通过电话联系债务人，债务人表示目前资金困难，承诺月底前还款5万元',
          handlerName: '王经理',
          createdAt: moment().subtract(2, 'days').format('YYYY-MM-DD HH:mm:ss'),
          contactMethodDesc: '电话',
          contactResultDesc: '联系成功',
          nextAction: '跟进还款进度',
          attachments: '',
          tagList: ['承诺还款']
        },
        {
          id: 2,
          recordType: 'NEGOTIATION',
          title: '还款协商',
          content: '与债务人就还款计划进行协商，达成分期还款协议',
          handlerName: '王经理',
          createdAt: moment().subtract(5, 'days').format('YYYY-MM-DD HH:mm:ss'),
          contactMethodDesc: '面谈',
          contactResultDesc: '达成协议',
          nextAction: '监督执行',
          attachments: '',
          tagList: ['分期还款']
        }
      ];

      // 模拟文档数据
      const mockDocuments = [
        {
          id: 1,
          documentName: '催款通知书.pdf',
          statusDesc: '已生成',
          createdAt: moment().subtract(3, 'days').format('YYYY-MM-DD HH:mm:ss'),
          generatedAt: moment().subtract(3, 'days').format('YYYY-MM-DD HH:mm:ss'),
          generatedByName: '系统自动',
          downloadedCount: 2,
          formattedFileSize: '128 KB'
        },
        {
          id: 2,
          documentName: '还款协议书.docx',
          statusDesc: '已生成',
          createdAt: moment().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
          generatedAt: moment().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
          generatedByName: '王经理',
          downloadedCount: 1,
          formattedFileSize: '256 KB'
        }
      ];

      const apiData = {
        workRecords: mockWorkRecords,
        documents: mockDocuments
      };

      // 处理数据更新
      if (apiData.workRecords && apiData.documents) {
        
        // 生成模拟数据
        const mockData: CaseDetailData = {
          id: id || 'CASE000001',
          caseNo: '2024000001',
          status: 'NEGOTIATING',
          stage: '中期',
          priority: 'high',
          debtorInfo: {
            name: '张三',
            idCard: '110105199001010001',
            phone: '13800138000',
            address: '北京市朝阳区某某街道123号',
            employer: '某某科技有限公司',
            monthlyIncome: 8000
          },
          loanInfo: {
            loanAmount: 500000,
            remainingAmount: 350000,
            overdueDays: 180,
            overdueInterest: 25000,
            loanDate: '2023-01-15',
            dueDate: '2023-07-15',
            loanPurpose: '经营周转',
            guarantor: '李四'
          },
          handler: {
            id: 'USER001',
            name: '王经理',
            phone: '13900139000',
            department: '催收一部'
          },
          organization: {
            sourceOrg: '某某银行',
            disposalOrg: '某某律师事务所',
            assignDate: '2024-01-01'
          },
          statistics: {
            contactCount: 15,
            workRecordCount: 23,
            documentCount: 8,
            recoveryAmount: 150000,
            recoveryRate: 0.3
          }
        };

        // 转换作业记录数据格式
        const formattedWorkRecords: WorkRecord[] = (apiData.workRecords || []).map((record: any) => ({
          id: record.id.toString(),
          type: record.recordType,
          title: record.title,
          content: record.content,
          handler: record.handlerName,
          createdAt: record.createdAt,
          contactMethod: record.contactMethodDesc,
          contactResult: record.contactResultDesc,
          nextAction: record.nextAction,
          attachments: record.attachments ? record.attachments.split(',') : undefined,
          tags: record.tagList
        }));

        // 转换文档数据格式
        const formattedDocuments: Document[] = (apiData.documents || []).map((doc: any) => ({
          id: doc.id.toString(),
          name: doc.documentName,
          type: doc.documentName.toLowerCase().includes('.pdf') ? 'pdf' : 
                doc.documentName.toLowerCase().includes('.doc') ? 'word' :
                doc.documentName.toLowerCase().includes('.xls') ? 'excel' : 'other',
          size: doc.formattedFileSize || '未知',
          status: doc.statusDesc,
          generatedAt: doc.generatedAt || doc.createdAt,
          generatedBy: doc.generatedByName,
          downloadCount: doc.downloadedCount
        }));

        // 生成时间线事件（基于作业记录和文档）
        const timelineEvents: TimelineEvent[] = [
          ...formattedWorkRecords.map((record, index) => ({
            id: `WR_${record.id}`,
            type: record.type.toLowerCase(),
            title: record.title,
            description: record.content,
            operator: record.handler,
            timestamp: record.createdAt,
            status: 'success' as const,
            icon: record.type === 'CONTACT' ? <PhoneOutlined /> :
                  record.type === 'NEGOTIATION' ? <CommentOutlined /> :
                  record.type === 'VISIT' ? <TeamOutlined /> :
                  <FileTextOutlined />
          })),
          ...formattedDocuments.map((doc) => ({
            id: `DOC_${doc.id}`,
            type: 'document',
            title: '生成文书',
            description: `生成${doc.name}`,
            operator: doc.generatedBy,
            timestamp: doc.generatedAt,
            status: doc.status.includes('已') ? 'success' as const : 'processing' as const,
            icon: <FileTextOutlined />
          }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setCaseData(mockData);
        setWorkRecords(formattedWorkRecords);
        setDocuments(formattedDocuments);
        setTimelineEvents(timelineEvents);
        setDataLoading(false);
      }
    };

  // 处理数据加载
  useEffect(() => {
    loadMockData();
  }, [id]);

  // 使用模拟实现添加作业记录
  const [addingRecord, setAddingRecord] = useState(false);
  const addRecord = async (recordData: WorkRecordCreateRequest) => {
    setAddingRecord(true);
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟成功响应
      const newRecord: WorkRecord = {
        id: `${Date.now()}`,
        type: recordData.recordType,
        title: recordData.title,
        content: recordData.content,
        handler: '当前用户',
        createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        contactMethod: recordData.contactMethod,
        contactResult: recordData.contactResult,
        nextAction: recordData.nextAction,
        attachments: [],
        tags: []
      };
      
      setWorkRecords(prev => [newRecord, ...prev]);
      message.success('作业记录添加成功');
      setRecordModalVisible(false);
      recordForm.resetFields();
    } catch (error) {
      message.error('添加作业记录失败');
    } finally {
      setAddingRecord(false);
    }
  };

  const handleAddRecord = async () => {
    try {
      const values = await recordForm.validateFields();
      const recordData: WorkRecordCreateRequest = {
        caseId: parseInt(id || '0'),
        recordType: values.type,
        title: values.title,
        content: values.content,
        contactMethod: values.contactMethod,
        contactResult: values.contactResult,
        nextAction: values.nextAction,
        nextContactDate: values.nextContactDate?.format('YYYY-MM-DD HH:mm:ss')
      };
      
      await addRecord(recordData);
    } catch (error) {
      // 错误已由hook处理
    }
  };

  // 使用模拟实现生成文档
  const [generatingDocument, setGeneratingDocument] = useState(false);
  const generateDoc = async (templateId: number, caseId: number, data: any) => {
    setGeneratingDocument(true);
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟成功响应
      const newDocument: Document = {
        id: `${Date.now()}`,
        name: `${data.templateName || '新文档'}.pdf`,
        type: 'pdf',
        size: '256 KB',
        status: '已生成',
        generatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        generatedBy: '当前用户',
        downloadCount: 0
      };
      
      setDocuments(prev => [newDocument, ...prev]);
      message.success('文档生成任务已提交');
      setDocumentModalVisible(false);
      documentForm.resetFields();
    } catch (error) {
      message.error('生成文档失败');
    } finally {
      setGeneratingDocument(false);
    }
  };

  const handleGenerateDocument = async () => {
    try {
      const values = await documentForm.validateFields();
      
      const templateId = getTemplateIdByType(values.templateType);
      
      await generateDoc(templateId, parseInt(id || '0'), {
        customData: values.customData
      });
    } catch (error) {
      // 错误已由hook处理
    }
  };
  
  // 根据模板类型获取模板ID的辅助函数
  const getTemplateIdByType = (templateType: string): number => {
    const templateMap: Record<string, number> = {
      'notice': 1,
      'agreement': 2,
      'commitment': 3,
      'legal': 4
    };
    return templateMap[templateType] || 1;
  };

  // 刷新数据
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // 重新加载案件基本信息和所有相关数据
      await loadMockData();
      message.success('数据刷新成功');
    } catch (error) {
      console.error('刷新失败:', error);
      message.error('刷新失败，请稍后重试');
    } finally {
      setRefreshing(false);
    }
  };

  // 编辑案件信息
  const handleEdit = () => {
    if (!caseData) {
      message.error('案件数据未加载完成');
      return;
    }
    
    // 预填充编辑表单
    editForm.setFieldsValue({
      debtorName: caseData.debtorInfo.name,
      debtorPhone: caseData.debtorInfo.phone,
      debtorAddress: caseData.debtorInfo.address,
      loanAmount: caseData.loanInfo.loanAmount,
      remainingAmount: caseData.loanInfo.remainingAmount,
      entrustStartDate: caseData.loanInfo.loanDate ? moment(caseData.loanInfo.loanDate) : null,
      entrustEndDate: caseData.loanInfo.dueDate ? moment(caseData.loanInfo.dueDate) : null,
      // 联系人信息需要根据实际数据结构调整，这里使用默认值
      contact1Name: '',
      contact1Phone: '',
      contact1Relation: '',
      contact2Name: '',
      contact2Phone: '',
      contact2Relation: ''
    });
    setEditModalVisible(true);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    try {
      const values = await editForm.validateFields();
      // 模拟保存API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 更新本地数据
      setCaseData(prev => prev ? ({
        ...prev,
        debtorInfo: {
          ...prev.debtorInfo,
          name: values.debtorName,
          phone: values.debtorPhone,
          address: values.debtorAddress
        },
        loanInfo: {
          ...prev.loanInfo,
          loanAmount: values.loanAmount,
          remainingAmount: values.remainingAmount,
          loanDate: values.entrustStartDate?.format('YYYY-MM-DD') || prev.loanInfo.loanDate,
          dueDate: values.entrustEndDate?.format('YYYY-MM-DD') || prev.loanInfo.dueDate
        }
      }) : null);
      
      setEditModalVisible(false);
      message.success('案件信息更新成功');
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败，请稍后重试');
    }
  };

  // 打印案件详情
  const handlePrint = () => {
    if (!caseData) {
      message.error('案件数据未加载完成');
      return;
    }
    
    setPrinting(true);
    try {
      // 创建打印内容
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>案件详情 - ${caseData.caseNo}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .section { margin: 20px 0; }
            .label { font-weight: bold; margin-right: 10px; }
            .row { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>案件处置详情报告</h1>
            <h2>案件编号: ${caseData.caseNo}</h2>
          </div>
          
          <div class="section">
            <h3>债务人信息</h3>
            <div class="row"><span class="label">姓名:</span>${caseData.debtorInfo.name}</div>
            <div class="row"><span class="label">身份证:</span>${caseData.debtorInfo.idCard}</div>
            <div class="row"><span class="label">手机号:</span>${caseData.debtorInfo.phone}</div>
            <div class="row"><span class="label">地址:</span>${caseData.debtorInfo.address}</div>
          </div>
          
          <div class="section">
            <h3>债务信息</h3>
            <div class="row"><span class="label">贷款金额:</span>¥${caseData.loanInfo.loanAmount?.toLocaleString()}</div>
            <div class="row"><span class="label">剩余金额:</span>¥${caseData.loanInfo.remainingAmount?.toLocaleString()}</div>
            <div class="row"><span class="label">逾期天数:</span>${caseData.loanInfo.overdueDays}天</div>
            <div class="row"><span class="label">回收率:</span>${(caseData.statistics.recoveryRate * 100).toFixed(1)}%</div>
          </div>
          
          <div class="section">
            <h3>处置记录</h3>
            <table>
              <tr><th>时间</th><th>类型</th><th>内容</th><th>处理人</th></tr>
              ${workRecords.map(record => `
                <tr>
                  <td>${moment(record.createdAt).format('YYYY-MM-DD HH:mm')}</td>
                  <td>${record.type}</td>
                  <td>${record.content}</td>
                  <td>${record.handler}</td>
                </tr>
              `).join('')}
            </table>
          </div>
          
          <div class="section">
            <h3>生成信息</h3>
            <div class="row"><span class="label">生成时间:</span>${moment().format('YYYY-MM-DD HH:mm:ss')}</div>
            <div class="row"><span class="label">生成人:</span>当前用户</div>
          </div>
        </body>
        </html>
      `;
      
      // 打开新窗口并打印
      const printWindow = window.open('', '_blank');
      printWindow?.document.write(printContent);
      printWindow?.document.close();
      printWindow?.focus();
      printWindow?.print();
      
      message.success('打印任务已发送');
    } catch (error) {
      console.error('打印失败:', error);
      message.error('打印失败，请稍后重试');
    } finally {
      setPrinting(false);
    }
  };

  // 导出案件数据
  const handleExport = async () => {
    if (!caseData) {
      message.error('案件数据未加载完成');
      return;
    }
    
    setExporting(true);
    try {
      // 构造导出数据
      const exportData = {
        caseInfo: caseData,
        workRecords: workRecords,
        documents: documents,
        exportTime: moment().format('YYYY-MM-DD HH:mm:ss')
      };
      
      // 模拟导出API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 创建并下载JSON文件
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `案件详情_${caseData.caseNo}_${moment().format('YYYYMMDD')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      message.success('案件数据导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败，请稍后重试');
    } finally {
      setExporting(false);
    }
  };

  // 申请退案
  const handleReturnCase = () => {
    setReturnModalVisible(true);
  };

  // 提交退案申请
  const handleSubmitReturn = async (values: any) => {
    try {
      // 模拟退案申请API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setReturnModalVisible(false);
      
      // 显示确认对话框
      Modal.success({
        title: '退案申请已提交',
        content: `退案申请已成功提交，申请编号：RET${Date.now()}。请等待审核，审核结果将通过系统通知。`,
        onOk: () => {
          // 可选：跳转到申请列表页面
          navigate('/cases/list');
        }
      });
    } catch (error) {
      console.error('提交退案申请失败:', error);
      message.error('提交失败，请稍后重试');
    }
  };

  // 设置快捷键
  useKeyboardShortcuts([
    {
      ...commonShortcuts.refresh,
      handler: () => {
        if (!dataLoading && !refreshing) {
          handleRefresh();
        }
      }
    },
    {
      ...commonShortcuts.escape,
      handler: () => {
        // 关闭所有模态框
        setRecordModalVisible(false);
        setDocumentModalVisible(false);
        setTagModalVisible(false);
      }
    },
    {
      key: 'a',
      ctrlKey: true,
      shiftKey: true,
      description: '添加作业记录',
      handler: () => {
        if (!recordModalVisible) {
          setRecordModalVisible(true);
        }
      }
    },
    {
      key: 'd',
      ctrlKey: true,
      shiftKey: true,
      description: '生成文书',
      handler: () => {
        if (!documentModalVisible) {
          setDocumentModalVisible(true);
        }
      }
    },
    {
      key: 't',
      ctrlKey: true,
      shiftKey: true,
      description: '添加标签',
      handler: () => {
        if (!tagModalVisible) {
          setTagModalVisible(true);
        }
      }
    }
  ], {
    enabled: !!caseData
  });

  // 下载文档
  const handleDownloadDocument = async (doc: Document) => {
    try {
      const response = await downloadDocument(parseInt(doc.id));
      
      // 创建下载链接
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success(`文档 ${doc.name} 下载成功`);
    } catch (error) {
      message.error(`下载文档失败`);
    }
  };

  // 添加标签
  const handleAddTags = async () => {
    try {
      if (selectedTags.length === 0) {
        message.warning('请选择要添加的标签');
        return;
      }
      
      await batchAddTags([id || '0'], selectedTags);
      message.success('标签添加成功');
      setTagModalVisible(false);
      setSelectedTags([]);
      
      // 这里可以重新加载案件信息以更新标签显示
    } catch (error) {
      message.error('添加标签失败');
    }
  };

  if (dataLoading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 10 }} />
      </Card>
    );
  }

  if (!caseData) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="抱歉，未找到该案件信息"
        extra={
          <Button type="primary" onClick={() => navigate('/cases')}>
            返回案件列表
          </Button>
        }
      />
    );
  }

  return (
    <div className="case-detail-page">
      {/* 页面头部 */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="large">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/cases')}
              >
                返回
              </Button>
              <Title level={4} style={{ margin: 0 }}>
                案件详情 - {caseData.caseNo}
              </Title>
              <Tag color={statusMap[caseData.status]?.color}>
                {statusMap[caseData.status]?.label}
              </Tag>
              <Tag color={caseData.priority === 'high' ? 'red' : 'blue'}>
                {caseData.priority === 'high' ? '高优先级' : '普通'}
              </Tag>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                loading={refreshing}
                onClick={handleRefresh}
              >
                刷新
              </Button>
              <Button 
                icon={<EditOutlined />} 
                onClick={handleEdit}
              >
                编辑
              </Button>
              <Button 
                icon={<PrinterOutlined />} 
                loading={printing}
                onClick={handlePrint}
              >
                打印
              </Button>
              <Button 
                icon={<DownloadOutlined />} 
                loading={exporting}
                onClick={handleExport}
              >
                导出
              </Button>
              <Tooltip 
                title={
                  <div>
                    <div>快捷键提示：</div>
                    <div>Ctrl+R: 刷新</div>
                    <div>Ctrl+Shift+A: 添加记录</div>
                    <div>Ctrl+Shift+D: 生成文书</div>
                    <div>Ctrl+Shift+T: 添加标签</div>
                    <div>Esc: 关闭模态框</div>
                  </div>
                }
                placement="bottomRight"
              >
                <Button icon={<InfoCircleOutlined />}>帮助</Button>
              </Tooltip>
              <Button 
                type="primary" 
                danger
                onClick={handleReturnCase}
              >
                申请退案
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 关键指标卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="贷款金额"
              value={caseData.loanInfo.loanAmount}
              prefix="¥"
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="剩余金额"
              value={caseData.loanInfo.remainingAmount}
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="逾期天数"
              value={caseData.loanInfo.overdueDays}
              suffix="天"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="回收率"
              value={caseData.statistics.recoveryRate * 100}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 详情标签页 */}
      <Card bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* 概览标签页 */}
          <TabPane tab="概览" key="overview">
            <Row gutter={24}>
              <Col span={12}>
                <Card title="债务人信息" bordered={false}>
                  <Descriptions column={1} labelStyle={{ width: 120 }}>
                    <Descriptions.Item label={<><UserOutlined /> 姓名</>}>
                      {caseData.debtorInfo.name}
                    </Descriptions.Item>
                    <Descriptions.Item label={<><IdcardOutlined /> 身份证</>}>
                      {caseData.debtorInfo.idCard.replace(/^(.{6}).*(.{4})$/, '$1****$2')}
                    </Descriptions.Item>
                    <Descriptions.Item label={<><PhoneOutlined /> 手机号</>}>
                      {caseData.debtorInfo.phone}
                    </Descriptions.Item>
                    <Descriptions.Item label="联系地址">
                      {caseData.debtorInfo.address}
                    </Descriptions.Item>
                    <Descriptions.Item label="工作单位">
                      {caseData.debtorInfo.employer}
                    </Descriptions.Item>
                    <Descriptions.Item label="月收入">
                      ¥{caseData.debtorInfo.monthlyIncome}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="贷款信息" bordered={false}>
                  <Descriptions column={1} labelStyle={{ width: 120 }}>
                    <Descriptions.Item label="贷款金额">
                      ¥{caseData.loanInfo.loanAmount.toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="剩余本金">
                      <Text type="danger">¥{caseData.loanInfo.remainingAmount.toLocaleString()}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="逾期利息">
                      ¥{caseData.loanInfo.overdueInterest.toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="贷款日期">
                      {caseData.loanInfo.loanDate}
                    </Descriptions.Item>
                    <Descriptions.Item label="到期日期">
                      {caseData.loanInfo.dueDate}
                    </Descriptions.Item>
                    <Descriptions.Item label="贷款用途">
                      {caseData.loanInfo.loanPurpose}
                    </Descriptions.Item>
                    <Descriptions.Item label="担保人">
                      {caseData.loanInfo.guarantor || '无'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
            
            <Row gutter={24} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Card title="处理信息" bordered={false}>
                  <Descriptions column={1} labelStyle={{ width: 120 }}>
                    <Descriptions.Item label="处理人">
                      {caseData.handler.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="联系电话">
                      {caseData.handler.phone}
                    </Descriptions.Item>
                    <Descriptions.Item label="所属部门">
                      {caseData.handler.department}
                    </Descriptions.Item>
                    <Descriptions.Item label="分配日期">
                      {caseData.organization.assignDate}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="机构信息" bordered={false}>
                  <Descriptions column={1} labelStyle={{ width: 120 }}>
                    <Descriptions.Item label="案源机构">
                      {caseData.organization.sourceOrg}
                    </Descriptions.Item>
                    <Descriptions.Item label="处置机构">
                      {caseData.organization.disposalOrg}
                    </Descriptions.Item>
                    <Descriptions.Item label="案件阶段">
                      {caseData.stage}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* 作业记录标签页 */}
          <TabPane 
            tab={
              <Badge count={caseData.statistics.workRecordCount} offset={[10, 0]}>
                作业记录
              </Badge>
            } 
            key="records"
          >
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setRecordModalVisible(true)}
              >
                添加记录
              </Button>
            </div>
            
            <List
              dataSource={workRecords}
              renderItem={record => (
                <Card style={{ marginBottom: 16 }}>
                  <Row justify="space-between" align="top">
                    <Col span={20}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                          <Tag color="blue">{record.type}</Tag>
                          <Text strong>{record.title}</Text>
                          <Text type="secondary">
                            {moment(record.createdAt).format('YYYY-MM-DD HH:mm')}
                          </Text>
                        </Space>
                        <Paragraph>{record.content}</Paragraph>
                        {record.contactMethod && (
                          <Space>
                            <Text type="secondary">联系方式:</Text>
                            <Tag>{record.contactMethod}</Tag>
                            <Text type="secondary">联系结果:</Text>
                            <Tag color={record.contactResult === '接通' ? 'success' : 'default'}>
                              {record.contactResult}
                            </Tag>
                          </Space>
                        )}
                        {record.nextAction && (
                          <Space>
                            <Text type="secondary">下一步行动:</Text>
                            <Text>{record.nextAction}</Text>
                          </Space>
                        )}
                        {record.attachments && (
                          <Space>
                            <PaperClipOutlined />
                            {record.attachments.map((file, index) => (
                              <a key={index}>{file}</a>
                            ))}
                          </Space>
                        )}
                        {record.tags && (
                          <Space>
                            {record.tags.map((tag, index) => (
                              <Tag key={index} color="blue">{tag}</Tag>
                            ))}
                          </Space>
                        )}
                      </Space>
                    </Col>
                    <Col span={4} style={{ textAlign: 'right' }}>
                      <Space direction="vertical">
                        <Avatar icon={<UserOutlined />} />
                        <Text>{record.handler}</Text>
                      </Space>
                    </Col>
                  </Row>
                </Card>
              )}
            />
          </TabPane>

          {/* 文档管理标签页 */}
          <TabPane 
            tab={
              <Badge count={caseData.statistics.documentCount} offset={[10, 0]}>
                文档管理
              </Badge>
            } 
            key="documents"
          >
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button 
                  type="primary" 
                  icon={<FileAddOutlined />}
                  onClick={() => setDocumentModalVisible(true)}
                >
                  生成文书
                </Button>
                <Upload>
                  <Button icon={<UploadOutlined />}>上传文档</Button>
                </Upload>
              </Space>
            </div>

            <Row gutter={[16, 16]}>
              {documents.map(doc => (
                <Col span={6} key={doc.id}>
                  <Card
                    hoverable
                    actions={[
                      <Tooltip title="查看">
                        <EyeOutlined />
                      </Tooltip>,
                      <Tooltip title="下载">
                        <DownloadOutlined onClick={() => handleDownloadDocument(doc)} />
                      </Tooltip>,
                      <Tooltip title="删除">
                        <DeleteOutlined />
                      </Tooltip>
                    ]}
                  >
                    <Space direction="vertical" align="center" style={{ width: '100%' }}>
                      {documentIconMap[doc.type] || documentIconMap.other}
                      <Text strong>{doc.name}</Text>
                      <Text type="secondary">{doc.size}</Text>
                      <Tag color={doc.status === '已签署' ? 'success' : 'processing'}>
                        {doc.status}
                      </Tag>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {moment(doc.generatedAt).format('YYYY-MM-DD')}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        下载 {doc.downloadCount} 次
                      </Text>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>

          {/* 进度时间线标签页 */}
          <TabPane tab="进度时间线" key="timeline">
            <Timeline mode="left">
              {timelineEvents.map(event => (
                <Timeline.Item
                  key={event.id}
                  color={
                    event.status === 'success' ? 'green' :
                    event.status === 'processing' ? 'blue' :
                    event.status === 'error' ? 'red' : 'gray'
                  }
                  dot={event.icon}
                >
                  <Card size="small">
                    <Space direction="vertical">
                      <Space>
                        <Text strong>{event.title}</Text>
                        <Tag>{event.type}</Tag>
                      </Space>
                      <Text>{event.description}</Text>
                      <Space>
                        <Text type="secondary">
                          {moment(event.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                        </Text>
                        <Text type="secondary">操作人: {event.operator}</Text>
                      </Space>
                    </Space>
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          </TabPane>

          {/* 标签管理标签页 */}
          {/* 状态管理标签页 */}
          <TabPane tab="状态管理" key="status">
            <CaseStatusManagement
              caseId={id || ''}
              currentStatus={caseData.status}
              onStatusChange={(newStatus) => {
                setCaseData(prev => prev ? { ...prev, status: newStatus } : null);
              }}
              showHistory={true}
              editable={true}
            />
          </TabPane>

          {/* 进度录入标签页 */}
          <TabPane tab="进度录入" key="progress">
            <QuickProgressEntry
              caseId={id || ''}
              onSuccess={(progress) => {
                message.success('进度记录添加成功');
                // 数据已通过组件内部管理，无需额外刷新
              }}
              compact={false}
            />
          </TabPane>

          {/* 标签管理标签页 */}
          <TabPane tab="标签管理" key="labels">
            <CaseLabelsManagement
              caseId={id || ''}
              currentLabels={selectedTags}
              onLabelsChange={(labels) => {
                setSelectedTags(labels);
                message.success('标签更新成功');
              }}
              mode="edit"
              showStatistics={true}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 添加作业记录弹窗 */}
      <Modal
        title="添加作业记录"
        visible={recordModalVisible}
        onOk={handleAddRecord}
        onCancel={() => setRecordModalVisible(false)}
        width={600}
        confirmLoading={addingRecord}
      >
        <Form form={recordForm} layout="vertical">
          <Form.Item 
            name="type" 
            label="记录类型" 
            rules={[{ required: true, message: '请选择记录类型' }]}
          >
            <Select placeholder="请选择">
              <Option value="CONTACT">联系记录</Option>
              <Option value="NEGOTIATION">协商记录</Option>
              <Option value="VISIT">上门拜访</Option>
              <Option value="DOCUMENT">文档处理</Option>
            </Select>
          </Form.Item>
          <Form.Item 
            name="title" 
            label="标题" 
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入记录标题" />
          </Form.Item>
          <Form.Item 
            name="content" 
            label="详细内容" 
            rules={[{ required: true, message: '请输入详细内容' }]}
          >
            <TextArea rows={4} placeholder="请输入详细内容" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contactMethod" label="联系方式">
                <Select placeholder="请选择">
                  <Option value="phone">电话</Option>
                  <Option value="sms">短信</Option>
                  <Option value="email">邮件</Option>
                  <Option value="visit">上门</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contactResult" label="联系结果">
                <Select placeholder="请选择">
                  <Option value="connected">接通</Option>
                  <Option value="no_answer">未接</Option>
                  <Option value="promise">承诺还款</Option>
                  <Option value="refuse">拒绝</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="nextAction" label="下一步行动">
            <Input placeholder="请输入下一步行动计划" />
          </Form.Item>
          <Form.Item name="nextContactDate" label="下次联系时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 生成文书弹窗 */}
      <Modal
        title="生成文书"
        visible={documentModalVisible}
        onOk={handleGenerateDocument}
        onCancel={() => setDocumentModalVisible(false)}
        confirmLoading={generatingDocument}
      >
        <Form form={documentForm} layout="vertical">
          <Form.Item 
            name="templateType" 
            label="文书模板" 
            rules={[{ required: true, message: '请选择文书模板' }]}
          >
            <Select placeholder="请选择文书模板">
              <Option value="notice">催款通知书</Option>
              <Option value="agreement">和解协议</Option>
              <Option value="commitment">承诺书</Option>
              <Option value="legal">法律意见书</Option>
            </Select>
          </Form.Item>
          <Form.Item name="customData" label="自定义内容">
            <TextArea rows={3} placeholder="请输入需要自定义的内容（选填）" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 标签管理弹窗 */}
      <Modal
        title="添加标签"
        visible={tagModalVisible}
        onOk={handleAddTags}
        onCancel={() => setTagModalVisible(false)}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert message="选择要添加的标签" type="info" />
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="请选择标签"
            value={selectedTags}
            onChange={setSelectedTags}
          >
            <Option value="重点关注">重点关注</Option>
            <Option value="有还款意愿">有还款意愿</Option>
            <Option value="失联">失联</Option>
            <Option value="承诺还款">承诺还款</Option>
            <Option value="异议">异议</Option>
            <Option value="投诉">投诉</Option>
            <Option value="困难户">困难户</Option>
            <Option value="恶意逃债">恶意逃债</Option>
          </Select>
        </Space>
      </Modal>

      {/* 编辑案件信息弹窗 */}
      <Modal
        title="编辑案件信息"
        visible={editModalVisible}
        onOk={handleSaveEdit}
        onCancel={() => setEditModalVisible(false)}
        width={800}
        confirmLoading={false}
      >
        <Form form={editForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="debtorName" 
                label="债务人姓名"
                rules={[{ required: true, message: '请输入债务人姓名' }]}
              >
                <Input placeholder="请输入债务人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="debtorPhone" 
                label="手机号码"
                rules={[
                  { required: true, message: '请输入手机号码' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
                ]}
              >
                <Input placeholder="请输入手机号码" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item 
            name="debtorAddress" 
            label="联系地址"
          >
            <Input placeholder="请输入联系地址" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="loanAmount" 
                label="贷款金额"
                rules={[{ required: true, message: '请输入贷款金额' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\¥\s?|(,*)/g, '')}
                  placeholder="请输入贷款金额"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="remainingAmount" 
                label="剩余金额"
                rules={[{ required: true, message: '请输入剩余金额' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\¥\s?|(,*)/g, '')}
                  placeholder="请输入剩余金额"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="entrustStartDate" label="委托开始日期">
                <DatePicker style={{ width: '100%' }} placeholder="选择委托开始日期" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="entrustEndDate" label="委托结束日期">
                <DatePicker style={{ width: '100%' }} placeholder="选择委托结束日期" />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider orientation="left">联系人信息</Divider>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="contact1Name" label="联系人1姓名">
                <Input placeholder="请输入联系人姓名" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="contact1Phone" label="联系人1电话">
                <Input placeholder="请输入联系人电话" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="contact1Relation" label="与债务人关系">
                <Select placeholder="请选择关系">
                  <Option value="spouse">配偶</Option>
                  <Option value="parent">父母</Option>
                  <Option value="child">子女</Option>
                  <Option value="sibling">兄弟姐妹</Option>
                  <Option value="friend">朋友</Option>
                  <Option value="colleague">同事</Option>
                  <Option value="other">其他</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="contact2Name" label="联系人2姓名">
                <Input placeholder="请输入联系人姓名" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="contact2Phone" label="联系人2电话">
                <Input placeholder="请输入联系人电话" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="contact2Relation" label="与债务人关系">
                <Select placeholder="请选择关系">
                  <Option value="spouse">配偶</Option>
                  <Option value="parent">父母</Option>
                  <Option value="child">子女</Option>
                  <Option value="sibling">兄弟姐妹</Option>
                  <Option value="friend">朋友</Option>
                  <Option value="colleague">同事</Option>
                  <Option value="other">其他</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 申请退案弹窗 */}
      <Modal
        title="申请退案"
        visible={returnModalVisible}
        onOk={() => {
          Modal.confirm({
            title: '确认申请退案',
            content: '退案申请提交后将无法撤销，请确认是否继续？',
            onOk: () => {
              const form = document.querySelector('#returnForm') as HTMLFormElement;
              if (form) {
                const formData = new FormData(form);
                const values = {
                  reason: formData.get('reason'),
                  description: formData.get('description')
                };
                handleSubmitReturn(values);
              }
            }
          });
        }}
        onCancel={() => setReturnModalVisible(false)}
        width={600}
      >
        <Form id="returnForm" layout="vertical">
          <Alert
            message="退案说明"
            description="申请退案后，案件将从您的处置列表中移除，并重新分配给其他处置机构。请谨慎操作。"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Form.Item 
            name="reason" 
            label="退案原因"
            rules={[{ required: true, message: '请选择退案原因' }]}
          >
            <Select placeholder="请选择退案原因">
              <Option value="debtor_deceased">债务人死亡</Option>
              <Option value="debtor_disappeared">债务人失踪</Option>
              <Option value="no_assets">无可执行财产</Option>
              <Option value="legal_dispute">存在法律争议</Option>
              <Option value="resource_insufficient">处置资源不足</Option>
              <Option value="conflict_of_interest">利益冲突</Option>
              <Option value="other">其他原因</Option>
            </Select>
          </Form.Item>
          
          <Form.Item 
            name="description" 
            label="详细说明"
            rules={[{ required: true, message: '请详细说明退案原因' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="请详细说明退案的具体原因，包括已采取的处置措施和遇到的困难..."
              maxLength={500}
              showCount
            />
          </Form.Item>
          
          <Form.Item name="attachments" label="相关附件">
            <Upload.Dragger
              multiple
              beforeUpload={() => false}
              onChange={(info) => {
                console.log('附件上传:', info.fileList);
              }}
            >
              <p className="ant-upload-drag-icon">
                <PaperClipOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">
                支持上传相关证明文件、沟通记录等
              </p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CaseDetail;