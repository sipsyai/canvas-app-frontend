import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface IconPickerProps {
  value?: string;
  onChange: (icon: string) => void;
}

// Popular icons for objects
const POPULAR_ICONS = [
  'Box', 'Package', 'Boxes', 'Database', 'Server',
  'FolderOpen', 'FileText', 'Layers', 'Grid3x3', 'Layout',
  'Users', 'User', 'UserCircle', 'Building', 'Building2',
  'ShoppingCart', 'ShoppingBag', 'CreditCard', 'Wallet', 'DollarSign',
  'Mail', 'Phone', 'MapPin', 'Calendar', 'Clock',
  'Settings', 'Briefcase', 'Truck', 'Package2', 'Archive',
  'Star', 'Heart', 'Bookmark', 'Tag', 'Tags',
  'Zap', 'Activity', 'TrendingUp', 'BarChart3', 'PieChart',
];

export const IconPicker = ({ value = 'Box', onChange }: IconPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Get the selected icon component
  const SelectedIcon = (LucideIcons as any)[value] || LucideIcons.Box;

  // Filter icons based on search
  const filteredIcons = search
    ? POPULAR_ICONS.filter((icon) =>
        icon.toLowerCase().includes(search.toLowerCase())
      )
    : POPULAR_ICONS;

  const handleSelect = (icon: string) => {
    onChange(icon);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-surface-dark dark:text-white"
      >
        <SelectedIcon className="w-5 h-5" />
        <span className="text-sm">{value}</span>
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
          {/* Search */}
          <div className="p-3 border-b border-gray-200 dark:border-slate-700">
            <input
              type="text"
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-surface-dark dark:text-white"
              autoFocus
            />
          </div>

          {/* Icon Grid */}
          <div className="p-3 max-h-80 overflow-y-auto">
            {filteredIcons.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">
                No icons found
              </p>
            ) : (
              <div className="grid grid-cols-6 gap-2">
                {filteredIcons.map((iconName) => {
                  const IconComponent = (LucideIcons as any)[iconName];
                  const isSelected = iconName === value;

                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => handleSelect(iconName)}
                      className={`flex items-center justify-center p-3 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-blue-100 text-blue-600 border-2 border-blue-500'
                          : 'hover:bg-gray-100 dark:hover:bg-slate-700 border-2 border-transparent'
                      }`}
                      title={iconName}
                    >
                      <IconComponent className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="p-3 border-t border-gray-200 dark:border-slate-700 flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsOpen(false);
                setSearch('');
              }}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Overlay to close on click outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false);
            setSearch('');
          }}
        />
      )}
    </div>
  );
};
