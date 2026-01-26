/**
 * Application Home Page
 *
 * Landing page for an application showing overview stats and quick links.
 */

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Settings, Plus } from 'lucide-react';
import { useApplication } from '../hooks/useApplications';
import { useObjects } from '@/features/objects/hooks/useObjects';
import { getObjectIcon } from '@/lib/utils/icons';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function ApplicationHomePage() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();

  const { data: app } = useApplication(appId || '');
  const { data: allObjects } = useObjects();

  // Filter objects that belong to this application
  const appObjects = allObjects?.filter((obj) =>
    app?.config?.objects?.includes(obj.id)
  );

  if (!app) {
    return null;
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome to {app.label || app.name}
          </h1>
          {app.description && (
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
              {app.description}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onPress={() => navigate(`/applications/${appId}/edit`)}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Objects Grid */}
      {appObjects && appObjects.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Objects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appObjects.map((obj) => {
              const IconComponent = getObjectIcon(obj.icon);

              return (
                <button
                  key={obj.id}
                  onClick={() => navigate(`/applications/${appId}/${obj.id}`)}
                  className="group bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl p-5 text-left hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{
                        backgroundColor: obj.color ? `${obj.color}20` : 'rgb(var(--color-primary) / 0.1)',
                      }}
                    >
                      <IconComponent
                        className="h-6 w-6"
                        style={{ color: obj.color || 'rgb(var(--color-primary))' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">
                          {obj.label}
                        </h3>
                        <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                      {obj.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {obj.description}
                        </p>
                      )}
                      <div className="mt-2">
                        <Badge variant="gray" className="text-xs">
                          {obj.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No Objects Configured
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              This application doesn't have any objects configured yet.
              Go to settings to add objects to this application.
            </p>
            <Button onPress={() => navigate(`/applications/${appId}/edit`)}>
              <Settings className="h-4 w-4" />
              Configure Application
            </Button>
          </div>
        </div>
      )}

      {/* Quick Stats (placeholder for future) */}
      {appObjects && appObjects.length > 0 && (
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Quick Stats
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {appObjects.length}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Objects
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                -
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Total Records
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                -
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Users
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                Active
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Status
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
