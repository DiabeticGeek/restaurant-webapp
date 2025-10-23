import { NavLink } from 'react-router-dom'
import { 
  FiHome, 
  FiGrid, 
  FiMenu as MenuIcon, 
  FiBarChart2, 
  FiUsers,
  FiCoffee,
  FiClipboard
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'

const Sidebar = () => {
  const { user } = useAuth()

  const isOwner = user?.role === 'owner'
  const isServer = user?.role === 'server' || isOwner
  const isKitchen = user?.role === 'kitchen' || isOwner
  const isBar = user?.role === 'bar' || isOwner

  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary">
          <h1 className="text-xl font-bold text-white">Restaurant Manager</h1>
        </div>
        
        <div className="flex flex-col flex-grow overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {isOwner && (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-100 text-primary'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <FiHome className="mr-3 h-5 w-5" />
                  Dashboard
                </NavLink>
                
                <NavLink
                  to="/floor-layout"
                  className={({ isActive }) =>
                    `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-100 text-primary'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <FiGrid className="mr-3 h-5 w-5" />
                  Floor Layout
                </NavLink>
                
                <NavLink
                  to="/menu-editor"
                  className={({ isActive }) =>
                    `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-100 text-primary'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <MenuIcon className="mr-3 h-5 w-5" />
                  Menu Editor
                </NavLink>
                
                <NavLink
                  to="/analytics"
                  className={({ isActive }) =>
                    `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-100 text-primary'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <FiBarChart2 className="mr-3 h-5 w-5" />
                  Analytics
                </NavLink>
                
                <NavLink
                  to="/staff"
                  className={({ isActive }) =>
                    `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-100 text-primary'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <FiUsers className="mr-3 h-5 w-5" />
                  Staff Management
                </NavLink>
                
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Operations
                  </h3>
                </div>
              </>
            )}
            
            {isServer && (
              <NavLink
                to="/server"
                className={({ isActive }) =>
                  `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-gray-100 text-primary'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <FiClipboard className="mr-3 h-5 w-5" />
                Server View
              </NavLink>
            )}
            
            {isKitchen && (
              <NavLink
                to="/kitchen"
                className={({ isActive }) =>
                  `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-gray-100 text-primary'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <FiClipboard className="mr-3 h-5 w-5" />
                Kitchen Display
              </NavLink>
            )}
            
            {isBar && (
              <NavLink
                to="/bar"
                className={({ isActive }) =>
                  `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-gray-100 text-primary'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <FiCoffee className="mr-3 h-5 w-5" />
                Bar Display
              </NavLink>
            )}
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
