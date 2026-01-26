/**
 * Apps Home Page
 *
 * Grid view of published applications in Applications mode
 * Shows only apps with published_at set (published apps)
 */

import { useNavigate } from 'react-router-dom';
import { Plus, LayoutGrid } from 'lucide-react';
import { useApplications } from '@/features/applications/hooks/useApplications';
import { useObjects } from '@/features/objects/hooks/useObjects';
import { AppCard } from '../components/AppCard';
import { Button } from '@/components/ui/Button';

export function AppsHomePage() {
  const navigate = useNavigate();
  const { data: applications, isLoading, error } = useApplications();
  const { data: objects } = useObjects();

  // Filter only published applications
  const publishedApps = applications?.filter((app) => app.published_at !== null) || [];

  // Calculate object count for each app
  const getObjectCount = (appId: string): number => {
    const app = applications?.find((a) => a.id === appId);
    const configObjects = app?.config?.objects as string[] | undefined;
    return configObjects?.length || 0;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-32 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400">
            Failed to load applications. Please try again.
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onPress={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Your Applications
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Access your published applications
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onPress={() => navigate('/applications')}
          >
            <Plus className="h-4 w-4" />
            Manage Apps
          </Button>
        </div>
      </div>

      {/* Apps Grid */}
      {publishedApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedApps.map((app) => (
            <AppCard
              key={app.id}
              application={app}
              objectCount={getObjectCount(app.id)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
              <LayoutGrid className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              No Published Applications
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              You don't have any published applications yet. Create an application
              in Development mode and publish it to see it here.
            </p>
            <Button onPress={() => navigate('/applications/create')}>
              <Plus className="h-4 w-4" />
              Create Application
            </Button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {publishedApps.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl p-5">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {publishedApps.length}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Published Apps
            </p>
          </div>
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl p-5">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {applications?.length || 0}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Total Apps
            </p>
          </div>
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl p-5">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {objects?.length || 0}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Total Objects
            </p>
          </div>
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl p-5">
            <p className="text-3xl font-bold text-green-600">Active</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              System Status
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
