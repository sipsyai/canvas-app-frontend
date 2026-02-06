import { Link } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

interface ActivityItem {
  id: string;
  name: string;
  initials: string;
  initialsColor: string;
  type: string;
  typeVariant: 'blue' | 'green' | 'purple' | 'emerald' | 'orange';
  modifiedBy: {
    name: string;
    avatar?: string;
  };
  date: string;
}

interface ActivityTableProps {
  items: ActivityItem[];
  onViewAll?: () => void;
}

export function ActivityTable({ items, onViewAll }: ActivityTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Recent Activity
        </h2>
        {onViewAll && (
          <Link
            to="#"
            className="text-sm font-medium text-primary hover:text-primary-dark hover:underline"
            onClick={onViewAll}
          >
            View all
          </Link>
        )}
      </div>

      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-surface-dark-alt dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">
                  Name
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  Type
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  Modified By
                </th>
                <th scope="col" className="px-6 py-4 font-medium">
                  Date
                </th>
                <th scope="col" className="px-6 py-4 font-medium text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50 dark:hover:bg-surface-dark-alt/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded flex items-center justify-center text-xs font-bold ${item.initialsColor}`}
                      >
                        {item.initials}
                      </div>
                      {item.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    <Badge variant={item.typeVariant}>{item.type}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={item.modifiedBy.avatar}
                        alt={item.modifiedBy.name}
                        size="xs"
                      />
                      <span className="text-slate-700 dark:text-slate-300">
                        {item.modifiedBy.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {item.date}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 dark:text-slate-500 hover:text-primary transition-colors">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
