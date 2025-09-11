import React, { useState, useEffect } from 'react';
import { Card, Steps, Button, Space, message, Form, Modal, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftOutlined, 
  SaveOutlined, 
  SendOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons';
import BasicInfoStep from './components/BasicInfoStep';
import CaseBatchImport from './CaseBatchImport';
import PreviewConfirmStep from './components/PreviewConfirmStep';
import { casePackageService } from '@/services/casePackageService';
import dayjs from 'dayjs';

const CreateCasePackage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [caseData, setCaseData] = useState<any[]>([]);
  const [caseStatistics, setCaseStatistics] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  // 监听步骤变化，确保预览步骤有最新数据
  useEffect(() => {
    // 当进入预览确认步骤时，确保获取所有表单数据
    if (currentStep === 2) {
      const allFormData = form.getFieldsValue(true);
      console.log('Entering preview step, updating with all form data:', allFormData);
      setFormData(allFormData);
    }
  }, [currentStep, form]);

  // 步骤配置
  const steps = [
    {
      title: '基本信息',
      content: <BasicInfoStep form={form} />
    },
    {
      title: '上传案件',
      content: (
        <CaseBatchImport 
          embedded={true}
          onDataChange={(data, statistics) => {
            setCaseData(data);
            setCaseStatistics(statistics);
          }}
        />
      )
    },
    {
      title: '预览确认',
      content: (
        <PreviewConfirmStep 
          formData={formData}
          caseData={caseData}
          statistics={caseStatistics}
        />
      )
    }
  ];

  // 验证当前步骤
  const validateCurrentStep = async () => {
    try {
      if (currentStep === 0) {
        // 验证基本信息
        const fields = [
          'packageCode', 
          'packageName', 
          'entrustDates',
          'preferredDisposalMethods',
          'expectedDisposalDays',
          'reportingFrequency',
          'settlementMethod'
        ];
        await form.validateFields(fields);
      } else if (currentStep === 1) {
        // 验证案件上传
        if (!caseData || caseData.length === 0) {
          message.error('请上传案件数据');
          return false;
        }
        const validCases = caseData.filter(c => c.isValid !== false);
        if (validCases.length === 0) {
          message.error('没有有效的案件数据');
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Validation failed:', error);
      return false;
    }
  };

  // 下一步
  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      // 总是在进入下一步前保存当前表单数据
      const currentFormData = form.getFieldsValue(true); // 使用true获取所有字段
      console.log(`Step ${currentStep} form data:`, currentFormData);
      
      // 合并之前的数据和当前数据
      setFormData((prevData: any) => {
        const mergedData = {...prevData, ...currentFormData};
        console.log('Merged form data:', mergedData);
        return mergedData;
      });
      
      // 如果是要进入预览确认步骤，添加额外的调试信息
      if (currentStep === 1) {
        console.log('About to enter preview step, all form data:', {
          ...formData,
          ...currentFormData
        });
      }
      
      setCurrentStep(currentStep + 1);
    }
  };

  // 上一步
  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  // 保存草稿
  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      const values = form.getFieldsValue(true);
      
      // 准备保存的数据
      const draftData = {
        ...values,
        status: 'DRAFT',
        cases: caseData,
        entrustStartDate: values.entrustDates?.[0]?.format('YYYY-MM-DD'),
        entrustEndDate: values.entrustDates?.[1]?.format('YYYY-MM-DD')
      };

      // 删除临时字段
      delete draftData.entrustDates;

      // TODO: 调用保存草稿API
      console.log('Saving draft:', draftData);
      
      message.success('草稿保存成功');
    } catch (error) {
      message.error('保存草稿失败');
      console.error('Save draft error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 完成创建
  const handleFinish = async () => {
    console.log('handleFinish called');
    console.log('Current form values:', form.getFieldsValue());
    console.log('Case data length:', caseData.length);
    console.log('Case statistics:', caseStatistics);
    
    Modal.confirm({
      title: '确认创建',
      content: '确认创建并发布该案件包吗？发布后将无法修改基本信息。',
      okText: '确认发布',
      cancelText: '取消',
      onOk: async () => {
        console.log('Confirm button clicked');
        try {
          setLoading(true);
          const values = form.getFieldsValue(true);
          
          // 准备提交的数据
          const submitData = {
            ...values,
            status: 'PENDING_ASSIGNMENT', // 待分案状态
            caseCount: caseData.length,
            totalAmount: caseStatistics?.totalAmount || 0,
            sourceOrgId: 1, // TODO: 从用户信息中获取
            entrustStartDate: values.entrustDates?.[0]?.format('YYYY-MM-DD'),
            entrustEndDate: values.entrustDates?.[1]?.format('YYYY-MM-DD'),
            expectedRecoveryRate: (values.expectedRecoveryRate || 0) / 100, // 转换为小数
            expectedRecoveryRateMin: (values.expectedRecoveryRateMin || 0) / 100, // 转换为小数
            preferredDisposalMethods: values.preferredDisposalMethods?.join(','),
            cases: caseData.filter(c => c.isValid !== false)
          };

          // 删除临时字段
          delete submitData.entrustDates;

          // 调用创建API
          console.log('Creating case package:', submitData);
          const response = await casePackageService.createCasePackage(submitData);
          
          if (response && response.id) {
            message.success('案件包创建成功！');
            navigate('/cases/packages');
          } else {
            throw new Error('创建失败：未返回有效的案件包ID');
          }
        } catch (error: any) {
          console.error('Create error:', error);
          const errorMsg = error?.message || '创建失败，请重试';
          message.error(errorMsg);
          
          // 不要在这里设置loading为false，因为Modal会自动关闭
          // 只在finally中设置，确保无论成功失败都会重置loading状态
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Spin spinning={loading}>
        <Card>
          <div style={{ marginBottom: 24 }}>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/cases/packages')}
              >
                返回列表
              </Button>
              {currentStep > 0 && currentStep < 2 && (
                <Button 
                  icon={<SaveOutlined />}
                  onClick={handleSaveDraft}
                >
                  保存草稿
                </Button>
              )}
            </Space>
          </div>
          
          <Steps 
            current={currentStep} 
            style={{ marginBottom: 24 }}
            items={steps.map(item => ({
              title: item.title
            }))}
          />
          
          <div style={{ minHeight: '400px' }}>
            {steps[currentStep].content}
          </div>
          
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Space size="large">
              {currentStep > 0 && (
                <Button size="large" onClick={handlePrev}>
                  上一步
                </Button>
              )}
              {currentStep < steps.length - 1 && (
                <Button type="primary" size="large" onClick={handleNext}>
                  下一步
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <>
                  <Button 
                    size="large" 
                    icon={<SaveOutlined />}
                    onClick={handleSaveDraft}
                  >
                    保存草稿
                  </Button>
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<SendOutlined />}
                    onClick={handleFinish}
                  >
                    完成创建
                  </Button>
                </>
              )}
            </Space>
          </div>
        </Card>
      </Spin>
    </div>
  );
};

export default CreateCasePackage;