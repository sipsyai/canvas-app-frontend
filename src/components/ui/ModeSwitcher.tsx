/**
 * Mode Switcher Component
 *
 * Toggle between Development and Applications modes
 * Uses React Aria TabList for accessible tab switching
 */

import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { Code2, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useModeStore, type AppMode } from '@/stores/modeStore';
import { useEffect } from 'react';

interface ModeSwitcherProps {
  className?: string;
}

export function ModeSwitcher({ className }: ModeSwitcherProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, setMode } = useModeStore();

  // Sync mode with current route on mount and route changes
  useEffect(() => {
    if (location.pathname.startsWith('/apps')) {
      if (mode !== 'applications') {
        setMode('applications');
      }
    } else if (
      location.pathname.startsWith('/dashboard') ||
      location.pathname.startsWith('/fields') ||
      location.pathname.startsWith('/objects') ||
      location.pathname.startsWith('/applications') ||
      location.pathname.startsWith('/settings') ||
      location.pathname.startsWith('/users')
    ) {
      if (mode !== 'development') {
        setMode('development');
      }
    }
  }, [location.pathname, mode, setMode]);

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);

    // Navigate to appropriate home page for the mode
    if (newMode === 'applications') {
      navigate('/apps');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <Tabs
      selectedKey={mode}
      onSelectionChange={(key) => handleModeChange(key as AppMode)}
      className={cn('w-full', className)}
    >
      <TabList
        aria-label="Mode selector"
        className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg"
      >
        <Tab
          id="development"
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all cursor-pointer',
            'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            'data-[selected]:bg-white data-[selected]:dark:bg-surface-dark data-[selected]:shadow-sm',
            'data-[selected]:text-slate-900 data-[selected]:dark:text-white',
            'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          <Code2 className="h-4 w-4" />
          <span className="hidden sm:inline">Development</span>
        </Tab>
        <Tab
          id="applications"
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all cursor-pointer',
            'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            'data-[selected]:bg-white data-[selected]:dark:bg-surface-dark data-[selected]:shadow-sm',
            'data-[selected]:text-slate-900 data-[selected]:dark:text-white',
            'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          <span className="hidden sm:inline">Applications</span>
        </Tab>
      </TabList>

      {/* Hidden panels - navigation handles content */}
      <TabPanel id="development" className="hidden" />
      <TabPanel id="applications" className="hidden" />
    </Tabs>
  );
}
