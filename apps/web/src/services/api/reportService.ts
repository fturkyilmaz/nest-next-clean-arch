/**
 * Report Service
 * Handles API calls for report management
 */

import { api } from '@/lib/axios-instance';

export interface CreateReportRequest {
  title: string;
  type: 'NUTRITION' | 'PROGRESS' | 'MEAL_PLAN' | 'ACTIVITY' | 'CUSTOM';
  format: 'PDF' | 'EXCEL' | 'CSV';
  clientId?: string;
  data: any;
}

export interface ReportResponse {
  id: string;
  title: string;
  type: string;
  format: string;
  data: any;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  clientId?: string;
}

export interface ReportListResponse {
  data: ReportResponse[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Create a new report
 */
export async function createReport(request: CreateReportRequest): Promise<ReportResponse> {
  const response = await api.post<ReportResponse>('/reports', request);
  return response.data;
}

/**
 * Get all reports with pagination and filtering
 */
export async function getReports(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    type?: string;
    clientId?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<ReportListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (filters?.type) params.append('type', filters.type);
  if (filters?.clientId) params.append('clientId', filters.clientId);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const response = await api.get<ReportListResponse>(`/reports?${params}`);
  return response.data;
}

/**
 * Get report by ID
 */
export async function getReportById(id: string): Promise<ReportResponse> {
  const response = await api.get<ReportResponse>(`/reports/${id}`);
  return response.data;
}

/**
 * Download report file
 */
export async function downloadReport(
  id: string,
  format?: 'PDF' | 'EXCEL' | 'CSV'
): Promise<Blob> {
  const response = await api.get(`/reports/${id}/download`, {
    params: format ? { format } : undefined,
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Delete report
 */
export async function deleteReport(id: string): Promise<void> {
  await api.delete(`/reports/${id}`);
}

/**
 * Regenerate report
 */
export async function regenerateReport(
  id: string,
  format?: 'PDF' | 'EXCEL' | 'CSV'
): Promise<ReportResponse> {
  const response = await api.post<ReportResponse>(`/reports/${id}/regenerate`, {
    format,
  });
  return response.data;
}

/**
 * Get report statistics
 */
export async function getReportStats(): Promise<{
  totalReports: number;
  reportsThisMonth: number;
  reportsThisWeek: number;
  byType: Record<string, number>;
}> {
  const response = await api.get('/reports/stats');
  return response.data;
}

/**
 * Generate and export nutrition report
 */
export async function generateNutritionReport(
  clientId: string,
  dateRange: {
    startDate: string;
    endDate: string;
  },
  format: 'PDF' | 'EXCEL' | 'CSV' = 'PDF'
): Promise<ReportResponse> {
  const response = await api.post<ReportResponse>('/reports/nutrition', {
    clientId,
    dateRange,
    format,
  });
  return response.data;
}

/**
 * Generate and export client progress report
 */
export async function generateProgressReport(
  clientId: string,
  format: 'PDF' | 'EXCEL' | 'CSV' = 'PDF'
): Promise<ReportResponse> {
  const response = await api.post<ReportResponse>('/reports/progress', {
    clientId,
    format,
  });
  return response.data;
}

/**
 * Generate and export meal plan report
 */
export async function generateMealPlanReport(
  dietPlanId: string,
  format: 'PDF' | 'EXCEL' | 'CSV' = 'PDF'
): Promise<ReportResponse> {
  const response = await api.post<ReportResponse>('/reports/meal-plan', {
    dietPlanId,
    format,
  });
  return response.data;
}

/**
 * Export reports as file
 */
export async function exportReportsAsFile(
  reportIds: string[],
  format: 'EXCEL' | 'CSV' = 'EXCEL'
): Promise<Blob> {
  const response = await api.post(
    '/reports/export',
    { reportIds, format },
    { responseType: 'blob' }
  );
  return response.data;
}
