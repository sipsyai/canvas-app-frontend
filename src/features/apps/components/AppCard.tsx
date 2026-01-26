/**
 * App Card Component
 *
 * Displays a published application in a card format
 * with icon, name, description, and object count
 */

import { useNavigate } from 'react-router-dom';
import { Button } from 'react-aria-components';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Application } from '@/lib/api/applications.api';

interface AppCardProps {
  application: Application;
  objectCount?: number;
}

export function AppCard({ application, objectCount = 0 }: AppCardProps) {
  const navigate = useNavigate();

  // Get application icon (emoji or Lucide icon name)
  const renderIcon = () => {
    if (!application.icon) {
      return <span className="text-2xl">📱</span>;
    }

    // Check if it's an emoji (single character or emoji sequence)
    if (application.icon.length <= 4 && /\p{Emoji}/u.test(application.icon)) {
      return <span className="text-2xl">{application.icon}</span>;
    }

    // Try to get Lucide icon
    const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[
      application.icon
    ];
    if (IconComponent) {
      return <IconComponent className="h-6 w-6 text-primary" />;
    }

    // Fallback to emoji
    return <span className="text-2xl">{application.icon}</span>;
  };

  const handlePress = () => {
    navigate(`/apps/${application.id}`);
  };

  return (
    <Button
      onPress={handlePress}
      className={cn(
        'group w-full text-left bg-white dark:bg-surface-dark',
        'border border-slate-200 dark:border-slate-700 rounded-xl p-5',
        'hover:border-primary hover:shadow-md transition-all',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'data-[pressed]:scale-[0.98]'
      )}
    >
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          {renderIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">
              {application.label || application.name}
            </h3>
            <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
          {application.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {application.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
            <span>{objectCount} objects</span>
            {application.published_at && (
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Published
              </span>
            )}
          </div>
        </div>
      </div>
    </Button>
  );
}
