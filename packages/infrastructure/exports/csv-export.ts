import Papa from 'papaparse';

export interface CSVExportOptions {
  filename?: string;
  includeHeader?: boolean;
  delimiter?: string;
}

export class CSVExporter {
  static exportData(data: Record<string, any>[], options: CSVExportOptions = {}): Buffer {
    const { filename = 'report.csv', includeHeader = true, delimiter = ',' } = options;

    try {
      const csv = Papa.unparse(data, {
        header: includeHeader,
        delimiter,
        newline: '\n',
        quotes: true,
        quoteChar: '"',
        escapeChar: '"',
        skipEmptyLines: false,
      });

      return Buffer.from(csv, 'utf8');
    } catch (error) {
      throw new Error(`Failed to export CSV: ${error.message}`);
    }
  }

  static exportJSON(data: Record<string, any>, options: CSVExportOptions = {}): Buffer {
    const { delimiter = ',' } = options;

    try {
      // Flatten nested objects
      const flattened = this.flattenObject(data);
      const csv = Papa.unparse([flattened], {
        header: true,
        delimiter,
        newline: '\n',
        quotes: true,
      });

      return Buffer.from(csv, 'utf8');
    } catch (error) {
      throw new Error(`Failed to export CSV from JSON: ${error.message}`);
    }
  }

  private static flattenObject(obj: Record<string, any>, prefix = ''): Record<string, any> {
    const flattened: Record<string, any> = {};

    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(flattened, this.flattenObject(value, newKey));
      } else if (Array.isArray(value)) {
        flattened[newKey] = JSON.stringify(value);
      } else {
        flattened[newKey] = value;
      }
    });

    return flattened;
  }
}
