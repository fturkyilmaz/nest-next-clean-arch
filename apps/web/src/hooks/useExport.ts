/**
 * useExport Hook
 * Provides export functionality for various data formats
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  exportTableToExcel,
  exportNutritionReport,
  exportClientProgressReport,
  exportMultipleTablesToExcel,
} from '@/lib/excel-export';
import {
  exportToCSV,
  exportReportToCSV,
  exportMultipleTablesToCSV,
  exportTableWithMapping,
} from '@/lib/csv-export';
import { generatePDF, embedChartImage } from '@/lib/pdf-export';

type ExportFormat = 'pdf' | 'excel' | 'csv';

interface UseExportOptions {
  defaultFileName?: string;
  onSuccess?: (format: ExportFormat) => void;
  onError?: (error: Error, format: ExportFormat) => void;
}

/**
 * Hook for handling data exports in multiple formats
 */
export function useExport(options: UseExportOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { defaultFileName = 'export', onSuccess, onError } = options;

  /**
   * Export table data in specified format
   */
  const exportTable = useCallback(
    async (
      data: any[],
      fileName: string = defaultFileName,
      format: ExportFormat = 'excel'
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        switch (format) {
          case 'excel':
            await exportTableToExcel(data, {
              fileName,
              sheetName: 'Data',
              title: fileName,
              includeDate: true,
            });
            break;

          case 'csv':
            exportToCSV(data, {
              fileName,
              includeDate: true,
            });
            break;

          case 'pdf':
          default:
            toast.info('PDF export for tables coming soon');
            break;
        }

        onSuccess?.(format);
        toast.success(`Exported as ${format.toUpperCase()}`);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Export failed');
        setError(error);
        onError?.(error, format);
        toast.error(`Failed to export: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [defaultFileName, onSuccess, onError]
  );

  /**
   * Export nutrition report
   */
  const exportNutrition = useCallback(
    async (
      clientName: string,
      metrics: any[],
      summaryData?: any,
      format: ExportFormat = 'excel'
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        switch (format) {
          case 'excel':
            await exportNutritionReport(clientName, metrics, summaryData);
            break;

          case 'csv':
            exportReportToCSV(
              {
                title: 'Nutrition Report',
                clientName,
                metrics,
                ...summaryData,
              },
              `nutrition-report-${clientName}`
            );
            break;

          case 'pdf':
          default:
            toast.info('PDF nutrition report coming soon');
            break;
        }

        onSuccess?.(format);
        toast.success(`Nutrition report exported as ${format.toUpperCase()}`);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Export failed');
        setError(error);
        onError?.(error, format);
        toast.error(`Failed to export nutrition report: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError]
  );

  /**
   * Export client progress report
   */
  const exportProgress = useCallback(
    async (
      clientData: any,
      format: ExportFormat = 'excel'
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const fileName = `progress-report-${clientData.name || 'client'}`;

        switch (format) {
          case 'excel':
            await exportClientProgressReport(clientData);
            break;

          case 'csv':
            exportReportToCSV(clientData, fileName);
            break;

          case 'pdf':
          default:
            toast.info('PDF progress report coming soon');
            break;
        }

        onSuccess?.(format);
        toast.success(`Progress report exported as ${format.toUpperCase()}`);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Export failed');
        setError(error);
        onError?.(error, format);
        toast.error(`Failed to export progress report: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError]
  );

  /**
   * Export multiple tables
   */
  const exportMultiple = useCallback(
    async (
      tables: Array<{ name: string; data: any[] }>,
      fileName: string = defaultFileName,
      format: ExportFormat = 'excel'
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        switch (format) {
          case 'excel':
            await exportMultipleTablesToExcel(tables, fileName);
            break;

          case 'csv':
            exportMultipleTablesToCSV(tables, fileName);
            break;

          case 'pdf':
          default:
            toast.info('PDF multi-table export coming soon');
            break;
        }

        onSuccess?.(format);
        toast.success(`Data exported as ${format.toUpperCase()}`);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Export failed');
        setError(error);
        onError?.(error, format);
        toast.error(`Failed to export data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [defaultFileName, onSuccess, onError]
  );

  /**
   * Export with custom column mapping
   */
  const exportWithMapping = useCallback(
    async (
      data: any[],
      columnMapping: Record<string, string>,
      fileName: string = defaultFileName,
      format: ExportFormat = 'excel'
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        switch (format) {
          case 'excel':
            await exportTableToExcel(data, {
              fileName,
              title: fileName,
              includeDate: true,
            });
            break;

          case 'csv':
            exportTableWithMapping(data, columnMapping, fileName, {
              includeDate: true,
            });
            break;

          case 'pdf':
          default:
            toast.info('PDF custom export coming soon');
            break;
        }

        onSuccess?.(format);
        toast.success(`Data exported as ${format.toUpperCase()}`);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Export failed');
        setError(error);
        onError?.(error, format);
        toast.error(`Failed to export data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [defaultFileName, onSuccess, onError]
  );

  return {
    isLoading,
    error,
    exportTable,
    exportNutrition,
    exportProgress,
    exportMultiple,
    exportWithMapping,
  };
}

export default useExport;
