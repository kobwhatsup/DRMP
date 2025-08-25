// Mock service stub - replaced with direct API calls
export const mockCasePackageService = {
  getCasePackageList: async () => ({ content: [], total: 0 }),
  getCasePackageDetail: async () => null,
  createCasePackage: async () => null,
  updateCasePackage: async () => null,
  deleteCasePackage: async () => null,
  publishCasePackage: async () => null,
  assignCasePackage: async () => null,
  acceptCasePackage: async () => null,
  rejectCasePackage: async () => null,
  closeCasePackage: async () => null,
};