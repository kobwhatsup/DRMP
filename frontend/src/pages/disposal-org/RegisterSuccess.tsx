import React from 'react';
import { Result, Button, Card, Steps, Timeline, Typography, Space, Alert } from 'antd';
import {
  CheckCircleOutlined, ClockCircleOutlined, MailOutlined,
  PhoneOutlined, CustomerServiceOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const RegisterSuccess: React.FC = () => {
  const navigate = useNavigate();

  const nextSteps = [
    {
      title: '资质审核',
      status: 'process' as const,
      icon: <ClockCircleOutlined />,
      description: '我们将在3个工作日内完成您的资质审核'
    },
    {
      title: '审核通知',
      status: 'wait' as const,
      icon: <MailOutlined />,
      description: '审核结果将通过邮件和短信通知您'
    },
    {
      title: '会员费支付',
      status: 'wait' as const,
      icon: <CheckCircleOutlined />,
      description: '审核通过后支付999元/月会员费'
    },
    {
      title: '正式启用',
      status: 'wait' as const,
      icon: <CheckCircleOutlined />,
      description: '支付完成后即可开始使用平台服务'
    }
  ];

  const timelineItems = [
    {
      color: 'green',
      dot: <CheckCircleOutlined />,
      children: (
        <div>
          <Text strong>申请已提交</Text>
          <br />
          <Text type="secondary">刚刚</Text>
          <br />
          <Text type="secondary">您的注册申请已成功提交，申请编号：DR2024{Date.now().toString().slice(-6)}</Text>
        </div>
      )
    },
    {
      color: 'blue',
      children: (
        <div>
          <Text strong>资质审核中</Text>
          <br />
          <Text type="secondary">预计1-3个工作日</Text>
          <br />
          <Text type="secondary">我们的审核团队将仔细审核您提交的资质材料</Text>
        </div>
      )
    },
    {
      color: 'gray',
      children: (
        <div>
          <Text strong>审核结果通知</Text>
          <br />
          <Text type="secondary">审核完成后</Text>
          <br />
          <Text type="secondary">通过邮件和短信发送审核结果</Text>
        </div>
      )
    },
    {
      color: 'gray',
      children: (
        <div>
          <Text strong>会员费支付</Text>
          <br />
          <Text type="secondary">审核通过后</Text>
          <br />
          <Text type="secondary">支付999元/月会员费激活账户</Text>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card style={{ maxWidth: 800, margin: '0 auto' }}>
        <Result
          status="success"
          title="注册申请提交成功！"
          subTitle="感谢您选择DRMP平台，我们将尽快处理您的入驻申请。"
          extra={[
            <Button type="primary" key="console" onClick={() => navigate('/login')}>
              返回登录
            </Button>,
            <Button key="contact" onClick={() => window.open('tel:400-000-0000')}>
              联系客服
            </Button>,
          ]}
        />

        <Card 
          title="下一步流程" 
          style={{ marginTop: 24 }}
          bodyStyle={{ padding: '24px 32px' }}
        >
          <Steps
            direction="vertical"
            current={0}
            items={nextSteps}
          />
        </Card>

        <Card 
          title="处理进度" 
          style={{ marginTop: 24 }}
          bodyStyle={{ padding: '24px 32px' }}
        >
          <Timeline items={timelineItems} />
        </Card>

        <Alert
          message="重要提醒"
          description={
            <div>
              <Paragraph>
                <Text strong>请保持联系方式畅通：</Text>审核期间我们可能需要联系您补充材料或确认信息。
              </Paragraph>
              <Paragraph>
                <Text strong>审核标准：</Text>我们将严格审核机构资质、团队能力和业务范围，确保平台服务质量。
              </Paragraph>
              <Paragraph>
                <Text strong>会员费说明：</Text>999元/月的会员费是平台基础服务费，不抽取案件回款佣金。
              </Paragraph>
            </div>
          }
          type="info"
          showIcon
          style={{ marginTop: 24 }}
        />

        <Card 
          title="联系我们" 
          style={{ marginTop: 24 }}
          bodyStyle={{ padding: '24px 32px' }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <PhoneOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              <Text strong>客服热线：</Text>
              <Text>400-000-0000（工作日 9:00-18:00）</Text>
            </div>
            <div>
              <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              <Text strong>客服邮箱：</Text>
              <Text>support@drmp.com</Text>
            </div>
            <div>
              <CustomerServiceOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              <Text strong>在线客服：</Text>
              <Text>登录平台后可使用在线客服功能</Text>
            </div>
          </Space>
        </Card>
      </Card>
    </div>
  );
};

export default RegisterSuccess;