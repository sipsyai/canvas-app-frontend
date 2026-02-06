import { RegisterForm } from '../components/RegisterForm';

export const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full bg-white dark:bg-surface-dark rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Canvas App
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">Create your account</p>
        </div>

        <RegisterForm />

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-slate-400">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
