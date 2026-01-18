import { LogoutButton } from '@/features/auth/components/LogoutButton';

function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <LogoutButton />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-gray-600">
              Welcome to Canvas App! You are successfully logged in.
            </p>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                🎉 Authentication is working correctly. You can now build the rest of your application.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
