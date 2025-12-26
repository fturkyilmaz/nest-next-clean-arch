/**
 * CSV Export Library
 * Provides utilities for exporting data to CSV format
 */

interface CSVExportOptions {
  fileName: string;
  includeDate?: boolean;
  delimiter?: string;
  newLine?: string;
}

/**
 * Export table data to CSV format
 */
export function exportToCSV(data: any[], options: CSVExportOptions): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const { fileName, includeDate = true, delimiter = ',', newLine = '\r\n' } = options;

  let csvContent = '';

  // Add date header if requested
  if (includeDate) {
    csvContent += `# Generated: ${new Date().toLocaleString()}${newLine}${newLine}`;
  }

  // Extract headers
  const headers = Object.keys(data[0]);
  csvContent += headers.map(escapeCSVField).join(delimiter) + newLine;

  // Add data rows
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header];
      return escapeCSVField(value);
    });
    csvContent += values.join(delimiter) + newLine;
  });

  downloadCSV(csvContent, `${fileName}.csv`);
}

/**
 * Export report data to CSV with summary header
 */
export function exportReportToCSV(
  reportData: any,
  fileName: string,
  options?: Partial<CSVExportOptions>
): void {
  const { delimiter = ',', newLine = '\r\n' } = options || {};
  let csvContent = '';

  // Add report header
  if (reportData.title) {
    csvContent += `${reportData.title}${newLine}`;
  }

  if (reportData.clientName) {
    csvContent += `Client,${reportData.clientName}${newLine}`;
  }

  if (reportData.period) {
    csvContent += `Period,${reportData.period}${newLine}`;
  }

  if (reportData.generatedDate) {
    csvContent += `Generated,${new Date(reportData.generatedDate).toLocaleString()}${newLine}`;
  }

  csvContent += newLine; // Empty line separator

  // Add metrics data
  if (reportData.metrics && Array.isArray(reportData.metrics) && reportData.metrics.length > 0) {
    const headers = Object.keys(reportData.metrics[0]);
    csvContent += headers.map(escapeCSVField).join(delimiter) + newLine;

    reportData.metrics.forEach((row: any) => {
      const values = headers.map((header) => escapeCSVField(row[header]));
      csvContent += values.join(delimiter) + newLine;
    });
  }

  downloadCSV(csvContent, `${fileName}.csv`);
}

/**
 * Export multiple data sets to single CSV with headers
 */
export function exportMultipleTablesToCSV(
  tables: Array<{ title: string; data: any[] }>,
  fileName: string,
  options?: Partial<CSVExportOptions>
): void {
  const { delimiter = ',', newLine = '\r\n' } = options || {};
  let csvContent = `# Generated: ${new Date().toLocaleString()}${newLine}${newLine}`;

  tables.forEach((table, tableIndex) => {
    if (!table.data || table.data.length === 0) return;

    // Add table title
    csvContent += `${table.title}${newLine}`;

    // Add headers
    const headers = Object.keys(table.data[0]);
    csvContent += headers.map(escapeCSVField).join(delimiter) + newLine;

    // Add rows
    table.data.forEach((row) => {
      const values = headers.map((header) => escapeCSVField(row[header]));
      csvContent += values.join(delimiter) + newLine;
    });

    // Add separator between tables
    if (tableIndex < tables.length - 1) {
      csvContent += newLine + newLine;
    }
  });

  downloadCSV(csvContent, `${fileName}.csv`);
}

/**
 * Export flat object data to CSV (useful for single row exports)
 */
export function exportObjectToCSV(
  obj: Record<string, any>,
  fileName: string,
  options?: Partial<CSVExportOptions>
): void {
  const { delimiter = ',', newLine = '\r\n' } = options || {};
  
  let csvContent = '';

  // Add date if requested
  if (options?.includeDate !== false) {
    csvContent += `# Generated: ${new Date().toLocaleString()}${newLine}${newLine}`;
  }

  // Add data as key-value pairs
  Object.entries(obj).forEach(([key, value]) => {
    csvContent += `${escapeCSVField(key)}${delimiter}${escapeCSVField(value)}${newLine}`;
  });

  downloadCSV(csvContent, `${fileName}.csv`);
}

/**
 * Export table with custom column mapping
 */
export function exportTableWithMapping(
  data: any[],
  columnMapping: Record<string, string>,
  fileName: string,
  options?: Partial<CSVExportOptions>
): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const { delimiter = ',', newLine = '\r\n', includeDate = true } = options || {};
  let csvContent = '';

  if (includeDate) {
    csvContent += `# Generated: ${new Date().toLocaleString()}${newLine}${newLine}`;
  }

  // Add mapped headers
  const headers = Object.keys(columnMapping);
  const mappedHeaders = headers.map((h) => columnMapping[h] || h);
  csvContent += mappedHeaders.map(escapeCSVField).join(delimiter) + newLine;

  // Add mapped data
  data.forEach((row) => {
    const values = headers.map((header) => {
      const dataKey = Object.keys(row).find((key) => key === header);
      const value = dataKey ? row[dataKey] : '';
      return escapeCSVField(value);
    });
    csvContent += values.join(delimiter) + newLine;
  });

  downloadCSV(csvContent, `${fileName}.csv`);
}

/**
 * Escape special characters in CSV fields
 */
function escapeCSVField(field: any): string {
  if (field === null || field === undefined) {
    return '';
  }

  const stringField = String(field);

  // If field contains comma, newline, or double quotes, wrap in quotes and escape quotes
  if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }

  return stringField;
}

/**
 * Helper function to download CSV file
 */
function downloadCSV(content: string, fileName: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
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
 * Copy CSV content to clipboard instead of downloading
 */
export function copyCSVToClipboard(data: any[], delimiter = ','): void {
  if (!data || data.length === 0) {
    console.warn('No data to copy');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(delimiter),
    ...data.map((row) => headers.map((h) => escapeCSVField(row[h])).join(delimiter)),
  ].join('\n');

  navigator.clipboard.writeText(csvContent).then(
    () => {
      console.log('CSV copied to clipboard');
    },
    (err) => {
      console.error('Failed to copy CSV:', err);
    }
  );
}
