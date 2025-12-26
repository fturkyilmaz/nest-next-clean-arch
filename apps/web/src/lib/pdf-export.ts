import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
declare module 'jspdf' {
  interface jsPDF {
    autoTable: any;
  }
}

export interface ReportGenerateOptions {
  title: string;
  subtitle?: string;
  metadata?: Record<string, string>;
  sections: ReportSection[];
  generatedDate?: Date;
}

export interface ReportSection {
  title: string;
  content?: string;
  table?: {
    head: string[];
    body: (string | number)[][];
  };
  imageData?: string; // Base64 encoded image
  pageBreakAfter?: boolean;
}

export async function generatePDF(options: ReportGenerateOptions): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Add title
  doc.setFontSize(24);
  doc.text(options.title, 20, yPosition);
  yPosition += 15;

  // Add subtitle if provided
  if (options.subtitle) {
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text(options.subtitle, 20, yPosition);
    yPosition += 10;
  }

  // Add metadata
  if (options.metadata && Object.keys(options.metadata).length > 0) {
    doc.setFontSize(10);
    doc.setTextColor(50);
    Object.entries(options.metadata).forEach(([key, value]) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`${key}: ${value}`, 20, yPosition);
      yPosition += 5;
    });
    yPosition += 5;
  }

  // Add generated date
  if (options.generatedDate) {
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `Generated: ${options.generatedDate.toLocaleString()}`,
      20,
      yPosition
    );
    yPosition += 8;
  }

  doc.setTextColor(0);

  // Add sections
  for (const section of options.sections) {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }

    // Section title
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(section.title, 20, yPosition);
    yPosition += 10;

    // Section content (paragraph)
    if (section.content) {
      doc.setFont(undefined, 'normal');
      doc.setFontSize(11);
      const textWidth = pageWidth - 40;
      const splitText = doc.splitTextToSize(section.content, textWidth);
      const textHeight = splitText.length * 5;

      if (yPosition + textHeight > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }

      doc.text(splitText, 20, yPosition);
      yPosition += textHeight + 5;
    }

    // Section table
    if (section.table) {
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }

      doc.autoTable({
        startY: yPosition,
        head: [section.table.head],
        body: section.table.body,
        margin: { left: 20, right: 20 },
        theme: 'grid',
        headerStyles: {
          fillColor: [66, 139, 202],
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 10,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });

      yPosition = doc.lastAutoTable.finalY + 10;
    }

    // Section image
    if (section.imageData) {
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = 20;
      }

      const imageHeight = 80;
      const imageWidth = pageWidth - 40;
      doc.addImage(
        section.imageData,
        'PNG',
        20,
        yPosition,
        imageWidth,
        imageHeight
      );
      yPosition += imageHeight + 10;
    }

    // Page break if needed
    if (section.pageBreakAfter && options.sections.indexOf(section) < options.sections.length - 1) {
      doc.addPage();
      yPosition = 20;
    }
  }

  // Save PDF
  const filename = `${options.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

/**
 * Convert a chart element to base64 image for embedding in PDF
 * Uses html2canvas to capture the chart as an image
 */
export async function embedChartImage(
  elementId: string,
  pdf: jsPDF,
  xPos: number = 20,
  yPos: number = 20,
  width: number = 170,
  height: number = 80
): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Element with ID "${elementId}" not found`);
      return;
    }

    // Convert element to canvas image
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imageData = canvas.toDataURL('image/png');
    
    // Add image to PDF
    pdf.addImage(imageData, 'PNG', xPos, yPos, width, height);
  } catch (error) {
    console.error(`Error embedding chart from element "${elementId}":`, error);
  }
}

/**
 * Export chart as standalone image file
 */
export async function exportChartAsImage(
  elementId: string,
  fileName: string = 'chart'
): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${fileName}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting chart:', error);
    throw error;
  }
}

/**
 * Generate a nutrition report
 */
export function generateNutritionReportSections(
  clientName: string,
  dateRange: { start: Date; end: Date },
  nutritionData: any
): ReportSection[] {
  return [
    {
      title: 'Executive Summary',
      content: `Nutrition report for ${clientName} covering the period from ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}. This report provides a comprehensive overview of dietary intake, macronutrient distribution, and progress toward nutritional goals.`,
    },
    {
      title: 'Caloric Intake Analysis',
      table: {
        head: ['Metric', 'Average', 'Target', 'Status'],
        body: [
          ['Daily Calories', '2100 kcal', '2000 kcal', 'Above Target'],
          ['Daily Protein', '70g', '80g', 'Below Target'],
          ['Daily Carbs', '280g', '250g', 'Above Target'],
          ['Daily Fat', '70g', '65g', 'Above Target'],
        ],
      },
      pageBreakAfter: true,
    },
    {
      title: 'Recommendations',
      content: `Based on the analysis, consider the following adjustments:
1. Increase protein intake by 10-15g daily through lean meats or plant-based sources
2. Reduce simple carbohydrates by including more whole grains
3. Maintain fat intake within the recommended range through healthy sources like avocados and nuts
4. Continue with the current meal plan while making the above adjustments`,
    },
  ];
}
