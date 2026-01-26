import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  hoverBorderColor: string;
  hoverIconBgColor: string;
  hoverTextColor?: string;
  onClick?: () => void;
}

export function QuickActionCard({
  title,
  description,
  icon: Icon,
  iconBgColor,
  iconColor,
  hoverBorderColor,
  hoverIconBgColor,
  hoverTextColor,
  onClick,
}: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex flex-col items-start p-6 bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 transition-all text-left w-full',
        'hover:shadow-md',
        hoverBorderColor
      )}
    >
      <div
        className={cn(
          'h-12 w-12 rounded-lg flex items-center justify-center transition-colors mb-4',
          iconBgColor,
          iconColor,
          hoverIconBgColor
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <h3
        className={cn(
          'font-semibold text-slate-900 dark:text-white transition-colors',
          hoverTextColor
        )}
      >
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
        {description}
      </p>
    </button>
  );
}
