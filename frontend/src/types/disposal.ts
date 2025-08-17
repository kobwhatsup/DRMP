/**
 * 处置方式相关类型定义
 */

// 处置方式枚举
export enum DisposalMethod {
  MEDIATION = 'MEDIATION',     // 调解
  LITIGATION = 'LITIGATION',   // 诉讼
  MIXED = 'MIXED'              // 混合（先调解后诉讼）
}

// 案件处置阶段
export enum DisposalPhase {
  // 调解阶段
  PRE_MEDIATION = 'PRE_MEDIATION',           // 调解前准备
  MEDIATION_ACTIVE = 'MEDIATION_ACTIVE',     // 调解进行中
  MEDIATION_COMPLETED = 'MEDIATION_COMPLETED', // 调解完成
  
  // 诉讼阶段
  PRE_LITIGATION = 'PRE_LITIGATION',         // 诉讼前准备
  LITIGATION_FILED = 'LITIGATION_FILED',     // 已立案
  LITIGATION_ACTIVE = 'LITIGATION_ACTIVE',   // 诉讼进行中
  JUDGMENT = 'JUDGMENT',                     // 已判决
  EXECUTION = 'EXECUTION',                   // 执行阶段
  
  // 结案阶段
  SETTLED = 'SETTLED',                       // 已和解
  COMPLETED = 'COMPLETED'                    // 已完成
}

// 调解结果
export enum MediationResult {
  AGREEMENT = 'AGREEMENT',           // 达成协议
  PARTIAL_AGREEMENT = 'PARTIAL_AGREEMENT', // 部分协议
  FAILED = 'FAILED',                 // 调解失败
  CANCELLED = 'CANCELLED'            // 调解取消
}

// 诉讼结果
export enum LitigationResult {
  PLAINTIFF_WIN = 'PLAINTIFF_WIN',   // 原告胜诉
  DEFENDANT_WIN = 'DEFENDANT_WIN',   // 被告胜诉
  SETTLEMENT = 'SETTLEMENT',         // 庭审和解
  APPEAL = 'APPEAL',                 // 上诉
  WITHDRAWN = 'WITHDRAWN'            // 撤诉
}

// 执行结果
export enum ExecutionResult {
  FULL_EXECUTION = 'FULL_EXECUTION',     // 完全执行
  PARTIAL_EXECUTION = 'PARTIAL_EXECUTION', // 部分执行
  NO_ASSETS = 'NO_ASSETS',               // 无财产可执行
  SUSPENDED = 'SUSPENDED',               // 暂停执行
  TERMINATED = 'TERMINATED'              // 终结执行
}

// 处置机构类型
export enum DisposalOrgType {
  MEDIATION_CENTER = 'MEDIATION_CENTER', // 调解中心
  ARBITRATION = 'ARBITRATION',           // 仲裁委员会
  LAW_FIRM = 'LAW_FIRM',                 // 律师事务所
  LEGAL_SERVICE = 'LEGAL_SERVICE',       // 法务公司
  COLLECTION_AGENCY = 'COLLECTION_AGENCY' // 催收公司
}

// 调解信息
export interface MediationInfo {
  id?: string;
  caseId: string;
  mediatorName: string;          // 调解员姓名
  mediatorPhone?: string;        // 调解员电话
  mediationCenter: string;       // 调解中心名称
  mediationCenterId: string;     // 调解中心ID
  scheduledDate?: string;        // 预定调解时间
  actualDate?: string;           // 实际调解时间
  location?: string;             // 调解地点
  mediationResult?: MediationResult; // 调解结果
  agreementAmount?: number;      // 协议金额
  agreementTerms?: string;       // 协议条款
  paymentPlan?: PaymentPlan[];   // 还款计划
  notes?: string;                // 备注
  documents?: string[];          // 相关文档
  createdAt: string;
  updatedAt: string;
}

// 诉讼信息
export interface LitigationInfo {
  id?: string;
  caseId: string;
  court: string;                 // 法院名称
  courtLevel: 'BASIC' | 'INTERMEDIATE' | 'HIGH' | 'SUPREME'; // 法院级别
  caseNumber?: string;           // 案号
  lawyer: string;                // 承办律师
  lawyerPhone?: string;          // 律师电话
  lawFirm: string;               // 律师事务所
  lawFirmId: string;             // 律师事务所ID
  filingDate?: string;           // 立案日期
  hearingDate?: string;          // 开庭日期
  judgmentDate?: string;         // 判决日期
  judgmentAmount?: number;       // 判决金额
  judgmentResult?: LitigationResult; // 判决结果
  executionApplication?: ExecutionInfo; // 执行申请信息
  appealInfo?: AppealInfo;       // 上诉信息
  costs?: LitigationCosts;       // 诉讼费用
  notes?: string;                // 备注
  documents?: string[];          // 相关文档
  createdAt: string;
  updatedAt: string;
}

// 执行信息
export interface ExecutionInfo {
  applicationDate: string;       // 申请执行日期
  executionCourt: string;        // 执行法院
  executionJudge?: string;       // 执行法官
  assetInvestigation?: boolean;  // 是否进行财产调查
  assetSeizure?: AssetSeizureInfo[]; // 财产查封信息
  executionResult?: ExecutionResult; // 执行结果
  executionAmount?: number;      // 执行金额
  notes?: string;
}

// 上诉信息
export interface AppealInfo {
  appealDate: string;            // 上诉日期
  appealCourt: string;           // 上诉法院
  appealReason: string;          // 上诉理由
  appealResult?: LitigationResult; // 上诉结果
  finalJudgmentDate?: string;    // 终审判决日期
}

// 诉讼费用
export interface LitigationCosts {
  filingFee?: number;            // 案件受理费
  lawyerFee?: number;            // 律师费
  preservationFee?: number;      // 保全费
  executionFee?: number;         // 执行费
  otherFees?: number;            // 其他费用
  totalCosts?: number;           // 总费用
}

// 财产查封信息
export interface AssetSeizureInfo {
  assetType: 'BANK_ACCOUNT' | 'REAL_ESTATE' | 'VEHICLE' | 'OTHER'; // 财产类型
  description: string;           // 财产描述
  value?: number;                // 财产价值
  seizureDate: string;           // 查封日期
  status: 'SEIZED' | 'UNFROZEN' | 'DISPOSED'; // 查封状态
}

// 还款计划
export interface PaymentPlan {
  installmentNumber: number;     // 期数
  dueDate: string;              // 到期日期
  amount: number;               // 应还金额
  paidAmount?: number;          // 已还金额
  paidDate?: string;            // 实际还款日期
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL'; // 还款状态
}

// 案件处置信息（扩展现有Case接口）
export interface CaseDisposalInfo {
  id: string;
  caseNo: string;
  disposalMethod: DisposalMethod;  // 处置方式
  currentPhase: DisposalPhase;     // 当前阶段
  disposalOrgId: string;           // 处置机构ID
  disposalOrgType: DisposalOrgType; // 处置机构类型
  assignedDate: string;            // 分配日期
  expectedCompletionDate?: string; // 预期完成日期
  actualCompletionDate?: string;   // 实际完成日期
  disposalAmount?: number;         // 处置金额（最终收回金额）
  mediationInfo?: MediationInfo;   // 调解信息
  litigationInfo?: LitigationInfo; // 诉讼信息
  notes?: string;                  // 备注
  createdAt: string;
  updatedAt: string;
}

// 处置方式配置
export interface DisposalMethodConfig {
  method: DisposalMethod;
  name: string;
  description: string;
  icon: string;
  color: string;
  avgDuration: number;            // 平均处置时长（天）
  avgCost: number;               // 平均处置成本
  successRate: number;           // 成功率
  applicableAmountRange: {       // 适用金额范围
    min: number;
    max: number;
  };
  requiredDocuments: string[];   // 必需文档
  workflow: DisposalPhase[];     // 工作流阶段
}

// 处置策略推荐
export interface DisposalRecommendation {
  caseId: string;
  recommendedMethod: DisposalMethod;
  confidence: number;            // 推荐置信度 (0-1)
  reasons: string[];             // 推荐理由
  alternatives: {
    method: DisposalMethod;
    score: number;
    pros: string[];
    cons: string[];
  }[];
  estimatedOutcome: {
    successProbability: number;
    expectedDuration: number;
    expectedCost: number;
    expectedRecoveryAmount: number;
  };
}

// 处置效果统计
export interface DisposalEffectiveness {
  method: DisposalMethod;
  totalCases: number;
  successfulCases: number;
  successRate: number;
  avgDuration: number;
  avgCost: number;
  avgRecoveryRate: number;
  totalRecoveryAmount: number;
  timeRanges: {
    period: string;
    caseCount: number;
    successRate: number;
  }[];
}