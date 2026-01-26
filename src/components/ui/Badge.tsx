import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
  {
    variants: {
      variant: {
        default: 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 ring-slate-500/10',
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 ring-blue-700/10',
        green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 ring-green-700/10',
        emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 ring-emerald-700/10',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 ring-purple-700/10',
        orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 ring-orange-700/10',
        pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 ring-pink-700/10',
        teal: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 ring-teal-700/10',
        indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 ring-indigo-700/10',
        amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 ring-amber-700/10',
        red: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 ring-red-700/10',
        gray: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 ring-gray-600/20',
      },
      size: {
        sm: 'px-1.5 py-0.5 text-[10px]',
        md: 'px-2 py-1 text-xs',
        lg: 'px-2.5 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, variant, size, className }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)}>
      {children}
    </span>
  );
}
