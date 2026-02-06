import { ApplicationTemplate, APPLICATION_TEMPLATES } from '../constants/templates';
import { Check } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplateId: string;
  onSelect: (template: ApplicationTemplate) => void;
}

export const TemplateSelector = ({ selectedTemplateId, onSelect }: TemplateSelectorProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
        Choose a Template
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {APPLICATION_TEMPLATES.map((template) => {
          const isSelected = selectedTemplateId === template.id;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect(template)}
              className={`relative p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-surface-dark hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="text-3xl">{template.icon}</div>
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 ${isSelected ? 'text-blue-900 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                    {template.label}
                  </h3>
                  <p className={`text-sm ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-slate-400'}`}>
                    {template.description}
                  </p>
                  {template.config.suggestedObjects && template.config.suggestedObjects.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {template.config.suggestedObjects.slice(0, 3).map((obj) => (
                        <span
                          key={obj}
                          className={`text-xs px-2 py-0.5 rounded ${
                            isSelected ? 'bg-blue-200 dark:bg-blue-800/40 text-blue-800 dark:text-blue-300' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
                          }`}
                        >
                          {obj}
                        </span>
                      ))}
                      {template.config.suggestedObjects.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-slate-400">
                          +{template.config.suggestedObjects.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
