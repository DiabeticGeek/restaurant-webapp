import LoginForm from '../../components/auth/LoginForm';

const KitchenLogin = () => {
  return (
    <>
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Kitchen Sign In
        </h2>
      </div>
      <LoginForm role="kitchen" />
    </>
  );
};

export default KitchenLogin;
