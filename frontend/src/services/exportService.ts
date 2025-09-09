import { apiService } from './api';

export interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv';
  dateRange?: [string, string];
  filters?: Record<string, any>;
  reportType?: string;
}

export interface ExportRequest {
  type: 'litigation-report' | 'performance-report' | 'financial-report' | 'case-report';
  options: ExportOptions;
  data: any;
}

export const exportService = {
  // Export litigation reports
  async exportLitigationReport(options: ExportOptions): Promise<Blob> {
    const response = await fetch('/api/v1/exports/litigation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(options)
    });
    return response.blob();
  },

  // Export performance reports
  async exportPerformanceReport(options: ExportOptions): Promise<Blob> {
    const response = await fetch('/api/v1/exports/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(options)
    });
    return response.blob();
  },

  // Export financial reports
  async exportFinancialReport(options: ExportOptions): Promise<Blob> {
    const response = await fetch('/api/v1/exports/financial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(options)
    });
    return response.blob();
  },

  // Export case data
  async exportCaseData(options: ExportOptions): Promise<Blob> {
    const response = await fetch('/api/v1/exports/cases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(options)
    });
    return response.blob();
  },

  // Download file
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Generate filename based on type and date
  generateFilename(type: string, format: string): string {
    const date = new Date().toISOString().split('T')[0];
    return `${type}_${date}.${format}`;
  }
};

export default exportService;