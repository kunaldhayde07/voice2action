'use client';

import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { DailyIssueStat } from '@/types';
import { format, parseISO } from 'date-fns';

interface TrendChartProps {
  data: DailyIssueStat[];
  isLoading?: boolean;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-900 dark:text-white mb-2">
        {label
          ? format(parseISO(label), 'MMM d, yyyy')
          : ''}
      </p>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-gray-500 dark:text-gray-400">{entry.name}:</span>
          <span className="font-bold text-gray-900 dark:text-white">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export function TrendChart({ data, isLoading }: TrendChartProps) {
  if (isLoading) {
    return (
      <div className="h-64 animate-pulse bg-gradient-to-t from-blue-50 to-transparent dark:from-blue-900/10 rounded-xl" />
    );
  }

  const chartData = data.map((d) => ({
    date: d._id,
    Reported: d.count,
    Resolved: d.resolved,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-64"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="reportedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f3f4f6"
            className="dark:stroke-gray-700"
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => {
              try {
                return format(parseISO(val), 'MMM d');
              } catch {
                return val;
              }
            }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
          />
          <Area
            type="monotone"
            dataKey="Reported"
            stroke="#3B82F6"
            strokeWidth={2.5}
            fill="url(#reportedGrad)"
            dot={false}
            activeDot={{ r: 5, fill: '#3B82F6' }}
          />
          <Area
            type="monotone"
            dataKey="Resolved"
            stroke="#22C55E"
            strokeWidth={2.5}
            fill="url(#resolvedGrad)"
            dot={false}
            activeDot={{ r: 5, fill: '#22C55E' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}