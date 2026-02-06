import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { RegisterForm } from '../components/auth/RegisterForm';
import { SEOHead } from '../components/seo/SEOHead';
import { Card } from '../components/ui/Card';

export function RegisterPage() {
  const { user } = useAuth();

  if (user) return <Navigate to="/" replace />;

  return (
    <>
      <SEOHead title="Register" />
      <div className="max-w-md mx-auto px-4 py-16">
        <Card>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            Create Account
          </h1>
          <RegisterForm />
          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:underline dark:text-primary-400">
              Sign In
            </Link>
          </p>
        </Card>
      </div>
    </>
  );
}
