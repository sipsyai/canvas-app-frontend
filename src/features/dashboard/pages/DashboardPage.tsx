import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Box, ListChecks, PlusCircle, FormInput, Wrench, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigationStore } from '@/stores/navigationStore';
import { StatsCard } from '../components/StatsCard';
import { QuickActionCard } from '../components/QuickActionCard';
import { ActivityTable } from '../components/ActivityTable';

// Mock data for demo
const statsData = [
  {
    title: 'Total Records',
    value: 14203,
    icon: Database,
    iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    trend: 12,
    trendLabel: 'from last week',
  },
  {
    title: 'Active Objects',
    value: 24,
    icon: Box,
    iconBgColor: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-primary dark:text-blue-400',
    trend: 2,
    trendLabel: 'from last week',
  },
  {
    title: 'Fields in Library',
    value: 156,
    icon: ListChecks,
    iconBgColor: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    trend: 5,
    trendLabel: 'from last month',
  },
];

const activityData = [
  {
    id: '1',
    name: 'Customer Object',
    initials: 'CO',
    initialsColor: 'bg-blue-100 dark:bg-blue-900/30 text-primary',
    type: 'Object Definition',
    typeVariant: 'blue' as const,
    modifiedBy: { name: 'Jane Doe' },
    date: '2 mins ago',
  },
  {
    id: '2',
    name: 'Invoice Record #402',
    initials: '#',
    initialsColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600',
    type: 'Record Data',
    typeVariant: 'emerald' as const,
    modifiedBy: { name: 'System API' },
    date: '15 mins ago',
  },
  {
    id: '3',
    name: 'Product Field "SKU"',
    initials: 'SK',
    initialsColor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
    type: 'Field Config',
    typeVariant: 'purple' as const,
    modifiedBy: { name: 'Admin User' },
    date: '1 hour ago',
  },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useNavigationStore();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Dashboard' }]);
  }, [setBreadcrumbs]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome & Stats */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Overview
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Here's what's happening in your app workspace today.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/objects/create')}>
              <Plus className="h-5 w-5" />
              New Record
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsData.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            title="Create New Object"
            description="Define a new data structure and start collecting records."
            icon={PlusCircle}
            iconBgColor="bg-primary/10"
            iconColor="text-primary"
            hoverBorderColor="hover:border-primary/50 dark:hover:border-primary/50"
            hoverIconBgColor="group-hover:bg-primary group-hover:text-white"
            hoverTextColor="group-hover:text-primary"
            onClick={() => navigate('/objects/create')}
          />
          <QuickActionCard
            title="Add Field"
            description="Expand an existing object with new data fields."
            icon={FormInput}
            iconBgColor="bg-purple-50 dark:bg-purple-900/20"
            iconColor="text-purple-600 dark:text-purple-400"
            hoverBorderColor="hover:border-purple-500/50 dark:hover:border-purple-500/50"
            hoverIconBgColor="group-hover:bg-purple-600 group-hover:text-white"
            hoverTextColor="group-hover:text-purple-600 dark:group-hover:text-purple-400"
            onClick={() => navigate('/fields')}
          />
          <QuickActionCard
            title="Build Application"
            description="Combine objects into a functional user application."
            icon={Wrench}
            iconBgColor="bg-orange-50 dark:bg-orange-900/20"
            iconColor="text-orange-600 dark:text-orange-400"
            hoverBorderColor="hover:border-orange-500/50 dark:hover:border-orange-500/50"
            hoverIconBgColor="group-hover:bg-orange-600 group-hover:text-white"
            hoverTextColor="group-hover:text-orange-600 dark:group-hover:text-orange-400"
            onClick={() => navigate('/applications/create')}
          />
        </div>
      </div>

      {/* Recent Activity Table */}
      <ActivityTable items={activityData} />

      {/* Footer Info */}
      <div className="text-center text-xs text-slate-400 pb-4">
        <p>© 2024 Canvas App Platform. All rights reserved.</p>
      </div>
    </div>
  );
}

export default DashboardPage;
