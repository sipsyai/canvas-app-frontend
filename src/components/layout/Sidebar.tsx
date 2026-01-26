import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';
import { useNavigationStore } from '@/stores/navigationStore';
import { useLogout } from '@/features/auth/hooks/useLogout';
import {
  LayoutDashboard,
  Library,
  Box,
  LayoutGrid,
  Settings,
  Users,
  Layers,
  X,
  LogOut,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Builder',
    items: [
      { label: 'Field Library', href: '/fields', icon: Library },
      { label: 'Object Builder', href: '/objects', icon: Box },
      { label: 'Applications', href: '/applications', icon: LayoutGrid },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', href: '/settings', icon: Settings },
      { label: 'Users & Roles', href: '/users', icon: Users },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen } = useNavigationStore();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-50 flex flex-col w-64 h-full bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 flex-shrink-0 transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white">Canvas App</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">No-code Platform</p>
            </div>
          </div>
          <button
            className="md:hidden p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 px-4 py-4 overflow-y-auto custom-scrollbar">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.title && (
                <div className="pt-4 pb-2 px-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {section.title}
                  </p>
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors group',
                      active
                        ? 'bg-primary/10 text-primary dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 transition-colors',
                        !active && 'group-hover:text-primary'
                      )}
                    />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              A
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-slate-900 dark:text-white block truncate">
                Admin User
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                admin@canvas.app
              </span>
            </div>
            <button
              onClick={() => logout()}
              disabled={isLoggingOut}
              className="p-1.5 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
