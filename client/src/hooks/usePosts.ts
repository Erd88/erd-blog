import { useState, useEffect, useCallback } from 'react';
import type { Post } from '../types/post';
import type { Pagination } from '../types/api';
import * as postsApi from '../api/posts';

export function usePosts(params: {
  page?: number;
  category?: string;
  sort?: string;
  limit?: number;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await postsApi.getPosts({
        page: params.page || 1,
        limit: params.limit || 10,
        category: params.category,
        sort: params.sort,
      });
      setPosts(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  }, [params.page, params.category, params.sort, params.limit]);

  useEffect(() => { fetch(); }, [fetch]);

  return { posts, pagination, isLoading, error, refetch: fetch };
}

export function useSearchPosts(query: string, page = 1) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setPosts([]);
      setPagination(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    postsApi.searchPosts(query, page)
      .then((res) => {
        setPosts(res.data);
        setPagination(res.pagination);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Search failed'))
      .finally(() => setIsLoading(false));
  }, [query, page]);

  return { posts, pagination, isLoading, error };
}
