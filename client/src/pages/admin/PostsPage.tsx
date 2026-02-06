import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../../types/post';
import type { Pagination as PaginationType } from '../../types/api';
import * as postsApi from '../../api/posts';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { SEOHead } from '../../components/seo/SEOHead';
import { format } from 'date-fns';

export function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await postsApi.getAdminPosts(page);
      setPosts(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await postsApi.deletePost(id);
      fetchPosts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  return (
    <>
      <SEOHead title="Manage Posts" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Posts</h1>
          <Link to="/admin/posts/new">
            <Button>New Post</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchPosts} />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Title</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Category</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Date</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{post.title}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {post.category_name || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={post.status === 'published' ? 'success' : 'warning'}>
                          {post.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {format(new Date(post.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/posts/edit/${post.id}`}>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </Link>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(post.id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {pagination && (
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
        )}
      </div>
    </>
  );
}
