import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiGrid, FiLayout, FiBookOpen, FiBarChart2, FiUsers, FiClipboard, FiCoffee, FiLogOut } from 'react-icons/fi';

const Navigation = () => {
  const { user, signOut } = useAuth();

  const ownerLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: <FiGrid /> },
    { path: '/floor-layout', label: 'Floor Layout', icon: <FiLayout /> },
    { path: '/menu-editor', label: 'Menu Editor', icon: <FiBookOpen /> },
    { path: '/analytics', label: 'Analytics', icon: <FiBarChart2 /> },
    { path: '/staff', label: 'Staff', icon: <FiUsers /> },
  ];

  const serverLinks = [
    { path: '/server', label: 'Server View', icon: <FiClipboard /> },
  ];

  const kitchenLinks = [
    { path: '/kitchen', label: 'Kitchen Display', icon: <FiBookOpen /> },
  ];

  const barLinks = [
    { path: '/bar', label: 'Bar Display', icon: <FiCoffee /> },
  ];

  let links: { path: string; label: string; icon: JSX.Element; }[] = [];
  if (user?.role === 'owner') {
    links = ownerLinks;
  } else if (user?.role === 'server') {
    links = serverLinks;
  } else if (user?.role === 'kitchen') {
    links = kitchenLinks;
  } else if (user?.role === 'bar') {
    links = barLinks;
  }

  return (
    <nav className="bg-gray-800 text-white w-64 min-h-screen p-4 flex flex-col">
      <div className="text-2xl font-bold mb-8">Restaurant POS</div>
      <ul className="space-y-2 flex-grow">
        {links.map((link) => (
          <li key={link.path}>
            <NavLink
              to={link.path}
              className={({ isActive }) =>
                `flex items-center p-2 rounded-md transition-colors ${
                  isActive ? 'bg-primary text-white' : 'hover:bg-gray-700'
                }`
              }
            >
              <span className="mr-3">{link.icon}</span>
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div>
        <button onClick={signOut} className="w-full flex items-center p-2 rounded-md hover:bg-red-600 transition-colors">
          <FiLogOut className="mr-3" />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
