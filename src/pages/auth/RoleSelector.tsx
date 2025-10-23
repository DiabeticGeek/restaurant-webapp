import { Link } from 'react-router-dom';
import { FiShield, FiClipboard, FiCoffee, FiUser } from 'react-icons/fi';

const roles = [
  { name: 'Owner', path: '/login/owner', icon: <FiShield className="h-12 w-12 mx-auto" /> },
  { name: 'Server', path: '/login/server', icon: <FiClipboard className="h-12 w-12 mx-auto" /> },
  { name: 'Kitchen', path: '/login/kitchen', icon: <FiCoffee className="h-12 w-12 mx-auto" /> },
  { name: 'Bar', path: '/login/bar', icon: <FiUser className="h-12 w-12 mx-auto" /> },
];

const RoleSelector = () => {
  return (
    <div className="text-center">
      <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
        Select Your Role to Sign In
      </h2>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {roles.map((role) => (
          <Link
            key={role.name}
            to={role.path}
            className="group flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-primary"
          >
            <div className="text-primary group-hover:scale-110 transition-transform">
              {role.icon}
            </div>
            <p className="mt-4 text-xl font-semibold text-gray-900">{role.name}</p>
          </Link>
        ))}
      </div>
      <p className="mt-8 text-sm text-gray-600">
        Are you a restaurant owner?{' '}
        <Link to="/register" className="font-medium text-primary hover:text-primary-dark">
          Create a new restaurant account
        </Link>
      </p>
    </div>
  );
};

export default RoleSelector;
