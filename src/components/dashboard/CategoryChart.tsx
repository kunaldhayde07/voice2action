'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { categoryColors, categoryLabels, categoryIcons } from '@/lib/utils';
import { IssueCategory } from '@/types';

interface CategoryChartProps {
  data: Record<string, number>;
}

export default function CategoryChart({ data }: CategoryChartProps) {
  const chartData = Object.entries(data)
    .map(([category, count]) => ({
      category,
      count,
      label: categoryLabels[category as IssueCategory] || category,
      icon: categoryIcons[category as IssueCategory] || '📌',
      color: categoryColors[category as IssueCategory] || '#6b7280',
    }))
    .sort((a, b) => b.count - a.count);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg text-sm">
          <p className="font-semibold text-slate-900">{item.icon} {item.label}</p>
          <p className="text-slate-600">{item.count} issue{item.count !== 1 ? 's' : ''}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
      <h3 className="text-sm font-semibold text-slate-700 mb-5">Issues by Category</h3>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barSize={28}>
          <XAxis
            dataKey="icon"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 18 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#94a3b8' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241,245,249,0.8)', radius: 8 }} />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}