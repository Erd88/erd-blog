import { useState, useEffect, useCallback } from 'react';
import type { Category } from '../types/category';
import * as categoriesApi from '../api/categories';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await categoriesApi.getCategories();
      setCategories(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { categories, isLoading, error, refetch: fetch };
}

export function useCategory(slug: string) {
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!slug) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const res = await categoriesApi.getCategoryBySlug(slug);
      setCategory(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load category');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetch(); }, [fetch]);

  return { category, isLoading, error, refetch: fetch };
}
