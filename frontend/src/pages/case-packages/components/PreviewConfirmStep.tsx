import React from 'react';
import {
  Card,
  Descriptions,
  Table,
  Tag,
  Space,
  Alert,
  Statistic,
  Row,
  Col,
  Typography,
  Divider,
  Timeline
} from 'antd';
import {
  FileTextOutlined,
  TeamOutlined,
  CalendarOutlined,
  DollarOutlined,
  PercentageOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface PreviewConfirmStepProps {
  formData: any;
  caseData: any[];
  statistics: any;
}

const PreviewConfirmStep: React.FC<PreviewConfirmStepProps> = ({
  formData,
  caseData,
  statistics
}) => {
  // 案件预览表格列定义
  const caseColumns: ColumnsType<any> = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: '债务人姓名',
      dataIndex: 'debtorName',
      key: 'debtorName',
      width: 100
    },
    {
      title: '身份证号',
      dataIndex: 'debtorIdCard',
      key: 'debtorIdCard',
      width: 150,
      render: (text) => text ? `${text.substring(0, 6)}****${text.substring(14)}` : '-'
    },
    {
      title: '贷款金额',
      dataIndex: 'loanAmount',
      key: 'loanAmount',
      width: 120,
      align: 'right',
      render: (value) => `¥${(value || 0).toLocaleString()}`
    },
    {
      title: '剩余金额',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      width: 120,
      align: 'right',
      render: (value) => `¥${(value || 0).toLocaleString()}`
    },
    {
      title: '逾期天数',
      dataIndex: 'overdueDays',
      key: 'overdueDays',
      width: 100,
      align: 'center',
      render: (days) => (
        <Tag color={days > 180 ? 'red' : days > 90 ? 'orange' : 'blue'}>
          {days}天
        </Tag>
      )
    },
    {
      title: '所在地区',
      dataIndex: 'debtorProvince',
      key: 'debtorProvince',
      width: 100,
      render: (province, record) => `${province || ''}${record.debtorCity || ''}`
    }
  ];

  // 获取分案方式显示文本
  const getAssignmentTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      'MANUAL': '手动分案',
      'BIDDING': '竞标分案',
      'SMART': '智能分案',
      'DESIGNATED': '指定分案'
    };
    return typeMap[type] || type;
  };

  // 获取处置方式显示文本
  const getDisposalMethodsText = (methods: string[]) => {
    const methodMap: Record<string, string> = {
      'MEDIATION': '调解',
      'LITIGATION': '诉讼',
      'ARBITRATION': '仲裁',
      'ENFORCEMENT': '强制执行',
      'ASSET_DISPOSAL': '资产处置',
      'DEBT_RESTRUCTURING': '债务重组'
    };
    return methods?.map(m => methodMap[m] || m).join('、') || '-';
  };

  // 获取报告频率显示文本
  const getReportingFrequencyText = (frequency: string) => {
    const frequencyMap: Record<string, string> = {
      'DAILY': '每日报告',
      'WEEKLY': '每周报告',
      'BIWEEKLY': '双周报告',
      'MONTHLY': '每月报告'
    };
    return frequencyMap[frequency] || frequency;
  };

  // 获取结算方式显示文本
  const getSettlementMethodText = (method: string) => {
    const methodMap: Record<string, string> = {
      'MONTHLY': '月度结算',
      'QUARTERLY': '季度结算',
      'CASE_BY_CASE': '逐案结算',
      'MILESTONE': '里程碑结算'
    };
    return methodMap[method] || method;
  };

  return (
    <div>
      <Alert
        message="请仔细核对以下信息，确认无误后点击「完成创建」按钮"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* 案件统计卡片 */}
      <Card title="案件统计" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="案件总数"
              value={statistics?.totalRows || caseData?.length || 0}
              suffix="件"
              prefix={<FileTextOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="总债务金额"
              value={statistics?.totalAmount || 0}
              precision={2}
              prefix="¥"
              suffix="元"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="平均债务金额"
              value={statistics?.avgAmount || 0}
              precision={2}
              prefix="¥"
              suffix="元"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="有效案件率"
              value={statistics?.totalRows > 0 
                ? ((statistics?.validRows || 0) / statistics.totalRows * 100).toFixed(1)
                : 0}
              suffix="%"
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
        </Row>
      </Card>

      {/* 基本信息 */}
      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="案件包编号">
            {formData?.packageCode || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="案件包名称">
            {formData?.packageName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="委托期限">
            {formData?.entrustDates ? 
              `${formData.entrustDates[0].format('YYYY-MM-DD')} 至 ${formData.entrustDates[1].format('YYYY-MM-DD')}`
              : '-'
            }
          </Descriptions.Item>
          <Descriptions.Item label="预期回收率">
            {formData?.expectedRecoveryRate ? `${formData.expectedRecoveryRate}%` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="预期处置天数">
            {formData?.expectedDisposalDays ? `${formData.expectedDisposalDays}天` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="偏好处置方式">
            {getDisposalMethodsText(formData?.preferredDisposalMethods)}
          </Descriptions.Item>
          <Descriptions.Item label="报告频率">
            {getReportingFrequencyText(formData?.reportingFrequency)}
          </Descriptions.Item>
          <Descriptions.Item label="结算方式">
            {getSettlementMethodText(formData?.settlementMethod)}
          </Descriptions.Item>
          <Descriptions.Item label="案件包描述" span={2}>
            {formData?.description || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 发布设置 */}
      <Card title="发布设置" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="分案方式">
            <Tag color="blue">{getAssignmentTypeText(formData?.assignmentType)}</Tag>
          </Descriptions.Item>
          
          {formData?.assignmentType === 'BIDDING' && (
            <>
              <Descriptions.Item label="竞标时间">
                {formData?.biddingTime ? 
                  `${formData.biddingTime[0].format('YYYY-MM-DD HH:mm')} 至 ${formData.biddingTime[1].format('YYYY-MM-DD HH:mm')}`
                  : '-'
                }
              </Descriptions.Item>
              <Descriptions.Item label="最低出价">
                {formData?.minBidAmount ? `¥${formData.minBidAmount.toLocaleString()}` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="竞标保证金">
                {formData?.bidBondAmount ? `¥${formData.bidBondAmount.toLocaleString()}` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="竞标要求" span={2}>
                {formData?.biddingRequirements || '-'}
              </Descriptions.Item>
            </>
          )}

          {formData?.assignmentType === 'SMART' && (
            <>
              <Descriptions.Item label="地域匹配权重">
                {formData?.smartAssignConfig?.regionWeight || 0}%
              </Descriptions.Item>
              <Descriptions.Item label="业绩匹配权重">
                {formData?.smartAssignConfig?.performanceWeight || 0}%
              </Descriptions.Item>
              <Descriptions.Item label="负载均衡权重">
                {formData?.smartAssignConfig?.loadWeight || 0}%
              </Descriptions.Item>
              <Descriptions.Item label="专长匹配权重">
                {formData?.smartAssignConfig?.specialtyWeight || 0}%
              </Descriptions.Item>
              <Descriptions.Item label="最低匹配分数">
                {formData?.smartAssignConfig?.minMatchScore || 60}分
              </Descriptions.Item>
              <Descriptions.Item label="单机构最大案件数">
                {formData?.smartAssignConfig?.maxCasesPerOrg || 100}件
              </Descriptions.Item>
            </>
          )}

          {formData?.assignmentType === 'DESIGNATED' && (
            <Descriptions.Item label="指定处置机构">
              {formData?.targetOrgName || `机构ID: ${formData?.targetOrgId}` || '-'}
            </Descriptions.Item>
          )}

          <Descriptions.Item label="特殊要求" span={2}>
            {formData?.specialRequirements || '无'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 案件列表预览 */}
      <Card 
        title={
          <Space>
            <span>案件列表预览</span>
            <Text type="secondary">（显示前10条）</Text>
          </Space>
        }
      >
        <Table
          columns={caseColumns}
          dataSource={caseData?.slice(0, 10) || []}
          pagination={false}
          rowKey={(record, index) => index?.toString() || ''}
          scroll={{ x: 900 }}
          footer={() => 
            caseData?.length > 10 ? (
              <Text type="secondary">
                共 {caseData.length} 条案件，此处仅显示前10条
              </Text>
            ) : null
          }
        />
      </Card>

      {/* 创建流程提示 */}
      <Card title="创建流程" style={{ marginTop: 16 }}>
        <Timeline>
          <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
            基本信息已配置
          </Timeline.Item>
          <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
            案件已上传（{caseData?.length || 0}条）
          </Timeline.Item>
          <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
            发布设置已完成
          </Timeline.Item>
          <Timeline.Item color="blue" dot={<ClockCircleOutlined />}>
            等待确认创建
          </Timeline.Item>
        </Timeline>
      </Card>
    </div>
  );
};

export default PreviewConfirmStep;