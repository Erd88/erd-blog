import { useState, useEffect, useCallback } from 'react';
import type { User } from '../types/user';
import type { Pagination } from '../types/api';
import * as usersApi from '../api/users';

export function useUsers(page = 1) {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await usersApi.getUsers(page);
      setUsers(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  return { users, pagination, isLoading, error, refetch: fetch };
}
