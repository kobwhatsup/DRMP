// Mock service stub - replaced with direct API calls
export const mockCaseService = {
  getCases: async () => ({ content: [], total: 0 }),
  getCaseById: async () => null,
  createCase: async () => null,
  updateCase: async () => null,
  deleteCase: async () => null,
  batchImportCases: async () => null,
  exportCases: async () => null,
  getCaseStatistics: async () => null,
};