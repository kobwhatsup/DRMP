import React, { useState } from 'react';
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
import PublishSettingsStep from './components/PublishSettingsStep';
import PreviewConfirmStep from './components/PreviewConfirmStep';
import { casePackageService } from '@/services/caseService';
import dayjs from 'dayjs';

const CreateCasePackage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [caseData, setCaseData] = useState<any[]>([]);
  const [caseStatistics, setCaseStatistics] = useState<any>(null);

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
      title: '发布设置',
      content: <PublishSettingsStep form={form} />
    },
    {
      title: '预览确认',
      content: (
        <PreviewConfirmStep 
          formData={form.getFieldsValue()}
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
      } else if (currentStep === 2) {
        // 验证发布设置
        const assignmentType = form.getFieldValue('assignmentType');
        if (!assignmentType) {
          message.error('请选择分案方式');
          return false;
        }
        
        if (assignmentType === 'BIDDING') {
          await form.validateFields(['biddingTime', 'minBidAmount', 'bidBondAmount']);
        } else if (assignmentType === 'DESIGNATED') {
          await form.validateFields(['targetOrgId']);
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
      // 如果是从发布设置步骤到预览确认，需要更新预览数据
      if (currentStep === 2) {
        // 强制更新预览组件
        setCurrentStep(currentStep + 1);
      } else {
        setCurrentStep(currentStep + 1);
      }
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
      const values = form.getFieldsValue();
      
      // 准备保存的数据
      const draftData = {
        ...values,
        status: 'DRAFT',
        cases: caseData,
        entrustStartDate: values.entrustDates?.[0]?.format('YYYY-MM-DD'),
        entrustEndDate: values.entrustDates?.[1]?.format('YYYY-MM-DD'),
        biddingStartTime: values.biddingTime?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
        biddingEndTime: values.biddingTime?.[1]?.format('YYYY-MM-DD HH:mm:ss')
      };

      // 删除临时字段
      delete draftData.entrustDates;
      delete draftData.biddingTime;

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
    Modal.confirm({
      title: '确认创建',
      content: '确认创建并发布该案件包吗？发布后将无法修改基本信息。',
      okText: '确认发布',
      cancelText: '取消',
      onOk: async () => {
        try {
          setLoading(true);
          const values = form.getFieldsValue();
          
          // 准备提交的数据
          const submitData = {
            ...values,
            status: 'PUBLISHED',
            caseCount: caseData.length,
            totalAmount: caseStatistics?.totalAmount || 0,
            sourceOrgId: 1, // TODO: 从用户信息中获取
            entrustStartDate: values.entrustDates?.[0]?.format('YYYY-MM-DD'),
            entrustEndDate: values.entrustDates?.[1]?.format('YYYY-MM-DD'),
            biddingStartTime: values.biddingTime?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
            biddingEndTime: values.biddingTime?.[1]?.format('YYYY-MM-DD HH:mm:ss'),
            expectedRecoveryRate: (values.expectedRecoveryRate || 0) / 100,
            expectedRecoveryRateMin: (values.expectedRecoveryRateMin || 0) / 100,
            preferredDisposalMethods: values.preferredDisposalMethods?.join(','),
            cases: caseData.filter(c => c.isValid !== false)
          };

          // 删除临时字段
          delete submitData.entrustDates;
          delete submitData.biddingTime;

          // TODO: 调用创建API
          console.log('Creating case package:', submitData);
          // const response = await casePackageService.createCasePackage(submitData);

          message.success('案件包创建成功！');
          navigate('/cases/packages');
        } catch (error) {
          message.error('创建失败，请重试');
          console.error('Create error:', error);
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
              {currentStep > 0 && currentStep < 3 && (
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