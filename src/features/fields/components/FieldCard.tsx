import { MoreHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';

interface FieldCardProps {
  name: string;
  description?: string;
  type: string;
  category?: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  categoryVariant?: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'teal' | 'indigo' | 'gray';
  onClick?: () => void;
  onMenuClick?: () => void;
}

export function FieldCard({
  name,
  description,
  type,
  category,
  icon: Icon,
  iconBgColor,
  iconColor,
  categoryVariant = 'blue',
  onClick,
  onMenuClick,
}: FieldCardProps) {
  return (
    <div
      className={cn(
        'group bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700',
        'shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer',
        'flex flex-col gap-4 relative'
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div
          className={cn(
            'h-10 w-10 rounded-lg flex items-center justify-center',
            iconBgColor,
            iconColor
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMenuClick?.();
          }}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <div>
        <h3 className="text-slate-900 dark:text-white text-lg font-bold">
          {name}
        </h3>
        {description && (
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 mt-auto pt-2">
        <Badge variant="default">{type}</Badge>
        {category && <Badge variant={categoryVariant}>{category}</Badge>}
      </div>
    </div>
  );
}
