import { FiGrid, FiMenu as MenuIcon, FiBarChart2, FiUsers, FiAlertCircle } from 'react-icons/fi';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import StatCard from '../../components/dashboard/StatCard';
import QuickActionCard from '../../components/dashboard/QuickActionCard';

const Dashboard = () => {
  const { data, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to {data?.restaurantName}
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error.message}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mt-4">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<FiGrid className="h-6 w-6 text-white" />}
            title="Active Orders"
            value={data?.activeOrders ?? 0}
            linkTo="/server"
            linkText="View orders"
            color="bg-indigo-500"
          />
          <StatCard
            icon={<MenuIcon className="h-6 w-6 text-white" />}
            title="Menu Items"
            value={data?.menuItemCount ?? 0}
            linkTo="/menu-editor"
            linkText="Manage menu"
            color="bg-green-500"
          />
          <StatCard
            icon={<FiUsers className="h-6 w-6 text-white" />}
            title="Staff Members"
            value={data?.staffCount ?? 0}
            linkTo="/staff"
            linkText="Manage staff"
            color="bg-yellow-500"
          />
          <StatCard
            icon={<FiBarChart2 className="h-6 w-6 text-white" />}
            title="Analytics"
            value="View Reports"
            linkTo="/analytics"
            linkText="View analytics"
            color="bg-red-500"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            title="Edit Floor Layout"
            description="Design your restaurant floor plan with tables and sections"
            linkTo="/floor-layout"
          />
          <QuickActionCard
            title="Update Menu"
            description="Add, edit or remove menu items and categories"
            linkTo="/menu-editor"
          />
          <QuickActionCard
            title="Server View"
            description="Manage tables and orders in real-time"
            linkTo="/server"
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard
