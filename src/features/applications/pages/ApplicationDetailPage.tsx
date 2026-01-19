import { useNavigate, useParams } from 'react-router-dom';
import { useApplication, usePublishApplication, useDeleteApplication } from '../hooks/useApplications';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Pencil, Rocket, Trash2, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export const ApplicationDetailPage = () => {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { data: application, isLoading, error } = useApplication(appId!);
  const publishMutation = usePublishApplication();
  const deleteMutation = useDeleteApplication();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM d, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  const handlePublish = async () => {
    if (!application || application.published_at) return;

    if (!confirm(`Publish "${application.name}"? Published applications become available to users.`)) {
      return;
    }

    try {
      await publishMutation.mutateAsync(appId!);
      alert(`${application.name} has been published successfully!`);
    } catch (error) {
      console.error('Failed to publish application:', error);
      alert('Failed to publish application. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!application) return;

    if (!confirm(`Are you sure you want to delete "${application.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(appId!);
      navigate('/applications');
    } catch (error) {
      console.error('Failed to delete application:', error);
      alert('Failed to delete application. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load application</p>
          <Button onClick={() => navigate('/applications')}>Back to Applications</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate('/applications')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-3xl">
                {application.icon || '📱'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{application.name}</h1>
                {application.label && application.label !== application.name && (
                  <p className="text-lg text-gray-600 mt-1">{application.label}</p>
                )}
                {application.description && <p className="text-gray-600 mt-2">{application.description}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              {!application.published_at && (
                <Button
                  onClick={handlePublish}
                  disabled={publishMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  {publishMutation.isPending ? 'Publishing...' : 'Publish'}
                </Button>
              )}
              <Button variant="secondary" onClick={() => navigate(`/applications/${appId}/edit`)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="secondary"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        {application.published_at ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Application Published</p>
              <p className="text-sm text-green-700">Published on {formatDate(application.published_at)}</p>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-900">Draft Application</p>
              <p className="text-sm text-yellow-700">This application is not published yet</p>
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Metadata */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Application ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{application.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(application.created_at)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(application.updated_at)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created By</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{application.created_by}</dd>
              </div>
            </dl>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Publication Status</dt>
                <dd className="mt-1">
                  {application.published_at ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <Rocket className="w-4 h-4 mr-1" />
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      <Clock className="w-4 h-4 mr-1" />
                      Draft
                    </span>
                  )}
                </dd>
              </div>
              {application.published_at && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Published At</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(application.published_at)}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h2>
          {Object.keys(application.config).length > 0 ? (
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-auto">
              <pre>{JSON.stringify(application.config, null, 2)}</pre>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No configuration defined</p>
          )}
        </div>
      </div>
    </div>
  );
};
