import { useNavigationStore } from '@/stores/navigationStore';
import { Breadcrumb } from './Breadcrumb';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Menu, Search, Bell } from 'lucide-react';

export function Header() {
  const { toggleSidebar, breadcrumbs } = useNavigationStore();

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 flex-shrink-0 z-10">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbs} />
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="hidden md:flex relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full min-w-[320px] p-2 pl-10 text-sm text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            placeholder="Search objects, fields, and records..."
          />
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 rounded-full hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors">
          <Bell className="h-5 w-5" />
          <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-surface-dark" />
        </button>
      </div>
    </header>
  );
}
