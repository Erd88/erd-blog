import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { NotFoundSEO } from '../components/seo/SEOHead';
import { BreadcrumbSchema, generateBreadcrumbs } from '../components/seo/StructuredData';

export function NotFoundPage() {
  const breadcrumbs = generateBreadcrumbs('home');

  return (
    <>
      <NotFoundSEO />
      <BreadcrumbSchema items={breadcrumbs} />
      
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-24 px-4 text-center">
        {/* 404 Graphic */}
        <div className="relative mb-8">
          <div className="text-9xl font-black text-gray-100 dark:text-gray-800 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-bold text-primary-600 dark:text-primary-400">
              404
            </span>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md text-lg">
          The page you're looking for doesn't exist or has been moved. 
          Please check the URL or go back to the homepage.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/">
            <Button size="lg">Back to Home</Button>
          </Link>
          <Link to="/search">
            <Button variant="secondary" size="lg">
              Search Posts
            </Button>
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link 
              to="/" 
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Latest Posts
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Link 
              to="/contact" 
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
