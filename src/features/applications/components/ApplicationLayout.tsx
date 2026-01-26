/**
 * Application Layout Component
 *
 * Runtime shell for applications with its own sidebar showing
 * the application's objects. Used when viewing an application.
 */

import { Outlet, Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Home, type LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useApplication } from '../hooks/useApplications';
import { useObjects } from '@/features/objects/hooks/useObjects';
import { getObjectIcon } from '@/lib/utils/icons';
import { Button } from '@/components/ui/Button';

interface ApplicationLayoutProps {
  basePath?: '/applications' | '/apps';
}

export function ApplicationLayout({ basePath = '/applications' }: ApplicationLayoutProps) {
  const { appId } = useParams<{ appId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: app, isLoading: appLoading, error: appError } = useApplication(appId || '');
  const { data: allObjects, isLoading: objectsLoading } = useObjects();

  // Filter objects that belong to this application
  const appObjects = allObjects?.filter((obj) =>
    app?.config?.objects?.includes(obj.id)
  );

  // Determine active object from URL
  const pathParts = location.pathname.split('/');
  const activeObjectId = pathParts[3]; // /applications/:appId/:objectId

  // Get application icon (emoji or Lucide icon name)
  const renderAppIcon = () => {
    if (!app?.icon) return null;

    // Check if it's an emoji (single character or emoji sequence)
    if (app.icon.length <= 4 && /\p{Emoji}/u.test(app.icon)) {
      return <span className="text-2xl">{app.icon}</span>;
    }

    // Try to get Lucide icon
    const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[app.icon];
    if (IconComponent) {
      return <IconComponent className="h-6 w-6" />;
    }

    // Fallback to emoji
    return <span className="text-2xl">{app.icon}</span>;
  };

  // Loading state
  if (appLoading || objectsLoading) {
    return (
      <div className="flex h-screen w-full bg-background-light dark:bg-background-dark">
        {/* Sidebar Skeleton */}
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark flex-shrink-0">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          <nav className="p-2 space-y-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            ))}
          </nav>
        </aside>
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </main>
      </div>
    );
  }

  // Error state
  if (appError || !app) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center space-y-4">
          <p className="text-red-500">Application not found</p>
          <Button variant="secondary" onPress={() => navigate(basePath)}>
            <ArrowLeft className="h-4 w-4" />
            Back to Applications
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Application Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark flex-shrink-0 flex flex-col">
        {/* App Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              {renderAppIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-slate-900 dark:text-white truncate">
                {app.label || app.name}
              </h2>
              {app.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {app.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* Home link */}
          <Link
            to={`${basePath}/${appId}`}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors group',
              !activeObjectId
                ? 'bg-primary/10 text-primary dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            )}
          >
            <Home className="h-5 w-5" />
            <span className="text-sm">Home</span>
          </Link>

          {/* Divider */}
          {appObjects && appObjects.length > 0 && (
            <div className="pt-3 pb-2 px-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Objects
              </p>
            </div>
          )}

          {/* Object links */}
          {appObjects?.map((obj) => {
            const IconComponent = getObjectIcon(obj.icon);
            const isActive = activeObjectId === obj.id;

            return (
              <Link
                key={obj.id}
                to={`${basePath}/${appId}/${obj.id}`}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors group',
                  isActive
                    ? 'bg-primary/10 text-primary dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                <IconComponent
                  className={cn(
                    'h-5 w-5 transition-colors',
                    !isActive && 'group-hover:text-primary'
                  )}
                />
                <span className="text-sm flex-1 truncate">{obj.label}</span>
                <ChevronRight
                  className={cn(
                    'h-4 w-4 opacity-0 transition-opacity',
                    isActive && 'opacity-100'
                  )}
                />
              </Link>
            );
          })}

          {/* Empty state */}
          {(!appObjects || appObjects.length === 0) && (
            <div className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400 text-center">
              No objects configured for this application.
            </div>
          )}
        </nav>

        {/* Back to Applications */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Link
            to={basePath}
            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {basePath === '/apps' ? 'Back to Apps' : 'Back to Applications'}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Breadcrumb Header */}
        <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark flex items-center px-6 flex-shrink-0">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              to={basePath}
              className="text-slate-500 hover:text-primary transition-colors"
            >
              {basePath === '/apps' ? 'Apps' : 'Applications'}
            </Link>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <span className="text-slate-900 dark:text-white font-medium">
              {app.label || app.name}
            </span>
            {activeObjectId && appObjects && (
              <>
                <ChevronRight className="h-4 w-4 text-slate-400" />
                <span className="text-slate-900 dark:text-white font-medium">
                  {appObjects.find((o) => o.id === activeObjectId)?.label || activeObjectId}
                </span>
              </>
            )}
          </nav>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
