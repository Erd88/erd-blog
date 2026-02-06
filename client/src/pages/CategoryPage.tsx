import { useParams, Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { usePosts } from '../hooks/usePosts';
import { useCategory } from '../hooks/useCategories';
import { PostList } from '../components/posts/PostList';
import { Sidebar } from '../components/layout/Sidebar';
import { CategorySEO } from '../components/seo/SEOHead';
import { BreadcrumbSchema, generateBreadcrumbs } from '../components/seo/StructuredData';
import { Pagination } from '../components/ui/Pagination';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorMessage } from '../components/ui/ErrorMessage';


export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');
  
  const { category, isLoading: categoryLoading, error: categoryError } = useCategory(slug!);
  const { posts, pagination, isLoading: postsLoading, error: postsError, refetch } = usePosts({ 
    page, 
    category: slug,
  });

  const isLoading = categoryLoading || postsLoading;
  const error = categoryError || postsError;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (categoryLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-4 w-96 mb-8" />
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (categoryError || !category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorMessage message={categoryError || 'Category not found'} />
        <div className="mt-4">
          <Link 
            to="/" 
            className="inline-flex items-center text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbs = generateBreadcrumbs('category', { category: category.name });

  return (
    <>
      <CategorySEO name={category.name} description={category.description || undefined} />
      <BreadcrumbSchema items={breadcrumbs} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Header */}
        <header className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
          <nav className="mb-4">
            <Link 
              to="/" 
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Home
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-sm text-gray-900 dark:text-gray-100">
              {category.name}
            </span>
          </nav>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
              {category.description}
            </p>
          )}
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">
            {pagination?.total || posts.length} {pagination?.total === 1 ? 'post' : 'posts'} in this category
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <main className="flex-1 min-w-0">
            <PostList 
              posts={posts} 
              isLoading={postsLoading} 
              error={postsError} 
              onRetry={refetch} 
            />

            {pagination && pagination.totalPages > 1 && (
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </main>

          <aside className="lg:w-72 shrink-0">
            <Sidebar
              recentPosts={posts.slice(0, 5).map((p) => ({ slug: p.slug, title: p.title }))}
            />
          </aside>
        </div>
      </div>
    </>
  );
}
