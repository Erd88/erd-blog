import { useState, type FormEvent } from 'react';
import type { Post, CreatePostData } from '../../types/post';
import type { Category } from '../../types/category';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { PostContent } from './PostContent';

interface PostFormProps {
  initialData?: Post;
  categories: Category[];
  onSubmit: (data: CreatePostData) => Promise<void>;
  loading?: boolean;
}

export function PostForm({ initialData, categories, onSubmit, loading }: PostFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.cover_image_url || '');
  const [categoryId, setCategoryId] = useState(String(initialData?.category_id || ''));
  const [status, setStatus] = useState<'draft' | 'published'>(initialData?.status || 'draft');
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await onSubmit({
        title,
        content,
        excerpt: excerpt || undefined,
        cover_image_url: coverImageUrl || undefined,
        category_id: categoryId ? parseInt(categoryId) : null,
        status,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    }
  };

  const categoryOptions = [
    { value: '', label: 'No category' },
    ...categories.map((c) => ({ value: String(c.id), label: c.name })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        placeholder="Post title"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          options={categoryOptions}
        />
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
          ]}
        />
      </div>

      <Input
        label="Cover Image URL"
        value={coverImageUrl}
        onChange={(e) => setCoverImageUrl(e.target.value)}
        placeholder="https://example.com/image.jpg"
      />

      <Input
        label="Excerpt"
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        placeholder="Brief description (auto-generated if empty)"
      />

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Content (Markdown)
          </label>
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            {previewMode ? 'Edit' : 'Preview'}
          </button>
        </div>
        {previewMode ? (
          <div className="min-h-[300px] border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
            <PostContent content={content} />
          </div>
        ) : (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={15}
            placeholder="Write your post content in Markdown..."
            className="font-mono text-sm"
          />
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={loading}>
          {loading ? 'Saving...' : initialData ? 'Update Post' : 'Create Post'}
        </Button>
      </div>
    </form>
  );
}
