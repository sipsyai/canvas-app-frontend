import { useState } from 'react';
import { Check } from 'lucide-react';

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
}

// Preset colors for objects
const PRESET_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Slate', value: '#64748b' },
  { name: 'Gray', value: '#6b7280' },
];

export const ColorPicker = ({ value = '#6366f1', onChange }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);

  const handlePresetSelect = (color: string) => {
    onChange(color);
    setCustomColor(color);
    setIsOpen(false);
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    onChange(color);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-surface-dark dark:text-white"
      >
        <div
          className="w-6 h-6 rounded border border-gray-300 dark:border-slate-600"
          style={{ backgroundColor: value }}
        />
        <span className="text-sm font-mono">{value}</span>
        <svg
          className="w-4 h-4 ml-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Modal */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg">
          {/* Preset Colors */}
          <div className="p-4">
            <p className="text-xs font-medium text-gray-700 dark:text-slate-300 mb-3">Preset Colors</p>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((color) => {
                const isSelected = color.value === value;

                return (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handlePresetSelect(color.value)}
                    className="relative w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: color.value,
                      borderColor: isSelected ? '#1f2937' : '#d1d5db',
                    }}
                    title={color.name}
                  >
                    {isSelected && (
                      <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color */}
          <div className="p-4 border-t border-gray-200 dark:border-slate-700">
            <p className="text-xs font-medium text-gray-700 dark:text-slate-300 mb-3">Custom Color</p>
            <div className="flex gap-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="w-12 h-10 border border-gray-300 dark:border-slate-600 rounded cursor-pointer"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomColor(val);
                  // Only update if valid hex color
                  if (/^#[0-9A-F]{6}$/i.test(val)) {
                    onChange(val);
                  }
                }}
                placeholder="#000000"
                className="flex-1 px-3 py-2 text-sm font-mono border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-surface-dark dark:text-white"
              />
            </div>
          </div>

          {/* Close Button */}
          <div className="p-3 border-t border-gray-200 dark:border-slate-700 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close on click outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
