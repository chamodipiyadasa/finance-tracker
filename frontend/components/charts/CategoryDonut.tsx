'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CategorySpending } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

interface CategoryDonutProps {
  data: CategorySpending[];
  currency: string;
}

export default function CategoryDonut({ data, currency }: CategoryDonutProps) {
  const { theme } = useTheme();
  
  // Theme-aware colors
  const colors = {
    title: theme === 'light' ? '#492828' : '#e9df9e',
    text: theme === 'light' ? '#656D3F' : '#f9cdd5',
    percentage: theme === 'light' ? '#84934A' : '#e9df9e',
    border: theme === 'light' ? '#84934A' : 'rgba(233, 223, 158, 0.3)',
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="glass-card p-3" style={{ border: `1px solid ${colors.border}` }}>
          <p className="text-sm" style={{ color: colors.text }}>{item.categoryName}</p>
          <p className="text-lg font-semibold" style={{ color: item.color }}>
            Rs {item.amount.toLocaleString('en-LK')}
          </p>
          <p className="text-xs" style={{ color: colors.percentage }}>{item.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4" style={{ color: colors.title }}>Category Breakdown</h3>
      
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <p style={{ color: colors.text }}>No data available</p>
        </div>
      ) : (
        <>
          <div className="h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="amount"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: colors.title }}>
                  Rs {(total / 1000).toFixed(1)}K
                </p>
                <p className="text-xs" style={{ color: colors.text }}>Total</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 space-y-2">
            {data.slice(0, 5).map((item) => (
              <div key={item.categoryId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm" style={{ color: colors.text }}>{item.categoryName}</span>
                </div>
                <span className="text-sm font-medium" style={{ color: colors.percentage }}>
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
