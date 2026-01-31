'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { MonthlySpending } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

interface SpendingChartProps {
  data: MonthlySpending[];
  currency: string;
}

export default function SpendingChart({ data, currency }: SpendingChartProps) {
  const { theme } = useTheme();
  
  const formatValue = (value: number) => {
    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  // Theme-aware colors
  const colors = {
    title: theme === 'light' ? '#492828' : '#e9df9e',
    axis: theme === 'light' ? '#656D3F' : '#e9df9e',
    axisSecondary: theme === 'light' ? '#84934A' : '#f9cdd5',
    line: theme === 'light' ? '#84934A' : '#e9df9e',
    grid: theme === 'light' ? 'rgba(132, 147, 74, 0.3)' : 'rgba(233, 223, 158, 0.15)',
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-primary-400/30">
          <p className="text-sm" style={{ color: colors.axisSecondary }}>{label}</p>
          <p className="text-lg font-semibold" style={{ color: colors.title }}>
            Rs {payload[0].value.toLocaleString('en-LK')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-6" style={{ color: colors.title }}>Monthly Spending Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.line} stopOpacity={0.4} />
                <stop offset="50%" stopColor="#f9cdd5" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f9cdd5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
            <XAxis
              dataKey="monthName"
              axisLine={false}
              tickLine={false}
              tick={{ fill: colors.axis, fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: colors.axisSecondary, fontSize: 12 }}
              tickFormatter={formatValue}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke={colors.line}
              strokeWidth={3}
              fill="url(#spendingGradient)"
              dot={{ fill: colors.line, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#f9cdd5', stroke: colors.line, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
