import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateApplication } from '../hooks/useApplications';
import { CreateApplicationData } from '@/lib/api/applications.api';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import { TemplateSelector } from '../components/TemplateSelector';
import { APPLICATION_TEMPLATES, ApplicationTemplate } from '../constants/templates';

export const CreateApplicationPage = () => {
  const navigate = useNavigate();
  const createApplication = useCreateApplication();

  const [selectedTemplate, setSelectedTemplate] = useState<ApplicationTemplate>(APPLICATION_TEMPLATES[0]);
  const [formData, setFormData] = useState<CreateApplicationData>({
    name: '',
    label: '',
    description: '',
    icon: '📱',
    config: {},
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTemplateSelect = (template: ApplicationTemplate) => {
    setSelectedTemplate(template);
    setFormData((prev) => ({
      ...prev,
      icon: template.icon,
      config: template.config,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!/^[a-z_][a-z0-9_]*$/i.test(formData.name)) {
      newErrors.name = 'Name must start with a letter and contain only letters, numbers, and underscores';
    }

    if (!formData.label?.trim()) {
      newErrors.label = 'Label is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await createApplication.mutateAsync(formData);
      navigate(`/applications/${result.id}`);
    } catch (error) {
      console.error('Failed to create application:', error);
      setErrors({
        submit: (error as any)?.response?.data?.detail || 'Failed to create application',
      });
    }
  };

  const handleInputChange = (field: keyof CreateApplicationData, value: string | Record<string, any>) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate('/applications')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Application</h1>
              <p className="text-gray-600 mt-1">Build a new no-code application from a template or start from scratch</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Template Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <TemplateSelector selectedTemplateId={selectedTemplate.id} onSelect={handleTemplateSelect} />
          </div>

          {/* Application Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h2>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., crm, itsm, hr_management"
                className={`w-full px-4 py-2 font-mono border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              <p className="mt-1 text-xs text-gray-500">API name (snake_case recommended)</p>
            </div>

            {/* Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => handleInputChange('label', e.target.value)}
                placeholder="e.g., CRM, IT Service Management"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.label ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.label && <p className="mt-1 text-sm text-red-600">{errors.label}</p>}
              <p className="mt-1 text-xs text-gray-500">Display name shown in the UI</p>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => handleInputChange('icon', e.target.value)}
                placeholder="e.g., 🤝, 🎫, 👥"
                maxLength={2}
                className="w-full px-4 py-2 text-2xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">Enter an emoji to represent this application</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the purpose of this application..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="mt-1 text-xs text-gray-500">Optional description</p>
            </div>

            {/* Template Info */}
            {selectedTemplate.id !== 'blank' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Template Configuration</h3>
                {selectedTemplate.config.suggestedObjects && selectedTemplate.config.suggestedObjects.length > 0 && (
                  <div className="mb-2">
                    <span className="text-sm text-blue-700">Suggested Objects: </span>
                    <span className="text-sm text-blue-600">
                      {selectedTemplate.config.suggestedObjects.join(', ')}
                    </span>
                  </div>
                )}
                {selectedTemplate.config.features && selectedTemplate.config.features.length > 0 && (
                  <div>
                    <span className="text-sm text-blue-700">Features: </span>
                    <span className="text-sm text-blue-600">{selectedTemplate.config.features.join(', ')}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/applications')}
              disabled={createApplication.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createApplication.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
              {createApplication.isPending ? (
                'Creating...'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Application
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
