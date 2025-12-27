import * as Papa from 'papaparse';

export interface CSVExportOptions {
  filename?: string;
  delimiter?: string;
  headers?: boolean;
}

export class CSVExporter {
  static exportJSON(
    data: Record<string, any>[],
    options: CSVExportOptions = {},
  ): string {
    const { delimiter = ',', headers = true } = options;

    try {
      const csv = Papa.unparse(data, {
        delimiter,
        header: headers,
      });

      return csv;
    } catch (error) {
      throw new Error(`Failed to export to CSV: ${error.message}`);
    }
  }

  static exportTable(
    headers: string[],
    rows: any[][],
    options: CSVExportOptions = {},
  ): string {
    const { delimiter = ',', headers: includeHeaders = true } = options;

    try {
      let csv = '';

      // Add headers
      if (includeHeaders) {
        csv += headers.join(delimiter) + '\n';
      }

      // Add rows
      rows.forEach((row) => {
        csv += row.map((cell) => this.escapeCSV(cell)).join(delimiter) + '\n';
      });

      return csv;
    } catch (error) {
      throw new Error(`Failed to export table to CSV: ${error.message}`);
    }
  }

  private static escapeCSV(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    const stringValue = String(value);

    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }
}
