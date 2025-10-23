import LoginForm from '../../components/auth/LoginForm';

const BarLogin = () => {
  return (
    <>
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Bar Sign In
        </h2>
      </div>
      <LoginForm role="bar" />
    </>
  );
};

export default BarLogin;
