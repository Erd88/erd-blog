import { useState, useEffect } from 'react';
import type { Post } from '../types/post';
import * as postsApi from '../api/posts';

export function usePost(slug: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    postsApi.getPost(slug)
      .then((res) => setPost(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Post not found'))
      .finally(() => setIsLoading(false));
  }, [slug]);

  return { post, isLoading, error };
}
