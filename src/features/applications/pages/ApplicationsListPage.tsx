import { useNavigate } from 'react-router-dom';
import { Plus, AppWindow } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ApplicationsTable } from '../components/ApplicationsTable';
import { ApplicationsTableSkeleton } from '../components/ApplicationsTableSkeleton';
import { ApplicationsTableEmpty } from '../components/ApplicationsTableEmpty';
import { useApplications, useDeleteApplication, usePublishApplication } from '../hooks/useApplications';
import { Application } from '@/lib/api/applications.api';

export const ApplicationsListPage = () => {
  const navigate = useNavigate();
  const { data: applications, isLoading, error } = useApplications();
  const deleteApplicationMutation = useDeleteApplication();
  const publishApplicationMutation = usePublishApplication();

  const handleCreateClick = () => {
    navigate('/applications/create');
  };

  const handleDelete = async (app: Application) => {
    if (!confirm(`Are you sure you want to delete "${app.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteApplicationMutation.mutateAsync(app.id);
    } catch (error) {
      console.error('Failed to delete application:', error);
      alert('Failed to delete application. Please try again.');
    }
  };

  const handlePublish = async (app: Application) => {
    if (!confirm(`Publish "${app.name}"? Published applications become available to users.`)) {
      return;
    }

    try {
      await publishApplicationMutation.mutateAsync(app.id);
      alert(`${app.name} has been published successfully!`);
    } catch (error) {
      console.error('Failed to publish application:', error);
      alert('Failed to publish application. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <AppWindow className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
                <p className="text-gray-600 mt-1">Manage your no-code applications</p>
              </div>
            </div>
            {applications && applications.length > 0 && (
              <Button onClick={handleCreateClick}>
                <Plus className="w-4 h-4 mr-2" />
                Create Application
              </Button>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">
              Failed to load applications. Please try refreshing the page.
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && <ApplicationsTableSkeleton />}

        {/* Empty State */}
        {!isLoading && applications && applications.length === 0 && (
          <ApplicationsTableEmpty onCreateClick={handleCreateClick} />
        )}

        {/* Applications Table */}
        {!isLoading && applications && applications.length > 0 && (
          <ApplicationsTable
            applications={applications}
            onDelete={handleDelete}
            onPublish={handlePublish}
          />
        )}

        {/* Stats */}
        {!isLoading && applications && applications.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="text-sm text-gray-600">Total Applications</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{applications.length}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="text-sm text-gray-600">Published</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {applications.filter((app) => app.published_at).length}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="text-sm text-gray-600">Drafts</div>
              <div className="text-2xl font-bold text-gray-600 mt-1">
                {applications.filter((app) => !app.published_at).length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
