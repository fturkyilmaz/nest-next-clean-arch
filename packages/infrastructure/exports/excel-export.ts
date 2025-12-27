import * as ExcelJS from 'exceljs';

export interface ExcelExportOptions {
  filename?: string;
  sheetName?: string;
  hasHeader?: boolean;
}

export class ExcelExporter {
  static async exportData(
    data: Record<string, any>[],
    options: ExcelExportOptions = {},
  ): Promise<Buffer> {
    const { filename = 'report.xlsx', sheetName = 'Report', hasHeader = true } = options;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    try {
      if (data.length === 0) {
        return Buffer.from('');
      }

      // Set columns based on first item keys
      const keys = Object.keys(data[0]);
      worksheet.columns = keys.map((key) => ({
        header: hasHeader ? this.formatHeader(key) : key,
        key,
        width: 15,
      }));

      // Style header row
      if (hasHeader) {
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD3D3D3' },
        };
      }

      // Add data rows
      data.forEach((row) => {
        worksheet.addRow(row);
      });

      // Auto-fit columns
      worksheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell?.({ includeEmpty: true }, (cell) => {
          const cellLength = cell.value?.toString().length || 0;
          maxLength = Math.max(maxLength, cellLength);
        });
        column.width = Math.min(maxLength + 2, 50);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    } catch (error) {
      throw new Error(`Failed to export Excel: ${error.message}`);
    }
  }

  static async exportJSON(data: Record<string, any>, options: ExcelExportOptions = {}): Promise<Buffer> {
    const { sheetName = 'Report' } = options;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    try {
      let rowIndex = 1;

      const addObject = (obj: Record<string, any>, indent = 0) => {
        Object.entries(obj).forEach(([key, value]) => {
          const indentation = '  '.repeat(indent);
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            worksheet.getCell(`A${rowIndex}`).value = `${indentation}${key}:`;
            rowIndex++;
            addObject(value, indent + 1);
          } else if (Array.isArray(value)) {
            worksheet.getCell(`A${rowIndex}`).value = `${indentation}${key}: [Array]`;
            rowIndex++;
          } else {
            worksheet.getCell(`A${rowIndex}`).value = `${indentation}${key}: ${value}`;
            rowIndex++;
          }
        });
      };

      addObject(data);
      worksheet.columns = [{ width: 50 }];

      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    } catch (error) {
      throw new Error(`Failed to export Excel from JSON: ${error.message}`);
    }
  }

  private static formatHeader(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }
}
