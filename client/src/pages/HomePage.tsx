import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePosts } from '../hooks/usePosts';
import { useCategories } from '../hooks/useCategories';
import { PostList } from '../components/posts/PostList';
import { Sidebar } from '../components/layout/Sidebar';
import { Pagination } from '../components/ui/Pagination';
import { HomeSEO } from '../components/seo/SEOHead';
import { WebSiteSchema, OrganizationSchema } from '../components/seo/StructuredData';
import { clsx } from 'clsx';

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');
  const category = searchParams.get('category') || undefined;
  const [sort] = useState('newest');

  const { posts, pagination, isLoading, error, refetch } = usePosts({ page, category, sort });
  const { categories } = useCategories();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (slug: string | undefined) => {
    const params = new URLSearchParams();
    if (slug) params.set('category', slug);
    setSearchParams(params);
  };

  return (
    <>
      <HomeSEO />
      <WebSiteSchema />
      <OrganizationSchema />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <main className="flex-1 min-w-0">
            {/* Category Filter */}
            <nav 
              className="flex flex-wrap gap-2 mb-6" 
              aria-label="Category filters"
            >
              <button
                onClick={() => handleCategoryChange(undefined)}
                className={clsx(
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                  !category
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                )}
                aria-current={!category ? 'page' : undefined}
              >
                All Posts
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={clsx(
                    'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                    category === cat.slug
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  )}
                  aria-current={category === cat.slug ? 'page' : undefined}
                >
                  {cat.name}
                </button>
              ))}
            </nav>

            {/* Posts List */}
            <PostList posts={posts} isLoading={isLoading} error={error} onRetry={refetch} />

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </main>

          {/* Sidebar */}
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
