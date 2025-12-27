import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  filename?: string;
  title?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
}

export class PDFExporter {
  static async exportHTML(html: string, options: PDFExportOptions = {}): Promise<Buffer> {
    const {
      filename = 'report.pdf',
      title = 'Report',
      orientation = 'portrait',
      format = 'a4',
    } = options;

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
    });

    try {
      // Create a temporary container for the HTML
      const container = document.createElement('div');
      container.innerHTML = html;
      container.style.width = orientation === 'portrait' ? '210mm' : '297mm';
      container.style.height = 'auto';
      container.style.padding = '10mm';
      document.body.appendChild(container);

      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // Convert canvas to image
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = orientation === 'portrait' ? 190 : 277;
      const pageHeight = orientation === 'portrait' ? 277 : 190;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add title if provided
      if (title) {
        pdf.setFontSize(16);
        pdf.text(title, 10, 10);
        position = 20;
        heightLeft -= 10;
      }

      // Add images to PDF
      while (heightLeft >= 0) {
        const sourceY = heightLeft - imgHeight;
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        position = heightLeft > 0 ? 0 : pageHeight - heightLeft - 10;

        if (heightLeft > 0) {
          pdf.addPage();
        }
      }

      // Clean up
      document.body.removeChild(container);

      return Buffer.from(pdf.output('arraybuffer'));
    } catch (error) {
      throw new Error(`Failed to export PDF: ${error.message}`);
    }
  }

  static async exportJSON(data: Record<string, any>, options: PDFExportOptions = {}): Promise<Buffer> {
    const { title = 'Report' } = options;

    const pdf = new jsPDF();
    let yPosition = 20;

    // Add title
    pdf.setFontSize(16);
    pdf.text(title, 20, yPosition);
    yPosition += 15;

    // Add content
    pdf.setFontSize(11);
    const jsonString = JSON.stringify(data, null, 2);
    const lines = pdf.splitTextToSize(jsonString, 170);

    lines.forEach((line: string) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(line, 20, yPosition);
      yPosition += 5;
    });

    return Buffer.from(pdf.output('arraybuffer'));
  }
}
