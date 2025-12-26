import { generatePDF, generateNutritionReportSections } from '@/lib/pdf-export';
import jsPDF from 'jspdf';

jest.mock('jspdf', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('PDF Export', () => {
  let mockDocInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockDocInstance = {
      internal: {
        pageSize: {
          getWidth: jest.fn().mockReturnValue(210),
          height: 297,
        },
      },
      setFontSize: jest.fn(),
      setTextColor: jest.fn(),
      text: jest.fn(),
      setFont: jest.fn(),
      splitTextToSize: jest.fn().mockReturnValue(['line1', 'line2']),
      addPage: jest.fn(),
      addImage: jest.fn(),
      autoTable: jest.fn(),
      lastAutoTable: { finalY: 100 },
      save: jest.fn(),
    };

    (jsPDF as jest.Mock).mockImplementation(() => mockDocInstance);
  });

  describe('generatePDF', () => {
    it('should create PDF with title', async () => {
      const options = {
        title: 'Test Report',
        sections: [],
      };

      await generatePDF(options);

      expect(jsPDF).toHaveBeenCalled();
      expect(mockDocInstance.setFontSize).toHaveBeenCalled();
      expect(mockDocInstance.text).toHaveBeenCalledWith(
        'Test Report',
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should include subtitle if provided', async () => {
      const options = {
        title: 'Test Report',
        subtitle: 'Test Subtitle',
        sections: [],
      };

      await generatePDF(options);

      expect(mockDocInstance.text).toHaveBeenCalledWith(
        'Test Subtitle',
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should add metadata to PDF', async () => {
      const options = {
        title: 'Test Report',
        metadata: {
          'Client': 'John Doe',
          'Date Range': '2024-01-01 to 2024-12-31',
        },
        sections: [],
      };

      await generatePDF(options);

      expect(mockDocInstance.text).toHaveBeenCalledWith(
        'Client: John Doe',
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should save PDF with correct filename', async () => {
      const options = {
        title: 'Test Report',
        sections: [],
      };

      await generatePDF(options);

      expect(mockDocInstance.save).toHaveBeenCalledWith(
        expect.stringContaining('test-report')
      );
    });

    it('should handle sections with content', async () => {
      const options = {
        title: 'Test Report',
        sections: [
          {
            title: 'Section 1',
            content: 'This is test content for the section',
          },
        ],
      };

      await generatePDF(options);

      expect(mockDocInstance.text).toHaveBeenCalledWith(
        'Section 1',
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should handle sections with tables', async () => {
      const options = {
        title: 'Test Report',
        sections: [
          {
            title: 'Data Table',
            table: {
              head: ['Column 1', 'Column 2'],
              body: [['Value 1', 'Value 2']],
            },
          },
        ],
      };

      await generatePDF(options);

      expect(mockDocInstance.autoTable).toHaveBeenCalled();
    });

    it('should add page break when specified', async () => {
      const options = {
        title: 'Test Report',
        sections: [
          {
            title: 'Section 1',
            content: 'Content 1',
            pageBreakAfter: true,
          },
          {
            title: 'Section 2',
            content: 'Content 2',
          },
        ],
      };

      await generatePDF(options);

      expect(mockDocInstance.addPage).toHaveBeenCalled();
    });
  });

  describe('generateNutritionReportSections', () => {
    it('should generate nutrition report sections', () => {
      const sections = generateNutritionReportSections(
        'John Doe',
        {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31'),
        },
        {}
      );

      expect(sections).toHaveLength(3);
      expect(sections[0].title).toBe('Executive Summary');
      expect(sections[1].title).toBe('Caloric Intake Analysis');
      expect(sections[2].title).toBe('Recommendations');
    });

    it('should include client name in summary', () => {
      const sections = generateNutritionReportSections(
        'Jane Smith',
        {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31'),
        },
        {}
      );

      expect(sections[0].content).toContain('Jane Smith');
    });

    it('should include caloric intake table', () => {
      const sections = generateNutritionReportSections(
        'John Doe',
        {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31'),
        },
        {}
      );

      const calorieSection = sections[1];
      expect(calorieSection.table).toBeDefined();
      expect(calorieSection.table?.head).toContain('Metric');
      expect(calorieSection.table?.body.length).toBeGreaterThan(0);
    });

    it('should include recommendations section', () => {
      const sections = generateNutritionReportSections(
        'John Doe',
        {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31'),
        },
        {}
      );

      const recommendationsSection = sections[2];
      expect(recommendationsSection.content).toContain('Increase protein');
    });
  });
});
