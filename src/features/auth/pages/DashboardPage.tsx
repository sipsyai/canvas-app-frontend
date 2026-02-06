import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { Link } from 'react-router-dom';
import { AppWindow, Database, FileType } from 'lucide-react';

function DashboardPage() {
  const navigationItems = [
    {
      title: 'Applications',
      description: 'Manage no-code applications',
      icon: AppWindow,
      href: '/applications',
      color: 'from-blue-500 to-purple-600',
    },
    {
      title: 'Objects',
      description: 'Define data structures',
      icon: Database,
      href: '/objects',
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: 'Fields',
      description: 'Create custom fields',
      icon: FileType,
      href: '/fields',
      color: 'from-green-500 to-teal-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-dark-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-surface-dark rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <LogoutButton />
          </div>

          <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
            <p className="text-gray-600 dark:text-slate-400 mb-8">
              Welcome to Canvas App! You are successfully logged in.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="group p-6 bg-white dark:bg-surface-dark border-2 border-gray-200 dark:border-slate-700 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
