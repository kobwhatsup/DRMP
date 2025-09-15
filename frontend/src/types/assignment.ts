export enum AssignmentStrategy {
  COMPREHENSIVE = 'COMPREHENSIVE',
  REGION_PRIORITY = 'REGION_PRIORITY',
  PERFORMANCE_PRIORITY = 'PERFORMANCE_PRIORITY',
  LOAD_BALANCE = 'LOAD_BALANCE',
  CUSTOM = 'CUSTOM',
  // Aliases for compatibility
  REGION_BASED = 'REGION_PRIORITY',
  PERFORMANCE_BASED = 'PERFORMANCE_PRIORITY',
  SPECIALTY_MATCH = 'COMPREHENSIVE'
}

export interface AssignmentStrategyConfig {
  name: string;
  weight: number;
  enabled: boolean;
}

export interface CaseDetail {
  id: number;
  caseCode: string;
  debtorName: string;
  debtorIdCard: string;
  loanAmount: number;
  remainingAmount: number;
  overdueDays: number;
  region: string;
  productType: string;
  accountAge: number;
  lastPaymentDate?: string;
  phoneNumbers?: string[];
  addresses?: string[];
}

export interface OrganizationProfile {
  id: number;
  name: string;
  type: string;
  region: string;
  capacity: number;
  currentLoad: number;
  successRate: number;
  avgRecoveryRate: number;
  avgDisposalDays: number;
  specialties: string[];
  rating: number;
  isActive: boolean;
}

export interface AssignmentWeights {
  regionWeight: number;
  performanceWeight: number;
  loadWeight: number;
  specialtyWeight: number;
}

export interface AssignmentConstraints {
  maxCasesPerOrg: number;
  minMatchScore: number;
  maxLoadRate: number;
  requireRegionMatch?: boolean;
  preferredOrgIds?: number[];
  excludedOrgIds?: number[];
}

export interface AssignmentRequest {
  casePackageId: number;
  packageId?: number; // alias for compatibility
  strategy: string;
  weights: AssignmentWeights;
  constraints: AssignmentConstraints;
  manualAssignments?: { caseId: number; orgId: number }[];
  preview?: boolean;
}

export interface CaseAssignmentResult {
  caseId: number;
  caseCode: string;
  orgId: number;
  orgName: string;
  matchScore: number;
  matchReasons: string[];
}

export interface OrgAssignmentStat {
  orgId: number;
  orgName: string;
  assignedCount: number;
  totalAmount: number;
  avgMatchScore: number;
  expectedLoadRate?: number;
}

export interface AssignmentResult {
  assignmentId?: string;
  casePackageId: number;
  packageId?: number; // alias for compatibility
  totalCases: number;
  assignedCases: number;
  failedCases: number;
  successRate: number;
  avgMatchScore: number;
  unassignedCases: { caseId: number; caseCode: string; reason: string; suggestion?: string }[];
  caseAssignments: CaseAssignmentResult[];
  orgStats: OrgAssignmentStat[];
  executionTime: number;
  timestamp: string;
  status?: string;
}

export interface OrgRecommendation {
  orgId: number;
  orgName: string;
  score: number;
  reasons: string[];
  pros: string[];
  cons: string[];
}

export interface AssignmentMonitor {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  avgProcessingTime: number;
  currentStatus: 'idle' | 'processing' | 'completed' | 'error';
  lastError?: string;
}