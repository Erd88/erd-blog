import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { SEOHead } from '../../components/seo/SEOHead';
import { format } from 'date-fns';

interface AdminComment {
  id: number;
  content: string;
  created_at: string;
  user_name: string;
  user_id: number;
  post_id: number;
  post_title: string;
  post_slug: string;
}

export function CommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<{ data: AdminComment[] }>('/admin/stats');
      // Use recent comments from stats endpoint for admin view
      // For a full comments list we'd need a dedicated endpoint, but this works for now
      const statsData = res.data as unknown as { recentComments: AdminComment[] };
      setComments(statsData.recentComments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  return (
    <>
      <SEOHead title="Manage Comments" />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Comments</h1>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchComments} />
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{comment.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      by <span className="font-medium">{comment.user_name}</span> on{' '}
                      <Link to={`/posts/${comment.post_slug}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                        {comment.post_title}
                      </Link>
                      {' '}&middot; {format(new Date(comment.created_at), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(comment.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No comments yet.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
