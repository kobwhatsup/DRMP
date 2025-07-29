// Organization Types for DRMP Frontend

export interface Organization {
  id: number;
  orgCode: string;
  orgName: string;
  type: string;
  typeName: string;
  category: 'SOURCE' | 'DISPOSAL';
  status: string;
  statusName: string;
  contactPerson: string;
  contactPhone: string;
  email: string;
  address: string;
  teamSize: number;
  monthlyCaseCapacity: number;
  currentLoadPercentage: number;
  serviceRegions: string[];
  businessScopes: string[];
  disposalTypes?: string[];
  settlementMethods?: string[];
  cooperationCases?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
  approvalAt?: string;
  approvalBy?: string;
  approvalByName?: string;
  approvalRemark?: string;
  membershipFee?: number;
  membershipPaid?: boolean;
  membershipPaidAt?: string;
  registrationType?: string;
  legalRepresentative?: string;
  registeredCapital?: number;
  registrationDate?: string;
  qualificationDocuments?: string;
  bankAccount?: string;
  bankName?: string;
}

export interface OrganizationQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  keyword?: string;
  type?: string;
  status?: string;
  category?: string;
  region?: string;
  startDate?: string;
  endDate?: string;
}

export interface OrganizationCreateRequest {
  orgCode: string;
  orgName: string;
  type: string;
  contactPerson: string;
  contactPhone: string;
  email?: string;
  address?: string;
  businessLicense?: string;
  teamSize?: number;
  monthlyCaseCapacity?: number;
  serviceRegions?: string[];
  businessScopes?: string[];
  disposalTypes?: string[];
  settlementMethods?: string[];
  cooperationCases?: string;
  description?: string;
  registrationType?: string;
  legalRepresentative?: string;
  registeredCapital?: number;
  registrationDate?: string;
  qualificationDocuments?: string;
  bankAccount?: string;
  bankName?: string;
}

export interface OrganizationUpdateRequest {
  orgName?: string;
  contactPerson?: string;
  contactPhone?: string;
  email?: string;
  address?: string;
  businessLicense?: string;
  teamSize?: number;
  monthlyCaseCapacity?: number;
  serviceRegions?: string[];
  businessScopes?: string[];
  disposalTypes?: string[];
  settlementMethods?: string[];
  cooperationCases?: string;
  description?: string;
  legalRepresentative?: string;
  registeredCapital?: number;
  registrationDate?: string;
  qualificationDocuments?: string;
  bankAccount?: string;
  bankName?: string;
}

export interface OrganizationApprovalRequest {
  remark?: string;
  membershipFee?: number;
}

export interface OrganizationStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  todayPending: number;
  weekApproved: number;
  [key: string]: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}