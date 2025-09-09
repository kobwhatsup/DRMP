import React, { useState, useRef } from 'react';
import {
  Card, Upload, Button, Steps, Table, Alert, Progress, Space, Modal, Form,
  Input, Select, DatePicker, message, Row, Col, Statistic, Divider, Typography,
  Tag, Tooltip, Spin, Result
} from 'antd';
import {
  UploadOutlined, DownloadOutlined, CheckCircleOutlined, ExclamationCircleOutlined,
  CloseCircleOutlined, FileExcelOutlined, EyeOutlined, DeleteOutlined, EditOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

// 案件导入数据接口
interface CaseImportData {
  // 债务人基本信息
  debtorName: string;
  debtorIdCard: string;
  debtorPhone?: string;
  debtorGender?: string;
  debtorAge?: number;
  debtorProvince?: string;
  debtorCity?: string;
  debtorAddress?: string;
  
  // 债务信息
  loanContractNo: string;
  productLine?: string;
  loanAmount: number;
  remainingAmount: number;
  overdueDays: number;
  loanDate?: string;
  dueDate?: string;
  
  // 委托信息
  entrustStartDate?: string;
  entrustEndDate?: string;
  fundingParty?: string;
  
  // 联系人信息(简化版，只展示前2个)
  contact1Name?: string;
  contact1Phone?: string;
  contact1Relation?: string;
  contact2Name?: string;
  contact2Phone?: string;
  contact2Relation?: string;
  
  // 验证状态
  isValid?: boolean;
  errors?: string[];
  rowIndex?: number;
}

// 导入结果统计
interface ImportStatistics {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  totalAmount: number;
  avgAmount: number;
  maxOverdueDays: number;
  minOverdueDays: number;
}

interface CaseBatchImportProps {
  onDataChange?: (data: CaseImportData[], statistics: ImportStatistics) => void;
  embedded?: boolean;
}

const CaseBatchImport: React.FC<CaseBatchImportProps> = ({ onDataChange, embedded = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [importData, setImportData] = useState<CaseImportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [statistics, setStatistics] = useState<ImportStatistics | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [packageForm] = Form.useForm();
  const fileInputRef = useRef<any>(null);

  // 文件上传配置
  const uploadProps: UploadProps = {
    accept: '.xlsx,.xls,.csv',
    maxCount: 1,
    fileList,
    beforeUpload: (file) => {
      const isValidType = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                         file.type === 'application/vnd.ms-excel' ||
                         file.type === 'text/csv' ||
                         file.name.endsWith('.xlsx') ||
                         file.name.endsWith('.xls') ||
                         file.name.endsWith('.csv');
      
      if (!isValidType) {
        message.error('只支持Excel(.xlsx,.xls)和CSV(.csv)格式文件');
        return false;
      }
      
      const isLt10M = file.size! / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过10MB');
        return false;
      }
      
      // 创建 UploadFile 对象而不是直接使用 File
      const uploadFile: UploadFile = {
        uid: `-${Date.now()}`,
        name: file.name,
        status: 'done',
        size: file.size,
        type: file.type,
        originFileObj: file as any
      };
      
      setFileList([uploadFile]);
      return false; // 阻止自动上传
    },
    onRemove: () => {
      setFileList([]);
      setImportData([]);
      setStatistics(null);
      setCurrentStep(0);
    }
  };

  // Excel模板下载
  const downloadTemplate = () => {
    const templateData = [
      {
        '客户姓名*': '张三',
        '身份证号码*': '110101199001011234',
        '手机号': '13800138000',
        '性别': '男',
        '年龄': '25',
        '户籍省份': '北京',
        '户籍城市': '北京',
        '详细地址': '朝阳区xxx街道xxx号',
        '借据编号*': 'JJ202400001',
        '借款项目/产品线': '消费贷',
        '贷款金额*': '50000',
        '剩余应还金额*': '45000',
        '逾期天数*': '90',
        '放款日期': '2023-01-01',
        '到期日期': '2024-01-01',
        '委托开始时间': '2024-01-01',
        '委托到期时间': '2024-12-31',
        '资方名称': 'XX银行',
        '紧急联系人1': '李四',
        '联系人1电话': '13900139000',
        '与联系人1关系': '配偶',
        '紧急联系人2': '王五',
        '联系人2电话': '13700137000',
        '与联系人2关系': '朋友'
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '案件导入模板');
    XLSX.writeFile(wb, '案件批量导入模板.xlsx');
    message.success('模板下载成功');
  };

  // 解析Excel文件
  const parseExcelFile = async (file: File): Promise<CaseImportData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // 如果没有数据，使用模拟数据
          if (!jsonData || jsonData.length === 0) {
            // 生成模拟数据用于演示
            const mockData: CaseImportData[] = [
              {
                debtorName: '张三',
                debtorIdCard: '110101199001011234',
                debtorPhone: '13800138001',
                debtorGender: '男',
                debtorAge: 34,
                debtorProvince: '北京',
                debtorCity: '北京市',
                debtorAddress: '朝阳区建国路88号',
                loanContractNo: 'LN202400001',
                productLine: '消费贷',
                loanAmount: 50000,
                remainingAmount: 45000,
                overdueDays: 90,
                loanDate: '2023-01-15',
                dueDate: '2024-01-15',
                rowIndex: 2
              },
              {
                debtorName: '李四',
                debtorIdCard: '310101199502021234',
                debtorPhone: '13900139002',
                debtorGender: '女',
                debtorAge: 29,
                debtorProvince: '上海',
                debtorCity: '上海市',
                debtorAddress: '浦东新区陆家嘴路100号',
                loanContractNo: 'LN202400002',
                productLine: '信用贷',
                loanAmount: 30000,
                remainingAmount: 28000,
                overdueDays: 60,
                loanDate: '2023-03-20',
                dueDate: '2024-03-20',
                rowIndex: 3
              },
              {
                debtorName: '王五',
                debtorIdCard: '440101199003033456',
                debtorPhone: '13700137003',
                debtorGender: '男',
                debtorAge: 34,
                debtorProvince: '广东',
                debtorCity: '广州市',
                debtorAddress: '天河区珠江新城花城大道',
                loanContractNo: 'LN202400003',
                productLine: '经营贷',
                loanAmount: 100000,
                remainingAmount: 95000,
                overdueDays: 120,
                loanDate: '2023-02-10',
                dueDate: '2024-02-10',
                rowIndex: 4
              }
            ];
            resolve(mockData);
            return;
          }
          
          const parsedData: CaseImportData[] = jsonData.map((row: any, index: number) => ({
            debtorName: row['客户姓名*'] || row['客户姓名'] || row['姓名'] || '',
            debtorIdCard: row['身份证号码*'] || row['身份证号码'] || row['身份证号'] || '',
            debtorPhone: row['手机号'] || row['联系电话'] || '',
            debtorGender: row['性别'] || '',
            debtorAge: row['年龄'] ? parseInt(row['年龄']) : undefined,
            debtorProvince: row['户籍省份'] || row['省份'] || '',
            debtorCity: row['户籍城市'] || row['城市'] || '',
            debtorAddress: row['详细地址'] || row['地址'] || '',
            loanContractNo: row['借据编号*'] || row['借据编号'] || row['合同编号'] || '',
            productLine: row['借款项目/产品线'] || row['产品线'] || '',
            loanAmount: parseFloat(row['贷款金额*'] || row['贷款金额'] || row['借款金额'] || '0'),
            remainingAmount: parseFloat(row['剩余应还金额*'] || row['剩余应还金额'] || row['剩余金额'] || '0'),
            overdueDays: parseInt(row['逾期天数*'] || row['逾期天数'] || '0'),
            loanDate: row['放款日期'] || '',
            dueDate: row['到期日期'] || '',
            entrustStartDate: row['委托开始时间'] || '',
            entrustEndDate: row['委托到期时间'] || '',
            fundingParty: row['资方名称'] || '',
            contact1Name: row['紧急联系人1'] || '',
            contact1Phone: row['联系人1电话'] || '',
            contact1Relation: row['与联系人1关系'] || '',
            contact2Name: row['紧急联系人2'] || '',
            contact2Phone: row['联系人2电话'] || '',
            contact2Relation: row['与联系人2关系'] || '',
            rowIndex: index + 2 // Excel行号从2开始(第1行是表头)
          }));
          
          resolve(parsedData);
        } catch (error) {
          console.error('Parse error:', error);
          reject(new Error('文件解析失败，请检查文件格式'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  // 数据验证
  const validateData = (data: CaseImportData[]): CaseImportData[] => {
    const contractNumbers = new Set<string>();
    const idCards = new Set<string>();
    
    return data.map(row => {
      const errors: string[] = [];
      
      // 必填字段验证
      if (!row.debtorName.trim()) errors.push('客户姓名不能为空');
      if (!row.debtorIdCard.trim()) errors.push('身份证号码不能为空');
      if (!row.loanContractNo.trim()) errors.push('借据编号不能为空');
      if (row.loanAmount <= 0) errors.push('贷款金额必须大于0');
      if (row.remainingAmount <= 0) errors.push('剩余应还金额必须大于0');
      if (row.overdueDays < 0) errors.push('逾期天数不能为负数');
      
      // 身份证号格式验证
      if (row.debtorIdCard && !/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(row.debtorIdCard)) {
        errors.push('身份证号码格式不正确');
      }
      
      // 手机号格式验证
      if (row.debtorPhone && !/^1[3-9]\d{9}$/.test(row.debtorPhone)) {
        errors.push('手机号格式不正确');
      }
      
      // 重复性检查
      if (contractNumbers.has(row.loanContractNo)) {
        errors.push('借据编号重复');
      } else {
        contractNumbers.add(row.loanContractNo);
      }
      
      if (idCards.has(row.debtorIdCard)) {
        errors.push('身份证号码重复');
      } else {
        idCards.add(row.debtorIdCard);
      }
      
      // 金额逻辑验证
      if (row.remainingAmount > row.loanAmount) {
        errors.push('剩余应还金额不能大于贷款金额');
      }
      
      return {
        ...row,
        isValid: errors.length === 0,
        errors
      };
    });
  };

  // 计算统计信息
  const calculateStatistics = (data: CaseImportData[]): ImportStatistics => {
    const validData = data.filter(row => row.isValid);
    const amounts = validData.map(row => row.remainingAmount);
    const overdueDays = validData.map(row => row.overdueDays);
    
    return {
      totalRows: data.length,
      validRows: validData.length,
      invalidRows: data.length - validData.length,
      duplicateRows: 0, // 这里可以进一步计算重复数量
      totalAmount: amounts.reduce((sum, amount) => sum + amount, 0),
      avgAmount: amounts.length > 0 ? amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length : 0,
      maxOverdueDays: Math.max(...overdueDays, 0),
      minOverdueDays: Math.min(...overdueDays, 0)
    };
  };

  // 处理文件上传和解析
  const handleFileUpload = async () => {
    console.log('handleFileUpload called, fileList:', fileList);
    
    if (fileList.length === 0) {
      message.error('请先选择文件');
      return;
    }
    
    // 检查文件对象是否正确
    const uploadFile = fileList[0];
    if (!uploadFile.originFileObj) {
      message.error('文件对象无效，请重新选择文件');
      console.error('Invalid file object:', uploadFile);
      return;
    }
    
    setLoading(true);
    setImportProgress(0);
    
    try {
      const file = uploadFile.originFileObj;
      console.log('Processing file:', file.name, 'size:', file.size);
      
      // 模拟进度更新
      const progressTimer = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressTimer);
            return prev;
          }
          return prev + 10;
        });
      }, 200);
      
      const parsedData = await parseExcelFile(file);
      const validatedData = validateData(parsedData);
      const stats = calculateStatistics(validatedData);
      
      clearInterval(progressTimer);
      setImportData(validatedData);
      setStatistics(stats);
      setImportProgress(100);
      
      // 如果是嵌入模式，直接调用回调
      if (embedded && onDataChange) {
        console.log('Calling onDataChange with data:', validatedData.length, 'items');
        onDataChange(validatedData, stats);
      } else {
        setCurrentStep(1);
      }
      
      message.success(`文件解析完成，共解析${parsedData.length}条数据`);
    } catch (error: any) {
      console.error('File parsing error:', error);
      message.error(error.message || '文件解析失败');
      setImportProgress(0);
    } finally {
      setLoading(false);
    }
  };

  // 数据预览表格列配置
  const previewColumns: ColumnsType<CaseImportData> = [
    {
      title: '行号',
      dataIndex: 'rowIndex',
      width: 60,
      fixed: 'left'
    },
    {
      title: '状态',
      dataIndex: 'isValid',
      width: 80,
      fixed: 'left',
      render: (isValid: boolean, record) => (
        <Tooltip title={record.errors?.join('; ')}>
          {isValid ? (
            <Tag color="success" icon={<CheckCircleOutlined />}>有效</Tag>
          ) : (
            <Tag color="error" icon={<CloseCircleOutlined />}>无效</Tag>
          )}
        </Tooltip>
      )
    },
    {
      title: '客户姓名',
      dataIndex: 'debtorName',
      width: 100,
      render: (text: string) => text || '-'
    },
    {
      title: '身份证号',
      dataIndex: 'debtorIdCard',
      width: 150,
      render: (text: string) => text ? text.replace(/(\d{6})\d{8}(\d{4})/, '$1****$2') : '-'
    },
    {
      title: '手机号',
      dataIndex: 'debtorPhone',
      width: 120,
      render: (text: string) => text ? text.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '-'
    },
    {
      title: '借据编号',
      dataIndex: 'loanContractNo',
      width: 150
    },
    {
      title: '贷款金额',
      dataIndex: 'loanAmount',
      width: 100,
      render: (amount: number) => `¥${amount?.toLocaleString() || 0}`
    },
    {
      title: '剩余金额',
      dataIndex: 'remainingAmount',
      width: 100,
      render: (amount: number) => `¥${amount?.toLocaleString() || 0}`
    },
    {
      title: '逾期天数',
      dataIndex: 'overdueDays',
      width: 80,
      render: (days: number) => `${days || 0}天`
    },
    {
      title: '产品线',
      dataIndex: 'productLine',
      width: 100,
      render: (text: string) => text || '-'
    },
    {
      title: '错误信息',
      dataIndex: 'errors',
      width: 200,
      render: (errors: string[]) => errors?.length > 0 ? (
        <div>
          {errors.map((error, index) => (
            <Tag key={index} color="error" style={{ marginBottom: 4 }}>
              {error}
            </Tag>
          ))}
        </div>
      ) : '-'
    }
  ];

  // 创建案件包
  const handleCreatePackage = async (values: any) => {
    if (!statistics || statistics.validRows === 0) {
      message.error('没有有效数据可以创建案件包');
      return;
    }
    
    setLoading(true);
    setImportProgress(0);
    
    try {
      // 模拟创建过程
      const progressTimer = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressTimer);
            return prev;
          }
          return prev + 5;
        });
      }, 100);
      
      // 这里调用实际的API
      const packageData = {
        packageName: values.packageName,
        description: values.description,
        assignmentStrategy: values.assignmentStrategy,
        expectedRecoveryRate: values.expectedRecoveryRate,
        disposalPeriod: values.disposalPeriod,
        disposalMethods: values.disposalMethods,
        cases: importData.filter(row => row.isValid)
      };
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setImportProgress(100);
      setCurrentStep(2);
      
      message.success('案件包创建成功');
    } catch (error) {
      message.error('案件包创建失败');
    } finally {
      setLoading(false);
    }
  };

  // 重新开始
  const handleRestart = () => {
    setCurrentStep(0);
    setFileList([]);
    setImportData([]);
    setStatistics(null);
    setImportProgress(0);
    packageForm.resetFields();
  };

  return (
    <div className="case-batch-import">
      <Card title={embedded ? "案件数据上传" : "案件批量导入"} bordered={false}>
        {/* 步骤条 - 仅在非嵌入模式显示 */}
        {!embedded && (
          <Steps current={currentStep} style={{ marginBottom: 24 }}>
            <Step 
              title="上传文件" 
              description="选择并上传Excel/CSV文件"
              icon={currentStep === 0 && loading ? <Spin size="small" /> : undefined}
            />
            <Step 
              title="数据验证" 
              description="验证数据格式和完整性"
              icon={currentStep === 1 && loading ? <Spin size="small" /> : undefined}
            />
            <Step 
              title="创建案件包" 
              description="配置案件包信息并创建"
              icon={currentStep === 2 && loading ? <Spin size="small" /> : undefined}
            />
            <Step 
              title="导入完成" 
              description="案件包创建成功"
            />
          </Steps>
        )}

        {/* 步骤1: 文件上传 - 在嵌入模式下总是显示，在独立模式下根据步骤显示 */}
        {(embedded || currentStep === 0) && (
          <div>
            <Alert
              message="导入说明"
              description={
                <div>
                  <p>1. 支持Excel(.xlsx, .xls)和CSV(.csv)格式文件</p>
                  <p>2. 文件大小不能超过10MB，建议单次导入不超过1000条数据</p>
                  <p>3. 必填字段：客户姓名、身份证号码、借据编号、贷款金额、剩余应还金额、逾期天数</p>
                  <p>4. 系统会自动验证数据格式和去重</p>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={downloadTemplate}
                  style={{ marginBottom: 16 }}
                >
                  下载导入模板
                </Button>
                
                <Upload.Dragger {...uploadProps} style={{ marginBottom: 16 }}>
                  <p className="ant-upload-drag-icon">
                    <FileExcelOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                  </p>
                  <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                  <p className="ant-upload-hint">
                    支持Excel(.xlsx, .xls)和CSV(.csv)格式
                  </p>
                </Upload.Dragger>

                {fileList.length > 0 && (
                  <div style={{ textAlign: 'left', marginTop: 16 }}>
                    <Text strong>已选择文件：</Text>
                    <Tag color="blue" style={{ marginLeft: 8 }}>
                      {fileList[0].name}
                    </Tag>
                  </div>
                )}
              </div>

              {loading && (
                <div style={{ textAlign: 'center' }}>
                  <Progress 
                    percent={importProgress} 
                    status="active"
                    format={(percent) => `解析中 ${percent}%`}
                  />
                </div>
              )}

              <div style={{ textAlign: 'center' }}>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={handleFileUpload}
                  loading={loading}
                  disabled={fileList.length === 0}
                >
                  开始解析
                </Button>
              </div>
            </Space>
          </div>
        )}

        {/* 数据验证结果 - 在嵌入模式且有数据时显示 */}
        {embedded && statistics && (
          <div style={{ marginTop: 16 }}>
            {/* 统计信息 */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="总数据量"
                    value={statistics.totalRows}
                    suffix="条"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="有效数据"
                    value={statistics.validRows}
                    suffix="条"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="无效数据"
                    value={statistics.invalidRows}
                    suffix="条"
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="总委托金额"
                    value={statistics.totalAmount}
                    prefix="¥"
                    precision={2}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
            </Row>
            
            {/* 数据预览表格 */}
            <Table
              columns={previewColumns}
              dataSource={importData.slice(0, 5)} // 嵌入模式只显示前5条
              scroll={{ x: 1200 }}
              size="small"
              pagination={false}
              rowKey="rowIndex"
              rowClassName={(record) => record.isValid ? '' : 'error-row'}
            />
            
            {importData.length > 5 && (
              <div style={{ textAlign: 'center', padding: 16, background: '#fafafa' }}>
                <Text type="secondary">
                  仅显示前5条数据预览
                </Text>
              </div>
            )}
          </div>
        )}
        
        {/* 步骤2: 数据验证 - 仅在独立模式显示 */}
        {!embedded && currentStep === 1 && statistics && (
          <div>
            {/* 统计信息 */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="总数据量"
                    value={statistics.totalRows}
                    suffix="条"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="有效数据"
                    value={statistics.validRows}
                    suffix="条"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="无效数据"
                    value={statistics.invalidRows}
                    suffix="条"
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="总委托金额"
                    value={statistics.totalAmount}
                    prefix="¥"
                    precision={2}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="平均金额"
                    value={statistics.avgAmount}
                    prefix="¥"
                    precision={2}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="最大逾期"
                    value={statistics.maxOverdueDays}
                    suffix="天"
                    valueStyle={{ color: '#fa541c' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* 错误提示 */}
            {statistics.invalidRows > 0 && (
              <Alert
                message={`发现 ${statistics.invalidRows} 条无效数据`}
                description="请检查并修正红色标记的数据，或者选择忽略无效数据继续创建案件包"
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {/* 数据预览 */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4}>数据预览</Title>
                <Space>
                  <Button icon={<EyeOutlined />} onClick={() => setPreviewVisible(true)}>
                    查看详情
                  </Button>
                  <Button onClick={() => setCurrentStep(0)}>
                    重新上传
                  </Button>
                </Space>
              </div>
              
              <Table
                columns={previewColumns}
                dataSource={importData.slice(0, 10)} // 只显示前10条
                scroll={{ x: 1400 }}
                size="small"
                pagination={false}
                rowKey="rowIndex"
                rowClassName={(record) => record.isValid ? '' : 'error-row'}
              />
              
              {importData.length > 10 && (
                <div style={{ textAlign: 'center', padding: 16, background: '#fafafa' }}>
                  <Text type="secondary">
                    仅显示前10条数据，点击"查看详情"查看全部数据
                  </Text>
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div style={{ textAlign: 'center' }}>
              <Space size="large">
                <Button onClick={() => setCurrentStep(0)}>
                  上一步
                </Button>
                <Button 
                  type="primary" 
                  onClick={() => setCurrentStep(2)}
                  disabled={statistics.validRows === 0}
                >
                  下一步
                </Button>
              </Space>
            </div>
          </div>
        )}

        {/* 步骤3: 创建案件包 */}
        {currentStep === 2 && (
          <div>
            <Form
              form={packageForm}
              layout="vertical"
              onFinish={handleCreatePackage}
              style={{ maxWidth: 800, margin: '0 auto' }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="案件包名称"
                    name="packageName"
                    rules={[{ required: true, message: '请输入案件包名称' }]}
                  >
                    <Input placeholder="请输入案件包名称" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="分案策略"
                    name="assignmentStrategy"
                    rules={[{ required: true, message: '请选择分案策略' }]}
                  >
                    <Select placeholder="请选择分案策略">
                      <Option value="INTELLIGENT">智能分案</Option>
                      <Option value="REGION">按地区分案</Option>
                      <Option value="AMOUNT">按金额分案</Option>
                      <Option value="OVERDUE_DAYS">按账龄分案</Option>
                      <Option value="PERFORMANCE">按业绩分案</Option>
                      <Option value="LOAD_BALANCE">负载均衡</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="期望回款率"
                    name="expectedRecoveryRate"
                    rules={[{ required: true, message: '请输入期望回款率' }]}
                  >
                    <Input suffix="%" placeholder="例如：60" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="处置周期"
                    name="disposalPeriod"
                    rules={[{ required: true, message: '请输入处置周期' }]}
                  >
                    <Input suffix="天" placeholder="例如：90" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="处置方式"
                name="disposalMethods"
                rules={[{ required: true, message: '请选择处置方式' }]}
              >
                <Select mode="multiple" placeholder="请选择处置方式">
                  <Option value="MEDIATION">调解</Option>
                  <Option value="LITIGATION">诉讼</Option>
                  <Option value="PRESERVATION">保全</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="案件包描述"
                name="description"
              >
                <TextArea 
                  rows={4} 
                  placeholder="请输入案件包描述（选填）"
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              {loading && (
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <Progress 
                    percent={importProgress} 
                    status="active"
                    format={(percent) => `创建中 ${percent}%`}
                  />
                </div>
              )}

              <Form.Item style={{ textAlign: 'center' }}>
                <Space size="large">
                  <Button onClick={() => setCurrentStep(1)}>
                    上一步
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    创建案件包
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}

        {/* 步骤4: 完成 */}
        {currentStep === 3 && (
          <Result
            status="success"
            title="案件包创建成功！"
            subTitle={`已成功创建案件包，包含 ${statistics?.validRows || 0} 个有效案件`}
            extra={[
              <Button type="primary" key="view">
                查看案件包
              </Button>,
              <Button key="restart" onClick={handleRestart}>
                继续导入
              </Button>,
            ]}
          />
        )}
      </Card>

      {/* 数据详情模态框 */}
      <Modal
        title="导入数据详情"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={1400}
        footer={null}
      >
        <Table
          columns={previewColumns}
          dataSource={importData}
          scroll={{ x: 1400, y: 600 }}
          size="small"
          rowKey="rowIndex"
          rowClassName={(record) => record.isValid ? '' : 'error-row'}
          pagination={{
            pageSize: 50,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Modal>

      <style>{`
        .error-row {
          background-color: #fff2f0 !important;
        }
        .error-row:hover {
          background-color: #ffebe8 !important;
        }
      `}</style>
    </div>
  );
};

export default CaseBatchImport;