'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DailySpending } from '@/types';
import { format, parseISO } from 'date-fns';
import { useTheme } from '@/contexts/ThemeContext';

interface DailyBarChartProps {
  data: DailySpending[];
  currency: string;
}

export default function DailyBarChart({ data, currency }: DailyBarChartProps) {
  const { theme } = useTheme();
  
  const formattedData = data.map((item) => ({
    ...item,
    day: format(parseISO(item.date), 'd'),
    fullDate: format(parseISO(item.date), 'MMM d, yyyy'),
  }));

  // Theme-aware colors
  const colors = {
    title: theme === 'light' ? '#492828' : '#e9df9e',
    text: theme === 'light' ? '#656D3F' : '#f9cdd5',
    axis: theme === 'light' ? '#492828' : '#e9df9e',
    axisSecondary: theme === 'light' ? '#656D3F' : '#f9cdd5',
    grid: theme === 'light' ? 'rgba(132, 147, 74, 0.3)' : 'rgba(233, 223, 158, 0.15)',
    border: theme === 'light' ? '#84934A' : 'rgba(233, 223, 158, 0.3)',
    cursorFill: theme === 'light' ? 'rgba(132, 147, 74, 0.1)' : 'rgba(233, 223, 158, 0.1)',
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3" style={{ border: `1px solid ${colors.border}` }}>
          <p className="text-sm" style={{ color: colors.text }}>{payload[0].payload.fullDate}</p>
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
      <h3 className="text-lg font-semibold mb-6" style={{ color: colors.title }}>Daily Spending</h3>
      
      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center">
          <p style={{ color: colors.text }}>No data available for this period</p>
        </div>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={theme === 'light' ? '#84934A' : '#e9df9e'} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={theme === 'light' ? '#656D3F' : '#7a8450'} stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.axis, fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.axisSecondary, fontSize: 11 }}
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: colors.cursorFill }} />
              <Bar
                dataKey="amount"
                fill="url(#barGradient)"
                radius={[4, 4, 0, 0]}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
