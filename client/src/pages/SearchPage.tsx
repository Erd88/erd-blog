import { useSearchParams } from 'react-router-dom';
import { useSearchPosts } from '../hooks/usePosts';
import { useDebounce } from '../hooks/useDebounce';
import { PostList } from '../components/posts/PostList';
import { Pagination } from '../components/ui/Pagination';
import { SearchBar } from '../components/ui/SearchBar';
import { SEOHead } from '../components/seo/SEOHead';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const debouncedQuery = useDebounce(query, 300);

  const { posts, pagination, isLoading, error } = useSearchPosts(debouncedQuery, page);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
  };

  return (
    <>
      <SEOHead title={query ? `Search: ${query}` : 'Search'} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Search</h1>
        <SearchBar className="mb-8" defaultValue={query} />

        {query && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {pagination ? `${pagination.total} result${pagination.total !== 1 ? 's' : ''} for "${query}"` : 'Searching...'}
          </p>
        )}

        <PostList posts={posts} isLoading={isLoading} error={error} />

        {pagination && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </>
  );
}
