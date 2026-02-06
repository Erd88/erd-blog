import type { Post } from '../../types/post';
import { PostCard } from './PostCard';
import { PostCardSkeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { ErrorMessage } from '../ui/ErrorMessage';

interface PostListProps {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export function PostList({ posts, isLoading, error, onRetry }: PostListProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => <PostCardSkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />;
  }

  if (!posts.length) {
    return <EmptyState title="No posts found" description="There are no posts to display yet." />;
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
