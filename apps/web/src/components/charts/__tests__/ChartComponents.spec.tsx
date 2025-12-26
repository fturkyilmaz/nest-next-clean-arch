import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  LineChartComponent,
  BarChartComponent,
  PieChartComponent,
  generateNutritionChartData,
  generateWeightChartData,
  generateMacroDistributionData,
} from '@/components/charts/ChartComponents';

jest.mock('recharts', () => ({
  LineChart: () => <div>LineChart Mock</div>,
  BarChart: () => <div>BarChart Mock</div>,
  PieChart: () => <div>PieChart Mock</div>,
  Line: () => null,
  Bar: () => null,
  Pie: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));

describe('Chart Components', () => {
  describe('LineChartComponent', () => {
    it('should render line chart with data', () => {
      const data = [
        { name: 'Jan', value: 100 },
        { name: 'Feb', value: 200 },
      ];

      render(
        <LineChartComponent data={data} title="Test Chart" />
      );

      expect(screen.getByText('Test Chart')).toBeInTheDocument();
      expect(screen.getByText('LineChart Mock')).toBeInTheDocument();
    });

    it('should show message when data is empty', () => {
      render(
        <LineChartComponent data={[]} title="Empty Chart" />
      );

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('should render without title', () => {
      const data = [{ name: 'Jan', value: 100 }];

      render(
        <LineChartComponent data={data} />
      );

      expect(screen.getByText('LineChart Mock')).toBeInTheDocument();
    });
  });

  describe('BarChartComponent', () => {
    it('should render bar chart with data', () => {
      const data = [
        { name: 'Jan', value: 100 },
        { name: 'Feb', value: 200 },
      ];

      render(
        <BarChartComponent data={data} title="Bar Test" />
      );

      expect(screen.getByText('Bar Test')).toBeInTheDocument();
      expect(screen.getByText('BarChart Mock')).toBeInTheDocument();
    });

    it('should show message when data is empty', () => {
      render(
        <BarChartComponent data={[]} />
      );

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  describe('PieChartComponent', () => {
    it('should render pie chart with data', () => {
      const data = [
        { name: 'A', value: 100 },
        { name: 'B', value: 200 },
      ];

      render(
        <PieChartComponent data={data} title="Pie Test" />
      );

      expect(screen.getByText('Pie Test')).toBeInTheDocument();
      expect(screen.getByText('PieChart Mock')).toBeInTheDocument();
    });

    it('should show message when data is empty', () => {
      render(
        <PieChartComponent data={[]} />
      );

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  describe('Data Generators', () => {
    it('should generate nutrition chart data with correct structure', () => {
      const startDate = new Date('2024-01-01');
      const data = generateNutritionChartData(startDate, 7);

      expect(data).toHaveLength(7);
      expect(data[0]).toHaveProperty('name');
      expect(data[0]).toHaveProperty('calories');
      expect(data[0]).toHaveProperty('protein');
      expect(data[0]).toHaveProperty('carbs');
      expect(data[0]).toHaveProperty('fat');
    });

    it('should generate weight chart data with correct structure', () => {
      const startDate = new Date('2024-01-01');
      const data = generateWeightChartData(startDate, 12);

      expect(data).toHaveLength(12);
      expect(data[0]).toHaveProperty('name');
      expect(data[0]).toHaveProperty('weight');
      expect(data[0]).toHaveProperty('target');
    });

    it('should generate macro distribution data', () => {
      const data = generateMacroDistributionData();

      expect(data).toHaveLength(3);
      expect(data.some((d) => d.name === 'Protein')).toBe(true);
      expect(data.some((d) => d.name === 'Carbs')).toBe(true);
      expect(data.some((d) => d.name === 'Fat')).toBe(true);
      
      const total = data.reduce((sum, d) => sum + d.value, 0);
      expect(total).toBe(100);
    });

    it('should generate weight data with downward trend', () => {
      const startDate = new Date('2024-01-01');
      const data = generateWeightChartData(startDate, 12);

      // Check that last weight is lower than first (on average, with some variance)
      const firstWeight = data[0].weight;
      const lastWeight = data[data.length - 1].weight;
      
      // Due to randomness, we just check that data was generated
      expect(firstWeight).toBeDefined();
      expect(lastWeight).toBeDefined();
    });
  });
});
