import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ConfigEditorProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export const ConfigEditor = ({ config, onChange }: ConfigEditorProps) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    try {
      setJsonText(JSON.stringify(config, null, 2));
      setIsValid(true);
      setError(null);
    } catch {
      setError('Failed to parse config');
      setIsValid(false);
    }
  }, [config]);

  const handleChange = (value: string) => {
    setJsonText(value);

    try {
      const parsed = JSON.parse(value);
      if (typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Config must be a JSON object');
      }
      setError(null);
      setIsValid(true);
      onChange(parsed);
    } catch (err) {
      setError((err as Error).message || 'Invalid JSON');
      setIsValid(false);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      setError(null);
      setIsValid(true);
      onChange(parsed);
    } catch {
      setError('Cannot format invalid JSON');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">Configuration (JSON)</label>
        <button
          type="button"
          onClick={handleFormat}
          disabled={!isValid}
          className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Format JSON
        </button>
      </div>

      <div className="relative">
        <textarea
          value={jsonText}
          onChange={(e) => handleChange(e.target.value)}
          rows={12}
          className={`w-full px-4 py-3 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder='{\n  "objects": ["obj_contact", "obj_company"],\n  "features": ["contacts", "reports"]\n}'
        />
      </div>

      {/* Status Indicator */}
      <div className="mt-2 flex items-center gap-2">
        {isValid ? (
          <div className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            Valid JSON
          </div>
        ) : (
          <div className="flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {/* Helper Text */}
      <p className="mt-2 text-xs text-gray-500">
        Define your application configuration as a JSON object. Common fields: objects, features, settings, navigation.
      </p>

      {/* Examples */}
      <details className="mt-3">
        <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">Show examples</summary>
        <div className="mt-2 bg-gray-50 rounded p-3 space-y-2 text-xs">
          <div>
            <p className="font-medium text-gray-700 mb-1">CRM Example:</p>
            <pre className="text-gray-600 overflow-auto">
{`{
  "objects": ["obj_contact", "obj_company", "obj_opportunity"],
  "features": ["contacts", "companies", "deals", "reports"],
  "navigation": {
    "tabs": ["contacts", "companies", "opportunities"]
  }
}`}
            </pre>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">ITSM Example:</p>
            <pre className="text-gray-600 overflow-auto">
{`{
  "objects": ["obj_ticket", "obj_incident", "obj_asset"],
  "features": ["ticketing", "incident_management"],
  "settings": {
    "sla_enabled": true,
    "priority_levels": ["low", "medium", "high", "critical"]
  }
}`}
            </pre>
          </div>
        </div>
      </details>
    </div>
  );
};
