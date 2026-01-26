import {
  Tabs as AriaTabs,
  TabList as AriaTabList,
  Tab as AriaTab,
  TabPanel as AriaTabPanel,
} from 'react-aria-components';
import type {
  TabsProps as AriaTabsProps,
  TabListProps as AriaTabListProps,
  TabProps as AriaTabProps,
  TabPanelProps as AriaTabPanelProps,
} from 'react-aria-components';
import { cn } from '@/lib/utils/cn';
import type { ReactNode } from 'react';

interface TabsProps extends Omit<AriaTabsProps, 'className'> {
  className?: string;
}

export function Tabs({ className, ...props }: TabsProps) {
  return (
    <AriaTabs
      className={cn('flex flex-col', className)}
      {...props}
    />
  );
}

interface TabListProps<T> extends Omit<AriaTabListProps<T>, 'className'> {
  className?: string;
}

export function TabList<T extends object>({ className, ...props }: TabListProps<T>) {
  return (
    <AriaTabList
      className={cn(
        'flex border-b border-slate-200 dark:border-slate-700',
        className
      )}
      {...props}
    />
  );
}

interface TabProps extends Omit<AriaTabProps, 'className' | 'children'> {
  className?: string;
  badge?: number | string;
  children?: ReactNode;
}

export function Tab({ className, badge, children, ...props }: TabProps) {
  return (
    <AriaTab
      className={cn(
        'flex items-center gap-2 px-4 py-3 text-sm font-medium cursor-pointer transition-colors',
        'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300',
        'border-b-2 border-transparent -mb-px',
        'data-[selected]:border-primary data-[selected]:text-primary dark:data-[selected]:text-blue-400',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        className
      )}
      {...props}
    >
      {children}
      {badge !== undefined && (
        <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 rounded-full">
          {badge}
        </span>
      )}
    </AriaTab>
  );
}

interface TabPanelProps extends Omit<AriaTabPanelProps, 'className'> {
  className?: string;
}

export function TabPanel({ className, ...props }: TabPanelProps) {
  return (
    <AriaTabPanel
      className={cn('flex-1 pt-6 focus:outline-none', className)}
      {...props}
    />
  );
}
