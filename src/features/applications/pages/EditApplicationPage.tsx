import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApplication, useUpdateApplication } from '../hooks/useApplications';
import { UpdateApplicationData } from '@/lib/api/applications.api';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save } from 'lucide-react';
import { ConfigEditor } from '../components/ConfigEditor';

export const EditApplicationPage = () => {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { data: application, isLoading } = useApplication(appId!);
  const updateApplication = useUpdateApplication();

  const [formData, setFormData] = useState<UpdateApplicationData>({
    name: '',
    label: '',
    description: '',
    icon: '',
    config: {},
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (application) {
      setFormData({
        name: application.name,
        label: application.label || '',
        description: application.description || '',
        icon: application.icon || '',
        config: application.config,
      });
    }
  }, [application]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.name && !/^[a-z_][a-z0-9_]*$/i.test(formData.name)) {
      newErrors.name = 'Name must start with a letter and contain only letters, numbers, and underscores';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await updateApplication.mutateAsync({
        appId: appId!,
        data: formData,
      });
      navigate(`/applications/${appId}`);
    } catch (error) {
      console.error('Failed to update application:', error);
      setErrors({
        submit: (error as any)?.response?.data?.detail || 'Failed to update application',
      });
    }
  };

  const handleInputChange = (field: keyof UpdateApplicationData, value: string | Record<string, any>) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-surface-dark-alt flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-surface-dark-alt flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Application not found</p>
          <Button onClick={() => navigate('/applications')}>Back to Applications</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-dark-alt">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/applications/${appId}`)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Application
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Application</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Update application details and configuration</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">{errors.submit}</div>
          )}

          {/* Application Details */}
          <div className="bg-white dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application Details</h2>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., crm, itsm, hr_management"
                className={`w-full px-4 py-2 font-mono border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-surface-dark-alt dark:text-white dark:placeholder-slate-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">API name (snake_case recommended)</p>
            </div>

            {/* Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Label</label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => handleInputChange('label', e.target.value)}
                placeholder="e.g., CRM, IT Service Management"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-surface-dark-alt dark:text-white dark:placeholder-slate-500"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Display name shown in the UI</p>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Icon</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => handleInputChange('icon', e.target.value)}
                placeholder="e.g., 🤝, 🎫, 👥"
                maxLength={2}
                className="w-full px-4 py-2 text-2xl border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-surface-dark-alt dark:text-white dark:placeholder-slate-500"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Enter an emoji to represent this application</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the purpose of this application..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:bg-surface-dark-alt dark:text-white dark:placeholder-slate-500"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Optional description</p>
            </div>
          </div>

          {/* Configuration Editor */}
          <div className="bg-white dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuration</h2>
            <ConfigEditor config={formData.config || {}} onChange={(config) => handleInputChange('config', config)} />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/applications/${appId}`)}
              disabled={updateApplication.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateApplication.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {updateApplication.isPending ? (
                'Saving...'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
