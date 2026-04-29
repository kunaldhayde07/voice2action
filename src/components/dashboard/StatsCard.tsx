import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: 'blue' | 'amber' | 'emerald' | 'red' | 'purple';
  index?: number;
}

const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', value: 'text-blue-700' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', value: 'text-amber-700' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', value: 'text-emerald-700' },
  red: { bg: 'bg-red-50', icon: 'text-red-600', value: 'text-red-700' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', value: 'text-purple-700' },
};

export default function StatsCard({
  label,
  value,
  icon,
  trend,
  color = 'blue',
  index = 0,
}: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card hover:shadow-card-hover transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={cn('p-2.5 rounded-xl', colors.bg)}>
          <div className={cn('w-5 h-5', colors.icon)}>{icon}</div>
        </div>
      </div>

      <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>

      {trend && (
        <div className="flex items-center gap-1 text-xs">
          <span className={trend.value >= 0 ? 'text-emerald-600' : 'text-red-500'}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-slate-400">{trend.label}</span>
        </div>
      )}
    </motion.div>
  );
}