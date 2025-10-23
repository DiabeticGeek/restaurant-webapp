import { Link } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';

const OwnerLogin = () => {
  return (
    <>
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Owner Sign In
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Or{' '}
          <Link to="/register" className="font-medium text-primary hover:text-primary-dark">
            create a new restaurant account
          </Link>
        </p>
      </div>
      <LoginForm role="owner" />
    </>
  );
};

export default OwnerLogin;
