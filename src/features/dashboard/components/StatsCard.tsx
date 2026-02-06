import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  trend?: number;
  trendLabel?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconBgColor,
  iconColor,
  trend,
  trendLabel = 'from last week',
}: StatsCardProps) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <div className="p-6 bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {value.toLocaleString()}
          </h3>
        </div>
        <div className={cn('p-2 rounded-lg', iconBgColor)}>
          <Icon className={cn('h-6 w-6', iconColor)} />
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-4 flex items-center text-sm">
          <span
            className={cn(
              'font-medium flex items-center',
              isPositive && 'text-emerald-600 dark:text-emerald-400',
              isNegative && 'text-red-600 dark:text-red-400',
              !isPositive && !isNegative && 'text-slate-500 dark:text-slate-400'
            )}
          >
            {isPositive && <TrendingUp className="h-4 w-4 mr-1" />}
            {isNegative && <TrendingDown className="h-4 w-4 mr-1" />}
            {Math.abs(trend)}%
          </span>
          <span className="text-slate-400 dark:text-slate-500 ml-2">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
