import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Post } from '../../types/post';
import type { CreatePostData } from '../../types/post';
import { useCategories } from '../../hooks/useCategories';
import { PostForm } from '../../components/posts/PostForm';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { SEOHead } from '../../components/seo/SEOHead';
import * as postsApi from '../../api/posts';

export function PostEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    postsApi.getAdminPost(parseInt(id))
      .then((res) => setPost(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load post'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (data: CreatePostData) => {
    setSaving(true);
    try {
      if (id) {
        await postsApi.updatePost(parseInt(id), data);
      } else {
        await postsApi.createPost(data);
      }
      navigate('/admin/posts');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <>
      <SEOHead title={id ? 'Edit Post' : 'New Post'} />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {id ? 'Edit Post' : 'New Post'}
        </h1>
        <PostForm
          initialData={post || undefined}
          categories={categories}
          onSubmit={handleSubmit}
          loading={saving}
        />
      </div>
    </>
  );
}
