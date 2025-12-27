import * as XLSX from 'xlsx';

export interface ExcelExportOptions {
  filename?: string;
  sheetName?: string;
}

export class ExcelExporter {
  static exportJSON(
    data: Record<string, any>[],
    options: ExcelExportOptions = {},
  ): Buffer {
    const { filename = 'report.xlsx', sheetName = 'Report' } = options;

    try {
      // Convert array of objects to worksheet
      const ws = XLSX.utils.json_to_sheet(data);

      // Set column widths
      const colWidths = Object.keys(data[0] || {}).map(() => 20);
      ws['!cols'] = colWidths.map((width) => ({ wch: width }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      // Generate buffer
      return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    } catch (error) {
      throw new Error(`Failed to export to Excel: ${error.message}`);
    }
  }

  static exportTable(
    headers: string[],
    rows: any[][],
    options: ExcelExportOptions = {},
  ): Buffer {
    const { filename = 'report.xlsx', sheetName = 'Report' } = options;

    try {
      const data = rows.map((row) => {
        const obj: Record<string, any> = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });

      return this.exportJSON(data, options);
    } catch (error) {
      throw new Error(`Failed to export table to Excel: ${error.message}`);
    }
  }

  static exportMultiSheet(
    sheets: Array<{
      name: string;
      data: Record<string, any>[];
    }>,
  ): Buffer {
    try {
      const wb = XLSX.utils.book_new();

      sheets.forEach(({ name, data }) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const colWidths = Object.keys(data[0] || {}).map(() => 20);
        ws['!cols'] = colWidths.map((width) => ({ wch: width }));
        XLSX.utils.book_append_sheet(wb, ws, name);
      });

      return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    } catch (error) {
      throw new Error(`Failed to export to Excel: ${error.message}`);
    }
  }
}
