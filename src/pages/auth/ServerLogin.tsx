import LoginForm from '../../components/auth/LoginForm';

const ServerLogin = () => {
  return (
    <>
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Server Sign In
        </h2>
      </div>
      <LoginForm role="server" />
    </>
  );
};

export default ServerLogin;
