import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface FilterChip {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface FilterChipsProps {
  chips: FilterChip[];
  activeChip: string | null;
  onChipClick: (chipId: string | null) => void;
  className?: string;
}

export function FilterChips({ chips, activeChip, onChipClick, className }: FilterChipsProps) {
  return (
    <div className={cn('flex flex-1 gap-2 overflow-x-auto hide-scrollbar pb-1 lg:pb-0 items-center', className)}>
      {chips.map((chip) => {
        const isActive = activeChip === chip.id || (chip.id === 'all' && activeChip === null);
        const Icon = chip.icon;

        return (
          <button
            key={chip.id}
            onClick={() => onChipClick(chip.id === 'all' ? null : chip.id)}
            className={cn(
              'flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-colors',
              'border focus:border-primary focus:outline-none',
              isActive
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white border-transparent'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary hover:border-primary group'
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  'h-4 w-4',
                  !isActive && 'group-hover:text-primary transition-colors'
                )}
              />
            )}
            <span className="text-sm font-medium">{chip.label}</span>
          </button>
        );
      })}
    </div>
  );
}
