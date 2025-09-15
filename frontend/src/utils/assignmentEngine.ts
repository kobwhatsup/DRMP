import type {
  CaseDetail,
  OrganizationProfile,
  AssignmentWeights,
  AssignmentConstraints,
  AssignmentResult,
  CaseAssignmentResult,
  OrgAssignmentStat
} from '@/types/assignment';

export class AssignmentEngine {
  private strategy: string;
  private weights: AssignmentWeights;
  private constraints: AssignmentConstraints;

  constructor(strategy: string, weights: AssignmentWeights, constraints?: AssignmentConstraints) {
    this.strategy = strategy;
    this.weights = weights;
    this.constraints = constraints || {
      maxCasesPerOrg: 100,
      minMatchScore: 60,
      maxLoadRate: 0.9
    };
  }

  // Alias method for compatibility
  assignCases(cases: CaseDetail[], organizations: OrganizationProfile[]): {
    assignments: CaseAssignmentResult[];
    unassignedCases: { caseId: number; caseCode: string; reason: string; suggestion?: string }[];
    orgStats: OrgAssignmentStat[];
  } {
    const result = this.execute(cases, organizations);
    return {
      assignments: result.caseAssignments,
      unassignedCases: result.unassignedCases,
      orgStats: result.orgStats
    };
  }

  execute(cases: CaseDetail[], organizations: OrganizationProfile[]): AssignmentResult {
    const startTime = Date.now();
    const assignments: CaseAssignmentResult[] = [];
    const unassignedCases: { caseId: number; caseCode: string; reason: string; suggestion?: string }[] = [];
    const orgAssignmentCounts = new Map<number, { count: number; amount: number; scores: number[] }>();

    // Initialize org tracking
    organizations.forEach(org => {
      orgAssignmentCounts.set(org.id, { count: 0, amount: 0, scores: [] });
    });

    // Process each case
    for (const caseItem of cases) {
      const eligibleOrgs = this.filterEligibleOrgs(organizations, caseItem, orgAssignmentCounts);
      
      if (eligibleOrgs.length === 0) {
        unassignedCases.push({
          caseId: caseItem.id,
          caseCode: caseItem.caseCode,
          reason: '没有符合条件的处置机构',
          suggestion: '放宽匹配条件或增加处置机构'
        });
        continue;
      }

      // Score and rank organizations
      const scoredOrgs = eligibleOrgs.map(org => ({
        org,
        score: this.calculateMatchScore(caseItem, org),
        reasons: this.getMatchReasons(caseItem, org)
      }));

      // Sort by score descending
      scoredOrgs.sort((a, b) => b.score - a.score);

      // Assign to best match
      const bestMatch = scoredOrgs[0];
      if (bestMatch.score >= this.constraints.minMatchScore) {
        assignments.push({
          caseId: caseItem.id,
          caseCode: caseItem.caseCode,
          orgId: bestMatch.org.id,
          orgName: bestMatch.org.name,
          matchScore: bestMatch.score,
          matchReasons: bestMatch.reasons
        });

        // Update org tracking
        const orgStats = orgAssignmentCounts.get(bestMatch.org.id)!;
        orgStats.count++;
        orgStats.amount += caseItem.remainingAmount;
        orgStats.scores.push(bestMatch.score);
      } else {
        unassignedCases.push({
          caseId: caseItem.id,
          caseCode: caseItem.caseCode,
          reason: `匹配分数过低 (${bestMatch.score.toFixed(2)} < ${this.constraints.minMatchScore})`,
          suggestion: '调整权重或降低最低匹配分数要求'
        });
      }
    }

    // Calculate org statistics
    const orgStats: OrgAssignmentStat[] = Array.from(orgAssignmentCounts.entries())
      .filter(([_, stats]) => stats.count > 0)
      .map(([orgId, stats]) => {
        const org = organizations.find(o => o.id === orgId)!;
        return {
          orgId,
          orgName: org.name,
          assignedCount: stats.count,
          totalAmount: stats.amount,
          avgMatchScore: stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length,
          expectedLoadRate: (org.currentLoad + stats.count) / org.capacity
        };
      });

    const executionTime = Date.now() - startTime;

    return {
      casePackageId: 0, // Will be set by caller
      totalCases: cases.length,
      assignedCases: assignments.length,
      failedCases: unassignedCases.length,
      successRate: (assignments.length / cases.length) * 100,
      avgMatchScore: assignments.length > 0 
        ? assignments.reduce((sum, a) => sum + a.matchScore, 0) / assignments.length 
        : 0,
      unassignedCases,
      caseAssignments: assignments,
      orgStats,
      executionTime,
      timestamp: new Date().toISOString()
    };
  }

  private filterEligibleOrgs(
    organizations: OrganizationProfile[], 
    caseItem: CaseDetail,
    orgAssignmentCounts: Map<number, { count: number; amount: number; scores: number[] }>
  ): OrganizationProfile[] {
    return organizations.filter(org => {
      // Check if org is active
      if (!org.isActive) return false;

      // Check capacity
      const currentAssignments = orgAssignmentCounts.get(org.id)?.count || 0;
      if (currentAssignments >= this.constraints.maxCasesPerOrg) return false;
      if (org.currentLoad >= org.capacity) return false;

      // Check region match if required
      if (this.constraints.requireRegionMatch && org.region !== caseItem.region) {
        return false;
      }

      // Check preferred/excluded orgs
      if (this.constraints.excludedOrgIds?.includes(org.id)) return false;

      return true;
    });
  }

  private calculateMatchScore(caseItem: CaseDetail, org: OrganizationProfile): number {
    let score = 0;
    const weights = this.weights;

    // Region match score
    if (caseItem.region === org.region) {
      score += weights.regionWeight;
    }

    // Load score (higher available capacity = better)
    const capacityUtilization = org.currentLoad / org.capacity;
    score += weights.loadWeight * (1 - capacityUtilization);

    // Performance score
    const performanceScore = (org.successRate / 100) * 0.4 + 
                           (org.avgRecoveryRate / 100) * 0.4 + 
                           (1 - org.avgDisposalDays / 180) * 0.2;
    score += weights.performanceWeight * performanceScore;

    // Specialty match score
    const hasSpecialty = org.specialties.some(s => 
      s.includes(caseItem.productType) || 
      (caseItem.overdueDays > 180 && s.includes('长账龄'))
    );
    if (hasSpecialty) {
      score += weights.specialtyWeight;
    }

    // Normalize to 0-100
    const maxPossibleScore = Object.values(weights).reduce((a, b) => a + b, 0);
    return Math.min(100, (score / maxPossibleScore) * 100);
  }

  private getMatchReasons(caseItem: CaseDetail, org: OrganizationProfile): string[] {
    const reasons: string[] = [];

    if (caseItem.region === org.region) {
      reasons.push('地域匹配');
    }

    if (org.successRate > 80) {
      reasons.push('高成功率');
    }

    if (org.avgRecoveryRate > 30) {
      reasons.push('回收率优秀');
    }

    const hasSpecialty = org.specialties.some(s => 
      s.includes(caseItem.productType) || 
      (caseItem.overdueDays > 180 && s.includes('长账龄'))
    );
    if (hasSpecialty) {
      reasons.push('专业匹配');
    }

    const capacityUtilization = org.currentLoad / org.capacity;
    if (capacityUtilization < 0.7) {
      reasons.push('处理能力充足');
    }

    return reasons;
  }
}