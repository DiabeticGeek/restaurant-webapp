import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiGrid, FiMenu as MenuIcon, FiBarChart2, FiUsers, FiAlertCircle } from 'react-icons/fi'
import { supabase } from '../../utils/supabaseClient'
import { useAuth } from '../../hooks/useAuth'

const Dashboard = () => {
  const { user } = useAuth()
  const [restaurantName, setRestaurantName] = useState('')
  const [menuItemCount, setMenuItemCount] = useState(0)
  const [staffCount, setStaffCount] = useState(0)
  const [activeOrders, setActiveOrders] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.restaurantId) return

      try {
        setLoading(true)
        
        // Fetch restaurant info
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('name')
          .eq('id', user.restaurantId)
          .single()

        if (restaurantError) throw restaurantError
        setRestaurantName(restaurantData.name)

        // Fetch menu item count
        const { count: itemCount, error: menuError } = await supabase
          .from('menu_items')
          .select('id', { count: 'exact', head: true })
          .eq('restaurant_id', user.restaurantId)

        if (menuError) throw menuError
        setMenuItemCount(itemCount || 0)

        // Fetch staff count
        const { count: userCount, error: staffError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('restaurant_id', user.restaurantId)

        if (staffError) throw staffError
        setStaffCount(userCount || 0)

        // Fetch active orders
        const { count: orderCount, error: orderError } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('restaurant_id', user.restaurantId)
          .eq('status', 'active')

        if (orderError) throw orderError
        setActiveOrders(orderCount || 0)

      } catch (err: any) {
        setError(err.message)
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user?.restaurantId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to {restaurantName}
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mt-4">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Active Orders */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <FiGrid className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Orders</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{activeOrders}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/server" className="font-medium text-primary hover:text-primary-dark">
                  View orders
                </Link>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <MenuIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Menu Items</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{menuItemCount}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/menu-editor" className="font-medium text-primary hover:text-primary-dark">
                  Manage menu
                </Link>
              </div>
            </div>
          </div>

          {/* Staff Members */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <FiUsers className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Staff Members</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{staffCount}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/staff" className="font-medium text-primary hover:text-primary-dark">
                  Manage staff
                </Link>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                  <FiBarChart2 className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Analytics</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">View Reports</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/analytics" className="font-medium text-primary hover:text-primary-dark">
                  View analytics
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/floor-layout"
            className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900">Edit Floor Layout</h3>
            <p className="mt-2 text-sm text-gray-500">
              Design your restaurant floor plan with tables and sections
            </p>
          </Link>

          <Link
            to="/menu-editor"
            className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900">Update Menu</h3>
            <p className="mt-2 text-sm text-gray-500">
              Add, edit or remove menu items and categories
            </p>
          </Link>

          <Link
            to="/server"
            className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900">Server View</h3>
            <p className="mt-2 text-sm text-gray-500">
              Manage tables and orders in real-time
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
