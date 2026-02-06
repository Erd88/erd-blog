import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from '../components/auth/LoginForm';
import { SEOHead } from '../components/seo/SEOHead';
import { Card } from '../components/ui/Card';

export function LoginPage() {
  const { user } = useAuth();

  if (user) return <Navigate to="/" replace />;

  return (
    <>
      <SEOHead title="Login" />
      <div className="max-w-md mx-auto px-4 py-16">
        <Card>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            Sign In
          </h1>
          <LoginForm />
          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:underline dark:text-primary-400">
              Register
            </Link>
          </p>
        </Card>
      </div>
    </>
  );
}
