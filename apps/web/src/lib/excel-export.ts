/**
 * Excel Export Library
 * Provides utilities for exporting data to Excel format
 */

import ExcelJS from 'exceljs';

interface ExportOptions {
  fileName: string;
  sheetName?: string;
  title?: string;
  subtitle?: string;
  includeDate?: boolean;
}

/**
 * Export table data to Excel with formatting
 */
export async function exportTableToExcel(
  data: any[],
  options: ExportOptions
): Promise<void> {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(options.sheetName || 'Data');

  // Add title if provided
  if (options.title) {
    const titleRow = worksheet.addRow([options.title]);
    titleRow.font = { bold: true, size: 14, color: { argb: 'FF1F4E78' } };
    worksheet.mergeCells(`A1:${String.fromCharCode(64 + Object.keys(data[0]).length)}1`);
  }

  // Add subtitle if provided
  if (options.subtitle) {
    const subtitleRow = worksheet.addRow([options.subtitle]);
    subtitleRow.font = { italic: true, size: 11 };
  }

  // Add date if requested
  if (options.includeDate) {
    const dateRow = worksheet.addRow([`Generated: ${new Date().toLocaleString()}`]);
    dateRow.font = { size: 10, color: { argb: 'FF595959' } };
  }

  // Add empty row
  if (options.title || options.subtitle || options.includeDate) {
    worksheet.addRow([]);
  }

  // Add headers
  const headers = Object.keys(data[0]);
  const headerRow = worksheet.addRow(headers);

  // Style header row
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };

  // Add data rows with alternating background
  data.forEach((item, index) => {
    const row = worksheet.addRow(Object.values(item));
    
    // Alternating row colors
    if (index % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' },
      };
    }
    
    row.alignment = { horizontal: 'left', vertical: 'center', wrapText: true };
  });

  // Auto-fit columns
  worksheet.columns.forEach((col) => {
    let maxLength = 12;
    col.eachCell({ includeEmpty: true }, (cell) => {
      const cellLength = cell.value ? String(cell.value).length : 0;
      if (cellLength > maxLength) {
        maxLength = cellLength;
      }
    });
    col.width = Math.min(maxLength + 2, 50);
  });

  // Freeze header row
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  // Generate and download file
  const buffer = await workbook.xlsx.writeBuffer();
  downloadFile(buffer, `${options.fileName}.xlsx`);
}

/**
 * Export nutrition report to Excel with multiple sheets
 */
export async function exportNutritionReport(
  clientName: string,
  metrics: any[],
  summaryData?: any
): Promise<void> {
  const workbook = new ExcelJS.Workbook();

  // Sheet 1: Summary
  const summarySheet = workbook.addWorksheet('Summary');
  
  summarySheet.addRow(['Nutrition Report']);
  const titleRow = summarySheet.getRow(1);
  titleRow.font = { bold: true, size: 14, color: { argb: 'FF1F4E78' } };
  
  summarySheet.addRow(['Client:', clientName]);
  summarySheet.addRow(['Generated:', new Date().toLocaleString()]);
  
  if (summaryData) {
    summarySheet.addRow([]);
    Object.entries(summaryData).forEach(([key, value]) => {
      summarySheet.addRow([key, value]);
    });
  }

  summarySheet.columns = [{ width: 20 }, { width: 30 }];

  // Sheet 2: Detailed Metrics
  if (metrics && metrics.length > 0) {
    const metricsSheet = workbook.addWorksheet('Metrics');
    
    const headers = Object.keys(metrics[0]);
    const headerRow = metricsSheet.addRow(headers);
    
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' },
    };

    metrics.forEach((metric, index) => {
      const row = metricsSheet.addRow(Object.values(metric));
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' },
        };
      }
    });

    metricsSheet.columns.forEach((col) => {
      col.width = 18;
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  downloadFile(buffer, `nutrition-report-${clientName}-${Date.now()}.xlsx`);
}

/**
 * Export client progress report to Excel
 */
export async function exportClientProgressReport(
  clientData: any
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Progress Report');

  // Header
  worksheet.addRow(['Client Progress Report']);
  worksheet.addRow(['Client:', clientData.name || 'N/A']);
  worksheet.addRow(['Period:', `${clientData.startDate || 'N/A'} to ${clientData.endDate || 'N/A'}`]);
  worksheet.addRow(['Generated:', new Date().toLocaleString()]);
  worksheet.addRow([]);

  // Progress metrics
  if (clientData.metrics && Array.isArray(clientData.metrics)) {
    worksheet.addRow(['Progress Metrics']);
    const headerRow = worksheet.getRow(worksheet.lastRow.number);
    headerRow.font = { bold: true };
    
    const headers = Object.keys(clientData.metrics[0]);
    const dataHeaderRow = worksheet.addRow(headers);
    dataHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    dataHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    clientData.metrics.forEach((metric: any, index: number) => {
      const row = worksheet.addRow(Object.values(metric));
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' },
        };
      }
    });
  }

  // Notes
  if (clientData.notes) {
    worksheet.addRow([]);
    worksheet.addRow(['Notes']);
    const notesRow = worksheet.getRow(worksheet.lastRow.number);
    notesRow.font = { bold: true };
    
    worksheet.addRow([clientData.notes]);
  }

  worksheet.columns.forEach((col) => {
    col.width = 20;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  downloadFile(buffer, `progress-report-${clientData.name || 'client'}-${Date.now()}.xlsx`);
}

/**
 * Helper function to download file
 */
function downloadFile(buffer: any, fileName: string): void {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Export multiple tables to separate sheets in one workbook
 */
export async function exportMultipleTablesToExcel(
  tables: Array<{ name: string; data: any[] }>,
  fileName: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();

  tables.forEach(({ name, data }) => {
    if (!data || data.length === 0) return;

    const worksheet = workbook.addWorksheet(name);

    // Add headers
    const headers = Object.keys(data[0]);
    const headerRow = worksheet.addRow(headers);

    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    // Add data
    data.forEach((item, index) => {
      const row = worksheet.addRow(Object.values(item));
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' },
        };
      }
    });

    // Auto-fit columns
    worksheet.columns.forEach((col) => {
      let maxLength = 12;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const cellLength = cell.value ? String(cell.value).length : 0;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });
      col.width = Math.min(maxLength + 2, 50);
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  downloadFile(buffer, `${fileName}.xlsx`);
}
