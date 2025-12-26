'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartProps {
  data: any[];
  title?: string;
  className?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

export function LineChartComponent({ data, title, className = '' }: ChartProps) {
  if (!data || data.length === 0) {
    return <div className={`p-4 text-gray-500 ${className}`}>No data available</div>;
  }

  return (
    <div className={className}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {Object.keys(data[0]).map((key, idx) => {
            if (key === 'name') return null;
            return (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[idx % COLORS.length]}
                dot={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarChartComponent({ data, title, className = '' }: ChartProps) {
  if (!data || data.length === 0) {
    return <div className={`p-4 text-gray-500 ${className}`}>No data available</div>;
  }

  return (
    <div className={className}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {Object.keys(data[0]).map((key, idx) => {
            if (key === 'name') return null;
            return (
              <Bar
                key={key}
                dataKey={key}
                fill={COLORS[idx % COLORS.length]}
              />
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PieChartComponent({ data, title, className = '' }: ChartProps) {
  if (!data || data.length === 0) {
    return <div className={`p-4 text-gray-500 ${className}`}>No data available</div>;
  }

  return (
    <div className={className}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Sample data generator for nutrition reports
export function generateNutritionChartData(
  startDate: Date,
  days: number = 7
) {
  const data = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    data.push({
      name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      calories: Math.floor(Math.random() * 500 + 1500),
      protein: Math.floor(Math.random() * 40 + 50),
      carbs: Math.floor(Math.random() * 80 + 100),
      fat: Math.floor(Math.random() * 30 + 40),
    });
  }
  return data;
}

// Sample data generator for weight tracking
export function generateWeightChartData(startDate: Date, weeks: number = 12) {
  const data = [];
  let weight = 75; // kg
  for (let i = 0; i < weeks; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i * 7);
    weight += (Math.random() - 0.45) * 0.5; // Random walk with slight downward trend
    data.push({
      name: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      weight: parseFloat(weight.toFixed(1)),
      target: 70,
    });
  }
  return data;
}

// Sample data for macronutrient distribution
export function generateMacroDistributionData() {
  return [
    { name: 'Protein', value: 30 },
    { name: 'Carbs', value: 45 },
    { name: 'Fat', value: 25 },
  ];
}
