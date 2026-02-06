import { useState, useEffect, useCallback } from 'react';
import type { Comment } from '../types/comment';
import * as commentsApi from '../api/comments';

export function useComments(postId: number) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await commentsApi.getComments(postId);
      setComments(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => { fetch(); }, [fetch]);

  const addComment = useCallback(async (content: string) => {
    const res = await commentsApi.addComment(postId, content);
    setComments((prev) => [...prev, res.data]);
  }, [postId]);

  const removeComment = useCallback(async (id: number) => {
    await commentsApi.deleteComment(id);
    setComments((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { comments, isLoading, error, addComment, removeComment, refetch: fetch };
}
