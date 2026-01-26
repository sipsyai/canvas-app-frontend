import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex', className)}>
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {/* Root item */}
        <li className="inline-flex items-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
          >
            Canvas App
          </Link>
        </li>

        {/* Dynamic items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index}>
              <div className="flex items-center">
                <ChevronRight className="h-4 w-4 text-slate-400" />
                {isLast || !item.href ? (
                  <span className="ml-1 md:ml-2 text-sm font-medium text-slate-900 dark:text-white">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.href}
                    className="ml-1 md:ml-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
